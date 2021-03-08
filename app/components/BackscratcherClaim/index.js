import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { selectContractData } from 'containers/App/selectors';
import { claimBackscratcherRewards } from 'containers/Vaults/actions';
import ButtonFilled from 'components/ButtonFilled';
import RoundedInput from 'components/RoundedInput';
import Box from 'components/Box';

// import { abbreviateNumber } from 'utils/string';

const weiToUnits = (amount, decimals) =>
  new BigNumber(amount).dividedBy(10 ** decimals).toFixed(2);

const formatAmount = (amount) =>
  Number.isNaN(amount) || amount === 'NaN' ? 0 : Number(amount, 10);

const BackscratcherClaim = ({ vaultAddress, isScreenMd }) => {
  const dispatch = useDispatch();
  const vaultContract = useContract(vaultAddress);
  const vaultContractData = useSelector(selectContractData(vaultAddress));
  if (!vaultContract) {
    return null;
  }
  const index = get(vaultContractData, 'index');
  const supplyIndex = get(vaultContractData, 'supplyIndex');
  const balance = get(vaultContractData, 'balanceOf');
  const claimable = formatAmount(
    weiToUnits(
      new BigNumber(index)
        .minus(supplyIndex)
        .times(balance)
        .div(10 ** 18),
      18,
    ),
    2,
  );

  return (
    <>
      {claimable !== 0 && (
        <Box display="flex" flexDirection="column" width={1}>
          <div>Available 3Crv:</div>
          <Box
            display="flex"
            direction={isScreenMd ? 'row' : 'column'}
            alignItems="center"
            width={1}
          >
            <Box>
              <RoundedInput
                className="disabled-primary"
                disabled
                value={claimable.toFixed(2)}
              />
            </Box>
            {/* TODO Restake
          <Box>
            <ButtonFilled
              className="action-button dark"
              onClick={() =>
                dispatch(reestackeBackscratcherRewards({ vaultContract }))
              }
              color="primary"
            >
              Restake
            </ButtonFilled>
          </Box> */}
            <Box ml={isScreenMd ? 5 : 0} width={isScreenMd ? '30%' : 1}>
              <ButtonFilled
                className="action-button dark"
                onClick={() =>
                  dispatch(claimBackscratcherRewards({ vaultContract }))
                }
                color="primary"
              >
                Claim
              </ButtonFilled>
            </Box>
          </Box>
        </Box>
      )}
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
