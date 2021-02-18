import React from 'react';
import { styled } from 'twin.macro';
import ENS from 'ethjs-ens';
import { getShortenedAddress } from 'utils/string';
import { useWeb3 } from 'containers/ConnectionProvider/hooks';
import Text from 'components/Text';

const ConnectedAccount = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  border: 1px solid
    ${(props) => (props.inverted ? props.theme.primary : '#fff')};
  border-radius: 33px;
  width: ${(props) => (props.inverted ? '100%' : null)};
  :focus {
    outline: 0;
  }
  padding: 4px 16px;
`;

const ConnectedCircle = styled.div`
  background-color: #23d198;
  border-radius: 50%;
  width: 10px;
  display: inline-block;
  height: 10px;
  margin-right: 5px;
`;

const StyledText = styled(Text)`
  color: ${(props) => (props.inverted ? props.theme.primary : '#4b9fff')};
`;

export default function Account(props) {
  const { account, onClick, className, inverted } = props;
  const web3 = useWeb3();
  const [address, setAddress] = React.useState(getShortenedAddress(account));

  React.useEffect(() => {
    const setAddressEnsName = async () => {
      const provider = web3.currentProvider;
      const ens = new ENS({ provider, network: 1 });
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
    <ConnectedAccount
      onClick={onClick}
      className={className}
      inverted={inverted}
    >
      <ConnectedCircle />
      <StyledText small center fontWeight={1} inverted={inverted}>
        {' '}
        {address}
      </StyledText>
    </ConnectedAccount>
  );
}
