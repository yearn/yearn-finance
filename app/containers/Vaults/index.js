import React from 'react';
import styled from 'styled-components';
import { Accordion } from 'react-bootstrap';

// import { useRequireConnection } from 'containers/ConnectionProvider/hooks';
import { selectVaults } from 'containers/Vaults/selectors';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';

const Wrapper = styled.div``;

export default function Main() {
  const vaults = useSelector(selectVaults());
  // useRequireConnection();
  // const web3 = useWeb3();
  // const notify = useNotify();
  // const onboard = useOnboard();
  // const address = useAddress();
  // get current account
  // if (!web3 || !address || !onboard) {
  //   return;
  // }
  // console.log('adrv, ', address, web3, onboard);
  // const accounts = await web3.eth.getAccounts();
  // console.log('accts', accounts);
  // await onboard.walletCheck();
  // const address1 = '0x19A329742EC1c25EFe894B5F81BDfd1D44A2C85e';
  // send the transaction using web3.js and get the hash
  // web3.eth
  //   .sendTransaction({
  //     from: address,
  //     to: address,
  //     value: '000000000000001',
  //   })
  //   .on('transactionHash', function(hash) {
  //     // pass the hash to notify to track it
  //     notify.hash(hash);
  //   });

  const renderVault = vault => <Vault vault={vault} key={vault.address} />;
  const vaultEls = _.map(vaults, renderVault);

  return (
    <Wrapper>
      <Accordion>{vaultEls}</Accordion>
    </Wrapper>
  );
}
