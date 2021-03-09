import { createSelector } from 'reselect';
import { keyBy } from 'lodash';
import { selectContractsByTag } from 'containers/App/selectors';
import migrationWhitelist from 'containers/Vaults/migrationWhitelist.json';

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
