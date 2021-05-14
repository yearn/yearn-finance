import zapperVaultZapInV3Abi from 'abi/zapperVaultZapInV3.json';
import zapperVaultZapOutV2Abi from 'abi/zapperVaultZapOutV2.json';
import zapperPickleZapInV1Abi from 'abi/zapperPickleZapInV1.json';

export const INIT_ZAPPER = 'INIT_ZAPPER';
export const ZAPPER_DATA_LOADED = 'ZAPPER_DATA_LOADED';
export const ZAP_IN = 'ZAP_IN';
export const ZAP_OUT = 'ZAP_OUT';
export const ZAP_IN_ERROR = 'ZAP_IN_ERROR';
export const ZAP_OUT_ERROR = 'ZAP_OUT_ERROR';
export const MIGRATE_PICKLE_GAUGE = 'MIGRATE_PICKLE_GAUGE';

export const ETH_ADDRESS = '0x0000000000000000000000000000000000000000';
export const DEFAULT_SLIPPAGE = '0.01';

export const ZAPPER_WHITELIST = [
  {
    name: 'yVault_ZapIn_V3',
    contractAddress: '0x42D4e90Ff4068Abe7BC4EaB838c7dE1D2F5998A3',
    abi: zapperVaultZapInV3Abi,
    method: 'ZapIn',
  },
  {
    name: 'yVault_ZapOut_V2',
    contractAddress: '0xC5b49ABF8b164472bE9486767aF6B1A5586B5609',
    abi: zapperVaultZapOutV2Abi,
    method: 'ZapOut',
  },
  {
    name: 'Pickle_ZapIn_V1',
    contractAddress: '0xc695f73c1862e050059367B2E64489E66c525983',
    abi: zapperPickleZapInV1Abi,
    method: 'ZapIn',
  },
];
