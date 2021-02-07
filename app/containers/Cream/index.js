import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSelector, useDispatch } from 'react-redux';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Switch from '@material-ui/core/Switch';

import Icon from 'components/Icon';
import TokenIcon from 'components/TokenIcon';
import CreamTable from 'components/CreamTable';
import CreamCard from 'components/CreamCard';
import CreamModal from 'components/CreamModal';
import {
  selectCreamTokensInfo,
  selectCreamGroupedInfo,
} from 'containers/Cream/selectors';
import { useInjectSaga } from 'utils/injectSaga';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { COMPTROLLER_ADDRESS } from 'containers/Cream/constants';
import saga from './saga';
import { initializeCream, creamEnterMarkets } from './actions';

const StyledContainer = styled(Container)`
  font-family: roboto;
`;

const Button = styled.button`
  display: flex;
  flex-direction: row;
  background-color: ${(props) =>
    props.disabled ? 'rgba(6, 87, 249, 0.2)' : 'rgba(6, 87, 249, 0.3)'};
  color: ${(props) =>
    props.disabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,1)'};
  align-items: center;
  border-radius: 4px;
  height: 40px;
  line-height: 40px;
  padding: 0 12px;
  margin: 0 4px;
  font-weight: 500;
  cursor: pointer;
  font-size: 14px;
`;

const StyledTokenIcon = styled(TokenIcon)`
  width: 30px;
  margin-right: 20px;
`;

const StyledHr = styled.hr`
  border-top: 2px solid rgba(255, 255, 255, 0.2);
  width: 380px;
  margin: 16px 0px;
`;

const StyledIcon = styled(Icon)`
  margin-right: 5px;
`;

const formatAmount = (amount, decimals) =>
  Number.isNaN(amount) || amount === 'NaN'
    ? '0'
    : `${Number(amount, 10).toFixed(decimals)}`;

