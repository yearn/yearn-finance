import { put, call, takeLatest, take, select, delay } from 'redux-saga/effects';
import { eventChannel, END } from 'redux-saga';

import vaultAbi from 'abi/yVault.json';
import backscratcherAbi from 'abi/backscratcher.json';
import veCrvAbi from 'abi/veCrv.json';
import vaultV2Abi from 'abi/v2Vault.json';
import v2EthZapAbi from 'abi/v2EthZapAbi.json';
import erc20Abi from 'abi/erc20.json';
import zapYveCrvAbi from 'abi/zapYveCrv.json';
import pickleJarAbi from 'abi/pickleJar.json';
import pickleJarAbi2 from 'abi/pickleJar2.json';
import masterChefAbi from 'abi/masterChef.json';
import zapViperAbi from 'abi/zapViper.json';

import { addContracts } from 'containers/DrizzleProvider/actions';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { selectVaults } from 'containers/App/selectors';
import KonamiCode from 'konami-code-js';
import runMatrix from 'utils/matrix';
import { unlockDevMode } from 'containers/DevMode/actions';
import { setThemeMode } from 'containers/ThemeProvider/actions';
import { DARK_MODE } from 'containers/ThemeProvider/constants';
import { TX_BROADCASTED } from 'containers/DrizzleProvider/constants';

import trustedMigratorAbi from 'abi/trustedMigrator.json';
import migrationWhitelist from 'containers/Vaults/migrationWhitelist.json';
import {
  TRUSTED_MIGRATOR_ADDRESS,
  ZAP_YVE_CRV_ETH_PICKLE_ADDRESS,
  V2_ETH_ZAP_ADDRESS,
  PICKLEJAR_ADDRESS,
  MASTER_CHEF_ADDRESS,
  MASTER_CHEFF_POOL_ID,
  VYPER_ADDRESS,
  THREECRV_ADDRESS,
  YVBOOST_ADDRESS,
  YVBOOST_ETH_PJAR,
} from 'containers/Vaults/constants';
import { processAdressesToUpdate } from '../../drizzle/store/contracts/contractsActions';
// import { websocketConnect } from 'middleware/websocket/actions';
import { APP_READY, APP_INITIALIZED, SPLASH_PAGE_VISITED } from './constants';

