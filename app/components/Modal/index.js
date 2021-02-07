import React from 'react';
import Modal from '@material-ui/core/Modal';
import Backdrop from '@material-ui/core/Backdrop';
import Fade from '@material-ui/core/Fade';
import Container from '@material-ui/core/Container';
import Box from '@material-ui/core/Box';
import styled from 'styled-components';

const StyledModal = styled(Modal)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledContainer = styled(Container)`
  &&& {
    outline: 0;
  }
`;

const StyledBox = styled(Box)`
  &&& {
    background: #fff;
  }
`;

export const BaseModal = ({ children, open, onClose }) => (
  <StyledModal
    open={open}
    onClose={onClose}
    closeAfterTransition
    BackdropComponent={Backdrop}
    BackdropProps={{
      timeout: 500,
    }}
  >
    <Fade in={open}>
      <StyledContainer maxWidth="sm">
        <StyledBox borderRadius={5}>{children}</StyledBox>
      </StyledContainer>
    </Fade>
  </StyledModal>
);

export default BaseModal;
