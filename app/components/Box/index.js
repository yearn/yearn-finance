import React from 'react';
import styled from 'styled-components';
import {
  space,
  color,
  typography,
  layout,
  flexbox,
  grid,
  background,
  border,
  position,
  shadow,
  compose,
} from 'styled-system';

const StyledBox = styled('div')(
  compose(
    space,
    color,
    typography,
    layout,
    flexbox,
    grid,
    background,
    border,
    position,
    shadow,
  ),
);

const Box = ({ center, ...props }) => (
  <StyledBox
    display={center ? 'flex' : null}
    flexDirection={center ? 'column' : null}
    justifyContent={center ? 'center' : null}
    alignItems={center ? 'center' : null}
    {...props}
  />
);

export default Box;
