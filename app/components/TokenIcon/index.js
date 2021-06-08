import React, { useMemo } from 'react';
import web3 from 'web3';
import ReactImageFallback from 'react-image-fallback';

const FallbackUrl = `https://i.imgur.com/7lETB36.png`;

export default function TokenIcon(props) {
  const url = useMemo(() => {
    if (props) {
      if (props.icon) {
        return props.icon;
      }
      if (props.address) {
        const checksumAddress = web3.utils.toChecksumAddress(props.address);
        return `https://raw.githubusercontent.com/yearn/yearn-assets/master/icons/tokens/${checksumAddress}/logo-128.png`;
      }
    }
    return FallbackUrl;
  }, [props]);

  return (
    <ReactImageFallback
      src={url}
      fallbackImage={FallbackUrl}
      className={props.className}
      style={{ maxWidth: 'initial' }}
      alt=""
    />
  );
}
