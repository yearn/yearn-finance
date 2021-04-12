import ButtonFilled from 'components/ButtonFilled';
import RoundedInput from 'components/RoundedInput';
import RoundedSelect from 'components/RoundedSelect';
import Grid from '@material-ui/core/Grid';
import { useContract } from 'containers/DrizzleProvider/hooks';
import { useWeb3 } from 'containers/ConnectionProvider/hooks';
import {
  withdrawFromVault,
  withdrawAllFromVault,
  depositToVault,
  zapPickle,
  depositPickleSLPInFarm,
} from 'containers/Vaults/actions';
import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { first } from 'lodash';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { selectTokenAllowance } from 'containers/App/selectors';
import { selectMigrationData } from 'containers/Vaults/selectors';
import {
  selectZapperVaults,
  selectZapperTokens,
  selectZapperBalances,
  selectZapperError,
} from 'containers/Zapper/selectors';
import { zapIn, zapOut } from 'containers/Zapper/actions';
import { DEFAULT_SLIPPAGE } from 'containers/Zapper/constants';
import BackscratcherClaim from 'components/BackscratcherClaim';
import MigrateVault from 'components/MigrateVault';
import {
  BACKSCRATCHER_ADDRESS,
  MASTER_CHEF_ADDRESS,
  V2_WETH_VAULT_ADDRESS,
  YVBOOST_ADDRESS,
} from 'containers/Vaults/constants';
import Box from 'components/Box';
import Text from 'components/Text';
import Label from 'components/Label';

const MaxWrapper = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: initial;
  position: relative;
  top: -2px;
`;

const PickleControl = styled.div`
  margin-top: 1rem;
  margin-bottom: 1rem;
`;

const StyledRoundedInput = styled(RoundedInput)`
  width: 100%;
`;
const StyledRoundedSelect = styled(RoundedSelect)`
  width: 100%;
`;

const ActionGroup = styled(Box)`
  display: ${(props) => (props.hide ? 'none' : 'flex')};
  flex-direction: ${(props) => props.direction || 'column'};
`;

const ButtonGroup = styled(Box)`
  display: flex;
  justify-content: start;
  align-items: center;
`;

const Wrapper = styled.div`
  display: flex;
  width: 100%;
`;

const StyledErrorMessage = styled(Text)`
  color: ${(props) => props.theme.blocksRed};
