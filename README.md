<span>
    <img align="right" src="app/images/icon-512x512.png" height="100" />
</span>

# yearn.finance

[![Production Build Deployment](https://github.com/iearn-finance/yearn-finance/workflows/Production%20Build%20Deployment/badge.svg)](https://github.com/iearn-finance/yearn-finance/actions?query=workflow%3A%22Production+Build+Deployment%22)
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

## Helpful links

- 🌐 [Live site](https://yearn.finance)
- ⚖️ [Governance forum](https://gov.yearn.finance)
- 📑 [Documentation](https://docs.yearn.finance)

## Setup

```
cp .env.sample to .env
```

And then populate .env with your endpoints

## Development

```
$ yarn dev
```

### Testing on mainnet fork

```sh
# terminal 1:
export WEB3_INFURA_PROJECT_ID=your-infura-id           
npm run fork:start

# terminal 2:
npm run dev
```

**[Important]** Remember to change Metamask to Localhost RPC endpoint :)


## Production

```
$ yarn build
$ yarn start
```

## Contributing

Code style follows prettier conventions (`yarn prettier`). Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.
