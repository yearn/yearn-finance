import { useContext } from 'react';
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
