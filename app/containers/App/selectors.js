// import BigNumber from 'bignumber.js';
import { createSelector } from 'reselect';
import { flattenData } from 'utils/contracts';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import vaultsOrder from 'containers/Vaults/customOrder.json';
import { selectPoolData } from '../Cover/selectors';
const selectApp = (state) => state.app;
const selectRouter = (state) => state.router;
const selectContractsData = (state) => state.contracts;
const selectSubscriptionsData = (state) => state.subscriptions;
const selectConnection = (state) => state.connection;
const selectCover = (state) => state.cover;

// TODO: Add to constants
const ethereumAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const selectReady = () =>
  createSelector(selectApp, (substate) => substate && substate.ready);

export const selectVaults = () =>
  createSelector(selectApp, (substate) => substate.vaults);

export const selectBackscratcherVault = () =>
  createSelector(selectApp, (substate) => substate.backscratcher);

export const selectCoverProtocols = () =>
  createSelector(selectCover, (substate) =>
    substate ? substate.protocols : [],
  );

export const selectEthBalance = () =>
  createSelector(selectApp, (substate) => substate.ethBalance);

export const selectWatchedContractAddresses = () =>
  createSelector(selectApp, (substate) => substate.watchedContractAddresses);

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
    // Remove non-endorsed v2 vaults
    const filteredVaults = _.filter(
      vaults,
      (vault) => !(vault.type === 'v2' && vault.endorsed === false),
    );

    // If no contract data is available sort by vault version
    if (_.isUndefined(vaultsContractData) || _.isEmpty(vaultsContractData)) {
      const vaultsSortedByVersion = _.orderBy(filteredVaults, 'type', 'desc');
      return vaultsSortedByVersion;
    }

    const vaultsWithSortingData = _.map(filteredVaults, (vault) => {
      const vaultWithSortingData = vault;

      // const contractData = _.find(vaultsContractData, {
      //   address: vault.address,
      // });

      vaultWithSortingData.customOrder = (function getVaultTokenHoldings() {
        const sortAddress = vault.pureEthereum
          ? ethereumAddress
          : vault.address;
        let vaultOrder = _.indexOf(vaultsOrder, sortAddress);
        if (vaultOrder === -1) {
          vaultOrder = 10000000;
        }
        return vaultOrder;
      })();

      // Add user holdings data to enable sorting by it.
      // vaultWithSortingData.userHoldings = (function getUserHoldings() {
      //   const rawUserHoldings = _.get(contractData, 'balanceOf[0].value', 0);

      //   let rawSharePrice;
      //   if (vault.type === 'v1') {
      //     rawSharePrice = _.get(
      //       contractData,
      //       'getPricePerFullShare[0].value',
      //       0,
      //     );
      //   } else if (vault.type === 'v2') {
      //     rawSharePrice = _.get(contractData, 'pricePerShare[0].value', 0);
      //   }

      //   const userHoldings = new BigNumber(rawUserHoldings)
      //     .multipliedBy(rawSharePrice)
      //     .dividedBy(10 ** vault.decimals);

      //   return userHoldings.toNumber();
      // })();

      // // Add vault token holdings data to enable sorting by it.
      // vaultWithSortingData.vaultTokenHoldings = (function getVaultTokenHoldings() {
      //   let rawVaultTokenHoldings;
      //   if (vault.type === 'v1') {
      //     rawVaultTokenHoldings = _.get(contractData, 'balance[0].value', 0);
      //   } else if (vault.type === 'v2') {
      //     rawVaultTokenHoldings = _.get(
      //       contractData,
      //       'totalAssets[0].value',
      //       0,
      //     );
      //   }

      //   const vaultTokenHoldings = new BigNumber(
      //     rawVaultTokenHoldings,
      //   ).dividedBy(10 ** vault.decimals);

      //   return vaultTokenHoldings.toNumber();
      // })();

      return vaultWithSortingData;
    });

    // let orderedVaults = _.orderBy(
    //   vaultsWithSortingData,
    //   ['userHoldings', 'customOrder', 'type'],
    //   ['desc', 'asc', 'desc'],
    // );

    let orderedVaults = _.orderBy(
      vaultsWithSortingData,
      ['customOrder'],
      ['asc'],
    );

    // Remove the added fields, that were only used for ordering.
    orderedVaults = _.omit(orderedVaults, [
      'userHoldings',
      'vaultTokenHoldings',
    ]);

    return orderedVaults;
  },
);
