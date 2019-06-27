import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import Paper from '@material-ui/core/Paper';
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
    margin: theme.spacing(2),
  },
  summary: {
    marginTop: theme.spacing(2),
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
  publicKeyTextField: {
    marginLeft: theme.spacing(2),
    width: 500,
  },
  storageSlider: {
    marginTop: theme.spacing(5),
  },
  progressBar: {
    marginTop: theme.spacing(1),
  },
});

const connection = new Connection(url);
log.info('connection:', url);

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      transactionCount: '?',
      totalMined: 0,
      totalSupply: '?',
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
        OutputFactory.makeTextOutput(`${i}: Coming soon...`),
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
            <Grid justify="center" item xs={10} sm={5}>
              <Typography variant="h2">
                <br />
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
                helperText="Current Account Balance: 12345 lamports"
              />
            </Grid>
          </Grid>
        </Container>
        <Container className={classes.summary}>
          <Grid container spacing={1}>
            <Grid item xs>
              <Paper className={classes.paper}>
                <Typography variant="body2">
                  Lamports mined: {this.state.totalMined}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs>
              <Paper className={classes.paper}>
                <Typography variant="body2">
                  Transaction count: {this.state.transactionCount}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs>
              <Paper className={classes.paper}>
                <Typography variant="body2">
                  Total supply: {totalSupplySOL} SOL
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
        <LinearProgress className={classes.progressBar} />
        <ReactTerminal
          theme={{...ReactThemes.default, height: '50'}}
          emulatorState={emulatorState}
          acceptInput={false}
        />
      </div>
    );
  }
}
App.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const StyledApp = withStyles(styles)(App);
export default StyledApp;
