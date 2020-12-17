import React, { Component } from 'react'
import { drizzleConnect } from '@drizzle/react-plugin'
// import * as _ from underscore;
// import { useAsync } from "react-use";
// import { useThrottleRequests } from "./useThrottleRequests";
import PropTypes from 'prop-types'
import web3 from 'web3-utils'
import Split from '../layout/Split'
import {
  Box,
  Flex
} from '@rebass/grid'
import Logo from '../basics/Logo'
import Text from '../basics/Text'
import { G } from '../basics/Colors'
import { autoBind } from 'react-extras'
import Triangle from '../basics/Triangle'
import ButtonEthScan from '../basics/ButtonEthScan.js'
import Input from '../basics/Input.js';
import Button from '../basics/Button.js';
import ButtonI from '../basics/ButtonI.js';
import TruncatedAddress from '../basics/TruncatedAddress.js';
import TruncatedAddress0 from '../basics/TruncatedAddress0.js';
import VBackgroundCom from '../basics/VBackgroundCom'
import Football from '../../contracts/solidityjson/Football.json'
import Form from '../basics/Form.js'
var moment = require("moment");
var momentTz = require("moment-timezone");



class BigBetPagejs extends Component {

  constructor(props, context) {
    super(props)
    autoBind(this)

    this.assets = [{
        contract: context.drizzle.contracts.FOOT0Swap,
        id: 0
      }
    ]

    this.currentContract = this.props.routeParams.contract;
    this.asset_id = 0;
    this.contracts = context.drizzle.contracts;
    this.drizzle = context.drizzle;
    this.web3 = web3;

    this.state = {
      contractID: "",
      betAmount: "",
      teamPick: null,
      matchPick: null,
      teamTake: false,
      currentWeek: "",
      showDecimalOdds: false,
      teamName: false,
      BetSize: false,
      MoneyLine: false,
      decOdds: "",
      decOddsOff: 0,
      bigBets: [],
      bigBetsSet: false,
    };
    this.bigBetHistory0 = {};
    this.bigBetHistory2 = {};
    this.checker1 = false;
    this.checker2 = false;
    this.takekeys = {};
    this.takekeys2 = {};
  }


  componentDidMount() {
        document.title='Big Bet Page'
    this.findValues(this.state.contractID);
    Object.keys(this.assets).forEach(function(asset) {
        this.getbetHistoryArray(asset)
      }, this);
  }

  componentDidUpdate(prevProps, prevState) {
      if (!prevState.dataSource) {
      this.findValues(this.state.contractID);
    Object.keys(this.assets).forEach(function(asset) {
        this.getbetHistoryArray(asset)
      }, this);
    }
  }

  openEtherscan(txhash) {
        const url = 'https://rinkeby.etherscan.io/tx/' + txhash;
        window.open(url, '_blank');
      }

      handleBetSize(value) {
        this.setState(state => ({
          ...state,
          betAmount: value
        }));
      }

      toggle(){
        const currentState = this.state.details;
        this.setState({ details: !currentState });
    }

  switchOdds() {
    if (this.state.showDecimalOdds) {
            this.setState(state => ({ ...state, showDecimalOdds: false }))
    } else {
            this.setState(state => ({ ...state, showDecimalOdds: true }))
    }
  }

  killBet(x) {
    const stackId = this.contracts["FOOT0Swap"].methods.killBig.cacheSend(x, {
      from: this.props.accounts[0]
    });
  }

  getWeek() {
    this.weekKey = this.contracts["FOOT0Swap"].methods.betEpoch.cacheCall()
  }

  getStartTime() {
    this.startTimeKey = this.contracts["FOOT0Swap"].methods.showStartTime.cacheCall()
  }


  getOddsHome() {
      this.oddsHomeKey = this.contracts["FOOT0Swap"].methods.showdecOdds.cacheCall()
  }


