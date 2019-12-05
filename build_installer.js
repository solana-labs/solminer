import assert from "assert";
import os from "os";

const { MSICreator } = require('electron-wix-msi');
const projectRoot = require('path').resolve(__dirname, './windowApp-win32-ia32');
const OUT_DIR = require('path').resolve(__dirname, './windows_installer');

const img = require('./src/images/solana.png');

function createWinInstaller() {
  const msiCreator = new MSICreator({
    appDirectory: projectRoot,
    outputDirectory: OUT_DIR,
    description: 'Simple msi wix windows installer',
    exe: 'WinInstaller',
    name: 'Solminer',
    manufacturer: 'OurCodeWorldInc',
    version: '1.0.0',
    ui: {
      images: {
        background: img.toDataURL(),
      },
      chooseDirectory: true,
    },
  });

  msiCreator.create().then(function() {
    msiCreator.compile();
  });
}

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