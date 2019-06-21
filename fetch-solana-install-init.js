// Fetches the latest solana-install-init program for the current platform
/* eslint no-console: "off" */
import os from 'os';
import assert from 'assert';
import fetch from 'node-fetch';
import got from 'got';
import fs from 'fs';

const channel = 'edge';
// const channel = 'github-release';

async function download(assetName, dest) {
  if (fs.existsSync(dest)) {
    console.log(`${dest} already exists`);
    return;
  }

  let downloadUrl;
  if (channel === 'github-release') {
    const releaseUrl =
      'https://api.github.com/repos/solana-labs/solana/releases/latest';
    console.log(`Fetching ${releaseUrl}...`);
    const response = await fetch(releaseUrl);
    const latestRelease = await response.json();

    const asset = latestRelease.assets.find(a => a.name === assetName);
    if (!asset) {
      throw new Error(`Unable to locate a release asset named ${assetName}`);
    }
    downloadUrl = asset.browser_download_url;
  } else {
    downloadUrl = `http://release.solana.com/${channel}/${assetName}`;
  }
  console.log(`Fetching ${downloadUrl}...`);

  got.stream(downloadUrl).pipe(fs.createWriteStream(dest));
  console.log(`Wrote ${dest}`);
}

async function main() {
  assert(os.arch() === 'x64', `Unsupported architecture: ${os.arch()}`);
  switch (os.type()) {
    case 'Windows_NT':
      download(
        'solana-install-init-x86_64-pc-windows-msvc.exe',
        'solana-install-init.exe',
      );
      break;
    case 'Darwin':
      download(
        'solana-install-init-x86_64-apple-darwin',
        'solana-install-init',
      );
      break;
    case 'Linux':
      download(
        'solana-install-init-x86_64-unknown-linux-gnu',
        'solana-install-init',
      );
      break;
    default:
      throw new Error(`Unsupported OS type: ${os.type()}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
