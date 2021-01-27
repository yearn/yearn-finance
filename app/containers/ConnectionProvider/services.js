import Onboard from 'bnc-onboard';
import Notify from 'bnc-notify';

const networkId = 1;
const {
  WEB3_PROVIDER_HTTPS: rpcUrl,
  BLOCKNATIVE_DAPP_ID: dappId,
  PORTIS_APIKEY,
  FORTMATIC_APIKEY,
} = process.env;
// const apiUrl = 'wss://api.blocknative.com/v0';

export function initOnboard(subscriptions, darkMode) {
  return Onboard({
    dappId,
    hideBranding: true,
    networkId,
    darkMode,
    subscriptions,
    walletSelect: {
      wallets: [
        { walletName: 'metamask' },
        {
          walletName: 'walletConnect',
          rpc: {
            1: rpcUrl,
          },
        },
        {
          walletName: 'trezor',
          appUrl: 'https://reactdemo.blocknative.com',
          email: 'aaron@blocknative.com',
          rpcUrl,
        },
        {
          walletName: 'ledger',
          rpcUrl,
        },
        { walletName: 'coinbase' },
        { walletName: 'status' },
        {
          walletName: 'lattice',
          appName: 'Yearn Finance',
          rpcUrl,
        },
        { walletName: 'walletLink', rpcUrl },
        {
          walletName: 'portis',
          apiKey: PORTIS_APIKEY,
        },
        { walletName: 'fortmatic', apiKey: FORTMATIC_APIKEY },
        { walletName: 'torus' },
        { walletName: 'authereum', disableNotifications: true },
        { walletName: 'trust', rpcUrl },
        { walletName: 'opera' },
        { walletName: 'operaTouch' },
        { walletName: 'imToken', rpcUrl },
        { walletName: 'meetone' },
      ],
    },
    walletCheck: [
      { checkName: 'derivationPath' },
      { checkName: 'connect' },
      { checkName: 'accounts' },
      { checkName: 'network' },
    ],
  });
}

export function initNotify(darkMode) {
  return Notify({
    dappId,
    networkId,
    darkMode,
    desktopPosition: 'topRight',
  });
}
