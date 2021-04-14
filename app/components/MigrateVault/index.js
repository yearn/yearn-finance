import React from 'react';
import { useDispatch } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import { useContract } from 'containers/DrizzleProvider/hooks';
// import { selectMigrationData } from 'containers/Vaults/selectors';
import { migrateVault } from 'containers/Vaults/actions';
import ButtonFilled from 'components/ButtonFilled';
import { TRUSTED_MIGRATOR_ADDRESS } from 'containers/Vaults/constants';

const MigrateVault = ({ vaultAddress }) => {
  const dispatch = useDispatch();
  const vaultContract = useContract(vaultAddress);
  const trustedMigratorContract = useContract(TRUSTED_MIGRATOR_ADDRESS);
  // const migrationData = useSelector(selectMigrationData);
  // const vaultMigrationData = migrationData[vaultAddress];

  // const balance = get(vaultMigrationData, 'balanceOf');
  // const hasBalance = balance !== '0';

  return (
    <Tooltip title="Migrate your balance to v2 Vault">
      <ButtonFilled
        onClick={() =>
          dispatch(migrateVault({ vaultContract, trustedMigratorContract }))
        }
        color="primary"
        disabled={!vaultContract || !trustedMigratorContract}
        disabledTooltipText="Connect your wallet to migrate vault"
        showTooltipWhenDisabled
      >
        Migrate all
      </ButtonFilled>
    </Tooltip>
  );
};

export default MigrateVault;
