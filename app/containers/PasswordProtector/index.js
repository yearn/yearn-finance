import React from 'react';
import styled from 'styled-components';
import md5 from 'md5';

const PasswordWall = styled.div`
  background-image: url(https://pbs.twimg.com/media/Emh_6n2U4AAbJ1m?format=jpg&name=4096x4096);
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
  filter: drop-shadow(6px 5px 4px #44d);
`;

const passwordValid = password => {
  const requiredHash = '8a90332211210778609ca383980c8ac3';
  const passwordHash = md5(md5(password));
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
    console.log('wrong password ser');
    content = (
      <BlackBackground>
        <PasswordWall />
        <EnterPasswordText>Enter password</EnterPasswordText>
      </BlackBackground>
    );
  }

  return <div>{content}</div>;
};

export default PasswordProtector;
