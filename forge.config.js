const os = require('os');
const path = require('path');
const process = require('process');
const fs = require('fs');

const dotexe = os.type() === 'Windows_NT' ? '.exe' : '';
const solanaInstallInit = `solana-install-init${dotexe}`;

const electronWinstallerConfig = {
  name: 'solminer',
};
{
  const certificateFile = path.join(__dirname, 'cert', 'solana.pfx');
  const certificatePassword = process.env.SOLANA_PDX_PASSWORD;
  if (fs.existsSync(certificateFile) && typeof certificateFile === 'string') {
    electronWinstallerConfig.certificatePassword = certificatePassword;
    electronWinstallerConfig.certificateFile = certificateFile;
    // eslint-disable-next-line no-console
    console.log(`Will sign windows installer with ${certificateFile}`);
  }
}

module.exports = {
  make_targets: {
    win32: ['squirrel'],
    darwin: ['zip', 'dmg'],
    linux: ['deb', 'rpm'],
  },
  electronPackagerConfig: {
    packageManager: 'yarn',
    icon: 'src/images/icon/solminer',
    extraResource: solanaInstallInit,
  },
  electronWinstallerConfig,
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
