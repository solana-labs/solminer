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
  packagerConfig: {
    packageManager: 'yarn',
    icon: 'src/images/icon/solminer',
    extraResource: solanaInstallInit,
    osxSign: !!process.env.TRAVIS, // Only sign if running on Travis CI
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
        icon: 'src/images/icon/solminer.icns',
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
