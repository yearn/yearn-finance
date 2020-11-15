import React, { useRef, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import request from 'utils/request';
import styled from 'styled-components';
import { selectDevMode } from 'containers/DevMode/selectors';
import { useSelector } from 'react-redux';
import ButtonFilled from 'components/ButtonFilled';
// import { useContract } from 'containers/DrizzleProvider/hooks';

const Input = styled.input`
  display: block;
  box-sizing: border-box;
  font-size: 13px;
  padding: 4px 6px;
  height: 40px;
  width: 100%;
`;

const Label = styled.label`
  font-size: 14px;
  top: 5px;
  position: relative;
`;

const InputsHeader = styled.div`
  margin-top: 30px;
  font-size: 31px;
  align-self: flex-start;
`;

const MethodName = styled.div`
  font-size: 48px;
  text-decoration: underline;
`;

const lineHeight = 16;

const Editor = styled.div`
  font-size: 16px;
  display: ${props => (props.show ? 'inherit' : 'none')};
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
  grid-template-columns: 50% 50%;
`;

export default function TransactionModal(props) {
  const { show, onHide, metadata, className } = props;
  const [contractSource, setContractSource] = useState('');
  const [inputFields, setInputFields] = useState({});
  const devMode = useSelector(selectDevMode());
  const methodName = _.get(metadata, 'methodName');
  const inputs = _.get(metadata, 'inputs');
  const args = _.get(metadata, 'args');
  const address = _.get(metadata, 'address');

  // const contract = useContract(address);

  const textAreaRef = useRef(null);
  const modalOpened = () => {
    if (show) {
      const apiKey = 'GEQXZDY67RZ4QHNU1A57QVPNDV3RP1RYH4'; // TODO: move to config constants files
      const url = `https://api.etherscan.io/api?module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`;
      request(url).then(response => {
        const contractMetadata = _.first(response.result);
        const sourceCode = _.get(contractMetadata, 'SourceCode', '');
        setContractSource(sourceCode);
      });
    }
  };

  useEffect(modalOpened, [show]);

  const updateField = (field, value) => {
    const newInputFields = inputFields;
    newInputFields[field] = value;
    setInputFields(newInputFields);
  };

  const handleInputChange = evt => {
    const { name, value } = evt.target;
    updateField(name, value);
  };

  const renderInput = input => {
    const { type, name: inputName } = input;
    const inputArgs = _.get(args, inputName);
    const defaultValue = _.get(inputArgs, 'defaultValue');
    // const maxValue = _.get(inputArgs, 'maxValue');
    // const configurable = _.get(inputArgs, 'configurable');
    let pattern = null;
    if (type === 'address') {
      pattern = '(0[xX][0-9a-fA-F]{40}?)+';
    }
    const inputDescription = `${inputName} (${type})`;
    const value = inputFields[inputName];
    const fieldInitialized = _.has(inputFields, inputName);
    if (!fieldInitialized) {
      updateField(inputName, defaultValue);
    }
    return (
      <div key={inputName}>
        <Label htmlFor={inputName}>{inputDescription}</Label>
        <Input
          value={value}
          type="text"
          required
          onChange={handleInputChange}
          name={inputName}
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
    _.findIndex(sourceLines, line => {
      const solidityMatch =
        _.includes(line, searchTextSolidity) && _.endsWith(line, '{');
      const vyperMatch = _.startsWith(line, searchTextVyper);
      return solidityMatch || vyperMatch;
    }) + 1;

  const nextLines = _.drop(sourceLines, startIdx);

  const endIdx = (() => {
    let solidityMatch;
    let vyperMatch;
    const foundIdx = _.findIndex(nextLines, line => {
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

  const onSubmit = evt => {
    evt.preventDefault();
    const contractArgs = _.values(inputFields);
    console.log(contractArgs);
    // contract.methods[methodName].cacheSend(0, { from: account });
  };

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
        <BodyWrapper>
          <Editor show={devMode}>
            <div id="editor" ref={textAreaRef} />
          </Editor>
          <InputWrapper>
            <MethodName>{methodName}</MethodName>
            <InputsHeader>Input Arguments</InputsHeader>
            <form onSubmit={onSubmit}>
              <Inputs>{inputEls}</Inputs>
              <ButtonWrapper>
                <ButtonFilled type="submit">Send Transaction</ButtonFilled>
                <ButtonFilled onClick={onHide} color="secondary">
                  Cancel Transaction
                </ButtonFilled>
              </ButtonWrapper>
            </form>
          </InputWrapper>
        </BodyWrapper>
      </Modal.Body>
    </Modal>
  );
}
