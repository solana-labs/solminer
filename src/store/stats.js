import LocalStore from 'electron-store';
import { Connection, PublicKey } from '@solana/web3.js';
import { action, observable, flow } from 'mobx';
import url from '../url';
import Replicator from '../replicator';
import AppStore from './app';

const DEFAULT_LAMPORTS = 10000;
const localStore = new LocalStore();

class StatsStore {
  constructor() {
    this.connection = new Connection(url);
    this.replicator = new Replicator(this.connection);
  }

  @observable stats = {
    transactionCount: 0,
    totalMined: localStore.get('totalMined', 0),
    newMined: 0,
    totalSupply: 0,
    depositMinimumLamports: localStore.get(
      'depositMinimumLamports',
      DEFAULT_LAMPORTS
    ),
    depositPublicKeyBalance: '',
  };

  clusterRestart() {
    this.replicator.clusterRestart();
    this.stats.transactionCount = 0;
    setTimeout(() => this.updateStats());
  }

  @action.bound
  updateStats = flow(function* updateStats() {
    const { transactionCount, depositMinimumLamports } = this.stats;
    const newTransactionCount = yield this.connection.getTransactionCount();

    if (newTransactionCount < transactionCount / 2) {
      this.clusterRestart();
      return;
    }

    this.stats.totalSupply = yield this.connection.getTotalSupply();
    const newMined = yield this.replicator.adjustedReplicatorBalance();

    if (newMined > depositMinimumLamports) {
      const success = yield this.replicator.depositMiningRewards(
        new PublicKey(AppStore.depositPublicKey),
        newMined
      );
      if (success) {
        this.stats.totalMined += newMined;
        localStore.set('totalMined', this.stats.totalMined);
      }
    }

    const balance = yield this.connection.getBalance(
      new PublicKey(AppStore.depositPublicKey)
    );
    this.stats.depositPublicKeyBalance = `Account Balance: ${balance} lamports`;
    this.stats.newMined = newMined;
    this.stats.transactionCount = newTransactionCount;
  });
}

const store = new StatsStore();

export default store;
