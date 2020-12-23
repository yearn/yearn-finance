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
  text-xs flex hover:text-yearn-blue
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
      try {
        const addressEnsName = await ens.reverse(account);
        if (addressEnsName) {
          return setAddress(addressEnsName);
        }
      } catch (err) {
        console.error(err);
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
