import { useContext } from 'react';
import { getWriteMethods } from 'utils/contracts';
import context from './context';

export function useDrizzle() {
  const { drizzle } = useContext(context);
  return drizzle;
}

export function useContract(address) {
  const { drizzle } = useContext(context);
  if (!drizzle) {
    return {};
  }
  return drizzle.contracts[address];
}

export function useContractAbi(address) {
  const contract = useContract(address);
  if (!contract) {
    return [];
  }
  return contract.abi;
}

export function useGetWriteMethods(address) {
  const abi = useContractAbi(address);
  const writeMethods = getWriteMethods(abi);
  return writeMethods;
}
