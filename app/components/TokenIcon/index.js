import React from 'react';
import web3 from 'web3';
import ReactImageFallback from 'react-image-fallback';

export default function TokenIcon(props) {
  const { address, className } = props;
  const fallbackUrl = `https://i.imgur.com/7lETB36.png`;
  let url = fallbackUrl;
  if (address) {
    const checksumAddress = web3.utils.toChecksumAddress(address);
    url = `https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/${checksumAddress}/logo-128.png`;
  }

  return (
    <ReactImageFallback
      src={url}
      fallbackImage={fallbackUrl}
      className={className}
      style={{ maxWidth: 'initial' }}
      alt=""
    />
  );
}
