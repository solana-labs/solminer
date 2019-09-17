import React from 'react';
import { observer } from 'mobx-react-lite';
import { hot } from 'react-hot-loader/root';
import { AppStore } from 'store';
import Header from 'components/Header';
import Alerts from './Alerts';
import ChangeWallet from './ChangeWallet';
import HowItWorks from './HowItWorks';
import StoredLedger from './StoredLedger';
import SetupOne from './SetupStepOne';
import SetupTwo from './SetupStepTwo';
import Mining from './Mining';

const screens = {
  howItWorks: <HowItWorks />,
  setupOne: <SetupOne />,
  setupTwo: <SetupTwo />,
  mining: <Mining />,
  change: <ChangeWallet />,
  stored: <StoredLedger />,
};

const App = () => {
  const { screen } = AppStore;

  return (
    <div>
      <Header />
      <div className="container">
        <Alerts />
        {screens[screen]}
      </div>
    </div>
  );
};

export default hot(observer(App));
