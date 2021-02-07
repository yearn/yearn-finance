import React from 'react';
import styled from 'styled-components';

const StyledCard = styled.div`
  height: 160px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-content: center;
  background-color: rgba(6, 87, 249, 0.3);
  color: #fff;
  align-items: center;
  border-radius: 10px;
`;

const CreamCard = ({ children }) => <StyledCard>{children}</StyledCard>;

export default CreamCard;
