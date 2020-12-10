import React from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';

import Vaults from 'containers/Vaults/Loadable';
import Header from 'components/Header';
import Cover from 'containers/Cover/Loadable';

const Wrapper = styled.div``;

export default function Main() {
  return (
    <Wrapper>
      <Header />
      <Switch>
        <Route path="/vaults" component={Vaults} />
        <Route path="/cover" component={Cover} />
      </Switch>
    </Wrapper>
  );
}
