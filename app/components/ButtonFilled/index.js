import React from 'react';

import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { useShowDevVaults } from 'containers/Vaults/hooks';

export default function ButtonFilled(props) {
  const { onClick, disabled, children, title, color } = props;
  const showDevVaults = useShowDevVaults();

  const ColorButton = withStyles(() => ({
    root: {
      fontFamily: 'Calibre Medium',
      fontSize: '20px',
      padding: '8px 20px 5px 20px',
      margin: color === 'secondary' ? '0px' : '10px 0px',
      width: '100%',
      direction: 'ltr',
      textTransform: showDevVaults ? 'inherit' : 'capitalize',
      backgroundColor: color === 'secondary' ? '#999' : '#0657F9',
      color: color === 'secondary' ? '#333' : '#fff',
      '&:hover': {
        backgroundColor: color === 'secondary' ? '#999' : '#0657F9',
      },
    },
  }))(Button);

  return (
    <ColorButton
      variant="contained"
      title={title}
      color={color}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </ColorButton>
  );
}
