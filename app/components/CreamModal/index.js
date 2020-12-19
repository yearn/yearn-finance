import React from 'react';
import Modal from 'react-bootstrap/Modal';
// import styled from 'styled-components';

export default function CreamModal(props) {
  const { show, onHide, className } = props;

  // const modalOpened = () => {
  //   if (show) {
  //   }
  // };
  // useEffect(modalOpened, [show]);

  return (
    <Modal
      dialogClassName={className}
      show={show}
      onHide={onHide}
      centered
      animation={false}
    >
      <Modal.Body>test</Modal.Body>
    </Modal>
  );
}