  getbetHistoryArray(id) {
    const web3b = this.context.drizzle.web3
    const contractweb3b = new web3b.eth.Contract(Football.abi, Football.address);
    var eventdata = [];
    var takes = {};
    var eventdata2 = [];
    var takes2 = {};

    contractweb3b.getPastEvents(
      'BetBigRecord',
      {
        fromBlock: 7000123,
        toBlock: 'latest'
      }
    ).then(function(events) {
      events.forEach(function(element) {

        if(element.returnValues.bettor === this.props.accounts[0])
        {
          this.checker1 = true
          eventdata.push({
            timestamp: element.returnValues.timestamp,
            BettorAddress: element.returnValues.bettor,
            Hashoutput: element.returnValues.contractHash,
            BetSize: web3.fromWei(element.returnValues.betsize.toString(),"szabo"),
            LongPick: element.returnValues.pick,
            Payoff: web3.fromWei(element.returnValues.payoff.toString(),"szabo"),
            Epoch: element.returnValues.epoch,
            MatchNum: element.returnValues.matchnum
    });
    takes[element.returnValues.contractHash] = this.contracts["FOOT0Swap"
      ].methods.checkOpen.cacheCall(element.returnValues.contractHash);
  }
  if(element.returnValues.epoch === this.currentWeek)
  {
    //this.state.bigBetsSet = true
    this.checker2 = true
    eventdata2.push({
      Hashoutput2: element.returnValues.contractHash,
      BetSizeOffered2: web3.fromWei(element.returnValues.payoff.toString(),"szabo"),
      OfferedTeam2: 1 - Number(element.returnValues.pick),
      OfferedMatch: element.returnValues.matchnum,
      DecOdds2: element.returnValues.oddsOffered
});
takes2[element.returnValues.contractHash] = this.contracts["FOOT0Swap"
  ].methods.checkOpen.cacheCall(element.returnValues.contractHash);
}

    }, this);
    this.bigBetHistory0[id] = eventdata
    this.takekeys = takes
    this.bigBetHistory2[id] = eventdata2
    this.takekeys2 = takes2
  }.bind(this));
    }

    makeBigBet() {
      const stackId = this.contracts["FOOT0Swap"]
      .methods.betBig.cacheSend(this.state.matchPick, this.state.teamPick, {
          from: this.props.accounts[0],
          value: web3.toWei(this.state.betAmount.toString(),"finney")
        })
    }

    takeBigBet() {
      const stackId = this.contracts["FOOT0Swap"]
      .methods.takeBig.cacheSend(this.state.contractID, {
          from: this.props.accounts[0],
          value: web3.toWei(this.state.betAmount.toString(),"szabo")
        })
    }

  radioHomePick(match) {
    this.setState(state => ({ ...state, teamTake: false, teamPick: 0,
       matchPick: match}));
  }

  radioAwayPick(match) {
    this.setState(state => ({ ...state, teamTake: false, teamPick: 1,
      matchPick: match}));
  }

  radioTeamPickTake(betamt0, hash0, odds0) {
    this.setState(state => ({ ...state, teamTake: true,
      contractID: hash0, betAmount: betamt0, decOddsOff: odds0}))
  }

  radioTeamPickOffered(hash, betamt) {
    this.setState(state => ({ ...state, contractID: hash, betAmount: betamt}));
  }

  getScheduleString() {
    this.scheduleStringKey = this.contracts["FOOT0Swap"]
    .methods.showSchedString.cacheCall()
  }


  sortByBetSize() {
    if (this.state.BetSize) {
      this.state.bigBets[0].sort(function (a, b) {
        return a.BigBetSize - b.BigBetSize;
      });
      this.setState({ BetSize: false });
    } else {
      this.state.bigBets[0].sort(function (a, b) {
        return b.BigBetSize - a.BigBetSize;
      });
      this.setState({ BetSize: true });
    }
  }

  findValues() {
    this.getStartTime()
    this.getWeek()
    this.getOddsHome()
    this.getScheduleString()
  }

  getMoneyLine(decOddsi) {
    let moneyline = 0
    if (decOddsi < 1000) {
     moneyline = -1000*(1+(100-decOddsi)/decOddsi)
    } else {
      moneyline = decOddsi/10
    }
    moneyline = moneyline.toFixed(0)
    if (moneyline > 0 ) {
      moneyline = "+" + moneyline
    }
    return moneyline
      }

