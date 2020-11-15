import { useContext } from 'react';
import context from './context';

export function useAccount() {
  const { account } = useContext(context);
  return account;
}

export function useWallet() {
  const { wallet } = useContext(context);
  return wallet;
}

export function useSelectWallet() {
  const { selectWallet } = useContext(context);
  return selectWallet;
}

export function useOnboard() {
  const { onboard } = useContext(context);
  return onboard;
}

export function useWeb3() {
  const { web3 } = useContext(context);
  return web3;
}

export function useNotify() {
  const { notify } = useContext(context);
  return notify;
}

export function useRequireConnection() {
  const { selectWallet, wallet } = useContext(context);
  if (!wallet.provider) {
    selectWallet();
  }
}
