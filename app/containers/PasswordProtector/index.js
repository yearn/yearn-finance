import React from 'react';
import styled from 'styled-components';
import md5 from 'md5';

const PasswordWall = styled.div`
  background-image: url(https://media3.giphy.com/media/Q9aBxHn9fTqKs/giphy.gif?cid=ecf05e475fd60729d93b6de394665338aaa2cc698f9253b0&rid=giphy.gif);
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.8;
`;

const BlackBackground = styled.div`
  background-color: #000;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;

const EnterPasswordText = styled.div`
  font-size: 60px;
  position: absolute;
  color: #fff;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(0px 0px 14px #ccc);
  font-family: monospace;
`;

const passwordValid = password => {
  const requiredHash = 'dbba1bfe930d953cabcc03d7b6ab05e6';
  const passwordHash = md5(md5(md5(md5(password))));

  const valid = passwordHash === requiredHash;
  return valid;
};

const PasswordProtector = props => {
  const { children } = props;
  const password = localStorage.getItem('password') || '';
  const authenticated = passwordValid(password);
  let content;
  if (authenticated) {
    content = children;
  } else {
    console.log('round 2');
    content = (
      <BlackBackground>
        <PasswordWall />
        <EnterPasswordText>enter password</EnterPasswordText>
      </BlackBackground>
    );
  }

  return <div>{content}</div>;
};

export default PasswordProtector;
