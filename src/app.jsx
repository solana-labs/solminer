/* eslint no-console: "off" */
import React from 'react';
import {Connection} from '@solana/web3.js';
import {url} from './url';

const connection = new Connection(url);
console.log('connection:', url);

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      transactionCount: null,
    };
  }

  componentDidMount() {
    this.id = setInterval(() => this.updateTransactionCount(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.id);
  }

  async updateTransactionCount() {
    try {
      const transactionCount = await connection.getTransactionCount();
      this.setState({transactionCount});
    } catch (err) {
      console.log('updateTransactionCount failed', err);
    }
  }

  render() {
    return (
      <div style={{textAlign: 'center'}}>
        <br />
        <h2>Coming soon...</h2>
        <p />
        Transaction count: {this.state.transactionCount}
      </div>
    );
  }
}
