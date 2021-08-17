/* eslint-disable no-plusplus */
import request from 'utils/request';

const GASPRICES_API = 'https://api.blocknative.com/gasprices/blockprices';
const HEADERS = {
  Authorization: process.env.BLOCKNATIVE_DAPP_ID,
};
const DEFAULT_CONFIDENCE_LEVEL = 95;

class DrizzleContract {
  constructor(
    web3Contract,
    web3,
    name,
    store,
    events = [],
    contractArtifact = {},
    metadata,
    tags,
    readMethods,
    writeMethods,
  ) {
    this.abi = web3Contract.options.jsonInterface;
    this.address = web3Contract.options.address;
    this.web3 = web3;
    this.contractName = name;
    this.contractArtifact = contractArtifact;
    this.store = store;
    this.metadata = metadata;
    this.tags = tags;
    this.readMethods = readMethods;
    this.writeMethods = writeMethods;

    // Merge web3 contract instance into DrizzleContract instance.
    Object.assign(this, web3Contract);

    for (let i = 0; i < this.abi.length; i++) {
      const item = this.abi[i];

      if (item.type === 'function' && !item.constant) {
        this.methods[item.name].cacheSend = this.cacheSendFunction(
          item.name,
          i,
        );
      }
    }

    // Register event listeners if any events.
    if (events.length > 0) {
      for (let i = 0; i < events.length; i++) {
        const event = events[i];

        if (typeof event === 'object') {
          store.dispatch({
            type: 'LISTEN_FOR_EVENT',
            contract: this,
            eventName: event.eventName,
            eventOptions: event.eventOptions,
          });
        } else {
          store.dispatch({
            type: 'LISTEN_FOR_EVENT',
            contract: this,
            eventName: event,
          });
        }
      }
    }
  }

  cacheSendFunction(fnName, fnIndex) {
    const contract = this;
    const { web3 } = this;
    return async function test(...args) {
      const newArgs = args;
      contract.store.dispatch({
        type: 'SEND_CONTRACT_TX',
        contract,
        fnName,
        fnIndex,
        args,
      });

      let sendArgs;
      if (newArgs.length) {
        sendArgs = _.last(newArgs);
        if (newArgs.length > 1) {
          delete newArgs[args.length - 1];
        } else {
          delete newArgs[0];
        }
        newArgs.length -= 1;
      }
      const call = contract.methods[fnName](...newArgs);
      let persistTxHash;

      const gasPrice = await web3.eth.getGasPrice();
      let estimatedPrice;
      try {
        const response = await request(GASPRICES_API, { headers: HEADERS });
        estimatedPrice = _.first(response.blockPrices).estimatedPrices.find(
          ({ confidence }) => confidence === DEFAULT_CONFIDENCE_LEVEL,
        );
      } catch (error) {
        console.log(error);
      }
      if (estimatedPrice) {
        delete sendArgs.gasPrice;
        sendArgs.maxPriorityFeePerGas = web3.utils.toWei(
          estimatedPrice.maxPriorityFeePerGas.toString(),
          'gwei',
        );
        sendArgs.maxFeePerGas = web3.utils.toWei(
          estimatedPrice.maxFeePerGas.toString(),
          'gwei',
        );
      }

      const sendTx = (txCall) =>
        txCall
          .send(sendArgs)
          .on('transactionHash', (txHash) => {
            persistTxHash = txHash;
            contract.store.dispatch({
              type: 'TX_BROADCASTED',
              txHash,
              contractAddress: contract.address,
            });
          })
          .on('confirmation', (confirmationNumber, receipt) => {
            contract.store.dispatch({
              type: 'TX_CONFIRMAITON',
              confirmationReceipt: receipt,
              txHash: persistTxHash,
            });
            return Promise.resolve();
          })
          .on('receipt', (receipt) => {
            contract.store.dispatch({
              type: 'TX_SUCCESSFUL',
              receipt,
              txHash: persistTxHash,
              contractAddress: contract.address,
            });
          })
          .on('error', (error) => {
            contract.store.dispatch({
              type: 'TX_ERROR',
              error,
            });
          });

      return sendTx(call).catch((error) => {
        // Retry as a legacy tx, for specific error in metamask v10 + ledger transactions
        // Metamask RPC Error: Invalid transaction params: params specify an EIP-1559 transaction but the current network does not support EIP-1559
        if (error.code === -32602) {
          delete sendArgs.maxPriorityFeePerGas;
          delete sendArgs.maxFeePerGas;
          sendArgs.gasPrice = estimatedPrice
            ? web3.utils.toWei(estimatedPrice.price.toString(), 'gwei')
            : gasPrice;
          return sendTx(call);
        }

        return Promise.reject(error);
      });
    };
  }
}

export default DrizzleContract;
