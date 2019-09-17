import nacl from 'tweetnacl';
import * as bip39 from 'bip39';

export default function generateKeys(seedPhrase) {
  const seed = Buffer.from(bip39.mnemonicToEntropy(seedPhrase));
  return nacl.sign.keyPair.fromSeed(seed);
}
