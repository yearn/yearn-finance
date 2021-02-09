import React, { useEffect, useState } from 'react';
import TokenIcon from 'components/TokenIcon';
import Modal from 'react-bootstrap/Modal';
import styled from 'styled-components';
import BatchCall from 'web3-batch-call';
import Skeleton from '@material-ui/lab/Skeleton';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { useSelector } from 'react-redux';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import { getNumericReadMethodsWithNoInputs } from 'utils/contracts';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { BigNumber } from 'bignumber.js';

const VaultWrapper = styled.div`
  background-color: rgb(6, 6, 27);
  padding: 15px;
`;

const VaultHeader = styled.div`
  display: flex;
`;

const VaultInfo = styled.div`
  flex-direction: column;
  flex-basis: 80%;
`;

const VaultTitle = styled.div`
  display: flex;
  align-items: center;
  font-size: 2.2rem;
`;

const VaultIconWrapper = styled.div`
  height: 30px;
  width: 30px;
  margin: 5px 15px 15px 0px;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 30px;
  height: 30px;
`;

const ChartsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding: 0 15px;
`;

const ChartHeader = styled.div`
  display: flex;
  padding: 15px 0;
`;

const ChartInfo = styled.div`
  display: flex;
  flex-basis: 40%;
  flex-direction: column;
`;

const ModalData = styled.div`
  font-size: 0.95rem;
`;

const ChartTitle = styled.div`
  font-size: 1.25rem;
`;

const ChartValue = styled.div`
  font-size: 1.6rem;
`;

const RangeSelectorWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const RangeSelector = styled.div`
  padding: 0 10px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.46);
  ${({ active }) =>
    active &&
    `
    color: white;
  `}
`;

const ChartWrapper = styled.div`
  display: flex;
  flex-basis: 50%;
  margin: 0 auto;
  flex-direction: column;
  max-width: 500px;
  @media (max-width: 768px) {
    flex-basis: 100%;
  }
  padding: 15px 5px 0 5px;
`;

const ChartContainer = styled.div`
  width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding-bottom: 25px;
`;

const SkeletonWrapper = styled.div`
  background: #31d8a4;
  opacity: 0.1;
