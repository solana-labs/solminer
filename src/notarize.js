import { notarize } from 'electron-notarize'

const projectRoot = require('path').resolve(__dirname, '..');

export = async function () {
    if (process.platform !== 'darwin') {
        console.log('Skipping notarization - not building for Mac');
        return;
    }

    console.log('Notarizing...');

    return notarize({
        appBundleId: 'com.electron.solminer',
        appPath: projectRoot + '/out/solminer-darwin-x64/solminer.app',
        appleId: $APPLE_ID,
        appleIdPassword: $APPLE_ID_PASSWORD
    }).catch((e) => {
        console.error(e);
        throw e;
    });
}
