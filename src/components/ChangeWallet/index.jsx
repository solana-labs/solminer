import React, { useState } from 'react';
import { AppStore } from 'store';
import { Card, Button, Typography, Input, TitleWithImage } from 'components/UI';
import { useTranslation } from 'react-i18next';
import CreateWalletBtn from 'components/CreateWalletBtn';
import CloseIcon from '../../images/icon/close.svg';
import css from './styles.module.scss';
import generateKeys from '../../utils/generateKeys';

const Change = () => {
  const { t } = useTranslation();
  const {
    setScreen,
    setSecretKey,
    setDepositPublicKey,
    depositPublicKey,
  } = AppStore;
  const [seedPhrase, setSeedPhrase] = useState('');

  const handleSeedChange = e => setSeedPhrase(e.target.value);

  const handleSubmit = e => {
    e.preventDefault();
    const { publicKey, secretKey } = generateKeys(seedPhrase);
    setSecretKey(secretKey);
    setDepositPublicKey(publicKey);
  };

  const titleMsg = 'change wallet';

  const close = () => setScreen('mining');
  return (
    <div>
      <Typography className={css.title} type="title">
        <TitleWithImage title={titleMsg} />
        <button type="button" className={css.close} onClick={close}>
          <CloseIcon width={19} height={19} fill="#fff" />
        </button>
      </Typography>
      <div className={css.step}>
        <Typography type="subttl">{t('current_wallet')}</Typography>
        <Typography>{depositPublicKey}</Typography>
      </div>
      <Card>
        <form noValidate onSubmit={handleSubmit}>
          <Typography className={css.formTitle} type="cardTitle">
            {t('enter_seed_valid_phrase')}
          </Typography>
          <Input
            value={seedPhrase}
            onChange={handleSeedChange}
            placeholder={t('enter_seed_phrase')}
          />
          <Typography className={css.formHint}>
            {t('seed_phrase_reqs')}
          </Typography>
          <Button type="submit" disabled={!seedPhrase}>
            {t('connect_wallet')}
          </Button>
        </form>
      </Card>
      <CreateWalletBtn horizontal />
    </div>
  );
};

Change.propTypes = {};

export default Change;
