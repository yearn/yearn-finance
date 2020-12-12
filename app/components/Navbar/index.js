import React, { useRef } from 'react';
import { useClickAway } from 'react-use';
import tw, { css } from 'twin.macro';

const FlyingMobileMenuTopDrawer = ({ setIsMobileOpen }) => (
  <div className="flex items-end justify-end z-10">
    <button
      type="button"
      className="-mr-2 self-end rounded-md p-2 inline-flex items-center justify-center text-white hover:text-gray-500 focus:outline-none"
      onClick={() => setIsMobileOpen(false)}
    >
      <span className="sr-only">Close menu</span>
      <svg
        className="h-8 w-8"
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

const FlyingMobileMenuItem = ({ setIsActive, menuItemText }) => (
  <button type="button" className="" onClick={() => setIsActive(menuItemText)}>
    <span className="font-black uppercase text-white text-4xl hover:text-yearn-blue  focus:text-yearn-blue">
      {menuItemText}
    </span>
  </button>
);

const FlyingMobileSecondMenuTopDrawer = ({
  mobileIsActive,
  setMobileIsActive,
  setIsMobileOpen,
}) => (
  <div className="flex items-center justify-between z-10">
    <div
      className="h-8 w-8 text-white"
      role="button"
      tabIndex="0"
      onClick={() => setMobileIsActive(false)}
      onKeyPress={() => setMobileIsActive(false)}
    >
      <svg
        className="h-8 w-8"
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
    <span className="text-white text-2xl font-black uppercase">
      {mobileIsActive}
    </span>
    <div className="-mr-2">
      <button
        type="button"
        className="rounded-md p-2 inline-flex items-center justify-center text-white hover:text-gray-500 focus:outline-none"
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
        <span className="sr-only">Close menu</span>
        <svg
          className="h-8 w-8"
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

const secondMenuLinks = {
  products: [
    {
      href: '/vaults',
      title: 'yVaults',
      description: 'Deposit and earn',
    },
    {
      href: '/vaults',
      title: 'yCover',
      description: 'Cover smart contract risk',
    },
    {
      href: '/vaults',
      title: 'yUSD',
      description: 'Stable coin index',
    },
    {
      href: 'https://zapier.io',
      title: 'Zap',
      description: 'Zap in and out of the pools',
    },
  ],
  stats: [
    {
      href: '/vaults',
      title: 'yVaults',
      description: 'Deposit and earn',
    },
    {
      href: '/vaults',
      title: 'yCover',
      description: 'Cover smart contract risk',
    },
    {
      href: '/vaults',
      title: 'yUSD',
      description: 'Stable coin index',
    },
    {
      href: 'https://zapier.io',
      title: 'Zap',
      description: 'Zap in and out of the pools',
    },
  ],
  gov: [
    {
      href: '/vaults',
      title: 'yVaults',
      description: 'Deposit and earn',
    },
    {
      href: '/vaults',
      title: 'yCover',
      description: 'Cover smart contract risk',
    },
    {
      href: '/vaults',
      title: 'yUSD',
      description: 'Stable coin index',
    },
    {
      href: 'https://zapier.io',
      title: 'Zap',
      description: 'Zap in and out of the pools',
    },
  ],
  labs: [
    {
      href: '/vaults',
      title: 'yVaults',
      description: 'Deposit and earn',
    },
    {
      href: '/vaults',
      title: 'yCover',
      description: 'Cover smart contract risk',
    },
    {
      href: '/vaults',
      title: 'yUSD',
      description: 'Stable coin index',
    },
    {
      href: 'https://zapier.io',
      title: 'Zap',
      description: 'Zap in and out of the pools',
    },
  ],
  community: [
    {
      href: '/vaults',
      title: 'yVaults',
      description: 'Deposit and earn',
    },
    {
      href: '/vaults',
      title: 'yCover',
      description: 'Cover smart contract risk',
    },
    {
      href: '/vaults',
      title: 'yUSD',
      description: 'Stable coin index',
    },
    {
      href: 'https://zapier.io',
      title: 'Zap',
      description: 'Zap in and out of the pools',
    },
  ],
  docs: [
    {
      href: '/vaults',
      title: 'yVaults',
      description: 'Deposit and earn',
    },
    {
      href: '/vaults',
      title: 'yCover',
      description: 'Cover smart contract risk',
    },
    {
      href: '/vaults',
      title: 'yUSD',
      description: 'Stable coin index',
    },
    {
      href: 'https://zapier.io',
      title: 'Zap',
      description: 'Zap in and out of the pools',
    },
  ],
};

const FlyingMobileSecondMenu = ({
  setMobileIsActive,
  mobileIsActive,
  setIsMobileOpen,
}) => (
  <div className="absolute top-0 w-screen h-screen inset-x-0 overflow-visible transition transform origin-top-right md:hidden">
    <div className="bg-black w-full h-full">
      <div className="pt-5 pb-6 px-5 h-full">
        <FlyingMobileSecondMenuTopDrawer
          mobileIsActive={mobileIsActive}
          setMobileIsActive={setMobileIsActive}
          setIsMobileOpen={setIsMobileOpen}
        />

        <div
          className="relative object-center h-full flex justify-center -mt-4"
          css={[
            css`
              background-image: url('/navbar-mobile-bg.png');
            `,
          ]}
        >
          <nav className="z-10 flex flex-col space-y-4 justify-center h-full">
            {secondMenuLinks[mobileIsActive].map(link => (
              <a href={link.href} className="flex">
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
                  <p className="text-2xl font-black text-white inline-block mr-2">
                    {link.title}
                  </p>
                  <svg
                    css={[link.href[0] !== '/' && tw`inline-block`]}
                    className="hidden text-white h-4 self-start"
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
                  <p className="mt-1 text-md text-white">{link.description}</p>
                </div>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </div>
  </div>
);

const FlyingMobileMenu = ({
  setMobileIsActive,
  mobileIsActive,
  setIsMobileOpen,
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
    <div className="absolute top-0 w-screen h-screen inset-x-0 overflow-visible transition transform origin-top-right md:hidden">
      <div className="bg-black w-full h-full">
        <div className="pt-5 pb-6 px-5 h-full">
          <FlyingMobileMenuTopDrawer setIsMobileOpen={setIsMobileOpen} />
          <div
            css={[
              css`
                background-image: url('/navbar-mobile-bg.png');
              `,
            ]}
            className="object-center h-full relative -mt-4"
          >
            <nav className="flex flex-col space-y-2 items-center justify-center z-10 h-full w-full absolute">
              <FlyingMobileMenuItem
                setIsActive={setMobileIsActive}
                menuItemText="products"
              />
              <FlyingMobileMenuItem
                setIsActive={setMobileIsActive}
                menuItemText="stats"
              />
              <FlyingMobileMenuItem
                setIsActive={setMobileIsActive}
                menuItemText="gov"
              />
              <FlyingMobileMenuItem
                setIsActive={setMobileIsActive}
                menuItemText="labs"
              />
              <FlyingMobileMenuItem
                setIsActive={setMobileIsActive}
                menuItemText="community"
              />
              <FlyingMobileMenuItem
                setIsActive={setMobileIsActive}
                menuItemText="docs"
              />
              {/* TODO: Uncomment out when implementing dark mode theme switching */}
              {/* <div className="flex h-14 w-24 align-center">
                <svg
                  className="text-white h-full w-12"
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
                <span className="text-white text-3xl text-center">/</span>
                <svg
                  className="text-white h-full w-12"
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

const FlyingMenu = ({ isActive, clickAwayRef, links }) => (
  <div
    ref={clickAwayRef}
    css={[
      isActive ? tw`opacity-100 animate-flyingMenuEntering` : tw`opacity-0`,
    ]}
    className="absolute z-10 -ml-6 transform px-2 min-w-max max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2 animate-flyingMenuEntering"
  >
    <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className=" bg-black relative pl-8 pr-36 space-y-4 py-6">
        {links.map(link => (
          <a href={link.href} className="flex items-start">
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
              <p className="text-base font-black text-white inline-block mr-2">
                {link.title}
              </p>
              <svg
                css={[link.href[0] !== '/' && tw`inline-block`]}
                className="hidden text-white h-4 self-start"
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
              <p className="mt-1 text-sm text-white">{link.description}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  </div>
);

const MenuItem = ({ text, isActive, setIsActive, links }) => {
  const ref = useRef(null);
  useClickAway(ref, () => {
    setIsActive(false);
  });

  return (
    <div className="relative">
      {/* <!-- Item active: "text-gray-900", Item inactive: "text-gray-500" --> */}
      <div
        onClick={() => {
          setIsActive(text);
        }}
        onMouseEnter={() => {
          setIsActive(text);
        }}
        onKeyPress={() => {
          setIsActive(text);
        }}
        role="button"
        tabIndex="0"
      >
        <span className="font-sans hover:text-yearn-blue text-white uppercase font-black group rounded-md inline-flex items-center text-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {text}
        </span>
      </div>

      <FlyingMenu
        clickAwayRef={ref}
        isActive={text === isActive}
        links={links}
      />
    </div>
  );
};

const Navbar = () => {
  const [isActive, setIsActive] = React.useState(undefined);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [mobileIsActive, setMobileIsActive] = React.useState(false);

  return (
    <div className="relative bg-black w-screen">
      <div className="px-4 sm:px-6">
        <div className="flex py-4 justify-between">
          <div className="-mr-2 -my-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="rounded-md p-2 inline-flex items-center justify-center text-white hover:text-white  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span className="sr-only">Open menu</span>
              <svg
                className="h-8 w-8"
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div className="flex self-center">
            <a href="/">
              <span className="sr-only">Logo</span>
              <img
                className="h-5 w-auto"
                src="/navbar-logo.inline.svg"
                alt="logo"
              />
            </a>
          </div>

          {isMobileOpen && (
            <FlyingMobileMenu
              setMobileIsActive={setMobileIsActive}
              mobileIsActive={mobileIsActive}
              setIsMobileOpen={setIsMobileOpen}
            />
          )}

          <nav className="space-x-10 hidden md:flex">
            <MenuItem
              setIsActive={setIsActive}
              isActive={isActive}
              text="products"
              links={[
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: 'https://google.co.uk',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
              ]}
            />
            <MenuItem
              setIsActive={setIsActive}
              isActive={isActive}
              text="stats"
              links={[
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
              ]}
            />
            <MenuItem
              setIsActive={setIsActive}
              isActive={isActive}
              text="gov"
              links={[
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
              ]}
            />
            <MenuItem
              setIsActive={setIsActive}
              isActive={isActive}
              text="labs"
              links={[
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
              ]}
            />
            <MenuItem
              setIsActive={setIsActive}
              isActive={isActive}
              text="community"
              links={[
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
              ]}
            />
            <MenuItem
              setIsActive={setIsActive}
              isActive={isActive}
              text="docs"
              links={[
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
                {
                  title: 'yVaults',
                  description: 'Deposit and earn',
                  href: '/vaults',
                },
              ]}
            />
          </nav>

          <div className="">
            <a
              href="/connect"
              className="whitespace-nowrap text-base font-medium text-gray-500 hover:text-gray-900"
            >
              Connect
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Navbar };
