module.exports = {
  make_targets: {
    win32: ['squirrel'],
    darwin: ['dmg'],
    linux: ['deb', 'rpm'],
  },
  electronPackagerConfig: {
    packageManager: 'yarn',
    icon: 'src/images/icon/solminer',
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