`;

const getNormalizedAmount = (amount, decimals) =>
  new BigNumber(amount).dividedBy(10 ** decimals).toFixed(2);

export default function VaultControls(props) {
  const {
    vault,
    vaultBalance,
    walletBalance,
    balanceOf,
    tokenBalance,
    pickleContractsData,
    balanceDecimalPlacesCount,
  } = props;
  const {
    address: vaultAddress,
    totalAssets,
    token,
    decimals,
    pureEthereum,
    depositLimit,
    zapAddress,
    emergencyShutdown,
  } = vault;

  const v2Vault = vault.type === 'v2' || vault.apiVersion;
  const vaultIsBackscratcher = vault.address === BACKSCRATCHER_ADDRESS;
  const vaultIsPickle = vault.address === MASTER_CHEF_ADDRESS;
  const vaultIsYvBoost = vault.address === YVBOOST_ADDRESS;

  let vaultBalanceOf;
  if (v2Vault) {
    vaultBalanceOf = new BigNumber(balanceOf)
      .times(vault.pricePerShare / 10 ** decimals)
      .toFixed();
  } else {
    vaultBalanceOf = new BigNumber(balanceOf)
      .times(vault.getPricePerFullShare / 10 ** 18)
      .toFixed();
  }

  const isScreenMd = useMediaQuery('(min-width:960px)');
  const dispatch = useDispatch();
  let vaultContract = useContract(vaultAddress);
  const zapContract = useContract(zapAddress);
  if (zapContract) {
    vaultContract = { ...vaultContract, zapContract };
  }
  const migrationData = useSelector(selectMigrationData);
  const isMigratable = !!migrationData[vaultAddress];

  // ----- ZAPPER
  const web3 = useWeb3();
  const zapperVaults = useSelector(selectZapperVaults());
  const zapperTokens = useSelector(selectZapperTokens());
  const zapperBalances = useSelector(selectZapperBalances());
  const zapperError = useSelector(selectZapperError());
  const zapperVaultData = zapperVaults[vaultAddress.toLowerCase()];
  const isZappable = !!zapperVaultData;
  const isSupportedToken = ({ address, hide }) =>
    address !== token.address && !hide && !!zapperTokens[address];
  const isSameToken = ({ label, address }) =>
    (vaultAddress === V2_WETH_VAULT_ADDRESS &&
      (label === 'ETH' || label === 'WETH')) ||
    address === token.address.toLowerCase();
  const supportedTokenOptions = Object.values(zapperBalances)
    .filter(isSupportedToken)
    .filter((option) => !isSameToken(option))
    .map(({ address, label, img }) => ({
      value: address,
      label,
      icon: `https://zapper.fi/images/${img}`,
    }));
  supportedTokenOptions.unshift({
    value: token.address,
    label: pureEthereum ? 'ETH' : token.displayName,
    icon: `https://raw.githack.com/iearn-finance/yearn-assets/master/icons/tokens/${token.address}/logo-128.png`,
  });
  const [selectedSellToken, setSelectedSellToken] = useState(
    first(supportedTokenOptions),
  );
  const sellToken = zapperBalances[selectedSellToken.value];

  const willZapIn =
    selectedSellToken && selectedSellToken.value !== token.address;

  // ------

  const tokenContract = useContract(token.address);

  const tokenOptions = [
    {
      value: 'eth',
      label: 'ETH',
      icon:
        'https://raw.githack.com/iearn-finance/yearn-assets/master/icons/tokens/0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE/logo-128.png',
    },
    {
      value: 'crv',
      label: 'CRV',
      icon:
        'https://raw.githack.com/iearn-finance/yearn-assets/master/icons/tokens/0xD533a949740bb3306d119CC777fa900bA034cd52/logo-128.png',
    },
  ];
  const [selectedPickleTokenType, setSelectedPickleTokenType] = useState(
    tokenOptions[0],
  );
  const [pickleDepositGweiAmount, setPickleDepositGweiAmount] = useState(0);

  const [pickleDepositAmount, setPickleDepositAmount] = useState(0);
  const [withdrawalAmount, setWithdrawalAmount] = useState(0);
  const [depositAmount, setDepositAmount] = useState(0);
  const [withdrawalGweiAmount, setWithdrawalGweiAmount] = useState(0);
  const [depositGweiAmount, setDepositGweiAmount] = useState(0);
  const zapperImgUrl = 'https://zapper.fi/images/';

  const tmpWithdrawTokens = [];
  [
    {
      label: 'ETH',
      address: '0x0000000000000000000000000000000000000000',
      icon: `${zapperImgUrl}ETH-icon.png`,
      value: 'ETH',
    },
    {
      label: 'DAI',
      address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      icon: `${zapperImgUrl}DAI-icon.png`,
      value: 'DAI',
    },
    {
      label: 'USDC',
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      icon: `${zapperImgUrl}USDC-icon.png`,
      value: 'USDC',
    },
    {
      label: 'USDT',
      address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      icon: `${zapperImgUrl}USDT-icon.png`,
      value: 'USDT',
    },
    {
      label: 'WBTC',
      address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      icon: `${zapperImgUrl}WBTC-icon.png`,
      value: 'WBTC',
    },
  ].map((t) => {
    if (t.label !== vault.displayName) {
      tmpWithdrawTokens.push(t);
    }
    return t;
  });

  tmpWithdrawTokens.unshift({
    label: vault.displayName,
    address: vault.token.address,
    isVault: true,
    icon: vault.token.icon,
    value: vault.displayName,
  });
  const withdrawTokens = tmpWithdrawTokens;

  const [selectedWithdrawToken, setSelectedWithdrawToken] = useState(
    withdrawTokens[0],
  );

  const tokenContractAddress =
    (tokenContract && tokenContract.address) || '0x0';
  const vaultContractAddress =
    (vaultContract && vaultContract.address) || '0x0';
  const tokenAllowance = useSelector(
    selectTokenAllowance(tokenContractAddress, vaultContractAddress),
  );

  const depositLimitBN = useMemo(() => new BigNumber(depositLimit), [
    depositLimit,
  ]);

  const totalAssetsBN = useMemo(() => new BigNumber(totalAssets), [
    totalAssets,
  ]);

  const approvalExplainer =
    'Before depositing for the first time, users must submit an approval transaction to allow Yearn to accept your funds. Once this approval transaction has confirmed, you can deposit any amount, forever, from this address.';

  const depositsDisabled = useMemo(() => {
    if (vault.type === 'v2') {
      if (
        !willZapIn &&
        totalAssetsBN.plus(depositGweiAmount).gte(depositLimitBN)
      ) {
        return 'Vault deposit limit reached.';
      }
      // fix: disable deposit button if value is 0
      // note: resolves issue #252 from iearn-finance repo
      // this issue only affects v2 & is mis-ticketed as v1 (iearn-finance)
      if (depositGweiAmount <= 0) {
        return 'Value must be greater than 0.';
      }
    } else if (
      vault.type === 'v1' &&
      vault.address === '0xBA2E7Fed597fd0E3e70f5130BcDbbFE06bB94fe1'
    ) {
      return 'Inactive with YIP-56: Buyback and Build';
    }

    if (emergencyShutdown) {
      return 'Vault deposits temporarily disabled';
    }

    return undefined;
  }, [depositAmount, totalAssets, depositLimit, emergencyShutdown]);

  useEffect(() => {
    setSelectedPickleTokenType(tokenOptions[0]);
    setDepositAmount(0);
    setPickleDepositAmount(0);
    setWithdrawalAmount(0);
    setDepositGweiAmount(0);
    setWithdrawalGweiAmount(0);
  }, [walletBalance, vaultBalance]);

  const withdraw = () => {
    console.log(`Withdrawing:`, withdrawalGweiAmount);
    if (
      selectedWithdrawToken.address.toLowerCase() ===
      vault.token.address.toLowerCase()
    ) {
      dispatch(
        withdrawFromVault({
          vaultContract,
          withdrawalAmount: withdrawalGweiAmount,
          decimals,
          pureEthereum,
        }),
      );
    } else {
      dispatch(
        zapOut({
          web3,
          slippagePercentage: DEFAULT_SLIPPAGE,
          vaultContract,
          withdrawalAmount: withdrawalGweiAmount,
          decimals,
          selectedWithdrawToken,
          pureEthereum,
        }),
      );
    }
  };

  const withdrawAll = () => {
    dispatch(
      withdrawAllFromVault({
        vaultContract,
        pureEthereum,
      }),
    );
  };

  const zap = () => {
    dispatch(
      zapPickle({
        zapPickleContract: pickleContractsData.zapPickleContract,
        tokenContract: pickleContractsData.crvContract,
        depositAmount: depositGweiAmount,
        pureEthereum: selectedPickleTokenType.value === 'eth',
      }),
    );
  };

  const depositPickleFarm = () => {
    dispatch(
      depositPickleSLPInFarm({
        vaultContract: pickleContractsData.masterChefContract,
        tokenContract: pickleContractsData.pickleJarContract,
        depositAmount: pickleDepositGweiAmount,
      }),
    );
  };

  const deposit = () => {
    console.log(`Depositing:`, depositGweiAmount);
    dispatch(
      depositToVault({
        vaultContract,
        tokenContract,
        depositAmount: depositGweiAmount,
        decimals,
        pureEthereum,
      }),
    );
  };

  const zapperZap = () => {
    dispatch(
      zapIn({
        web3,
        poolAddress: zapperVaultData.address,
        sellTokenAddress: sellToken.address,
        sellAmount: depositGweiAmount,
        slippagePercentage: DEFAULT_SLIPPAGE,
      }),
    );
  };

  let vaultControlsWrapper;

  if (vaultIsPickle) {
    let maxAmount = 0;
    if (selectedPickleTokenType.value === 'eth') {
      maxAmount = pickleContractsData.ethBalanceRaw;
    } else if (selectedPickleTokenType.value === 'crv') {
      maxAmount = pickleContractsData.crvBalanceRaw;
    }
    const pickleDescriptions = [
      {
        main: '1. You have to unstake your LP Tokens',
        sub: 'Available Pickle SLP: ',
      },
      {
        main:
          '2. Then approve and migrate from yveCRV-ETH LP into yvBOOST-ETH LP to enjoy 🍣 and 🥒 rewards',
        sub: 'Available SLP: ',
      },
      {
        main:
          '3. Last step! After the previous transaction completes, approve and stake your Pickle LPs using the box below',
        sub: 'Available Pickle SLP: ',
      },
    ];
    const pickleNote =
      'Note: If you want to claim PICKLE 🥒 rewards or withdraw yout yvBOOST-ETH SLP, please, use UI at';
    const pickleNoteLink = 'https://app.pickle.finance/farms';
    vaultControlsWrapper = (
      <Wrapper>
        <Box display="flex" flexDirection="column" width={1}>
          {pickleDescriptions.map((description) => (
            <>
              <Label fontSize={16}>{description.main}</Label>
              <PickleControl>
                <Grid xs={12} md={6}>
                  <Balance amount={walletBalance} prefix={description.sub} />
                  <ActionGroup
                    direction={isScreenMd ? 'row' : 'column'}
                    alignItems="center"
                  >
                    <Box width={1}>
                      <AmountField
                        amount={pickleDepositAmount}
                        amountSetter={setPickleDepositAmount}
                        gweiAmountSetter={setPickleDepositGweiAmount}
                        maxAmount={pickleContractsData.pickleJarBalanceRaw}
                        decimals={decimals}
                        placeholder={'Amount'}
                      />
                    </Box>
                    <Box ml={isScreenMd ? 5 : 0} width={isScreenMd ? '30%' : 1}>
                      <ActionButton
                        className="action-button"
                        disabled={
                          !vaultContract || !tokenContract || !!depositsDisabled
                        }
                        handler={depositPickleFarm}
                        text={
                          pickleContractsData.pickleJarAllowance !==
                            undefined &&
                          pickleContractsData.pickleJarAllowance !== '0'
                            ? 'Deposit'
                            : 'Approve'
                        }
                        title="Deposit into vault"
                        showTooltip
                        tooltipText={
                          depositsDisabled ||
                          'Connect your wallet to deposit into vault'
                        }
                      />
                    </Box>
                  </ActionGroup>
                </Grid>
              </PickleControl>
            </>
          ))}
          <Label fontSize={16}> {pickleNote} </Label>
          <a href={pickleNoteLink}> {pickleNoteLink} </a>
        </Box>
      </Wrapper>
    );
  } else if (vaultIsBackscratcher) {
    const depositHasBeenApproved =
      (tokenAllowance !== undefined && tokenAllowance !== '0') ||
      pureEthereum > 0;
    vaultControlsWrapper = (
      <Wrapper>
        <Box display="flex" flexDirection="column" width={1}>
          <Balance amount={walletBalance} prefix="Available CRV: " />
          <ActionGroup
            direction={isScreenMd ? 'row' : 'column'}
            alignItems="center"
          >
            <Box width={1}>
              <AmountField
                amount={depositAmount}
                amountSetter={setDepositAmount}
                gweiAmountSetter={setDepositGweiAmount}
                maxAmount={tokenBalance}
                decimals={decimals}
                placeholder="Amount"
              />
            </Box>
            <Box ml={isScreenMd ? 5 : 0} width={isScreenMd ? '30%' : 1}>
              <ActionButton
                className="action-button dark"
                disabled={
                  !vaultContract || !tokenContract || !!depositsDisabled
                }
                handler={deposit}
                text={depositHasBeenApproved ? 'Deposit' : 'Approve'}
                title="Deposit into vault"
                showTooltipWhenDisabled
                disabledTooltipText={
                  depositsDisabled ||
                  'Connect your wallet to deposit into vault'
                }
                showTooltipWhenEnabled={!depositHasBeenApproved}
                enabledTooltipText={approvalExplainer}
              />
            </Box>
          </ActionGroup>
          <BackscratcherClaim
            isScreenMd={isScreenMd}
            vaultAddress={vaultAddress}
          />
        </Box>
      </Wrapper>
    );
  } else if (vaultIsYvBoost) {
    vaultControlsWrapper = (
      <Wrapper>
        <Box display="flex" flexDirection="column" width={1}>
          <ActionGroup direction={isScreenMd ? 'row' : 'column'}>
            <Box display="flex" flexDirection="column">
              <Balance
                amount={
                  isZappable && sellToken ? sellToken.balance : walletBalance
                }
                prefix={`Available ${selectedSellToken.label}: `}
              />
              <Box
                display="flex"
                flexDirection={isScreenMd ? 'row' : 'column'}
                alignItems="center"
                width={1}
              >
                <Box
                  center
                  mr={isScreenMd ? 5 : 0}
                  width={isScreenMd ? '179px' : '100%'}
                  minWidth={179}
                >
                  <SelectField
                    defaultValue={selectedSellToken}
                    onChange={(value) => {
                      setDepositAmount(0);
                      setSelectedSellToken(value);
                    }}
                    flexGrow={1}
                    options={
                      isZappable ? supportedTokenOptions : [selectedSellToken]
                    }
                  />
                </Box>
                <ButtonGroup width={1}>
                  <Box width={isScreenMd ? '185px' : '100%'}>
                    <AmountField
                      amount={depositAmount}
                      amountSetter={setDepositAmount}
                      gweiAmountSetter={setDepositGweiAmount}
                      maxAmount={
                        isZappable && sellToken
                          ? sellToken.balanceRaw
                          : tokenBalance
                      }
                      decimals={
                        isZappable && sellToken ? sellToken.decimals : decimals
                      }
                    />
                  </Box>
                  <Box width={isScreenMd ? '130px' : '100%'} ml={5}>
                    <ActionButton
                      disabled={
                        !vaultContract || !tokenContract || !!depositsDisabled
                      }
                      handler={() => (willZapIn ? zapperZap() : deposit())}
                      text={
                        (tokenAllowance !== undefined &&
                          tokenAllowance !== '0') ||
                        pureEthereum > 0 ||
                        willZapIn
                          ? 'Deposit'
                          : 'Approve'
                      }
                      title="Deposit into vault"
                      showTooltip
                      tooltipText={
                        depositsDisabled ||
                        'Connect your wallet to deposit into vault'
                      }
                    />
                  </Box>
                </ButtonGroup>
              </Box>
              {zapperError &&
                zapperError.poolAddress === vaultAddress.toLowerCase() && (
                  <StyledErrorMessage>{zapperError.message}</StyledErrorMessage>
                )}
            </Box>
          </ActionGroup>
        </Box>
      </Wrapper>
    );
  } else {
    const depositHasBeenApproved =
      (tokenAllowance !== undefined && tokenAllowance !== '0') ||
      pureEthereum > 0 ||
      willZapIn;
    vaultControlsWrapper = (
      <Wrapper>
        <Box
          display="flex"
          flexDirection={isScreenMd ? 'row' : 'column'}
          width={1}
        >
          <ActionGroup
            direction={isScreenMd ? 'row' : 'column'}
            ml={isScreenMd ? '60px' : '0px'}
          >
            <Box display="flex" flexDirection="column">
              <Balance
                amount={
                  isZappable && sellToken ? sellToken.balance : walletBalance
                }
                prefix="Available: "
                decimalPlaces={balanceDecimalPlacesCount}
              />
              <Box
                display="flex"
                flexDirection={isScreenMd ? 'row' : 'column'}
                alignItems="center"
                width={1}
              >
                <Box
                  center
                  mr={isScreenMd ? 5 : 0}
                  width={isScreenMd ? '185px' : '100%'}
                  minWidth={185}
                >
                  <SelectField
                    defaultValue={selectedSellToken}
                    onChange={(value) => {
                      setDepositAmount(0);
                      setSelectedSellToken(value);
                    }}
                    options={
                      isZappable ? supportedTokenOptions : [selectedSellToken]
                    }
                  />
                </Box>
                <ButtonGroup width={1}>
                  <Box width={isScreenMd ? '185px' : '100%'}>
                    <AmountField
                      amount={depositAmount}
                      amountSetter={setDepositAmount}
                      gweiAmountSetter={setDepositGweiAmount}
                      maxAmount={
                        isZappable && sellToken
                          ? sellToken.balanceRaw
                          : tokenBalance
                      }
                      decimals={
                        isZappable && sellToken ? sellToken.decimals : decimals
                      }
                    />
                  </Box>
                  <Box width={isScreenMd ? '130px' : '100%'} ml={5}>
                    <ActionButton
                      disabled={
                        !vaultContract || !tokenContract || !!depositsDisabled
                      }
                      handler={() => (willZapIn ? zapperZap() : deposit())}
                      text={depositHasBeenApproved ? 'Deposit' : 'Approve'}
                      title="Deposit into vault"
                      showTooltipWhenDisabled
                      disabledTooltipText={
                        depositsDisabled ||
                        'Connect your wallet to deposit into vault'
                      }
                      showTooltipWhenEnabled={!depositHasBeenApproved}
                      enabledTooltipText={approvalExplainer}
                    />
                  </Box>
                </ButtonGroup>
              </Box>
              {zapperError &&
                zapperError.poolAddress === vaultAddress.toLowerCase() && (
                  <StyledErrorMessage>{zapperError.message}</StyledErrorMessage>
                )}
            </Box>
          </ActionGroup>

          <ActionGroup
            ml={isScreenMd ? '60px' : '0px'}
            direction={isScreenMd ? 'row' : 'column'}
          >
            <Box display="flex" flexDirection="column">
              <Box>
                <Balance
                  amount={vaultBalance}
                  prefix="Vault balance: "
                  decimalPlaces={balanceDecimalPlacesCount}
                />
              </Box>
              <Box
                display="flex"
                flexDirection={isScreenMd ? 'row' : 'column'}
                alignItems="center"
                width={1}
              >
                <Box
                  center
                  mr={isScreenMd ? 5 : 0}
                  width={isScreenMd ? '185px' : '100%'}
                  minWidth={185}
                >
                  <AmountField
                    amount={withdrawalAmount}
                    amountSetter={setWithdrawalAmount}
                    gweiAmountSetter={setWithdrawalGweiAmount}
                    maxAmount={vaultBalanceOf}
                    decimals={decimals}
                  />
                </Box>
                <ButtonGroup width={1}>
                  <Box
                    center
                    mr={5}
                    width={isScreenMd ? '185px' : '100%'}
                    minWidth={150}
                  >
                    <SelectField
                      defaultValue={withdrawTokens[0]}
                      value={selectedWithdrawToken}
                      options={withdrawTokens}
                      onChange={(newValue) => {
                        setSelectedWithdrawToken(newValue);
                        console.log(
                          'selectedWithdrawToken',
                          selectedWithdrawToken,
                          newValue,
                        );
                      }}
                    />
                  </Box>
                  <Box width={isScreenMd ? '130px' : '100%'}>
                    <ActionButton
                      className="action-button bold outline"
                      disabled={!vaultContract || !tokenContract}
                      handler={withdraw}
                      text="Withdraw"
                      title="Withdraw from vault"
                      showTooltipWhenDisabled
                      disabledTooltipText="Connect your wallet to withdraw from vault"
                    />
                  </Box>
                </ButtonGroup>
              </Box>
            </Box>
          </ActionGroup>
        </Box>
      </Wrapper>
    );
  }

  if (isMigratable) {
    vaultControlsWrapper = (
      <Wrapper>
        <Box
          width={isScreenMd ? '160px' : '100%'}
          ml={isScreenMd ? '60px' : '0px'}
        >
          <MigrateVault vaultAddress={vaultAddress} />
        </Box>
        <Box width={isScreenMd ? '160px' : '100%'} ml={5}>
          <ActionButton
            className="action-button dark"
            disabled={!vaultContract || !tokenContract}
            handler={withdrawAll}
            text="Withdraw All"
            title="Withdraw balance from vault"
            showTooltipWhenDisabled
            disabledTooltipText="Connect your wallet to withdraw from vault"
            outlined={1}
          />
        </Box>
      </Wrapper>
    );
  }

  return vaultControlsWrapper;
}

