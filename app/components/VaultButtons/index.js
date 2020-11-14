import React from 'react';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { purple } from '@material-ui/core/colors';
import { useSelector } from 'react-redux';
import { selectAddress } from 'containers/ConnectionProvider/selectors';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { useShowDevVaults } from 'containers/Vaults/hooks';
import { withStyles } from '@material-ui/core/styles';

const Wrapper = styled.div`
  display: grid;
  justify-content: center;
  grid-template-columns: repeat(5, 1fr);
  width: 100%;
  grid-gap: 0px 20px;
  margin: 20px;
  direction: rtl;
`;

export default function VaultButtons(props) {
  const { vault } = props;
  const { address, writeMethods } = vault;
  const vaultContract = useContract(address);
  const account = useSelector(selectAddress());
  const showDevVaults = useShowDevVaults();

  const ColorButton = withStyles(theme => ({
    root: {
      color: theme.palette.getContrastText(purple[500]),
      fontFamily: 'Calibre Medium',
      fontSize: '20px',
      padding: '8px 20px 5px 20px',
      margin: '10px 0px ',
      width: '100%',
      direction: 'ltr',
      textTransform: showDevVaults ? 'inherit' : 'capitalize',
      backgroundColor: '#0657F9',
      '&:hover': {
        backgroundColor: '#0657F9',
      },
    },
  }))(Button);

  const deposit = () => {
    vaultContract.methods.deposit.cacheSend(0, { from: account });
  };
  const renderButton = (method, key) => {
    const methodAlias = method.alias || method.name;
    return (
      <ColorButton
        key={key}
        variant="contained"
        onClick={deposit}
        color="primary"
        title={methodAlias}
      >
        {methodAlias}
      </ColorButton>
    );
  };

  const vaultButtons = _.map(writeMethods, renderButton);

  return <Wrapper>{vaultButtons}</Wrapper>;
}