      getRedeemable(gameOutcome) {
        let payable = false
        if (gameOutcome < 3) {
         payable = true
        }
        return payable
          }


  render() {

    let subcontracts = {}
    Object.keys(this.takekeys).forEach(function (id) {
      if (
        this.takekeys[id] in
          this.props.contracts["FOOT0Swap"].checkOpen
      ) {
          subcontracts[id] = this.props.contracts["FOOT0Swap"]
          .checkOpen[this.takekeys[id]].value;
      }
    }, this);

    let subcontracts2 = {}
    Object.keys(this.takekeys2).forEach(function (id) {
      if (
        this.takekeys2[id] in
          this.props.contracts["FOOT0Swap"].checkOpen
      ) {
          subcontracts2[id] = this.props.contracts["FOOT0Swap"]
          .checkOpen[this.takekeys2[id]].value;
      }
    }, this);


let minBet = 0;
    if (this.minBetKey in this.props.contracts["FOOT0Swap"].minBet) {
      minBet = this.props.contracts["FOOT0Swap"].minBet[this.minBetKey].value
    }


    if (this.weekKey in this.props.contracts["FOOT0Swap"].betEpoch) {
      this.currentWeek = this.props.contracts["FOOT0Swap"].betEpoch[this.weekKey].value
    }

    let shares = 0;
    if (this.totalSharesKey in this.props.contracts["FOOT0Swap"].totalShares) {
      shares = this.props.contracts["FOOT0Swap"].totalShares[this.totalSharesKey].value
    }

    let oddsHome0 = [];
    if (this.oddsHomeKey in this.props.contracts["FOOT0Swap"].showdecOdds) {
      oddsHome0 = this.props.contracts["FOOT0Swap"].showdecOdds[this.oddsHomeKey].value
    }

    let startTimeColumn = [];
    if (this.startTimeKey in this.props.contracts["FOOT0Swap"].showStartTime) {
      startTimeColumn = this.props.contracts["FOOT0Swap"].showStartTime[this.startTimeKey].value
    }

    let oddsTot = [];
    let oddsAway = [];
    let oddsHome = [];

    for (let i = 0; i < 32; i++) {
      oddsHome[i] = Number(oddsHome0[i]);
      oddsAway[i] = 1000000/(oddsHome[i] + 90) - 90;
    }

    oddsTot = [oddsHome, oddsAway];


    let scheduleString = ["","","","","","","","","","","","","","","","","","","",
    "","","","","","","","","","","","",""];

  if (this.scheduleStringKey in this.props.contracts["FOOT0Swap"].showSchedString) {
   scheduleString = this.props.contracts["FOOT0Swap"].showSchedString[this.scheduleStringKey].value;
  }



    let homeSplit = [];
    let awaySplit = [];
    let sport = [];
    let teamSplit = [];

    for (let i = 0; i < 32; i++) {
      if (scheduleString[i] !== "") {
        teamSplit[i] = scheduleString[i].split(":");
        sport[i] = teamSplit[i][0];
        homeSplit[i] = teamSplit[i][1];
        awaySplit[i] = teamSplit[i][2];
      } else {
        sport[i] = "na";
        homeSplit[i] = "na";
        awaySplit[i] = "na";
      }
    }

  /*  console.log("teamSplit", teamSplit);
    console.log("oddsHome", oddsHome);
    console.log("bigBets", this.bigBetHistory0);
    console.log("bigBets2", this.bigBetHistory2);*/
    console.log("takeKeys", this.takekeys);
    console.log("teamsplit", this.takekeys2);
    console.log("sub1", subcontracts)
    console.log("sub2", subcontracts2)

    let list1 = [];
    let list2 = [];



    for (let i = 0; i < 16; i++) {
      list1.push(
        <tr key={i} style={{ width: "50%", textAlign: "center" }}>
          <td>{sport[i]}</td>
          <td style={{ textAlign: "left", paddingLeft: "15px" } }>
          {startTimeColumn[i] > moment().unix() ? (
            <input
              type="radio"
              value={i}
              name={"teamRadio"}
              onChange={({ target: { value } }) => this.radioHomePick(value)}
              className="teamRadio"
            />
          ) : (<span className="circle"></span>
          )}{" "}
            {homeSplit[i]}
          </td>
          <td style={{ textAlign: "left", paddingLeft: "15px" } }>
          {startTimeColumn[i] > moment().unix() ? (
            <input
              type="radio"
              value={i}
              name={"teamRadio"}
              onChange={({ target: { value } }) => this.radioAwayPick(value)}
              className="teamRadio"
            />
          ) : (<span className="circle"></span>
          )}{" "}
            {awaySplit[i]}
          </td>
          <td>
          {moment.unix(startTimeColumn[i]).format("DD-HH")}
          </td>
        </tr>
      );
    }

    for (let ii = 16; ii < 32; ii++) {
      list2.push(
        <tr key={ii} style={{ width: "50%", textAlign: "center" }}>
          <td>{sport[ii]}</td>
          <td style={{ textAlign: "left", paddingLeft: "15px" }}>
          {startTimeColumn[ii] > moment().unix() ? (
            <input
              type="radio"
              value={ii}
              name={"teamRadio"}
              onChange={({ target: { value } }) => this.radioTeamPick(value)}
              className="teamRadio"
            />
          ) : (<span className="circle"></span>
          )}{" "}
            {homeSplit[ii]}
          </td>
          <td style={{ textAlign: "left", paddingLeft: "15px" } }>
          {startTimeColumn[ii] > moment().unix() ? (
            <input
              type="radio"
              value={ii}
              name={"teamRadio"}
              onChange={({ target: { value } }) => this.radioTeamPick(value)}
              className="teamRadio"
            />
          ) : (<span className="circle"></span>
          )}{" "}
            {awaySplit[ii]}
          </td>
          <td>
          {moment.unix(startTimeColumn[ii]).format("DD-HH")}
          </td>
        </tr>
      );
    }

let bigBets = [];

    Object.keys(this.bigBetHistory2).map((index) => {
      //    if (this.checker2) {
            this.bigBetHistory2[index].map((bet, index) => {
              let bigBet = {
                teamAbbrevName: teamSplit[bet.OfferedMatch][bet.OfferedTeam2+1],
                BigBetSize: bet.BetSizeOffered2,
                BigOdds: Number(bet.DecOdds2),
                OfferHash: bet.Hashoutput2,
                OfferTeamNum: bet.OfferedTeam2,
                BigMatch: bet.OfferedMatch,
              };
              bigBets.push(bigBet);
            });
    //      }
        });

        if (!this.state.bigBetsSet && bigBets.length > 0) {
          this.setState({ bigBets: [...this.state.bigBets, bigBets] });
          this.setState({ bigBetsSet: true });
        }

    return (
      <div>
      <VBackgroundCom / >
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
              style={{borderTop: `thin solid ${G}`}} >
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
                                href="/bookiepage"
                                target ="_blank"
                              >
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
                                            href="/betpage"
                                            target ="_blank"
                                          >
                                            Go to Bet Page
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
                                style={{
                                  cursor: "pointer",
                                }}
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

              <Box >


              <Flex
              style={
                {
                  borderTop: `thin solid ${G}`
                }
              } >
              </Flex>
              </Box>

              {(this.props.transactionStack.length > 0 && this.props.transactionStack[0].length === 66) ? (
                              <Flex alignItems="center">
                                <ButtonEthScan
                                  onClick={() =>
                                    this.openEtherscan(this.props.transactionStack[0])
                                  }
                                  style={{ height: "30px" }}
                                >
                                  See Transaction Detail on Ethscan
                                </ButtonEthScan>
                              </Flex>
                            ) : null}

      <Box>
        {(this.checker1) ? (
      <Flex>
      {Object.keys(this.bigBetHistory0).map(id => (
        <div style={{ width: "100%", float: "left" }}>
        <Text> Your unclaimed Offers</Text>
          <br />
          <table style={{ width: "100%", fontSize: "12px" }}>
          <tbody>
            <tr style={{ width: "50%" }}>
              <td>Week</td>
              <td>Pickbb</td>
              <td>Eth</td>
              <td>contractID</td>
              <td>Click to Cancel</td>
            </tr>
          {this.bigBetHistory0[id].map((event, index) =>
               (subcontracts[event.Hashoutput]) &&
               (
            <tr key={index} style={{ width: "50%" }}>
                <td>{event.Epoch}</td>
                <td>{teamSplit[event.MatchNum][Number(event.LongPick)+1]}</td>
                <td>{(Number(event.Payoff)/1e3).toFixed(2)}</td>
                  <td><TruncatedAddress
                    addr={event.Hashoutput}
                    start="6"
                    end="0"
                    transform="uppercase"
                    spacing="1px" /> </td>
                    <td>
                    <button
                      style={
                        {
                          backgroundColor: "#424242",
                          borderRadius: "5px",
                          cursor: "pointer",
                          }
                      }
                      value={event.Hashoutput}
                      onClick={(e) => {e.preventDefault(); this.killBet(event.Hashoutput)}} >
                    Cancel</button>
                    </td>
            </tr>
        ))}
        </tbody>
        </table>
      </div>
      ))}
        </Flex>
      ) : <Text size="14px">you have no active bets</Text> }
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
      </Box>} >

      <Flex justifyContent="center">
      <Text size="25px">Place, Take and Cancel Big Bets</Text>
      </Flex>
      <Flex justifyContent="center">
      <Text size="15px">Active Week: {this.currentWeek} </Text>
      </Flex>

      <Box mt="15px"
      mx="30px" >
      <Flex width="100%"
      justifyContent="marginLeft" >
      <Text size="14px" weight="300"> This page is for those who want to offer or take
      bets larger than what is offered on the main betting page. Toggle the match and team you
      want to bet on, and the offers, if any, will appear below. You can place your showLongs
      large bet above. Your unclaimed bets are on the left tab (this sends  your eth back).
      </Text>
      </Flex>
      </Box>




         {(this.state.teamPick != null && !this.state.teamTake) ? (
           <Flex
             mt="10px"
             pt="10px"
             alignItems="center"
             style={{
               borderTop: `thin solid ${G}`
             }}
           >

          <Flex style={
            {
              color: "#0099ff",
              fontSize: "13px"
            }
          } >
           <Text size="16px" weight="400">
           sport: {teamSplit[this.state.matchPick][0]}{",  "}
           pick: {teamSplit[this.state.matchPick][Number(this.state.teamPick) + 1]}{",  "}
           odds:  {(oddsTot[this.state.teamPick][this.state.matchPick]/1000 + 1).toFixed(3)}{",  "}
           opponent: {teamSplit[this.state.matchPick][2 -  Number(this.state.teamPick)]}{",  "}
           opponent Odds: {(oddsTot[1 - this.state.teamPick][this.state.matchPick]/1000 + 1).toFixed(3)}</Text>
          </Flex>
            </Flex>
        )
         : null }

         <Flex>
          {(this.state.teamPick != null && !this.state.teamTake) ?
            (
              <Flex
              mt="5px"
              flexDirection="row"
              justifyContent="flex-start"
              alignItems="center"
              >

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
                             }/>

               <Box mt="10px"
               mb="10px" >
               <Button
               style={
                 {height: "30px",
                   width: "100px",
                   float: "right",
                  marginLeft: "5px"
                  }
               }
               onClick={
                 () => this.makeBigBet()
               } >
               OfferNow </Button>
               </Box>

               <Box mt="10px"
               mb="10px" ml="80px" mr="80px"></Box>
               </Flex>
             )
              : null
               }
              </Flex>