function* loadVaultContracts(clear) {
  const vaults = yield select(selectVaults());
  const v1Vaults = _.filter(vaults, (vault) => vault.type === 'v1');
  const v2Vaults = _.filter(vaults, (vault) => vault.type === 'v2');
  const v1VaultAddresses = _.map(v1Vaults, (vault) => vault.address);
  const v2VaultAddresses = _.map(v2Vaults, (vault) => vault.address);
  const account = yield select(selectAccount());

  const crvAddress = '0xD533a949740bb3306d119CC777fa900bA034cd52';
  const vaultTokenAddresses = _.map(vaults, (vault) => vault.token.address);
  vaultTokenAddresses.push(crvAddress);

  const backscratcherAddress = '0xc5bDdf9843308380375a611c18B50Fb9341f502A';
  const veCrvAddress = '0x5f3b5DfEb7B28CDbD7FAba78963EE202a494e2A2';
  const gaugeAddress = '0xF147b8125d2ef93FB6965Db97D6746952a133934';
  v2VaultAddresses.push(YVBOOST_ADDRESS);
  const contracts = [
    {
      namespace: 'veCrv',
      abi: veCrvAbi,
      addresses: [veCrvAddress],
      readMethods: [
        {
          name: 'balanceOf',
          args: [gaugeAddress],
        },
      ],
    },
    {
      namespace: 'vaults',
      tags: ['backscratcher'],
      abi: backscratcherAbi,
      allReadMethods: false,
      addresses: [backscratcherAddress],
      readMethods: [
        { name: 'bal' },
        {
          name: 'balanceOf',
          args: [account],
        },
        {
          name: 'index',
        },
        {
          name: 'supplyIndex',
          args: [account],
        },
        {
          name: 'claimable',
          args: [account],
        },
      ],
      writeMethods: [
        {
          name: 'deposit',
        },
        {
          name: 'claim',
        },
      ],
    },
    {
      namespace: 'vaults',
      metadata: {
        version: '1',
      },
      abi: vaultAbi,
      allReadMethods: false,
      addresses: v1VaultAddresses,
      readMethods: [
        {
          name: 'name',
          constant: true,
        },
        { name: 'balance' },
        {
          name: 'balanceOf',
          args: [account],
        },
        { name: 'getPricePerFullShare' },
      ],
      writeMethods: [
        {
          name: 'withdraw',
        },
        {
          name: 'deposit',
        },
        {
          name: 'withdrawAll',
        },
      ],
    },
    {
      namespace: 'vaults',
      metadata: {
        version: '2',
      },
      abi: vaultV2Abi,
      allReadMethods: false,
      addresses: v2VaultAddresses,
      readMethods: [
        {
          name: 'name',
          constant: true,
        },
        { name: 'totalAssets' },
        {
          name: 'balanceOf',
          args: [account],
        },
        { name: 'pricePerShare' },
        { name: 'depositLimit' },
      ],
      writeMethods: [
        {
          name: 'withdraw',
        },
        {
          name: 'deposit',
        },
      ],
    },
    {
      namespace: 'tokens',
      abi: erc20Abi,
      allReadMethods: false,
      syncOnce: true, // Additional syncs will be performed by watching logs
      addresses: vaultTokenAddresses,
      readMethods: [
        {
          name: 'balanceOf',
          args: [account],
        },
      ],
    },
  ];

  const generateVaultTokenAllowanceSubscriptions = (vault) => {
    const vaultAddress = vault.address;
    const { token } = vault;
    const tokenAddress = token.address;
    if (!tokenAddress) {
      console.log('Vault error', vault);
    }
    return {
      namespace: 'tokens',
      abi: erc20Abi,
      syncOnce: true,
      addresses: [tokenAddress],
      readMethods: [
        {
          name: 'allowance',
          args: [account, vaultAddress],
        },
      ],
    };
  };

  function getZapSubscriptions() {
    const zapViperSubscription = {
      namespace: 'zap',
      abi: zapViperAbi,
      addresses: [VYPER_ADDRESS],
      writeMethods: [
        {
          name: 'zap',
        },
      ],
    };
    const zapYveCrvSubscription = {
      namespace: 'zap',
      abi: zapYveCrvAbi,
      addresses: [ZAP_YVE_CRV_ETH_PICKLE_ADDRESS],
      writeMethods: [
        {
          name: 'zapInETH',
        },
        {
          name: 'zapInCRV',
        },
      ],
    };
    const eth2ZapSubscription = {
      namespace: 'zap',
      abi: v2EthZapAbi,
      addresses: [V2_ETH_ZAP_ADDRESS],
      readMethods: [
        {
          name: 'weth',
          args: [],
        },
      ],
      writeMethods: [
        {
          name: 'depositETH',
        },
      ],
    };

    return [zapViperSubscription, zapYveCrvSubscription, eth2ZapSubscription];
  }

  // const localSubscriptions = [
  //   {
  //     namespace: 'localContracts',
  //     tags: ['localContracts'],
  //     addresses: localContracts,
  //     allWriteMethods: true,
  //     allReadMethods: true,
  //     readMethods: [
  //       {
  //         name: 'balanceOf',
  //         args: [account],
  //       },
  //     ],
  //   },
  // ];

  const vaultTokenAllowanceSubscriptions = _.map(
    vaults,
    generateVaultTokenAllowanceSubscriptions,
  );

  const backscratcherAllowanceSubscription = {
    namespace: 'tokens',
    abi: erc20Abi,
    syncOnce: true,
    addresses: [crvAddress],
    readMethods: [
      {
        name: 'allowance',
        args: [account, backscratcherAddress],
      },
      {
        name: 'allowance',
        args: [account, ZAP_YVE_CRV_ETH_PICKLE_ADDRESS],
      },
    ],
  };

  const threeCrvAllowanceSubscription = {
    namespace: 'tokens',
    abi: erc20Abi,
    syncOnce: true,
    addresses: [THREECRV_ADDRESS],
    readMethods: [
      {
        name: 'allowance',
        args: [account, VYPER_ADDRESS],
      },
    ],
  };

  const pickleJarSubscription = {
    namespace: 'picklejar',
    abi: pickleJarAbi,
    addresses: [PICKLEJAR_ADDRESS],
    readMethods: [
      {
        name: 'balanceOf',
        args: [account],
      },
      {
        name: 'allowance',
        args: [account, MASTER_CHEF_ADDRESS],
      },
    ],
  };

  const pickleJar2Subscription = {
    namespace: 'picklejar2',
    abi: pickleJarAbi2,
    tags: ['pickle2'],
    addresses: [YVBOOST_ETH_PJAR],
    readMethods: [
      {
        name: 'balanceOf',
        args: [account],
      },
      {
        name: 'allowance',
        args: [account, MASTER_CHEF_ADDRESS],
      },
    ],
  };

  const masterChefSubscription = {
    namespace: 'masterchef',
    abi: masterChefAbi,
    addresses: [MASTER_CHEF_ADDRESS],
    readMethods: [
      {
        name: 'userInfo',
        args: [MASTER_CHEFF_POOL_ID, account],
      },
    ],
    writeMethods: [
      {
        name: 'deposit',
      },
    ],
  };

  const trustedMigratorSubscriptions = getTrustedMigratorSubscriptions(account);
  const zapSubscriptions = getZapSubscriptions();

  contracts.push(pickleJarSubscription);
  contracts.push(pickleJar2Subscription);
  contracts.push(masterChefSubscription);
  contracts.push(...zapSubscriptions);
  contracts.push(...trustedMigratorSubscriptions);
  contracts.push(...vaultTokenAllowanceSubscriptions);
  contracts.push(backscratcherAllowanceSubscription);
  contracts.push(threeCrvAllowanceSubscription);
  yield put(addContracts(contracts, clear));
}

