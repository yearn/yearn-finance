import { useContext } from 'react';
import context from './context';

export function useModal() {
  return useContext(context);
}
