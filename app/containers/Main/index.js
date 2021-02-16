import React, { memo } from 'react';
import { Switch, Route, Redirect } from 'react-router-dom';
import { compose } from 'redux';
import Vaults from 'containers/Vaults/Loadable';
import Header from 'components/Header';
import LiteHeader from 'components/LiteHeader';
import { Splash } from 'containers/Splash';
import Cover from 'containers/Cover/Loadable';
import Cream from 'containers/Cream/Loadable';
import LiteVaults from 'containers/LiteVaults/Loadable';
import LiteCover from 'containers/LiteCover/Loadable';
import Box from 'components/Box';

let header;

const liteMode = JSON.parse(localStorage.getItem('liteMode'));
let content;
if (!liteMode) {
  header = <Header />;
  content = (
    <Switch>
      <Route exact path="/" component={Splash} />
      <Route path="/vaults" component={Vaults} />
      <Route path="/cover" component={Cover} />
      <Route path="/cream" component={Cream} />
    </Switch>
  );
} else {
  header = <LiteHeader />;
  content = (
    <Switch>
      <Route exact path="/" render={() => <Redirect to="/earn" />} />
      <Route path="/earn" component={LiteVaults} />
      <Route path="/insure" component={LiteCover} />
      <Route path="/borrow" component={Cream} />
    </Switch>
  );
}

function Main() {
  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      {header}
      {content}
    </Box>
  );
}

export default compose(memo)(Main);
