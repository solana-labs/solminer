import log from 'electron-log';
import {spawn} from 'promisify-child-process';
import path from 'path';
import electron from 'electron';
import jsonfile from 'jsonfile';
import {Account, SystemProgram} from '@solana/web3.js';
import {solanaInstallInit} from './solana-install-init';

// TODO: https://github.com/solana-labs/solana/issues/4344
const airdropAmount = 100000;

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class Replicator {
  constructor(connection) {
    const userDataPath = electron.remote.app.getPath('userData');

    Object.assign(this, {
      connection,
      running: false,
      mainPromise: Promise.resolve(),
      cmdCancel: () => undefined,
      solanaInstallBinDir: path.join(
        userDataPath,
        'install',
        'active_release',
        'bin',
      ),
      replicatorKeypair: null,
      replicatorKeypairFile: path.join(userDataPath, 'replicator-keypair.json'),
      storageKeypairFile: path.join(userDataPath, 'storage-keypair.json'),
      replicatorLedgerDir: path.join(userDataPath, 'ledger'),
      solanaInstallConfig: path.join(userDataPath, 'config.yml'),
      solanaInstallDataDir: path.join(userDataPath, 'install'),
    });
  }

  async start() {
    if (this.running) {
      log.warn('Replicator already running, ignoring start()');
      return;
    }
    await this.mainPromise;
    this.running = true;
    this.mainPromise = this.main();
  }

  async stop() {
    if (!this.running) {
      return;
    }
    this.running = false;
    console.warn('^C');
    this.cmdCancel();
    await this.mainPromise;
  }

  async clusterRestart() {
    if (!this.running) {
      return;
    }
    await this.stop();
    this.start();
  }

  async adjustedReplicatorBalance() {
    if (this.replicatorKeypair !== null) {
      try {
        return Math.max(
          0,
          (await this.connection.getBalance(this.replicatorKeypair.publicKey)) -
            airdropAmount,
        );
      } catch (err) {
        log.warn('adjustedReplicatorBalance failed:', err.message);
      }
    }
    return 0;
  }

  async depositMiningRewards(destinationPublicKey, amount) {
    if (this.replicatorKeypair.publicKey === null) {
      return;
    }

    try {
      log.info(
        `depositMiningRewards: ${amount} lamports to ${destinationPublicKey}`,
      );
      const transaction = SystemProgram.transfer(
        this.replicatorKeypair.publicKey,
        destinationPublicKey,
        amount,
      );
      await this.connection.sendTransaction(
        transaction,
        this.replicatorKeypair,
      );

      // Don't bother trying to confirm the transaction.  If it fails the caller
      // can just retry later
    } catch (err) {
      log.warn('destinationPublicKey failed:', err.message);
    }
  }

  /**
   * @private
   */
  async cmd(command, args) {
    console.log(`$ ${command} ${args.join(' ')}`);
    log.info(`$ ${command} ${args.join(' ')}`);
    const env = Object.assign({}, {RUST_LOG: 'solana=info'}, process.env);
    const child = spawn(command, args, {env});
    log.info(`pid ${child.pid}`);

    child.stdout.on('data', data =>
      console.log(data.toString().replace(/\n+$/, '')),
    );
    child.stderr.on('data', data =>
      console.log(data.toString().replace(/\n+$/, '')),
    );
    return Promise.race([
      child,
      new Promise((_, reject) => {
        this.cmdCancel = () => {
          log.info(`cmd cancelled, killing pid ${child.pid}`);
          child.kill();
          reject(new Error('User abort'));
        };
      }),
    ]);
  }

  /**
   * @private
   */
  async main() {
    const solanaInstall = `${this.solanaInstallBinDir}/solana-install`;
    const solanaKeygen = `${this.solanaInstallBinDir}/solana-keygen`;
    const solanaWallet = `${this.solanaInstallBinDir}/solana-wallet`;

    try {
      await this.cmd(solanaInstallInit, [
        '--config',
        this.solanaInstallConfig,
        '--data-dir',
        this.solanaInstallDataDir,
        '--no-modify-path',
      ]);

      await this.cmd(solanaKeygen, [
        'new',
        '-f',
        '-o',
        this.replicatorKeypairFile,
      ]);

      await this.cmd(solanaKeygen, [
        'new',
        '-f',
        '-o',
        this.storageKeypairFile,
      ]);

      const replicatorKeypair = new Account(
        Buffer.from(jsonfile.readFileSync(this.replicatorKeypairFile)),
      );
      this.replicatorKeypair = replicatorKeypair;
      const storageKeypair = new Account(
        Buffer.from(jsonfile.readFileSync(this.storageKeypairFile)),
      );

      await this.cmd(solanaWallet, [
        '--keypair',
        this.replicatorKeypairFile,
        'airdrop',
        airdropAmount.toString(),
      ]);

      await this.cmd(solanaWallet, [
        '--keypair',
        this.replicatorKeypairFile,
        'create-replicator-storage-account',
        replicatorKeypair.publicKey.toString(),
        storageKeypair.publicKey.toString(),
      ]);

      await this.cmd(solanaInstall, [
        '--config',
        this.solanaInstallConfig,
        'run',
        'solana-replicator',
        '--',
        '--entrypoint',
        'testnet.solana.com:8001',
        '--identity',
        this.replicatorKeypairFile,
        '--storage-keypair',
        this.storageKeypairFile,
        '--ledger',
        this.replicatorLedgerDir,
      ]);
    } catch (err) {
      console.error(err.message);
    }

    if (!this.running) {
      log.info('main: not running anymore');
      return Promise.resolve();
    }

    log.info('main: still running, restarting after sleep');
    await sleep(2000);
    return this.main();
  }
}
