import React from 'react';
import tw, { css } from 'twin.macro';
import { Link } from 'react-router-dom';
import { menuLinks } from './menuLinks';

export const FlyingMobileMenuTopDrawer = ({ setIsMobileOpen }) => (
  <div tw="flex items-end justify-end z-10">
    <button
      type="button"
      tw="-mr-2 self-end rounded-md p-2 inline-flex items-center justify-center text-white hover:text-gray-500 focus:outline-none"
      onClick={() => setIsMobileOpen(false)}
    >
      <span tw="sr-only">Close menu</span>
      <svg
        tw="h-8 w-8"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    </button>
  </div>
);

export const FlyingMobileMenuItem = ({
  setIsMobileOpen,
  setIsActive,
  menuItemText,
  links,
}) => {
  if (Array.isArray(links)) {
    return (
      <button onClick={() => setIsActive(menuItemText)} type="button" tw="">
        <span tw="font-black uppercase text-white text-4xl hover:text-yearn-blue  focus:text-yearn-blue">
          {menuItemText}
        </span>
      </button>
    );
  }
  return links.href.includes('http') ? (
    <a href={`${links.href}`} type="button" tw="">
      <span tw="font-black uppercase text-white text-4xl hover:text-yearn-blue  focus:text-yearn-blue">
        {menuItemText}
      </span>
    </a>
  ) : (
    <Link
      to={`${links.href}`}
      onClick={() => setIsMobileOpen(false)}
      type="button"
    >
      <span tw="font-black uppercase text-white text-4xl hover:text-yearn-blue  focus:text-yearn-blue">
        {menuItemText}
      </span>
    </Link>
  );
};

const FlyingMobileSecondMenuTopDrawer = ({
  mobileIsActive,
  setMobileIsActive,
  setIsMobileOpen,
}) => (
  <div tw="flex items-center justify-between z-10">
    <div
      tw="h-8 w-8 text-white"
      role="button"
      tabIndex="0"
      onClick={() => setMobileIsActive(false)}
      onKeyPress={() => setMobileIsActive(false)}
    >
      <svg
        tw="h-8 w-8"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 19l-7-7 7-7"
        />
      </svg>
    </div>
    <span tw="text-white text-2xl font-black uppercase">{mobileIsActive}</span>
    <div tw="-mr-2">
      <button
        type="button"
        tw="rounded-md p-2 inline-flex items-center justify-center text-white hover:text-gray-500 focus:outline-none"
        onClick={() => {
          setIsMobileOpen(false);
          setMobileIsActive(false);
        }}
        tabIndex="0"
        onKeyPress={() => {
          setIsMobileOpen(false);
          setMobileIsActive(false);
        }}
      >
        <span tw="sr-only">Close menu</span>
        <svg
          tw="h-8 w-8"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
);

const FlyingMobileSecondMenu = ({
  setMobileIsActive,
  mobileIsActive,
  setIsMobileOpen,
}) => (
  <div tw="absolute top-0 w-screen h-screen inset-x-0 overflow-visible transition transform origin-top-right md:hidden">
    <div tw="bg-black w-full h-full">
      <div tw="pt-5 pb-6 px-5 h-full">
        <FlyingMobileSecondMenuTopDrawer
          mobileIsActive={mobileIsActive}
          setMobileIsActive={setMobileIsActive}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div
          tw="relative object-center h-full flex justify-center -mt-4"
          css={[
            css`
              background-image: url('/navbar-mobile-bg.png');
            `,
          ]}
        >
          <nav tw="z-10 flex flex-col space-y-4 justify-center h-full">
            {menuLinks[mobileIsActive].map((link) => (
              <a href={link.href} tw="flex">
                <div
                  css={[
                    // amazing
                    css`
                      &:hover {
                        > *:not(:last-child) {
                          ${tw`text-yearn-blue`}
                        }
                      }
                    `,
                  ]}
                >
                  <p tw="text-2xl font-black text-white inline-block mr-2">
                    {link.title}
                  </p>
                  <svg
                    css={[link.href[0] !== '/' && tw`inline-block`]}
                    tw="hidden text-white h-4 self-start"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                  <p tw="mt-1 text-base text-white">{link.description}</p>
                </div>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  </div>
);

export const FlyingMobileMenu = ({
  setMobileIsActive,
  setIsMobileOpen,
  mobileIsActive,
}) => {
  if (mobileIsActive) {
    return (
      <FlyingMobileSecondMenu
        mobileIsActive={mobileIsActive}
        setMobileIsActive={setMobileIsActive}
        setIsMobileOpen={setIsMobileOpen}
      />
    );
  }
  return (
    <div tw="absolute top-0 w-screen h-screen inset-x-0 overflow-visible transition transform origin-top-right md:hidden">
      <div tw="bg-black w-full h-full">
        <div tw="pt-5 pb-6 px-5 h-full">
          <FlyingMobileMenuTopDrawer setIsMobileOpen={setIsMobileOpen} />
          <div
            css={[
              css`
                background: url('/navbar-mobile-bg.png') no-repeat center center
                  fixed;
                background-size: cover;
              `,
            ]}
            tw="object-center h-full relative -mt-4"
          >
            <nav tw="flex flex-col space-y-2 items-center justify-center z-10 h-full w-full absolute">
              {Object.keys(menuLinks).map((menuItemText) => (
                <FlyingMobileMenuItem
                  key={menuItemText}
                  setIsMobileOpen={setIsMobileOpen}
                  setIsActive={setMobileIsActive}
                  menuItemText={menuItemText}
                  links={menuLinks[menuItemText]}
                />
              ))}
              {/* TODO: Uncomment out when implementing dark mode theme switching */}
              {/* <div tw="flex h-14 w-24 align-center">
                <svg
                  tw="text-white h-full w-12"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                <span tw="text-white text-3xl text-center">/</span>
                <svg
                  tw="text-white h-full w-12"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                  />
                </svg>
              </div> */}
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};