function getTrustedMigratorSubscriptions(account) {
  const trustedMigratorSubscription = {
    namespace: 'trustedMigrator',
    abi: trustedMigratorAbi,
    addresses: [TRUSTED_MIGRATOR_ADDRESS],
    writeMethods: [
      {
        name: 'migrateAll',
      },
    ],
  };

  const allowanceSubscription = getAllowanceSubscription(
    'vaults',
    'trustedMigratorVaults',
    migrationWhitelist.map(({ vaultFrom }) => vaultFrom),
    account,
    TRUSTED_MIGRATOR_ADDRESS,
  );

  return [trustedMigratorSubscription, allowanceSubscription];
}

const getAllowanceSubscription = (
  namespace,
  tag,
  tokenAddresses,
  accountAddress,
  spenderAddress,
) => ({
  namespace,
  tags: [tag],
  abi: erc20Abi,
  addresses: tokenAddresses,
  readMethods: [
    {
      name: 'allowance',
      args: [accountAddress, spenderAddress],
    },
  ],
});

function konamiWatcher() {
  return eventChannel((emitter) => {
    KonamiCode(() => emitter(0));
    return () => {};
  });
}

function* startKonamiWatcher() {
  const chan = yield call(konamiWatcher);
  while (true) {
    yield take(chan);
    yield put(unlockDevMode());
    yield put(setThemeMode(DARK_MODE));
    runMatrix();
  }
}

function checkTx(notifyEmitter) {
  return eventChannel((emitter) => {
    notifyEmitter.on('all', (transaction) => {
      if (transaction.status === 'confirmed') {
        emitter(END);
      }
    });
    return () => {};
  });
}

function* watchTransactions(action) {
  const { notify, txHash, contractAddress } = action;
  const { emitter } = notify.hash(txHash);

  const chan = yield call(checkTx, emitter);
  try {
    while (true) {
      yield take(chan);
    }
  } finally {
    yield delay(6000);
    yield put(processAdressesToUpdate(contractAddress));
  }
}

// function* connectWebsocket() {
//   yield put(websocketConnect());
// }

function* accountUpdated() {
  const account = yield select(selectAccount());
  const oldAccount = localStorage.getItem('account');
  if (oldAccount && oldAccount !== account) {
    yield loadVaultContracts(true);
  }
  localStorage.setItem('account', account);
}

function* updateLastSplashVisit() {
  localStorage.setItem('lastSplashVisit', new Date(Date.now()).toISOString());
}

export default function* initialize() {
  yield takeLatest(APP_READY, loadVaultContracts);
  yield takeLatest(TX_BROADCASTED, watchTransactions);
  // yield takeLatest(APP_INITIALIZED, connectWebsocket);
  yield takeLatest('ACCOUNT_UPDATED', accountUpdated);
  yield takeLatest(APP_INITIALIZED, startKonamiWatcher);
  yield takeLatest(SPLASH_PAGE_VISITED, updateLastSplashVisit);
}
