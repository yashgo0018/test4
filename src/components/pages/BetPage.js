import React, { Component } from 'react'
import { drizzleConnect } from '@drizzle/react-plugin'
import PropTypes from 'prop-types'
import Split from '../layout/Split'
import web3 from 'web3-utils'
import {
  Box,
  Flex
} from '@rebass/grid'
import Logo from '../basics/Logo'
import Text from '../basics/Text'
import { G } from '../basics/Colors'
import { autoBind } from 'react-extras'
import ButtonEthScan from '../basics/ButtonEthScan.js'
import Input from '../basics/Input.js';
import Button from '../basics/Button.js';
import ButtonI from '../basics/ButtonI.js';
import TruncatedAddress from '../basics/TruncatedAddress.js';
import VBackgroundCom from '../basics/VBackgroundCom'
import Football from '../../contracts/solidityjson/Football.json'
var moment = require("moment");


class BetPagejs extends Component {

  constructor(props, context) {
    super(props)
    autoBind(this)

    this.assets = [{
      contract: context.drizzle.contracts.FOOT0Swap,
      id: 0
    }]

    this.currentContract = this.props.routeParams.contract;
    this.asset_id = 0;
    this.contracts = context.drizzle.contracts;
    this.drizzle = context.drizzle;
    this.web3 = web3;

    this.state = {
      contractID: "",
      betAmount: "",
      fundAmount: "",
      gameResult: "",
      sharesToSell: "",
      teamPick: null,
      matchPick: null,
      currentWeek: "",
      showDecimalOdds: false
    }

    this.betHistory = {};
    this.checker1 = false;
    this.checker2 = false;
    this.takekeys = {};
    this.scheduleStringkey = [];
  }

  componentDidMount() {
    document.title = 'Bet Page'
    setTimeout(() => {
      this.findValues();
      this.assets.forEach(function (asset) {
        this.getbetHistoryArray(asset.id)
      }, this);
    }, 1000);
  }

  handleBetSize(betAmount) {
    this.setState({ betAmount });
  }

  openEtherscan(txhash) {
    const url = 'https://rinkeby.etherscan.io/tx/' + txhash;
    window.open(url, '_blank');
  }

  handletakeBookTeam(teamPick) {
    this.setState({ teamPick });
  }

  handleBetOutcome() {
    this.getBetRedeem()
  }

  takeBet() {
    const stackId = this.contracts[
      "FOOT0Swap"
    ].methods.bet.cacheSend(
      this.state.matchPick, this.state.teamPick, {
      from: this.props.accounts[0],
      value: web3.toWei(this.state.betAmount.toString(), "finney")
    })
  }

  switchOdds() {

    this.setState({ showDecimalOdds: !this.state.showDecimalOdds });
  }

  redeemBet(x) {
    const stackId = this.contracts["FOOT0Swap"].methods.redeem.cacheSend(x, {
      from: this.props.accounts[0]
    });
  }

  getBetRedeem() {
    this.checkBetKey = this.contracts["FOOT0Swap"].methods.checkOpen.cacheCall(this.state.contractID);
  }

  getMargin() {
    this.bookMarginKey = this.contracts["FOOT0Swap"]
      .methods.showMargin.cacheCall()
  }

  getbetHistoryArray(id) {

    const web3b = this.context.drizzle.web3
    const contractweb3b = new web3b.eth.Contract(Football.abi, Football.address);
    var eventdata = [];
    var takes = {};
    contractweb3b.getPastEvents(
      'BetRecord',
      {
        fromBlock: 7000123,
        toBlock: 'latest'
      }
    ).then(function (events) {
      events.forEach(function (element) {
        if (element.returnValues.bettor === this.props.accounts[0])
          this.checker1 = true;
        eventdata.push({
          Hashoutput: element.returnValues.contractHash,
          BettorAddress: element.returnValues.bettor,
          Epoch: element.returnValues.epoch,
          timestamp: element.returnValues.timestamp,
          BetSize: web3.fromWei(element.returnValues.betsize.toString(), "szabo"),
          LongPick: element.returnValues.pick,
          MatchNum: element.returnValues.matchnum,
          //    DecimalOdds: web3.fromWei(element.returnValues.payoff.toString(),"szabo"),
          DecimalOdds: (element.returnValues.payoff / element.returnValues.betsize * 1000).toFixed(0),
          Payoff: web3.fromWei(element.returnValues.payoff.toString(), "szabo")
        });
        takes[element.returnValues.contractHash] = this.contracts["FOOT0Swap"].methods
          .checkRedeem.cacheCall(element.returnValues.contractHash)
      }, this);
      this.betHistory[id] = eventdata

      this.takekeys = takes
    }.bind(this))
  }

