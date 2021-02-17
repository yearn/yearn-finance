export const calculateEquivalentPrice = (val) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
  });
  const newVal = formatter.format(val);
  return newVal;
};

const daiAddress = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // TODO: make this a shared constant

/**
 * Code ripped from yearn.finance v1 repo @alan
 */
export const getClaimPool = (poolData, claimAddress) => {
  if (!poolData) {
    return null;
  }
  const poolDataArr = Object.entries(poolData);
  let claimPoolData = poolDataArr
    .filter((data) => {
      const token0Address = data[1].poolId.tokens[0].address.toLowerCase();
      const token1Address = data[1].poolId.tokens[1].address.toLowerCase();
      if (
        token0Address === claimAddress.toLowerCase() &&
        token1Address === daiAddress.toLowerCase()
      ) {
        return true;
      }
      if (
        token1Address === claimAddress.toLowerCase() &&
        token0Address === daiAddress.toLowerCase()
      ) {
        return true;
      }

      return false;
    })
    .map((data) => ({
      address: data[1].poolId.id,
      price: data[1].price,
      symbol: data[1].symbol,
      swapFee: parseFloat(data[1].poolId.swapFee),
      liquidity: data[1].poolId.liquidity,
      daiInPool: parseFloat(
        data[1].poolId.tokens.find(
          (token) => token.address.toLowerCase() === daiAddress.toLowerCase(),
        ).balance,
      ),
      covTokenBalance: parseFloat(
        data[1].poolId.tokens.find(
          (token) => token.address.toLowerCase() === claimAddress.toLowerCase(),
        ).balance,
      ),
      covTokenWeight:
        parseFloat(
          data[1].poolId.tokens.find(
            (token) =>
              token.address.toLowerCase() === claimAddress.toLowerCase(),
          ).denormWeight,
        ) / parseFloat(data[1].poolId.totalWeight),
    }));
  if (claimPoolData.length > 0) {
    // eslint-disable-next-line prefer-destructuring
    claimPoolData = claimPoolData.sort((a, b) =>
      b.liquidity !== null
        ? parseFloat(b.liquidity) - parseFloat(a.liquidity)
        : -9999999999,
    )[0];
  } else {
    claimPoolData = {
      price: 0,
      symbol: 'N/A',
      swapFee: 0,
      liquidity: 0,
      noData: true,
    };
  }
  return claimPoolData;
};

/**
 * Code ripped from yearn.finance v1 repo @alan
 */
export const calculateAmountNeeded = (assetAmount, claimPool) => {
  const amountWanted = parseFloat(assetAmount);
  const { covTokenWeight, daiInPool, price, swapFee } = claimPool;
  const slippagePerUnit = (1 - swapFee) / (2 * daiInPool * covTokenWeight);
  const totalSlippage = amountWanted * price * slippagePerUnit;
  // eslint-disable-next-line no-nested-ternary
  return amountWanted > 0
    ? (amountWanted * price) / (1 - totalSlippage) > 0
      ? (1.015 * (amountWanted * price)) / (1 - totalSlippage)
      : Infinity
    : 0;
};

/**
 * @alan
 */
export const calculateAmountOutFromSell = (
  covTokenSellAmt,
  covTokenInPool,
  daiWeight,
  feePercent,
  covTokenPrice,
) => {
  const rateBeforeTrade = 1 / covTokenPrice;
  const slippagePerUnit = (1 - feePercent) / (2 * covTokenInPool * daiWeight);
  const totalSlippage = covTokenSellAmt * slippagePerUnit;
  const rateAfterTrade = rateBeforeTrade * (1 + totalSlippage);
  const endPrice = 1 / rateAfterTrade;
  const amtOut = covTokenSellAmt * endPrice * 0.985; // add buffer to underestimate amtOut, user will receive more than amtOut
  return covTokenSellAmt > 0 && amtOut > 0 ? amtOut : 0;
};

/**
 * @alan
 */
export const calculateAmountOutFromBuy = (
  daiSellAmt,
  daiInPool,
  covTokenWeight,
  feePercent,
  covTokenPrice,
) => {
  const slippagePerUnit = (1 - feePercent) / (2 * daiInPool * covTokenWeight);
  const totalSlippage = daiSellAmt * slippagePerUnit;
  const endPrice = covTokenPrice * (1 + totalSlippage);
  const amtOut = (daiSellAmt / endPrice) * 0.985; // add buffer to underestimate amtOut, user will receive more than amtOut
  return daiSellAmt > 0 && amtOut > 0 ? amtOut : 0;
};

/**
 * @alan
 */
export const calculateAmountInFromSell = (
  amtOut,
  covTokenInPool,
  daiWeight,
  feePercent,
  covTokenPrice,
) => {
  // Same equation as calculateAmountOutFromSell but solving for covTokenSellAmt, given amtOut
  const slippagePerUnit = (1 - feePercent) / (2 * covTokenInPool * daiWeight);
  const totalSlippage = amtOut * slippagePerUnit;
  const amtIn = amtOut / (covTokenPrice - totalSlippage);
  return amtOut > 0 && amtIn > 0 && amtIn !== Infinity ? amtIn : 0;
};