          <Flex
            mt="10px"
            pt="10px"
            alignItems="center"
            style={{
              borderTop: `thin solid ${G}`
            }}
          >
         </Flex>


      <Box>
        <Flex
        mt="20px"
        flexDirection="row"
        justifyContent="space-between" >
        </Flex>
      </Box>



       <Box>   <Flex
         mt="20px"
         flexDirection="row"
         justifyContent="space-between" >
         </Flex>
       </Box>
       <div>

      <Box> <Flex>
       <table style={{ width: "50%", borderRight: "1px solid", float: "left"}}>
       <tbody>
           <tr style={{ width: "25%", textAlign: "center" }}>
           </tr>
           {list1}
           </tbody>
             </table>

             <table style={{ width: "50%", borderRight: "1px solid", float: "left"}}>
             <tbody>
               <tr style={{ width: "12.5%", textAlign: "center" }}>
               </tr>
           {list2}
           </tbody>
             </table>




      </Flex> </Box>

      <Flex style={
        {
          color: "#0099ff",
          fontSize: "13px"
        }
      } >
      {this.state.teamTake == true ? (<Text size="14px" weight="400">
       <Box mt="10px"
       mb="10px" ml="40px" mr="40px"></Box>
       <Box mt="10px"
       mb="10px" ml="40px" mr="40px">
       <Button
       style={
         {height: "30px",
           width: "400px",
           float: "left",
          marginLeft: "5px"
          }
       }
       onClick={
          () => this.takeBigBet()
        } >
        Take {(Number(this.state.betAmount)/1e3).toFixed(3)} on {teamSplit[this.state.matchPick][1+Number(this.state.teamPick)]} {"  "}
        at odds {(this.state.decOddsOff/1e3+1).toFixed(3)} </Button> </Box>
        <Box></Box>
        <br />
        <Box mt="10px"
        mb="10px" ml="40px" mr="40px"></Box></Text>
       ): null}
      </Flex>

