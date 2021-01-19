import React from 'react';
import styled from 'styled-components';
import AnimatedNumber from 'animated-number-react';
// import BigNumber from 'bignumber.js';

const Card = styled.div`
  background-color: ${(props) => props.theme.infoCardBackground};
  padding: 32px;
  border-radius: 4px;
  color: ${(props) => props.theme.infoCardText};
  text-align: center;
`;

const Label = styled.div`
  color: ${(props) => props.theme.infoCardLabel};
  font-size: 16px;
  margin-bottom: 8px;
`;

const Value = styled.div`
  font-size: 24px;
  font-weight: 500;
`;

export default function InfoCard(props) {
  const { label, value, formatter } = props;
  return (
    <Card>
      <Label>{label}</Label>
      <Value>
        <AnimatedNumber value={value} duration={200} formatValue={formatter} />
      </Value>
    </Card>
  );
}
