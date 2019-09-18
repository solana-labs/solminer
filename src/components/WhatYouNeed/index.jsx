import React from 'react';
import { shell } from 'electron';
import { observer } from 'mobx-react-lite';
import cn from 'classnames';
import { useTranslation, Trans } from 'react-i18next';
import { AppStore } from '../../store';
import { Button, Typography } from '../UI';
import css from './styles.module.scss';
import img from './assets/img.png';
import img2x from './assets/img@2x.png';

const WhatYouNeed = () => {
  const { t } = useTranslation();
  const { setScreen } = AppStore;
  const getStarted = () => setScreen('howItWorks');
  const openLink = e => {
    e.preventDefault();
    shell.openExternal('https://solana-example-webwallet.herokuapp.com/');
  };
  return (
    <div className={css.root}>
      <div className={css.left}>
        <img src={img} srcSet={`${img2x} 2x`} alt="" />
      </div>
      <div className={css.right}>
        <Typography className={css.title} type="title">
          {t('what_you_need')}
        </Typography>
        <ul className={cn('list', css.list)}>
          <li>
            <Trans i18nKey="min_space_required" />
          </li>
          <li>
            <Trans i18nKey="min_bnd_requred" />
          </li>
          <li>
            <Trans i18nKey="turn_off_sleep_mode" />
          </li>
          <li>
            <Trans i18nKey="public_key" /> {t('no_wallet')}{' '}
            <a
              href="https://solana-example-webwallet.herokuapp.com/"
              onClick={openLink}
            >
              {t('create_new_wallet')}
            </a>
          </li>
          <li>
            <Trans i18nKey="keep_internet" />
          </li>
        </ul>
        <Button onClick={getStarted}>{t('get_started')}</Button>
      </div>
    </div>
  );
};

export default observer(WhatYouNeed);
