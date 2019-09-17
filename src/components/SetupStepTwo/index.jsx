import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Button, Typography } from 'components/UI';
import { AppStore } from 'store';
import { DEFAULT_LEDGER_STORAGE_GB } from '../../constants';
import GBSlider from '../GBSlider';
import Squares from '../UI/Squares';
import css from './styles.module.scss';

const Setup = () => {
  const { setScreen, gb, setGigabites } = AppStore;
  const handleSubmit = () => setScreen('mining');

  return (
    <div>
      <Typography className={css.title} type="title">
        Let&apos;s get you set up!
      </Typography>
      <Typography className={css.step}>
        <b>Step 2 of 2:</b> Next, you need to choose how many GB of the Ledger
        you want to store. The more you store the bigger the rewards.
      </Typography>
      <Card>
        <div>
          <Typography className={css.formTitle} type="cardTitle">
            GB of ledger to store
          </Typography>
          <GBSlider onChange={setGigabites} values={gb.toJS()} />
          <div className={css.tip}>
            Pro Tip: Not sure where to start? We suggest starting with{' '}
            {DEFAULT_LEDGER_STORAGE_GB}
            gb, you can always increase or decrease at any time.
          </div>
          <Button onClick={handleSubmit}>Save</Button>
        </div>
      </Card>
      <Squares />
    </div>
  );
};

export default observer(Setup);
