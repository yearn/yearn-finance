import BigNumber from 'bignumber.js';
import { keyBy, get } from 'lodash';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { selectMigrationData } from 'containers/Vaults/selectors';
import blacklist from 'containers/Vaults/blacklist.json';
import { approveTxSpend } from 'utils/contracts';
import request from 'utils/request';
import { APP_INITIALIZED } from 'containers/App/constants';
import { ACCOUNT_UPDATED } from 'containers/ConnectionProvider/constants';
import { call, put, takeLatest, select, all, take } from 'redux-saga/effects';
import {
  selectSelectedAccount,
  selectVaults,
  selectTokenAllowance,
  selectContractData,
} from 'containers/App/selectors';
import { MAX_UINT256 } from 'containers/Cover/constants';
import { vaultsLoaded, userVaultStatisticsLoaded } from './actions';
import {
  VAULTS_LOADED,
  WITHDRAW_FROM_VAULT,
  WITHDRAW_ALL_FROM_VAULT,
  DEPOSIT_TO_VAULT,
  CLAIM_BACKSCRATCHER_REWARDS,
  RESTAKE_BACKSCRATCHER_REWARDS,
  MIGRATE_VAULT,
  TRUSTED_MIGRATOR_ADDRESS,
  ZAP_PICKLE,
  DEPOSIT_PICKLE_SLP_IN_FARM,
  EXIT_OLD_PICKLE,
} from './constants';
// TODO: Do better... never hard-code vault addresses
const crvAaveAddress = '0x03403154afc09Ce8e44C3B185C82C6aD5f86b9ab';
const crvSAaveV2Address = '0xb4D1Be44BfF40ad6e506edf43156577a3f8672eC';
const crvSAaveV1Address = '0xBacB69571323575C6a5A3b4F9EEde1DC7D31FBc1';

const YVBOOST = '0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a';
const YVUNI = '0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42';

const mapNewApiToOldApi = (oldVaults, newVaults) => {
  const newVaultsMap = keyBy(newVaults, 'address');
  const result = oldVaults.map((vault) => {
    const newApy = get(newVaultsMap[vault.address], 'apy');
    // TODO: FIX YVBOOST AND YVUNI ON NEW API
    if (!newApy || vault.address === YVBOOST || vault.address === YVUNI) {
      return vault;
    }

    const vaultApy = _.get(vault, 'apy', {});
    const vaultApyData = _.get(vault, 'apy.data', {});
    const mergedVault = {
      ...vault,
      apy: {
        ...vaultApy,
        recommended: newApy.net_apy,
        error: newApy.error,
        type: newApy.type,
        data: {
          ...vaultApyData,
          grossApy: newApy.gross_apr,
          netApy: newApy.net_apy,
          ...(newApy.composite && {
            totalApy: newApy.gross_apr,
            currentBoost: newApy.composite.boost
              ? newApy.composite.boost
              : newApy.composite.currentBoost,
            poolApy: newApy.composite.pool_apy
              ? newApy.composite.pool_apy
              : newApy.composite.poolApy,
            boostedApr: newApy.composite.boosted_apr
              ? newApy.composite.boosted_apr
              : newApy.composite.boostedApy,
            baseApr: newApy.composite.base_apr
              ? newApy.composite.base_apr
              : newApy.composite.baseApr,
            cvx_apr: newApy.composite.cvx_apr,
            tokenRewardsApr: newApy.composite.rewards_apr,
          }),
        },
      },
    };
    return mergedVault;
  });
  return result;
};

