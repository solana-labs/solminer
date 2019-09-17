import React, { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { Typography, Switch, Card, HelpIcon } from 'components/UI';
import { AppStore, StatsStore } from 'store';
import { CLUSTER_UPDATE_TIMEOUT } from '../../constants';
import css from './styles.module.scss';

const Mining = () => {
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
        <Typography type="title">Mining</Typography>
        <Typography className={css.statusTitle} type="subttl">
          Status:
        </Typography>
        <Typography className={css.status}>{state}</Typography>
        <div className={css.switch}>
          <Switch
            label={enabled ? 'Enabled:' : 'Disabled:'}
            checked={enabled}
            onChange={switchEnabled}
          />
        </div>
      </div>
      <div className={css.cards}>
        <Card>
          <Typography className={css.cardTitle}>
            Total Supply in SOL <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.totalSupply}</div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            Transaction Count <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.transactionCount}</div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            Total Mined Lamports <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.totalMined}</div>
        </Card>
        <Card>
          <Typography className={css.cardTitle}>
            Recently Mined Lamports <HelpIcon />
          </Typography>
          <div className={css.val}>{stats.newMined}</div>
        </Card>
      </div>
    </div>
  );
};

export default observer(Mining);
