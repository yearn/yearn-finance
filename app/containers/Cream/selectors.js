import { selectContractData, selectContracts } from 'containers/App/selectors';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import { COMPTROLLER_ADDRESS, PRICE_ORACLE_ADDRESS } from './constants';

export const selectCollateralEnabled = contractAddress => createSelector(
  selectContractData(COMPTROLLER_ADDRESS),
  comptrollerData => {
    if (_.isEmpty(comptrollerData)) {
      return false;
    }

    return comptrollerData.getAssetsIn.includes(contractAddress);
  },
);

function getUnderlyingTokenPrice(oracleData, cTokenAddress) {
  const underlyingTokenPrices = oracleData.getUnderlyingPrice;
  const underlyingTokenPrice = _.find(underlyingTokenPrices, responseData => responseData.args[0] === cTokenAddress);
  return !_.isUndefined(underlyingTokenPrice) ? underlyingTokenPrice.value : 0;
}

function getCollateralFactor(comptrollerData, cTokenAddress) {
  const marketsData = comptrollerData.markets;
  const marketData = _.find(marketsData, responseData => responseData.args[0] === cTokenAddress);
  return !_.isUndefined(marketData) ? marketData.value.collateralFactorMantissa / 10 ** 18 : 0;
}

export const selectBorrowStats = createSelector(
  selectContracts('creamUnderlyingTokens'),
  selectContracts('tokens'),
  selectContractData(PRICE_ORACLE_ADDRESS),
  selectContractData(COMPTROLLER_ADDRESS),
  selectContracts('creamCTokens'),
  (creamUnderlyingTokens, otherTokens, oracleData, comptrollerData, creamCTokensData) => {
    // In order to calculate the borrowLimit, we need underlying token data for
    // each creamCToken, but some of these will be under the token namespace and
    // some under the creamUnderlyingTokens namespace, as contract data is keyed by
    // contract address, so there is a race to see which namespace wins.
    const underlyingTokensData = _.concat(useSelector(selectContracts('tokens')), useSelector(selectContracts('creamUnderlyingTokens')));

    // Currently underlyingTokensData contains tokens from "tokens" and
    // "creamUnderlyingTokens" namespaces in order to deal with a race condition.
    // The operation that adds decimal data to the creamUnderlyingTokens may not
    // have finished yet, so we need to ensure the decimals data is present before
    // proceeding.
    const allDecimalsDataPresent = _.isUndefined(_.find(creamCTokensData, (creamCToken) => {
      const underlyingToken = _.find(underlyingTokensData, { 'address': creamCToken.underlying });
      return !_.has(underlyingToken, 'decimals');
    }));

    if (!allDecimalsDataPresent) {
      return 0;
    }

    const borrowStats = _.reduce(creamCTokensData, (stats, creamCToken) => {
        const underlyingToken = _.find(underlyingTokensData, { 'address': creamCToken.underlying });
        const underlyingTokenPrice = getUnderlyingTokenPrice(oracleData, creamCToken.address) / 10 ** underlyingToken.decimals;
        const exchangeRate = creamCToken.exchangeRateStored / 10 ** 18;

        // Borrow limit in USD
        const collateralEnabled = comptrollerData.getAssetsIn.includes(creamCToken.address);
        const supplied = creamCToken.balanceOf * exchangeRate / 10 ** underlyingToken.decimals;
        const collateralFactor = getCollateralFactor(comptrollerData, creamCToken.address);
        const borrowLimit = collateralEnabled ? supplied * underlyingTokenPrice * collateralFactor : 0;

        // Borrow value in USD
        const borrowed = (creamCToken.borrowBalanceStored / 10 ** creamCToken.decimals) * exchangeRate * (underlyingTokenPrice / 10 ** underlyingToken.decimals);

        stats.borrowLimitInUSD += borrowLimit;
        stats.borrowValueInUSD += borrowed;

        return stats;
      }, { borrowLimitInUSD: 0, borrowValueInUSD: 0 },
    );

    borrowStats.borrowLimitUsedPercent = borrowStats.borrowValueInUSD / borrowStats.borrowLimitInUSD * 100;

    return borrowStats;
  },
);



