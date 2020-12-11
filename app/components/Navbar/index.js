import React, { useRef } from 'react';
import { useClickAway } from 'react-use';
import tw, { css } from 'twin.macro';

const FlyingMenu = ({ isActive, clickAwayRef, links }) => (
  <div
    ref={clickAwayRef}
    css={[
      isActive ? tw`opacity-100 animate-flyingMenuEntering` : tw`opacity-0`,
    ]}
    className="absolute z-10 -ml-6 mt-3 transform px-2 min-w-max max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2 animate-flyingMenuEntering"
  >
    <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
      <div className=" bg-black relative pl-8 pr-36 space-y-4 py-2">
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
  return (
    <div className="relative bg-black h-14 w-screen">
      <div className="px-4 sm:px-6">
        <div className="flex py-4 justify-between">
          <div className="flex self-center">
            <a href="/">
              <span className="sr-only">Workflow</span>
              <img
                className="h-5 w-auto"
                src="/navbar-logo.inline.svg"
                alt="logo"
              />
            </a>
          </div>

          <div className="-mr-2 -my-2 md:hidden">
            <button
              type="button"
              className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            >
              <span className="sr-only">Open menu</span>
              {/* <!-- Heroicon name: menu --> */}
              <svg
                className="h-6 w-6"
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

          <nav className="flex space-x-10">
            <MenuItem
              setIsActive={setIsActive}
              isActive={isActive}
              text="Products"
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
              text="Stats"
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
              text="Gov"
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
              text="Labs"
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
              text="Community"
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
              text="Docs"
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
      {/* <!--
    Mobile menu, show/hide based on mobile menu state.

    Entering: "duration-200 ease-out"
      From: "opacity-0 scale-95"
      To: "opacity-100 scale-100"
    Leaving: "duration-100 ease-in"
      From: "opacity-100 scale-100"
      To: "opacity-0 scale-95"
  --> */}
      <div className="absolute top-0 inset-x-0 p-2 transition transform origin-top-right md:hidden">
        <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-white divide-y-2 divide-gray-50">
          <div className="pt-5 pb-6 px-5">
            <div className="flex items-center justify-between">
              <div>
                <img
                  className="h-5 w-auto"
                  src="/navbar-logo.inline.svg"
                  alt="Workflow"
                />
              </div>
              <div className="-mr-2">
                <button
                  type="button"
                  className="bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                >
                  <span className="sr-only">Close menu</span>
                  {/* <!-- Heroicon name: x --> */}
                  <svg
                    className="h-6 w-6"
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
            <div className="mt-6">
              <nav className="grid gap-y-8">
                <a href="/" className="-m-3 p-3 flex items-center rounded-md ">
                  {/* <!-- Heroicon name: chart-bar --> */}
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-indigo-600"
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <span className="ml-3 text-base font-medium text-gray-900">
                    Analytics
                  </span>
                </a>

                <a href="/" className="-m-3 p-3 flex items-center rounded-md ">
                  {/* <!-- Heroicon name: cursor-click --> */}
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-indigo-600"
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
                      d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
                    />
                  </svg>
                  <span className="ml-3 text-base font-medium text-gray-900">
                    Engagement
                  </span>
                </a>

                <a href="/" className="-m-3 p-3 flex items-center rounded-md ">
                  {/* <!-- Heroicon name: shield-check --> */}
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-indigo-600"
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
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="ml-3 text-base font-medium text-gray-900">
                    Security
                  </span>
                </a>

                <a href="/" className="-m-3 p-3 flex items-center rounded-md ">
                  {/* <!-- Heroicon name: view-grid --> */}
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-indigo-600"
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
                      d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                    />
                  </svg>
                  <span className="ml-3 text-base font-medium text-gray-900">
                    Integrations
                  </span>
                </a>

                <a href="/" className="-m-3 p-3 flex items-center rounded-md ">
                  {/* <!-- Heroicon name: refresh --> */}
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-indigo-600"
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
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  <span className="ml-3 text-base font-medium text-gray-900">
                    Automations
                  </span>
                </a>
              </nav>
            </div>
          </div>

          <div className="py-2 px-5 space-y-6">
            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <a
                href="/"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Pricing
              </a>

              <a
                href="/"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Docs
              </a>

              <a
                href="/"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Enterprise
              </a>

              <a
                href="/"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Blog
              </a>

              <a
                href="/"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Help Center
              </a>

              <a
                href="/"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Guides
              </a>

              <a
                href="/"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Security
              </a>

              <a
                href="/"
                className="text-base font-medium text-gray-900 hover:text-gray-700"
              >
                Events
              </a>
            </div>
            <div>
              <a
                href="/"
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign up
              </a>
              <p className="mt-6 text-center text-base font-medium text-gray-500">
                Existing customer?
                <a href="/" className="text-indigo-600 hover:text-indigo-500">
                  Sign in
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Navbar };
