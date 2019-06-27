import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import PropTypes from 'prop-types';
import React from 'react';
import Slider from '@material-ui/lab/Slider';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import log from 'electron-log';
import {Connection} from '@solana/web3.js';
import {withStyles} from '@material-ui/core/styles';
import {ReactThemes, ReactTerminal} from 'react-terminal-component';
import {EmulatorState, OutputFactory, Outputs} from 'javascript-terminal';

import {url} from './url';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    marginTop: theme.spacing(2),
  },
  summary: {
    marginTop: theme.spacing(2),
    textAlign: 'center',
  },
  publicKeyTextField: {
    marginTop: theme.spacing(0),
    marginLeft: theme.spacing(2),
    width: 500,
  },
  storageSlider: {
    marginTop: theme.spacing(5),
  },
  progressBar: {
    marginTop: theme.spacing(1),
  },
  footer: {
    marginTop: 'auto',
    backgroundColor: 'white',
  },
});

class App extends React.Component {
  constructor(props) {
    super(props);
    this.terminalHeight = 25;

    this.state = {
      transactionCount: 0,
      totalMined: 0,
      totalSupply: 0,
    };
    this.connection = new Connection(url);
    log.info('connection:', url);

    this.clearTerminal();
    this.addTerminalText(`Cluster entrypoint: ${url}...`);
  }

  componentDidMount() {
    this.id = setInterval(() => this.updateClusterStats(), 2000);
  }

  componentWillUnmount() {
    clearInterval(this.id);
  }

  trimTerminalOutput() {
    const count = this.terminalOutputs.count();
    if (count > this.terminalHeight) {
      this.terminalOutputs = this.terminalOutputs.splice(
        0,
        count - this.terminalHeight,
      );
    }
    this.setState({});
  }

  addTerminalCommand(command) {
    this.terminalOutputs = Outputs.addRecord(
      this.terminalOutputs,
      OutputFactory.makeHeaderOutput('', command),
    );
    this.trimTerminalOutput();
  }

  addTerminalText(text) {
    this.terminalOutputs = Outputs.addRecord(
      this.terminalOutputs,
      OutputFactory.makeTextOutput(text),
    );
    this.trimTerminalOutput();
  }

  addTerminalError(errorMessage) {
    this.terminalOutputs = Outputs.addRecord(
      this.terminalOutputs,
      OutputFactory.makeErrorOutput({source: 'error', type: errorMessage}),
    );
    this.trimTerminalOutput();
  }

  clearTerminal() {
    this.terminalOutputs = Outputs.create(
      new Array(this.terminalHeight).fill(OutputFactory.makeTextOutput(' ')),
    );
    this.trimTerminalOutput();
  }

  clusterRestart() {
    this.addTerminalText(`Cluster restart detected at ${new Date()}`);
  }

  async updateClusterStats() {
    try {
      const transactionCount = await this.connection.getTransactionCount();
      const totalSupply = await this.connection.getTotalSupply();

      if (transactionCount < this.state.transactionCount) {
        this.clusterRestart();
      }

      this.setState({
        transactionCount,
        totalSupply,
      });
    } catch (err) {
      log.error('updateClusterStats failed', err);
      this.addTerminalError(`updateClusterStats failed: ${err.message}`);
    }
  }

  render() {
    const {classes} = this.props;

    // eslint-disable-next-line no-restricted-properties
    const totalSupplySOL = (this.state.totalSupply / Math.pow(2, 34)).toFixed(
      2,
    );

    const emulatorState = EmulatorState.createEmpty().setOutputs(
      this.terminalOutputs,
    );

    return (
      <div className={classes.root}>
        <CssBaseline />
        <Container className={classes.main}>
          <Grid container spacing={0}>
            <Grid
              item
              style={{display: 'flex', alignItems: 'center'}}
              xs={10}
              sm={5}
            >
              <Typography variant="h2">
                <span role="img" aria-label="pick">
                  ⛏️
                </span>{' '}
                SolMiner
              </Typography>
            </Grid>
            <Grid item xs={10} sm={5}>
              <Typography variant="subtitle1" gutterBottom>
                Gigabytes of ledger to store:
              </Typography>
              <div className={classes.storageSlider}>
                <Slider
                  disabled
                  step={10}
                  defaultValue={20}
                  className={classes.publicKeyTextField}
                  valueLabelDisplay="on"
                  min={10}
                  max={1000}
                />
              </div>
              <p />
              <Typography variant="subtitle1">
                Deposit mining rewards into this account:
              </Typography>
              <TextField
                error={false}
                placeholder="Account Public Key"
                className={classes.publicKeyTextField}
                margin="normal"
                helperText="Account Balance: 12345 lamports"
              />
            </Grid>
          </Grid>
        </Container>
        <footer className={classes.footer}>
          <Container className={classes.summary}>
            <Grid container spacing={1}>
              <Grid item xs>
                <Typography variant="caption" noWrap>
                  Lamports mined: {this.state.totalMined}
                </Typography>
              </Grid>
              <Grid item xs>
                <Typography variant="caption" noWrap>
                  Transaction count: {this.state.transactionCount}
                </Typography>
              </Grid>
              <Grid item xs>
                <Typography variant="caption" noWrap>
                  Total supply: {totalSupplySOL} SOL
                </Typography>
              </Grid>
            </Grid>
          </Container>
          <LinearProgress className={classes.progressBar} />
          <ReactTerminal
            theme={{...ReactThemes.default, height: '50'}}
            emulatorState={emulatorState}
            acceptInput={false}
          />
        </footer>
      </div>
    );
  }
}
App.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const StyledApp = withStyles(styles)(App);
export default StyledApp;
