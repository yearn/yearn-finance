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

## Testing on mainnet fork
https://eth-brownie.readthedocs.io/en/stable/install.html
#### Requeriments:
```
python3 (to install pipx)
python3-pip (to install pipx)
python3-venv (to install brownie)
pipx (to install brownie)
eth-brownie
```

```sh
# terminal 1:
export WEB3_INFURA_PROJECT_ID=your-infura-id
yarn fork:start

# terminal 2:
yarn dev
```

**[Important]**:
- Set USE_LOCAL_RPC variable to TRUE on .env file.
- Change Metamask to Localhost RPC endpoint :)

#### How to add new tokens
- Open `internals/forknet/supply-tokens.py`
- Add the desired token like `crvToken = Contract.from_explorer("0xD533a949740bb3306d119CC777fa900bA034cd52")`
- Go to etherscan and find a whale that has enough balance of that token and
- Add the whale like `crvWhale = accounts.at("0x4ce799e6ed8d64536b67dd428565d52a531b3640", force=True)`
- Set the desired amount like `crvToken.transfer(account, "1000 ether", {'from': crvWhale})`
- Restart or run `yarn fork start`

## Production

```
$ yarn build
$ yarn start
```

## Contributing

Code style follows prettier conventions (`yarn prettier`). Commit messages follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) spec.
