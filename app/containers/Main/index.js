import React from 'react';
import styled from 'styled-components';
import { Switch, Route, Redirect } from 'react-router-dom';

import Vaults from 'containers/Vaults/Loadable';
import Header from 'components/Header';
import Cover from 'containers/Cover/Loadable';
import Cream from 'containers/Cream/Loadable';

const Wrapper = styled.div``;

export default function Main() {
  return (
    <Wrapper>
      <Header />
      <Switch>
        <Route exact path="/" render={() => <Redirect to="/vaults" />} />
        <Route path="/vaults" component={Vaults} />
        <Route path="/cover" component={Cover} />
        <Route path="/cream" component={Cream} />
      </Switch>
    </Wrapper>
  );
}
