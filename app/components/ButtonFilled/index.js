import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import { useShowDevVaults } from 'containers/Vaults/hooks';

export default function ButtonFilled(props) {
  const {
    onClick,
    disabled,
    className,
    children,
    type,
    title,
    onSubmit,
    color,
    tooltipText,
    showTooltip,
  } = props;
  const showDevVaults = useShowDevVaults();

  // TODO: Refactor to use theme colors
  const ColorButton = withStyles(() => ({
    root: {
      fontSize: '16px',
      fontWeight: 'bold',
      borderRadius: '7px',
      padding: '3px 20px 8px 20px',
      margin: color === 'secondary' ? '0px' : '10px 0px',
      width: '100%',
      direction: 'ltr',
      justifyContent: 'center',
      height: '46px',
      textTransform: showDevVaults ? 'inherit' : 'capitalize',
      backgroundColor: color === 'secondary' ? '#999' : '#006AE3',
      color: color === 'secondary' ? '#333' : '#fff',
      '&:hover': {
        backgroundColor: color === 'secondary' ? '#999' : '#006AE3',
      },
      '&:hover.Mui-disabled': {
        backgroundColor: color === 'secondary' ? '#999' : '#006AE3',
      },
      textAlign: 'center',
      '&.Mui-disabled': {
        opacity: 0.5,
        backgroundColor: color === 'secondary' ? '#999' : '#006AE3',
        color: color === 'secondary' ? '#333' : '#fff',
        cursor: 'not-allowed',
        pointerEvents: 'auto',
      },
    },
  }))(Button);

  if (disabled && showTooltip) {
    const adjustedButtonProps = {
      disabled,
      component: disabled ? 'div' : undefined,
      onClick: disabled ? undefined : onClick,
    };
    return (
      <Tooltip title={tooltipText}>
        <ColorButton
          className={className}
          variant="contained"
          color={color}
          onClick={onClick}
          onSubmit={onSubmit}
          type={type}
          disabled={disabled}
          {...adjustedButtonProps}
        >
          {children}
        </ColorButton>
      </Tooltip>
    );
  }
  return (
    <ColorButton
      className={className}
      variant="contained"
      title={title}
      color={color}
      onClick={onClick}
      onSubmit={onSubmit}
      type={type}
      disabled={disabled}
    >
      {children}
    </ColorButton>
  );
}
