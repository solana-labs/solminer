import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Button, Typography } from 'components/UI';
import { AppStore } from 'store';
import { useTranslation, Trans } from 'react-i18next';
import GBSlider from '../GBSlider';
import Squares from '../UI/Squares';
import css from './styles.module.scss';

const Setup = () => {
  const { t } = useTranslation();
  const { setScreen, gb, setGigabites } = AppStore;
  const handleSubmit = () => setScreen('mining');

  return (
    <div>
      <Typography className={css.title} type="title">
        {t('get_setup_up')}
      </Typography>
      <Typography className={css.step}>
        <Trans i18nKey="step_2_of_2" /> {t('more_gb')}
      </Typography>
      <Card>
        <div>
          <Typography className={css.formTitle} type="cardTitle">
            {t('gb_to_store')}
          </Typography>
          <GBSlider onChange={setGigabites} values={gb.toJS()} />
          <div className={css.tip}>{t('pro_tip')}</div>
          <Button onClick={handleSubmit}>{t('save')}</Button>
        </div>
      </Card>
      <Squares />
    </div>
  );
};

export default observer(Setup);
