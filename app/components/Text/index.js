import React from 'react';
import styled from 'styled-components';
import Box from 'components/Box';

const StyledBox = styled(Box)`
  word-wrap: break-word;
  white-space: normal;
`;

const Text = ({ children, bold, italic, large, small, center, ...props }) => {
  let fontSize = 2;
  if (small) {
    fontSize = 1;
  }
  if (large) {
    fontSize = 3;
  }
  return (
    <StyledBox
      fontSize={fontSize}
      fontWeight={bold ? 2 : 0}
      fontStyle={italic ? 'italic' : 'normal'}
      textAlign={center ? 'center' : 'left'}
      {...props}
    >
      {children}
    </StyledBox>
  );
};

export default Text;
