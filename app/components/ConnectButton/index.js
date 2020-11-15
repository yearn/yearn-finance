import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from 'components/Button';
import {
  useWallet,
  useSelectWallet,
  useAccount,
} from 'containers/ConnectionProvider/hooks';
import ConnectedAccount from './connectedAccount';

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
      <Button className={className} onClick={selectWallet}>
        <FormattedMessage id="account.connect" />
      </Button>
    );
  }

  return <React.Fragment>{content}</React.Fragment>;
}
