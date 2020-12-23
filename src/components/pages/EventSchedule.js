import React, { Component } from 'react'
import { drizzleConnect } from '@drizzle/react-plugin'
import PropTypes from 'prop-types'
import { autoBind } from 'react-extras'
import Text from '../basics/Text'
import Football from '../../contracts/solidityjson/Football.json'
import {
  Box,
  Flex
} from '@rebass/grid'
import moment from 'moment';

class EventSchedule extends Component {

  constructor(props, context) {
    super(props)
    autoBind(this)

    this.assets = [{
      contract: context.drizzle.contracts.FOOT0Swap,
      id: 0
    }
    ]

    this.state = {
      contractID: 0
    }


    this.currentContract = this.props.routeParams.contract;
    this.asset_id = 0
    this.contracts = context.drizzle.contracts
    this.drizzle = context.drizzle
    this.priceHistory = {}
    this.matchHistory1 = {}
    this.matchHistory2 = {}
    this.matchHistory3 = {}
    this.matchHistory4 = {}
    this.week10 = "0"

  }


  componentDidMount() {
    document.title = 'Schedule Event Logs';
    Object.keys(this.assets).forEach(function (asset) {
      this.getbetHistoryArray1(asset)
    }, this);
    Object.keys(this.assets).forEach(function (asset) {
      this.getbetHistoryArray2(asset)
    }, this);
    Object.keys(this.assets).forEach(function (asset) {
      this.getbetHistoryArray3(asset)
    }, this);
    Object.keys(this.assets).forEach(function (asset) {
      this.getbetHistoryArray4(asset)
    }, this);
  }

  timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var time = `${date}/${month}/${year} ${hour}:${min}`;
    return time;
  }

  getbetHistoryArray1(id) {
    const web3 = this.context.drizzle.web3
    const contractweb3 = new web3.eth.Contract(Football.abi, Football.address);
    var pricedata = [];
    contractweb3.getPastEvents(
      'SchedulePosted1',
      {
        fromBlock: 6000123,
        toBlock: 'latest'
      }
    ).then(function (events) {
      events.forEach(function (element) {
        pricedata.push({
          game0: element.returnValues.m0,
          game1: element.returnValues.m1,
          game2: element.returnValues.m2,
          game3: element.returnValues.m3,
          game4: element.returnValues.m4,
          game5: element.returnValues.m5,
          game6: element.returnValues.m6,
          game7: element.returnValues.m7,
          Epoch: element.returnValues.epoch,
          time: element.returnValues.timestamp
        })
      }, this);
      this.matchHistory1[id] = pricedata
    }.bind(this))
  }

  getbetHistoryArray2(id) {
    const web3 = this.context.drizzle.web3
    const contractweb3 = new web3.eth.Contract(Football.abi, Football.address);
    var pricedata = [];
    contractweb3.getPastEvents(
      'SchedulePosted2',
      {
        fromBlock: 6000123,
        toBlock: 'latest'
      }
    ).then(function (events) {
      events.forEach(function (element) {
        pricedata.push({
          game8: element.returnValues.m8,
          game9: element.returnValues.m9,
          game10: element.returnValues.m10,
          game11: element.returnValues.m11,
          game12: element.returnValues.m12,
          game13: element.returnValues.m13,
          game14: element.returnValues.m14,
          game15: element.returnValues.m15,
          Epoch: element.returnValues.epoch,
          time: element.returnValues.timestamp
        })
      }, this);
      this.matchHistory2[id] = pricedata
    }.bind(this))
  }

  getbetHistoryArray3(id) {
    const web3 = this.context.drizzle.web3
    const contractweb3 = new web3.eth.Contract(Football.abi, Football.address);
    var pricedata = [];
    contractweb3.getPastEvents(
      'SchedulePosted3',
      {
        fromBlock: 6000123,
        toBlock: 'latest'
      }
    ).then(function (events) {
      events.forEach(function (element) {
        pricedata.push({
          game16: element.returnValues.m16,
          game17: element.returnValues.m17,
          game18: element.returnValues.m18,
          game19: element.returnValues.m19,
          game20: element.returnValues.m20,
          game21: element.returnValues.m21,
          game22: element.returnValues.m22,
          game23: element.returnValues.m23,
          Epoch: element.returnValues.epoch,
          time: element.returnValues.timestamp
        })
      }, this);
      this.matchHistory3[id] = pricedata
    }.bind(this))
  }

  getbetHistoryArray4(id) {
    const web3 = this.context.drizzle.web3
    const contractweb3 = new web3.eth.Contract(Football.abi, Football.address);
    var pricedata = [];
    contractweb3.getPastEvents(
      'SchedulePosted4',
      {
        fromBlock: 6000123,
        toBlock: 'latest'
      }
    ).then(function (events) {
      events.forEach(function (element) {
        pricedata.push({
          game24: element.returnValues.m24,
          game25: element.returnValues.m25,
          game26: element.returnValues.m26,
          game27: element.returnValues.m27,
          game28: element.returnValues.m28,
          game29: element.returnValues.m29,
          game30: element.returnValues.m30,
          game31: element.returnValues.m31,
          Epoch: element.returnValues.epoch,
          time: element.returnValues.timestamp
        })
      }, this);
      this.matchHistory4[id] = pricedata
    }.bind(this))
  }
  //  this.priceHistory = [this.matchHistory1, this.matcHistory2, this.matchHistory3, this.matchHistory4]


  openEtherscan() {
    const url = "https://rinkeby.etherscan.io/address/0xBA8f31a128f1CF6f1A50B87DAeee0AE1e1cf98f3";
    // new const url = "https://ropsten.etherscan.io/address/0xc9c61e5Ec1b7E7Af5Ccb91b6431733dE6d62cAC3#code";
    window.open(url, "_blank");
  }


  render() {
    if (Object.keys(this.matchHistory1).length === 0)
      return (
        <Text size="20px" weight="200">Waiting...</Text>
      )
    else {
      return (
        <div>

          <Text size="20px">
            <a
              className="nav-header"
              style={{
                cursor: "pointer",
              }}
              href="/"
            >
              Back
          </a>
          </Text>
          <Box mt="15px"
            mx="30px" >
            <Flex width="100%"
              justifyContent="marginLeft" >
              <Text size="14px" weight="300"> These event logs are created with every new epoch. Their order
              is consistent with the odds, results, and start time orders. Each item represents a match, and
              has the format "sport:homeTeam:awayTeam". Thus to validate the oracle, apply the most recent
        schedule data listed here to odds, results, and start times.</Text>
            </Flex>
          </Box>
          <br />

          {Object.keys(this.matchHistory1).map((id) => (
            <div key={id} style={{ width: "100%", float: "left" }}>
              <Text size="12px" weight="200">
                {" "}
                  Time, Week, m1, m2, m3, m4, m5, m6, m7
                </Text>{" "}
              <br />
              {this.matchHistory1[id].map((event, index) => (
                <div key={index}>
                  <Text size="12px" weight="200">
                    {" "}
                    {moment.unix(event.time).format("DD-MM-YYTHH:mm")},{" "}
                    {event.Epoch},
                      {event.game0},
                      {event.game1},
                      {event.game2},
                      {event.game3},
                      {event.game4},
                      {event.game5},
                      {event.game6},
                      {event.game7}
                    {/*  ,
                      {event.game8},
                      {event.game9},
                      {event.game10},
                      {event.game11},
                      {event.game12},
                      {event.game13},
                      {event.game14},
                      {event.game15},
                      {event.game16},
                      {event.game17},
                      {event.game18},
                      {event.game19},
                      {event.game20},
                      {event.game21},
                      {event.game22},
                      {event.game23},
                      {event.game24},
                      {event.game25},
                      {event.game26},
                      {event.game27},
                      {event.game28},
                      {event.game29},
                      {event.game30},
                      {event.game31}, */}
                  </Text>
                  <br />
                </div>
              ))}
            </div>
          ))}
        </div>
      );
    }
  }
}


EventSchedule.contextTypes = {
  drizzle: PropTypes.object
}

// May still need this even with data function to refresh component on updates for this contract.
const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    contracts: state.contracts,
    drizzleStatus: state.drizzleStatus
  }
}

export default drizzleConnect(EventSchedule, mapStateToProps)
