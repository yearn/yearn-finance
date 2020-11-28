import md5 from 'md5';
import delay from 'delay';
import request from 'utils/request';

const etherscanDelayTime = 300;
const apiKey = 'GEQXZDY67RZ4QHNU1A57QVPNDV3RP1RYH4';

const getAbiByHash = () => JSON.parse(localStorage.getItem('abiByHash')) || {};

const getAbiHashByAddress = () =>
  JSON.parse(localStorage.getItem('abiHashByAddress')) || {};

const fetchAbi = async address => {
  const url = `https://api.etherscan.io/api?module=contract&action=getabi&address=${address}&apikey=${apiKey}`;
  const resp = await request(url);
  const abi = JSON.parse(resp.result);
  return abi;
};

const setLocalStorageItem = (key, item) => {
  localStorage.setItem(key, JSON.stringify(item));
};

export const addAbiToCache = async (address, providedAbi) => {
  let abi;
  const cacheAbi = newAbi => {
    const abiHashByAddress = getAbiHashByAddress();
    const abiByHash = getAbiByHash();
    const abiHash = md5(newAbi);
    abiByHash[abiHash] = newAbi;
    abiHashByAddress[address] = abiHash;
    setLocalStorageItem('abiByHash', abiByHash);
    setLocalStorageItem('abiHashByAddress', abiHashByAddress);
    return newAbi;
  };
  const cachedAbi = getAbiFromCache(address);
  if (providedAbi) {
    abi = cacheAbi(providedAbi);
  } else if (!cachedAbi) {
    console.log('No cached abi found');
    abi = await fetchAbi(address);
    cacheAbi(abi);
    await delay(etherscanDelayTime);
  }
  return abi;
};

export const getAbiFromCache = address => {
  const abiHashByAddress = getAbiHashByAddress();
  const abiByHash = getAbiByHash();
  const abiHash = abiHashByAddress[address];
  const abi = abiByHash[abiHash];
  return abi;
};

export const getCachedAbi = async address => {
  let abi = getAbiFromCache(address);
  if (!abi) {
    abi = await addAbiToCache(address);
  } else {
    console.log(`Loaded cached ABI: ${address}`);
  }
  return abi;
};
