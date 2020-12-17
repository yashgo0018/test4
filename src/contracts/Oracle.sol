pragma solidity 0.7.4;

import "./Token.sol";
import "./Betting.sol";

/**
SPDX-License-Identifier: MIT
*/

contract Oracle {

    constructor(address payable footk, address _token) {
        footballK = Betting(footk);
        token = Token(_token);
        timer = 2e9;

        // address payable x = address(uint160(address(this)));
        // footballK.addAdmin(x);
    }

    // keeps track of current vote champion among new data proposals
    uint8 public champion;
    // This keeps track of how many proposals exist
    uint8 public voteNum;
    // nonce for submissions, needed for tracking whether someone already voted on a data proposal
    // incremented at each processing
    uint16 public transNumber;
    /** teams are represented by 32 numbers, from 0 to 31. The number in slot "n" identifies its opponent that week
     The front end handles this mapping, but if you bet directly
    team 0 is Arizona Cardinals, 1 Atlanta Falcons, etc.
    teamList = ["Ariz", "Atl", "Bal", "Buf", "Car", "Chi", "Cin", "Cle", "Dal", "Den", "Det", "GB",
      "Hou", "Ind", "Jac", "Kan", "LV", "LAC", "LAR", "Mia", "Min", "NE", "NO", "NYG", "NYJ",
      "Phi", "Pitt", "SF", "Sea", "TB", "Ten", "Wash"];
    fullname teamListFull = ["Arizona Cardinals", "Atlanta Falcons", "Baltimore Ravens", "Buffalo Bills", "Carolina Panthers",
    "Chicago Bears", "Cincinnati Bengals", "Cleveland Browns", "Dallas Cowboys", "Denver Broncos", "Detroit Lions",
    "Green Bay Packers", "Houston Texans", "Indianapolis Colts", "Jacksonville Jaguars", "Kansas City Chiefs",
    "Las Vegas Raiders", "Los Angeles Chargers", "Los Angeles Rams", "Miami Dolphins", "Minnesota Vikings",
    "New England Patriots", "New Orleans Saints", "New York Giants", "New York Jets", "Philadelphia Eagles",
    "Pittsburgh Steelers", "San Francisco 49ers", "Seattle Seahawks", "Tampa Bay Buccaneers", "Tennessee Titans",
    "Washington FootballTeam"];
    */
    uint8[32][] public propSchedule;
     // result are coded where 0 is a loss, 1 for a tie/cancellation or postponement, 2 for a win.
    uint8[32][] public propResults;
    // propStartTime in UTC is used to stop active betting. If a game is postponed, it can be updated.
    // No bets are taken after this time.
    uint[32][] public propStartTime;
    // odds are entered as decimal odds, such that 1.909 is 909, and 2.543 is 1543.
    // betAmount*(propOdds/1000+1) is the gross payoff for a winning bet,
    // betAmount*propOdds/1000 is the next payoff for a winning bet
    uint[32][] public propOdds;

    // this is the point att which LPs can no longer withdraw or deposit
    uint[] public earliestStart;
    // timer is used so that each proposal has at least a 3 hours for voters to respond
    uint public timer;
    // tracks the current local token balance of oracle managers
    uint public localSupply;
    // for 'minimum bet size' and 'concentration limit'
    uint[2][] public propMiscParams;
    // keeps track of those who supplied data proposals. The provider of the winning proposal gets all
    // the tokens of those who proposed and lost.
    // links a slot amount data proposals to the number of votes it has received
    uint[3] public voteTally;
    address[] public dataProposers;
    Token public token;
    Betting public footballK;
    // these are tokens held in the custody of this contract. Only tokens deposited in this contract can
    // be used for voting, or for claiming ether at the end of the season.
    mapping(address => uint) public tokenBalances;
    // this variable allows the token contract to lock tokens in the oracle contract if a token holder has voted
    // on a proposal in the token contract. This allows token holders to vote on token contract proposals without
    // withdrawingfrom the oracle contract, so games related to tokens frozen in oracle votes are not problematic
    mapping(address => uint) public tokenVoteTime;
    // keeps track of nonce for an administrator on this contract, so that token holders can only vote once
    // with token tokenBalancesdeposited on this contract
    mapping(address => uint32) public voteTracker;

    event Proposal(string process, uint timestamp, uint currChamp, address proposer, uint votmaximum);

    function vote(uint8 choice) external {
        // voter must have votes to allocate
        require(tokenBalances[msg.sender] > 0);
        // can only vote if there are multiple proposals
        require(voteNum == 2);
        // voter must not have voted
        require(voteTracker[msg.sender] != transNumber);
       // this prevents this account from voting again on this data proposal
        voteTracker[msg.sender] = transNumber;
         // votes are simply one's entire balance
        voteTally[choice] += tokenBalances[msg.sender];
        // if the vote pushes the voter's selection above the existing champion, it is the new champion
        // champion is the current vote leader
        if (voteTally[choice] > voteTally[champion]) {
            champion = choice;
        }
    }

    function voteToken(bool isYes) external {
        // voter must have votes
        require(tokenBalances[msg.sender] > 0);
        // voter must not have voted
        require(tokenVoteTime[msg.sender] < block.timestamp);
        // voting cannot occur until the proposal period has ended
        token.voteFromOracle(tokenBalances[msg.sender], isYes);
        // change to 7 days
        tokenVoteTime[msg.sender] = block.timestamp + 3 minutes;
    }

    function eoyEthTrans() external {
        // 7 days after SuperBowl
// require(block.timestamp > 1613325715);
        // this allows token withdraws to get their pro-rata eth share when they withdraw tokens
        transNumber = 9999;
        footballK.withdrawOracle();
        token.revokeWhiteList();
    }
/*
    receive() external payable { }*/

    function eoyTokenSell() external {
        // one can withdraw their tokens at any time, but only if the final eth transfer has occurred will
        // withdrawals also include their pro-rata share of eth
        require(transNumber == 9999, "cannot cashout till eoy"); // no schedule posted, post settle
        require(tokenBalances[msg.sender] > 0);
        uint sharesToSell = tokenBalances[msg.sender];
        tokenBalances[msg.sender] = 0;
        token.transfer(msg.sender, sharesToSell);
        // at the end of the year token depositors get eth back with their tokens
        uint ethTrans = sharesToSell * address(this).balance / localSupply;
        msg.sender.transfer(ethTrans);
        localSupply -= sharesToSell;
    }

    function initPost(
        uint8[32] memory teamsched,
        uint[32] memory starts,
        uint[32] memory decimalOdds,
        uint earlyStart)
    external
    {
        // this makes sure a post occurs only if there is not a current post under consideration, or
        // it is an amend for an earlier post with these data
        require(voteNum == 0||propSchedule.length > 0);
        for (uint i = 0; i < 32; i++) {
        // this condition prevents odds that are inconsistent with rational odds
        // This equation is equal for odds with a zero vig
        // if the condition is true, this implies an arbitrage opportunity for bettors
            if (decimalOdds[teamsched[i]] > 1e6 / decimalOdds[i]) revert("inconsistent results");
        }
        post();
        propSchedule.push(teamsched);
        propStartTime.push(starts);
        propOdds.push(decimalOdds);
        earliestStart.push(earlyStart);
        emit Proposal("initial", block.timestamp, champion, msg.sender, voteNum);
    }

    function oddsPost(uint[32] memory adjDecimalOdds) external {
            // this makes sure the odds are not posted while an initPost is active, which would create
            // a conflict
        require(voteNum == 0 || (propOdds.length > 0 && propStartTime.length == 0));
        post();
        propOdds.push(adjDecimalOdds);
        emit Proposal("odds", block.timestamp, champion, msg.sender, voteNum);
    }

    function settlePost(uint8[32] memory resultVector) external {
        require(voteNum == 0 || propResults.length > 0);
        post();
        propResults.push(resultVector);
        emit Proposal("results", block.timestamp, champion, msg.sender, voteNum);
    }

    function paramPost(uint[2] memory minbetMaxParam) external {
        require(voteNum == 0 || propMiscParams.length > 0);
        post();
        propMiscParams.push(minbetMaxParam);
        emit Proposal("params", block.timestamp, champion, msg.sender, voteNum);

    }

    function initProcess() external {
        require(propSchedule.length > 0, "no length");
        require(block.timestamp > timer);
        // only sent if 'null' vote does not win
        if (champion < 2) {
            // successful submitter gets their tokens back
            tokenBalances[dataProposers[champion]] += 1e4 ether;
            // sends to the betting contract
            footballK.transmitInit(propSchedule[champion], propStartTime[champion], propOdds[champion], earliestStart[champion]);
            emit Proposal("initSent", block.timestamp, champion, dataProposers[champion], voteTally[champion]);
            // internal method with common processing, resets data
        }
        // resets various data (eg, champion, timer)
        reset();
        // resets data arrays for next submission
        delete propSchedule;
        delete propOdds;
        delete propStartTime;
        delete earliestStart;
    }

// these have the same logic as for the initProcess, just for the different datasets
    function oddsProcess() external {
        // this prevents an 'initProcess' set being sent as an odds transmit
        require(propOdds.length > 0 && propStartTime.length == 0);
        require(block.timestamp > timer);
        if (champion < 2) {
            tokenBalances[dataProposers[champion]] += 1e4 ether;
            footballK.transmitDecOdds(propOdds[champion]);
            emit Proposal("oddsSent", block.timestamp, champion, dataProposers[champion], voteTally[champion]);
        }
        // resets various data (eg, champion, timer)
        reset();
        delete propOdds;
    }

    function settleProcess() external {
        require(propResults.length > 0);
        require(block.timestamp > timer);
        if (champion < 2) {
            tokenBalances[dataProposers[champion]] += 1e4 ether;
            footballK.settle(propResults[champion]);
            emit Proposal("settleDataSent", block.timestamp, champion, dataProposers[champion], voteTally[champion]);
        }
        // resets various data (eg, champion, timer)
        reset();
        delete propResults;
    }

    function paramProcess() external {
        require(propMiscParams.length > 0);
        require(block.timestamp > timer);
        if (champion < 2) {
            tokenBalances[dataProposers[champion]] += 1e4 ether;
            emit Proposal("paramSent", block.timestamp, champion, dataProposers[champion], voteTally[champion]);
            footballK.adjustParams(propMiscParams[champion][0], propMiscParams[champion][1]);
        }
        // resets various data (eg, champion, timer)
        reset();
        delete propMiscParams;
    }

    function withdrawTokens(uint amt) external {
        require(amt <= localSupply && amt <= tokenBalances[msg.sender], "Not enough tokens");
        // this prevents voting more than once with token balance. Once data are sent length is zero
        // allowing token holders to withdraw
        require(dataProposers.length == 0, "no wd during vote");
        // prevents multiple votes on token contract proposals
        require(tokenVoteTime[msg.sender] < block.timestamp);
        tokenBalances[msg.sender] -= amt;
        localSupply -= amt;
        token.transfer(msg.sender, amt);
    }

    function depositTokens(uint amt) external {
    // cannot add tokens after contract receives ether balance from NFL contract
    // this prevents multiple withdrawals from the same person using different accounts
        require(transNumber != 9999);
        localSupply += amt;
        tokenBalances[msg.sender] += amt;
        token.transferFrom(msg.sender, address(this), amt);
    }

    // these allow for an easy way to grab an array in web3.js
    function showSched(uint proposal) external view returns(uint8[32] memory teamSched) {
        teamSched = propSchedule[proposal];
    }

    function showpropStartTimes(uint proposal) external view returns(uint[32] memory teamStart) {
        teamStart = propStartTime[proposal];
    }

    function showResults(uint proposal) external view returns(uint8[32] memory resultVector) {
        resultVector = propResults[proposal];
    }

    function showOdds(uint proposal)  external view returns(uint[32] memory adjOdds) {
        adjOdds = propOdds[proposal];
    }

    function showVotes() external view
        returns (
        uint numberProposals,
        uint proposalEndTime,
        uint8 currChampion
        )
    {
        numberProposals = dataProposers.length;
        proposalEndTime = timer;
        currChampion = champion;
    }

    function post() internal {
        // change hourOfDay to 10
        // constraining the hourOfDay to be >10 gives users a block of time where they can be confident that their
        // inattention to the contract poses no risk of a malicious data submission. An exception to this is if
        // someone submits a proposal right before the hourOfDay deadline,
//require(hourOfDay() > 1 || dataProposers.length > 0);
        // small holders with littleownership may troll the contract with useless data just to screw things updated
        // requiring an exponential increase in tokens caps the number of submissions
        require(tokenBalances[msg.sender] > 1e4 ether && voteNum < 2);
        require(block.timestamp < timer);
        // given the above restriction, this gives token holders at least 3 hours after first post to add proposed results
        // this also gives voters at least 3 hours after last proposed post
        // to vote on the set of proposed submissions
        timer = block.timestamp + 3 minutes;
        voteTally[voteNum] = tokenBalances[msg.sender];
        if (voteNum == 1) {
            if (voteTally[1] >= voteTally[0]) champion = 1;
            require(dataProposers[0] != msg.sender);
        }
        // this prevents proposer from voting again with his tokens on this submission
        voteTracker[msg.sender] = transNumber;
        voteNum++;
        tokenBalances[msg.sender] -= 1e4 ether;
        dataProposers.push(msg.sender);
    }

    function reset() internal {
        // if the collective has sufficient time, or the majority has a preference registered, one can submit asap
        delete dataProposers;
        delete voteTally;
        champion = 0;
        voteNum = 0;
        transNumber++;
        timer = 2e9;
    }

    // this is used so users do not have to delegate someone else to monitor the contract 24/7
    // 86400 is seconds in a day, and 3600 is seconds in an hour
    function hourOfDay() internal view returns(uint hour1) {
        hour1 = (block.timestamp % 86400) / 3600;
    }

}
