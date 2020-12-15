import React from 'react';
import { Switch } from 'react-router-dom';

import Route from './Route';

import Loading from '../pages/Loading';
import SignInMail from '../pages/SignInMail';
import SignInPassword from '../pages/SignInPassword';
import SignUp from '../pages/SignUp';
import Comercial from '../pages/Comercial';
import TechnicalArea from '../pages/TechnicalArea';
import Billing from '../pages/Billing';

const Routes: React.FC = () => (
  <Switch>
    <Route path="/" exact component={SignInMail} />
    <Route path="/Loading" component={Loading} isPrivate />
    <Route path="/SignInPassword" component={SignInPassword} isMailFilled />
    <Route path="/SignUp" component={SignUp} isPrivate />

    <Route path="/Comercial" component={Comercial} isPrivate />
    <Route path="/TechnicalArea" component={TechnicalArea} isPrivate />
    <Route path="/Billing" component={Billing} isPrivate />
  </Switch>
);

export default Routes;
