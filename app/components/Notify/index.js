import React from 'react';
import BncNotify from 'bnc-notify';
import 'twin.macro';
import { GlobalNotifyStyles } from './GlobalNotifyStyles';

const storiesInitConfig = {
  darkMode: true,
  desktopPosition: 'bottomRight',
  mobilePosition: 'bottom',
};
const bncNotify = BncNotify(storiesInitConfig);

const Notify = ({ notificationObject }) => {
  const [bncUpdate, setbncUpdate] = React.useState(undefined);

  return (
    <div tw="flex flex-col space-y-2">
      <GlobalNotifyStyles />
      <button
        type="button"
        onClick={() => {
          const { update } = bncNotify.notification(notificationObject);
          if (!bncUpdate) {
            setbncUpdate(() => update);
          }
        }}
      >
        Show Pending Notification
      </button>
      <button
        type="button"
        onClick={() => {
          const { update } = bncNotify.notification({
            ...notificationObject,
            type: 'success',
          });
          if (!bncUpdate) {
            setbncUpdate(() => update);
          }
        }}
      >
        Show Success Notification
      </button>
      <button
        type="button"
        onClick={() => {
          const { update } = bncNotify.notification({
            ...notificationObject,
            type: 'error',
          });
          if (!bncUpdate) {
            setbncUpdate(() => update);
          }
        }}
      >
        Show Error Notification
      </button>
      <button
        type="button"
        onClick={() => {
          const { update } = bncNotify.notification({
            ...notificationObject,
            type: 'hint',
          });
          if (!bncUpdate) {
            setbncUpdate(() => update);
          }
        }}
      >
        Show Hint Notification
      </button>
    </div>
  );
};
export { Notify };
