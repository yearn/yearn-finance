import React from 'react';
import Particles from 'react-tsparticles';
import { css } from 'twin.macro';

export const MuhShapes = () => (
  <div
    tw="absolute overflow-hidden z-0 flex justify-center items-center h-full"
    css={[
      css`
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
            push: {
              quantity: 4,
            },
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
            value: 10,
          },
          shape: {
            images: [
              {
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/blue-arc.svg',
                height: 126,
                width: 250,
              },
              {
                src: 'https://s3.amazonaws.com/v2.yearn.finance/Splash/b.svg',
                height: 244,
                width: 62,
              },
              {
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/circle.svg',
                height: 100,
                width: 100,
              },
              {
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/triangle.svg',
                height: 120,
                width: 120,
              },
              {
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/green-circle.svg',
                height: 50,
                width: 50,
              },
              {
                src: 'https://s3.amazonaws.com/v2.yearn.finance/Splash/yfi.svg',
                height: 135,
                width: 135,
              },
              {
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/yellow-arc.svg',
                height: 126,
                width: 126,
              },
              {
                src: 'https://s3.amazonaws.com/v2.yearn.finance/Splash/arc.svg',
                height: 126,
                width: 126,
              },
              {
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/yellow-square.svg',
                height: 122,
                width: 62,
              },
              {
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/square.svg',
                height: 122,
                width: 62,
              },
              {
                src:
                  'https://s3.amazonaws.com/v2.yearn.finance/Splash/red-rectangle.svg',
                height: 122,
                width: 62,
              },
            ],
            type: 'images',
          },
        },
        detectRetina: true,
      }}
    />
  </div>
);
