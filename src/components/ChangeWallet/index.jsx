import React from 'react';
import { AppStore } from 'store';
import { Card, Button, Typography, Input } from 'components/UI';
import CreateWalletBtn from 'components/CreateWalletBtn';
import CloseIcon from '../../images/icon/close.svg';
import css from './styles.module.scss';

const Change = () => {
  const { setScreen } = AppStore;
  const handleSubmit = () => setScreen('mining');
  const close = () => setScreen('mining');
  return (
    <div>
      <Typography className={css.title} type="title">
        Change wallet
        <button type="button" className={css.close} onClick={close}>
          <CloseIcon width={19} height={19} fill="#fff" />
        </button>
      </Typography>
      <div className={css.step}>
        <Typography type="subttl">Current wallet</Typography>
        <Typography>0xAA15A3E6b97d09653b8b8d9c9e1D80daf5ba81e8</Typography>
      </div>
      <Card>
        <form noValidate onSubmit={handleSubmit}>
          <Typography className={css.formTitle} type="cardTitle">
            enter a valid seed phrase to connect your wallet
          </Typography>
          <Input placeholder="Enter seed phrase" />
          <Typography className={css.formHint}>
            Seed phrase should be 12 words in length.
          </Typography>
          <Button type="submit">Change wallet</Button>
        </form>
      </Card>
      <CreateWalletBtn horizontal />
    </div>
  );
};

Change.propTypes = {};

export default Change;
