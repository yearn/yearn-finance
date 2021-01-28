import React, { useRef, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import request from 'utils/request';
import styled from 'styled-components';
import { useSelector } from 'react-redux';
import ButtonFilled from 'components/ButtonFilled';
import { selectAccount } from 'containers/ConnectionProvider/selectors';
import BigNumber from 'bignumber.js';

const Input = styled.input`
  display: block;
  box-sizing: border-box;
  font-size: 13px;
  padding: 4px 6px;
  height: 40px;
  width: 100%;
  box-shadow: none;
  border: ${(props) => (props.invalid ? '4px solid red' : '1px solid black')};
  outline: none;
`;

const Form = styled.form`
  width: 100%;
`;

const Label = styled.label`
  font-size: 14px;
  top: 5px;
  position: relative;
`;

const Checkbox = styled.input`
  height: 25px;
  width: 25px;
`;

const InputsHeader = styled.div`
  margin-top: 70px;
  font-size: 31px;
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-self: flex-start;
`;

const MethodName = styled.div`
  font-size: 51px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ContractName = styled.div`
  font-size: 28px;
  margin-top: 10px;
  text-decoration: underline;
`;

const lineHeight = 16;

const Editor = styled.div`
  font-size: 16px;
  display: ${(props) => (props.devMode ? 'inherit' : 'none')};
  line-height: ${lineHeight}px;
  width: 100%;
  height: 100%;
  position: relative;
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
`;

const Inputs = styled.div`
  width: 100%;
`;

const ButtonWrapper = styled.div`
  margin-top: 20px;
  width: 100%;
`;

const BodyWrapper = styled.div`
  display: grid;
  height: 100%;
  grid-template-columns: ${(props) => (props.devMode ? '50% 50%' : '1fr')};
`;

const NormalizeInput = styled.div`
  user-select: none;
      font-size: 23px;
      display: flex;
      align-items: center;
  }
`;

const Td = styled.td`
  font-size: 20px;
  padding-right: 25px;
  font-family: monospace;
  white-space: nowrap;
  overflow: hidden;
  max-width: 330px;
  text-overflow: ellipsis;
  &:first-of-type {
    padding-right: 10px;
  }
`;

const Max = styled.div`
  text-decoration: underline;
  display: inline;
  cursor: pointer;
`;

const DisplayFields = styled.table`
  margin-top: 45px;
`;

const InputArgsWrapper = styled.div`
  display: ${(props) => (props.show ? 'inherit' : 'none')};
