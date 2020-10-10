import { useContext } from 'react';
import context from './context';

export function useAddress() {
  const { address } = useContext(context);
  return address;
}

export function useWallet() {
  const { wallet } = useContext(context);
  return wallet;
}

export function useSelectWallet() {
  const { selectWallet } = useContext(context);
  return selectWallet;
}

export function useWeb3() {
  const { web3 } = useContext(context);
  return web3;
}

export function useRequireConnection() {
  const { selectWallet, wallet } = useContext(context);
  if (!wallet.provider) {
    selectWallet();
  }
}
