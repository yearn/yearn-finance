import BigNumber from 'bignumber.js';
import {
  BLOCKS_PER_YEAR,
  COMPTROLLER_ADDRESS,
} from 'containers/Cream/constants';

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
  const getSupplyRows = creamCTokenAddress => {
    const creamTokenData = allContracts[creamCTokenAddress];
    const underlyingTokenData = allContracts[creamTokenData.underlying];

    const supplyAPY = getFieldValue(
      creamTokenData.supplyRatePerBlock * BLOCKS_PER_YEAR,
      16,
    );
    const walletBalance = getFieldValue(
      underlyingTokenData.balanceOf,
      underlyingTokenData.decimals,
    );
    const exchangeRate = creamTokenData.exchangeRateStored / 10 ** 18;
    const supplied = getFieldValue(
      creamTokenData.balanceOf * exchangeRate,
      underlyingTokenData.decimals,
    );

    const comptrollerData = allContracts[COMPTROLLER_ADDRESS];
    const collateralEnabled = comptrollerData.getAssetsIn.includes(
      creamCTokenAddress,
    );

    const collateral = collateralEnabled ? 'yes' : 'no';

    const borrowLimit = getFieldValue(borrowLimitStats.borrowLimitInUSD, 0, 2);
    const borrowLimitUsedPercent = getFieldValue(
      borrowLimitStats.borrowLimitUsedPercent,
      0,
      2,
    );

    const underlyingSymbol = underlyingTokenData.symbol;
    return {
      apy: supplyAPY,
      asset: underlyingTokenData,
      wallet: walletBalance,
      supplied,
      collateral,
      borrowLimit,
      borrowLimitUsed: borrowLimitUsedPercent,
      underlyingSymbol,
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
  const getBorrowRows = creamCTokenAddress => {
    const creamTokenData = allContracts[creamCTokenAddress];
    const underlyingTokenData = allContracts[creamTokenData.underlying];

    const borrowAPY = getFieldValue(
      creamTokenData.borrowRatePerBlock * BLOCKS_PER_YEAR,
      16,
    );
    const walletBalance = getFieldValue(
      underlyingTokenData.balanceOf,
      underlyingTokenData.decimals,
    );
    const borrowed = getFieldValue(
      creamTokenData.borrowBalanceStored,
      underlyingTokenData.decimals,
    );
    const liquidity = getFieldValue(
      creamTokenData.getCash,
      underlyingTokenData.decimals,
      2,
      BigNumber.ROUND_DOWN,
    );

    const borrowLimit = getFieldValue(borrowLimitStats.borrowLimitInUSD, 0, 2);
    const borrowLimitUsedPercent = getFieldValue(
      borrowLimitStats.borrowLimitUsedPercent,
      0,
      2,
    );

    const underlyingSymbol = underlyingTokenData.symbol;
    return {
      apy: borrowAPY,
      asset: underlyingTokenData,
      wallet: walletBalance,
      borrowed,
      liquidity,
      borrowLimit,
      borrowLimitUsed: borrowLimitUsedPercent,
      underlyingSymbol,
    };
  };
  const borrowTableRows = creamCTokenAddresses.map(getBorrowRows);
  return borrowTableRows;
};
