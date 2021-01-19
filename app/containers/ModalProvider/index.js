import React, { useState } from 'react';
import TransactionModal from 'components/TransactionModal';
import ContractStatisticsModal from 'components/ContractStatisticsModal';
import CreamModal from 'components/CreamModal';
import ModalContext from './context';

const modals = {
  transaction: TransactionModal,
  contractStatistics: ContractStatisticsModal,
  cream: CreamModal,
};

const ModalProvider = (props) => {
  const devMode = true;
  const makeInitialModalState = (acc, Modal, key) => {
    acc[key] = {
      show: false,
    };
    return acc;
  };
  const initialModalState = _.reduce(modals, makeInitialModalState, {});
  const [modalState, setModalState] = useState(initialModalState);

  const closeModal = (key) => {
    const currentState = _.clone(modalState);
    currentState[key].show = false;
    setModalState(currentState);
  };

  const openModal = (key, metadata) => {
    const currentState = _.clone(modalState);
    currentState[key].show = true;
    currentState[key].metadata = metadata;
    setModalState(currentState);
  };

  const renderModal = (Modal, key) => {
    const modalStateForKey = modalState[key];
    const { show, metadata } = modalStateForKey;
    return (
      <Modal
        key={key}
        show={show}
        modalMetadata={metadata}
        className={`${key}Modal ${devMode ? 'devMode' : ''}`}
        onHide={() => closeModal(key)}
      />
    );
  };
  const modalEls = _.map(modals, renderModal);
  const { children } = props;

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children}
      {modalEls}
    </ModalContext.Provider>
  );
};

export default ModalProvider;
