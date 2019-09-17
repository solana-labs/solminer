import React, { useState } from 'react';
import { Card, Button, Typography } from 'components/UI';
import { AppStore } from 'store';
import { DEFAULT_LEDGER_STORAGE_GB } from '../../constants';
import CloseIcon from '../../images/icon/close.svg';
import GBSlider from '../GBSlider';
import css from './styles.module.scss';

const StoredLedger = () => {
  const { setScreen } = AppStore;
  const [gb, setGb] = useState([DEFAULT_LEDGER_STORAGE_GB]);
  const handleSubmit = () => setScreen('mining');
  const close = () => setScreen('mining');

  return (
    <div>
      <Typography className={css.title} type="title">
        gigabites of ledger to store
        <button type="button" className={css.close} onClick={close}>
          <CloseIcon width={19} height={19} fill="#fff" />
        </button>
      </Typography>
      <Card>
        <form noValidate onSubmit={handleSubmit}>
          <GBSlider values={gb} onChange={setGb} />
          <div className={css.tip}>
            Pro Tip: Not sure where to start? We suggest starting with{' '}
            {DEFAULT_LEDGER_STORAGE_GB}
            gb, you can always increase or decrease at any time.
          </div>
          <Button type="submit">Save</Button>
        </form>
      </Card>
    </div>
  );
};

export default StoredLedger;
