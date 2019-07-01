import log from 'electron-log';
import {spawn} from 'promisify-child-process';
import path from 'path';
import electron from 'electron';
import jsonfile from 'jsonfile';
import {Account} from '@solana/web3.js';
import {solanaInstallInit} from './solana-install-init';

export class Replicator {
  constructor(connection, terminalOutput) {
    this.connection = connection;
    this.terminalOutput = terminalOutput;
    this.running = false;

    const userDataPath = electron.remote.app.getPath('userData');
    this.solanaInstallBinDir = path.join(
      userDataPath,
      'install',
      'active_release',
      'bin',
    );
    this.replicatorKeypairFile = path.join(
      userDataPath,
      'replicator-keypair.json',
    );
    this.storageKeypairFile = path.join(userDataPath, 'storage-keypair.json');
    this.replicatorLedgerDir = path.join(userDataPath, 'ledger');

    this.solanaInstallConfig = path.join(userDataPath, 'config.yml');
    this.solanaInstallDataDir = path.join(userDataPath, 'install');
  }

  start() {
    if (this.running) {
      log.warn('Replicator already running, ignoring start()');
      return;
    }
    this.running = true;
    this.main();
  }

  stop() {
    if (!this.running) {
      return;
    }
    this.terminalOutput.addTerminalText('^C');
    this.running = false;
    // TODO: signal main to exit...
  }

  restart() {
    if (!this.running) {
      return;
    }
    this.stop();
    this.start();
  }

  /**
   * @private
   */
  async cmd(command, args) {
    this.terminalOutput.addTerminalCommand(`${command} ${args.join(' ')}`);
    const env = Object.assign({}, {RUST_LOG: 'solana=info'}, process.env);
    const child = spawn(command, args, {env});

    child.stdout.on('data', data =>
      this.terminalOutput.addTerminalText(data.toString()),
    );
    child.stderr.on('data', data =>
      this.terminalOutput.addTerminalText(data.toString()),
    );
    return child;
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
      await this.cmd(solanaWallet, [
        '--keypair',
        this.replicatorKeypairFile,
        'airdrop',
        '100000',
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
      const storageKeypair = new Account(
        Buffer.from(jsonfile.readFileSync(this.storageKeypairFile)),
      );

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
      this.terminalOutput.addTerminalError(err.message);
    }
  }
}