const Cream = () => {
  useInjectSaga({ key: 'cream', saga });
  const dispatch = useDispatch();
  const [openCreamModal, setOpenCreamModal] = useState(false);
  const [modalMetadata, setModalMetadata] = useState({});

  useEffect(() => {
    dispatch(initializeCream());
  }, []);

  const creamGroupedInfo = useSelector(selectCreamGroupedInfo);
  const creamTokensInfo = useSelector(selectCreamTokensInfo);
  const creamComptrollerContract = useContract(COMPTROLLER_ADDRESS);

  const assetTransform = ({ address, symbol }) => (
    <Box display="flex" flexDirection="row" alignItems="center">
      <StyledTokenIcon address={address} />
      {symbol}
    </Box>
  );

  const suppliedActionsTransform = (tokenInfo) => {
    const onAction = (action) => {
      setModalMetadata({
        ...tokenInfo,
        ...creamGroupedInfo,
        action,
      });
      setOpenCreamModal(true);
    };

    return (
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-end"
      >
        <Button onClick={() => onAction('supply')}>
          <StyledIcon type="arrowUpAlt" />
          Supply
        </Button>
        <Button onClick={() => onAction('withdraw')}>
          <StyledIcon type="arrowDownAlt" />
          Withdraw
        </Button>
      </Box>
    );
  };

  const borrowedActionsTransform = (tokenInfo) => {
    const onAction = (action) => {
      setModalMetadata({
        ...tokenInfo,
        ...creamGroupedInfo,
        action,
      });
      setOpenCreamModal(true);
    };

    return (
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-end"
      >
        <Button onClick={() => onAction('repay')}>
          <StyledIcon type="arrowUpAlt" />
          Repay
        </Button>
        <Button onClick={() => onAction('borrow')}>
          <StyledIcon type="arrowDownAlt" />
          Borrow
        </Button>
      </Box>
    );
  };

  const allActionsTransform = (tokenInfo) => {
    const creamCTokenAddress = _.get(tokenInfo, 'cAddress');
    const marketEntered = _.get(tokenInfo, 'collateralEnabled');

    const onAction = (action) => {
      setModalMetadata({
        ...tokenInfo,
        ...creamGroupedInfo,
        action,
      });
      setOpenCreamModal(true);
    };

    return (
      <Box
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="flex-end"
      >
        <Button onClick={() => onAction('supply')} disabled={!marketEntered}>
          <StyledIcon type="arrowUpAlt" />
          Supply
        </Button>
        <Button onClick={() => onAction('borrow')} disabled={!marketEntered}>
          <StyledIcon type="arrowDownAlt" />
          Borrow
        </Button>
        <Switch
          color="primary"
          checked={marketEntered}
          onChange={() => {
            if (marketEntered) {
              // TODO: Exit Market
              return;
            }
            dispatch(
              creamEnterMarkets({
                creamCTokenAddress,
                creamComptrollerContract,
              }),
            );
          }}
        />
      </Box>
    );
  };

  const {
    totalSupplied,
    totalBorrowed,
    borrowUtilizationRatio,
  } = creamGroupedInfo;

  const borrowPercentage = Number.isNaN(borrowUtilizationRatio)
    ? '0'
    : borrowUtilizationRatio * 100;

  return (
    <StyledContainer>
      <CreamModal
        open={openCreamModal}
        onClose={() => setOpenCreamModal(false)}
        modalMetadata={modalMetadata}
      />
      <Box fontSize="36px" fontWeight="900" mt="22px">
        CREAM
      </Box>
      <Box fontSize="26px" fontWeight="900" mt="40px">
        Lending and Borrowing
      </Box>
      <StyledHr />
      {/* <Box>Lorem ipsum ...</Box> TODO: INSERT COPY */}
      <Grid container spacing={2}>
        <Grid key={`${1}`} item xs={12} sm={6} md={4}>
          <CreamCard>
            <Box fontSize="15px" fontWeight="900">
              SUPPLY BALANCE
            </Box>
            <Box fontSize="21px" fontWeight="400">
              ${formatAmount(totalSupplied, 0)}
            </Box>
          </CreamCard>
        </Grid>
        <Grid key={`${2}`} item xs={12} sm={6} md={4}>
          <CreamCard>
            <Box fontSize="15px" fontWeight="900">
              BORROW BALANCE
            </Box>
            <Box fontSize="21px" fontWeight="400">
              ${formatAmount(totalBorrowed, 0)}
            </Box>
          </CreamCard>
        </Grid>
        <Grid key={`${3}`} item xs={12} sm={6} md={4}>
          <CreamCard>
            <Box fontSize="15px" fontWeight="900">
              BORROW PERCENTAGE
            </Box>
            <Box fontSize="21px" fontWeight="400">
              {formatAmount(borrowPercentage, 0)}%
            </Box>
          </CreamCard>
        </Grid>
      </Grid>
      <Box fontSize="26px" fontWeight="900" mt="32px" mb="16px">
        Assets Supplied
      </Box>
      <Box>
        <CreamTable
          metadata={[
            {
              key: 'asset',
              alias: 'ASSET',
              transform: assetTransform,
            },
            {
              key: 'supplyAPY',
              alias: 'SUPPLY APY',
              transform: ({ supplyAPY }) => `${formatAmount(supplyAPY, 2)}%`,
            },
            {
              key: 'supplied',
              alias: 'SUPPLIED',
              transform: ({ supplied }) => `${formatAmount(supplied, 5)}`,
            },
            {
              key: 'balance',
              alias: 'YOUR WALLET',
              transform: ({ balance }) => `${formatAmount(balance, 5)}`,
            },
            {
              key: 'actions',
              alias: '',
              transform: suppliedActionsTransform,
              align: 'right',
            },
          ]}
          data={creamTokensInfo.filter(({ supplied }) => supplied > 0)}
        />
      </Box>
      <Box fontSize="26px" fontWeight="900" mt="32px" mb="16px">
        Assets Borrowed
      </Box>
      <Box>
        <CreamTable
          metadata={[
            {
              key: 'asset',
              alias: 'ASSET',
              transform: assetTransform,
            },
            {
              key: 'borrowAPY',
              alias: 'BORROW APY',
              transform: ({ borrowAPY }) => `${formatAmount(borrowAPY, 2)}%`,
            },
            {
              key: 'borrowed',
              alias: 'BORROWED',
              transform: ({ borrowed }) => `${formatAmount(borrowed, 5)}`,
            },
            {
              key: 'balance',
              alias: 'YOUR WALLET',
              transform: ({ balance }) => `${formatAmount(balance, 5)}`,
            },
            {
              key: 'actions',
              alias: '',
              transform: borrowedActionsTransform,
              align: 'right',
            },
          ]}
          data={creamTokensInfo.filter(({ borrowed }) => borrowed > 0)}
        />
      </Box>
      <Box fontSize="26px" fontWeight="900" mt="32px" mb="16px">
        All Assets
      </Box>
      <Box>
        <CreamTable
          metadata={[
            {
              key: 'asset',
              alias: 'ASSET',
              transform: assetTransform,
            },
            {
              key: 'supplyAPY',
              alias: 'SUPPLY APY',
              transform: ({ supplyAPY }) => `${formatAmount(supplyAPY, 2)}%`,
            },
            {
              key: 'borrowAPY',
              alias: 'BORROW APY',
              transform: ({ borrowAPY }) => `${formatAmount(borrowAPY, 2)}%`,
            },
            {
              key: 'balance',
              alias: 'YOUR WALLET',
              transform: ({ balance }) => `${formatAmount(balance, 5)}`,
            },
            {
              key: 'actions',
              alias: 'COLLATERAL',
              transform: allActionsTransform,
              align: 'right',
            },
          ]}
          data={creamTokensInfo}
        />
      </Box>
    </StyledContainer>
  );
};

export default Cream;
