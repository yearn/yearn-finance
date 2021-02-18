import React from 'react';
import styled from 'styled-components';
import {
  useWallet,
  useSelectWallet,
  useAccount,
} from 'containers/ConnectionProvider/hooks';
import Text from 'components/Text';
import ConnectedAccount from './ConnectedAccount';

const StyledButton = styled.button`
  border: 1px solid #fff;
  border-radius: 33px;
  :focus {
    outline: 0;
  }
`;

export default function ConnectButton(props) {
  const { className } = props;
  const wallet = useWallet();
  const account = useAccount();
  const selectWallet = useSelectWallet();
  let content;

  if (wallet.provider && account) {
    content = (
      <ConnectedAccount
        className={className}
        onClick={selectWallet}
        account={account}
      />
    );
  } else {
    content = (
      <StyledButton className={className} onClick={selectWallet}>
        <Text small center fontWeight={1} mx={6} my={2}>
          Connect <span tw="hidden md:inline-block">Wallet</span>
        </Text>
        {/* <FormattedMessage id="account.connect" /> */}
      </StyledButton>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}
