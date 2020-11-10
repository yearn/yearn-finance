export const common = {
  yearnBlue: '#0151f0',
  white: '#fff',
  black: '#000',
  offBlack: '#363537',
  offWhite: '#D8D8D8',
};

export const lightTheme = {
  background: '#fff',
  text: common.offBlack,
  toggleBorder: common.white,
  vaultBackground: '#171D23',
  vaultBackgroundActive: '#171D23',
  vaultBorderActive: '#0657F9',
  vaultText: common.white,
  inputBorder: common.black,
  inputText: common.black,
  inputOutline: 'transparent',
  link: 'blue',
  ...common,
};

export const darkTheme = {
  background: common.black,
  text: common.offWhite,
  toggleBorder: '#6B8096',
  vaultBackground: '#021A4B',
  vaultBackgroundActive: '#011130',
  vaultBackgroundMiddle: '#010919',
  vaultText: common.offWhite,
  vaultBorderActive: '#0657F9',
  inputBorder: common.white,
  inputText: common.white,
  inputOutline: common.yearnBlue,
  link: 'antiquewhite',
  ...common,
};
