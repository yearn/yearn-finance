import {
  selectContractData,
  selectContracts,
  selectContractsByTag,
} from 'containers/App/selectors';
import { createSelector } from 'reselect';
import BigNumber from 'bignumber.js';
import { keyBy, head, get } from 'lodash';
import {
  COMPTROLLER_ADDRESS,
  PRICE_ORACLE_ADDRESS,
  BLOCKS_PER_YEAR,
} from './constants';

const weiToUnits = (amount, decimals) =>
  new BigNumber(amount).dividedBy(10 ** decimals).toFixed(10);

export const selectCollateralEnabled = () =>
  createSelector(selectContractData(COMPTROLLER_ADDRESS), (comptrollerData) => {
    if (_.isEmpty(comptrollerData)) {
      return false;
    }

    return comptrollerData.getAssetsIn;
  });

function getUnderlyingTokenPrice(oracleData, cTokenAddress) {
  const underlyingTokenPrices = oracleData.getUnderlyingPrice;
  const underlyingTokenPrice = _.find(
    underlyingTokenPrices,
    (responseData) => responseData.args[0] === cTokenAddress,
  );
  return !_.isUndefined(underlyingTokenPrice) ? underlyingTokenPrice.value : 0;
}

function getCollateralFactor(comptrollerData, cTokenAddress) {
  if (_.isEmpty(comptrollerData)) {
    return false;
  }
  const marketsData = comptrollerData.markets;
  const marketData = _.find(
    marketsData,
    (responseData) => responseData.args[0] === cTokenAddress,
  );

  const collateralFactorMantissa = new BigNumber(
    marketData.value.collateralFactorMantissa,
  )
    .dividedBy(10 ** 18) // Should this always be 18?
    .toFixed();
  return !_.isUndefined(marketData) ? collateralFactorMantissa : 0;
}

export const selectBorrowStats = createSelector(
  selectContracts('creamUnderlyingTokens'),
  selectContracts('tokens'),
  selectContractData(PRICE_ORACLE_ADDRESS),
  selectContractData(COMPTROLLER_ADDRESS),
  selectContracts('creamCTokens'),
  selectContractsByTag('creamUnderlyingTokens'),
  (
    creamUnderlyingTokens,
    otherTokens,
    oracleData,
    comptrollerData,
    creamCTokensData,
    underlyingTokensData,
  ) => {
    if (_.isEmpty(comptrollerData)) {
      return {};
    }
    const borrowStats = _.reduce(
      creamCTokensData,
      (stats, creamCToken) => {
        const underlyingToken = _.find(underlyingTokensData, {
          address: creamCToken.underlying,
        });

        const underlyingTokenPrice = getUnderlyingTokenPrice(
          oracleData,
          creamCToken.address,
        );
        const underlyingTokenPriceNormalized = new BigNumber(
          underlyingTokenPrice,
        )
          .dividedBy(10 ** underlyingToken.decimals)
          .toFixed();

        const exchangeRate = new BigNumber(creamCToken.exchangeRateStored)
          .dividedBy(10 ** 18)
          .toFixed();

        // Borrow limit in USD
        const collateralEnabled = comptrollerData.getAssetsIn.includes(
          creamCToken.address,
        );

        const supplied =
          (creamCToken.balanceOf * exchangeRate) /
          10 ** underlyingToken.decimals;
        const collateralFactor = getCollateralFactor(
          comptrollerData,
          creamCToken.address,
        );

        const borrowLimit = collateralEnabled
          ? supplied * underlyingTokenPriceNormalized * collateralFactor
          : 0;

        const balanceStoredNormalized = new BigNumber(
          creamCToken.borrowBalanceStored,
        ).dividedBy(10 ** creamCToken.decimals);

        const underlyingPriceNormalized = new BigNumber(
          underlyingTokenPriceNormalized,
        ).dividedBy(10 ** underlyingToken.decimals);
        const borrowed = balanceStoredNormalized
          .times(exchangeRate)
          .times(underlyingPriceNormalized)
          .toFixed();

        const newStats = stats;
        newStats.borrowLimitInUSD = new BigNumber(newStats.borrowLimitInUSD)
          .plus(borrowLimit)
          .toFixed();
        newStats.borrowValueInUSD = new BigNumber(newStats.borrowValueInUSD)
          .plus(borrowed)
          .toFixed();

        return newStats;
      },
      { borrowLimitInUSD: 0, borrowValueInUSD: 0 },
    );

    borrowStats.borrowLimitUsedPercent =
      (borrowStats.borrowValueInUSD / borrowStats.borrowLimitInUSD) * 100;

    return borrowStats;
  },
);