function* fetchVaults() {
  const endpoint =
    process.env.API_ENV === 'development' ||
    process.env.NODE_ENV === 'development'
      ? `https://dev.vaults.finance/all`
      : `https://vaults.finance/all`;
  const newEndpoint = 'https://api.yearn.finance/v1/chains/1/vaults/all';
  try {
    const vaults = yield call(request, endpoint);
    const newVaults = [
      {
        inception: 10830536,
        address: '0xbD17B1ce622d73bD438b9E658acA5996dc394b0d',
        symbol: 'pSLP',
        name: 'pickling SushiSwap LP Token',
        display_name: 'yveCRV - ETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xbD17B1ce622d73bD438b9E658acA5996dc394b0d/logo-128.png',
        token: {
          name: 'pickling SushiSwap LP Token',
          symbol: 'pSLP',
          address: '0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48',
          decimals: 18,
          display_name: 'yveCRV - ETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5Eff6d166D66BacBC1BF52E2C54dD391AE6b1f48/logo-128.png',
        },
        tvl: { total_assets: 0, price: 0, tvl: 1074221.5 },
        apy: {
          type: 'yvecrv-jar',
          gross_apr: 0.1263,
          net_apy: 0.1263,
          fees: {
            performance: null,
            withdrawal: null,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: { week_ago: 0.1042, month_ago: 0.1263, inception: 0.1263 },
          composite: null,
        },
        fees: {
          performance: null,
          withdrawal: null,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032661,
        special: true,
      },
      {
        inception: 11196772,
        address: '0xc5bDdf9843308380375a611c18B50Fb9341f502A',
        symbol: 'yveCRV-DAO',
        name: 'yveCRV',
        display_name: 'CRV',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xc5bDdf9843308380375a611c18B50Fb9341f502A/logo-128.png',
        token: {
          name: 'Curve DAO Token',
          symbol: 'CRV',
          address: '0xD533a949740bb3306d119CC777fa900bA034cd52',
          decimals: 18,
          display_name: 'CRV',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xD533a949740bb3306d119CC777fa900bA034cd52/logo-128.png',
        },
        tvl: {
          total_assets: 12818649680365399010619456,
          price: 1.9893904381147454,
          tvl: 25501299.103661563,
        },
        apy: {
          type: 'backscratcher',
          gross_apr: 0.18454599350269055,
          net_apy: 0.18454599350269055,
          fees: {
            performance: null,
            withdrawal: null,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: null,
          composite: {
            currentBoost: 1.9394357848388164,
            boostedApy: 0.35791510374774976,
            totalApy: 0.35791510374774976,
            poolApy: 0.18454599350269055,
            baseApy: 0.18454599350269055,
          },
        },
        fees: {
          performance: null,
          withdrawal: null,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032661,
        special: true,
      },
      {
        inception: 10599617,
        address: '0x29E240CFD7946BA20895a7a02eDb25C210f9f324',
        symbol: 'yaLINK',
        name: 'aLINK',
        display_name: 'aLINK',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x29E240CFD7946BA20895a7a02eDb25C210f9f324/logo-128.png',
        token: {
          name: 'Aave Interest bearing LINK',
          symbol: 'aLINK',
          address: '0xA64BD6C70Cb9051F6A9ba1F163Fdc07E0DfB5F84',
          decimals: 18,
          display_name: 'aLINK',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xA64BD6C70Cb9051F6A9ba1F163Fdc07E0DfB5F84/logo-128.png',
        },
        tvl: { total_assets: 136136755391554999063484, price: null, tvl: null },
        apy: {
          type: 'v1:simple',
          gross_apr: 0.00015680236666071323,
          net_apy: 0.00015681442433943408,
          fees: {
            performance: 0.0,
            withdrawal: 0,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.00013623317091520233,
            month_ago: 0.00015681442433943408,
            inception: 0.07120602876455848,
          },
          composite: null,
        },
        fees: {
          performance: 0.0,
          withdrawal: 0,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x25fAcA21dd2Ad7eDB3a027d543e617496820d8d6',
            name: 'StrategyVaultUSDC',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032661,
        special: false,
      },
      {
        inception: 10604016,
        address: '0x881b06da56BB5675c54E4Ed311c21E54C5025298',
        symbol: 'yLINK',
        name: 'LINK',
        display_name: 'LINK',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x881b06da56BB5675c54E4Ed311c21E54C5025298/logo-128.png',
        token: {
          name: 'ChainLink Token',
          symbol: 'LINK',
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
          decimals: 18,
          display_name: 'LINK',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo-128.png',
        },
        tvl: {
          total_assets: 5598826943951512548884,
          price: 21.45119645,
          tvl: 120101.53666425706,
        },
        apy: {
          type: 'v1:simple',
          gross_apr: -0.048826292008342875,
          net_apy: -0.047675298663154814,
          fees: {
            performance: 0.0,
            withdrawal: 0,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: -0.1904969108816244,
            month_ago: -0.047675298663154814,
            inception: 0.027587802008435258,
          },
          composite: null,
        },
        fees: {
          performance: 0.0,
          withdrawal: 0,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x25fAcA21dd2Ad7eDB3a027d543e617496820d8d6',
            name: 'StrategyVaultUSDC',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032661,
        special: false,
      },
      {
        inception: 10532708,
        address: '0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e',
        symbol: 'yUSDC',
        name: 'USDC',
        display_name: 'USDC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x597aD1e0c13Bfe8025993D9e79C69E1c0233522e/logo-128.png',
        token: {
          name: 'USD Coin',
          symbol: 'USDC',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          display_name: 'USDC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo-128.png',
        },
        tvl: { total_assets: 14246532354248, price: 1, tvl: 14246532.354248 },
        apy: {
          type: 'v1:simple',
          gross_apr: 0.016883343071452117,
          net_apy: 0.013596523965102318,
          fees: {
            performance: 0.2,
            withdrawal: 50,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.004285553327477839,
            month_ago: 0.013596523965102318,
            inception: 0.1189896041687808,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: 50,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x4f2fdebE0dF5C92EEe77Ff902512d725F6dfE65c',
            name: 'StrategyUSDC3pool',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 6,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032661,
        special: false,
      },
      {
        inception: 10559448,
        address: '0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c',
        symbol: 'yyDAI+yUSDC+yUSDT+yTUSD',
        name: 'curve.fi/y',
        display_name: 'yCRV',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5dbcF33D8c2E976c6b560249878e6F1491Bca25c/logo-128.png',
        token: {
          name: 'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
          symbol: 'yDAI+yUSDC+yUSDT+yTUSD',
          address: '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8',
          decimals: 18,
          display_name: 'yCRV',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8/logo-128.png',
        },
        tvl: {
          total_assets: 10887547394764176204848784,
          price: 1.110661730319143,
          tvl: 12092382.228400458,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.06738334313948924,
          net_apy: 0.06467488832785873,
          fees: {
            performance: 0.1,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.03664798877408848,
            boosted_apr: 0.02964878598929948,
            base_apr: 0.011859514395719792,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.1,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x07DB4B9b3951094B9E278D336aDf46a036295DE7',
            name: 'StrategyCurveYVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032662,
        special: false,
      },
      {
        inception: 10603368,
        address: '0x37d19d1c4E1fa9DC47bD1eA12f742a0887eDa74a',
        symbol: 'yTUSD',
        name: 'TUSD',
        display_name: 'TUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x37d19d1c4E1fa9DC47bD1eA12f742a0887eDa74a/logo-128.png',
        token: {
          name: 'TrueUSD',
          symbol: 'TUSD',
          address: '0x0000000000085d4780B73119b644AE5ecd22b376',
          decimals: 18,
          display_name: 'TUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x0000000000085d4780B73119b644AE5ecd22b376/logo-128.png',
        },
        tvl: {
          total_assets: 2836077001776086233695167,
          price: 1,
          tvl: 2836077.001776086,
        },
        apy: {
          type: 'v1:simple',
          gross_apr: 0.03650272285599776,
          net_apy: 0.02962430334495635,
          fees: {
            performance: 0.2,
            withdrawal: 50,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.028768346307672592,
            month_ago: 0.02962430334495635,
            inception: 0.1598460861447897,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: 50,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x4BA03330338172fEbEb0050Be6940c6e7f9c91b0',
            name: 'StrategyTUSDypool',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032662,
        special: false,
      },
      {
        inception: 10650116,
        address: '0xACd43E627e64355f1861cEC6d3a6688B31a6F952',
        symbol: 'yDAI',
        name: 'DAI',
        display_name: 'DAI',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xACd43E627e64355f1861cEC6d3a6688B31a6F952/logo-128.png',
        token: {
          name: 'Dai Stablecoin',
          symbol: 'DAI',
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          decimals: 18,
          display_name: 'DAI',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo-128.png',
        },
        tvl: {
          total_assets: 5858179320382047361983270,
          price: 1,
          tvl: 5858179.320382047,
        },
        apy: {
          type: 'v1:simple',
          gross_apr: 0.021192503751761294,
          net_apy: 0.017095727297564166,
          fees: {
            performance: 0.2,
            withdrawal: 50,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.005217264176141829,
            month_ago: 0.017095727297564166,
            inception: 0.17902996831523235,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: 50,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x2F90c531857a2086669520e772E9d433BbfD5496',
            name: 'StrategyDAI3pool',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032662,
        special: false,
      },
      {
        inception: 10651402,
        address: '0x2f08119C6f07c006695E079AAFc638b8789FAf18',
        symbol: 'yUSDT',
        name: 'USDT',
        display_name: 'USDT',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x2f08119C6f07c006695E079AAFc638b8789FAf18/logo-128.png',
        token: {
          name: 'Tether USD',
          symbol: 'USDT',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          decimals: 6,
          display_name: 'USDT',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo-128.png',
        },
        tvl: { total_assets: 8455873922162, price: 1, tvl: 8455873.922162 },
        apy: {
          type: 'v1:simple',
          gross_apr: 0.021982446794286403,
          net_apy: 0.017738475058348937,
          fees: {
            performance: 0.2,
            withdrawal: 50,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0036520721932502887,
            month_ago: 0.017738475058348937,
            inception: 0.11630436818423469,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: 50,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0xAa12d6c9d680EAfA48D8c1ECba3FCF1753940A12',
            name: 'StrategyUSDT3pool',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 6,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032662,
        special: false,
      },
      {
        inception: 10690968,
        address: '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1',
        symbol: 'yYFI',
        name: 'YFI',
        display_name: 'YFI',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1/logo-128.png',
        token: {
          name: 'yearn.finance',
          symbol: 'YFI',
          address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
          decimals: 18,
          display_name: 'YFI',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo-128.png',
        },
        tvl: {
          total_assets: 39515992660669342302,
          price: 34369.6801733,
          tvl: 1358152.0294776754,
        },
        apy: {
          type: 'v1:simple',
          gross_apr: 0.0,
          net_apy: 1.172386252746207e-17,
          fees: {
            performance: 0.0,
            withdrawal: 0,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 5.1935692975632964e-17,
            month_ago: 1.172386252746207e-17,
            inception: 0.018303012029134206,
          },
          composite: null,
        },
        fees: {
          performance: 0.0,
          withdrawal: 0,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x395F93350D5102B6139Abfc84a7D6ee70488797C',
            name: 'StrategyYFIGovernance',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032662,
        special: false,
      },
      {
        inception: 10709740,
        address: '0x2994529C0652D127b7842094103715ec5299bBed',
        symbol: 'yyDAI+yUSDC+yUSDT+yBUSD',
        name: 'curve.fi/busd',
        display_name: 'crvYBUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x2994529C0652D127b7842094103715ec5299bBed/logo-128.png',
        token: {
          name: 'Curve.fi yDAI/yUSDC/yUSDT/yBUSD',
          symbol: 'yDAI+yUSDC+yUSDT+yBUSD',
          address: '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B',
          decimals: 18,
          display_name: 'crvYBUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B/logo-128.png',
        },
        tvl: {
          total_assets: 3331047147543998737462444,
          price: 1.1161746341107794,
          tvl: 3718030.3311156784,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.11711582909689233,
          net_apy: 0.1113544195613192,
          fees: {
            performance: 0.1,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 1.9391896252064131,
            pool_apy: 0.028134633534243614,
            boosted_apr: 0.08654624857522138,
            base_apr: 0.04463011118162781,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.1,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x112570655b32A8c747845E0215ad139661e66E7F',
            name: 'StrategyCurveBUSDVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032663,
        special: false,
      },
      {
        inception: 10734341,
        address: '0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6',
        symbol: 'ycrvRenWSBTC',
        name: 'curve.fi/sbtc',
        display_name: 'crvSBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x7Ff566E1d69DEfF32a7b244aE7276b9f90e9D0f6/logo-128.png',
        token: {
          name: 'Curve.fi renBTC/wBTC/sBTC',
          symbol: 'crvRenWSBTC',
          address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
          decimals: 18,
          display_name: 'crvSBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3/logo-128.png',
        },
        tvl: {
          total_assets: 66337254094572457144,
          price: 36726.83383226828,
          tvl: 2436357.308020321,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.03035290201684182,
          net_apy: 0.02795673684233546,
          fees: {
            performance: 0.1,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.0035190202753012656,
            boosted_apr: 0.026739783899839796,
            base_apr: 0.010695913559935918,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.1,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x6D6c1AD13A5000148Aa087E7CbFb53D402c81341',
            name: 'StrategyCurveBTCVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032663,
        special: false,
      },
      {
        inception: 10774489,
        address: '0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7',
        symbol: 'yWETH',
        name: 'WETH',
        display_name: 'ETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xe1237aA7f535b0CC33Fd973D66cBf830354D16c7/logo-128.png',
        token: {
          name: 'Wrapped Ether',
          symbol: 'WETH',
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          decimals: 18,
          display_name: 'ETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo-128.png',
        },
        tvl: {
          total_assets: 2566336025859715584482,
          price: 2219.75005716,
          tvl: 5696624.540093871,
        },
        apy: {
          type: 'v1:simple',
          gross_apr: 0.0,
          net_apy: 0.0,
          fees: {
            performance: 0.2,
            withdrawal: 0,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0,
            month_ago: 0.0,
            inception: 0.017599125009181683,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: 0,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x39AFF7827B9D0de80D86De295FE62F7818320b76',
            name: 'StrategyMKRVaultDAIDelegate',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032663,
        special: false,
      },
      {
        inception: 11026971,
        address: '0x9cA85572E6A3EbF24dEDd195623F188735A5179f',
        symbol: 'y3Crv',
        name: 'curve.fi/3pool',
        display_name: '3Crv',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x9cA85572E6A3EbF24dEDd195623F188735A5179f/logo-128.png',
        token: {
          name: 'Curve.fi DAI/USDC/USDT',
          symbol: '3Crv',
          address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
          decimals: 18,
          display_name: '3Crv',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490/logo-128.png',
        },
        tvl: {
          total_assets: 32113347909802926226105593,
          price: 1.0176856860654178,
          tvl: 32681294.499445237,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.07054985621577581,
          net_apy: 0.05904900797596402,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.006555745274199332,
            boosted_apr: 0.06357731426404362,
            base_apr: 0.025430925705617446,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0xC59601F0CC49baa266891b7fc63d2D5FE097A79D',
            name: 'StrategyCurve3CrvVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032663,
        special: false,
      },
      {
        inception: 11065127,
        address: '0xec0d8D3ED5477106c6D4ea27D90a60e594693C90',
        symbol: 'yGUSD',
        name: 'GUSD',
        display_name: 'GUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xec0d8D3ED5477106c6D4ea27D90a60e594693C90/logo-128.png',
        token: {
          name: 'Gemini dollar',
          symbol: 'GUSD',
          address: '0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd',
          decimals: 2,
          display_name: 'GUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x056Fd409E1d7A124BD7017459dFEa2F387b6d5Cd/logo-128.png',
        },
        tvl: { total_assets: 0, price: 0.985157076042571, tvl: 0.0 },
        apy: {
          type: 'v1:simple',
          gross_apr: 0.0,
          net_apy: 0.0,
          fees: {
            performance: 0.0,
            withdrawal: 0,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0,
            month_ago: 0.0,
            inception: -1.492914196347189,
          },
          composite: null,
        },
        fees: {
          performance: 0.0,
          withdrawal: 0,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0xF4Fd9B4dAb557DD4C9cf386634d61231D54d03d6',
            name: 'StrategyGUSDRescue',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 2,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032663,
        special: false,
      },
      {
        inception: 11210772,
        address: '0x629c759D1E83eFbF63d84eb3868B564d9521C129',
        symbol: 'yvcDAI+cUSDC',
        name: 'curve.fi/compound',
        display_name: 'crvCOMP',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x629c759D1E83eFbF63d84eb3868B564d9521C129/logo-128.png',
        token: {
          name: 'Curve.fi cDAI/cUSDC',
          symbol: 'cDAI+cUSDC',
          address: '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2',
          decimals: 18,
          display_name: 'crvCOMP',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2/logo-128.png',
        },
        tvl: {
          total_assets: 2163817514535749733857521,
          price: 1.0779706834061822,
          tvl: 2332531.844910369,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.09813204050895052,
          net_apy: 0.08483489429315716,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.4999999999999996,
            pool_apy: 0.02276393395876619,
            boosted_apr: 0.07369061818445286,
            base_apr: 0.029476247273781148,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x530da5aeF3c8f9CCbc75C97C182D6ee2284B643F',
            name: 'StrategyCurveCompoundVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032664,
        special: false,
      },
      {
        inception: 11391849,
        address: '0x0FCDAeDFb8A7DfDa2e9838564c5A1665d856AFDF',
        symbol: 'yvmusd3CRV',
        name: 'curve.fi/musd',
        display_name: 'crvMUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x0FCDAeDFb8A7DfDa2e9838564c5A1665d856AFDF/logo-128.png',
        token: {
          name: 'Curve.fi MUSD/3Crv',
          symbol: 'musd3CRV',
          address: '0x1AEf73d49Dedc4b1778d0706583995958Dc862e6',
          decimals: 18,
          display_name: 'crvMUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x1AEf73d49Dedc4b1778d0706583995958Dc862e6/logo-128.png',
        },
        tvl: {
          total_assets: 99820679021917914522598,
          price: 1.0127829639425157,
          tvl: 101096.68316257252,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.1343509917116048,
          net_apy: 0.11464645135579832,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 1.9901070664446958,
            pool_apy: 0.01179142064337757,
            boosted_apr: 0.12113126141185722,
            base_apr: 0.06086670584425233,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0xBcC6abd115a32fC27f7B49F9e17D0BcefDd278aC',
            name: 'StrategyCurvemUSDVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032664,
        special: false,
      },
      {
        inception: 11397633,
        address: '0xcC7E70A958917cCe67B4B87a8C30E6297451aE98',
        symbol: 'yvgusd3CRV',
        name: 'curve.fi/gusd',
        display_name: 'crvGUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xcC7E70A958917cCe67B4B87a8C30E6297451aE98/logo-128.png',
        token: {
          name: 'Curve.fi GUSD/3Crv',
          symbol: 'gusd3CRV',
          address: '0xD2967f45c4f384DEEa880F807Be904762a3DeA07',
          decimals: 18,
          display_name: 'crvGUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xD2967f45c4f384DEEa880F807Be904762a3DeA07/logo-128.png',
        },
        tvl: {
          total_assets: 686998704840101874522280,
          price: 1.0177458972611215,
          tvl: 699190.1132747178,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.13968671778158126,
          net_apy: 0.11942924932481014,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.4999999999999996,
            pool_apy: 0.012502072396955777,
            boosted_apr: 0.1256142074687648,
            base_apr: 0.05024568298750593,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0xD42eC70A590C6bc11e9995314fdbA45B4f74FABb',
            name: 'StrategyCurveGUSDVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032664,
        special: false,
      },
      {
        inception: 11638697,
        address: '0x98B058b2CBacF5E99bC7012DF757ea7CFEbd35BC',
        symbol: 'yveursCRV',
        name: 'curve.fi/eurs',
        display_name: 'crvEURS',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x98B058b2CBacF5E99bC7012DF757ea7CFEbd35BC/logo-128.png',
        token: {
          name: 'Curve.fi EURS/sEUR',
          symbol: 'eursCRV',
          address: '0x194eBd173F6cDacE046C53eACcE9B953F28411d1',
          decimals: 18,
          display_name: 'crvEURS',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x194eBd173F6cDacE046C53eACcE9B953F28411d1/logo-128.png',
        },
        tvl: {
          total_assets: 1505143430763312561916767,
          price: 1.1880245805425966,
          tvl: 1788147.3929890292,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.23289640195307082,
          net_apy: 0.20446074451737806,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 1.932262730037267,
            pool_apy: 0.002595080241743153,
            boosted_apr: 0.22970521823805273,
            base_apr: 0.11887887432037902,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x08553D7BE4fBa2b186A60738301a7E613349c053',
            name: 'StrategyCurveEURVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032664,
        special: false,
      },
      {
        inception: 11563701,
        address: '0xE0db48B4F71752C4bEf16De1DBD042B82976b8C7',
        symbol: 'yvmUSD',
        name: 'mUSD',
        display_name: 'mUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xE0db48B4F71752C4bEf16De1DBD042B82976b8C7/logo-128.png',
        token: {
          name: 'mStable USD',
          symbol: 'mUSD',
          address: '0xe2f2a5C287993345a840Db3B0845fbC70f5935a5',
          decimals: 18,
          display_name: 'mUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xe2f2a5C287993345a840Db3B0845fbC70f5935a5/logo-128.png',
        },
        tvl: {
          total_assets: 41839221080614379604,
          price: 0.9329462811704924,
          tvl: 39.033745714229255,
        },
        apy: {
          type: 'v1:simple',
          gross_apr: -0.014803682089583603,
          net_apy: -0.01177442694574286,
          fees: {
            performance: 0.2,
            withdrawal: 50,
            management: null,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.011722631781577179,
            month_ago: -0.01177442694574286,
            inception: 0.04918921645356349,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: 50,
          management: null,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x6f1EbF5BBc5e32fffB6B3d237C3564C15134B8cF',
            name: 'StrategymUSDCurve',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032665,
        special: false,
      },
      {
        inception: 11725354,
        address: '0x5334e150B938dd2b6bd040D9c4a03Cff0cED3765',
        symbol: 'yvcrvRenWBTC',
        name: 'curve.fi/renbtc',
        display_name: 'crvRENBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5334e150B938dd2b6bd040D9c4a03Cff0cED3765/logo-128.png',
        token: {
          name: 'Curve.fi renBTC/wBTC',
          symbol: 'crvRenWBTC',
          address: '0x49849C98ae39Fff122806C06791Fa73784FB3675',
          decimals: 18,
          display_name: 'crvRENBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x49849C98ae39Fff122806C06791Fa73784FB3675/logo-128.png',
        },
        tvl: {
          total_assets: 3708589149524178338,
          price: 37043.997404304035,
          tvl: 137380.9668286038,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.043789058724713836,
          net_apy: 0.03588289679100365,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.0014136178276891176,
            boosted_apr: 0.04231562277827557,
            base_apr: 0.01692624911131023,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x76B29E824C183dBbE4b27fe5D8EdF0f926340750',
            name: 'StrategyCurveRENVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032665,
        special: false,
      },
      {
        inception: 11715333,
        address: '0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3',
        symbol: 'yvusdn3CRV',
        name: 'curve.fi/usdn',
        display_name: 'crvUSDN',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xFe39Ce91437C76178665D64d7a2694B0f6f17fE3/logo-128.png',
        token: {
          name: 'Curve.fi USDN/3Crv',
          symbol: 'usdn3CRV',
          address: '0x4f3E8F405CF5aFC05D68142F3783bDfE13811522',
          decimals: 18,
          display_name: 'crvUSDN',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x4f3E8F405CF5aFC05D68142F3783bDfE13811522/logo-128.png',
        },
        tvl: {
          total_assets: 1278594851342768074731001,
          price: 1.0303584209097256,
          tvl: 1317410.97201284,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.26137921893603555,
          net_apy: 0.26075205237168264,
          fees: {
            performance: 0.1,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.026236507047066038,
            boosted_apr: 0.22913111185800472,
            base_apr: 0.09165244474320189,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.1,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x406813fF2143d178d1Ebccd2357C20A424208912',
            name: 'StrategyCurveUSDNVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032665,
        special: false,
      },
      {
        inception: 11714847,
        address: '0xF6C9E9AF314982A4b38366f4AbfAa00595C5A6fC',
        symbol: 'yvust3CRV',
        name: 'curve.fi/ust',
        display_name: 'crvUST',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xF6C9E9AF314982A4b38366f4AbfAa00595C5A6fC/logo-128.png',
        token: {
          name: 'Curve.fi UST/3Crv',
          symbol: 'ust3CRV',
          address: '0x94e131324b6054c0D789b190b2dAC504e4361b53',
          decimals: 18,
          display_name: 'crvUST',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x94e131324b6054c0D789b190b2dAC504e4361b53/logo-128.png',
        },
        tvl: {
          total_assets: 81669512423780464175573,
          price: 1.0192043551763978,
          tvl: 83237.92274744998,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.0945451837543847,
          net_apy: 0.08321553971725115,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.031818695124882,
            boosted_apr: 0.06079216138055229,
            base_apr: 0.024316864552220915,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x3be2717DA725f43b7d6C598D8f76AeC43e231B99',
            name: 'StrategyCurveUSTVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032665,
        special: false,
      },
      {
        inception: 11714727,
        address: '0xA8B1Cb4ed612ee179BDeA16CCa6Ba596321AE52D',
        symbol: 'yvbBTC/sbtcCRV',
        name: 'curve.fi/bbtc',
        display_name: 'crvBBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xA8B1Cb4ed612ee179BDeA16CCa6Ba596321AE52D/logo-128.png',
        token: {
          name: 'Curve.fi bBTC/sbtcCRV',
          symbol: 'bBTC/sbtcCRV',
          address: '0x410e3E86ef427e30B9235497143881f717d93c2A',
          decimals: 18,
          display_name: 'crvBBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x410e3E86ef427e30B9235497143881f717d93c2A/logo-128.png',
        },
        tvl: {
          total_assets: 2340240161542994790,
          price: 36654.170387276674,
          tvl: 85779.56162834482,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.3018915779218756,
          net_apy: 0.27207723507755177,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.00954650081883135,
            boosted_apr: 0.28958059570899075,
            base_apr: 0.1158322382835963,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x551F41aD4ebeCa4F5d025D2B3082b7AB2383B768',
            name: 'StrategyCurveBBTCVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032665,
        special: false,
      },
      {
        inception: 11729665,
        address: '0x07FB4756f67bD46B748b16119E802F1f880fb2CC',
        symbol: 'yvtbtc/sbtcCrv',
        name: 'curve.fi/tbtc',
        display_name: 'crvTBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x07FB4756f67bD46B748b16119E802F1f880fb2CC/logo-128.png',
        token: {
          name: 'Curve.fi tBTC/sbtcCrv',
          symbol: 'tbtc/sbtcCrv',
          address: '0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
          decimals: 18,
          display_name: 'crvTBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd/logo-128.png',
        },
        tvl: { total_assets: 0, price: 36557.62527156643, tvl: 0.0 },
        apy: {
          type: 'crv',
          gross_apr: 0.05096017743785053,
          net_apy: 0.042090383182740165,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.0029620200255908724,
            boosted_apr: 0.04785640577998672,
            base_apr: 0.01914256231199469,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x61A01a704665b3C0E6898C1B4dA54447f561889d',
            name: 'StrategyCurveTBTCVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032666,
        special: false,
      },
      {
        inception: 11733973,
        address: '0x7F83935EcFe4729c4Ea592Ab2bC1A32588409797',
        symbol: 'yvoBTC/sbtcCRV',
        name: 'curve.fi/obtc',
        display_name: 'crvOBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x7F83935EcFe4729c4Ea592Ab2bC1A32588409797/logo-128.png',
        token: {
          name: 'Curve.fi oBTC/sbtcCRV',
          symbol: 'oBTC/sbtcCRV',
          address: '0x2fE94ea3d5d4a175184081439753DE15AeF9d614',
          decimals: 18,
          display_name: 'crvOBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x2fE94ea3d5d4a175184081439753DE15AeF9d614/logo-128.png',
        },
        tvl: { total_assets: 0, price: 36527.710321546096, tvl: 0.0 },
        apy: {
          type: 'crv',
          gross_apr: 0.23611966750105284,
          net_apy: 0.20759368502046605,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.004529669783834178,
            boosted_apr: 0.23054570181790132,
            base_apr: 0.05097268909255505,
            cvx_apr: 0,
            rewards_apr: 0.10311397908651371,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x15CfA851403aBFbbD6fDB1f6fe0d32F22ddc846a',
            name: 'StrategyCurveOBTCVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032666,
        special: false,
      },
      {
        inception: 11733973,
        address: '0x123964EbE096A920dae00Fb795FFBfA0c9Ff4675',
        symbol: 'yvpBTC/sbtcCRV',
        name: 'curve.fi/pbtc',
        display_name: 'crvPBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x123964EbE096A920dae00Fb795FFBfA0c9Ff4675/logo-128.png',
        token: {
          name: 'Curve.fi pBTC/sbtcCRV',
          symbol: 'pBTC/sbtcCRV',
          address: '0xDE5331AC4B3630f94853Ff322B66407e0D6331E8',
          decimals: 18,
          display_name: 'crvPBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xDE5331AC4B3630f94853Ff322B66407e0D6331E8/logo-128.png',
        },
        tvl: {
          total_assets: 2,
          price: 36569.36024038002,
          tvl: 7.313872048076004e-14,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.2025978679303535,
          net_apy: 0.17594345180938165,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.005630923047233782,
            boosted_apr: 0.19586404949270653,
            base_apr: 0.03987616613371196,
            cvx_apr: 0,
            rewards_apr: 0.0961736341584266,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0xD96041c5EC05735D965966bF51faEC40F3888f6e',
            name: 'StrategyCurvePBTCVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032668,
        special: false,
      },
      {
        inception: 11754645,
        address: '0x46AFc2dfBd1ea0c0760CAD8262A5838e803A37e5',
        symbol: 'yvhCRV',
        name: 'curve.fi/hbtc',
        display_name: 'crvHBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x46AFc2dfBd1ea0c0760CAD8262A5838e803A37e5/logo-128.png',
        token: {
          name: 'Curve.fi hBTC/wBTC',
          symbol: 'hCRV',
          address: '0xb19059ebb43466C323583928285a49f558E572Fd',
          decimals: 18,
          display_name: 'crvHBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xb19059ebb43466C323583928285a49f558E572Fd/logo-128.png',
        },
        tvl: {
          total_assets: 77558243318146853,
          price: 36671.36173542899,
          tvl: 2844.1663962841812,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.02815730849353204,
          net_apy: 0.02307372360411919,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 1,
            pool_apy: 0.0016293356811620807,
            boosted_apr: 0.02648482014989061,
            base_apr: 0.02648482014989061,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0xE02363cB1e4E1B77a74fAf38F3Dbb7d0B70F26D7',
            name: 'StrategyCurveHBTCVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032668,
        special: false,
      },
      {
        inception: 11734427,
        address: '0x5533ed0a3b83F70c3c4a1f69Ef5546D3D4713E44',
        symbol: 'yvcrvPlain3andSUSD',
        name: 'curve.fi/susd',
        display_name: 'crvSUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5533ed0a3b83F70c3c4a1f69Ef5546D3D4713E44/logo-128.png',
        token: {
          name: 'Curve.fi DAI/USDC/USDT/sUSD',
          symbol: 'crvPlain3andSUSD',
          address: '0xC25a3A3b969415c80451098fa907EC722572917F',
          decimals: 18,
          display_name: 'crvSUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xC25a3A3b969415c80451098fa907EC722572917F/logo-128.png',
        },
        tvl: {
          total_assets: 1838880876223527033826034,
          price: 1.0402843812597515,
          tvl: 1912959.0545325817,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.09349147692862636,
          net_apy: 0.07900848729281607,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.4999999999999996,
            pool_apy: 0.010017771069160908,
            boosted_apr: 0.08264577936198483,
            base_apr: 0.028574157486591478,
            cvx_apr: 0,
            rewards_apr: 0.011210385645506157,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0xd7F641697ca4e0e19F6C9cF84989ABc293D24f84',
            name: 'StrategyCurvesUSDVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032668,
        special: false,
      },
      {
        inception: 11754645,
        address: '0x39546945695DCb1c037C836925B355262f551f55',
        symbol: 'yvhusd3CRV',
        name: 'curve.fi/husd',
        display_name: 'crvHUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x39546945695DCb1c037C836925B355262f551f55/logo-128.png',
        token: {
          name: 'Curve.fi HUSD/3Crv',
          symbol: 'husd3CRV',
          address: '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858',
          decimals: 18,
          display_name: 'crvHUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858/logo-128.png',
        },
        tvl: {
          total_assets: 678656935831935748503,
          price: 1.0131094168086638,
          tvl: 687.5537324738473,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.13157035022860808,
          net_apy: 0.11146881657892194,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.00539566938408953,
            boosted_apr: 0.12549753762298765,
            base_apr: 0.05019901504919506,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0xb21C4d2f7b2F29109FF6243309647A01bEB9950a',
            name: 'StrategyCurveHUSDVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032669,
        special: false,
      },
      {
        inception: 11754645,
        address: '0x8e6741b456a074F0Bc45B8b82A755d4aF7E965dF',
        symbol: 'yvdusd3CRV',
        name: 'curve.fi/dusd',
        display_name: 'crvDUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x8e6741b456a074F0Bc45B8b82A755d4aF7E965dF/logo-128.png',
        token: {
          name: 'Curve.fi DUSD/3Crv',
          symbol: 'dusd3CRV',
          address: '0x3a664Ab939FD8482048609f652f9a0B0677337B9',
          decimals: 18,
          display_name: 'crvDUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x3a664Ab939FD8482048609f652f9a0B0677337B9/logo-128.png',
        },
        tvl: {
          total_assets: 588063464761488889810743,
          price: 1.0106737165916573,
          tvl: 594340.287522261,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.16423664871412713,
          net_apy: 0.14048002161917905,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 1.9050799004651795,
            pool_apy: 0.003122334417646311,
            boosted_apr: 0.16061282733776872,
            base_apr: 0.08430765937877488,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x33F3f002b8f812f3E087E9245921C8355E777231',
            name: 'StrategyCurveDUSDVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032669,
        special: false,
      },
      {
        inception: 11771086,
        address: '0x03403154afc09Ce8e44C3B185C82C6aD5f86b9ab',
        symbol: 'yva3CRV',
        name: 'curve.fi/aave',
        display_name: 'crvAAVE',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x03403154afc09Ce8e44C3B185C82C6aD5f86b9ab/logo-128.png',
        token: {
          name: 'Curve.fi aDAI/aUSDC/aUSDT',
          symbol: 'a3CRV',
          address: '0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900',
          decimals: 18,
          display_name: 'crvAAVE',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900/logo-128.png',
        },
        tvl: {
          total_assets: 4055149346613413798267170,
          price: 1.0563358571322103,
          tvl: 4283599.660854003,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.1085546166334801,
          net_apy: 0.09502351608719706,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.03175463659543776,
            boosted_apr: 0.07443628292426714,
            base_apr: 0.029774513169706855,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x7A10bE29c4d9073E6B3B6b7D1fB5bCDBecA2AA1F',
            name: 'StrategyCurvea3CRVVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032669,
        special: false,
      },
      {
        inception: 11838707,
        address: '0xE625F5923303f1CE7A43ACFEFd11fd12f30DbcA4',
        symbol: 'yvankrCRV',
        name: 'curve.fi/ankreth',
        display_name: 'crvAETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xE625F5923303f1CE7A43ACFEFd11fd12f30DbcA4/logo-128.png',
        token: {
          name: 'Curve.fi ETH/aETH',
          symbol: 'ankrCRV',
          address: '0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf',
          decimals: 18,
          display_name: 'crvAETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf/logo-128.png',
        },
        tvl: {
          total_assets: 87136838769694808353,
          price: 2260.5021427746897,
          tvl: 196973.01075350775,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.1101436802275162,
          net_apy: 0.09203220890945252,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.0240221268523286,
            pool_apy: 0,
            boosted_apr: 0.11014368022751618,
            base_apr: 0.05441821942866151,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0xBdCeae91e10A80dbD7ad5e884c86EAe56b075Caa',
            name: 'StrategyCurveAnkrVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032670,
        special: false,
      },
      {
        inception: 11898650,
        address: '0xBacB69571323575C6a5A3b4F9EEde1DC7D31FBc1',
        symbol: 'yvsaCRV',
        name: 'curve.fi/saave',
        display_name: 'crvSAAVE',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xBacB69571323575C6a5A3b4F9EEde1DC7D31FBc1/logo-128.png',
        token: {
          name: 'Curve.fi aDAI/aSUSD',
          symbol: 'saCRV',
          address: '0x02d341CcB60fAaf662bC0554d13778015d1b285C',
          decimals: 18,
          display_name: 'crvSAAVE',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x02d341CcB60fAaf662bC0554d13778015d1b285C/logo-128.png',
        },
        tvl: {
          total_assets: 372193071354285866079395,
          price: 1.0347136425589034,
          tvl: 385113.24859617895,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.16796902800308255,
          net_apy: 0.14565783970686552,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.064740365867618,
            pool_apy: 0.022944041712553265,
            boosted_apr: 0.14177215993920544,
            base_apr: 0.06866343211129687,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x8e2057b8fe8e680B48858cDD525EBc9510620621',
            name: 'StrategyCurvesaCRVVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032670,
        special: false,
      },
      {
        inception: 11969841,
        address: '0x1B5eb1173D2Bf770e50F10410C9a96F7a8eB6e75',
        symbol: 'yvusdp3CRV',
        name: 'curve.fi/usdp',
        display_name: 'crvUSDP',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x1B5eb1173D2Bf770e50F10410C9a96F7a8eB6e75/logo-128.png',
        token: {
          name: 'Curve.fi USDP/3Crv',
          symbol: 'usdp3CRV',
          address: '0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6',
          decimals: 18,
          display_name: 'crvUSDP',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6/logo-128.png',
        },
        tvl: {
          total_assets: 11970945128959787596390579,
          price: 1.0045030239156119,
          tvl: 12024850.58116797,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.19610142578878498,
          net_apy: 0.16985079326961072,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.004805393097772059,
            boosted_apr: 0.19038117630047274,
            base_apr: 0.0761524705201891,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x8c151a8F106Bad20A501DC758c19Fab28a040759',
            name: 'StrategyCurveUSDPVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032670,
        special: false,
      },
      {
        inception: 11948374,
        address: '0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6',
        symbol: 'yvlinkCRV',
        name: 'curve.fi/link',
        display_name: 'crvLINK',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x96Ea6AF74Af09522fCB4c28C269C26F59a31ced6/logo-128.png',
        token: {
          name: 'Curve.fi LINK/sLINK',
          symbol: 'linkCRV',
          address: '0xcee60cFa923170e4f8204AE08B4fA6A3F5656F3a',
          decimals: 18,
          display_name: 'crvLINK',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xcee60cFa923170e4f8204AE08B4fA6A3F5656F3a/logo-128.png',
        },
        tvl: {
          total_assets: 93647470764271748796832,
          price: 21.470136894771493,
          tvl: 2010624.0171580254,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.09166062166099542,
          net_apy: 0.07612482102399265,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0,
            keep_crv: 0.0,
            cvx_keep_crv: 0,
          },
          points: null,
          composite: {
            boost: 1.9481114145743277,
            pool_apy: 0.0006992749901537643,
            boosted_apr: 0.09089778412374347,
            base_apr: 0.04665943818393215,
            cvx_apr: 0,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0,
          keep_crv: 0.0,
          cvx_keep_crv: 0,
        },
        strategies: [
          {
            address: '0x153Fe8894a76f14bC8c8B02Dd81eFBB6d24E909f',
            name: 'StrategyCurveLINKVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.1',
        decimals: 18,
        type: 'v1',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032670,
        special: false,
      },
      {
        inception: 11673762,
        address: '0x19D3364A399d251E894aC732651be8B0E4e85001',
        symbol: 'yvDAI',
        name: 'yvDAI 0.3.0',
        display_name: 'DAI',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x19D3364A399d251E894aC732651be8B0E4e85001/logo-128.png',
        token: {
          name: 'Dai Stablecoin',
          symbol: 'DAI',
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          decimals: 18,
          display_name: 'DAI',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x6B175474E89094C44Da98b954EedeAC495271d0F/logo-128.png',
        },
        tvl: {
          total_assets: 712887284278317251596900969,
          price: 1,
          tvl: 712887284.2783172,
        },
        apy: {
          type: 'v2:simple',
          gross_apr: 0.10086489450758583,
          net_apy: 0.07020223344595669,
          fees: {
            performance: 2000,
            withdrawal: null,
            management: 160,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.037023779556494586,
            month_ago: 0.07020223344595669,
            inception: 0.1253698301494856,
          },
          composite: null,
        },
        fees: {
          performance: 2000,
          withdrawal: null,
          management: 160,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x4031afd3B0F71Bace9181E554A9E680Ee4AbE7dF',
            name: 'StrategyGenericLevCompFarm',
          },
          {
            address: '0x7D960F3313f3cB1BBB6BF67419d303597F3E2Fa8',
            name: 'StrategyAH2EarncyDAI',
          },
          {
            address: '0x77b7CD137Dd9d94e7056f78308D7F65D2Ce68910',
            name: 'IBLevComp',
          },
          {
            address: '0x32b8C26d0439e1959CEa6262CBabC12320b384c4',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0x9f51F4df0b275dfB1F74f6Db86219bAe622B36ca',
            name: 'StrategyIdleidleDAIYield',
          },
          {
            address: '0x57e848A6915455a7e77CF0D55A1474bEFd9C374d',
            name: 'PoolTogether Dai Stablecoin',
          },
          {
            address: '0xFc403fd9E7A916eC38437807704e92236cA1f7A5',
            name: 'StrategyMasterchefGenericMod',
          },
          {
            address: '0x30010039Ea4a0c4fa1Ac051E8aF948239678353d',
            name: 'SingleSidedCrvDAI',
          },
          {
            address: '0xB361a3E75Bc2Ae6c8A045b3A43E2B0c9aD890d48',
            name: 'StrategyRook Dai Stablecoin',
          },
        ],
        endorsed: true,
        version: '0.3.0',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032679,
        special: false,
      },
      {
        inception: 11674456,
        address: '0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9',
        symbol: 'yvUSDC',
        name: 'yvUSDC 0.3.0',
        display_name: 'USDC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5f18C75AbDAe578b483E5F43f12a39cF75b973a9/logo-128.png',
        token: {
          name: 'USD Coin',
          symbol: 'USDC',
          address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          decimals: 6,
          display_name: 'USDC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48/logo-128.png',
        },
        tvl: { total_assets: 610779201063520, price: 1, tvl: 610779201.06352 },
        apy: {
          type: 'v2:simple',
          gross_apr: 0.0929842515787621,
          net_apy: 0.06433480341537756,
          fees: {
            performance: 2000,
            withdrawal: null,
            management: 150,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0469131344714732,
            month_ago: 0.06433480341537756,
            inception: 0.1487308285128598,
          },
          composite: null,
        },
        fees: {
          performance: 2000,
          withdrawal: null,
          management: 150,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x4D7d4485fD600c61d840ccbeC328BfD76A050F87',
            name: 'StrategyGenericLevCompFarm',
          },
          {
            address: '0x86Aa49bf28d03B1A4aBEb83872cFC13c89eB4beD',
            name: 'StrategyAH2EarncyUSDC',
          },
          {
            address: '0xE68A8565B4F837BDa10e2e917BFAaa562e1cD143',
            name: 'IBLevComp',
          },
          {
            address: '0x80af28cb1e44C44662F144475d7667C9C0aaB3C3',
            name: 'SingleSidedCrvUSDC',
          },
          {
            address: '0x2E1ad896D3082C52A5AE7Af307131DE7a37a46a0',
            name: 'StrategyIdleidleUSDCYield',
          },
          {
            address: '0x063303D9584Ac9A67855086e16Ca7212C109b7b4',
            name: 'StrategyMasterchefGenericMod',
          },
          {
            address: '0x387fCa8d7e2e09655b4F49548607B55C0580fC63',
            name: 'PoolTogether USD Coin',
          },
          {
            address: '0x2B1a6CB0168aA540ee8D853aB1d10d7A89d6351b',
            name: 'StrategyRook USD Coin',
          },
        ],
        endorsed: true,
        version: '0.3.0',
        decimals: 6,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032682,
        special: false,
      },
      {
        inception: 11654862,
        address: '0xdCD90C7f6324cfa40d7169ef80b12031770B4325',
        symbol: 'yvCurve-stETH',
        name: 'yvCurve-stETH 0.3.0',
        display_name: 'crvSTETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xdCD90C7f6324cfa40d7169ef80b12031770B4325/logo-128.png',
        token: {
          name: 'Curve.fi ETH/stETH',
          symbol: 'steCRV',
          address: '0x06325440D014e39736583c165C2963BA99fAf14E',
          decimals: 18,
          display_name: 'crvSTETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x06325440D014e39736583c165C2963BA99fAf14E/logo-128.png',
        },
        tvl: {
          total_assets: 81690381707545742491086,
          price: 2253.3049697094225,
          tvl: 184073343.07907254,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.09718358171188024,
          net_apy: 0.06312244977750008,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.030384376462962548,
            boosted_apr: 0.059980452580526256,
            base_apr: 0.003444589353241678,
            cvx_apr: 0.0656992303191124,
            rewards_apr: 0.05136897919742206,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x979843B8eEa56E0bEA971445200e0eC3398cdB87',
            name: 'StrategystETHCurve',
          },
          {
            address: '0x6C0496fC55Eb4089f1Cf91A4344a2D56fAcE51e3',
            name: 'StrategyConvexstETH',
          },
        ],
        endorsed: true,
        version: '0.3.0',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032686,
        special: false,
      },
      {
        inception: 11870013,
        address: '0x986b4AFF588a109c09B50A03f42E4110E29D353F',
        symbol: 'yvCurve-sETH',
        name: 'yvCurve-sETH 0.3.2',
        display_name: 'crvSETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x986b4AFF588a109c09B50A03f42E4110E29D353F/logo-128.png',
        token: {
          name: 'Curve.fi ETH/sETH',
          symbol: 'eCRV',
          address: '0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c',
          decimals: 18,
          display_name: 'crvSETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xA3D87FffcE63B53E0d54fAa1cc983B7eB0b74A9c/logo-128.png',
        },
        tvl: {
          total_assets: 35129743179252005024673,
          price: 2230.7780972046817,
          tvl: 78366661.64470093,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.07647663750886657,
          net_apy: 0.038673080967224285,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.4999999999999996,
            pool_apy: 0.0016693672188310416,
            boosted_apr: 0.06150888268240628,
            base_apr: 0.024603553072962515,
            cvx_apr: 0.07855561524886903,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xdD498eB680B0CE6Cac17F7dab0C35Beb6E481a6d',
            name: 'CurveeCRVVoterProxy',
          },
          {
            address: '0xc2fC89E79D4Fd2570dD9B413b851F38076bCd930',
            name: 'StrategyConvexsETH',
          },
        ],
        endorsed: true,
        version: '0.3.2',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032687,
        special: false,
      },
      {
        inception: 11883016,
        address: '0xa9fE4601811213c340e850ea305481afF02f5b28',
        symbol: 'yvWETH',
        name: 'yvWETH 0.3.2',
        display_name: 'ETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xa9fE4601811213c340e850ea305481afF02f5b28/logo-128.png',
        token: {
          name: 'Wrapped Ether',
          symbol: 'WETH',
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          decimals: 18,
          display_name: 'ETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo-128.png',
        },
        tvl: {
          total_assets: 31226189324361426100815,
          price: 2219.75005716,
          tvl: 69314335.53764026,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.044537709973706985,
          net_apy: 0.032951315229397815,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.004,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.032583027476353686,
            month_ago: 0.032951315229397815,
            inception: 0.04648150753124232,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.004,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0xeE697232DF2226c9fB3F02a57062c4208f287851',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0x2886971eCAF2610236b4869f58cD42c115DFb47A',
            name: 'StrategysteCurveWETHSingleSided',
          },
          {
            address: '0x24F1f33901BcFfB38F5Ff9D0A453d8EeF36F8392',
            name: 'RescueMasterchef',
          },
          {
            address: '0x030bFfF524BbE7A77C789A0993cE8EF23cF8Efe9',
            name: 'StrategyIdleidleWETHYield',
          },
          {
            address: '0x0E5397B8547C128Ee20958286436b7BC3f9faAa4',
            name: 'StrategyMakerETHDAIDelegate',
          },
          {
            address: '0x6107add73f80AC6015E85103D2f016C6373E4bDc',
            name: 'StrategyMasterchefGenericMod',
          },
          {
            address: '0xda988eBb26F505246C59Ba26514340B634F9a7a2',
            name: 'StrategyeCurveWETHSingleSided',
          },
          {
            address: '0x1A5890d45090701A35D995Be3b63948A67460341',
            name: 'StrategyMakerETHDAIDelegate',
          },
          {
            address: '0xbC0F2FF495eE2eb74A145EDAA457FA4Fa310DAC5',
            name: 'StrategyRook Wrapped Ether',
          },
        ],
        endorsed: true,
        version: '0.3.2',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032691,
        special: false,
      },
      {
        inception: 11992803,
        address: '0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1',
        symbol: 'yvYFI',
        name: 'yvYFI 0.3.2',
        display_name: 'YFI',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xE14d13d8B3b85aF791b2AADD661cDBd5E6097Db1/logo-128.png',
        token: {
          name: 'yearn.finance',
          symbol: 'YFI',
          address: '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
          decimals: 18,
          display_name: 'YFI',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e/logo-128.png',
        },
        tvl: {
          total_assets: 2127670752765317467749,
          price: 34369.6801733,
          tvl: 73127363.28662843,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.008651259750394047,
          net_apy: 0.00694454958588875,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.0,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0008095946303771885,
            month_ago: 0.00694454958588875,
            inception: 0.08006458224561538,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.0,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x6a97FC93e39b3f792f1fD6e01565ff412B002D20',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0xEcC95b2139096a23E0D63d9E604718C6b72F4d5f',
            name: 'RescueMasterchef',
          },
          {
            address: '0xe2a130825Ffb7773B8a13157c6A13f482097AA99',
            name: 'StrategySynthetixRewardsGeneric',
          },
          {
            address: '0x4730D10703155Ef4a448B17b0eaf3468fD4fb02d',
            name: 'StrategyMakerYFIDAIDelegate',
          },
        ],
        endorsed: true,
        version: '0.3.2',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032695,
        special: false,
      },
      {
        inception: 11889144,
        address: '0xB8C3B7A2A618C552C23B1E4701109a9E756Bab67',
        symbol: 'yv1INCH',
        name: 'yv1INCH 0.3.2',
        display_name: '1INCH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xB8C3B7A2A618C552C23B1E4701109a9E756Bab67/logo-128.png',
        token: {
          name: '1INCH Token',
          symbol: '1INCH',
          address: '0x111111111117dC0aa78b770fA6A738034120C302',
          decimals: 18,
          display_name: '1INCH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x111111111117dC0aa78b770fA6A738034120C302/logo-128.png',
        },
        tvl: {
          total_assets: 849565318087103866681192,
          price: 3.11094768759639,
          tvl: 2642953.261765167,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.14057935240386008,
          net_apy: 0.10117095626206561,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.010711620538019245,
            month_ago: 0.10117095626206561,
            inception: 0.09295121169350774,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0xB12F6A5776EDd2e923fD1Ce93041B2000A22dDc7',
            name: 'Strategy1INCHGovernance',
          },
          {
            address: '0x86eD4F77d40182b8686a25e125FB3f5a04203CaA',
            name: 'StrategyLenderYieldOptimiser',
          },
        ],
        endorsed: true,
        version: '0.3.2',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032696,
        special: false,
      },
      {
        inception: 12022103,
        address: '0x27b7b1ad7288079A66d12350c828D3C00A6F07d7',
        symbol: 'yvCurve-IronBank',
        name: 'yvCurve-IronBank 0.3.2',
        display_name: 'crvIB',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x27b7b1ad7288079A66d12350c828D3C00A6F07d7/logo-128.png',
        token: {
          name: 'Curve.fi cyDAI/cyUSDC/cyUSDT',
          symbol: 'ib3CRV',
          address: '0x5282a4eF67D9C33135340fB3289cc1711c13638C',
          decimals: 18,
          display_name: 'crvIB',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5282a4eF67D9C33135340fB3289cc1711c13638C/logo-128.png',
        },
        tvl: {
          total_assets: 350080504197886265292406907,
          price: 1.0217822282626785,
          tvl: 357706037.6506382,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.12297690855425225,
          net_apy: 0.08194430663100816,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.036282442863889486,
            boosted_apr: 0.08980546332884987,
            base_apr: 0.035922185331539944,
            cvx_apr: 0.08261253825511965,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x5148C3124B42e73CA4e15EEd1B304DB59E0F2AF7',
            name: 'StrategyCurveIBVoterProxy',
          },
          {
            address: '0x864F408B422B7d33416AC678b1a1A7E6fbcF5C8c',
            name: 'StrategyConvexIronBank',
          },
        ],
        endorsed: true,
        version: '0.3.2',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032697,
        special: false,
      },
      {
        inception: 12115501,
        address: '0x625b7DF2fa8aBe21B0A976736CDa4775523aeD1E',
        symbol: 'yvCurve-HBTC',
        name: 'yvCurve-HBTC 0.3.3',
        display_name: 'crvHBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x625b7DF2fa8aBe21B0A976736CDa4775523aeD1E/logo-128.png',
        token: {
          name: 'Curve.fi hBTC/wBTC',
          symbol: 'hCRV',
          address: '0xb19059ebb43466C323583928285a49f558E572Fd',
          decimals: 18,
          display_name: 'crvHBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xb19059ebb43466C323583928285a49f558E572Fd/logo-128.png',
        },
        tvl: {
          total_assets: 1285518992456578501897,
          price: 36671.36173542899,
          tvl: 47141731.990139395,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.07490420725402802,
          net_apy: 0.03641829916564291,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.0016293356811620807,
            boosted_apr: 0.06621205037472652,
            base_apr: 0.02648482014989061,
            cvx_apr: 0.08238258145127617,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xEeabc022EA72AFC585809214a43e1dDF3b34FBB6',
            name: 'CurvehCRVVoterProxy',
          },
          {
            address: '0x7Ed0d52C5944C7BF92feDC87FEC49D474ee133ce',
            name: 'ConvexhCRV',
          },
        ],
        endorsed: true,
        version: '0.3.3',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032698,
        special: false,
      },
      {
        inception: 12194927,
        address: '0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a',
        symbol: 'yvBOOST',
        name: 'yvBOOST 0.3.5',
        display_name: 'yveCRV',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x9d409a0A012CFbA9B15F6D4B36Ac57A46966Ab9a/logo-128.png',
        token: {
          name: 'veCRV-DAO yVault',
          symbol: 'yveCRV-DAO',
          address: '0xc5bDdf9843308380375a611c18B50Fb9341f502A',
          decimals: 18,
          display_name: 'yveCRV',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xc5bDdf9843308380375a611c18B50Fb9341f502A/logo-128.png',
        },
        tvl: {
          total_assets: 10622487726135431681115678,
          price: 1.471901159848653,
          tvl: 15635252.004576823,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.06722246345380256,
          net_apy: 0.06948695298282913,
          fees: {
            performance: 0.0,
            withdrawal: null,
            management: 0.0,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.3078211679363393,
            month_ago: 0.06948695298282913,
            inception: 0.5893257769054167,
          },
          composite: null,
        },
        fees: {
          performance: 0.0,
          withdrawal: null,
          management: 0.0,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x2923a58c1831205C854DBEa001809B194FDb3Fa5',
            name: 'StrategyYearnVECRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032699,
        special: false,
      },
      {
        inception: 12222869,
        address: '0x8414Db07a7F743dEbaFb402070AB01a4E0d2E45e',
        symbol: 'yvCurve-sBTC',
        name: 'yvCurve-sBTC 0.3.5',
        display_name: 'crvSBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x8414Db07a7F743dEbaFb402070AB01a4E0d2E45e/logo-128.png',
        token: {
          name: 'Curve.fi renBTC/wBTC/sBTC',
          symbol: 'crvRenWSBTC',
          address: '0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3',
          decimals: 18,
          display_name: 'crvSBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x075b1bb99792c9E1041bA13afEf80C91a1e70fB3/logo-128.png',
        },
        tvl: {
          total_assets: 103810715320713544317,
          price: 36726.83383226828,
          tvl: 3812638.8915927536,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.049904363122821316,
          net_apy: 0.018867647725601566,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.0035190202753012656,
            boosted_apr: 0.026739783899839796,
            base_apr: 0.010695913559935918,
            cvx_apr: 0.04622268428434444,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x24345144c80BC994C12d85fb276bB4c5520579Ea',
            name: 'CurvecrvRenWSBTCVoterProxy',
          },
          {
            address: '0x7aB4DB515bf258A88Bb14f3685769a0f70B8778f',
            name: 'ConvexcrvRenWSBTC',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032700,
        special: false,
      },
      {
        inception: 12222874,
        address: '0x7047F90229a057C13BF847C0744D646CFb6c9E1A',
        symbol: 'yvCurve-renBTC',
        name: 'yvCurve-renBTC 0.3.5',
        display_name: 'crvRENBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x7047F90229a057C13BF847C0744D646CFb6c9E1A/logo-128.png',
        token: {
          name: 'Curve.fi renBTC/wBTC',
          symbol: 'crvRenWBTC',
          address: '0x49849C98ae39Fff122806C06791Fa73784FB3675',
          decimals: 18,
          display_name: 'crvRENBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x49849C98ae39Fff122806C06791Fa73784FB3675/logo-128.png',
        },
        tvl: {
          total_assets: 1076068350457929918,
          price: 37043.997404304035,
          tvl: 39861.87318121728,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.05922666466870097,
          net_apy: 0.02486003078632204,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.0014136178276891176,
            boosted_apr: 0.04231562277827557,
            base_apr: 0.01692624911131023,
            cvx_apr: 0.07314725052760668,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x9eCC1abbA680C5cAACA37AD56E446ED741d86731',
            name: 'CurvecrvRenWBTCVoterProxy',
          },
          {
            address: '0x7799F476522Ebe259fc525C1A21E84f7Dd551955',
            name: 'ConvexcrvRenWBTC',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032700,
        special: false,
      },
      {
        inception: 12245110,
        address: '0xb4D1Be44BfF40ad6e506edf43156577a3f8672eC',
        symbol: 'yvCurve-sAave',
        name: 'yvCurve-sAave 0.3.5',
        display_name: 'crvSAAVE',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xb4D1Be44BfF40ad6e506edf43156577a3f8672eC/logo-128.png',
        token: {
          name: 'Curve.fi aDAI/aSUSD',
          symbol: 'saCRV',
          address: '0x02d341CcB60fAaf662bC0554d13778015d1b285C',
          decimals: 18,
          display_name: 'crvSAAVE',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x02d341CcB60fAaf662bC0554d13778015d1b285C/logo-128.png',
        },
        tvl: {
          total_assets: 18426649342325452852076559,
          price: 1.0347136425589034,
          tvl: 19066305.46115319,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.17525531337293754,
          net_apy: 0.1181028867144594,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.064740365867618,
            pool_apy: 0.022944041712553265,
            boosted_apr: 0.14177215428884266,
            base_apr: 0.06866342937469963,
            cvx_apr: 0.17026360974582527,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x106838c85Ab33F41567F7AbCfF787d7269E824AF',
            name: 'CurvesaCRVVoterProxy',
          },
          {
            address: '0xF5636591256195414f25d19034B70A4742Fc2A2e',
            name: 'ConvexsaCRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032704,
        special: false,
      },
      {
        inception: 12292619,
        address: '0xe9Dc63083c464d6EDcCFf23444fF3CFc6886f6FB',
        symbol: 'yvCurve-oBTC',
        name: 'yvCurve-oBTC 0.3.5',
        display_name: 'crvOBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xe9Dc63083c464d6EDcCFf23444fF3CFc6886f6FB/logo-128.png',
        token: {
          name: 'Curve.fi oBTC/sbtcCRV',
          symbol: 'oBTC/sbtcCRV',
          address: '0x2fE94ea3d5d4a175184081439753DE15AeF9d614',
          decimals: 18,
          display_name: 'crvOBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x2fE94ea3d5d4a175184081439753DE15AeF9d614/logo-128.png',
        },
        tvl: {
          total_assets: 161225897428477536185,
          price: 36527.710321546096,
          tvl: 5889212.877598731,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.24220576149649276,
          net_apy: 0.1818262130870299,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.004529669783834178,
            boosted_apr: 0.23054570181790132,
            base_apr: 0.05097268909255505,
            cvx_apr: 0.23862390223149996,
            rewards_apr: 0.10311397908651371,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x126e4fDfa9DCEA94F8f4157EF8ad533140C60fC7',
            name: 'CurveoBTC/sbtcCRVVoterProxy',
          },
          {
            address: '0xDb2D3F149270630382D4E6B4dbCd47e665D78D76',
            name: 'ConvexoBTC/sbtcCRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032705,
        special: false,
      },
      {
        inception: 12292951,
        address: '0x3c5DF3077BcF800640B5DAE8c91106575a4826E6',
        symbol: 'yvCurve-pBTC',
        name: 'yvCurve-pBTC 0.3.5',
        display_name: 'crvPBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x3c5DF3077BcF800640B5DAE8c91106575a4826E6/logo-128.png',
        token: {
          name: 'Curve.fi pBTC/sbtcCRV',
          symbol: 'pBTC/sbtcCRV',
          address: '0xDE5331AC4B3630f94853Ff322B66407e0D6331E8',
          decimals: 18,
          display_name: 'crvPBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xDE5331AC4B3630f94853Ff322B66407e0D6331E8/logo-128.png',
        },
        tvl: {
          total_assets: 188468209220652499322,
          price: 36569.36024038002,
          tvl: 6892161.836849352,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.23268021924643834,
          net_apy: 0.17442719392683317,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.005630923047233782,
            boosted_apr: 0.19586404949270653,
            base_apr: 0.03987616613371196,
            cvx_apr: 0.22735237412412085,
            rewards_apr: 0.0961736341584266,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xf726472B7BE7461001df396C55CAdB1870c78dAE',
            name: 'CurvepBTC/sbtcCRVVoterProxy',
          },
          {
            address: '0x7b5cb4694b0A299ED2F65db7d87B286461549e84',
            name: 'ConvexpBTC/sbtcCRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032706,
        special: false,
      },
      {
        inception: 12283801,
        address: '0x5fA5B62c8AF877CB37031e0a3B2f34A78e3C56A6',
        symbol: 'yvCurve-LUSD',
        name: 'yvCurve-LUSD 0.3.5',
        display_name: 'crvLUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5fA5B62c8AF877CB37031e0a3B2f34A78e3C56A6/logo-128.png',
        token: {
          name: 'Curve.fi Factory USD Metapool: Liquity',
          symbol: 'LUSD3CRV-f',
          address: '0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA',
          decimals: 18,
          display_name: 'crvLUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xEd279fDD11cA84bEef15AF5D39BB4d4bEE23F0cA/logo-128.png',
        },
        tvl: {
          total_assets: 68444419948525575039833738,
          price: 1.0038953649133766,
          tvl: 68711035.94050947,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.2088725619755467,
          net_apy: 0.14540503329285437,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.2068877125359063,
            pool_apy: 0.009235005573879462,
            boosted_apr: 0.1892641006264822,
            base_apr: 0.08576063908978915,
            cvx_apr: 0.20635744499786454,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xE13C452b5F10686366C2183964341A01A24d9984',
            name: 'CurveLUSD3CRV-fVoterProxy',
          },
          {
            address: '0x789685963DF287337759A9FaB65d8c645a3B4cba',
            name: 'ConvexLUSD3CRV-f',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032707,
        special: false,
      },
      {
        inception: 12292951,
        address: '0x8fA3A9ecd9EFb07A8CE90A6eb014CF3c0E3B32Ef',
        symbol: 'yvCurve-BBTC',
        name: 'yvCurve-BBTC 0.3.5',
        display_name: 'crvBBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x8fA3A9ecd9EFb07A8CE90A6eb014CF3c0E3B32Ef/logo-128.png',
        token: {
          name: 'Curve.fi bBTC/sbtcCRV',
          symbol: 'bBTC/sbtcCRV',
          address: '0x410e3E86ef427e30B9235497143881f717d93c2A',
          decimals: 18,
          display_name: 'crvBBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x410e3E86ef427e30B9235497143881f717d93c2A/logo-128.png',
        },
        tvl: {
          total_assets: 1017427299803942208685,
          price: 36654.170387276674,
          tvl: 37292953.60368053,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.30325558933589924,
          net_apy: 0.23435359091773522,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.00954650081883135,
            boosted_apr: 0.28958059570899075,
            base_apr: 0.1158322382835963,
            cvx_apr: 0.2909317087215337,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xe9Fd1BEfdd412C8966689A64dE74a783AfA6AD57',
            name: 'CurvebBTC/sbtcCRVVoterProxy',
          },
          {
            address: '0xE9ac8D34C546CBfdAD98F9a4546Db5fE08D01bF2',
            name: 'ConvexbBTC/sbtcCRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032707,
        special: false,
      },
      {
        inception: 12298151,
        address: '0x23D3D0f1c697247d5e0a9efB37d8b0ED0C464f7f',
        symbol: 'yvCurve-tBTC',
        name: 'yvCurve-tBTC 0.3.5',
        display_name: 'crvTBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x23D3D0f1c697247d5e0a9efB37d8b0ED0C464f7f/logo-128.png',
        token: {
          name: 'Curve.fi tBTC/sbtcCrv',
          symbol: 'tbtc/sbtcCrv',
          address: '0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd',
          decimals: 18,
          display_name: 'crvTBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x64eda51d3Ad40D56b9dFc5554E06F94e1Dd786Fd/logo-128.png',
        },
        tvl: {
          total_assets: 1504450336141303365,
          price: 36557.62527156643,
          tvl: 54999.13162833592,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.08593216236508994,
          net_apy: 0.046973937591352266,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.0029620200255908724,
            boosted_apr: 0.04785640577998672,
            base_apr: 0.01914256231199469,
            cvx_apr: 0.08272510891028761,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x060E04305C07DdE40A9f57bB4fFAcd662D51Ab96',
            name: 'Curvetbtc/sbtcCrvVoterProxy',
          },
          {
            address: '0x07fb6A53185E2F095253099A47F34CD410eB2A89',
            name: 'Convextbtc/sbtcCrv',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032708,
        special: false,
      },
      {
        inception: 12233959,
        address: '0x7Da96a3891Add058AdA2E826306D812C638D87a7',
        symbol: 'yvUSDT',
        name: 'yvUSDT 0.3.5',
        display_name: 'USDT',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x7Da96a3891Add058AdA2E826306D812C638D87a7/logo-128.png',
        token: {
          name: 'Tether USD',
          symbol: 'USDT',
          address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
          decimals: 6,
          display_name: 'USDT',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo-128.png',
        },
        tvl: { total_assets: 162144897928505, price: 1, tvl: 162144897.928505 },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.10645189778976992,
          net_apy: 0.07156003742204432,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0339608083630987,
            month_ago: 0.07156003742204432,
            inception: 0.06856138095153251,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x01b54c320d6B3057377cbc71d953d1BBa84df44e',
            name: 'StrategyIdleidleUSDTYield',
          },
          {
            address: '0x2f87c5e8396F0C41b86aad4F3C8358aB21681952',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0xf840d061E83025F4cD6610AE5DDebCcA43327f9f',
            name: 'SingleSidedCrvUSDT',
          },
          {
            address: '0x82292B8035873d7DD8a96767F6b3F885564aa919',
            name: 'StrategyAH2EarncyUSDT',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 6,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032709,
        special: false,
      },
      {
        inception: 12185982,
        address: '0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E',
        symbol: 'yvWBTC',
        name: 'yvWBTC 0.3.5',
        display_name: 'WBTC',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xA696a63cc78DfFa1a63E9E50587C197387FF6C7E/logo-128.png',
        token: {
          name: 'Wrapped BTC',
          symbol: 'WBTC',
          address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
          decimals: 8,
          display_name: 'WBTC',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599/logo-128.png',
        },
        tvl: {
          total_assets: 491811335776,
          price: 36427.13697315,
          tvl: 179152788.9326022,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.047118180254230854,
          net_apy: 0.02192695839811192,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.013951393513105892,
            month_ago: 0.02192695839811192,
            inception: 0.048622625982147206,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x148f64a2BeD9c815EDcD43754d3323283830070c',
            name: 'SingleSidedCrvWBTC',
          },
          {
            address: '0x53a65c8e238915c79a1e5C366Bc133162DBeE34f',
            name: 'yvWBTCStratMMV1',
          },
          {
            address: '0xe9bD008A97e362F7C501F6F5532A348d2e6B8131',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0x04A508664B053E0A08d5386303E649925CBF763c',
            name: 'StrategyMakerWBTCDAIDelegate',
          },
          {
            address: '0xb85413f6d07454828eAc7E62df7d847316475178',
            name: 'SingleSidedCrvWBTC',
          },
          {
            address: '0xAE159E657712CC68C8A28B6749eC044a7fEABe21',
            name: 'AaveLenderWBTCBorrowerUSDC',
          },
          {
            address: '0x6598d4366D5A45De4Bf2D2468D877E0b6436Ae76',
            name: 'Strategy Vesper WBTC',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 8,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032715,
        special: false,
      },
      {
        inception: 12283723,
        address: '0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139',
        symbol: 'yvCurve-FRAX',
        name: 'yvCurve-FRAX 0.3.5',
        display_name: 'crvFRAX',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xB4AdA607B9d6b2c9Ee07A275e9616B84AC560139/logo-128.png',
        token: {
          name: 'Curve.fi Factory USD Metapool: Frax',
          symbol: 'FRAX3CRV-f',
          address: '0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B',
          decimals: 18,
          display_name: 'crvFRAX',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xd632f22692FaC7611d2AA1C0D552930D43CAEd3B/logo-128.png',
        },
        tvl: {
          total_assets: 43938235204239696220724801,
          price: 1.0046820576643887,
          tvl: 44143956.55513742,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.3747602506845489,
          net_apy: 0.2992689845744241,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 1.5113081717954944,
            pool_apy: 0.014449629135897979,
            boosted_apr: 0.26544486239591825,
            base_apr: 0.16975402113435356,
            cvx_apr: 0.444911987663875,
            rewards_apr: 0.008894223060424618,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x8423590CD0343c4E18d35aA780DF50a5751bebae',
            name: 'CurveFRAX3CRV-fVoterProxy',
          },
          {
            address: '0x8c312B63Bc4000f61E1C4df4868A3A1f09b31A73',
            name: 'ConvexFRAX3CRV-f',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032716,
        special: false,
      },
      {
        inception: 12339355,
        address: '0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42',
        symbol: 'yvUNI',
        name: 'yvUNI 0.3.5',
        display_name: 'UNI',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xFBEB78a723b8087fD2ea7Ef1afEc93d35E8Bed42/logo-128.png',
        token: {
          name: 'Uniswap',
          symbol: 'UNI',
          address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
          decimals: 18,
          display_name: 'UNI',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984/logo-128.png',
        },
        tvl: {
          total_assets: 48033779462739532856045,
          price: 20.25959020491766,
          tvl: 973144.687908493,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.024621467517154088,
          net_apy: 0.003703885078018112,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0,
            month_ago: 0.003703885078018112,
            inception: 0.003910282339084564,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x5e882c9f00209315e049B885B9b3dfbEe60D80A4',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0x6EB00860260CF51623737e17579Db797d71cd337',
            name: 'PoolTogether Uniswap',
          },
          {
            address: '0x9Ae0B9a67cF5D603847980D95Ad4D45b57Ff7783',
            name: 'StrategyMakerUNIDAIDelegate',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032717,
        special: false,
      },
      {
        inception: 12245163,
        address: '0x8ee57c05741aA9DB947A744E713C15d4d19D8822',
        symbol: 'yvCurve-yBUSD',
        name: 'yvCurve-yBUSD 0.3.5',
        display_name: 'crvYBUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x8ee57c05741aA9DB947A744E713C15d4d19D8822/logo-128.png',
        token: {
          name: 'Curve.fi yDAI/yUSDC/yUSDT/yBUSD',
          symbol: 'yDAI+yUSDC+yUSDT+yBUSD',
          address: '0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B',
          decimals: 18,
          display_name: 'crvYBUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x3B3Ac5386837Dc563660FB6a0937DFAa5924333B/logo-128.png',
        },
        tvl: {
          total_assets: 13768927624785215749188269,
          price: 1.1161746341107794,
          tvl: 15368527.75369244,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.15423714791358156,
          net_apy: 0.10482753738366202,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 1.9391896252064131,
            pool_apy: 0.028134633534243614,
            boosted_apr: 0.08654624196024767,
            base_apr: 0.044630107770422624,
            cvx_apr: 0.1587572625931524,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xB3E1a513a2fE74EcF397dF9C0E6BCe5B57A961C8',
            name: 'CurveyDAI+yUSDC+yUSDT+yBUSDVoterProxy',
          },
          {
            address: '0x3cA0B4d7eedE71061B0bAdb4F0E86E99b0FEa613',
            name: 'ConvexyDAI+yUSDC+yUSDT+yBUSD',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032717,
        special: false,
      },
      {
        inception: 12245239,
        address: '0xD6Ea40597Be05c201845c0bFd2e96A60bACde267',
        symbol: 'yvCurve-Compound',
        name: 'yvCurve-Compound 0.3.5',
        display_name: 'crvCOMP',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xD6Ea40597Be05c201845c0bFd2e96A60bACde267/logo-128.png',
        token: {
          name: 'Curve.fi cDAI/cUSDC',
          symbol: 'cDAI+cUSDC',
          address: '0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2',
          decimals: 18,
          display_name: 'crvCOMP',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x845838DF265Dcd2c412A1Dc9e959c7d08537f8a2/logo-128.png',
        },
        tvl: {
          total_assets: 10817984692565817240009821,
          price: 1.0779706834061822,
          tvl: 11661470.352122791,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.10444601217124783,
          net_apy: 0.06373260568310612,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.4999999999999996,
            pool_apy: 0.02276393395876619,
            boosted_apr: 0.07369061347437751,
            base_apr: 0.029476245389751007,
            cvx_apr: 0.08603750266346567,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xdDAAc8B5Dd65d079b6572e43890BDD8d95bD5cc3',
            name: 'CurvecDAI+cUSDCVoterProxy',
          },
          {
            address: '0x2b0b941d98848d6c9C729d944E3B1BD9C00A5529',
            name: 'ConvexcDAI+cUSDC',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032718,
        special: false,
      },
      {
        inception: 12298129,
        address: '0x2a38B9B0201Ca39B17B460eD2f11e4929559071E',
        symbol: 'yvCurve-GUSD',
        name: 'yvCurve-GUSD 0.3.5',
        display_name: 'crvGUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x2a38B9B0201Ca39B17B460eD2f11e4929559071E/logo-128.png',
        token: {
          name: 'Curve.fi GUSD/3Crv',
          symbol: 'gusd3CRV',
          address: '0xD2967f45c4f384DEEa880F807Be904762a3DeA07',
          decimals: 18,
          display_name: 'crvGUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xD2967f45c4f384DEEa880F807Be904762a3DeA07/logo-128.png',
        },
        tvl: {
          total_assets: 7016145814066686859052239,
          price: 1.0177458972611215,
          tvl: 7140653.6168521615,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.1548819201617304,
          net_apy: 0.10174991623610685,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.4999999999999996,
            pool_apy: 0.012502072396955777,
            boosted_apr: 0.1256142054308575,
            base_apr: 0.05024568217234301,
            cvx_apr: 0.15562936264937458,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x9C1117cf2ED3A0F4A9F069001F517c1D511c8B53',
            name: 'Curvegusd3CRVVoterProxy',
          },
          {
            address: '0x2D42CFdC6a1B03490892AdF7DC6c62AA7228E5D6',
            name: 'Convexgusd3CRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032718,
        special: false,
      },
      {
        inception: 12286016,
        address: '0x4B5BfD52124784745c1071dcB244C6688d2533d3',
        symbol: 'yUSD',
        name: 'yUSD 0.3.5',
        display_name: 'yCRV',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x4B5BfD52124784745c1071dcB244C6688d2533d3/logo-128.png',
        token: {
          name: 'Curve.fi yDAI/yUSDC/yUSDT/yTUSD',
          symbol: 'yDAI+yUSDC+yUSDT+yTUSD',
          address: '0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8',
          decimals: 18,
          display_name: 'yCRV',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xdF5e0e81Dff6FAF3A7e52BA697820c5e32D806A8/logo-128.png',
        },
        tvl: {
          total_assets: 14590603725624451190696703,
          price: 1.110661730319143,
          tvl: 16205225.180302987,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.08977745454542063,
          net_apy: 0.056537992339916965,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.03664798877408848,
            boosted_apr: 0.029648782905611487,
            base_apr: 0.011859513162244595,
            cvx_apr: 0.051251211931797186,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x6d45c5a8C1cF1f77Ab89cAF8D44917730298bab7',
            name: 'CurveyDAI+yUSDC+yUSDT+yTUSDVoterProxy',
          },
          {
            address: '0xA5189cb0149761A8346D64E384924b2394dFa595',
            name: 'ConvexyDAI+yUSDC+yUSDT+yTUSD',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032719,
        special: false,
      },
      {
        inception: 12245666,
        address: '0x84E13785B5a27879921D6F685f041421C7F482dA',
        symbol: 'yvCurve-3pool',
        name: 'yvCurve-3pool 0.3.5',
        display_name: '3Crv',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x84E13785B5a27879921D6F685f041421C7F482dA/logo-128.png',
        token: {
          name: 'Curve.fi DAI/USDC/USDT',
          symbol: '3Crv',
          address: '0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490',
          decimals: 18,
          display_name: '3Crv',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x6c3F90f043a72FA612cbac8115EE7e52BDe6E490/logo-128.png',
        },
        tvl: {
          total_assets: 6546453896370221808906364,
          price: 1.0176856860654178,
          tvl: 6662232.424823157,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.11717666497624912,
          net_apy: 0.07266197495703319,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.006555745274199332,
            boosted_apr: 0.06357731214746207,
            base_apr: 0.02543092485898483,
            cvx_apr: 0.1099004404092047,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x9d7c11D1268C8FD831f1b92A304aCcb2aBEbfDe1',
            name: 'Curve3CrvVoterProxy',
          },
          {
            address: '0xeC088B98e71Ba5FFAf520c2f6A6F0153f1bf494B',
            name: 'Convex3Crv',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032720,
        special: false,
      },
      {
        inception: 12305727,
        address: '0xf8768814b88281DE4F532a3beEfA5b85B69b9324',
        symbol: 'yvCurve-TUSD',
        name: 'yvCurve-TUSD 0.3.5',
        display_name: 'crvTUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xf8768814b88281DE4F532a3beEfA5b85B69b9324/logo-128.png',
        token: {
          name: 'Curve.fi Factory USD Metapool: TrueUSD',
          symbol: 'TUSD3CRV-f',
          address: '0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1',
          decimals: 18,
          display_name: 'crvTUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xEcd5e75AFb02eFa118AF914515D6521aaBd189F1/logo-128.png',
        },
        tvl: {
          total_assets: 602930066506082091669330,
          price: 1.0030017503343247,
          tvl: 604739.9120347911,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.10726828359376328,
          net_apy: 0.06301104527256995,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.4999999999999996,
            pool_apy: 0.007805036820742517,
            boosted_apr: 0.0879470594456326,
            base_apr: 0.03517882377825304,
            cvx_apr: 0.10943882996565868,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xF088aC5ebf8423b894903312AaC8Ac42c3Ab3A02',
            name: 'CurveTUSD3CRV-fVoterProxy',
          },
          {
            address: '0x270101459e9A38Db38Ba4Cb8718FfA31953A9Af3',
            name: 'ConvexTUSD3CRV-f',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032721,
        special: false,
      },
      {
        inception: 12283876,
        address: '0x6Ede7F19df5df6EF23bD5B9CeDb651580Bdf56Ca',
        symbol: 'yvCurve-BUSD',
        name: 'yvCurve-BUSD 0.3.5',
        display_name: 'crvBUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x6Ede7F19df5df6EF23bD5B9CeDb651580Bdf56Ca/logo-128.png',
        token: {
          name: 'Curve.fi Factory USD Metapool: Binance USD',
          symbol: 'BUSD3CRV-f',
          address: '0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a',
          decimals: 18,
          display_name: 'crvBUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x4807862AA8b2bF68830e4C8dc86D0e9A998e085a/logo-128.png',
        },
        tvl: {
          total_assets: 41884034149633085817919395,
          price: 1.0028167931918879,
          tvl: 42002012.811874576,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.2002024674334706,
          net_apy: 0.1420794846814597,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.006984919673344692,
            boosted_apr: 0.19038654559896295,
            base_apr: 0.07615461823958518,
            cvx_apr: 0.19187730023087482,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xD670439D889f9Eb16497d8D6EA9a5E549ae5bFF5',
            name: 'CurveBUSD3CRV-fVoterProxy',
          },
          {
            address: '0xA44F947e51Ec6456A1d786F82ea5865F87Da9C30',
            name: 'ConvexBUSD3CRV-f',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032722,
        special: false,
      },
      {
        inception: 12293189,
        address: '0x30FCf7c6cDfC46eC237783D94Fc78553E79d4E9C',
        symbol: 'yvCurve-DUSD',
        name: 'yvCurve-DUSD 0.3.5',
        display_name: 'crvDUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x30FCf7c6cDfC46eC237783D94Fc78553E79d4E9C/logo-128.png',
        token: {
          name: 'Curve.fi DUSD/3Crv',
          symbol: 'dusd3CRV',
          address: '0x3a664Ab939FD8482048609f652f9a0B0677337B9',
          decimals: 18,
          display_name: 'crvDUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x3a664Ab939FD8482048609f652f9a0B0677337B9/logo-128.png',
        },
        tvl: {
          total_assets: 2258578966481327754307952,
          price: 1.0106737165916573,
          tvl: 2282686.398269428,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.1918823213418277,
          net_apy: 0.13109620034516223,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 1.9050799004651795,
            pool_apy: 0.003122334417646311,
            boosted_apr: 0.16061282733776872,
            base_apr: 0.08430765937877488,
            cvx_apr: 0.2157320718788645,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x4C547b6202247E7B7c45A95d7747A85704530ab3',
            name: 'Curvedusd3CRVVoterProxy',
          },
          {
            address: '0x33d7E0Fa2c7Db85Ef3AbC1C44e07E0b5cB2E4C14',
            name: 'Convexdusd3CRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032726,
        special: false,
      },
      {
        inception: 12298048,
        address: '0x1C6a9783F812b3Af3aBbf7de64c3cD7CC7D1af44',
        symbol: 'yvCurve-UST',
        name: 'yvCurve-UST 0.3.5',
        display_name: 'crvUST',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x1C6a9783F812b3Af3aBbf7de64c3cD7CC7D1af44/logo-128.png',
        token: {
          name: 'Curve.fi UST/3Crv',
          symbol: 'ust3CRV',
          address: '0x94e131324b6054c0D789b190b2dAC504e4361b53',
          decimals: 18,
          display_name: 'crvUST',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x94e131324b6054c0D789b190b2dAC504e4361b53/logo-128.png',
        },
        tvl: {
          total_assets: 6057273256354205141892259,
          price: 1.0192043551763978,
          tvl: 6173599.283369727,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.10102266696429929,
          net_apy: 0.06303791149879479,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.031818695124882,
            boosted_apr: 0.06079216138055229,
            base_apr: 0.024316864552220915,
            cvx_apr: 0.07334762919775577,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xbf811462955DEeD9aaD62EFE771E34e8B5811857',
            name: 'Curveust3CRVVoterProxy',
          },
          {
            address: '0x0921E388e86bbE0356e37413F946ccE47EDd294D',
            name: 'Convexust3CRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032726,
        special: false,
      },
      {
        inception: 12293207,
        address: '0x8cc94ccd0f3841a468184aCA3Cc478D2148E1757',
        symbol: 'yvCurve-mUSD',
        name: 'yvCurve-mUSD 0.3.5',
        display_name: 'crvMUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x8cc94ccd0f3841a468184aCA3Cc478D2148E1757/logo-128.png',
        token: {
          name: 'Curve.fi MUSD/3Crv',
          symbol: 'musd3CRV',
          address: '0x1AEf73d49Dedc4b1778d0706583995958Dc862e6',
          decimals: 18,
          display_name: 'crvMUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x1AEf73d49Dedc4b1778d0706583995958Dc862e6/logo-128.png',
        },
        tvl: {
          total_assets: 7225731188316258810621314,
          price: 1.0127829639425157,
          tvl: 7318097.449554816,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.15506658995228384,
          net_apy: 0.10349210970358502,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 1.9901070664446958,
            pool_apy: 0.01179142064337757,
            boosted_apr: 0.12113125930441036,
            base_apr: 0.06086670478529078,
            cvx_apr: 0.1467239851744852,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xf9fF7f463A7e6f43d4E65c230D3743355fC954e4',
            name: 'Curvemusd3CRVVoterProxy',
          },
          {
            address: '0x75be6ABC02a010559Ed5c7b0Eab94abD2B783b65',
            name: 'Convexmusd3CRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032727,
        special: false,
      },
      {
        inception: 12064975,
        address: '0xa5cA62D95D24A4a350983D5B8ac4EB8638887396',
        symbol: 'yvsUSD',
        name: 'yvsUSD 0.3.3',
        display_name: 'sUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xa5cA62D95D24A4a350983D5B8ac4EB8638887396/logo-128.png',
        token: {
          name: 'Synth sUSD',
          symbol: 'sUSD',
          address: '0x57Ab1ec28D129707052df4dF418D58a2D46d5f51',
          decimals: 18,
          display_name: 'sUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x57Ab1ec28D129707052df4dF418D58a2D46d5f51/logo-128.png',
        },
        tvl: {
          total_assets: 11826117706530341206937661,
          price: 1,
          tvl: 11826117.706530342,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.05342723208761278,
          net_apy: 0.02709549582033866,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.12003069369428067,
            month_ago: 0.02709549582033866,
            inception: 0.20913091349131516,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x215DeE632335829155Dcb62452c4878C48c1C884',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0x74b3E5408B1c29E571BbFCd94B09D516A4d81f36',
            name: 'SingleSidedCrvsUSD',
          },
          {
            address: '0xdB45E3a0DAE3ced82Cd1ea92F3bF9E21fbCFD8d6',
            name: 'SingleSidedCrvSynthsETH',
          },
          {
            address: '0x95eA1643699F8DE347975F31CA8d03eCC507616c',
            name: 'SingleSidedCrvsUSD',
          },
        ],
        endorsed: true,
        version: '0.3.3',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032728,
        special: false,
      },
      {
        inception: 12272748,
        address: '0xF29AE508698bDeF169B89834F76704C3B205aedf',
        symbol: 'yvSNX',
        name: 'yvSNX 0.3.5',
        display_name: 'SNX',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xF29AE508698bDeF169B89834F76704C3B205aedf/logo-128.png',
        token: {
          name: 'Synthetix Network Token',
          symbol: 'SNX',
          address: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
          decimals: 18,
          display_name: 'SNX',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F/logo-128.png',
        },
        tvl: {
          total_assets: 1003561430317241735199353,
          price: 8.160089093760721,
          tvl: 8189150.682450634,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.19772583555508702,
          net_apy: 0.1525612545314917,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0,
            month_ago: 0.1525612545314917,
            inception: 0.10842465264112447,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x695F00450641968b264e1d2e98dFF3e013143a37',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0xFB5F4E0656ebfF31743e674d324554fd185e1c4b',
            name: 'StrategySynthetixSusdMinter',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032729,
        special: false,
      },
      {
        inception: 12298199,
        address: '0x5a770DbD3Ee6bAF2802D29a901Ef11501C44797A',
        symbol: 'yvCurve-sUSD',
        name: 'yvCurve-sUSD 0.3.5',
        display_name: 'crvSUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5a770DbD3Ee6bAF2802D29a901Ef11501C44797A/logo-128.png',
        token: {
          name: 'Curve.fi DAI/USDC/USDT/sUSD',
          symbol: 'crvPlain3andSUSD',
          address: '0xC25a3A3b969415c80451098fa907EC722572917F',
          decimals: 18,
          display_name: 'crvSUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xC25a3A3b969415c80451098fa907EC722572917F/logo-128.png',
        },
        tvl: {
          total_assets: 13851507586957981295557493,
          price: 1.0402843812597515,
          tvl: 14409506.99961334,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.12352377263446535,
          net_apy: 0.07830065302736271,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.4999999999999996,
            pool_apy: 0.010017771069160908,
            boosted_apr: 0.08264577936198483,
            base_apr: 0.028574157486591478,
            cvx_apr: 0.11981380819038849,
            rewards_apr: 0.011210385645506157,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x9730F52AB5BcEc960bE41b0fE4913a09c0B57066',
            name: 'CurvecrvPlain3andSUSDVoterProxy',
          },
          {
            address: '0xFA773b91b59B0895877c769000b9824b46b13a20',
            name: 'ConvexcrvPlain3andSUSD',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032730,
        special: false,
      },
      {
        inception: 12298192,
        address: '0xf2db9a7c0ACd427A680D640F02d90f6186E71725',
        symbol: 'yvCurve-LINK',
        name: 'yvCurve-LINK 0.3.5',
        display_name: 'crvLINK',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xf2db9a7c0ACd427A680D640F02d90f6186E71725/logo-128.png',
        token: {
          name: 'Curve.fi LINK/sLINK',
          symbol: 'linkCRV',
          address: '0xcee60cFa923170e4f8204AE08B4fA6A3F5656F3a',
          decimals: 18,
          display_name: 'crvLINK',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xcee60cFa923170e4f8204AE08B4fA6A3F5656F3a/logo-128.png',
        },
        tvl: {
          total_assets: 2312311175937255590049258,
          price: 21.470136894771493,
          tvl: 49645637.49068292,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.11246744130505348,
          net_apy: 0.06604430912527848,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 1.9481114145743277,
            pool_apy: 0.0006992749901537643,
            boosted_apr: 0.09089778412374347,
            base_apr: 0.04665943818393215,
            cvx_apr: 0.13248234436890402,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x0E94D346D8A53FEF83484b178a581695E0001E55',
            name: 'CurvelinkCRVVoterProxy',
          },
          {
            address: '0xb7f013426d33fe27e4E8ABEE58500268554736bD',
            name: 'ConvexlinkCRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032730,
        special: false,
      },
      {
        inception: 12298161,
        address: '0x3B96d491f067912D18563d56858Ba7d6EC67a6fa',
        symbol: 'yvCurve-USDN',
        name: 'yvCurve-USDN 0.3.5',
        display_name: 'crvUSDN',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x3B96d491f067912D18563d56858Ba7d6EC67a6fa/logo-128.png',
        token: {
          name: 'Curve.fi USDN/3Crv',
          symbol: 'usdn3CRV',
          address: '0x4f3E8F405CF5aFC05D68142F3783bDfE13811522',
          decimals: 18,
          display_name: 'crvUSDN',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x4f3E8F405CF5aFC05D68142F3783bDfE13811522/logo-128.png',
        },
        tvl: {
          total_assets: 137681104145212875937138874,
          price: 1.0303584209097256,
          tvl: 141860885.05616903,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.25760555318203027,
          net_apy: 0.2524486641833542,
          fees: {
            performance: 0.0,
            withdrawal: null,
            management: 0.0,
            keep_crv: 0.5,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.026236507047066038,
            boosted_apr: 0.22913111185800472,
            base_apr: 0.09165244474320189,
            cvx_apr: 0.22480500696996827,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.0,
          withdrawal: null,
          management: 0.0,
          keep_crv: 0.5,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x23a09D84e50fF3fDFa270308851443734b0a4b6D',
            name: 'Curveusdn3CRVVoterProxy',
          },
          {
            address: '0x8e87e65Cb28c069550012f92d5470dB6EB6897c0',
            name: 'Convexusdn3CRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032731,
        special: false,
      },
      {
        inception: 12298233,
        address: '0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417',
        symbol: 'yvCurve-USDP',
        name: 'yvCurve-USDP 0.3.5',
        display_name: 'crvUSDP',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xC4dAf3b5e2A9e93861c3FBDd25f1e943B8D87417/logo-128.png',
        token: {
          name: 'Curve.fi USDP/3Crv',
          symbol: 'usdp3CRV',
          address: '0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6',
          decimals: 18,
          display_name: 'crvUSDP',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x7Eb40E450b9655f4B3cC4259BCC731c63ff55ae6/logo-128.png',
        },
        tvl: {
          total_assets: 41362391119291781941100169,
          price: 1.0045030239156119,
          tvl: 41548646.95570884,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.19379701594233856,
          net_apy: 0.12979705000451255,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.004805393097772059,
            boosted_apr: 0.19038117630047274,
            base_apr: 0.0761524705201891,
            cvx_apr: 0.18161104547918314,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x94fA3A90E680f6b866545C904D1dc9DEe6416de9',
            name: 'Curveusdp3CRVVoterProxy',
          },
          {
            address: '0xfb0702469A1a0440E87C06605461E8660FD0F43d',
            name: 'Convexusdp3CRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032732,
        special: false,
      },
      {
        inception: 12484682,
        address: '0xA74d4B67b3368E83797a35382AFB776bAAE4F5C8',
        symbol: 'yvCurve-alUSD',
        name: 'yvCurve-alUSD 0.3.5',
        display_name: 'crvALUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xA74d4B67b3368E83797a35382AFB776bAAE4F5C8/logo-128.png',
        token: {
          name: 'Curve.fi Factory USD Metapool: Alchemix USD',
          symbol: 'alUSD3CRV-f',
          address: '0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c',
          decimals: 18,
          display_name: 'crvALUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x43b4FdFD4Ff969587185cDB6f0BD875c5Fc83f8c/logo-128.png',
        },
        tvl: {
          total_assets: 74439852440063240151721491,
          price: 1.005603695121058,
          tvl: 74856990.67799391,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.192290605595006,
          net_apy: 0.13834322252878894,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.01189155787039442,
            boosted_apr: 0.17434574471966763,
            base_apr: 0.030921111226113185,
            cvx_apr: 0.18221231987032788,
            rewards_apr: 0.09704296665438467,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x31CD90D60516ED18750bA49b2C9d1053190F40d9',
            name: 'CurvealUSD3CRV-fVoterProxy',
          },
          {
            address: '0xf8Fb278DeeaF30Ff3F6326d928A61eA8b9397d16',
            name: 'ConvexalUSD3CRV-f',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032733,
        special: false,
      },
      {
        inception: 12484685,
        address: '0xBfedbcbe27171C418CDabC2477042554b1904857',
        symbol: 'yvCurve-rETH',
        name: 'yvCurve-rETH 0.3.5',
        display_name: 'crvRETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xBfedbcbe27171C418CDabC2477042554b1904857/logo-128.png',
        token: {
          name: 'Curve.fi ETH/rETH',
          symbol: 'rCRV',
          address: '0x53a901d48795C58f485cBB38df08FA96a24669D5',
          decimals: 18,
          display_name: 'crvRETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x53a901d48795C58f485cBB38df08FA96a24669D5/logo-128.png',
        },
        tvl: {
          total_assets: 3164000037948106950422,
          price: 2222.604946048557,
          tvl: 7032322.133641284,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.20611835892943686,
          net_apy: 0.145858876024332,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 1.7576543652045433,
            pool_apy: 0.009240116736747739,
            boosted_apr: 0.15468857224626775,
            base_apr: 0.07587716793095954,
            cvx_apr: 0.2354628672927594,
            rewards_apr: 0.021322736813058532,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x8E4AA2E00694Adaf37f0311651262671f4d7Ac16',
            name: 'ConvexrCRV',
          },
          {
            address: '0x16468a3999d931Dd6b6ffA0086Cf195D6C5BDAFA',
            name: 'CurverCRVVoterProxy',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032734,
        special: false,
      },
      {
        inception: 12293061,
        address: '0x132d8D2C76Db3812403431fAcB00F3453Fc42125',
        symbol: 'yvCurve-ankrETH',
        name: 'yvCurve-ankrETH 0.3.5',
        display_name: 'crvAETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x132d8D2C76Db3812403431fAcB00F3453Fc42125/logo-128.png',
        token: {
          name: 'Curve.fi ETH/aETH',
          symbol: 'ankrCRV',
          address: '0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf',
          decimals: 18,
          display_name: 'crvAETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xaA17A236F2bAdc98DDc0Cf999AbB47D47Fc0A6Cf/logo-128.png',
        },
        tvl: {
          total_assets: 5150298634087818097195,
          price: 2260.5021427746897,
          tvl: 11642261.09828507,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.14754370778707093,
          net_apy: 0.09695000113698393,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.028486704537395,
            pool_apy: 0.018344046304846096,
            boosted_apr: 0.1102079304157315,
            base_apr: 0.05433012213943245,
            cvx_apr: 0.14353668949153364,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x32EF165F2ABbdbE7dcC25B86EdB14a2C0dc52571',
            name: 'CurveankrCRVVoterProxy',
          },
          {
            address: '0xB194dCFF4E11d26919Ce3B3255F69aEca5951e88',
            name: 'ConvexankrCRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032735,
        special: false,
      },
      {
        inception: 12298216,
        address: '0x39CAF13a104FF567f71fd2A4c68C026FDB6E740B',
        symbol: 'yvCurve-Aave',
        name: 'yvCurve-Aave 0.3.5',
        display_name: 'crvAAVE',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x39CAF13a104FF567f71fd2A4c68C026FDB6E740B/logo-128.png',
        token: {
          name: 'Curve.fi aDAI/aUSDC/aUSDT',
          symbol: 'a3CRV',
          address: '0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900',
          decimals: 18,
          display_name: 'crvAAVE',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xFd2a8fA60Abd58Efe3EeE34dd494cD491dC14900/logo-128.png',
        },
        tvl: {
          total_assets: 16269851534760032373241896,
          price: 1.0563358571322103,
          tvl: 17186427.566384546,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.1384534123210297,
          net_apy: 0.09351892640165317,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.03175463659543776,
            boosted_apr: 0.07443627767797183,
            base_apr: 0.029774511071188732,
            cvx_apr: 0.11065952306010356,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0xB11FC91DF59ADc604485f1B25ABa1F96A685473f',
            name: 'Curvea3CRVVoterProxy',
          },
          {
            address: '0xAC4AE0B06C913dF4608dB60E2571a8e91b74C619',
            name: 'Convexa3CRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032735,
        special: false,
      },
      {
        inception: 12298072,
        address: '0x054AF22E1519b020516D72D749221c24756385C9',
        symbol: 'yvCurve-HUSD',
        name: 'yvCurve-HUSD 0.3.5',
        display_name: 'crvHUSD',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x054AF22E1519b020516D72D749221c24756385C9/logo-128.png',
        token: {
          name: 'Curve.fi HUSD/3Crv',
          symbol: 'husd3CRV',
          address: '0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858',
          decimals: 18,
          display_name: 'crvHUSD',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x5B5CFE992AdAC0C9D48E05854B2d91C73a003858/logo-128.png',
        },
        tvl: {
          total_assets: 7585997664462822767784,
          price: 1.0131094168086638,
          tvl: 7685.445669755817,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.12552190188608336,
          net_apy: 0.07648173138187087,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 2.5,
            pool_apy: 0.00539566938408953,
            boosted_apr: 0.12549753762298765,
            base_apr: 0.05019901504919506,
            cvx_apr: 0.11346556150311775,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x5ED527A2cfC5411EB63b12E46e270b07b6813824',
            name: 'Curvehusd3CRVVoterProxy',
          },
          {
            address: '0xdC929e76081a78e5c32552C2e79D29ECab3F6755',
            name: 'Convexhusd3CRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032736,
        special: false,
      },
      {
        inception: 12298088,
        address: '0x25212Df29073FfFA7A67399AcEfC2dd75a831A1A',
        symbol: 'yvCurve-EURS',
        name: 'yvCurve-EURS 0.3.5',
        display_name: 'crvEURS',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x25212Df29073FfFA7A67399AcEfC2dd75a831A1A/logo-128.png',
        token: {
          name: 'Curve.fi EURS/sEUR',
          symbol: 'eursCRV',
          address: '0x194eBd173F6cDacE046C53eACcE9B953F28411d1',
          decimals: 18,
          display_name: 'crvEURS',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x194eBd173F6cDacE046C53eACcE9B953F28411d1/logo-128.png',
        },
        tvl: {
          total_assets: 47149589999656568625825158,
          price: 1.1880245805425966,
          tvl: 56014871.8820974,
        },
        apy: {
          type: 'crv',
          gross_apr: 0.25606736261858587,
          net_apy: 0.18409575618776014,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: 0.1,
            cvx_keep_crv: 0.1,
          },
          points: null,
          composite: {
            boost: 1.932262730037267,
            pool_apy: 0.002595080241743153,
            boosted_apr: 0.22970521823805273,
            base_apr: 0.11887887432037902,
            cvx_apr: 0.29642284468981644,
            rewards_apr: 0,
          },
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: 0.1,
          cvx_keep_crv: 0.1,
        },
        strategies: [
          {
            address: '0x53cE22d5b4F667eC73710d428E828Cd96E9a37C9',
            name: 'CurveeursCRVVoterProxy',
          },
          {
            address: '0x4DC2CCC9E76bD30982243C1cB915003e17a88Eb9',
            name: 'ConvexeursCRV',
          },
        ],
        endorsed: true,
        version: '0.3.5',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032736,
        special: false,
      },
      {
        inception: 12542636,
        address: '0x671a912C10bba0CFA74Cfc2d6Fba9BA1ed9530B2',
        symbol: 'yvLINK',
        name: 'yvLINK 0.4.2',
        display_name: 'LINK',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x671a912C10bba0CFA74Cfc2d6Fba9BA1ed9530B2/logo-128.png',
        token: {
          name: 'ChainLink Token',
          symbol: 'LINK',
          address: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
          decimals: 18,
          display_name: 'LINK',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x514910771AF9Ca656af840dff83E8264EcF986CA/logo-128.png',
        },
        tvl: {
          total_assets: 739254623015960117983092,
          price: 21.45119645,
          tvl: 15857896.144886052,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.02687537848421904,
          net_apy: 0.005515164743500873,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.02443170091405898,
            month_ago: 0.005515164743500873,
            inception: 0.014878088069900824,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x328C39cD6cFD7DA6E64a5efdEF23CD63892f76A0',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0x8198815871a45A5a883d083B7B105927eb9919D8',
            name: 'Vesper LINK',
          },
          {
            address: '0x906f0a6f23e7160eB0927B0903ab80b5E3f3950D',
            name: 'AaveLenderLINKBorrowerSUSD',
          },
          {
            address: '0x136fe75bfDf142a917C954F58577DB04ef6F294B',
            name: 'StrategyMakerLINKDAIDelegate',
          },
        ],
        endorsed: true,
        version: '0.4.2',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032737,
        special: false,
      },
      {
        inception: 12570773,
        address: '0x873fB544277FD7b977B196a826459a69E27eA4ea',
        symbol: 'yvRAI',
        name: 'yvRAI 0.4.2',
        display_name: 'RAI',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x873fB544277FD7b977B196a826459a69E27eA4ea/logo-128.png',
        token: {
          name: 'Rai Reflex Index',
          symbol: 'RAI',
          address: '0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919',
          decimals: 18,
          display_name: 'RAI',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0x03ab458634910AaD20eF5f1C8ee96F1D6ac54919/logo-128.png',
        },
        tvl: {
          total_assets: 403382279827646605629376,
          price: 2.9311132997789757,
          tvl: 1182359.1652979795,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.022511852272295556,
          net_apy: 0.002011463275304398,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.008910607647715637,
            month_ago: 0.002011463275304398,
            inception: 0.012149738650216785,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0x5D411D2cde10e138d68517c42bE2808C90c22026',
            name: 'StrategyIdleidleRAIYield',
          },
        ],
        endorsed: true,
        version: '0.4.2',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032738,
        special: false,
      },
      {
        inception: 12588794,
        address: '0xa258C4606Ca8206D8aA700cE2143D7db854D168c',
        symbol: 'yvWETH',
        name: 'yvWETH 0.4.2',
        display_name: 'ETH',
        icon:
          'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xa258C4606Ca8206D8aA700cE2143D7db854D168c/logo-128.png',
        token: {
          name: 'Wrapped Ether',
          symbol: 'WETH',
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          decimals: 18,
          display_name: 'ETH',
          icon:
            'https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo-128.png',
        },
        tvl: {
          total_assets: 48564129090458568974288,
          price: 2219.75005716,
          tvl: 107800228.32447101,
        },
        apy: {
          type: 'v2:averaged',
          gross_apr: 0.02,
          net_apy: 0.0,
          fees: {
            performance: 0.2,
            withdrawal: null,
            management: 0.02,
            keep_crv: null,
            cvx_keep_crv: null,
          },
          points: {
            week_ago: 0.0,
            month_ago: 0.0,
            inception: 0.0009001951383234303,
          },
          composite: null,
        },
        fees: {
          performance: 0.2,
          withdrawal: null,
          management: 0.02,
          keep_crv: null,
          cvx_keep_crv: null,
        },
        strategies: [
          {
            address: '0xec2DB4A1Ad431CC3b102059FA91Ba643620F0826',
            name: 'StrategyLenderYieldOptimiser',
          },
          {
            address: '0xC5e385f7Dad49F230AbD53e21b06aA0fE8dA782D',
            name: 'StrategysteCurveWETHSingleSided',
          },
          {
            address: '0x37770F958447fFa1571fc9624BFB3d673161f37F',
            name: 'StrategyeCurveWETHSingleSided',
          },
          {
            address: '0xd28b508EA08f14A473a5F332631eA1972cFd7cC0',
            name: 'AaveWETHLenderUSDTBorrower',
          },
        ],
        endorsed: true,
        version: '0.4.2',
        decimals: 18,
        type: 'v2',
        emergency_shutdown: false,
        tags: [],
        updated: 1624032738,
        special: false,
      },
    ];

    // TODO: Remove UI hacks...
    const masterChefAddress = '0xbD17B1ce622d73bD438b9E658acA5996dc394b0d';
    const correctedVaults = _.map(vaults, (vault) => {
      const newVault = vault;
      if (vault.address === masterChefAddress) {
        newVault.type = 'masterChef';
      }
      return newVault;
    });

    const filteredVaults = _.filter(
      correctedVaults,
      (vault) => _.includes(blacklist, vault.address) === false,
    );
    const vaultsWithNewApiData = mapNewApiToOldApi(filteredVaults, newVaults);
    yield put(vaultsLoaded(vaultsWithNewApiData));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

function* fetchUserVaultStatistics() {
  try {
    const selectedAccount = yield select(selectSelectedAccount());
    const vaults = yield select(selectVaults());

    const userVaultStatisticsUrl = `https://api.yearn.tools/user/${selectedAccount}/vaults?statistics=true&apy=true`;
    const userVaultStatistics = yield call(request, userVaultStatisticsUrl);
    const vaultsWithUserStatistics = vaults.reduce((current, next) => {
      const userDepositedInNextVault = userVaultStatistics.find(
        (userVaultStatistic) =>
          next.vaultAlias === userVaultStatistic.vaultAlias,
      );
      if (userDepositedInNextVault) {
        return current.concat({ ...next, ...userDepositedInNextVault });
      }
      return current.concat(next);
    }, []);
    // console.log(vaultsWithUserStatistics);
    yield put(userVaultStatisticsLoaded(vaultsWithUserStatistics));
  } catch (err) {
    console.log('Error reading vaults', err);
  }
}

function* withdrawFromVault(action) {
  const {
    vaultContract,
    withdrawalAmount,
    decimals,
    pureEthereum,
    unstakePickle,
  } = action.payload;

  const account = yield select(selectAccount());

  const vaultContractData = yield select(
    selectContractData(vaultContract.address),
  );

  const v2Vault = _.get(vaultContractData, 'pricePerShare');

  const vaultAddress = _.get(vaultContractData, 'address');
  const vaultIsAave =
    vaultAddress === crvAaveAddress ||
    vaultAddress === crvSAaveV2Address ||
    vaultAddress === crvSAaveV1Address;

  let sharesForWithdrawal;
  if (v2Vault) {
    const sharePrice = _.get(vaultContractData, 'pricePerShare');
    sharesForWithdrawal = new BigNumber(withdrawalAmount)
      .dividedBy(sharePrice / 10 ** decimals)
      .decimalPlaces(0)
      .toFixed(0);
  } else {
    const sharePrice = _.get(vaultContractData, 'getPricePerFullShare');
    sharesForWithdrawal = new BigNumber(withdrawalAmount)
      .dividedBy(sharePrice / 10 ** 18)
      .decimalPlaces(0)
      .toFixed(0);
  }

  try {
    // Vault is not eth
    if (!pureEthereum) {
      if (unstakePickle) {
        // Pickle transaction
        yield call(
          vaultContract.methods.withdraw.cacheSend,
          26,
          withdrawalAmount,
          {
            from: account,
          },
        );
      } else {
        if (vaultIsAave) {
          // Vault is AAVE
          yield call(
            vaultContract.methods.withdraw.cacheSend,
            sharesForWithdrawal,
            {
              from: account,
              gas: 2000000,
            },
          );
          return;
        }
        // Vault is not AAVE
        yield call(
          vaultContract.methods.withdraw.cacheSend,
          sharesForWithdrawal,
          {
            from: account,
          },
        );
      }
    } else {
      // Vault is ETH
      const { zapContract } = vaultContract;
      if (zapContract) {
        let method;
        if (zapContract.methods.withdrawETH) {
          method = zapContract.methods.withdrawETH;
        } else {
          method = vaultContract.methods.withdraw;
        }
        yield call(method.cacheSend, sharesForWithdrawal, {
          from: account,
        });
      } else {
        yield call(
          vaultContract.methods.withdrawETH.cacheSend,
          sharesForWithdrawal,
          {
            from: account,
          },
        );
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function* withdrawAllFromVault(action) {
  const { vaultContract, balanceOf } = action.payload;

  const vaultContractData = yield select(
    selectContractData(vaultContract.address),
  );

  const vaultAddress = _.get(vaultContractData, 'address');
  const vaultIsAave =
    vaultAddress === crvAaveAddress ||
    vaultAddress === crvSAaveV2Address ||
    vaultAddress === crvSAaveV1Address;

  const account = yield select(selectAccount());

  try {
    if (vaultIsAave) {
      yield call(vaultContract.methods.withdraw.cacheSend, balanceOf, {
        from: account,
        gas: 2000000,
      });
      return;
    }

    // if (!pureEthereum) {
    yield call(vaultContract.methods.withdraw.cacheSend, balanceOf, {
      from: account,
    });
    // } else {
    //   yield call(vaultContract.methods.withdrawAllETH.cacheSend, {
    //     from: account,
    //   });
    // }
  } catch (error) {
    console.error(error);
  }
}

function* depositToVault(action) {
  const {
    vaultContract,
    tokenContract,
    depositAmount,
    pureEthereum,
    hasAllowance,
  } = action.payload;

  const account = yield select(selectAccount());
  const tokenAllowance = yield select(
    selectTokenAllowance(tokenContract.address, vaultContract.address),
  );

  const vaultAllowedToSpendToken = tokenAllowance > 0 || hasAllowance;

  try {
    if (!pureEthereum) {
      if (!vaultAllowedToSpendToken) {
        yield call(
          approveTxSpend,
          tokenContract,
          account,
          vaultContract.address,
        );
      }
      yield call(vaultContract.methods.deposit.cacheSend, depositAmount, {
        from: account,
      });
    } else {
      const { zapContract } = vaultContract;
      if (zapContract) {
        yield call(zapContract.methods.depositETH.cacheSend, {
          from: account,
          value: depositAmount,
        });
      } else {
        yield call(vaultContract.methods.depositETH.cacheSend, {
          from: account,
          value: depositAmount,
        });
      }
    }
  } catch (error) {
    console.error(error);
  }
}

function* zapPickle(action) {
  const {
    zapPickleContract,
    tokenContract,
    depositAmount,
    pureEthereum,
  } = action.payload;

  const account = yield select(selectAccount());
  const tokenAllowance = yield select(
    selectTokenAllowance(tokenContract.address, zapPickleContract.address),
  );

  const vaultAllowedToSpendToken = tokenAllowance > 0;

  try {
    if (!pureEthereum) {
      if (!vaultAllowedToSpendToken) {
        yield call(
          approveTxSpend,
          tokenContract,
          account,
          zapPickleContract.address,
        );
      }
      yield call(zapPickleContract.methods.zapInCRV.cacheSend, depositAmount, {
        from: account,
      });
    } else {
      yield call(zapPickleContract.methods.zapInETH.cacheSend, {
        from: account,
        value: depositAmount,
      });
    }
  } catch (error) {
    console.error(error);
  }
}

function* exitOldPickleGauge(action) {
  const { oldPickleGaugeContract } = action.payload;

  const account = yield select(selectAccount());
  try {
    yield call(oldPickleGaugeContract.methods.exit().send, { from: account });
  } catch (error) {
    console.error('failed exit', error);
  }
}

function* depositPickleSLPInFarm(action) {
  const {
    vaultContract,
    tokenContract,
    depositAmount,
    allowance,
  } = action.payload;

  const account = yield select(selectAccount());

  const vaultAllowedToSpendToken = allowance > 0;

  try {
    if (!vaultAllowedToSpendToken) {
      yield call(
        // eslint-disable-next-line no-underscore-dangle
        tokenContract.methods.approve(vaultContract._address, MAX_UINT256).send,
        { from: account },
      );
    }
    yield call(vaultContract.methods.deposit(depositAmount).send, {
      from: account,
    });
  } catch (error) {
    console.error(error);
  }
}

function* restakeBackscratcherRewards(action) {
  const { vyperContract, threeCrvContract } = action.payload;

  const account = yield select(selectAccount());
  const allowance = yield select(
    selectTokenAllowance(threeCrvContract.address, vyperContract.address),
  );

  const spendTokenApproved = new BigNumber(allowance).gt(0);

  try {
    if (!spendTokenApproved) {
      yield call(
        approveTxSpend,
        threeCrvContract,
        account,
        vyperContract.address,
      );
    }
    yield call(vyperContract.methods.zap.cacheSend, {
      from: account,
    });
  } catch (error) {
    console.error(error);
  }
}

function* claimBackscratcherRewards(action) {
  const { vaultContract } = action.payload;

  const account = yield select(selectAccount());

  try {
    yield call(vaultContract.methods.claim.cacheSend, {
      from: account,
    });
  } catch (error) {
    console.error(error);
  }
}

function* migrateVault(action) {
  const { vaultContract, trustedMigratorContract } = action.payload;

  const account = yield select(selectAccount());
  const allowance = yield select(
    selectTokenAllowance(vaultContract.address, TRUSTED_MIGRATOR_ADDRESS),
  );
  const migrationData = yield select(selectMigrationData);

  const vaultMigrationData = migrationData[vaultContract.address];
  const isMigratable = !!vaultMigrationData;
  if (!isMigratable) {
    console.error(`Cant migrate vault ${vaultContract.address}`);
    return;
  }

  const vaultAddress = vaultContract.address;
  const vaultIsAave =
    vaultAddress === crvAaveAddress ||
    vaultAddress === crvSAaveV2Address ||
    vaultAddress === crvSAaveV1Address;

  const spendTokenApproved = new BigNumber(allowance).gt(0);

  try {
    if (!spendTokenApproved) {
      yield call(
        approveTxSpend,
        vaultContract,
        account,
        trustedMigratorContract.address,
      );
    }

    if (vaultIsAave) {
      yield call(
        trustedMigratorContract.methods.migrateAll.cacheSend,
        vaultMigrationData.vaultFrom,
        vaultMigrationData.vaultTo,
        {
          from: account,
          gas: 2000000,
        },
      );
      return;
    }

    yield call(
      trustedMigratorContract.methods.migrateAll.cacheSend,
      vaultMigrationData.vaultFrom,
      vaultMigrationData.vaultTo,
      {
        from: account,
      },
    );
  } catch (error) {
    console.error(error);
  }
}

export default function* initialize() {
  yield takeLatest([APP_INITIALIZED], fetchVaults);
  // Wait for these two to have already executed
  yield all([take(ACCOUNT_UPDATED), take(VAULTS_LOADED)]);
  yield fetchUserVaultStatistics();
  yield takeLatest(WITHDRAW_FROM_VAULT, withdrawFromVault);
  yield takeLatest(WITHDRAW_ALL_FROM_VAULT, withdrawAllFromVault);
  yield takeLatest(DEPOSIT_TO_VAULT, depositToVault);
  yield takeLatest(ZAP_PICKLE, zapPickle);
  yield takeLatest(DEPOSIT_PICKLE_SLP_IN_FARM, depositPickleSLPInFarm);
  yield takeLatest(RESTAKE_BACKSCRATCHER_REWARDS, restakeBackscratcherRewards);
  yield takeLatest(CLAIM_BACKSCRATCHER_REWARDS, claimBackscratcherRewards);
  yield takeLatest(MIGRATE_VAULT, migrateVault);
  yield takeLatest(EXIT_OLD_PICKLE, exitOldPickleGauge);
}
