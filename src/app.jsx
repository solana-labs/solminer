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

const connection = new Connection(url);
log.info('connection:', url);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactionCount: 0,
      totalMined: 0,
      totalSupply: 0,
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
      const totalSupply = await connection.getTotalSupply();
      this.setState({transactionCount, totalSupply});
    } catch (err) {
      log.error('updateTransactionCount failed', err);
    }
  }

  render() {
    const {classes} = this.props;

    // eslint-disable-next-line no-restricted-properties
    const totalSupplySOL = (this.state.totalSupply / Math.pow(2, 34)).toFixed(
      2,
    );

    const defaultState = EmulatorState.createEmpty();
    const defaultOutputs = defaultState.getOutputs();

    let newOutputs = Outputs.addRecord(
      defaultOutputs,
      OutputFactory.makeTextOutput('...'),
    );
    let emulatorState = defaultState.setOutputs(newOutputs);

    for (let i = 0; i <= 1000; i += 1) {
      newOutputs = Outputs.addRecord(
        newOutputs,
        OutputFactory.makeTextOutput(`${i}: this is a replicator log message...`),
      );
    }
    log.info(newOutputs.count());
    newOutputs = newOutputs.splice(0, newOutputs.count() - 25);
    log.info(newOutputs.count());

    emulatorState = emulatorState.setOutputs(newOutputs);
    // newOutputs = emulatorState.getOutputs();

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
                  step={10}
                  defaultValue={50}
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
