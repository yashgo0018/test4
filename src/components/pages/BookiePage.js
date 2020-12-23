import React, {
  Component
} from 'react'
import {
  drizzleConnect
} from '@drizzle/react-plugin'
import PropTypes from 'prop-types'
import web3 from 'web3-utils'
import Split from '../layout/Split'
import {
  Box,
  Flex
} from '@rebass/grid'
import Logo from '../basics/Logo'
import Text from '../basics/Text'
import {
  G,
  H
} from '../basics/Colors'
import LabeledText from '../basics/LabeledText'
import {
  autoBind
} from 'react-extras'
import Form from '../basics/Form.js'
import ButtonEthScan from '../basics/ButtonEthScan.js'
import WarningSign from '../basics/WarningSign'
import Button from '../basics/Button.js';
import TruncatedAddress from '../basics/TruncatedAddress.js';
import VBackgroundCom from '../basics/VBackgroundCom';



class BookiePagejs extends Component {

  constructor(props, context) {
    super(props)
    autoBind(this)

    this.assets = [{
      contract: context.drizzle.contracts.FOOT0Swap,
      id: 0
    }
    ]

    this.currentContract = this.props.routeParams.contract;
    this.asset_id = 0
    this.contracts = context.drizzle.contracts
    this.drizzle = context.drizzle
    this.state = {
      contractID: 0,
      betAmount: "",
      fundAmount: "",
      shareAmount: "",
      sharesToSell: "",
      currentWeek: "",
      showDecimalOdds: false,
      teamPick: ""
    }
    this.takekeys = {}
  }


  componentDidMount() {
    document.title = 'Bookie Page';
    this.findValues(this.state.contractID);
  }

  componentDidUpdate() {
    this.findValues(this.state.contractID);
  }

  handletakeBookTeam(value) {
    this.setState(state => ({
      ...state,
      teamPick: value
    }));
  }

  handlefundBook(value) {
    this.setState(state => ({
      ...state,
      fundAmount: value
    }));
  }

  handlesellBook(value) {
    this.setState(state => ({
      ...state,
      sellAmount: value
    }));
  }

  openEtherscan(txhash) {
    const url = 'https://rinkeby.etherscan.io/tx/' + txhash;
    window.open(url, '_blank');
  }

  handleBookieSell(value) {
    this.setState(state => ({
      ...state,
      sharesToSell: value
    }));
  }

  wdTaker() {
    this.contracts["FOOT0Swap"].methods.withdrawEth.cacheSend({
      from: this.props.accounts[0]
    });
  }

  sellBookie() {
    const { sharesToSell } = this.state.sharesToSell
    this.contracts["FOOT0Swap"]
      .methods.sellShares.cacheSend(sharesToSell, {
        from: this.props.accounts[0]
      });
  }

  fundBook() {
    this.contracts["FOOT0Swap"].methods.fundBook.cacheSend({
      from: this.props.accounts[0],
      value: web3.toWei(this.state.fundAmount, "finney")
    });
  }

  inactivateBook() {
    this.contracts["FOOT0Swap"].methods.inactiveBook.cacheSend();
  }

  getMinBet() {
    this.minBetKey = this.contracts["FOOT0Swap"].methods.minBet.cacheCall()
  }

  getUnused() {
    this.unusedKey = this.contracts["FOOT0Swap"].methods.margin.cacheCall(0)
  }

  getUsed() {
    this.usedKey = this.contracts["FOOT0Swap"].methods.margin.cacheCall(1)
  }

  getCapitalKey() {
    this.betCapitalKey = this.contracts["FOOT0Swap"].methods.margin.cacheCall(2)
  }

  getTotalShares() {
    this.totalSharesKey = this.contracts["FOOT0Swap"].methods.totalShares.cacheCall()
  }

  getWeek() {
    this.weekKey = this.contracts["FOOT0Swap"].methods.betEpoch.cacheCall()
  }

  getBetsHome() {
    this.betsHomeKey = this.contracts["FOOT0Swap"].methods.showLongs.cacheCall(0)
  }

  getPayoffsHome() {
    this.payoffsHomeKey = this.contracts["FOOT0Swap"].methods.showLPGross.cacheCall(0)
  }

  getBetsAway() {
    this.betsAwayKey = this.contracts["FOOT0Swap"].methods.showLongs.cacheCall(1)
  }

  getPayoffsAway() {
    this.payoffsAwayKey = this.contracts["FOOT0Swap"].methods.showLPGross.cacheCall(1)
  }

