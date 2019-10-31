import React from 'react';
import { observer } from 'mobx-react-lite';
import { Card, Button, Typography, TitleWithImage } from 'components/UI';
import { AppStore } from 'store';
import { useTranslation, Trans } from 'react-i18next';
import GBSlider from '../GBSlider';
import Squares from '../UI/Squares';
import css from './styles.module.scss';

const Setup = () => {
  const { t } = useTranslation();
  const titleMsg = t('get_setup_up');
  const isSmall = true;
  const { setScreen, gb, setGB } = AppStore;
  const handleSubmit = () => setScreen('mining');
  return (
    <div>
      <TitleWithImage title={titleMsg} />
      <Typography className={css.step}>
        <Trans i18nKey="step_2_of_2" />
      </Typography>
      <Card>
        <div>
          <Typography className={css.formTitle} type="cardTitle">
            {t('gb_to_store')}
          </Typography>
          <GBSlider onChange={setGB} values={gb.toJS()} />
          <div className={css.tip}>{t('pro_tip')}</div>
          <Button onClick={handleSubmit} small={isSmall}>{t('save')}</Button>
        </div>
      </Card>
      <Squares />
    </div>
  );
};

export default observer(Setup);
