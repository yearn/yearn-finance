/* eslint-disable no-nested-ternary */
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
    disabledTooltipText,
    enabledTooltipText,
    showTooltipWhenDisabled,
    showTooltipWhenEnabled,
    outlined,
  } = props;
  const showDevVaults = useShowDevVaults();

  // TODO: Refactor to use theme colors
  const ColorButton = withStyles(() => ({
    root: {
      fontSize: '16px',
      fontWeight: 'bold',
      padding: '0 20px',
      border: outlined ? '2px solid #006AE3' : 'inherit',
      borderRadius: '5px',
      margin: color === 'secondary' ? '0px' : '10px 0px',
      width: '100%',
      direction: 'ltr',
      justifyContent: 'center',
      height: '46px',
      textTransform: showDevVaults ? 'inherit' : 'capitalize',
      backgroundColor:
        color === 'secondary' ? '#999' : outlined ? '#0A1D3F' : '#006AE3',
      color: color === 'secondary' ? '#333' : '#fff',
      '&:hover': {
        backgroundColor:
          color === 'secondary' ? '#999' : outlined ? '#0A1D3F' : '#006AE3',
      },
      '&:hover.Mui-disabled': {
        backgroundColor:
          color === 'secondary' ? '#999' : outlined ? '#0A1D3F' : '#006AE3',
      },
      textAlign: 'center',
      '&.Mui-disabled': {
        opacity: 0.5,
        backgroundColor:
          color === 'secondary' ? '#999' : outlined ? '#0A1D3F' : '#006AE3',
        color: color === 'secondary' ? '#333' : '#fff',
        cursor: 'not-allowed',
        pointerEvents: 'auto',
      },
    },
  }))(Button);

  if (
    (disabled && showTooltipWhenDisabled) ||
    (!disabled && showTooltipWhenEnabled)
  ) {
    const adjustedButtonProps = {
      disabled,
      component: disabled ? 'div' : undefined,
      onClick: disabled ? undefined : onClick,
    };
    const tooltipTitle = disabled ? disabledTooltipText : enabledTooltipText;
    return (
      <Tooltip title={tooltipTitle}>
        <ColorButton
          className={className}
          variant="contained"
          color={color}
          onClick={onClick}
          onSubmit={onSubmit}
          type={type}
          disabled={disabled}
          outlined={outlined}
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
      outlined={outlined}
    >
      {children}
    </ColorButton>
  );
}