             <Flex>
             {this.state.teamPick !== null ? (
      <div>
      <Box mt="10px" mb="10px" ml="40px" mr="40px"></Box>
      <Text>Sport: {teamSplit[this.state.matchPick][0]}, Pick: {teamSplit[this.state.matchPick][Number(this.state.teamPick)+1]}</Text>
      <Box mt="10px" mb="10px" ml="40px" mr="40px"></Box>
          <table
            style={{
              width: "100%",
              fontSize: "12px",
              tableLayout: "fixed",
            }}
          >

           <thead>
              <tr style={{ width: "100%" }}>
                <td>take </td>
                <td
                  onClick={() => this.sortByBetSize()}
                  style={{ cursor: "pointer" }}
                >
                  Size
                  <Triangle
                    rotation={!this.state.BetSize ? "180deg" : ""}
                    scale="0.8"
                    fill
                    color="white"
                  />
                </td>
                <td>DecOddsxx</td>
                <td>ContractID</td>
              </tr>
            </thead>
           <tbody>
            {this.state.bigBets.length > 0 &&
              this.state.bigBets[0].map(
                (bet, index) =>
                  (subcontracts2[bet.OfferHash]) &&
                  (bet.OfferTeamNum == this.state.teamPick)  &&
                  (bet.BigMatch == this.state.matchPick)  &&
                  (
                <tr style={{ width: "100%" }}>
                  <td>
                    <input
                    type="radio"
                    value={bet.OfferTeamNum}
                    name={bet.teamAbbrevName}
                    onChange={({ target: { value } }) =>
                      this.radioTeamPickTake(
                        bet.BigBetSize,
                        bet.OfferHash,
                        bet.BigOdds
                      )
                    }
                  /></td>
                      <td>{(Number(bet.BigBetSize)/1e3).toFixed(3)}</td>
                      <td>{(bet.BigOdds/1e3 + 1).toFixed(3)}</td>
                      <td>
                        <TruncatedAddress
                          addr={bet.OfferHash}
                          start="6"
                          end="0"
                          transform="uppercase"
                          spacing="1px"
                        />{" "}
                        </td>
                      </tr>

                    )
                )}
                </tbody>
            </table>
          </div>
        )
           : null
            }
           </Flex>

        </div>
      </Split>
</div>
);
}
}



BigBetPagejs.contextTypes = {
  drizzle: PropTypes.object
}

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    contracts: state.contracts,
    drizzleStatus: state.drizzleStatus,
    transactions: state.transactions,
    transactionStack: state.transactionStack
  }
}

export default drizzleConnect(BigBetPagejs, mapStateToProps)
