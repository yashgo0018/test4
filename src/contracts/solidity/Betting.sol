pragma solidity 0.7.5;
pragma experimental ABIEncoderV2;

//import "./Token.sol";
//import "./Oracle.sol";

/**
SPDX-License-Identifier: MIT
Copyright © 2020 Eric G. Falkenstein

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without restriction,
including without limitation the rights to use, copy, modify, merge,
publish, distribute, sublicense, andor sell copies of the Software,
and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
OR OTHER DEALINGS IN THE SOFTWARE.
*/

contract Betting {

   // constructor(address payable tBAddress) {
    constructor() {
        minBet = 1e15;
        concentrationLimit = 5;
        betEpoch = 8;
      //  token = Token(tBAddress);
      //  oracleAdmin = payable(address(new Oracle(payable(address(this)), tBAddress)));
    }

    // after each settlement, a new epoch commences. Bets cannot consummate on games referring to prior epochs
    uint8 public betEpoch;
    // this counter is used to make bet IDs unique
    uint32 public nonce;
    // Schedule is a string where Sport:homeTeam:awayTeam
    // eg, "NFL:Minnesota:Chicago"
    string[32] public teamSchedule;
     // odds are entered as decimal odds, such that 1.909 is 909, and 2.543 is 1543.   (decOdds/1000+1) is the total payoff for a winning bet,
     // consisting of a profit of decOdds/1000 and a return of the bet 1.
     // the mapping of teams to slots is alphabetical by city, and does not change. The front end handles this mapping, but if you bet directly
    uint[32] public decOdds;
     // startTime in UTC is used to stop active betting. If a game is postponed, it may be updated. No bets are taken after this time.
    uint[32] public startTime;
    // this is the amount bet on each team to win, and so via the schedule. A 'short' would be on the opponent to win.
    uint[32][2] public betLong;
    // this is the amount payable to bettors by the contract should their pick win. It is used to determine how much to set
    // aside for future redemptions at settle.
    uint[32][2] public betPayout;
    // the tokens sent to the contract initially are for distribution to liquidity providers at the end of the season.
    // Linking to the token contract allows this contract to distribute those shares. No shares are deposited in this contract.
    // tokens claimed go straight to the liquidity provider (LP) account.
//Token public token;
    // 0 LP unused capital, 1 LP used Capital, 2 bettor capital, 3 eth reserved for redepmption by bettors
    // margins 1 and 2 are zeroed out each settlement, and adjusted when betting commences
    uint[4] public margin;
    // this is the only ethereum account that can adjust parameters, set odds, schedule, etc. There is no other party with access to
    // methods that affect payouts
    address payable public oracleAdmin;
    // totalShares is used to monitor an LP's share of LP eth in the contract. These are not tokens, they are just used for internal
    // accounting of the LP's percent ownership of the vig implied by the odds.
    uint public totalShares;
    // this is a parameter for a minimum bet, which can be adjusted by the oracle/admin.
    uint public minBet;
    //
    uint public earliestStart;
    // this is a parameter for a maximum bet exposure. If LP capital is X, X/concentrationLimit is the largest absolute net
    // exposure for any game. At that point, only bets decreasing the LP exposure are permitted. This prevents a situation where
    // one game uses up all the LP capital for a epoch. It should be adjusted during the playoff, as the number of games will
    // obviously decrease
    uint public concentrationLimit;
    // this keeps record of the eth apportioned to the Oracle/Admin, and accrues until the Feb 14 2021, at which time the Admin can withdraw
    // the eth
    uint public oracleBalance;
    // this holds each bettor's bet parameters, and is a struct below
    mapping(bytes32 => Subcontract) public subcontracts;
    // this holds a big bet's bet parameters, and is a struct below
    mapping(bytes32 => Offercontract) public offercontracts;
    // this maps the hash of (team number, epoch) to that team/epoch's outcome, where 0 is a loss, 1 is a tie or postponement, 2 a win
    // The outcome defaults to 0, so that initially, when contract epoch = current epoch, all games are 0, When the contract epoch< current epoch,
    // 0 represents a loss
    mapping(bytes32 => uint8) public pickEpochResult;
    // This keeps track of an LP's ownership in the LP ether capital, and also its date of investment to encourage vesting for
    // claiming tokens
    mapping(address => LPStruct) public lpStruct;

    struct Subcontract {
        uint8 pick;
        uint8 matchNum;
        uint8 epoch;
        address bettor;
        uint betAmount;
        // the payoff is betAmount * odds/1000, a winning bet gets back its betAmount + payoff
        uint payoff;
    }

    struct Offercontract {
        uint8 pick;
        uint8 matchNum;
        uint8 epoch;
        address bettor;
        uint betAmount;
        // the payoff here is for the one placing the offer, so if Odds are 909, its payoff is betAmount * 909/1000
        // given the way the opposite side's odds are calculated, this payoff then is equivalent to the bet amount
        // for the opponent, and we can be certain no LP capital is needed to collateralize the bet. This allows whales to
        // place bets that are too large for the current LPs.
        uint payoff;
        // the offerPayoff for a large bet is determined by the odds on the bettor's team.
        uint oddsOffered;
    }

    struct LPStruct {
        uint shares;
        uint8 epoch;
    }

    event ResultsPosted(
        uint8[32] winner,
        uint8 epoch,
        uint timestamp
    );

    event DecOddsPosted(
        uint[32] decOdds,
        uint8 epoch,
        uint timestamp
    );

    event SchedulePosted1(
        string m0,
        string m1,
        string m2,
        string m3,
        string m4,
        string m5,
        string m6,
        string m7,
        uint8 epoch,
        uint timestamp
    );

    event SchedulePosted2(
        string m8,
        string m9,
        string m10,
        string m11,
        string m12,
        string m13,
        string m14,
        string m15,
        uint8 epoch,
        uint timestamp
    );

    event SchedulePosted3(
        string m16,
        string m17,
        string m18,
        string m19,
        string m20,
        string m21,
        string m22,
        string m23,
        uint8 epoch,
        uint timestamp
    );

    event SchedulePosted4(
        string m24,
        string m25,
        string m26,
        string m27,
        string m28,
        string m29,
        string m30,
        string m31,
        uint8 epoch,
        uint timestamp
    );

    event StartTimesPosted(
        uint[32] starttimes,
        uint8 epoch,
        uint timestamp
    );

    event BetRecord(
        bytes32 indexed contractHash,
        address indexed bettor,
        uint8 epoch,
        uint8 pick,
        uint8 matchnum,
        uint timestamp,
        uint betsize,
        uint payoff
    );

    event BetBigRecord(
        bytes32 indexed contractHash,
        address indexed bettor,
        uint8 epoch,
        uint8 pick,
        uint8 matchnum,
        uint timestamp,
        uint betsize,
        uint payoff,
        uint oddsOffered
    );

    modifier onlyAdmin() {
        require(oracleAdmin == msg.sender);
        _;
    }

    function fundBook() external payable {
        // not when games are played because that game results affect the value of 'house' shares
        // not reflected in the house eth value, so when games start, no LP activity is _allowed
        // at settlement 'earliestStart' is set to 2e9, which is well into the future
//require(block.timestamp < earliestStart, "not between game start and settle");
        uint netinvestment = msg.value;
        uint _shares = 0;
        if (margin[0] > 0) {
            // investors receive shares marked at fair value, the current shares/eth ratio for all
            // LP's eth in the book is the sum of pledged, margin[1], and unpledged, margin[0], eth
            _shares = mul(netinvestment, totalShares) / (margin[0] + margin[1]);
        } else {
            _shares = netinvestment;
        }
        margin[0] += msg.value;
        lpStruct[msg.sender].epoch = betEpoch;
        totalShares += _shares;
        lpStruct[msg.sender].shares += _shares;
    }
/*
    receive() external payable {
    }*/

    function sellShares(uint sharesToSell) external {
        // same reason as given above in fundBook
  //require(block.timestamp < earliestStart, "not between game start and settle");
        require(lpStruct[msg.sender].shares >= sharesToSell, "user does not have this many shares");
        // investors can only cashout after investing for at least 2 epochs, or the end of the season betEpoch=21
        require(betEpoch - lpStruct[msg.sender].epoch > 0);
        // margin[0] + margin[1] is the total eth amount of the LPs
        uint ethTrans = mul(sharesToSell, (margin[0] + margin[1])) / totalShares;
        // one can withdraw at any time during the epoch, but only if the LP eth balances that are
        // unpledged, or free, and not acting as collateral
        require(ethTrans <= margin[0], "can only withdraw unpledged capital");
        totalShares -= sharesToSell;
        lpStruct[msg.sender].shares -= sharesToSell;
        margin[0] -= ethTrans;
        msg.sender.transfer(ethTrans);
    }
/*
    function claimTokens() external {
        // This is a bonus for initial LPs
        // can start claiming the 1 million tokens in this contract, with 400 tokens per eth deposited
        // only those who have been LPs for 3 epochs are allowed to claim tokens
        // LPs can claim this bonus more than once if no other LPs arise
        require(betEpoch - lpStruct[msg.sender].epoch > 0);
        uint contractTokens = token.balanceOf(address(this));
        uint tokenTrans = 400 * lpStruct[msg.sender].shares;
        if (tokenTrans > contractTokens) {
            tokenTrans = contractTokens;
        }
        // the LP is reset at the current epoch, so no need to withdraw and
        // deposit to get in line for the next distribution
        lpStruct[msg.sender].epoch = betEpoch;
        token.transfer(msg.sender, tokenTrans);
    }*/

    function adjustParams(uint _minbet, uint _maxPos)
    external
    //onlyAdmin
    {
        minBet = _minbet * 1e15;
        concentrationLimit = _maxPos;
    }

 /*   function withdrawOracle() external onlyAdmin {
        // 1613400123 is  Monday Feb 15 2:42 PM GMT 2021
        // this is the method for sending eth back to the oracle for distribution
        // to token holders. The SuperBowl is scheduled for Feb 7 2021
        require(block.timestamp > 161340012 && margin[2] == 0,
            "AdminOracle can only withdraw after season and after settlement");
        uint amt = oracleBalance;
        oracleBalance = 0;
        oracleAdmin.transfer(amt);
        // outstanding in the token contract. Any LP should have claimed their tokens by now
        token.revokeWhiteList();
    }
*/
    function bet(uint8 matchNumber, uint8 pickLong) external payable {
        require(msg.value >= minBet, "bet below minimum");
        require(startTime[matchNumber] > block.timestamp, "game started or team not playing");
        // current LP exposure if 'team' wins, which is the net of the LP obligation to the winner minus
        // the amount bet on the opponent that will be available to the LPs
        // note for arrays, the arguments are [team][match], where team is either 0 or 1, and matches run from 0 to 15
        int netPosTeam0 = int(betPayout[pickLong][matchNumber]) - int(betLong[1 - pickLong][matchNumber]);
        // current liability of LP if 'team' loses
        int netPosOpponent0 = int(betPayout[1 - pickLong][matchNumber]) - int(betLong[pickLong][matchNumber]);
        // this is the liability from taking this bet, how much the LP's lose if this bet wins
        uint _payoff = msg.value * odds(matchNumber, pickLong) / 1000;
        // this function measures the change in the net liability from this bet, which is a function of how
        // much it changes the liability for this team and its opponent
        int marginChange = maxZero(int(_payoff) + netPosTeam0, -int(msg.value) + netPosOpponent0) -
            maxZero(netPosTeam0, netPosOpponent0);
        // this checks to see that exposure on this one game is not too large
        // relative to the amount of LP eth in the contract
        require(int(_payoff) + netPosTeam0 < int((margin[0] + margin[1]) / concentrationLimit),
            "betsize over LP concentration limit");
        // this requires the LP has enough unpledged capital to cover the new bet
        require(marginChange <= int(margin[0]), "betsize over LP unpledged capital");
        // an incrementing nonce and timestamp make a unique bet hash ID
        bytes32 subkID = keccak256(abi.encodePacked(nonce, block.timestamp));
        Subcontract memory order;
        order.bettor = msg.sender;
        order.betAmount = msg.value;
        order.payoff = _payoff;
        order.pick = pickLong;
        order.matchNum = matchNumber;
        order.epoch = betEpoch;
        subcontracts[subkID] = order;
        // the bettor's eth is put into the bettor capital pot. This will be added to the LP's capital pot for
        // extracting payout amounts
        margin[2] += msg.value;
        // if the bet decreases net LP exposure to that game, eth moves from the LP's pledged capital, margin[1]
        // to the unpledged capital, margin[0]
        if (marginChange < 0) {
            margin[1] = sub(margin[1], uint(-marginChange));
            margin[0] += uint(-marginChange);
            // if the bet increases net LP exposure to that game, eth moves from unpledged capital
            // to the LP pledged capital from the unpledged capital
        } else {
            margin[1] += uint(marginChange);
            margin[0] = sub(margin[0], uint(marginChange));
        }
        // bet adds to the amount bet on team
        betLong[pickLong][matchNumber] += msg.value;
        // the payoff, or profit, paid by the LPs to the bettor if his team wins.
        // it is not paid in the case of a tie
        betPayout[pickLong][matchNumber] += _payoff;
        // increment nonce for subkID uniqueness
        nonce++;
        emit BetRecord(
            subkID,
            msg.sender,
            betEpoch,
            pickLong,
            matchNumber,
            block.timestamp,
            msg.value,
            _payoff
    );
    }

    // this method warehouses bets too large for the current book. They can be placed in hopes of finding another whale
    // they can be cancelled and funds fully refunded at any time if not taken
    // if the epoch passes, the bet will not be able to consummate, so the bettor should redeem it, though this is possible at
    // any time (there is no mechanism that pulls unclaimed eth at a later time)
    function betBig(uint8 _matchNum, uint8 _pickLong) external payable {
        require(startTime[_matchNum] > block.timestamp, "game started or team not playing");
        bytes32 subkID = keccak256(abi.encodePacked(nonce, block.timestamp));
        Offercontract memory order;
        order.bettor = msg.sender;
        order.betAmount = msg.value;
        order.matchNum = _matchNum;
        order.payoff = msg.value * odds(_matchNum, _pickLong) / 1000;
        order.pick = _pickLong;
        order.oddsOffered = odds(_matchNum, 1 - _pickLong);
        order.epoch = betEpoch;
        offercontracts[subkID] = order;
        nonce++;
        emit BetBigRecord(subkID,
            msg.sender,
            betEpoch,
            _pickLong,
            order.matchNum,
            block.timestamp,
            order.betAmount,
            order.payoff,
            order.oddsOffered
        );
    }

    function takeBig(bytes32 subkid) external payable {
        Offercontract storage k = offercontracts[subkid];
        //require(startTime[k.teamLong] > block.timestamp, "game started or bet taken");
        require(msg.value >= k.payoff && k.epoch == betEpoch, "insufficient eth for betsize or bet for prior epoch");
        // first we create the new bet of the initial bigbet proposer based on their original parameters
        Subcontract memory order;
        order.bettor = k.bettor;
        order.betAmount = k.betAmount;
        order.matchNum = k.matchNum;
        order.payoff = k.payoff;
        order.pick = k.pick;
        order.epoch = betEpoch;
        subcontracts[subkid] = order;
        emit BetRecord(
            subkid,
            order.bettor,
            betEpoch,
            order.pick,
            order.matchNum,
            block.timestamp,
            order.betAmount,
            order.payoff
        );
        // next we create the new bet, wher the taker is long the original bettor's opponent
        bytes32 subkID2 = keccak256(abi.encodePacked(nonce, block.timestamp));
        Subcontract memory order2;
        order2.bettor = msg.sender;
        // note the bet amount for the taker is identical to the payoff of the initial bet
        order2.betAmount = k.payoff;
        order2.payoff = k.payoff * k.oddsOffered / 1000;
        order2.matchNum = order.matchNum;
        order2.pick = 1 - k.pick;
        order2.epoch = betEpoch;
        // in these bets only bettor money is liable upon game outcome, so each side covers the liability to the other
        margin[2] += (k.betAmount + order2.betAmount);
        // this is the new gross liability to original bettor team if it wins
        betLong[order.pick][order.matchNum] += order.betAmount;
        betPayout[order.pick][order.matchNum] += order.payoff;
        // this is the new gross liability to this taker's team wins
        betLong[order2.pick][order2.matchNum] += order2.betAmount;
        betPayout[order2.pick][order2.matchNum] += order2.payoff;
        emit BetRecord(
            subkID2,
            msg.sender,
            betEpoch,
            order2.pick,
            order2.matchNum,
            block.timestamp,
            order2.betAmount,
            order2.payoff
        );
        // refunds non-trivial overpayments of bet in case someone inadvertantly overpays
        if (msg.value - order2.betAmount > 1e16) {
            msg.sender.transfer(msg.value - order2.betAmount);
        }
        subcontracts[subkID2] = order2;
        nonce++;
        // deletes the old offer so it cannot be taken again
        delete offercontracts[subkid];
    }

    function killBig(bytes32 subkid2) external {
        Offercontract storage k = offercontracts[subkid2];
        // only the bettor can cancel his bet. Only a bet not yet taken can be cancelled
        // because when taken the struct offercontracts is deleted
        require(k.bettor == msg.sender, "not yours to cancel");
        uint refund = k.betAmount;
        delete offercontracts[subkid2];
        msg.sender.transfer(refund);
    }

    function settle(uint8[32] memory winner)
    external
    //onlyAdmin
    {
      // LP pledged capital, margin[1], and bettor funds, margin[2], are combined into a pot.
      // Whatever is not distributed to the bettors is then transferred to the LPs.
// require(block.timestamp > (earliestStart + 12 hours));
        uint housePot = margin[1] + margin[2];
        // this is the amount of eth allocated to winners, and also if there is a tie,
        // the amount the bettor can reclaim
        // eth used for bet collateral is set to zero at settlement for the next epoch
        uint redemptionPot = 0;
        // resets the margin accounts 'pledged LP capital' and bettor capital for the next epoch
        margin[1] = 0;
        margin[2] = 0;
        uint8 matchSlot;
        for (matchSlot = 0; matchSlot < 32; matchSlot++) {
        // this unique hash is used for redemption. Subcontracts have this hash,
        // so combined with the bettor's ethereum address,
        // tells the contract that it should give money to the bettor
        uint8 winningTeam = winner[matchSlot];
        require(winningTeam < 3);
            if (winningTeam == 2) {
                // the away bettor wins in this case, so it takes the gross exposure of the contract,
                // the original bet amount plus the profit,
                // and takes it out of the housePot and moves it to the Redemption amount and the oracle payout
                redemptionPot += betPayout[1][matchSlot] + betLong[1][matchSlot];
                // this unique game&epoch&team hash now maps to a win, 2, allowing bettors to claim their winnings
                // via the redeem method
                bytes32 hashMatchEpochAway = keccak256(abi.encodePacked(matchSlot, betEpoch, winningTeam - 1));
                // winner has result as "2"
                pickEpochResult[hashMatchEpochAway] = 2;
                // for ties or no-contest, bettors are refunded their bet amounts
                // teams that did not play are also given a 1, though there should be
                // zero bets in these accounts
            } else if (winningTeam == 1) {
                // the home bettor wins in this case
                redemptionPot += betPayout[0][matchSlot] + betLong[0][matchSlot];
                // this unique game&epoch&team hash now maps to a win, 2, allowing bettors to claim their winnings
                // via the redeem method
                bytes32 hashMatchEpochHome = keccak256(abi.encodePacked(matchSlot, betEpoch, winningTeam - 1));
                pickEpochResult[hashMatchEpochHome] = 2;
            } else if (winningTeam == 0) {
                // the contest was a draw or it was cancelled
                bytes32 hashMatchEpochHome = keccak256(abi.encodePacked(matchSlot, betEpoch, winningTeam));
                bytes32 hashMatchEpochAway = keccak256(abi.encodePacked(matchSlot, betEpoch, winningTeam + 1));
                redemptionPot += betLong[0][matchSlot] + betLong[1][matchSlot];
                // tie has a "1" allowing bettor their money back
                pickEpochResult[hashMatchEpochHome] = 1;
                pickEpochResult[hashMatchEpochAway] = 1;
            }
            // the default value of pickEpochResult[] is zero, which is like a loss in that bettor gets
            // no eth back, so this mapping need not be assigned
        }
        // subtract redemptionPot from bettor capital and LP pledged capital
        housePot = sub(housePot, redemptionPot);
        // allocate 1% of payout to the oracle
        uint oraclePot = redemptionPot / 100;
        // revalue payout to be 99% of its original value
        redemptionPot = oraclePot * 99;
        emit ResultsPosted(winner, betEpoch, block.timestamp);
        // incrementing the epoch affects LP withdrawals, token claimTokens
        // it also makes it so that no one can bet on old games
        betEpoch++;
        // money reallocated
        oracleBalance += oraclePot;
        margin[0] += housePot;
        margin[3] += redemptionPot;
        // old positions are reset to zero for the next epoch for margin calculations
        delete betLong;
        delete betPayout;
        // this pushes start times out, allowing LPs to fund and withdraw again
        earliestStart = 2e9;
    }

    function redeem(bytes32 _subkId) external {
        Subcontract storage k = subcontracts[_subkId];
        require(k.bettor == msg.sender, "can only redeem bets from owner of that bet");
        // checks teamEpochHash to see if bet receives money back
        uint8 _pick = k.pick;
        uint8 _matchNum = k.matchNum;
        uint8 _epoch = k.epoch;
        bytes32 hashMatchEpochWinner = keccak256(abi.encodePacked(_matchNum, _epoch, _pick));
        uint gameOutcome = pickEpochResult[hashMatchEpochWinner];
        // 0 is for a loss or no outcome reported yet
        require(gameOutcome != 0);
        // both ties and wins receive back their initial bet amount
        uint payoff = k.betAmount;
        if (gameOutcome == 2) {
            payoff += k.payoff;
        }
        // the oracle revenue comes out of a 1% fee applied to bettor payouts
        payoff = payoff * 99 / 100;
        // subtracts payout from the cumulative redemption pot
        require(payoff <= margin[3]);
        margin[3] -= payoff;
        delete subcontracts[_subkId];
        // eth goes straight to the bettor, no longer in the contract
        msg.sender.transfer(payoff);
    }

    function inactiveBook() external {
        // this is just a safety method in case original oracles die in a fire and money is stuck in the contract
        // it allows all parties to get their eth back as if all the games were ties
        // bettors would have to then redeem, and LPs would have to sell shares
        //require(block.timestamp - earlyStart > 12e5, "emergency method for unattended contract");
        require(margin[2] > 0);
        uint lpPot = margin[1] + margin[2];
        margin[1] = 0;
        margin[2] = 0;
        uint8 i;
        uint8 team = 0;
        // games are treated as if they were all ties, giving users their eth back. They do need to redeem them, however.
        for (i = 0; i < 32; i++) {
            bytes32 hashMatchHome = keccak256(abi.encodePacked(i, betEpoch, team));
            pickEpochResult[hashMatchHome] = 1;
            bytes32 hashMatchAway = keccak256(abi.encodePacked(i, betEpoch, team + 1));
            pickEpochResult[hashMatchAway] = 1;
            lpPot = sub(lpPot, betLong[0][i] + betLong[1][i]);
        }
        betEpoch += 5;
        margin[0] += lpPot;
        delete betLong;
        delete betPayout;
    }


    function transmitInit(
        string[32] memory _teamSchedule,
        uint[32] memory _startTime,
        uint[32] memory _decOdds,
        uint earlyStart
        )
        external
        // onlyAdmin
    {
        // initially the schedule, start times, and odds are supplied all at once
        // in the rare case that the schedule or start times must be adjusted, it would be through another submission
        // of all this data, which is costly in terms of gas, but should be rare
        earliestStart = earlyStart;
        startTime = _startTime;
        decOdds = _decOdds;
        teamSchedule = _teamSchedule;
        emit SchedulePosted1(_teamSchedule[0], _teamSchedule[1], _teamSchedule[2], _teamSchedule[3],
        _teamSchedule[4], _teamSchedule[5], _teamSchedule[6], _teamSchedule[7],
        betEpoch, block.timestamp);
        emit SchedulePosted2(_teamSchedule[8], _teamSchedule[9], _teamSchedule[10], _teamSchedule[11],
        _teamSchedule[12], _teamSchedule[13], _teamSchedule[14], _teamSchedule[15],
        betEpoch, block.timestamp);
        emit SchedulePosted3(_teamSchedule[16], _teamSchedule[17], _teamSchedule[18], _teamSchedule[19],
        _teamSchedule[20], _teamSchedule[21], _teamSchedule[22], _teamSchedule[23],
        betEpoch, block.timestamp);
        emit SchedulePosted4(_teamSchedule[24], _teamSchedule[25], _teamSchedule[26], _teamSchedule[27],
        _teamSchedule[28], _teamSchedule[29], _teamSchedule[30], _teamSchedule[31],
        betEpoch, block.timestamp);
        emit StartTimesPosted(_startTime, betEpoch, block.timestamp);
        emit DecOddsPosted(_decOdds, betEpoch, block.timestamp);
    }

    function transmitDecOdds(uint[32] memory _decOdds)
    external
    //onlyAdmin
    {
        decOdds = _decOdds;
        emit DecOddsPosted(_decOdds, betEpoch, block.timestamp);
    }

/** these show methods are to make it easier for the web front end to process data */
    function showLongs(uint i) external view returns (uint[32] memory) {
        return betLong[i];
    }

    function showLPGross(uint i) external view returns (uint[32] memory) {
        return betPayout[i];
    }

    function showdecOdds() external view returns (uint[32] memory) {
        return decOdds;
    }

    function showSchedString(uint i) external view returns (string memory) {
        return teamSchedule[i];
    }

    function showStartTime() external view returns (uint[32] memory) {
        return startTime;
    }

// remove after debugging
    function showMargin() external view
    returns (
        uint unusedCapital,
        uint usedCapital,
        uint betCapital,
        uint oraclBalance,
        uint redeemPot,
        uint kontractEthBal)
    {
        unusedCapital = margin[0] / 1e12;
        usedCapital = margin[1] / 1e12;
        betCapital = margin[2] / 1e12;
        redeemPot = margin[3] / 1e12;
        oraclBalance = oracleBalance / 1e12;
        kontractEthBal = address(this).balance / 1e12;
    }

    function checkOpen(bytes32 _subkID) external view returns (bool)
    {
        bool openOrder = (offercontracts[_subkID].epoch != 0);
        return openOrder;
    }

    function checkRedeem(bytes32 _subkID) external view returns (bool)
    {
        Subcontract storage k = subcontracts[_subkID];
        bytes32 teamEpochHash = keccak256(abi.encodePacked(k.matchNum, k.epoch, k.pick));
        bool redeemable = (pickEpochResult[teamEpochHash] > 0);
        return redeemable;
    }
    
    function odds(uint _match, uint _player) public view returns (uint) {
        uint betOdds = decOdds[_match];
        if (_player == 1) {betOdds = 1e6/(90 + betOdds) - 90;}
        return betOdds;
    }

    function mul(uint a, uint b) internal pure returns (uint) {
        uint c = a * b;
        require(c / a == b, "multiplication overflow");
        return c;
    }

    function sub(uint a, uint b) internal pure returns (uint) {
        require(b <= a, "subtraction underflow on uints");
        uint c = a - b;
        return c;
    }

    // this is used for calculating required margin
    function maxZero(int a, int b) internal pure returns (int) {
        int c = a;
        if (a <= b) c = b;
        if (c <= 0) c = 0;
        return c;
    }

}
