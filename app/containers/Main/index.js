import React, { memo } from 'react';
import styled from 'styled-components';
import { Switch, Route } from 'react-router-dom';
import { compose } from 'redux';
import Vaults from 'containers/Vaults/Loadable';
import Header from 'components/Header';
import { Splash } from 'containers/Splash';
import Cover from 'containers/Cover/Loadable';
import Cream from 'containers/Cream/Loadable';

const Wrapper = styled.div``;

function Main() {
  return (
    <Wrapper>
      <Header />
      <Switch>
        <Route exact path="/" component={Splash} />
        <Route path="/vaults" component={Vaults} />
        <Route path="/cover" component={Cover} />
        <Route path="/cream" component={Cream} />
      </Switch>
    </Wrapper>
  );
}

export default compose(memo)(Main);
