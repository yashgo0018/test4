import { drizzleConnect } from "@drizzle/react-plugin";
import React, { Children, Component } from "react";
import PropTypes from "prop-types";
import Football from "./contracts/solidityjson/Football.json";
import Testj from './contracts/solidityjson/Test.json';

/*
 * Create component.
 */

class CustomLoader extends Component {
  constructor(props, context) {
    super(props);
  }

  componentDidMount() {
    console.log(this.context);
    const drizz = this.context.drizzle;
    var FOOT0Config = {
      contractName: "FOOT0Swap",
      web3Contract: new drizz.web3.eth.Contract(
        Football.abi,
        "0x2E457D5da792b82435E1A260fFa91C3e49A35665"
      )
    };
    var FOOT1Config = {
      contractName: "FOOT1Swap",
      web3Contract: new drizz.web3.eth.Contract(
        Testj.abi,
        "0x7eD90B8E459025eCbf77d0Fa66Dc6F3132ECFd03"
      )
    };
    var FOOT2Config = {
      contractName: "FOOT2Swap",
      web3Contract: new drizz.web3.eth.Contract(
        Football.abi,
        "0x477eef0bfB13821F731f768e9ceb445C2C19fcDc"
      )
    };

    this.context.drizzle.addContract(FOOT0Config);
    this.context.drizzle.addContract(FOOT1Config);
    this.context.drizzle.addContract(FOOT2Config);
  }

  render() {
    if (this.props.web3.status === "failed") {
      if (this.props.errorComp) {
        return this.props.errorComp;
      }

      return (
        <main className="container loading-screen">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>⚠️</h1>
              <p>
                This browser has no connection to the Ethereum network. Please
                use the Chrome/FireFox extension MetaMask, or dedicated Ethereum
                browsers Mist or Parity.
              </p>
            </div>
          </div>
        </main>
      );
    }

    if (
      this.props.web3.status === "initialized" &&
      Object.keys(this.props.accounts).length === 0
    ) {
      return (
        <main className="container loading-screen">
          <div className="pure-g">
            <div className="pure-u-1-1">
              <h1>🦊</h1>
              <p>
                <strong>{"We can't find any Ethereum accounts!"}</strong> Please
                check and make sure Metamask or your browser are pointed at the
                correct network and your account is unlocked.
              </p>
            </div>
          </div>
        </main>
      );
    }

    if (
      this.props.drizzleStatus.initialized &&
      Object.keys(this.context.drizzle.contracts).length === 4
    ) {
      return Children.only(this.props.children);
    }

    if (this.props.loadingComp) {
      return this.props.loadingComp;
    }

    return (
      <main className="container loading-screen">
        <div className="pure-g">
          <div className="pure-u-1-1">
            <h1>⚙️</h1>
            <p>Loading dapp...</p>
          </div>
        </div>
      </main>
    );
  }
}

CustomLoader.contextTypes = {
  drizzle: PropTypes.object
};

CustomLoader.propTypes = {
  children: PropTypes.node,
  accounts: PropTypes.object.isRequired,
  drizzleStatus: PropTypes.object.isRequired,
  web3: PropTypes.object.isRequired,
  loadingComp: PropTypes.node,
  errorComp: PropTypes.node
};

/*
 * Export connected component.
 */

const mapStateToProps = state => {
  return {
    accounts: state.accounts,
    drizzleStatus: state.drizzleStatus,
    web3: state.web3
  };
};

export default drizzleConnect(CustomLoader, mapStateToProps);
