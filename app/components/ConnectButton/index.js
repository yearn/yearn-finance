import React from 'react';
import { FormattedMessage } from 'react-intl';
import tw, { styled } from 'twin.macro';
import {
  useWallet,
  useSelectWallet,
  useAccount,
} from 'containers/ConnectionProvider/hooks';
import ConnectedAccount from './ConnectedAccount';

const StyledButton = styled.button(() => [
  tw`
  text-white uppercase rounded-xl border-2 border-yearn-blue px-6
  items-center justify-center align-middle 
  font-thin text-base flex hover:text-yearn-blue pt-1
  `,
]);

export default function ConnectButton(props) {
  const { className } = props;
  const wallet = useWallet();
  const account = useAccount();
  const selectWallet = useSelectWallet();
  let content;

  if (window.location.pathname === '/') {
    return <StyledButton>Launch App</StyledButton>;
  }
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
        <FormattedMessage id="account.connect" />
      </StyledButton>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}
