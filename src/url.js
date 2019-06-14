// @noflow

import {testnetChannelEndpoint} from '@solana/web3.js';

export const url = !process.env.LOCAL
  ? testnetChannelEndpoint(process.env.CHANNEL || 'stable')
  : 'http://localhost:8899';
