// constants
import Web3EthContract from "web3-eth-contract";
import Web3 from "web3";
// log
import { fetchData } from "../data/dataActions";

import detectEthereumProvider from '@metamask/detect-provider'

async function provide (){
  var provider = await detectEthereumProvider()

    if (provider) {
      var { ethereum } = window;
      console.log(ethereum);
      
      console.log('Ethereum successfully detected!', provider)
    
      // From now on, this should always be true:
      // provider === window.ethereum
    
      // Access the decentralized web!
    
      // Legacy providers may only have ethereum.sendAsync
      const chainId = await provider.request({
        method: 'eth_chainId'
      })
      console.log(chainId)
      return provider;
    } else {
    
      // if the provider is not detected, detectEthereumProvider resolves to null
      console.error('Please install MetaMask!', error)
      return ethereum;
    }
    }
//provide();


const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

const updateAccountRequest = (payload) => {
  return {
    type: "UPDATE_ACCOUNT",
    payload: payload,
  };
};

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    const abiResponse = await fetch("/config/abi.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const abi = await abiResponse.json();
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const CONFIG = await configResponse.json();

    var { ethereum } = window;
    //var ethereum = await provide();

    console.log(ethereum)
    if (ethereum) {
      handleEthereum();
    } else {
      window.addEventListener('ethereum#initialized', handleEthereum, {
        once: true,
      });
    
      // If the event is not dispatched by the end of the timeout,
      // the user probably doesn't have MetaMask installed.
      setTimeout(handleEthereum, 3000); // 3 seconds
    }
    
    async function handleEthereum() {
      const { ethereum } = window;
      if (ethereum && ethereum.isMetaMask) {
        console.log('Ethereum successfully detected!');
        // Access the decentralized web!
        const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    if (metamaskIsInstalled) {
      Web3EthContract.setProvider(ethereum);
      let web3 = new Web3(ethereum);
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        const networkId = await ethereum.request({
          method: "net_version",
        });
        if (networkId == CONFIG.NETWORK.ID) {
          const SmartContractObj = new Web3EthContract(
            abi,
            CONFIG.CONTRACT_ADDRESS
          );
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: SmartContractObj,
              web3: web3,
            })
          );
          // Add listeners start
          ethereum.on("accountsChanged", (accounts) => {
            dispatch(updateAccount(accounts[0]));
          });
          ethereum.on("chainChanged", () => {
            window.location.reload();
          });
          // Add listeners end
        } else {
          dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
        }
      } catch (err) {
        dispatch(connectFailed("Something went wrong."));
      }
    }
      } else {
        console.log('Please install MetaMask!');
      }
    }

/*     const metamaskIsInstalled = ethereum && ethereum.isMetaMask;
    if (metamaskIsInstalled) {
      Web3EthContract.setProvider(ethereum);
      let web3 = new Web3(ethereum);
      try {
        const accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        const networkId = await ethereum.request({
          method: "net_version",
        });
        if (networkId == CONFIG.NETWORK.ID) {
          const SmartContractObj = new Web3EthContract(
            abi,
            CONFIG.CONTRACT_ADDRESS
          );
          dispatch(
            connectSuccess({
              account: accounts[0],
              smartContract: SmartContractObj,
              web3: web3,
            })
          );
          // Add listeners start
          ethereum.on("accountsChanged", (accounts) => {
            dispatch(updateAccount(accounts[0]));
          });
          ethereum.on("chainChanged", () => {
            window.location.reload();
          });
          // Add listeners end
        } else {
          dispatch(connectFailed(`Change network to ${CONFIG.NETWORK.NAME}.`));
        }
      } catch (err) {
        dispatch(connectFailed("Something went wrong."));
      }
    } else {
      dispatch(connectFailed("Install Metamask."));
    } */
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
