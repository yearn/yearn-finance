// import BigNumber from 'bignumber.js';
import { createSelector } from 'reselect';
import { flattenData } from 'utils/contracts';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import vaultsOrder from 'containers/Vaults/customOrder.json';
import { selectPoolData } from '../Cover/selectors';
import {
  zapsToVaultAddressMap,
  ETHEREUM_ADDRESS,
  PICKLEJAR_ADDRESS,
  ZAP_YVE_CRV_ETH_PICKLE_ADDRESS,
  MASTER_CHEF_ADDRESS,
  CRV_ADDRESS,
  VYPER_ADDRESS,
  BACKSCRATCHER_ADDRESS,
} from '../Vaults/constants';

const selectApp = (state) => state.app;
const selectRouter = (state) => state.router;
const selectContractsData = (state) => state.contracts;
const selectSubscriptionsData = (state) => state.subscriptions;
const selectConnection = (state) => state.connection;
const selectCover = (state) => state.cover;

export const selectReady = () =>
  createSelector(selectApp, (substate) => substate && substate.ready);

export const selectVaults = () =>
  createSelector(selectApp, (substate) => substate.vaults);

export const selectAmplifyVaults = () =>
  createSelector(selectApp, (substate) => substate.amplifyVaults);

export const selectBackscratcherVault = () =>
  createSelector(selectApp, (substate) => substate.backscratcher);

export const selectPickleVault = () =>
  createSelector(selectApp, (substate) =>
    substate.amplifyVaults.filter(
      (vault) => vault.address === PICKLEJAR_ADDRESS,
    ),
  );

export const selectCoverProtocols = () =>
  createSelector(selectCover, (substate) =>
    substate ? substate.protocols : [],
  );

export const selectEthBalance = () =>
  createSelector(selectApp, (substate) => substate.ethBalance);

export const selectWatchedContractAddresses = () =>
  createSelector(selectApp, (substate) => substate.watchedContractAddresses);

export const selectUser = () =>
  createSelector(selectApp, (substate) => substate.user);

export const selectLocation = () =>
  createSelector(selectRouter, (routerState) => routerState.location);

export const selectAllContracts = () =>
  createSelector(selectContractsData, (substate) => substate);

export const selectContracts = (namespace) =>
  createSelector(selectContractsData, (substate) =>
    _.filter(substate, { namespace }),
  );

export const selectRelevantAdressesByContract = (contractAddress) =>
  createSelector(
    selectVaults(),
    selectPoolData(),
    selectBackscratcherVault(),
    selectContractsByTag('creamUnderlyingTokens'),
    selectContractsByTag('creamCTokens'),
    (
      vaultsData,
      coverPoolDataMap,
      backscratcherVault,
      creamUnderlyingTokensContracts,
      creamCTokensContracts,
    ) => {
      if (
        contractAddress === ZAP_YVE_CRV_ETH_PICKLE_ADDRESS ||
        contractAddress === MASTER_CHEF_ADDRESS
      ) {
        return {
          type: 'zapPickle',
          relevantAddresses: [
            MASTER_CHEF_ADDRESS,
            CRV_ADDRESS,
            PICKLEJAR_ADDRESS,
          ].filter((val) => !!val),
        };
      }
      if (contractAddress === VYPER_ADDRESS) {
        return {
          type: 'zap',
          relevantAddresses: [BACKSCRATCHER_ADDRESS].filter((val) => !!val),
        };
      }

      const isZap = !!zapsToVaultAddressMap[contractAddress.toLowerCase()];
      if (isZap) {
        const vaultAddress =
          zapsToVaultAddressMap[contractAddress.toLowerCase()];
        const vault = vaultsData.find(
          (v) => v.address.toLowerCase() === vaultAddress.toLowerCase(),
        );
        if (vault) {
          return {
            type: 'vault',
            relevantAddresses: [vault.address, vault.token.address].filter(
              (val) => !!val,
            ),
          };
        }
      }

      const vault = vaultsData.find(
        (v) => v.address.toLowerCase() === contractAddress.toLowerCase(),
      );
      if (vault) {
        return {
          type: 'vault',
          relevantAddresses: [vault.address, vault.token.address].filter(
            (val) => !!val,
          ),
        };
      }

      if (contractAddress === backscratcherVault.address) {
        return {
          type: 'backscratcher',
          relevantAddresses: [
            backscratcherVault.address,
            backscratcherVault.token.address,
          ],
        };
      }

      if (coverPoolDataMap && coverPoolDataMap[contractAddress.toLowerCase()]) {
        return { type: 'cover' };
      }

      const creamContracts = creamUnderlyingTokensContracts.concat(
        creamCTokensContracts,
      );

      const cream = creamContracts.find(
        (c) => c.address.toLowerCase() === contractAddress.toLowerCase(),
      );
      if (cream) {
        return { type: 'cream' };
      }

      return { type: 'token', relevantAddresses: [contractAddress] };
    },
  );

