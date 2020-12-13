import React from 'react';
import { css } from 'twin.macro';
import SecurityGraphic from '../../../images/security-graphic.png';

export const Security = () => (
  <div
    css={[
      css`
        background: url(${SecurityGraphic}) no-repeat center center;
        background-size: contain;
        min-height: 763px;
      `,
    ]}
    className="text-white px-10 flex justify-end"
  >
    <div className="flex flex-col w-4/12">
      <h2 className="font-black text-3xl mt-20 mb-2">
        Keeping your money safe is our priority
      </h2>
      <div className="flex flex-col mb-2">
        <h3 className="font-bold text-xl">Audited and verified</h3>
        <h3 className="font-bold text-xl">Learn more about</h3>
        <h3 className="font-bold text-xl">Yearn protocol security</h3>
      </div>
      <div className="flex space-x-4">
        {/* <img src="" alt="audit logo"/> */}
        <div className="w-20 h-10 border-white border-solid border-2 text-white">
          Logo
        </div>
        <div className="w-20 h-10 border-white border-solid border-2 text-white">
          Logo
        </div>
        <div className="w-20 h-10 border-white border-solid border-2 text-white">
          Logo
        </div>
        <div className="w-20 h-10 border-white border-solid border-2 text-white">
          Logo
        </div>
      </div>
    </div>
  </div>
);
