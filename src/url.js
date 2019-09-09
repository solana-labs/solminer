// @noflow

import { testnetChannelEndpoint } from '@solana/web3.js';

const url = !process.env.LOCAL
  ? testnetChannelEndpoint(process.env.CHANNEL || 'stable', false)
  : 'http://localhost:8899';

export default url;
