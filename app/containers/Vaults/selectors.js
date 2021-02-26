import { createSelector } from 'reselect';
import { keyBy } from 'lodash';
import { selectContractsByTag } from 'containers/App/selectors';
import migrationWhitelist from 'containers/Vaults/migrationWhitelist.json';

export const selectMigrationData = createSelector(
  selectContractsByTag('trustedMigratorVaults'),
  (trustedMigratorVaults) => {
    if (!trustedMigratorVaults) {
      return {};
    }

    const migrationWhitelistByVault = keyBy(migrationWhitelist, 'vaultFrom');
    const migrationData = trustedMigratorVaults.map((vault) => ({
      ...migrationWhitelistByVault[vault.address],
      ...vault,
    }));

    const migrationDataByVault = {
      ...keyBy(migrationData, 'vaultFrom'),
      ...keyBy(migrationData, 'vaultTo'),
    };

    return migrationDataByVault;
  },
);