export const selectCreamTokensInfo = createSelector(
  selectContractsByTag('creamUnderlyingTokens'),
  selectContractsByTag('creamCTokens'),
  selectContracts('creamComptroller'),
  selectContracts('creamOracle'),
  (underlyingTokens, creamCTokens, creamComptroller, creamOracle) => {
    if (!underlyingTokens) {
      return [];
    }
    // TODO: Define order criteria
    const orderedUnderlyingTokens = underlyingTokens.map(
      ({ address }) => address,
    );
    const underlyingTokensByAddress = keyBy(underlyingTokens, 'address');
    const creamCTokensByCAddress = keyBy(creamCTokens, 'address');
    const creamCTokensByUnderlying = keyBy(creamCTokens, 'underlying');
    const assetsIn = get(
      head(creamComptroller),
      'getAssetsIn',
      [],
    ).map(({ value }) => head(value));
    const markets = get(head(creamComptroller), 'markets', []);
    const marketsByUnderlying = keyBy(
      markets.map(({ args, value }) => ({
        address: head(args),
        underlying: get(creamCTokensByCAddress[head(args)], 'underlying'),
        value,
      })),
      'underlying',
    );
    const underlyingPrice = get(head(creamOracle), 'getUnderlyingPrice', []);
    const underlyingPriceByAddress = keyBy(
      underlyingPrice.map(({ args, value }) => ({
        address: head(args),
        underlying: get(creamCTokensByCAddress[head(args)], 'underlying'),
        value,
      })),
      'underlying',
    );

    const creamTokensInfo = orderedUnderlyingTokens.map((address) => {
      const cAddress = get(creamCTokensByUnderlying[address], 'address');
      const decimals = get(underlyingTokensByAddress[address], 'decimals');
      const cDecimals = get(creamCTokensByUnderlying[address], 'decimals');
      const exchangeRate = weiToUnits(
        get(creamCTokensByUnderlying[address], 'exchangeRateStored'),
        18,
      );
      const supplied = weiToUnits(
        new BigNumber(
          get(creamCTokensByUnderlying[address], 'balanceOf'),
        ).times(exchangeRate),
        decimals,
      );
      const borrowed = weiToUnits(
        get(creamCTokensByUnderlying[address], 'borrowBalanceStored'),
        decimals,
      );
      const dollarsPerToken = weiToUnits(
        get(underlyingPriceByAddress[address], 'value'),
        decimals,
      );

      return {
        address,
        symbol: get(underlyingTokensByAddress[address], 'symbol'),
        decimals,
        balance: weiToUnits(
          get(underlyingTokensByAddress[address], 'balanceOf'),
          decimals,
        ),
        // TODO: Fix allowance, switch request to complex data
        allowance: weiToUnits(
          get(underlyingTokensByAddress[address], 'allowance'),
          decimals,
        ),
        cAddress,
        cSymbol: get(creamCTokensByUnderlying[address], 'symbol'),
        cDecimals,
        collateralEnabled: assetsIn.includes(cAddress),
        price: dollarsPerToken,
        supplied,
        suppliedInDollars: new BigNumber(supplied)
          .times(dollarsPerToken)
          .toFixed(10),
        supplyAPY: weiToUnits(
          new BigNumber(
            get(creamCTokensByUnderlying[address], 'supplyRatePerBlock'),
          ).times(BLOCKS_PER_YEAR),
          16,
        ),
        borrowed,
        borrowedInDollars: new BigNumber(borrowed)
          .times(dollarsPerToken)
          .toFixed(10),
        borrowAPY: weiToUnits(
          new BigNumber(
            get(creamCTokensByUnderlying[address], 'borrowRatePerBlock'),
          ).times(BLOCKS_PER_YEAR),
          16,
        ),
        collateralFactor: weiToUnits(
          get(marketsByUnderlying[address], 'value.collateralFactorMantissa'),
          18,
        ),
      };
    });

    return creamTokensInfo;
  },
);

export const selectCreamGroupedInfo = createSelector(
  selectCreamTokensInfo,
  (creamTokensInfo) => {
    if (!creamTokensInfo) {
      return {};
    }

    const totalSupplied = creamTokensInfo
      .reduce(
        (val, token) => new BigNumber(token.suppliedInDollars).plus(val),
        0,
      )
      .toFixed(10);

    const totalBorrowed = creamTokensInfo
      .reduce(
        (val, token) => new BigNumber(token.borrowedInDollars).plus(val),
        0,
      )
      .toFixed(10);

    const borrowLimit = creamTokensInfo
      .reduce((val, token) => {
        const tokenBorrowLimit = token.collateralEnabled
          ? new BigNumber(token.suppliedInDollars).times(token.collateralFactor)
          : 0;
        return new BigNumber(val).plus(tokenBorrowLimit);
      }, 0)
      .toFixed(10);

    const borrowUtilizationRatio = new BigNumber(totalBorrowed)
      .dividedBy(borrowLimit)
      .toFixed(10);

    const borrowAllowance = new BigNumber(borrowLimit)
      .minus(new BigNumber(totalBorrowed))
      .toFixed(10);

    const collateralAvailable = new BigNumber(totalSupplied)
      .minus(new BigNumber(borrowUtilizationRatio).times(totalSupplied))
      .toFixed(10);

    const creamGroupedInfo = {
      totalSupplied,
      totalBorrowed,
      borrowLimit,
      borrowUtilizationRatio,
      borrowAllowance,
      collateralAvailable,
    };

    return creamGroupedInfo;
  },
);
