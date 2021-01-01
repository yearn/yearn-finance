import {
  selectContractData,
  selectContracts,
  selectContractsByTag,
} from 'containers/App/selectors';
import { createSelector } from 'reselect';
import BigNumber from 'bignumber.js';
import { COMPTROLLER_ADDRESS, PRICE_ORACLE_ADDRESS } from './constants';

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
