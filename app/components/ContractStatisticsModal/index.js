import React, { useEffect, useState } from 'react';
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

const VaultWrapper = styled.div`
  background-color: rgb(6, 6, 27);
  padding: 15px;
`;

const ChartsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const ChartHeader = styled.div`
  display: flex;
  margin: 15px 0;
`;

const ChartInfo = styled.div`
  display: flex;
  flex-basis: 40%;
  flex-direction: column;
`;

const ModalTitle = styled.div`
  font-size: 2.2rem;
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

const RangeSelector = styled.div``;

const ChartWrapper = styled.div`
  display: flex;
  flex-basis: 50%;
  flex-direction: column;
  @media (max-width: 768px) {
    flex-basis: 100%;
  }
`;

const ChartContainer = styled.div`
  width: 100%;
  min-height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SkeletonWrapper = styled.div`
  background: #31d8a4;
  opacity: 0.1;
`;

export default function TransactionModal(props) {
  const { show, onHide, modalMetadata, className } = props;

  // {controllerAddress: "0x9E65Ad11b299CA0Abefc2799dDB6314Ef2d91080", tokenIcon: "https://raw.githubusercontent.com/iearn-finance/ye…7F958D2ee523a2206206994597C13D831ec7/logo-128.png", controllerName: "Controller", symbol: "yUSDT", timestamp: 1608330458360, …}
  // address: "0x2f08119C6f07c006695E079AAFc638b8789FAf18"
  // apy: {apyOneMonthSample: 6.716771478804928, symbol: "USDT", timestamp: 1608330400921, apyOneWeekSample: 8.41541148064962, apyInceptionSample: 13.028601359979724, …}
  // balance: "1601971576900"
  // balanceOf: "0"
  // controllerAddress: "0x9E65Ad11b299CA0Abefc2799dDB6314Ef2d91080"
  // controllerName: "Controller"
  // decimals: 6
  // delegated: false
  // name: "yearn Tether USD"
  // namespace: "vaults"
  // strategyAddress: "0xc7e437033D849474074429Cbe8077c971Ea2a852"
  // strategyName: "StrategyUSDT3pool"
  // symbol: "yUSDT"
  // symbolAlias: "yvUSDT"
  // timestamp: 1608330458360
  // tokenAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7"
  // tokenIcon: "https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0xdAC17F958D2ee523a2206206994597C13D831ec7/logo-128.png"
  // tokenName: "Tether USD"
  // tokenSymbol: "USDT"
  // tokenSymbolAlias: "USDT"
  // vaultAlias: "USDT"
  // vaultIcon: "https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/0x2f08119C6f07c006695E079AAFc638b8789FAf18/logo-128.png"
  // wrapped: false

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

  const modalToggled = () => {
    if (show) {
      setTimeout(() => fetchData(), 0);
    } else {
      setData([]);
    }
  };
  useEffect(modalToggled, [show]);

  const renderChart = (method, key) => {
    const chartData = _.get(data, method.name);

    let chartContent;
    if (chartData) {
      const tooltipStyle = {
        padding: '10px',
        margin: '0px',
        border: 'none',
        whiteSpace: 'nowrap',
        boxShadow: 'rgba(0, 0, 0, 0.4) 0px 0px 20px',
        backgroundColor: 'rgb(16, 16, 78)',
      };
      chartContent = (
        <ResponsiveContainer width="96%" height={300}>
          <AreaChart
            data={chartData}
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
            <YAxis domain={[0, max => max * 1.5]} hide />
            <XAxis
              tickFormatter={tick => (tick / 1000000).toFixed(2)}
              dataKey="blockNumber"
              domain={['dataMin', 'dataMax']}
              tickLine={false}
              axisLine={false}
              minTickGap={50}
            />
            <Tooltip
              formatter={value => [value]}
              labelFormatter={label => `Block ${label.toLocaleString()}`}
              contentStyle={tooltipStyle}
              cursor={{ stroke: 'rgb(237, 30, 255)', strokeWidth: 1.25 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    } else {
      chartContent = (
        <ResponsiveContainer width="96%" height={300}>
          <SkeletonWrapper>
            <Skeleton variant="rect" animation="wave" height={300} />
          </SkeletonWrapper>
        </ResponsiveContainer>
      );
    }

    let currentValue;
    if (chartData) {
      currentValue = chartData[chartData.length - 1].value;
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
          <ModalTitle>
            {vault.tokenSymbolAlias} - {vault.name}
          </ModalTitle>
          <ModalData>
            {vault.controllerName}: {vault.controllerAddress}
          </ModalData>
          <ModalData>
            {vault.strategyName}: {vault.strategyAddress}
          </ModalData>
          <ChartsWrapper>{charts}</ChartsWrapper>
        </VaultWrapper>
      </Modal.Body>
    </Modal>
  );
}
