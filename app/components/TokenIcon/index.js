import React from 'react';
import web3 from 'web3';
import ReactImageFallback from 'react-image-fallback';
import styled from 'styled-components';

export default function TokenIcon(props) {
  const { address, className } = props;
  const fallbackUrl = `https://i.imgur.com/7lETB36.png`;
  let url = fallbackUrl;
  if (address) {
    const checksumAddress = web3.utils.toChecksumAddress(address);
    url = `https://raw.githubusercontent.com/iearn-finance/yearn-assets/master/icons/tokens/${checksumAddress}/logo-128.png`;
  }

  const Wrapper = styled.div`
    max-width: initial;
  `;

  return (
    <Wrapper className={className}>
      <ReactImageFallback
        src={url}
        fallbackImage={fallbackUrl}
        className={className}
        alt=""
      />
    </Wrapper>
  );
}
