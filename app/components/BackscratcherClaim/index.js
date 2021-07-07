import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { selectContractData } from 'containers/App/selectors';
import {
  claimBackscratcherRewards,
  restakeBackscratcherRewardsV2,
} from 'containers/Vaults/actions';
import styled from 'styled-components';
import ButtonFilled from 'components/ButtonFilled';
import RoundedInput from 'components/RoundedInput';
import { THREECRV_ADDRESS, ZAP_V2_3CRV } from 'containers/Vaults/constants';
import Box from 'components/Box';
import Text from 'components/Text';

// import { abbreviateNumber } from 'utils/string';

const StyledRoundedInput = styled(RoundedInput)`
  width: 100%;
`;

const weiToUnits = (amount, decimals) =>
  new BigNumber(amount).dividedBy(10 ** decimals).toFixed(2);

const formatAmount = (amount) =>
  Number.isNaN(amount) || amount === 'NaN' ? 0 : Number(amount, 10);

const BackscratcherClaim = ({ vaultAddress, isScreenMd }) => {
  const dispatch = useDispatch();
  const vaultContract = useContract(vaultAddress);
  const threeCrvContract = useContract(THREECRV_ADDRESS);
  const zapv2ThreeCrvContract = useContract(ZAP_V2_3CRV);
  const vaultContractData = useSelector(selectContractData(vaultAddress));
  if (!vaultContract) {
    // return null;
  }
  const index = get(vaultContractData, 'index');
  const supplyIndex = get(vaultContractData, 'supplyIndex');
  const balance = get(vaultContractData, 'balanceOf');
  const cached = get(vaultContractData, 'claimable');
  const claimable = formatAmount(
    weiToUnits(
      new BigNumber(index)
        .minus(supplyIndex)
        .times(balance)
        .div(10 ** 18)
        .plus(cached),
      18,
    ),
    2,
  );

  return (
    <>
      {
        <Box display="flex" flexDirection="column" width={1}>
          <Text bold fontSize={5} mt={50} mb={20}>
            Claim your reward
          </Text>
          <div>Available 3Crv:</div>
          <Box
            display="flex"
            direction={isScreenMd ? 'row' : 'column'}
            alignItems="center"
            width={1}
          >
            <Box width={isScreenMd ? '40%' : 1}>
              <StyledRoundedInput
                className="disabled-primary"
                disabled
                value={claimable.toFixed(2)}
              />
            </Box>
            <Box ml={5} width={isScreenMd ? '30%' : 1}>
              <ButtonFilled
                className="action-button light"
                onClick={() =>
                  dispatch(
                    restakeBackscratcherRewardsV2({
                      zapv2ThreeCrvContract,
                      threeCrvContract,
                    }),
                  )
                }
                color="primary"
                disabled={!claimable}
                showTooltipWhenDisabled
                disabledTooltipText="You don’t have any claimable rewards"
              >
                Restake
              </ButtonFilled>
            </Box>
            <Box ml={5} width={isScreenMd ? '30%' : 1}>
              <ButtonFilled
                className="action-button outline light"
                onClick={() =>
                  dispatch(
                    claimBackscratcherRewards({
                      vaultContract,
                    }),
                  )
                }
                color="primary"
                disabled={!claimable}
                showTooltipWhenDisabled
                disabledTooltipText="You don’t have any claimable rewards"
              >
                Claim
              </ButtonFilled>
            </Box>
          </Box>
        </Box>
      }
      {/* {claimable !== 0 && (
        <ButtonFilled
          onClick={() => dispatch(claimBackscratcherRewards({ vaultContract }))}
          color="primary"
        >
          {`Claim ${abbreviateNumber(claimable)} 3Crv`}
        </ButtonFilled>
      )} */}
    </>
  );
};

export default BackscratcherClaim;
