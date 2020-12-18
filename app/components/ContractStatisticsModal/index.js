import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import BatchCall from 'web3-batch-call';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { useSelector } from 'react-redux';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { getNumericReadMethodsWithNoInputs } from 'utils/contracts';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const ChartsWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;

const ChartWrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
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
    setData(response[0]);
  };

  const modalOpened = () => {
    if (show) {
      setTimeout(() => fetchData(), 0);
    }
  };
  useEffect(modalOpened, [show]);

  const renderChart = (method, key) => {
    let chartContent = <div>loading...</div>;
    const chartData = _.get(data, method.name);
    if (chartData) {
      chartContent = (
        <LineChart
          width={400}
          height={250}
          data={chartData}
          margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
        >
          <Line type="monotone" dataKey="value" stroke="#8884d8" />
          <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
          <XAxis dataKey="blockNumber" />
          <YAxis />
          <Tooltip />
        </LineChart>
      );
    }
    return (
      <ChartWrapper key={key}>
        <div>{method.name}</div>
        <div>{chartContent}</div>
      </ChartWrapper>
    );
  };

  let charts = _.map(filteredReadMethods, renderChart);

  useEffect(() => {
    if (data) {
      charts = _.map(filteredReadMethods, renderChart);
    }
  }, [data]);

  return (
    <Modal
      dialogClassName={className}
      show={show}
      onHide={onHide}
      centered
      animation={false}
    >
      <Modal.Body>
        <ChartsWrapper>{charts}</ChartsWrapper>
      </Modal.Body>
    </Modal>
  );
}
