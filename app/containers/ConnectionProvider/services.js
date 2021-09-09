import Onboard from 'bnc-onboard';
import Notify from 'bnc-notify';

const networkId = 1;
const rpcUrl =
  localStorage.getItem('WEB3_PROVIDER_HTTPS') ||
  process.env.WEB3_PROVIDER_HTTPS;
const dappId = process.env.BLOCKNATIVE_DAPP_ID;
const portisKey = process.env.PORTIS_APIKEY;
const fortmaticKey = process.env.FORTMATIC_APIKEY;
const appName = 'Yearn Finance';
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
        { walletName: 'detectedwallet' },
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
          appName,
          rpcUrl,
        },
        { walletName: 'walletLink', rpcUrl },
        {
          walletName: 'portis',
          apiKey: portisKey,
        },
        { walletName: 'fortmatic', apiKey: fortmaticKey },
        { walletName: 'torus' },
        { walletName: 'authereum', disableNotifications: true },
        { walletName: 'trust', rpcUrl },
        { walletName: 'opera' },
        { walletName: 'operaTouch' },
        { walletName: 'imToken', rpcUrl },
        { walletName: 'meetone' },
        { walletName: 'gnosis' },
        {
          walletName: 'keystone',
          rpcUrl,
          appName,
        },
        { walletName: 'liquality' },
        {
          walletName: 'mewwallet',
          rpcUrl,
        },
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
