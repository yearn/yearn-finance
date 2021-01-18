import { matchPath } from 'react-router';
import { useSelector } from 'react-redux';
import { selectLocation } from 'containers/App/selectors';

export function useShowDevVaults() {
  const devMode = true;
  const location = useSelector(selectLocation());
  const { pathname } = location;
  const routeIsDevelop = matchPath(pathname, {
    path: '/vaults/develop',
    exact: true,
    strict: false,
  });
  const showDevVaults = routeIsDevelop && devMode;
  return showDevVaults;
}
