import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import BatchCall from 'web3-batch-call';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { useSelector } from 'react-redux';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { getNumericReadMethodsWithNoInputs } from 'utils/contracts';

const BodyWrapper = styled.div`
  min-height: 400px;
`;

export default function TransactionModal(props) {
  const { show, onHide, modalMetadata, className } = props;

  const vault = _.get(modalMetadata, 'vault', {});
  const vaultAddress = vault.address;
  const contract = useContract(vaultAddress);
  const abi = _.get(contract, 'abi');
  const account = useSelector(selectAccount());
  const readMethods = getNumericReadMethodsWithNoInputs(abi);
  const [data, setData] = useState();

  const provider =
    'https://eth-mainnet.alchemyapi.io/v2/XLj2FWLNMB4oOfFjbnrkuOCcaBIhipOJ';
  const batchCall = new BatchCall({
    provider,
    etherscan: {
      apiKey: 'GEQXZDY67RZ4QHNU1A57QVPNDV3RP1RYH4',
    },
    logging: true,
    simplifyResponse: true,
    store: localStorage,
  });

  readMethods.push({
    name: 'balanceOf',
    args: [account],
  });

  const methodExclusions = ['decimals'];
  const filterReadMethods = readMethod =>
    !_.includes(methodExclusions, readMethod.name);
  const filteredReadMethods = _.filter(readMethods, filterReadMethods);

  const fetchData = async () => {
    const contracts = [
      {
        addresses: [vaultAddress],
        readMethods: filteredReadMethods,
      },
    ];

    const blocksPerSecond = 15;
    const blocksPerMinute = Math.floor(60 / blocksPerSecond);
    const blocksPerHour = 60 * blocksPerMinute;
    const blocksPerDay = blocksPerHour * 24;
    const blocksPerMonth = blocksPerDay * 30;

    const callOptions = {
      blockHeight: blocksPerMonth,
      blockResolution: blocksPerDay,
    };

    const response = await batchCall.execute(contracts, callOptions);
    setData(response);
  };

  const modalOpened = () => {
    if (show) {
      fetchData();
    }
  };
  useEffect(modalOpened, [show]);

  let content;
  if (!data) {
    content = <div>Loading...</div>;
  } else {
    content = <div>{JSON.stringify(data, 0, null)}</div>;
  }

  return (
    <Modal
      dialogClassName={className}
      show={show}
      onHide={onHide}
      centered
      animation={false}
    >
      <Modal.Body>
        <BodyWrapper>{content}</BodyWrapper>
      </Modal.Body>
    </Modal>
  );
}
