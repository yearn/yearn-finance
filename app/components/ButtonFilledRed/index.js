// TODO: Remove this and refactor buttons

import React from 'react';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { useShowDevVaults } from 'containers/Vaults/hooks';

export default function ButtonFilled(props) {
  const { onClick, disabled, children, type, title, onSubmit } = props;
  const showDevVaults = useShowDevVaults();

  const ColorButton = withStyles(() => ({
    root: {
      fontFamily: 'Calibre Medium',
      fontSize: '20px',
      padding: '8px 20px 5px 20px',
      margin: '10px 0px',
      marginLeft: '20px',
      width: '200px',
      textTransform: showDevVaults ? 'inherit' : 'capitalize',
    },
  }))(Button);

  return (
    <ColorButton
      variant="contained"
      title={title}
      color="secondary"
      onClick={onClick}
      onSubmit={onSubmit}
      type={type}
      disabled={disabled}
    >
      {children}
    </ColorButton>
  );
}
