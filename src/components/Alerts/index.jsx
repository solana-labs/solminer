import React from 'react';
import { observer } from 'mobx-react-lite';
import { AppStore } from 'store';
import Alert from 'components/UI/Alert';
import RefreshIcon from '../../images/icon/refresh.svg';

const alertTypes = {
  noInternet: (
    <Alert type="error">
      Not connected to the internet <RefreshIcon />
    </Alert>
  ),
};

const Alerts = () => {
  const { alertType } = AppStore;
  return alertTypes[alertType];
};

export default observer(Alerts);
