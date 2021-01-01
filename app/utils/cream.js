import BigNumber from 'bignumber.js';
import {
  BLOCKS_PER_YEAR,
  COMPTROLLER_ADDRESS,
} from 'containers/Cream/constants';
import { flattenData } from 'utils/contracts';

function getFieldValue(
  rawValue,
  decimals,
  displayDecimals = 2,
  roundingMode = BigNumber.RoundingMode,
  nanValue = '...',
) {
  const value = new BigNumber(rawValue)
    .dividedBy(10 ** decimals)
    .toFixed(displayDecimals, roundingMode);
  return Number.isNaN(value) ? nanValue : value;
}

export const getSupplyData = ({
  creamCTokenAddresses,
  allContracts,
  borrowLimitStats,
}) => {
  const comptrollerData = flattenData(allContracts[COMPTROLLER_ADDRESS]);
  if (!comptrollerData) {
    return {};
  }
  const getSupplyRows = (creamCTokenAddress) => {
    const creamTokenData = flattenData(allContracts[creamCTokenAddress]);
    const underlyingTokenData = allContracts[creamTokenData.underlying];

    const supplyAPY = getFieldValue(
      creamTokenData.supplyRatePerBlock * BLOCKS_PER_YEAR,
      16,
    );
    const walletBalance = getFieldValue(
      underlyingTokenData.balanceOf[0].value,
      underlyingTokenData.decimals[0].value,
    );

    const cTokenDecimals = creamTokenData.decimals;
    const cTokenBalanceOf = creamTokenData.balanceOf;

    const exchangeRate = creamTokenData.exchangeRateStored / 10 ** 18;
    const supplied = getFieldValue(
      cTokenBalanceOf * exchangeRate,
      underlyingTokenData.decimals[0].value,
    );

    const collateralEnabled = comptrollerData.getAssetsIn.includes(
      creamCTokenAddress,
    );

    const collateral = collateralEnabled;

    const borrowLimit = getFieldValue(borrowLimitStats.borrowLimitInUSD, 0, 2);
    const borrowLimitUsedPercent = getFieldValue(
      borrowLimitStats.borrowLimitUsedPercent,
      0,
      2,
    );

    const allowances = underlyingTokenData.allowance;

    const allowanceObject = _.find(allowances, (allowance) =>
      _.includes(allowance.args, creamCTokenAddress),
    );
    const allowed = _.get(allowanceObject, 'value') > 0;

    return {
      creamCTokenAddress,
      apy: supplyAPY,
      asset: underlyingTokenData,
      wallet: walletBalance,
      supplied,
      cTokenDecimals,
      cTokenBalanceOf,
      exchangeRate,
      collateral,
      borrowLimit,
      allowed,
      borrowLimitUsed: borrowLimitUsedPercent,
    };
  };

  const supplyTableRows = creamCTokenAddresses.map(getSupplyRows);
  return supplyTableRows;
};

export const getBorrowData = ({
  creamCTokenAddresses,
  allContracts,
  borrowLimitStats,
}) => {
  const getBorrowRows = (creamCTokenAddress) => {
    const creamTokenData = flattenData(allContracts[creamCTokenAddress]);
    const underlyingTokenData = allContracts[creamTokenData.underlying];

    const borrowAPY = getFieldValue(
      creamTokenData.borrowRatePerBlock * BLOCKS_PER_YEAR,
      16,
    );
    const walletBalance = getFieldValue(
      underlyingTokenData.balanceOf[0].value,
      underlyingTokenData.decimals[0].value,
    );
    const borrowed = getFieldValue(
      creamTokenData.borrowBalanceStored,
      underlyingTokenData.decimals[0].value,
    );
    const liquidity = getFieldValue(
      creamTokenData.getCash,
      underlyingTokenData.decimals[0].value,
      2,
      BigNumber.ROUND_DOWN,
    );
    const cTokenBalanceOf = creamTokenData.balanceOf;
    const cTokenDecimals = creamTokenData.decimals;

    const borrowLimit = getFieldValue(borrowLimitStats.borrowLimitInUSD, 0, 2);
    const borrowLimitUsedPercent = getFieldValue(
      borrowLimitStats.borrowLimitUsedPercent,
      0,
      2,
    );

    const underlying = underlyingTokenData;
    return {
      creamCTokenAddress,
      cTokenBalanceOf,
      cTokenDecimals,
      apy: borrowAPY,
      asset: underlyingTokenData,
      wallet: walletBalance,
      borrowed,
      liquidity,
      borrowLimit,
      borrowLimitUsed: borrowLimitUsedPercent,
      underlying,
    };
  };
  const borrowTableRows = creamCTokenAddresses.map(getBorrowRows);
  return borrowTableRows;
};