  getOddsHome() {
    this.oddsHomeKey = this.contracts["FOOT0Swap"].methods.showdecOdds.cacheCall()
  }

  getScheduleString() {
    this.scheduleStringKey = this.contracts["FOOT0Swap"]
      .methods.showSchedString.cacheCall()
  }


  getSharesBalance() {
    this.sharesKey = this.contracts["FOOT0Swap"].methods.lpStruct
      .cacheCall(this.props.accounts[0])
  }

  getNetLiability(i, liab, betcap) {
    let netliab = 0
    netliab = liab / 1e15 - betcap / 1e15
    if (netliab < 0) { netliab = 0 }
    return netliab
  }



  findValues() {
    this.getMinBet()
    this.getPayoffsHome()
    this.getPayoffsAway()
    this.getBetsHome()
    this.getBetsAway()
    this.getOddsHome()
    this.getTotalShares()
    this.getWeek()
    this.getSharesBalance()
    this.getUsed()
    this.getUnused()
    this.getCapitalKey()
    this.getScheduleString()
  }

  getSpreadText(spreadnumber) {
    let outspread = spreadnumber / 10
    if (outspread > 0) {
      outspread = "+" + outspread
    }
    return outspread
  }

  // ****************************************
  // render
  //*****************************************

  render() {


    let unusedCapital = "0";
    if (this.unusedKey in this.props.contracts["FOOT0Swap"].margin) {
      unusedCapital = web3.fromWei(this.props.contracts["FOOT0Swap"].margin[this.unusedKey].value.toString(), "szabo")
    }

    let usedCapital = "0";
    if (this.usedKey in this.props.contracts["FOOT0Swap"].margin) {
      usedCapital = web3.fromWei(this.props.contracts["FOOT0Swap"].margin[this.usedKey].value.toString(), "szabo")
    }

    let betCapital = "0";
    if (this.betCapitalKey in this.props.contracts["FOOT0Swap"].margin) {
      betCapital = web3.fromWei(this.props.contracts["FOOT0Swap"].margin[this.betCapitalKey].value.toString(), "szabo")
    }

    /*
          let x1 = 0;
          let x2 = 0;
          let x3 = 0;
          let x4 = 0;
          x1 = web3.fromWei(betCapital0,"szabo");
          x2 = web3.fromWei(betCapital0,"szabo");
          x3 = web3.fromWei(betCapital0,"szabo");
          x4 = web3.fromWei(betCapital0,"szabo");
    */


    let week = 0;
    if (this.weekKey in this.props.contracts["FOOT0Swap"].betEpoch) {
      week = this.props.contracts["FOOT0Swap"].betEpoch[this.weekKey].value
    }


    let bookieStruct = {
      0: "0",
      1: "0",
      shares: "0",
      weekB: "0",
    }
    let bookieShares = "0";
    if (this.sharesKey in this.props.contracts["FOOT0Swap"].lpStruct) {
      bookieStruct = this.props.contracts["FOOT0Swap"].lpStruct[this.sharesKey].value
      bookieShares = web3.fromWei(bookieStruct.shares.toString(), "finney")
    }

    let totalShares = "0";
    if (this.totalSharesKey in this.props.contracts["FOOT0Swap"].totalShares) {
      totalShares = web3.fromWei(this.props.contracts["FOOT0Swap"]
        .totalShares[this.totalSharesKey].value.toString(), "finney")
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

    let payoffAway = [];
    if (this.payoffsAwayKey in this.props.contracts["FOOT0Swap"].showLPGross) {
      payoffAway = this.props.contracts["FOOT0Swap"].showLPGross[this.payoffsAwayKey].value
    }

    let payoffHome = [];
    if (this.payoffsHomeKey in this.props.contracts["FOOT0Swap"].showLPGross) {
      payoffHome = this.props.contracts["FOOT0Swap"].showLPGross[this.payoffsHomeKey].value
    }

    let scheduleString = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "",
      "", "", "", "", "", "", "", "", "", "", "", "", ""];

    if (this.scheduleStringKey in this.props.contracts["FOOT0Swap"].showSchedString) {
      scheduleString = this.props.contracts["FOOT0Swap"].showSchedString[this.scheduleStringKey].value;
    }

    let oddsHome = [];
    let oddsAway = [];
    for (let ii = 0; ii < 32; ii++) {
      oddsHome[ii] = Number(oddsHome0[ii]);
      oddsAway[ii] = 1000000 / (Number(oddsHome[ii]) + 90) - 90;
    }

    let teamSplit = [];

    for (let i = 0; i < 32; i++) {
      teamSplit[i] = scheduleString[i].split(":");
    }


    return (
      <div>
        <VBackgroundCom />
        <Split
          page={"bookie"}
          side={
            <Box mt="30px" ml="25px" mr="35px">
              <Logo />
              <Flex mt="15px"></Flex>
              <Box
                mt="20px"
                pt="10px"
                style={{ borderTop: `thin solid ${G}` }}
              ></Box>

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
                        // textDecoration: "none",
                        cursor: "pointer",
                      }}
                      href="/betpage"
                      target="_blank"
                    >
                      Betting Page
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
                      Home Page
                  </a>
                  </Text>
                </Flex>
              </Box>

              <Box>
                <Flex mt="10px" pt="10px"></Flex>
              </Box>
              <Box mb="10px" mt="10px">
                <TruncatedAddress
                  label="Your Address"
                  addr={this.props.accounts[0]}
                  start="8"
                  end="6"
                  transform="uppercase"
                  spacing="1px"
                />
              </Box>

              <Box>
                <Flex
                  mt="10px"
                  pt="10px"
                  alignItems="center"
                  style={{ borderTop: `thin solid ${G}` }}
                ></Flex>
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
                <Text
                  size="16px"
                  justifyContent="space-between"
                  buttonWidth="95px"
                >
                  Fund Book
                </Text>
              </Box>
              <Form
                onChange={this.handlefundBook}
                value={this.state.fundAmount}
                onSubmit={this.fundBook}
                mb="20px"
                justifyContent="flex-start"
                buttonWidth="155px"
                inputWidth="150px"
                placeholder="ether"
                buttonLabel="funding amount"
              />

              <Box>
                <Flex>
                  <Flex width="100%" flexDirection="column">
                    <Flex
                      mt="10px"
                      pt="10px"
                      alignItems="center"
                      style={{
                        borderTop: `thin solid ${G}`,
                      }}
                    >
                      <Text size="16px" weight="400" style={{ marginLeft: "1%" }}>
                        Margin
                            </Text>
                    </Flex>
                    <Flex pt="10px" justifyContent="space-around">
                      <Box>
                        <LabeledText
                          big
                          label="Unpledged Capital"
                          text={(Number(unusedCapital) / 1e3).toFixed(0)}
                          spacing="4px"
                        />
                      </Box>

                      <Box>
                        <LabeledText
                          big
                          label="Pledged Capital"
                          text={(Number(usedCapital) / 1e3).toFixed(0)}
                          spacing="1px"
                        />
                      </Box>
                      <Box>
                        <LabeledText
                          big
                          label="Current Gross Bets"
                          text={(Number(betCapital) / 1e3).toFixed(0)}
                          spacing="1px"
                        />
                      </Box>
                    </Flex>
                  </Flex>
                </Flex>
              </Box>

              <Box>
                <Flex
                  mt="10px"
                  pt="10px"
                  style={{ borderTop: `thin solid ${G}` }}
                ></Flex>
              </Box>

              <Box>
                {" "}
                <Text size="14px">
                  {"You own: " + (Number(bookieShares)).toFixed(2) + "  out of " +
                    (Number(totalShares)).toFixed(2) + " total shares"}
                </Text>
              </Box>
              <Box>
                {Number(bookieShares) > 0 ? (
                  <Form
                    onChange={this.handleBookieSell}
                    value={this.state.sharesToSell}
                    onSubmit={this.sellBookie}
                    mb="20px"
                    justifyContent="flex-start"
                    buttonWidth="95px"
                    inputWidth="210px"
                    placeholder="Shares to Sell (Ether, ie 1e18)"
                    buttonLabel="sell"
                  />
                ) : null}
              </Box>

              <Box>
                <Flex
                  mt="20px"
                  pt="10px"
                  style={{ borderTop: `thin solid ${G}` }}
                ></Flex>
              </Box>




              <Button
                width="171px"
                bgColor={H}
                onClick={() => this.inactivateBook()}
              >
                <Flex justifyContent="center">
                  <Box mr="20px">
                    <WarningSign width="13" />
                  </Box>{" "}
                  <Box>Inactive Book</Box>
                </Flex>
              </Button>
            </Box>
          }
        >


