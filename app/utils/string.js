/* eslint-disable */
import BigNumber from 'bignumber.js';

export const currencyTransform = (val) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  });
  const newVal = formatter.format(val);
  return newVal;
};

export const abbreviateNumber = (value) => {
  var newValue = value;
  if (value >= 1000) {
    var suffixes = ['', 'k', 'm', 'b', 't'];
    var suffixNum = Math.floor(('' + value).length / 3);
    var shortValue = '';
    for (var precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum != 0
          ? value / Math.pow(1000, suffixNum)
          : value
        ).toPrecision(precision),
      );
      var dotLessShortValue = (shortValue + '').replace(/[^a-zA-Z 0-9]+/g, '');
      if (dotLessShortValue.length <= 2) {
        break;
      }
    }
    if (shortValue % 1 != 0) shortValue = shortValue.toFixed(1);
    newValue = shortValue + suffixes[suffixNum];
  }
  return newValue;
};

export const formatNumber = (val) => {
  if (!val || _.isNaN(val)) return '';
  return Number(val).toLocaleString(undefined, {
    maximumFractionDigits: 5,
    useGrouping: true,
  });
};

export const removeDecimals = (val) => {
  return new BigNumber(val).toFixed(0);
};

export const abbreviateRelativeTime = (now, timestamp) => {
  // timestamp is in seconds, not milliseconds.. not my choice! :<
  const distance = timestamp * 1000 - now;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);
  return `${days}d ${hours}h ${minutes}m`;
};

export const daysFromNow = (now, timestamp) => {
  // timestamp is in seconds, not milliseconds
  const distance = timestamp * 1000 - now;
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  return days;
};

export const getShortenedAddress = (address) => {
  if (!address) {
    return '';
  }
  const beginning = address.substr(0, 6);
  const end = address.substr(address.length - 4, address.length);
  return `${beginning}...${end}`;
};

export const capitalize = (val) => {
  if (!val) {
    return '';
  }
  return val.charAt(0).toUpperCase() + val.slice(1);
};

export const camelCaseToSentenceCase = (val) => {
  const capitalizedVal = capitalize(val);
  const sentenceCase = capitalizedVal.replace(/([A-Z])/g, ' $1');
  return sentenceCase;
};
