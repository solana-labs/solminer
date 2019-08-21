import log from 'electron-log';
import {spawn} from 'promisify-child-process';
import path from 'path';
import os from 'os';
import electron from 'electron';
import jsonfile from 'jsonfile';
import fkill from 'fkill';
import {
  sendAndConfirmTransaction,
  Account,
  SystemProgram,
} from '@solana/web3.js';
import fs from 'mz/fs';
import {solanaInstallInit} from './solana-install-init';
import {sleep} from './sleep';
import {url} from './url';

// TODO: https://github.com/solana-labs/solana/issues/4344
const airdropAmount = 100000;

export class Replicator {
  constructor(connection) {
    const userDataPath = electron.remote.app.getPath('userData');

    Object.assign(this, {
      connection,
      depositInProgress: false,
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

    // Stop if the main process requests it
    electron.ipcRenderer.on('stop-replicator', async () => {
      log.info('stop-replicator requested');
      try {
        await this.stop();
      } catch (err) {
        log.info('stop-replicator: error:', err);
      }
      electron.ipcRenderer.send('replicator-stopped');
    });
  }

  static async fkill() {
    // Ensure nothing is lingering in the background
    try {
      const dotExe = os.type() === 'Windows_NT' ? '.exe' : '';
      await fkill(
        [
          `solana-install${dotExe}`,
          `solana-replicator${dotExe}`,
          `solana-wallet${dotExe}`,
        ],
        {
          force: true,
        },
      );
    } catch (err) {
      log.debug('fkill errored with:', err);
    }
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
        const realBalance = await this.connection.getBalance(
          this.replicatorKeypair.publicKey,
        );
        const adjustedBalance = Math.max(0, realBalance - airdropAmount);
        log.info(
          `adjustedReplicatorBalance: real=${realBalance} adjusted=${adjustedBalance}`,
        );
        return adjustedBalance;
      } catch (err) {
        log.warn('adjustedReplicatorBalance failed:', err.message);
      }
    }
    return 0;
  }

  async depositMiningRewards(destinationPublicKey, amount) {
    if (this.replicatorKeypair === null) {
      return false;
    }
    if (this.depositInProgress) {
      return false;
    }
    this.depositInProgress = true;

    try {
      log.info(
        `depositMiningRewards: ${amount} lamports to ${destinationPublicKey}`,
      );
      const transaction = SystemProgram.transfer(
        this.replicatorKeypair.publicKey,
        destinationPublicKey,
        amount,
      );
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        this.replicatorKeypair,
      );
      console.info(
        `Deposited mining rewards (${amount} lamports).  Transaction signature: ${signature}`,
      );
      return true;
    } catch (err) {
      console.error(
        `Deposit mining rewards failed (${amount} lamports):`,
        err.message,
      );
      return false;
    } finally {
      this.depositInProgress = false;
    }
  }

  /**
   * @private
   */
  async cmd(command, args) {
    if (!this.running) {
      throw new Error(`Unable to run ${command}, not running`);
    }
    console.log(`$ ${command} ${args.join(' ')}`);
    log.info(`$ ${command} ${args.join(' ')}`);
    const env = Object.assign({}, {RUST_LOG: 'solana=info'}, process.env);
    const child = spawn(command, args, {env});
    log.info(`pid ${child.pid}`);

    function logData(data) {
      const s = data.toString().replace(/\n+$/, '');
      s.split(/\n/).forEach(line => console.log(line));
    }

    child.stdout.on('data', logData);
    child.stderr.on('data', logData);
    child.on('error', err => {
      log.info('child error:', err);
    });

    return Promise.race([
      child,
      new Promise(resolve => {
        this.cmdCancel = async () => {
          log.info(`cmd cancelled, killing pid ${child.pid}`);
          try {
            await fkill(child.pid);
          } catch (err) {
            log.debug('fkill error:', err);
          }
          child.kill();

          console.info('User abort');
          resolve();
        };
      }),
    ]);
  }

  /**
   * @private
   */
  async maybeGenerateKeypair(keypairFile, force = false) {
    const solanaKeygen = `${this.solanaInstallBinDir}/solana-keygen`;

    if (!force) {
      try {
        await fs.access(keypairFile, fs.constants.R_OK);
        const keypair = new Account(
          Buffer.from(jsonfile.readFileSync(keypairFile)),
        );
        const balance = await this.connection.getBalance(keypair.publicKey);
        if (balance > 0) {
          return false;
        }
      } catch (err) {
        log.debug('maybeGenerateKeypair error:', err);
      }
    }
    await this.cmd(solanaKeygen, ['new', '-f', '-o', keypairFile]);
    return true;
  }

  /**
   * @private
   */
  async main() {
    const solanaInstall = `${this.solanaInstallBinDir}/solana-install`;
    const solanaWallet = `${this.solanaInstallBinDir}/solana-wallet`;

    const gossipEntrypoint = (() => {
      const u = new URL(url);
      return `${u.hostname}:8001`;
    })();

    try {
      await Replicator.fkill();

      await this.cmd(solanaInstallInit, [
        '--config',
        this.solanaInstallConfig,
        '--data-dir',
        this.solanaInstallDataDir,
        '--no-modify-path',
        '--url',
        url,
      ]);

      const newReplicatorKeypair = await this.maybeGenerateKeypair(
        this.replicatorKeypairFile,
      );
      const newStorageKeypair = await this.maybeGenerateKeypair(
        this.storageKeypairFile,
        newReplicatorKeypair,
      );

      console.info(`identity keypair: ${this.replicatorKeypairFile}`);
      console.info(`storage keypair: ${this.storageKeypairFile}`);

      const replicatorKeypair = new Account(
        Buffer.from(jsonfile.readFileSync(this.replicatorKeypairFile)),
      );
      this.replicatorKeypair = replicatorKeypair;
      const storageKeypair = new Account(
        Buffer.from(jsonfile.readFileSync(this.storageKeypairFile)),
      );

      console.info(`identity pubkey: ${replicatorKeypair.publicKey}`);
      console.info(`storage pubkey: ${storageKeypair.publicKey}`);

      const replicatorStartingBalance = await this.connection.getBalance(
        this.replicatorKeypair.publicKey,
      );
      if (replicatorStartingBalance < airdropAmount) {
        await this.cmd(solanaWallet, [
          '--url',
          url,
          '--keypair',
          this.replicatorKeypairFile,
          'airdrop',
          (airdropAmount - replicatorStartingBalance).toString(),
        ]);
      }

      if (newStorageKeypair) {
        await this.cmd(solanaWallet, [
          '--url',
          url,
          '--keypair',
          this.replicatorKeypairFile,
          'create-replicator-storage-account',
          replicatorKeypair.publicKey.toString(),
          storageKeypair.publicKey.toString(),
        ]);
      }

      await this.cmd(solanaWallet, [
        '--url',
        url,
        '--keypair',
        this.replicatorKeypairFile,
        'show-storage-account',
        storageKeypair.publicKey.toString(),
      ]);

      await this.cmd(solanaInstall, [
        '--config',
        this.solanaInstallConfig,
        'run',
        'solana-replicator',
        '--',
        '--entrypoint',
        gossipEntrypoint,
        '--identity',
        this.replicatorKeypairFile,
        '--storage-keypair',
        this.storageKeypairFile,
        '--ledger',
        this.replicatorLedgerDir,
      ]);
    } catch (err) {
      console.error('Replicator::main error:', err);
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
