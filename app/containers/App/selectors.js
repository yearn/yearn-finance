import { createSelector } from 'reselect';

const selectApp = state => state.app;
const selectRouter = state => state.router;
const selectContractsData = state => state.contracts;
const selectSubscriptionsData = state => state.subscriptions;

export const selectReady = () =>
  createSelector(
    selectApp,
    substate => substate && substate.ready,
  );

export const selectVaults = () =>
  createSelector(
    selectApp,
    substate => substate.vaults,
  );

export const selectWatchedContractAddresses = () =>
  createSelector(
    selectApp,
    substate => substate.watchedContractAddresses,
  );

export const selectLocation = () =>
  createSelector(
    selectRouter,
    routerState => routerState.location,
  );

export const selectAllContracts = () =>
  createSelector(
    selectContractsData,
    substate => substate,
  );

export const selectContracts = namespace =>
  createSelector(
    selectContractsData,
    substate => _.filter(substate, { namespace }),
  );

export const selectContractsByTag = tag =>
  createSelector(
    selectContractsData,
    selectSubscriptionsData,
    (contractsData, subscriptionsData) => {
      const subscriptionsMatch = _.filter(subscriptionsData, subscription =>
        _.includes(subscription.tags, tag),
      );
      const addressesToSelect = {};
      const addAddress = address => {
        addressesToSelect[address] = true;
      };
      const extractAddresses = subscription => {
        const { addresses } = subscription;
        _.each(addresses, addAddress);
      };
      _.each(subscriptionsMatch, extractAddresses);
      const contractAddresses = Object.keys(addressesToSelect);
      const getContract = address => contractsData[address];
      const contracts = _.map(contractAddresses, getContract);
      return contracts;
    },
  );

export const selectContractData = contractAddress =>
  createSelector(
    selectContractsData,
    substate => {
      const contractData = substate[contractAddress] || {};

      const flattenedData = {};
      const setFlattenedData = (val, key) => {
        if (_.isArray(val)) {
          flattenedData[key] = _.first(val).value;
        } else {
          flattenedData[key] = val;
        }
      };
      _.each(contractData, setFlattenedData);
      return flattenedData;
    },
  );

export const selectContractDataComplex = contractAddress =>
  createSelector(
    selectContractsData,
    substate => substate[contractAddress] || {},
  );