          <div className="bookie-page-wrapper" style={{ width: "100%" }}>
            <Flex justifyContent="center">
              <Text size="25px">Bookie  Page</Text>
            </Flex>
            <Box mt="15px"
              mx="30px" >
              <LabeledText
                //text={progress}
                text={"Current Epoch: " + week}
                spacing="1px"
              />
            </Box>
            <VBackgroundCom />


            <Box>
              <Flex>
                <Flex width="100%" flexDirection="column">
                  <Flex pt="10px" justifyContent="space-between"></Flex>
                </Flex>
              </Flex>
            </Box>

            <Box>
              <Flex>
                <Flex width="100%" flexDirection="column">
                  <Flex
                    mt="10px"
                    pt="10px"
                    alignItems="center"
                    style={{
                      borderTop: `thin solid ${G}`,
                    }}
                  ></Flex>

                  <Flex justifyContent="space-around">
                    <table style={{ width: "100%", borderRight: "1px solid" }}>
                      <tbody>
                        <tr style={{ width: "2%", textAlign: "left" }}>
                          <th>Sport</th>
                          <th>Home</th>
                          <th>Away</th>
                          <th>HomeBets</th>
                          <th>AwayBets</th>
                          <th>Net Liability</th>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "left" }}>
                          <td>{teamSplit[0][0]}</td>
                          <td>{teamSplit[0][1]}</td>
                          <td>{teamSplit[0][2]}</td>
                          <td>{(betsHome[0] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[0] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[0], payoffAway[0]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[1][0]}</td>
                          <td>{teamSplit[1][1]}</td>
                          <td>{teamSplit[1][1]}</td>
                          <td>{(betsHome[1] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[1] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[1], payoffAway[1]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[2][0]}</td>
                          <td>{teamSplit[2][1]}</td>
                          <td>{teamSplit[2][2]}</td>
                          <td>{(betsHome[2] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[2] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[2], payoffAway[2]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[3][0]}</td>
                          <td>{teamSplit[3][1]}</td>
                          <td>{teamSplit[3][2]}</td>
                          <td>{(betsHome[3] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[3] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[3], payoffAway[3]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[4][0]}</td>
                          <td>{teamSplit[4][1]}</td>
                          <td>{teamSplit[4][2]}</td>
                          <td>{(betsHome[4] / 1e15).toFixed(3)}</td>
                          <td>{(betsAway[4] / 1e15).toFixed(3)}</td>
                          <td>
                            {this.getNetLiability(0, payoffHome[4], payoffAway[4]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[5][0]}</td>
                          <td>{teamSplit[5][1]}</td>
                          <td>{teamSplit[5][2]}</td>
                          <td>{(betsHome[5] / 1e15).toFixed(3)}</td>
                          <td>{(betsAway[5] / 1e15).toFixed(3)}</td>
                          <td>
                            {this.getNetLiability(0, payoffHome[5], payoffAway[5]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[6][0]}</td>
                          <td>{teamSplit[6][1]}</td>
                          <td>{teamSplit[6][2]}</td>
                          <td>{(betsHome[6] / 1e15).toFixed(3)}</td>
                          <td>{(betsAway[6] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[6], payoffAway[6]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[7][0]}</td>
                          <td>{teamSplit[7][1]}</td>
                          <td>{teamSplit[7][2]}</td>
                          <td>{(betsHome[7] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[7] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[7], payoffAway[7]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[8][0]}</td>
                          <td>{teamSplit[8][1]}</td>
                          <td>{teamSplit[8][2]}</td>
                          <td>{(betsHome[8] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[8] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[8], payoffAway[8]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[9][0]}</td>
                          <td>{teamSplit[9][1]}</td>
                          <td>{teamSplit[9][2]}</td>
                          <td>{(betsHome[9] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[9] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[9], payoffAway[9]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[10][0]}</td>
                          <td>{teamSplit[10][1]}</td>
                          <td>{teamSplit[10][2]}</td>
                          <td>{(betsHome[10] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[10] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[10], payoffAway[10]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[11][0]}</td>
                          <td>{teamSplit[11][1]}</td>
                          <td>{teamSplit[11][2]}</td>
                          <td>{(betsHome[11] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[11] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[11], payoffAway[11]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[12][0]}</td>
                          <td>{teamSplit[12][1]}</td>
                          <td>{teamSplit[12][2]}</td>
                          <td>{(betsHome[12] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[12] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[12], payoffAway[12]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[13][0]}</td>
                          <td>{teamSplit[13][1]}</td>
                          <td>{teamSplit[13][2]}</td>
                          <td>{(betsHome[13] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[13] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[13], payoffAway[13]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[14][0]}</td>
                          <td>{teamSplit[14][1]}</td>
                          <td>{teamSplit[14][2]}</td>
                          <td>{(betsHome[14] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[14] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[14], payoffAway[14]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[15][0]}</td>
                          <td>{teamSplit[15][1]}</td>
                          <td>{teamSplit[15][2]}</td>
                          <td>{(betsHome[15] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[15] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[15], payoffAway[15]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[16][0]}</td>
                          <td>{teamSplit[16][1]}</td>
                          <td>{teamSplit[16][2]}</td>
                          <td>{(betsHome[16] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[16] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[16], payoffAway[16]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[17][0]}</td>
                          <td>{teamSplit[17][1]}</td>
                          <td>{teamSplit[17][2]}</td>
                          <td>{(betsHome[17] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[17] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[17], payoffAway[17]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[18][0]}</td>
                          <td>{teamSplit[18][1]}</td>
                          <td>{teamSplit[18][2]}</td>
                          <td>{(betsHome[18] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[18] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[18], payoffAway[18]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[19][0]}</td>
                          <td>{teamSplit[19][1]}</td>
                          <td>{teamSplit[19][2]}</td>
                          <td>{(betsHome[19] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[19] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[19], payoffAway[19]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[20][0]}</td>
                          <td>{teamSplit[20][1]}</td>
                          <td>{teamSplit[20][2]}</td>
                          <td>{(betsHome[20] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[20] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[20], payoffAway[20]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[21][0]}</td>
                          <td>{teamSplit[21][1]}</td>
                          <td>{teamSplit[21][2]}</td>
                          <td>{(betsHome[21] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[21] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[21], payoffAway[21]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[22][0]}</td>
                          <td>{teamSplit[22][1]}</td>
                          <td>{teamSplit[22][2]}</td>
                          <td>{(betsHome[22] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[22] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[22], payoffAway[22]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[23][0]}</td>
                          <td>{teamSplit[23][1]}</td>
                          <td>{teamSplit[23][2]}</td>
                          <td>{(betsHome[23] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[23] / 1e15).toFixed(3)}
                          </td>
                        </tr>
                        <td>
                          {this.getNetLiability(0, payoffHome[23], payoffAway[23]).toFixed(1)}
                        </td>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[24][0]}</td>
                          <td>{teamSplit[24][1]}</td>
                          <td>{teamSplit[24][2]}</td>
                          <td>{(betsHome[24] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[24] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[24], payoffAway[24]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[25][0]}</td>
                          <td>{teamSplit[25][1]}</td>
                          <td>{teamSplit[25][2]}</td>
                          <td>{(betsHome[25] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[25] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[19], payoffAway[16]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[26][0]}</td>
                          <td>{teamSplit[26][1]}</td>
                          <td>{teamSplit[26][2]}</td>
                          <td>{(betsHome[26] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[26] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[26], payoffAway[26]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[27][0]}</td>
                          <td>{teamSplit[27][1]}</td>
                          <td>{teamSplit[27][2]}</td>
                          <td>{(betsHome[27] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[27] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[27], payoffAway[27]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[28][0]}</td>
                          <td>{teamSplit[28][1]}</td>
                          <td>{teamSplit[28][2]}</td>
                          <td>{(betsHome[28] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[28] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[28], payoffAway[28]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[29][0]}</td>
                          <td>{teamSplit[29][1]}</td>
                          <td>{teamSplit[29][2]}</td>
                          <td>{(betsHome[29] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[29] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[29], payoffAway[29]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[30][0]}</td>
                          <td>{teamSplit[30][1]}</td>
                          <td>{teamSplit[30][2]}</td>
                          <td>{(betsHome[30] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[30] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[30], payoffAway[30]).toFixed(1)}
                          </td>
                        </tr>
                        <tr style={{ width: "25%", textAlign: "center" }}>
                          <td>{teamSplit[31][0]}</td>
                          <td>{teamSplit[31][1]}</td>
                          <td>{teamSplit[31][2]}</td>
                          <td>{(betsHome[31] / 1e15).toFixed(3)}</td>
                          <td>
                            {(betsAway[31] / 1e15).toFixed(3)}
                          </td>
                          <td>
                            {this.getNetLiability(0, payoffHome[31], payoffAway[31]).toFixed(1)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </Flex>
                </Flex>
              </Flex>
            </Box>
          </div>
        </Split>
      </div>
    );
  }
}

BookiePagejs.contextTypes = {
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

export default drizzleConnect(BookiePagejs, mapStateToProps)
