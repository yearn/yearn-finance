import { createSelector } from 'reselect';
import { keyBy } from 'lodash';
import { selectContractsByTag } from 'containers/App/selectors';
import migrationWhitelist from 'containers/Vaults/migrationWhitelist.json';
import { TRICRYPTO_VAULT } from './constants';

export const selectMigrationData = createSelector(
  selectContractsByTag('trustedMigratorVaults'),
  (trustedMigratorVaults) => {
    const trustedMigratorVaultsByAddress = keyBy(
      trustedMigratorVaults,
      'address',
    );
    const migrationData = migrationWhitelist.map((migration) => ({
      ...trustedMigratorVaultsByAddress[migration.vaultFrom],
      ...migration,
    }));

    const migrationDataByVault = keyBy(migrationData, 'vaultFrom');
    return migrationDataByVault;
  },
);

export const selectTriCryptoMigrationData = createSelector(
  selectContractsByTag('triCryptoVaultMigratorVaults'),
  (triCryptoVaultMigratorVaults) => {
    const triCryptoVaultMigratorVaultsByAddress = keyBy(
      triCryptoVaultMigratorVaults,
      'address',
    );
    const migrationData = migrationWhitelist.find(
      (migration) => migration.vaultFrom === TRICRYPTO_VAULT,
    );
    const triCryptoMigrationData = {
      ...triCryptoVaultMigratorVaultsByAddress[migrationData.vaultFrom],
      ...migrationData,
    };

    return triCryptoMigrationData;
  },
);
