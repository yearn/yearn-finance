import React, { useRef } from 'react';
import { useClickAway } from 'react-use';
import tw from 'twin.macro';
import ConnectButton from 'components/ConnectButton';
import { FlyingMobileMenu } from './FlyingMobileMenu';
import { menuLinks } from './menuLinks';
import { Logo } from './logo';

// TODO: Uncomment when nested menus are ready
// const FlyingMenu = ({ isActive, clickAwayRef, links }) => (
//   <div
//     ref={clickAwayRef}
//     css={[
//       isActive
//         ? tw`opacity-100 animate-flyingMenuEntering`
//         : tw`hidden opacity-0`,
//     ]}
//     tw="absolute z-10 -ml-6 transform px-2 sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2 animate-flyingMenuEntering"
//   >
//     <div tw="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
//       <div tw=" bg-black relative pl-4 min-w-max max-w-md  pr-4 space-y-4 py-6">
//         {links.map(link => (
//           <a href={link.href} tw="flex items-start">
//             <div
//               css={[
//                 // amazing
//                 css`
//                   ${tw`w-full`};
//                   &:hover {
//                     > *:not(:last-child) {
//                       ${tw`text-yearn-blue`}
//                     }
//                   }
//                 `,
//               ]}
//             >
//               <p tw="text-base font-black text-white inline-block mr-2">
//                 {link.title}
//               </p>
//               <svg
//                 css={[link.href[0] !== '/' && tw`inline-block`]}
//                 tw="hidden text-white h-4 self-start"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//                 />
//               </svg>
//               <p tw="mt-1 text-sm text-white">{link.description}</p>
//             </div>
//           </a>
//         ))}
//       </div>
//     </div>
//   </div>
// );

const MenuItem = ({
  text,
  isActive,
  setIsActive,
  // ,links
}) => {
  const ref = useRef(null);
  useClickAway(ref, () => {
    setIsActive(false);
  });

  return (
    <div tw="relative">
      <a
        // TODO: Uncomment when nested menus are ready
        // onClick={() => {
        //   setIsActive(text);
        // }}
        // onMouseEnter={() => {
        //   setIsActive(text);
        // }}
        // onKeyPress={() => {
        //   setIsActive(text);
        // }}
        href={`/${text}`}
        role="button"
        tabIndex="0"
      >
        <span
          css={[isActive === text && tw`text-yearn-blue`]}
          tw="font-sans hover:text-yearn-blue text-white uppercase font-black rounded-md inline-flex items-center text-base focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {text}
        </span>
      </a>
      {/* TODO: Uncomment later when ready */}
      {/* <FlyingMenu
        clickAwayRef={ref}
        isActive={text === isActive}
        links={links}
      /> */}
    </div>
  );
};

const Navbar = () => {
  const [isActive, setIsActive] = React.useState(undefined);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const [mobileIsActive, setMobileIsActive] = React.useState(false);

  return (
    <div tw="relative z-20 bg-black w-full">
      <div tw="px-4 sm:px-6">
        <div tw="flex py-4 justify-between items-center">
          <div tw="-mr-2 -my-2 md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              tw="rounded-md p-2 inline-flex items-center justify-center text-white hover:text-white  focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <span tw="sr-only">Open menu</span>
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
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          <div tw="flex self-center">
            <a href="/">
              <span tw="sr-only">Logo</span>
              <div tw="h-5 w-auto">
                <Logo />
              </div>
            </a>
          </div>

          {isMobileOpen && (
            <FlyingMobileMenu
              setMobileIsActive={setMobileIsActive}
              mobileIsActive={mobileIsActive}
              setIsMobileOpen={setIsMobileOpen}
            />
          )}

          <nav tw="space-x-10 hidden md:flex items-center">
            {Object.keys(menuLinks).map(menuLink => {
              const links = menuLinks[menuLink];
              return (
                <MenuItem
                  key={menuLink}
                  setIsActive={setIsActive}
                  isActive={isActive}
                  text={menuLink}
                  links={links}
                />
              );
            })}
          </nav>

          <ConnectButton />
        </div>
      </div>
    </div>
  );
};

export { Navbar };