`;

export default function TransactionModal(props) {
  const { show, onHide, modalMetadata, className } = props;
  const vault = _.get(modalMetadata, 'vault', {});
  const vaultAddress = vault.address;
  const contract = useContract(vaultAddress);
  const abi = _.get(contract, 'abi');
  const account = useSelector(selectAccount());
  const readMethods = getNumericReadMethodsWithNoInputs(abi);
  const defaultDays = 90;
  const [data, setData] = useState();
  const [days, setDays] = useState(defaultDays);

  const provider = process.env.WEB3_PROVIDER_HTTPS;
  const apiKey = process.env.ETHERSCAN_APIKEY;
  const batchCall = new BatchCall({
    provider,
    etherscan: {
      apiKey,
    },
    logging: false,
    simplifyResponse: true,
    store: localStorage,
  });

  readMethods.push({
    name: 'balanceOf',
    args: [account],
  });

  const methodExclusions = ['decimals'];
  const filterReadMethods = (readMethod) =>
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
    const blocksRequested = blocksPerDay * days;

    const callOptions = {
      blockHeight: blocksRequested,
      blockResolution: parseInt(blocksRequested / 10, 10),
    };

    const response = await batchCall.execute(contracts, callOptions);
    setData(response[0]);
  };

  const modalToggled = () => {
    if (show && account) {
      setTimeout(() => fetchData(), 0);
    } else {
      setData([]);
      setDays(defaultDays);
    }
  };
  useEffect(modalToggled, [show]);

  useEffect(() => {
    const update = async () => {
      await setData([]);
      if (account) {
        fetchData();
      }
    };
    update();
  }, [days]);

  const renderChart = (method, key) => {
    const chartData = _.get(data, method.name);
    const scaleAllowList = [
      'balance',
      'balanceOf',
      'totalSupply',
      'getPricePerFullShare',
    ];
    const dataShouldBeScaled = _.includes(scaleAllowList, method.name);
    const scaleData = (point) => {
      const { value } = point;
      const newPoint = point;
      if (dataShouldBeScaled) {
        newPoint.value = new BigNumber(value)
          .dividedBy(10 ** vault.decimals)
          .toNumber();
      } else {
        newPoint.value = new BigNumber(value).toNumber();
      }
      return newPoint;
    };

    let scaledData;
    if (chartData) {
      scaledData = _.map(chartData, scaleData);
    }

    let chartContent;
    if (scaledData) {
      const tooltipStyle = {
        padding: '10px',
        margin: '0px',
        border: 'none',
        whiteSpace: 'nowrap',
        boxShadow: 'rgba(0, 0, 0, 0.4) 0px 0px 20px',
        backgroundColor: 'rgb(16, 16, 78)',
        fontFamily:
          'Calibre Semibold, Helvetica Neue ,Helvetica, Arial, sans-serif',
      };
      chartContent = (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={scaledData}
            margin={{ top: 5, right: 20, bottom: 5, left: 20 }}
          >
            <defs>
              <linearGradient id="chartGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#31D8A4" stopOpacity={0.2} />
                <stop offset="65%" stopColor="#31D8A4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="value"
              stroke="#31D8A4"
              fillOpacity={1}
              fill="url(#chartGreen)"
            />
            <YAxis domain={[(min) => min * 0.8, (max) => max * 1.2]} hide />
            <XAxis
              tickFormatter={(tick) => (tick / 1000000).toFixed(2)}
              dataKey="blockNumber"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              minTickGap={50}
            />
            <Tooltip
              formatter={(value) =>
                dataShouldBeScaled ? [value * 10 ** vault.decimals] : [value]
              }
              labelFormatter={(label) => `Block ${label.toLocaleString()}`}
              contentStyle={tooltipStyle}
              cursor={{ stroke: 'rgb(237, 30, 255)', strokeWidth: 1.25 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    } else {
      chartContent = (
        <ResponsiveContainer width="100%" height={300}>
          <SkeletonWrapper>
            <Skeleton variant="rect" animation="wave" height={300} />
          </SkeletonWrapper>
        </ResponsiveContainer>
      );
    }

    let currentValue;
    if (scaledData) {
      const scaledValue = scaledData[scaledData.length - 1].value;
      currentValue =
        typeof scaledValue === 'number'
          ? scaledValue.toLocaleString()
          : scaledValue;
    } else {
      currentValue = (
        <SkeletonWrapper>
          <Skeleton variant="rect" animation="wave" height={38} />
        </SkeletonWrapper>
      );
    }
    return (
      <ChartWrapper key={key}>
        <ChartHeader>
          <ChartInfo>
            <ChartTitle>{method.name}</ChartTitle>
            <ChartValue>{currentValue}</ChartValue>
          </ChartInfo>
          <RangeSelector />
        </ChartHeader>
        <ChartContainer>{chartContent}</ChartContainer>
      </ChartWrapper>
    );
  };

  let charts = _.map(filteredReadMethods, renderChart);

  useEffect(() => {
    if (data) {
      charts = _.map(filteredReadMethods, renderChart);
    }
  }, [data]);

  const linkTo = (contractAddress) => (
    <a
      href={`https://etherscan.io/address/${contractAddress}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {contractAddress}
    </a>
  );
  return (
    <Modal
      dialogClassName={className}
      show={show}
      onHide={onHide}
      centered
      animation={false}
    >
      <Modal.Body>
        <VaultWrapper>
          <VaultHeader>
            <VaultInfo>
              <VaultTitle>
                <VaultIconWrapper>
                  <StyledTokenIcon address={vault.address} />
                </VaultIconWrapper>
                {`${vault.displayName} - ${vault.name}`}
              </VaultTitle>
              <ModalData>
                {vault.strategyName}: {linkTo(vault.strategyAddress)}
              </ModalData>
              <ModalData>
                {vault.controllerName}: {linkTo(vault.controllerAddress)}
              </ModalData>
            </VaultInfo>
            <RangeSelectorWrapper>
              <RangeSelector active={days === 1} onClick={() => setDays(1)}>
                1D
              </RangeSelector>
              <RangeSelector active={days === 7} onClick={() => setDays(7)}>
                1W
              </RangeSelector>
              <RangeSelector active={days === 30} onClick={() => setDays(30)}>
                1M
              </RangeSelector>
              <RangeSelector active={days === 90} onClick={() => setDays(90)}>
                3M
              </RangeSelector>
              <RangeSelector active={days === 180} onClick={() => setDays(180)}>
                6M
              </RangeSelector>
              <RangeSelector active={days === 365} onClick={() => setDays(365)}>
                1Y
              </RangeSelector>
            </RangeSelectorWrapper>
          </VaultHeader>
          <ChartsWrapper>{charts}</ChartsWrapper>
        </VaultWrapper>
      </Modal.Body>
    </Modal>
  );
}
