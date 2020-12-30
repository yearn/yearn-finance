import tw, { theme } from 'twin.macro';
import { createGlobalStyle } from 'styled-components';

export const GlobalNotifyStyles = createGlobalStyle`
  .bn-notify-custom {
    
    &.bn-notify-notification {
      ${tw`rounded-md`}
    }

    &.bn-notify-notification-status-icon {
      ${tw`fill-current stroke-current text-white`}
    }
    &.bn-notify-notification-info-meta-duration-time, &.bn-notify-notification-info-meta-timestamp {
      ${tw`text-sm`}
    }
    
    &.bn-notify-notification-info {
      ${tw`text-white font-sans text-base`}
    }

    &.bn-notify-notification-pending {
      background: ${theme('background.yearn.gradient.blue')};
      border: 2px solid;
      ${tw`shadow-yearn-blue border-yearn-blue`};
    }
    &.bn-notify-notification-success {
      background: ${theme('background.yearn.gradient.green')};
      border: 2px solid;
      ${tw`shadow-yearn-green border-yearn-green`};
    }
    &.bn-notify-notification-error {
      background: ${theme('background.yearn.gradient.red')};
      border: 2px solid;
      ${tw`shadow-yearn-red border-yearn-red`};
    }
    &.bn-notify-notification-hint {
      background: ${theme('background.yearn.gradient.yellow')};
      border: 2px solid;
      ${tw`shadow-yearn-yellow border-yearn-yellow`};
    }
  }
`;
