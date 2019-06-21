const os = require('os');

const dotexe = os.type() === 'Windows_NT' ? '.exe' : '';
const solanaInstallInit = `solana-install-init${dotexe}`;

module.exports = {
  make_targets: {
    win32: ['squirrel'],
    darwin: ['dmg'],
    linux: ['deb', 'rpm'],
  },
  electronPackagerConfig: {
    packageManager: 'yarn',
    icon: 'src/images/icon/solminer',
    extraResource: solanaInstallInit,
  },
  electronWinstallerConfig: {
    name: 'solminer',
  },
  electronInstallerDMG: {
    icon: 'src/images/icon/solminer.icns',
  },
  electronInstallerDebian: {},
  electronInstallerRedhat: {},
  github_repository: {
    owner: 'solana-labs',
    name: 'solminer',
  },
  windowsStoreConfig: {
    packageName: '',
    name: 'solminer',
  },
};
