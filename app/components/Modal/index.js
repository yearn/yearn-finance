import React from 'react';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';

const StyledModal = styled(Modal)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Wrapper = styled.div``;

const BaseModal = (props) => {
  const { children, className, ...rest } = props;
  return (
    <StyledModal
      centered
      animation={false}
      dialogClassName={className}
      {...rest}
    >
      <Wrapper>{children}</Wrapper>
    </StyledModal>
  );
};

export default BaseModal;
