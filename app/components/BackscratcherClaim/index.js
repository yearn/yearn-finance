import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import BigNumber from 'bignumber.js';
import { get } from 'lodash';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { selectContractData } from 'containers/App/selectors';
import { claimBackscratcherRewards } from 'containers/Vaults/actions';
import ButtonFilled from 'components/ButtonFilled';

const weiToUnits = (amount, decimals) =>
  new BigNumber(amount).dividedBy(10 ** decimals).toFixed(2);

const formatAmount = (amount, decimals) =>
  Number.isNaN(amount) || amount === 'NaN'
    ? '0'
    : `${Number(amount, 10).toFixed(decimals)}`;

const BackscratcherClaim = ({ vaultAddress }) => {
  const dispatch = useDispatch();
  const vaultContract = useContract(vaultAddress);
  const vaultContractData = useSelector(
    selectContractData(vaultContract.address),
  );

  const index = get(vaultContractData, 'index');
  const supplyIndex = get(vaultContractData, 'supplyIndex');
  const balance = get(vaultContractData, 'balanceOf');
  const claimable = formatAmount(
    weiToUnits(new BigNumber(index).minus(supplyIndex).times(balance), 18),
    2,
  );

  return (
    <>
      {Number(claimable) !== 0 && (
        <ButtonFilled
          onClick={() => dispatch(claimBackscratcherRewards({ vaultContract }))}
          color="primary"
          title="Title Here"
        >
          Claim {claimable} 3crv
        </ButtonFilled>
      )}
    </>
  );
};

export default BackscratcherClaim;
