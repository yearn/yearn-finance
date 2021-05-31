/**
 * Set minimum decimals to show a vault
 */
export default function setDecimals(decimals) {
  let minDecimals = decimals;
  if (decimals > 6) {
    minDecimals = decimals - 4;
  } else if (decimals >= 4) {
    minDecimals = decimals - 2;
  } else {
    minDecimals = 0;
  }
  return minDecimals;
}
