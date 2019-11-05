import assert from "assert";
import os from "os";

const { MSICreator } = require('electron-wix-msi');
const projectRoot = require('path').resolve(__dirname, './windowApp-win32-ia32');
const OUT_DIR = require('path').resolve(__dirname, './windows_installer_2');

const img = require('./src/images/SOLANA-2.png');

function createWinInstaller() {
  const msiCreator = new MSICreator({
    appDirectory: projectRoot,
    outputDirectory: OUT_DIR,
    description: 'This is a demo application',
    exe: 'OurCodeWorld',
    name: 'Desktop Application',
    manufacturer: 'Our Code World Inc',
    version: '1.0.0',
    ui: {
      images: {
        background: img.toDataURL(),
      },
      chooseDirectory: true,
    },
  });

  msiCreator.create().then(function() {
    console.log('dir - ', projectRoot);
    msiCreator.compile();
  });
};

async function main() {
  assert(os.arch() === 'x64', `Unsupported architecture: ${os.arch()}`);
  switch (os.type()) {
    case 'Windows_NT':
      createWinInstaller();
      break;
    case 'Darwin':
      break;
    case 'Linux':
      break;
    default:
      throw new Error(`Unsupported OS type: ${os.type()}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});