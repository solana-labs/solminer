// Resolves the location of the solana-install-init program
import os from 'os';
import path from 'path';

const isDevMode = process.execPath.match(/[\\/]electron/);
const dotexe = os.type() === 'Windows_NT' ? '.exe' : '';

const solanaInstallInit = isDevMode
  ? `./solana-install-init${dotexe}` // in dev mode assume it's in the path
  : path.join(process.resourcesPath, `solana-install-init${dotexe}`); // bundled in the app when not in dev mode

export default solanaInstallInit;
