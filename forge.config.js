const os = require('os');
const path = require('path');
const process = require('process');
const fs = require('fs');
const url = require('url');

const dotexe = os.type() === 'Windows_NT' ? '.exe' : '';
const solanaInstallInit = `solana-install-init${dotexe}`;

const iconUrl = url.format({
  pathname: path.join(__dirname, 'src/images/icon/solminer.icns'),
  protocol: 'file',
  slashes: true,
});

const electronWinstallerConfig = {
  name: 'solminer',
  iconUrl,
  setupIcon: 'src/images/icon/solminer.ico',
  loadingGif: 'src/images/solminer.gif',
  setupExe: 'solminer.exe',
  noMsi: false,
};

const electronInstallerDMG = {
  name: 'SolminerMacOsApp',
  icon: 'src/images/icon/solminer.icns',
  background: 'src/images/solminer.png',
};
{
  const certificateFile = path.join(__dirname, 'cert', 'solana.pfx');
  const certificatePassword = process.env.SOLANA_PDX_PASSWORD;
  if (fs.existsSync(certificateFile) && typeof certificateFile === 'string') {
    electronWinstallerConfig.certificatePassword = certificatePassword;
    electronWinstallerConfig.certificateFile = certificateFile;
    console.log(`Will sign windows installer with ${certificateFile}`);
  }
}

module.exports = {
  packagerConfig: {
    packageManager: 'yarn',
    icon: 'src/images/icon/solminer',
    extraResource: solanaInstallInit,
    afterCopy: ['./src/hooks/after-copy.js'],
    appCategoryType: 'public.app-category.developer-tools',
    osxSign: {
      keychain: 'solana-build.keychain',
      'gatekeeper-assess': false,
      'hardened-runtime': true,
      entitlements: 'src/entitlements.plist',
      'entitlements-inherit': 'src/entitlements.plist',
    }, // Only sign if running on Travis CI
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {
        ...electronWinstallerConfig,
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-dmg',
      config: {
        ...electronInstallerDMG,
      },
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'solana-labs',
          name: 'solminer',
        },
      },
    },
  ],
  plugins: [
    [
      '@electron-forge/plugin-webpack',
      {
        mainConfig: './webpack.main.config.js',
        renderer: {
          config: './webpack.renderer.config.js',
          entryPoints: [
            {
              html: './src/index.html',
              js: './src/renderer.jsx',
              name: 'main_window',
            },
          ],
        },
      },
    ],
  ],
};