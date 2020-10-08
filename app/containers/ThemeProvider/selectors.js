import { initialState } from './reducer';

/**
 * Direct selector to the themeToggle state domain
 */
const selectTheme = state => state.theme || initialState;

export { selectTheme };
