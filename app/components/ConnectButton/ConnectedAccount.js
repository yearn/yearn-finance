import React from 'react';
import tw, { styled } from 'twin.macro';
import ENS from 'ethjs-ens';
import { getShortenedAddress } from 'utils/string';
import { useWeb3 } from 'containers/ConnectionProvider/hooks';

const ConnectedAccount = styled.button`
  ${tw`
  border-2 border-yearn-blue rounded-xl
  py-1
  px-4 items-center justify-center align-middle
  text-xs flex
  bg-gradient-to-r from-gray-900 to-yearn-blue
  text-white
  `}
`;

export default function Account(props) {
  const { account, onClick, className } = props;
  const web3 = useWeb3();
  const [address, setAddress] = React.useState(getShortenedAddress(account));

  React.useEffect(() => {
    const setAddressEnsName = async () => {
      const provider = web3.currentProvider;
      const network = provider.networkVersion;
      const ens = new ENS({ provider, network });
      let addressEnsName;
      try {
        addressEnsName = await ens.reverse(account);
        if (addressEnsName) {
          setAddress(addressEnsName);
        }
      } catch (err) {
        // Although an error is thrown if no ens name is found during lookup,
        // failure to find an ENS name for an address is not an error, and is
        // currently the most likely outcome during a lookup, so no need to log
        // nor handle the "error".
      }
      if (!addressEnsName) {
        setAddress(getShortenedAddress(account));
      }
    };
    setAddressEnsName();
  }, [account, address, web3]);
  return (
    <ConnectedAccount onClick={onClick} className={className}>
      <p tw="text-sm font-mono">{address}</p>
    </ConnectedAccount>
  );
}
