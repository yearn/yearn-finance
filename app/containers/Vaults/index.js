import React from 'react';
import styled from 'styled-components';
import { Accordion } from 'react-bootstrap';

// import { useRequireConnection } from 'containers/ConnectionProvider/hooks';
import { selectVaults } from 'containers/Vaults/selectors';
import { selectDevMode } from 'containers/DevMode/selectors';
import { useSelector } from 'react-redux';
import Vault from 'components/Vault';
import VaultDev from 'components/VaultDev';

const Wrapper = styled.div`
  width: 1000px;
  margin: 0 auto;
`;

const AddVault = styled.div`
  margin: 0 auto;
  height: 36px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const Input = styled.input`
  height: 30px;
  font-size: 14px;
  padding: 0px 7px;
  width: 200px;
`;

const Button = styled.button`
  height: 100%;
  margin-left: 10px;
`;

export default function Main() {
  const vaults = useSelector(selectVaults());
  const devMode = useSelector(selectDevMode());
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
  const renderDevVault = vault => (
    <VaultDev vault={vault} key={vault.address} />
  );
  let vaultRows = _.map(vaults, renderVault);
  let addVault;
  if (devMode) {
    addVault = (
      <AddVault>
        <Input placeholder="Address" />
        <Button>Add Vault</Button>
      </AddVault>
    );
    vaultRows = _.map(vaults, renderDevVault);
  }

  return (
    <Wrapper>
      {addVault}
      <Accordion>{vaultRows}</Accordion>
    </Wrapper>
  );
}
