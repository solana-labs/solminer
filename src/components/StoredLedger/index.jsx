import React, { useState } from 'react';
import { Card, Button, Typography, TitleWithImage } from 'components/UI';
import { AppStore } from 'store';
import { useTranslation } from 'react-i18next';
import { DEFAULT_LEDGER_STORAGE_GB } from '../../constants';
import CloseIcon from '../../images/icon/close.svg';
import GBSlider from '../GBSlider';
import css from './styles.module.scss';

const StoredLedger = () => {
  const { t } = useTranslation();
  const { setScreen } = AppStore;
  const [gb, setGb] = useState([DEFAULT_LEDGER_STORAGE_GB]);
  const handleSubmit = () => setScreen('mining');
  const close = () => setScreen('mining');
  const titleMsg = t('gb_to_store');
  const isSmall = true;

  return (
    <div>
      <Typography className={css.title} type="title">
        <TitleWithImage title={titleMsg} />
        <button type="button" className={css.close} onClick={close}>
          <CloseIcon width={19} height={19} fill="#fff" />
        </button>
      </Typography>
      <Card>
        <form noValidate onSubmit={handleSubmit}>
          <GBSlider values={gb} onChange={setGb} />
          <div className={css.tip}>{t('pro_tip')}</div>
          <Button small={isSmall} type="submit">{t('save')}</Button>
        </form>
      </Card>
    </div>
  );
};

export default StoredLedger;
