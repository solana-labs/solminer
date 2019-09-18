import React from 'react';
import { AppStore } from 'store';
import { useTranslation } from 'react-i18next';
import CreateWalletBtn from '../CreateWalletBtn';
import { Button, Typography } from '../UI';
import img from './assets/img.png';
import img2x from './assets/img@2x.png';
import css from './styles.module.scss';

const HowItWorks = () => {
  const { t } = useTranslation();
  const { setScreen } = AppStore;
  const handleNext = () => setScreen('setupOne');

  return (
    <div className={css.root}>
      <div className={css.left}>
        <img src={img} srcSet={`${img2x} 2x`} alt="" />
      </div>
      <div className={css.right}>
        <Typography className={css.title} type="title">
          {t('how_it_works')}
        </Typography>
        <Typography className={css.subttl} type="subttl">
          {t('step_1')}
        </Typography>
        <Typography className={css.subttl} type="subttl">
          {t('step_2')}
        </Typography>
        <Typography className={css.desc} as="p">
          {t('more_gb')}
        </Typography>
        <Button onClick={handleNext}>{t('next')}</Button>
        <div className={css.newWallet}>
          <CreateWalletBtn />
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
