import React from 'react';
import { css } from 'twin.macro';
import { useAsync } from 'react-use';
import request from 'utils/request';
import { nFormat } from 'utils/nFormat';

export const MarqueStats = () => {
  // Note - Leaving here incase the api gets updated :)
  // const state = useAsync(
  //   () => request('https://api.yearn.tools/vaults/holdings'),
  //   [],
  //   {},
  // );
  const cgstate = useAsync(
    () => request('https://api.coingecko.com/api/v3/coins/yearn-finance'),
    [],
    {},
  );

  const tvlstate = useAsync(
    () => request('https://api.yearn.tools/tvl'),
    [],
    {},
  );

  const {
    loading: tvlloading,
    error: tvlerror,
    value: tvlvalue = {},
  } = tvlstate;
  // const { loading, error, value = {} } = state;
  const { loading: cgloading, error: cgerror, value: cgvalue = {} } = cgstate;
  if (
    // error ||
    cgerror ||
    tvlerror
  ) {
    return null;
  }
  if (
    // loading ||
    cgloading ||
    tvlloading
  ) {
    return null;
  }

  if (
    // value &&
    cgvalue &&
    tvlvalue
  ) {
    if (
      // value[0] &&
      cgvalue.market_data &&
      tvlvalue.TvlUSD
    ) {
      const {
        market_data: {
          // current_price: { usd: currentPriceUSD },
          total_volume: { usd: totalVolumeUSD },
          market_cap: { usd: marketCapUSD },
        },
      } = cgvalue;
      const totalPoolBalanceUSD = tvlvalue.TvlUSD;

      return (
        <div>
          <div
            css={[
              css`
                transform: translate3d(calc(-250%), 0, 0);
                animation-play-state: running;
                left: 25%;
                @media (max-width: 570px) {
                  display: none;
                }
              `,
            ]}
            tw="w-full flex bg-transparent absolute bottom-0.5 animate-marquee space-x-6 text-white italic uppercase text-4xl lg:text-5xl xl:text-6xl whitespace-nowrap"
          >
            <div tw="flex space-x-3">
              <span>Value Locked:</span>
              <span tw="text-yearn-green not-italic font-black">
                ${nFormat(totalPoolBalanceUSD)}
              </span>
            </div>
            {/* <div tw="flex space-x-2">
              <span>Profits:</span>
              <span tw="text-yearn-blue not-italic font-black">$100M</span>
            </div> */}
            {/* <div tw="flex space-x-2">
              <span>YFI:</span>
              <span tw="text-yearn-red not-italic font-black">
                ${currentPriceUSD}
              </span>
            </div> */}
            <div tw="flex space-x-3">
              <span>Market Cap:</span>
              <span tw="text-yearn-blue not-italic font-black">
                ${nFormat(marketCapUSD)}
              </span>
            </div>
            <div tw="flex space-x-3">
              <span>Volume:</span>
              <span tw="text-yearn-yellow not-italic font-black">
                ${nFormat(totalVolumeUSD)}
              </span>
            </div>
          </div>
        </div>
      );
    }
  }
  return null;
};
