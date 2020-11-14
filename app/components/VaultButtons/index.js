import React from 'react';
import styled from 'styled-components';
import ButtonFilled from 'components/ButtonFilled';
// import { useSelector } from 'react-redux';
// import { selectAddress } from 'containers/ConnectionProvider/selectors';
// import { useContract } from 'containers/DrizzleProvider/hooks';
import { useModal } from 'containers/ModalProvider/hooks';

const Wrapper = styled.div`
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(5, 1fr);
  width: 100%;
  grid-gap: 0px 20px;
  margin: 20px;
  direction: rtl;
`;

export default function VaultButtons(props) {
  const { vault } = props;
  const { address, writeMethods } = vault;
  // const vaultContract = useContract(address);
  // const account = useSelector(selectAddress());
  // const [showModal, setShowModal] = useState(false);
  // const closeModal = () => setShowModal(false);
  // const openModal = () => setShowModal(true);

  const argConfig = {
    approve: {
      _spender: {
        defaultValue: '0x123',
      },
      _value: {
        defaultValue: 55,
        max: 100,
        configurable: true,
      },
    },
  };

  const { openModal } = useModal();
  const openTransactionModal = method => {
    const { inputs, name: methodName } = method;
    const args = _.get(argConfig, methodName);
    const modalArgs = { methodName, inputs, args, address };
    openModal('transaction', modalArgs);
    // vaultContract.methods.deposit.cacheSend(0, { from: account });
  };
  const renderButton = (method, key) => {
    const methodAlias = method.alias || method.name;
    return (
      <ButtonFilled
        key={key}
        onClick={() => openTransactionModal(method)}
        color="primary"
        title={methodAlias}
      >
        {methodAlias}
      </ButtonFilled>
    );
  };

  const vaultButtons = _.map(writeMethods, renderButton);
  // <TransactionModal show={true} onHide={closeModal} />
  return <Wrapper>{vaultButtons}</Wrapper>;
}
