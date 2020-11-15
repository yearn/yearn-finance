/* eslint-disable */
export const currencyTransform = val => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 4,
  });
  const newVal = formatter.format(val);
  return newVal;
};

export const abbreviateNumber = value => {
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

export const capitalize = val => {
  if (!val) {
    return '';
  }
  return val.charAt(0).toUpperCase() + val.slice(1);
};

export const camelCaseToSentenceCase = val => {
  const capitalizedVal = capitalize(val);
  const sentenceCase = capitalizedVal.replace(/([A-Z])/g, ' $1');
  return sentenceCase;
};
