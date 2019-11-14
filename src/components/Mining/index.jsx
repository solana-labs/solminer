import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Typography, Switch, Card, HelpIcon, TitleWithImage } from 'components/UI';
import { AppStore, StatsStore } from 'store';
import { useTranslation } from 'react-i18next';
import { CLUSTER_UPDATE_TIMEOUT } from '../../constants';
import css from './styles.module.scss';

const Mining = () => {
  const { t } = useTranslation();
  const { stats, replicator, updateStats } = StatsStore;
  const { state } = AppStore;
  const [enabled, setEnabled] = useState(true);
  const timeout = useRef();
  const titleMsg = t('mining');
  const switchEnabled = val => {
    setEnabled(val);
    if (val) {
      replicator.start();
    } else {
      replicator.stop();
    }
  };

  useEffect(() => {
    updateStats();
    timeout.current = setInterval(() => {
      updateStats();
    }, CLUSTER_UPDATE_TIMEOUT);
  }, [enabled]);

  return (
    <div>
      <div className={css.header}>
        <TitleWithImage title={titleMsg} />
        <Typography className={css.statusTitle} type="subttl">
          {t('status')}:
        </Typography>
        <Typography className={css.status}>{t(state)}</Typography>
        <div className={css.switch}>
          <Switch
            label={t(enabled ? 'enabled' : 'disabled')}
            checked={enabled}
            onChange={switchEnabled}
          />
        </div>
      </div>
      <div className={css.cards}>
        <Card>
          <Typography className={css.cardTitle}>
            {t('total_supply')} <HelpIcon />
          </Typography>
          <div className={css.val}>
            {(stats.totalSupply / 2 ** 34).toLocaleString(undefined, {
              maximumFractionDigits: 2,
            })}
          </div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            {t('tx_count')} <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.transactionCount.toLocaleString(undefined, {maximumFractionDigits:2})}</div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            {t('total_mined')} <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.totalMined.toLocaleString()}</div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            {t('recently_mined')} <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.newMined.toLocaleString()}</div>
        </Card>
      </div>
    </div>
  );
};

export default observer(Mining);
