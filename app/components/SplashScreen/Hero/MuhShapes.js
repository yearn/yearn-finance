import React from 'react';
import Particles from 'react-tsparticles';
import { css } from 'twin.macro';

export const MuhShapes = () => (
  <div
    tw="absolute overflow-hidden z-0 flex justify-center items-center w-full"
    css={[
      css`
        height: calc(100vh - 208px);
        > #tsparticles {
          height: 100%;
          width: 100%;
        }
      `,
    ]}
  >
    <Particles
      id="tsparticles"
      options={{
        background: {
          color: {
            value: 'black',
          },
        },
        fpsLimit: 60,
        interactivity: {
          detectsOn: 'canvas',
          events: {
            // onClick: {
            //   enable: true,
            //   mode: 'push',
            // },
            onHover: {
              enable: true,
              mode: 'repulse',
            },
          },
          modes: {
            repulse: {
              distance: 100,
              duration: 0.4,
            },
          },
        },
        particles: {
          size: {
            value: 50,
          },
          collisions: {
            enable: true,
          },
          move: {
            direction: 'none',
            enable: true,
            outMode: 'bounce',
            random: false,
            speed: 3,
            straight: false,
          },
          number: {
            density: {
              enable: true,
              value_area: 600,
            },
            value: 12,
          },
          shape: {
            type: 'images',
            images: [
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/blue-arc.svg',
                height: 130,
                width: 240,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/white-b.svg',
                height: 70,
                width: 240,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/cirlce.svg',
                height: 100,
                width: 100,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/white-triangle.svg',
                height: 120,
                width: 120,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/green-circle.svg',
                height: 100,
                width: 100,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/smiley.svg',
                height: 100,
                width: 100,
              },
              {
                type: 'image',
                src: 'https://s3.amazonaws.com/v2.yearn.finance/Splash/yfi.svg',
                height: 100,
                width: 100,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/yellow-quarter-circle.svg',
                height: 100,
                width: 100,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/red-arc.svg',
                height: 100,
                width: 100,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/yellow-square.svg',
                height: 100,
                width: 100,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/blue-square.svg',
                height: 100,
                width: 100,
              },
              {
                type: 'image',
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/red-rectangle.svg',
                height: 120,
                width: 60,
              },
            ],
          },
        },
      }}
    />
  </div>
);
