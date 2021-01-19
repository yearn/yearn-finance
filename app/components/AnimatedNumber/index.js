import React from 'react';
import AnimatedNumber from 'animated-number-react';

const defaultFormatter = (v) =>
  v.toLocaleString('en', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function AnimatedNumberComponent({
  value,
  formatter = defaultFormatter,
}) {
  return (
    <AnimatedNumber value={value} duration={500} formatValue={formatter} />
  );
}
