/* eslint jsx-a11y/click-events-have-key-events: 0 */
/* eslint jsx-a11y/no-noninteractive-element-interactions: 0 */

/**
 * TODO: Refactor
 */

import React from 'react';
import Copy from './copy.svg';
import Clock from './clock.svg';
import ChevronLeft from './chevronLeft.svg';
import Stats from './stats.svg';
import ExternalLink from './externalLink.svg';
import ArrowDown from './arrowDown.svg';
import ArrowDownAlt from './arrowDownAlt.svg';
import ArrowUpAlt from './arrowUpAlt.svg';
import Info from './info.svg';

export default function Icon(props) {
  const { onClick, disabled, className, type } = props;
  const icons = {
    copy: Copy,
    clock: Clock,
    stats: Stats,
    chevronLeft: ChevronLeft,
    externalLink: ExternalLink,
    info: Info,
    arrowDownAlt: ArrowDownAlt,
    arrowUpAlt: ArrowUpAlt,
    arrowDown: ArrowDown,
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
