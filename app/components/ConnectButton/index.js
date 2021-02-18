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
  border: 1px solid
    ${(props) => (props.inverted ? props.theme.primary : '#fff')};
  border-radius: 33px;
  display: block;
  width: ${(props) => (props.inverted ? '100%' : null)};
  :focus {
    outline: 0;
  }
`;

const StyledText = styled(Text)`
  color: ${(props) => (props.inverted ? props.theme.primary : '#fff')};
`;

export default function ConnectButton(props) {
  const { className, inverted } = props;
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
        inverted={inverted}
      />
    );
  } else {
    content = (
      <StyledButton
        className={className}
        onClick={selectWallet}
        inverted={inverted}
        width={1}
      >
        <StyledText
          small
          center
          fontWeight={1}
          mx={6}
          my={2}
          inverted={inverted}
        >
          Connect <span tw="hidden md:inline-block">Wallet</span>
        </StyledText>
        {/* <FormattedMessage id="account.connect" /> */}
      </StyledButton>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}
