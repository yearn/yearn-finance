import styled from 'styled-components';

const Label = styled.label`
  color: white;
  font-size: ${(props) => (props.fontSize ? `${props.fontSize}px` : 16)};
  margin-bottom: ${(props) => (props.marginBottom ? props.marginBottom : 0)};
  margin-top: ${(props) => (props.marginTop ? props.marginTop : 0)};
`;

export default Label;