  radioMatchHome(teampic) {

    this.setState({ matchPick: teampic, teamPick: 0 })
  }

  radioMatchAway(teampic) {

    this.setState({ matchPick: teampic, teamPick: 1 })
  }

  getScheduleStringVector() {
    for (let ij = 0; ij < 32; ij++) {
      this.scheduleStringKey[ij] = this.contracts["FOOT0Swap"]
        .methods.showSchedString.cacheCall(ij);
    }
  }

  findValues() {
    // getMinBet
    this.minBetKey = this.contracts["FOOT0Swap"].methods.minBet.cacheCall()

    //  getScheduleStringVector
    // getOdds
    this.oddsHomeKey = this.contracts["FOOT0Swap"].methods.showdecOdds.cacheCall()

    // getBetsHome
    this.betsHomeKey = this.contracts["FOOT0Swap"].methods.showLongs.cacheCall(0)

    // getBetsAway
    this.betsAwayKey = this.contracts["FOOT0Swap"].methods.showLongs.cacheCall(1)

    // getPayoffsHome
    this.payoffsHomeKey = this.contracts["FOOT0Swap"].methods.showLPGross.cacheCall(0)

    // getPayoffsAway
    this.payoffsAwayKey = this.contracts["FOOT0Swap"].methods.showLPGross.cacheCall(1)

    // getConcKey
    this.concKey = this.contracts["FOOT0Swap"].methods.concentrationLimit.cacheCall()

    // getStartTime
    this.startTimeKey = this.contracts["FOOT0Swap"].methods.showStartTime.cacheCall()

    // getSharesBalance
    this.sharesKey = this.contracts["FOOT0Swap"].methods.lpStruct.cacheCall(this.props.accounts[0])

    // getWeek
    this.weekKey = this.contracts["FOOT0Swap"].methods.betEpoch.cacheCall()

    // getUsed
    this.usedKey = this.contracts["FOOT0Swap"].methods.margin.cacheCall(1)

    // getUnused
    this.unusedKey = this.contracts["FOOT0Swap"].methods.margin.cacheCall(0)

    // getBetCapital
    this.betCapitalKey = this.contracts["FOOT0Swap"].methods.margin.cacheCall(2)

    // getScheduleString
    this.scheduleStringKey = this.contracts["FOOT0Swap"]
      .methods.showSchedString.cacheCall()
  }

  getMaxSize(unused0, used0, climit0, long0) {
    let unused = Number(unused0)
    let used = Number(used0)
    let climit = Number(climit0)
    let long = Number(long0)
    let maxSize = (unused + used) / climit - long
    let maxSize2 = unused
    if (maxSize2 < maxSize) {
      maxSize = maxSize2
    }
    return maxSize
  }

  getMoneyLine(decOddsi) {
    let moneyline = 0
    if (decOddsi < 1000) {
      moneyline = -1000 * (1 + (100 - decOddsi) / decOddsi)
    } else {
      moneyline = decOddsi / 10
    }
    moneyline = moneyline.toFixed(0)
    if (moneyline > 0) {
      moneyline = "+" + moneyline
    }
    return moneyline
  }

  getOutcome(outcomeScalar) {
    if (outcomeScalar === "0") {
      return "not settled"
    } else if (outcomeScalar === "1") {
      return "tie"
    } else if (outcomeScalar === "2") {
      return "win"
    } else {
      return "loss"
    }
  }

  getRedeemable(gameOutcome) {
    let payable = false
    if (gameOutcome < 3) {
      payable = true
    }
    return payable
  }

