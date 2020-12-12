import tw, { styled, theme, css } from 'twin.macro';

export const TailwindButton = styled.button(({ isSecondary }) => [
  // updated
  tw`py-3 px-8 uppercase rounded border border-primary hover:bg-primary duration-200`,

  css`
    & {
      background-color: ${theme`colors.whiteAlt`};
    }

    &:hover {
      font-size: 2rem;
    }
  `,

  isSecondary && tw`border-secondary hover:bg-secondary hover:text-white`, // new
]);
