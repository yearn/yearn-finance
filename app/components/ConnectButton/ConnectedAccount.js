import React from 'react';
import tw, { styled } from 'twin.macro';
import { getShortenedAddress } from 'utils/string';

const ConnectedAccount = styled.button`
  ${tw`
  border-2 border-yearn-blue rounded-xl
  px-6 items-center justify-center align-middle 
  font-thin text-xs flex hover:text-yearn-blue
  bg-gradient-to-r from-gray-900 to-yearn-blue
  text-white
  `}
`;

export default function Account(props) {
  const { account, onClick, className } = props;
  // TODO: Provider.resolveName(account) + useState + useEffect hook
  return (
    <ConnectedAccount onClick={onClick} className={className}>
      <span tw="text-lg mt-1">{getShortenedAddress(account)}</span>
    </ConnectedAccount>
  );
}
