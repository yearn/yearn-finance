// import BigNumber from 'bignumber.js';
import { createSelector } from 'reselect';
import { flattenData } from 'utils/contracts';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import vaultsOrder from 'containers/Vaults/customOrder.json';
const selectApp = (state) => state.app;
const selectRouter = (state) => state.router;
const selectContractsData = (state) => state.contracts;
const selectSubscriptionsData = (state) => state.subscriptions;
const selectConnection = (state) => state.connection;

// TODO: Add to constants
const ethereumAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';

export const selectReady = () =>
  createSelector(selectApp, (substate) => substate && substate.ready);

export const selectVaults = () =>
  createSelector(selectApp, (substate) => substate.vaults);

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
      ({ type, endorsed }) => !(type === 'v2' && !endorsed),
    );

    if (!vaultsContractData || !vaultsContractData.length) {
      const vaultsSortedByVersion = _.orderBy(filteredVaults, 'type', 'desc');

      return {
        isVaultsContractDataEmpty: true,
        vaultData: vaultsSortedByVersion,
      };
    }

    const vaultsWithSortingData = _.map(filteredVaults, (vault) => {
      const vaultWithSortingData = vault;

      const { address, type, decimals } = vault;

      const contractData = _.find(vaultsContractData, {
        address,
      });

      // Add user holdings data to enable sorting by it.
      vaultWithSortingData.userHoldings = (function getUserHoldings() {
        const rawUserHoldings = _.get(contractData, 'balanceOf[0].value', 0);

        let rawSharePrice;

        if (type === 'v1') {
          rawSharePrice = _.get(
            contractData,
            'getPricePerFullShare[0].value',
            0,
          );
        }

        rawSharePrice = _.get(contractData, 'pricePerShare[0].value', 0);

        const userHoldings = new BigNumber(rawUserHoldings)
          .multipliedBy(rawSharePrice)
          .dividedBy(10 ** decimals);

        return userHoldings.toNumber();
      })();

      // Add vault token holdings data to enable sorting by it.
      vaultWithSortingData.vaultTokenHoldings = (function getVaultTokenHoldings() {
        let rawVaultTokenHoldings;

        if (type === 'v1') {
          rawVaultTokenHoldings = _.get(contractData, 'balance[0].value', 0);
        }

        rawVaultTokenHoldings = _.get(contractData, 'totalAssets[0].value', 0);

        const vaultTokenHoldings = new BigNumber(
          rawVaultTokenHoldings,
        ).dividedBy(10 ** decimals);

        return vaultTokenHoldings.toNumber();
      })();

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

    return {
      isVaultsContractDataEmpty: false,
      vaultData: orderedVaults,
    };
  },
);
