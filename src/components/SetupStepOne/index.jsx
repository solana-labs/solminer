import React, { useState } from 'react';
import { AppStore } from 'store';
import { Card, Button, Typography, Input } from 'components/UI';
import CreateWalletBtn from 'components/CreateWalletBtn';
import generateKeys from '../../utils/generateKeys';
import Squares from '../UI/Squares';
import css from './styles.module.scss';

const Setup = () => {
  const { setScreen, setSecretKey } = AppStore;
  const [seedPhrase, setSeedPhrase] = useState(
    'resemble orient middle honey call bench cluster tornado burger erode render prevent'
  );

  const handleSeedChange = e => setSeedPhrase(e.target.value);

  const handleSubmit = e => {
    e.preventDefault();
    const { secretKey } = generateKeys(seedPhrase);
    setSecretKey(secretKey);
    setScreen('setupTwo');
  };
  return (
    <div>
      <Typography className={css.title} type="title">
        Let&apos;s get you set up!
      </Typography>
      <Typography className={css.step}>
        <b>Step 1 of 2:</b> Connect your wallet.
      </Typography>
      <Card>
        <form noValidate onSubmit={handleSubmit}>
          <Typography className={css.formTitle} type="cardTitle">
            enter a valid seed phrase to connect your wallet
          </Typography>
          <Input
            value={seedPhrase}
            onChange={handleSeedChange}
            placeholder="Enter seed phrase"
          />
          <Typography className={css.formHint}>
            Seed phrase should be 12 words in length.
          </Typography>
          <Button type="submit">Connect wallet</Button>
        </form>
      </Card>
      <CreateWalletBtn horizontal />
      <Squares />
    </div>
  );
};

export default Setup;
