export const nFormat = (num) => {
  const format = [
    { value: 1e18, symbol: 'E' },
    { value: 1e15, symbol: 'P' },
    { value: 1e12, symbol: 'T' },
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'k' },
    { value: 1, symbol: '' },
  ];
  const formatIndex = format.findIndex((data) => num >= data.value);
  return (
    (num / format[formatIndex === -1 ? 6 : formatIndex].value).toFixed(2) +
    format[formatIndex === -1 ? 6 : formatIndex].symbol
  );
};
