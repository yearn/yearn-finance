import React, { memo } from 'react';
import styled from 'styled-components';
import { Switch, Route, Redirect } from 'react-router-dom';
import { compose } from 'redux';
import Vaults from 'containers/Vaults/Loadable';
import Header from 'components/Header';
import Cover from 'containers/Cover/Loadable';
import Cream from 'containers/Cream/Loadable';

const Wrapper = styled.div``;

function Main() {
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

export default compose(memo)(Main);
