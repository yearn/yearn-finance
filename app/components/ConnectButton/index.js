import React from 'react';
import { FormattedMessage } from 'react-intl';
import tw, { styled } from 'twin.macro';
import {
  useWallet,
  useSelectWallet,
  useAccount,
} from 'containers/ConnectionProvider/hooks';
import ConnectedAccount from './connectedAccount';

const StyledButton = styled.button(() => [
  tw`text-white uppercase rounded-2xl border-white border-solid border-2 px-4`,
]);

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
        <FormattedMessage id="account.connect" />
      </StyledButton>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}
