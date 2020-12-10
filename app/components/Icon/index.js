/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */
import React from 'react';
import Copy from './copy.svg';
import Clock from './clock.svg';
import Stats from './stats.svg';

export default function Icon(props) {
  const { onClick, disabled, className, type } = props;
  const icons = {
    copy: Copy,
    clock: Clock,
    stats: Stats,
  };
  const src = icons[type];

  return (
    <img
      className={className}
      src={src}
      alt=""
      onClick={onClick}
      disabled={disabled}
    />
  );
}