export const selectSubscriptionsByAddresses = (addresses) =>
  createSelector(selectSubscriptionsData, (subscriptionsData) => {
    const subscriptionsMatch = _.filter(
      subscriptionsData,
      (subscription) =>
        _.intersection(
          _.map(subscription.addresses, (address) => address.toLowerCase()),
          _.map(addresses, (address) => address.toLowerCase()),
        ).length > 0,
    );
    return subscriptionsMatch;
  });

export const selectContractsByTag = (tag) =>
  createSelector(
    selectContractsData,
    selectSubscriptionsData,
    (contractsData, subscriptionsData) => {
      const subscriptionsMatch = _.filter(subscriptionsData, (subscription) =>
        _.includes(subscription.tags, tag),
      );
      const addressesToSelect = {};
      const addAddress = (address) => {
        addressesToSelect[address] = true;
      };
      const extractAddresses = (subscription) => {
        const { addresses } = subscription;
        _.each(addresses, addAddress);
      };
      _.each(subscriptionsMatch, extractAddresses);
      const contractAddresses = Object.keys(addressesToSelect);
      const getContract = (address) => contractsData[address];
      const contracts = _.compact(_.map(contractAddresses, getContract));
      const flattenedContracts = _.map(contracts, flattenData);
      return flattenedContracts;
    },
  );

export const selectContractData = (contractAddress) =>
  createSelector(selectContractsData, (substate) => {
    const contractData = substate[contractAddress] || {};

    const flattenedData = flattenData(contractData);
    return flattenedData;
  });

export const selectTokenAllowance = (tokenAddress, spenderAddress) =>
  createSelector(
    selectAccount(),
    selectAllContracts(),
    (account, allContracts) => {
      const token = allContracts[tokenAddress];
      const allowances = _.get(token, 'allowance');
      const tokenAllowanceObject = _.find(allowances, (allowance) =>
        _.includes(allowance.args, spenderAddress),
      );
      const tokenAllowance = _.get(tokenAllowanceObject, 'value');
      return tokenAllowance;
    },
  );

export const selectContractDataComplex = (contractAddress) =>
  createSelector(
    selectContractsData,
    (substate) => substate[contractAddress] || {},
  );

export const selectSelectedAccount = () =>
  createSelector(selectConnection, (substate) => substate && substate.account);

export const selectOrderedVaults = createSelector(
  selectVaults(),
  selectContracts('vaults'),
  (vaults, vaultsContractData) => {
    // Remove non-endorsed vaults
    const filteredVaults = _.filter(vaults, (vault) => vault.endorsed);

    const filteredV2Vaults = _.filter(
      filteredVaults,
      (vault) => vault.type === 'v2',
    );

    const filteredV1Vaults = _.filter(
      filteredVaults,
      (vault) => vault.type === 'v1',
    );

    // If no contract data is available sort by vault version
    if (_.isUndefined(vaultsContractData) || _.isEmpty(vaultsContractData)) {
      const vaultsSortedByVersion = _.orderBy(filteredVaults, 'type', 'desc');
      return vaultsSortedByVersion;
    }

    const v2VaultsWithSortingData = getVaultsWithSortingData(
      filteredV2Vaults,
      'v2',
    );
    const v1VaultsWithSortingData = getVaultsWithSortingData(
      filteredV1Vaults,
      'v1',
    );

    const orderedVaultsV2 = _.orderBy(
      v2VaultsWithSortingData,
      ['customOrder'],
      ['asc'],
    );

    const orderedVaultsV1 = _.orderBy(
      v1VaultsWithSortingData,
      ['customOrder'],
      ['asc'],
    );

    // Remove the added fields, that were only used for ordering.
    let orderedVaults = _.concat(orderedVaultsV2, orderedVaultsV1);
    orderedVaults = _.omit(orderedVaults, [
      'userHoldings',
      'vaultTokenHoldings',
    ]);

    return orderedVaults;
  },
);

function getVaultsWithSortingData(vaults, vaultVersion) {
  const vaultsWithSortingData = _.map(vaults, (vault) => {
    const vaultWithSortingData = vault;

    vaultWithSortingData.customOrder = (function getVaultTokenHoldings() {
      const sortAddress = vault.pureEthereum ? ETHEREUM_ADDRESS : vault.address;
      let vaultOrder = _.indexOf(vaultsOrder[vaultVersion], sortAddress);
      if (vaultOrder === -1) {
        vaultOrder = 10000000;
      }
      return vaultOrder;
    })();

    return vaultWithSortingData;
  });

  return vaultsWithSortingData;
}
