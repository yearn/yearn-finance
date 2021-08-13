import React from 'react';
import { useDispatch } from 'react-redux';
import Tooltip from '@material-ui/core/Tooltip';
import { useContract } from 'containers/DrizzleProvider/hooks';
// import { selectMigrationData } from 'containers/Vaults/selectors';
import { migrateVault, migrateTriCryptoVault } from 'containers/Vaults/actions';
import ButtonFilled from 'components/ButtonFilled';
import {
  TRUSTED_MIGRATOR_ADDRESS,
  TRICRYPTO_VAULT_MIGRATOR,
  TRICRYPTO_VAULT,
} from 'containers/Vaults/constants';

const MigrateVault = ({ vaultAddress }) => {
  const dispatch = useDispatch();
  const vaultContract = useContract(vaultAddress);
  const trustedMigratorContract = useContract(TRUSTED_MIGRATOR_ADDRESS);
  const triCryptoVaultMigratorContract = useContract(TRICRYPTO_VAULT_MIGRATOR);
  const isVaultTriCrypto = vaultAddress === TRICRYPTO_VAULT;
  // const migrationData = useSelector(selectMigrationData);
  // const vaultMigrationData = migrationData[vaultAddress];

  // const balance = get(vaultMigrationData, 'balanceOf');
  // const hasBalance = balance !== '0';

  const migrate = () => {
    if (isVaultTriCrypto) {
      dispatch(
        migrateTriCryptoVault({
          vaultContract,
          triCryptoVaultMigratorContract,
        }),
      );
    } else {
      dispatch(
        migrateVault({
          vaultContract,
          trustedMigratorContract,
        }),
      );
    }
  };

  return (
    <Tooltip title="Migrate your balance to v2 Vault">
      <>
        <ButtonFilled
          onClick={migrate}
          color="primary"
          disabled={!vaultContract || !trustedMigratorContract}
          disabledTooltipText="Connect your wallet to migrate vault"
          showTooltipWhenDisabled
        >
          Migrate all
        </ButtonFilled>
      </>
    </Tooltip>
  );
};

export default MigrateVault;
