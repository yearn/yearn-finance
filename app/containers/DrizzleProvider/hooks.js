import { useContext } from 'react';
import context from './context';

export function useDrizzle() {
  const { drizzle } = useContext(context);
  return drizzle;
}
