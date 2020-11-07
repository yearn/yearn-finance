import React from 'react';
import styled from 'styled-components';
import AnimatedNumber from 'components/AnimatedNumber';
import { Accordion } from 'react-bootstrap';
import Card from 'react-bootstrap/Card';

const Wrapper = styled.div`
  min-height: 70px;
  display: flex;
  align-items: center;
  max-width: 97%;
  margin: 0 auto;
  div {
    overflow: hidden;
    margin-right: 50px;
    text-overflow: ellipsis;
  }
`;

const IconAndName = styled.div`
  display: flex;
  align-items: center;
  width: 150px;
`;

const UserBalance = styled.div`
  width: 100px;
`;

const Address = styled.div`
  width: 400px;
`;

const A = styled.a`
  color: ${props => props.theme.link};
`;

export default function Vault(props) {
  const { vault } = props;
  if (!vault) {
    return null;
  }
  const { balanceOf, name, address } = vault;
  const vaultBalanceOf = (balanceOf / 10 ** 18).toFixed(0);
  return (
    <React.Fragment>
      <Card>
        <Accordion.Toggle
          as={Card.Header}
          variant="link"
          eventKey={vault.address}
        >
          <Wrapper>
            <IconAndName>{name}</IconAndName>
            <Address>
              <A
                href={`https://etherscan.io/address/${address}`}
                target="_blank"
                onClick={evt => evt.stopPropagation()}
              >
                {address}
              </A>
            </Address>
            <UserBalance>
              <AnimatedNumber value={vaultBalanceOf} />
            </UserBalance>
          </Wrapper>
        </Accordion.Toggle>
        <Accordion.Collapse eventKey={vault.address}>
          <Card.Body>Hello! Test2</Card.Body>
        </Accordion.Collapse>
      </Card>
    </React.Fragment>
  );
}
