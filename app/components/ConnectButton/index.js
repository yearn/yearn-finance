import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from 'components/Button';
import {
  useWallet,
  useSelectWallet,
  useAddress,
} from 'containers/ConnectionProvider/hooks';
import ConnectedAccount from './connectedAccount';

export default function ConnectButton(props) {
  const { className } = props;
  const wallet = useWallet();
  const address = useAddress();
  const selectWallet = useSelectWallet();
  let content;
  if (wallet.provider && address) {
    content = (
      <ConnectedAccount
        className={className}
        onClick={selectWallet}
        address={address}
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
