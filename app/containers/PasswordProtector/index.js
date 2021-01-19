import React from 'react';
import styled from 'styled-components';
import md5 from 'md5';

const PasswordWall = styled.div`
  background-image: url(https://i.giphy.com/media/1APhDggUPlkRdK5w1n/giphy.webp);
  background-size: cover;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  opacity: 0.8;
  background-position-x: center;
  background-position-y: center;
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
  display: none;
  justify-content: center;
  align-items: center;
  filter: drop-shadow(6px 5px 4px #44d);
`;

const passwordValid = (password) => {
  const requiredHash = '4490cbe5c8c0e9cbba2f6dcd0e557560';
  const passwordHash = md5(md5(md5(md5(password))));

  const valid = passwordHash === requiredHash;
  return valid;
};

const PasswordProtector = (props) => {
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
