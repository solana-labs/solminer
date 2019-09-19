import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Typography, Switch, Card, HelpIcon } from 'components/UI';
import { AppStore, StatsStore } from 'store';
import { useTranslation } from 'react-i18next';
import { CLUSTER_UPDATE_TIMEOUT } from '../../constants';
import css from './styles.module.scss';

const Mining = () => {
  const { t } = useTranslation();
  const { stats, replicator, updateStats } = StatsStore;
  const { state } = AppStore;
  const [enabled, setEnabled] = useState(false);
  const timeout = useRef();
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
        <Typography type="title">{t('mining')}</Typography>
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
            {(stats.totalSupply / 2 ** 34).toFixed(2)}
          </div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            {t('tx_count')} <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.transactionCount}</div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            {t('total_mined')} <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.totalMined}</div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            {t('recently_mined')} <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.newMined}</div>
        </Card>
      </div>
    </div>
  );
};

export default observer(Mining);
