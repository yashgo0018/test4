import React, { Component } from 'react'
import { drizzleConnect } from '@drizzle/react-plugin'
import PropTypes from 'prop-types'
import { autoBind } from 'react-extras'
import Text from '../basics/Text'
import IndicatorD from "../basics/IndicatorD"
import Football from '../../contracts/solidityjson/Football.json'
import {
  Box,
  Flex
} from '@rebass/grid'
var moment = require("moment");
var momentTz = require("moment-timezone");


class EventBetRecord extends Component {

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
    this.week10 = "0"

  }


  componentDidMount() {
      document.title='Bet Event Logs';
    Object.keys(this.assets).forEach(function(asset) {
        this.getbetHistoryArray(asset)
      }, this);
  }

  timeConverter(UNIX_timestamp){
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = date + '/' + month + '/' + year + ' ' + hour + ':' + min;
    return time;
  }


  getbetHistoryArray(id) {
    const web3 = this.context.drizzle.web3
    const contractweb3 = new web3.eth.Contract(Football.abi, Football.address);
    var pricedata = [];
    contractweb3.getPastEvents(
      'BetRecord',
      {
        fromBlock: 6000123,
        toBlock: 'latest'
      }
    ).then(function(events) {

      events.forEach(function(element) {
        pricedata.push({
          Epoch: element.returnValues.epoch,
          time: element.returnValues.timestamp,
          BetSize: element.returnValues.betsize/1e15,
          LongPick: element.returnValues.pick,
          MatchNum: element.returnValues.matchnum,
          Payoff: element.returnValues.payoff/1e15,
          Hashoutput: element.returnValues.contractHash,
          BettorAddress: element.returnValues.bettor,
          })

    }, this);
      this.priceHistory[id] = pricedata
    }.bind(this))
  }


  openEtherscan() {
     const url = "https://rinkeby.etherscan.io/address/0xBA8f31a128f1CF6f1A50B87DAeee0AE1e1cf98f3";
    // new const url = "https://ropsten.etherscan.io/address/0xc9c61e5Ec1b7E7Af5Ccb91b6431733dE6d62cAC3#code";
    window.open(url, "_blank");
  }



  render() {




    if (Object.keys(this.priceHistory).length === 0)
      return (
        <Text size="20px" weight="200">Waiting...</Text>
        )
    else
    {
      return (
        <div>
            <IndicatorD
              className="etherscanLink"
              size="15px"
              mr="10px"
              mb="10px"
              ml="5px"
              mt="10px"
              width="360px"
              label="See Contract on"
              onClick={() => this.openEtherscan()}
              value="Etherscan"
            />
            {Object.keys(this.priceHistory).map(id => (
              <div key={id} style={{ width: "100%", float: "left" }}>
                <Text size="12px" weight="200">
                  {" "}
              Time, Epoch, MatchNum, LongPick, Betsize, Payoff, BettorAddress, betHash
                </Text>{" "}
                <br />

                {this.priceHistory[id].map((event, index) => (
                  <div key={index}>
                    <Text size="12px" weight="200">
                      {" "}
                      {moment.unix(event.time).format("DD-MM-YYTHH:mm")},{" "}
                      {event.Epoch},{" "}
                      {event.MatchNum},{" "}
                      {event.LongPick},{" "}
                      {(event.BetSize).toFixed(3)},{" "}
                      {(event.Payoff).toFixed(3)},{" "}
                      {event.BettorAddress},{" "}
                      {event.Hashoutput},{" "}
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


EventBetRecord.contextTypes = {
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

export default drizzleConnect(EventBetRecord, mapStateToProps)
