import React, { Component } from 'react'
import { drizzleConnect } from '@drizzle/react-plugin'
import PropTypes from 'prop-types'
import { autoBind } from 'react-extras'
import Text from '../basics/Text'
import IndicatorD from "../basics/IndicatorD"
import Football from '../../contracts/solidityjson/Football.json'
import moment from 'moment';

class EventGameoutcomes extends Component {
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
    document.title = 'Match Result Event Logs';
    Object.keys(this.assets).forEach(function (asset) {
      this.getgameHistoryArray(asset)
    }, this);
  }


  timeConverter(UNIX_timestamp) {
    var a = new Date(UNIX_timestamp * 1000);
    var year = a.getFullYear();
    var month = a.getMonth();
    var date = a.getDate();
    var hour = a.getHours();
    var min = a.getMinutes();
    var sec = a.getSeconds();
    var time = `${date}/${month}/${year} ${hour}:${min}:${sec}`;
    return time;
  }

  translateOutcome(x) {
    if (x === "0") {
      return "tie"
    } else if (x === "1") {
      return "Home"
    } else {
      return "Away"
    }
  }

  getgameHistoryArray(id) {
    const web3 = this.context.drizzle.web3
    const contractweb3 = new web3.eth.Contract(Football.abi, Football.address);
    var pricedata = [];
    contractweb3.getPastEvents(
      'ResultsPosted',
      {
        fromBlock: 6000123,
        toBlock: 'latest'
      }
    ).then(function (events) {

      events.forEach(function (element) {
        pricedata.push({
          timestamp: element.returnValues.timestamp,
          outcome: element.returnValues.winner,
          Epoch: element.returnValues.epoch
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
    else {
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
          {Object.keys(this.priceHistory).map((id) => (
            <div key={id} style={{ width: "100%", float: "left" }}>
              <Text size="12px" weight="200">
                {" "}
                    Time, Week: match0, match1, match2, match3, match4, match5, match6, match7, match8, match9,
                    match10, match11, match12, match13, match14, match15
                  </Text>{" "}
              <br />
              {this.priceHistory[id].map((event, index) => (
                <div key={index}>
                  <Text size="12px" weight="200">
                    {" "}
                    {moment.unix(event.timestamp).format("DD-MM-YYTHH:mm")},{" "}
                    {event.Epoch} {": "} {this.translateOutcome(event.outcome[0])},{" "}
                    {this.translateOutcome(event.outcome[1])}, {this.translateOutcome(event.outcome[2])},{" "}
                    {this.translateOutcome(event.outcome[3])}, {this.translateOutcome(event.outcome[4])},{" "}
                    {this.translateOutcome(event.outcome[5])}, {this.translateOutcome(event.outcome[6])},{" "}
                    {this.translateOutcome(event.outcome[7])}, {this.translateOutcome(event.outcome[8])},{" "}
                    {this.translateOutcome(event.outcome[9])}, {this.translateOutcome(event.outcome[10])},{" "}
                    {this.translateOutcome(event.outcome[11])}, {this.translateOutcome(event.outcome[12])},{" "}
                    {this.translateOutcome(event.outcome[13])}, {this.translateOutcome(event.outcome[14])},{" "}
                    {this.translateOutcome(event.outcome[15])}
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


EventGameoutcomes.contextTypes = {
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

export default drizzleConnect(EventGameoutcomes, mapStateToProps)
