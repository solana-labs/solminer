import React from 'react';
import { AppStore } from 'store';
import CreateWalletBtn from '../CreateWalletBtn';
import { Button, Typography } from '../UI';
import img from './assets/img.png';
import img2x from './assets/img@2x.png';
import css from './styles.module.scss';

const HowItWorks = () => {
  const { setScreen } = AppStore;
  const handleNext = () => setScreen('setupOne');

  return (
    <div className={css.root}>
      <div className={css.left}>
        <img src={img} srcSet={`${img2x} 2x`} alt="" />
      </div>
      <div className={css.right}>
        <Typography className={css.title} type="title">
          How It works
        </Typography>
        <Typography className={css.subttl} type="subttl">
          Step 1: Connect your wallet.
        </Typography>
        <Typography className={css.subttl} type="subttl">
          Step 2: Choose how many Gigabits of the Ledger you want to store
        </Typography>
        <Typography className={css.desc} as="p">
          The more GB you store the more money you make
        </Typography>
        <Button onClick={handleNext}>Next</Button>
        <div className={css.newWallet}>
          <CreateWalletBtn />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