`;

export default function TransactionModal(props) {
  const { show, onHide, modalMetadata, className } = props;
  const [contractSource, setContractSource] = useState('');
  const [inputFields, setInputFields] = useState({});
  const [normalizeAmounts, setNormalizeAmounts] = useState(true);
  const account = useSelector(selectAccount());
  const devMode = true;
  const methodName = _.get(modalMetadata, 'methodName');
  const inputs = _.get(modalMetadata, 'inputs');
  const inputArgs = _.get(modalMetadata, 'inputArgs');
  const metadata = _.get(inputArgs, 'metadata');
  const contractData = _.get(modalMetadata, 'contractData');
  const contract = _.get(modalMetadata, 'contract');
  const address = _.get(modalMetadata, 'address');
  const contractName = _.get(contractData, 'name');
  const contractAlias = _.get(contractData, 'symbolAlias');
  const displayFields = _.get(metadata, 'displayFields');
  const contractDisplayName = contractAlias || contractName;

  const textAreaRef = useRef(null);
  const modalOpened = () => {
    if (show) {
      const apiKey = process.env.ETHERSCAN_APIKEY;
      const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
      request(url).then((response) => {
        const contractMetadata = _.first(response.result);
        const sourceCode = _.get(contractMetadata, 'SourceCode', '');
        setContractSource(sourceCode);
      });
      setInputFields({});
    }
  };

  const renderDisplayField = (field, idx) => {
    const { value, decimals, name } = field;
    const valueNormalized = new BigNumber(value)
      .dividedBy(10 ** decimals)
      .toFixed(8);
    const valueStr = normalizeAmounts ? valueNormalized : value;
    return (
      <tr key={idx}>
        <Td>{name}:</Td>
        <Td>{valueStr}</Td>
      </tr>
    );
  };
  const displayFieldEls = _.map(displayFields, renderDisplayField);

  const scaleAmountUp = (acc, field, key) => {
    const { value, inputValue, decimals } = field;
    if (!decimals) {
      return acc;
    }
    const newInputValue = new BigNumber(inputValue)
      .times(10 ** decimals)
      .toFixed();
    acc[key] = {
      value,
      inputValue: newInputValue,
      decimals,
    };
    return acc;
  };

  const scaleAmountDown = (acc, field, key) => {
    const { value, inputValue, decimals } = field;
    if (!decimals) {
      return acc;
    }
    const newInputValue = new BigNumber(inputValue)
      .dividedBy(10 ** decimals)
      .toFixed();
    acc[key] = {
      value,
      inputValue: newInputValue,
      decimals,
    };
    return acc;
  };

  const normalizeAmountsCheckboxChanged = () => {
    let newInputFields;
    if (normalizeAmounts) {
      newInputFields = _.reduce(inputFields, scaleAmountDown, {});
    } else {
      newInputFields = _.reduce(inputFields, scaleAmountUp, {});
    }
    setInputFields(newInputFields);
  };

  useEffect(normalizeAmountsCheckboxChanged, [normalizeAmounts]);
  useEffect(modalOpened, [show]);

  const updateField = (field, inputValue, decimals, skipNormalization) => {
    const newInputFields = _.clone(inputFields);
    let value = inputValue;
    if ((normalizeAmounts || skipNormalization) && decimals) {
      value = new BigNumber(value).times(10 ** decimals).toFixed(0);
    } else if ((normalizeAmounts || skipNormalization) && decimals) {
      value = new BigNumber(value).dividedBy(10 ** decimals).toFixed(0);
    }
    newInputFields[field] = {
      inputValue,
      value,
      decimals,
    };
    setInputFields(newInputFields);
  };

  const handleInputChange = (evt, decimals) => {
    const { name, value } = evt.target;
    updateField(name, value, decimals, false);
  };

  const renderInput = (input) => {
    const { type, name: inputName } = input;
    const inputArg = _.get(inputArgs, inputName);
    const max = _.get(inputArg, 'max');
    const decimals = _.get(inputArg, 'decimals');
    const defaultValueOriginal = _.get(inputArg, 'defaultValue', '');
    let defaultValue = defaultValueOriginal;
    if (decimals) {
      const defaultValueNormalized = new BigNumber(defaultValueOriginal)
        .dividedBy(10 ** decimals)
        .toFixed();
      defaultValue = normalizeAmounts
        ? defaultValueNormalized
        : defaultValueOriginal;
    }

    // const configurable = _.get(inputArg, 'configurable');
    let pattern = null;
    if (type === 'address') {
      pattern = '(0[xX][0-9a-fA-F]{40}?)+';
    }
    const inputDescription = `${inputName} (${type})`;
    const inputValue = _.get(inputFields[inputName], 'inputValue');
    const value = _.get(inputFields[inputName], 'value');

    const percentage = parseFloat(((value / max) * 100).toFixed(2));
    const percentageStr = percentage ? `${percentage}%` : '0%';
    const fieldInitialized = _.has(inputFields, inputName);
    if (!fieldInitialized) {
      updateField(inputName, defaultValue, decimals, true);
    }
    let inputType = 'text';
    if (type === 'uint256') {
      inputType = 'number';
    }

    // const setMax = () => {
    //   updateField(inputName, max, decimals, true);
    // };
    const maxNormalized = new BigNumber(max)
      .dividedBy(10 ** decimals)
      .toFixed(5);
    const maxNormalizedComplete = new BigNumber(max)
      .dividedBy(10 ** decimals)
      .toFixed();

    const maxStr = normalizeAmounts ? maxNormalized : max;
    const maxInputStr = normalizeAmounts ? maxNormalizedComplete : max;

    const setMax = () => {
      updateField(inputName, maxInputStr, decimals, false);
    };

    const handleInputChangeWithDecimals = (evt) => {
      handleInputChange(evt, decimals);
    };

    const percentageText = max ? ` | percentage: ${percentageStr}` : null;
    const decimalsText = decimals ? ` | decimals: ${decimals}` : null;
    const maxDivider = max ? ` | ` : null;
    const maxText = max ? `max: ${maxStr}` : null;
    const invalid = percentage > 100;
    return (
      <div key={inputName}>
        <Label htmlFor={inputName}>
          {inputDescription}
          {decimalsText}
          {maxDivider}
          <Max onClick={setMax}>{maxText}</Max>
          {percentageText}
        </Label>
        <Input
          value={inputValue}
          type={inputType}
          id={inputName}
          invalid={invalid}
          required
          onChange={handleInputChangeWithDecimals}
          name={inputName}
          max={max}
          pattern={pattern}
          placeholder={inputDescription}
        />
      </div>
    );
  };
  const sourceLines = _.split(contractSource, '\r\n');
  const searchTextSolidity = `function ${methodName}(`;
  const searchTextVyper = `def ${methodName}(`;
  const startIdx =
    _.findIndex(sourceLines, (line) => {
      const solidityMatch =
        _.includes(line, searchTextSolidity) && _.endsWith(line, '{');
      const vyperMatch = _.startsWith(line, searchTextVyper);
      return solidityMatch || vyperMatch;
    }) + 1;

  const nextLines = _.drop(sourceLines, startIdx);

  const endIdx = (() => {
    let solidityMatch;
    let vyperMatch;
    const foundIdx = _.findIndex(nextLines, (line) => {
      solidityMatch = _.startsWith(line, '  }') || _.startsWith(line, '    }');
      vyperMatch = _.startsWith(line, '@');
      return solidityMatch || vyperMatch;
    });
    if (solidityMatch && foundIdx > 0) {
      return foundIdx + 1;
    }
    if (vyperMatch && foundIdx > 0) {
      return foundIdx - 2;
    }
    return 0;
  })();

  let editor;
  const loadEditor = () => {
    if (textAreaRef.current && contractSource) {
      if (!editor) {
        editor = ace.edit('editor');
      }
      ace.config.set(
        'basePath',
        'https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/',
      );
      editor.setTheme('ace/theme/monokai');
      editor.session.setMode('ace/mode/python');
      editor.setValue(contractSource);
      setTimeout(() => {
        editor.gotoLine(startIdx);
        editor.selection.selectTo(startIdx + endIdx, 0);
        editor.selection.selectTo(startIdx + endIdx, 0);
        const { session } = editor;
        const scrollTop = session.getScrollTop();
        session.setScrollTop(scrollTop + 285);
      }, 0);
    }
  };
  useEffect(loadEditor, [textAreaRef, show, contractSource]);

  const sendTransaction = (evt) => {
    evt.preventDefault();
    const contractArgs = _.map(
      inputs,
      (input) => inputFields[input.name].value,
    );
    contract.methods[methodName].cacheSend(...contractArgs, { from: account });
    onHide();
  };

  let normalizeInput;
  const argDecimalsArr = _.filter(inputArgs, (arg) => arg.decimals) || [];
  const canNormalizeAmounts = argDecimalsArr.length;
  const showInputArgText = inputs && inputs.length;

  if (canNormalizeAmounts) {
    normalizeInput = (
      <NormalizeInput>
        <label htmlFor="normalizeAmounts">Normalize</label>
        <Checkbox
          type="checkbox"
          id="normalizeAmounts"
          checked={normalizeAmounts}
          onChange={(evt) => setNormalizeAmounts(evt.target.checked)}
        />
      </NormalizeInput>
    );
  }

  const inputEls = _.map(inputs, renderInput);
  return (
    <Modal
      dialogClassName={className}
      show={show}
      onHide={onHide}
      centered
      animation={false}
    >
      <Modal.Body>
        <BodyWrapper devMode={devMode}>
          <Editor devMode={devMode}>
            <div id="editor" ref={textAreaRef} />
          </Editor>
          <InputWrapper>
            <ContractName>{contractDisplayName}</ContractName>
            <MethodName>{methodName}</MethodName>
            <DisplayFields>
              <tbody>{displayFieldEls}</tbody>
            </DisplayFields>
            <InputsHeader>
              <InputArgsWrapper show={showInputArgText}>
                Input Arguments
              </InputArgsWrapper>
              {normalizeInput}
            </InputsHeader>
            <Form autoComplete="off" onSubmit={sendTransaction}>
              <Inputs>{inputEls}</Inputs>
              <ButtonWrapper>
                <ButtonFilled type="submit">Send Transaction</ButtonFilled>
                <ButtonFilled onClick={onHide} color="secondary">
                  Cancel Transaction
                </ButtonFilled>
              </ButtonWrapper>
            </Form>
          </InputWrapper>
        </BodyWrapper>
      </Modal.Body>
    </Modal>
  );
}
