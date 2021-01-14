import { createSelector } from 'reselect';
import { flattenData } from 'utils/contracts';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
const selectApp = state => state.app;
const selectRouter = state => state.router;
const selectContractsData = state => state.contracts;
const selectSubscriptionsData = state => state.subscriptions;
const selectConnection = state => state.connection;

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
      const contracts = _.compact(_.map(contractAddresses, getContract));
      const flattenedContracts = _.map(contracts, flattenData);
      return flattenedContracts;
    },
  );

export const selectContractData = contractAddress =>
  createSelector(
    selectContractsData,
    substate => {
      const contractData = substate[contractAddress] || {};
      const flattenedData = flattenData(contractData);
      return flattenedData;
    },
  );

export const selectTokenAllowance = (tokenAddress, spenderAddress) =>
  createSelector(
    selectAccount(),
    selectAllContracts(),
    (account, allContracts) => {
      const token = allContracts[tokenAddress];
      const allowances = _.get(token, 'allowance');
      const tokenAllowanceObject = _.find(allowances, allowance =>
        _.includes(allowance.args, spenderAddress),
      );
      const tokenAllowance = _.get(tokenAllowanceObject, 'value');
      return tokenAllowance;
    },
  );

export const selectContractDataComplex = contractAddress =>
  createSelector(
    selectContractsData,
    substate => substate[contractAddress] || {},
  );

export const selectSelectedAccount = () =>
  createSelector(
    selectConnection,
    substate => substate && substate.account,
  );