  render() {

    let concentrationLimit = 0;
    if (this.concKey in this.props.contracts["FOOT0Swap"].concentrationLimit) {
      concentrationLimit = this.props.contracts["FOOT0Swap"].concentrationLimit[this.concKey].value
    }

    let subcontracts = {}
    Object.keys(this.takekeys).forEach(function (id) {
      if (
        this.takekeys[id] in
        this.props.contracts["FOOT0Swap"]
          .checkRedeem
      ) {
        subcontracts[id] = this.props.contracts["FOOT0Swap"]
          .checkRedeem[this.takekeys[id]].value;
      }
    }, this);


    let minBet = 0;
    if (this.minBetKey in this.props.contracts["FOOT0Swap"].minBet) {
      minBet = this.props.contracts["FOOT0Swap"].minBet[this.minBetKey].value
    }

    let unusedCapital = "0";
    if (this.unusedKey in this.props.contracts["FOOT0Swap"].margin) {
      unusedCapital = web3.fromWei(this.props.contracts["FOOT0Swap"].margin[this.unusedKey].value.toString(), "szabo")
    }


    let usedCapital = "0";
    if (this.usedKey in this.props.contracts["FOOT0Swap"].margin) {
      usedCapital = web3.fromWei(this.props.contracts["FOOT0Swap"].margin[this.usedKey].value.toString(), "szabo")
    }

    if (this.weekKey in this.props.contracts["FOOT0Swap"].betEpoch) {
      this.currentWeek = this.props.contracts["FOOT0Swap"].betEpoch[this.weekKey].value
    }

    let startTimeColumn = [];
    if (this.startTimeKey in this.props.contracts["FOOT0Swap"].showStartTime) {
      startTimeColumn = this.props.contracts["FOOT0Swap"].showStartTime[this.startTimeKey].value
    }

    let oddsHome0 = [];
    if (this.oddsHomeKey in this.props.contracts["FOOT0Swap"].showdecOdds) {
      oddsHome0 = this.props.contracts["FOOT0Swap"].showdecOdds[this.oddsHomeKey].value
    }

    let betsHome = [];
    if (this.betsHomeKey in this.props.contracts["FOOT0Swap"].showLongs) {
      betsHome = this.props.contracts["FOOT0Swap"].showLongs[this.betsHomeKey].value
    }

    let betsAway = [];
    if (this.betsAwayKey in this.props.contracts["FOOT0Swap"].showLongs) {
      betsAway = this.props.contracts["FOOT0Swap"].showLongs[this.betsAwayKey].value
    }

    let payoffHome = [];
    if (this.payoffsHomeKey in this.props.contracts["FOOT0Swap"].showLPGross) {
      payoffHome = this.props.contracts["FOOT0Swap"].showLPGross[this.payoffsHomeKey].value
    }

    let payoffAway = [];
    if (this.payoffsAwayKey in this.props.contracts["FOOT0Swap"].showLPGross) {
      payoffAway = this.props.contracts["FOOT0Swap"].showLPGross[this.payoffsAwayKey].value
    }

    let scheduleString = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", ""
      , "", "", "", "", "", "", "", ""]
    if (this.scheduleStringKey in this.props.contracts["FOOT0Swap"].showSchedString) {
      scheduleString = this.props.contracts["FOOT0Swap"].showSchedString[this.scheduleStringKey].value;
    }


    let oddsHome = [];
    let oddsAway = [];
    for (let ii = 0; ii < 16; ii++) {
      oddsHome[ii] = Number(oddsHome0[ii]);
      oddsAway[ii] = 1000000 / (Number(oddsHome[ii]) + 90) - 90;
    }

    let homeLiab = [];
    let awayLiab = [];
    for (let ii = 0; ii < 32; ii++) {
      homeLiab[ii] = (Number(payoffHome[ii]) - Number(betsAway[ii])) / 1e12;
      awayLiab[ii] = (Number(payoffAway[ii]) - Number(betsHome[ii])) / 1e12;
    }
    let netLiab = [];
    netLiab = [homeLiab, awayLiab];


    let teamSplit = [];
    //  let dayOfWeek =[];

    for (let i = 0; i < 32; i++) {
      teamSplit[i] = scheduleString[i].split(":");
      //         dayOfWeek[i] = Date.getUTCDay(startTimeColumn[i]);
    }

    let firstSixteenTeams = [];
    let secondSixteenTeams = [];

    for (let i = 0; i < 32; i++) {
      firstSixteenTeams.push(
        <tr key={i} style={{ width: "25%", textAlign: "center" }}>
          <td>{teamSplit[i][0]}</td>
          <td style={{ textAlign: "left", paddingLeft: "15px" }}>
            {startTimeColumn[i] > moment().unix() ? (
              <input
                type="radio"
                value={i}
                name={"teamRadio"}
                onChange={({ target: { value } }) => this.radioMatchHome(value)}
                className="teamRadio"
              />
            ) : (
                <span className="circle"></span>
              )}{" "}
            {teamSplit[i][1]}
          </td>
          <td>
            {(oddsHome[i] / 1000 + 1).toFixed(3)}
          </td>
          <td>
            {parseFloat(this.getMaxSize(
              unusedCapital,
              usedCapital,
              concentrationLimit,
              netLiab[0][i]) / 1e3).toFixed(2)}
          </td>
          <td>  {startTimeColumn[i] > moment().unix() ? (
            <input
              type="radio"
              value={i}
              name={"teamRadio"}
              onChange={({ target: { value } }) => this.radioMatchAway(value)}
              className="teamRadio"
            />
          ) : (
              <span className="circle"></span>
            )}{" "}
            {teamSplit[i][2]}</td>
          <td>
            {(oddsAway[i] / 1000 + 1).toFixed(3)}
          </td>
          <td>
            {parseFloat(this.getMaxSize(
              unusedCapital,
              usedCapital,
              concentrationLimit,
              netLiab[1][i]) / 1e3).toFixed(3)}
          </td>
          <td>
            {moment.unix(startTimeColumn[i]).format("DD-HH")}
          </td>
        </tr>
      );
    }