function SelectField({ defaultValue, options, onChange }) {
  return (
    <StyledRoundedSelect
      defaultValue={defaultValue}
      options={options}
      onChange={onChange}
    />
  );
}

function AmountField({
  amount,
  amountSetter,
  gweiAmountSetter,
  maxAmount,
  decimals,
  placeholder,
}) {
  return (
    <StyledRoundedInput
      value={amount}
      right={
        <MaxButton
          maxAmount={maxAmount}
          amountSetter={amountSetter}
          gweiAmountSetter={gweiAmountSetter}
          decimals={decimals}
        />
      }
      placeholder={placeholder}
      onChange={(evt) => {
        amountSetter(evt.target.value);

        if (evt.target.value) {
          const gweiAmount = new BigNumber(evt.target.value)
            .multipliedBy(10 ** decimals)
            .toFixed(0);

          gweiAmountSetter(gweiAmount);
        } else {
          gweiAmountSetter(0);
        }
      }}
      maxValue={getNormalizedAmount(maxAmount, decimals)}
    />
  );
}

function MaxButton({ maxAmount, amountSetter, gweiAmountSetter, decimals }) {
  return (
    <MaxWrapper
      onClick={() => {
        const normalizedAmount = new BigNumber(maxAmount)
          .dividedBy(10 ** decimals)
          .toFixed(2);

        amountSetter(normalizedAmount);
        gweiAmountSetter(maxAmount);
      }}
    >
      Max
    </MaxWrapper>
  );
}

function Balance({ amount, prefix, decimalPlaces = 2 }) {
  return (
    <div>
      {prefix}
      {new BigNumber(amount).toFixed(decimalPlaces)}
    </div>
  );
}

function ActionButton({
  disabled,
  className,
  handler,
  title,
  text,
  disabledTooltipText,
  enabledTooltipText,
  showTooltipWhenDisabled,
  showTooltipWhenEnabled,
  outlined,
}) {
  return (
    <ButtonFilled
      disabled={disabled}
      className={className}
      onClick={() => handler()}
      color="primary"
      title={title}
      disabledTooltipText={disabledTooltipText}
      showTooltipWhenDisabled={showTooltipWhenDisabled}
      outlined={outlined}
      showTooltipWhenEnabled={showTooltipWhenEnabled}
      enabledTooltipText={enabledTooltipText}
    >
      {text}
    </ButtonFilled>
  );
}