    return (
      <div>
        <VBackgroundCom />
        <Split
          page={"bookies"}
          side={
            <Box
              mt="30px"
              ml="25px"
              mr="35px">
              <Logo />
              <Box >
                <Flex
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between" >
                </Flex>
                <Flex
                  style={{ borderTop: `thin solid ${G}` }} >
                </Flex>
              </Box>
              <Box>
                <Flex>
                  <Text size="20px">
                    <a
                      className="nav-header"
                      style={{ cursor: "pointer" }}
                      href="/bookiepage"
                      target="_blank" >
                      Go to Bookie Page
                    </a>
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Flex>
                  <Text size="20px">
                    <a
                      className="nav-header"
                      style={{
                        cursor: "pointer",
                      }}
                      href="/bigbetpage"
                      target="_blank"
                    >
                      Go to Big Bet Page
                    </a>
                  </Text>
                </Flex>
              </Box>
              <Box>
                <Flex
                  width="100%"
                  alignItems="center"
                  justifyContent="marginLeft"
                >
                  <Text size="20px">
                    <a
                      className="nav-header"
                      style={{ cursor: "pointer" }}
                      href="/"
                    >
                      HomePage
                          </a>
                  </Text>
                </Flex>
              </Box>
              <Box mb="10px"
                mt="10px" >
                <Text>Your address</Text>
                <TruncatedAddress
                  addr={this.props.accounts[0]}
                  start="8"
                  end="6"
                  transform="uppercase"
                  spacing="1px" />
              </Box>

              <Box>
                <Flex
                  mt="5px"
                  flexDirection="row"
                  justifyContent="space-between" >
                </Flex>
              </Box>

              <Box>
                <Flex
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between" >
                </Flex>
                <Flex
                  style={{ borderTop: `thin solid ${G}` }} >
                </Flex>
              </Box>

              {(this.props.transactionStack.length > 0 && this.props.transactionStack[0].length === 66) ? (
                <Flex alignItems="center">
                  <ButtonEthScan
                    onClick={() => this.openEtherscan(this.props.transactionStack[0])}
                    style={{ height: "30px" }}
                  >
                    See Transaction Detail on Ethscan
                  </ButtonEthScan>
                </Flex>
              ) : null}
              <Box>
                <Flex>
                  {Object.keys(this.betHistory).map(id => (
                    <div key={id} style={{ width: "100%", float: "left" }}>
                      <Text> Your active bets</Text>
                      <br />
                      <table style={{ width: "100%", fontSize: "12px" }}>
                        <tbody>
                          <tr style={{ width: "33%" }}>
                            <td>Week</td>
                            <td>Match</td>
                            <td>Pick</td>
                            <td>BetSize</td>
                            <td>DecOdds</td>
                          </tr>
                          {this.betHistory[id].map((event, index) =>
                            (event.Epoch === this.currentWeek) &&
                            (
                              <tr key={index} style={{ width: "33%" }}>
                                <td>{event.Epoch}</td>
                                <td>{event.MatchNum}</td>
                                <td>{event.LongPick}</td>
                                <td>{parseFloat(event.BetSize / 1000).toFixed(2)}</td>
                                <td>{(1 + event.DecimalOdds / 1000).toFixed(3)}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </Flex>
              </Box>
              <Box>
                <Flex
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between" >
                </Flex>
                <Flex style={{ borderTop: `thin solid ${G}` }} >
                </Flex>
              </Box>
              <Box>
                {(this.checker1) ? (
                  <Flex>
                    {Object.keys(this.betHistory).map(id => (
                      <div key={id} style={{ width: "100%", float: "left" }}>
                        <Text size="15px">Active Week: {this.currentWeek}</Text>
                        <br />
                        <Text> Your unclaimed bets</Text>
                        <br />
                        <table style={{ width: "100%", fontSize: "12px", float: "left" }}>
                          <tbody>
                            <tr style={{ width: "33%" }}>
                              <td>Epoch</td>
                              <td>Match</td>
                              <td>Pick</td>
                              <td>Eth</td>
                              <td>Click to Claim</td>
                            </tr>
                            {this.betHistory[id].map((event, index) =>
                              (subcontracts[event.Hashoutput]) &&
                              (
                                <tr key={event, index} style={{ width: "33%" }}>
                                  <td>{event.Epoch}</td>
                                  <td>{event.MatchNum}</td>
                                  <td>{event.LongPick}</td>
                                  <td>{(event.Payoff / 1e3).toFixed(3)}</td>
                                  <td>
                                    <button
                                      style={
                                        {
                                          backgroundColor: "#424242",
                                          borderRadius: "2px",
                                          cursor: "pointer",
                                        }
                                      }
                                      value={event.Hashoutput}
                                      onClick={(e) => { e.preventDefault(); this.redeemBet(event.Hashoutput) }} >
                                      Redeem</button>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </Flex>
                ) : <Text size="14px">you have no unclaimed bets</Text>}
              </Box>
              <Box >
                <Flex
                  mt="20px"
                  flexDirection="row"
                  justifyContent="space-between" >
                </Flex>
                <Flex
                  style={
                    {
                      borderTop: `thin solid ${G}`
                    }
                  } >
                </Flex>
              </Box>
            </Box>
          } >

          <Flex justifyContent="center">
            <Text size="25px">BLA BLA BLA</Text>
          </Flex>

          <Box mt="15px"
            mx="30px" >
          </Box>

          <Flex
            mt="10px"
            pt="10px"
            alignItems="center"
            style={{
              borderTop: `thin solid ${G}`
            }}
          > </Flex>
          {this.state.teamPick != null ? (
            <Flex
              mt="5px"
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
            >
              <Text size="16px" weight="400" style={{ paddingLeft: "10px" }}>Bet Amount</Text>
              <Input
                onChange={
                  ({
                    target: {
                      value
                    }
                  }) =>
                    this.handleBetSize(value)
                }
                width="100px"
                placeholder={
                  "Enter Eths"
                }
                marginLeft="10px"
                marginRignt="5px"
                value={
                  this.state.betAmount
                }
              />
              <Box mt="10px"
                mb="10px" >
                <Button
                  style={{
                    height: "30px",
                    width: "100px",
                    float: "right",
                    marginLeft: "5px"
                  }}
                  onClick={() => this.takeBet()} >
                  Bet Now
                </Button>
              </Box>


              <Box mt="10px"
                mb="10px" ml="40px" mr="80px"></Box>

              {(this.state.showDecimalOdds) ? (
                <Box mt="1px"
                  mb="1px" >
                  <ButtonI
                    style={
                      {
                        height: "50px",
                        width: "110px",
                        float: "right",
                        marginLeft: "1px"
                      }
                    }
                    onClick={
                      () => this.switchOdds()
                    } >show MoneyLine
      </ButtonI>
                </Box>) :
                (<Box>
                  <ButtonI
                    style={
                      {
                        height: "50px",
                        width: "110px",
                        float: "right",
                        marginLeft: "1px"
                      }
                    }
                    onClick={
                      () => this.switchOdds()
                    } >show DecimalOdds
                  </ButtonI>
                </Box>)}

            </Flex>
          ) : null}
          <Box>
            <Flex
              mt="20px"
              flexDirection="row"
              justifyContent="space-between" >
            </Flex>
          </Box>

          <Flex style={{ color: "#0099ff", fontSize: "13px" }} >

            {this.state.teamPick != null ? (<Text size="16px" weight="400">
              pick: {teamSplit[this.state.matchPick][this.state.teamPick + 1]}{"  "}
      opponent: {teamSplit[this.state.matchPick][2 - this.state.teamPick]}</Text>
            )
              : null
            }
          </Flex>

          <Box>   <Flex
            mt="20px"
            flexDirection="row"
            justifyContent="space-between" >
          </Flex>
          </Box>

          <table style={{ width: "100%", borderRight: "1px solid", float: "left" }}>
            <tbody>
              <tr style={{ width: "50%", textAlign: "center" }}>
                <th>sport</th>
                <th>Home Team</th>
                <th>DecimalOdds</th>
                <th>MaxBet</th>
                <th>Away Team</th>
                <th>DecimalOdds</th>
                <th>MaxBet</th>
                <th>BettingEnds</th>
              </tr>
              {firstSixteenTeams}
            </tbody>
          </table>
        </Split>
      </div>
    );
  }
}



BetPagejs.contextTypes = {
  drizzle: PropTypes.object
}

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    contracts: state.contracts,
    drizzleStatus: state.drizzleStatus,
    transactions: state.transactions,
    transactionStack: state.transactionStack
  }
}

export default drizzleConnect(BetPagejs, mapStateToProps)
