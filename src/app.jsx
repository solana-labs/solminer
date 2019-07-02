import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import LinearProgress from '@material-ui/core/LinearProgress';
import InputAdornment from '@material-ui/core/InputAdornment';
import PropTypes from 'prop-types';
import React from 'react';
import Slider from '@material-ui/lab/Slider';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import log from 'electron-log';
import {Connection, PublicKey} from '@solana/web3.js';
import {EmulatorState, OutputFactory, Outputs} from 'javascript-terminal';
import {ReactThemes, ReactTerminal} from 'react-terminal-component';
import {withStyles} from '@material-ui/core/styles';
import Store from 'electron-store';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';

import {url} from './url';
import {Replicator} from './replicator';

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
  iconButton: {
    padding: 10,
  },
  storageSlider: {
    marginTop: theme.spacing(5),
  },
  progressBar: {
    marginTop: theme.spacing(2),
  },
  footer: {
    marginTop: theme.spacing(1),
    backgroundColor: 'lightgray',
  },
});

function isValidPublicKey(publicKey) {
  return (
    typeof publicKey === 'string' &&
    publicKey.length === 44 &&
    publicKey.match(/^[A-Za-z0-9]+$/)
  );
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.terminalHeight = 25;
    this.store = new Store();
    this.depositPublicKey = this.store.get('depositPublicKey', '');

    this.state = {
      transactionCount: 0,
      totalMined: this.store.get('totalMined', 0),
      newMined: 0,
      totalSupply: 0,
      enabled: this.store.get('enabled', false),
      unsavedDepositPublicKey: this.depositPublicKey,
      unsavedDepositPublicKeyValid: isValidPublicKey(this.depositPublicKey),
      unsavedDepositPublicKeySavePrompt: false,
      depositPublicKeyBalance: ' ',
    };
    this.connection = new Connection(url);
    log.info('connection:', url);

    this.clearTerminal();
    this.addTerminalText(`Cluster entrypoint: ${url}...`);

    this.replicator = new Replicator(this.connection, this);
    if (this.state.enabled) {
      this.replicator.start();
    } else {
      this.addTerminalText('Mining disabled');
    }
  }

  componentDidMount() {
    this.updateClusterStats();
    this.id = setInterval(() => this.updateClusterStats(), 10000);
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
    log.info('term$ ', command);
    this.terminalOutputs = Outputs.addRecord(
      this.terminalOutputs,
      OutputFactory.makeHeaderOutput('', command),
    );
    this.trimTerminalOutput();
  }

  addTerminalText(text) {
    text.split('\n').forEach(line => {
      log.info('term> ', line);
      this.terminalOutputs = Outputs.addRecord(
        this.terminalOutputs,
        OutputFactory.makeTextOutput(line),
      );
    });
    this.trimTerminalOutput();
  }

  addTerminalError(errorMessage) {
    errorMessage.split('\n').forEach(line => {
      log.info('TERM> ', line);
      this.terminalOutputs = Outputs.addRecord(
        this.terminalOutputs,
        OutputFactory.makeErrorOutput({source: 'error', type: line}),
      );
    });
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
    this.replicator.clusterRestart();
    this.setState({
      transactionCount: 0,
    });
    setTimeout(() => this.updateClusterStats());
  }

  async updateClusterStats() {
    try {
      const transactionCount = await this.connection.getTransactionCount();

      if (transactionCount < this.state.transactionCount / 2) {
        this.addTerminalText(
          `Transaction count decreased from ${this.state.transactionCount} to ${transactionCount}`,
        );
        this.clusterRestart();
        return;
      }

      const totalSupply = await this.connection.getTotalSupply();
      const newMined = await this.replicator.adjustedReplicatorBalance();
      let totalMined = this.state.totalMined;

      if (newMined > this.store.get('depositMinimumLamports', 10000)) {
        if (isValidPublicKey(this.depositPublicKey)) {
          this.replicator.depositMiningRewards(
            new PublicKey(this.depositPublicKey),
            newMined,
          );
          totalMined += newMined;
          this.store.set('totalMined', totalMined);
        }
      }

      let depositPublicKeyBalance = ' ';
      if (isValidPublicKey(this.depositPublicKey)) {
        try {
          const balance = await this.connection.getBalance(
            new PublicKey(this.depositPublicKey),
          );
          depositPublicKeyBalance = `Account Balance: ${balance} lamports`;
        } catch (err) {
          log.warn(
            `Unable to getBalance of ${this.depositPublicKey}: ${err.message}`,
          );
        }
      }

      this.setState({
        newMined,
        totalMined,
        totalSupply,
        transactionCount,
        depositPublicKeyBalance,
      });
    } catch (err) {
      log.error('updateClusterStats failed', err);
      this.addTerminalError(`updateClusterStats failed: ${err.message}`);
    }
  }

  onEnabledSwitch = event => {
    const enabled = event.target.checked;
    this.store.set('enabled', enabled);
    this.setState({enabled});
    if (enabled) {
      this.replicator.start();
    } else {
      this.replicator.stop();
    }
  };

  onDepositAccountChange = event => {
    log.info('onDepositAccountChange:', event.target.value);

    const unsavedDepositPublicKey = event.target.value;
    const unsavedDepositPublicKeyValid = isValidPublicKey(
      unsavedDepositPublicKey,
    );
    const unsavedDepositPublicKeySavePrompt =
      unsavedDepositPublicKeyValid &&
      unsavedDepositPublicKey !== this.depositPublicKey;

    this.setState({
      unsavedDepositPublicKey,
      unsavedDepositPublicKeyValid,
      unsavedDepositPublicKeySavePrompt,
    });

    this.updateClusterStats();
  };

  onDepositAccountSave = () => {
    log.info('onDepositAccountSave');
    const {
      unsavedDepositPublicKey,
      unsavedDepositPublicKeySavePrompt,
    } = this.state;

    if (!unsavedDepositPublicKeySavePrompt) {
      return;
    }

    this.store.set('depositPublicKey', unsavedDepositPublicKey);
    this.depositPublicKey = unsavedDepositPublicKey;
    this.setState({
      unsavedDepositPublicKey,
      unsavedDepositPublicKeySavePrompt: false,
      depositPublicKeyBalance: ' ',
    });
  };

  onDepositAccountKeyDown = event => {
    if (event.keyCode === 13) {
      this.onDepositAccountSave();
    }
  };

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
              <FormGroup row>
                <FormControlLabel
                  control={
                    <Switch
                      checked={this.state.enabled}
                      onChange={this.onEnabledSwitch}
                      color="primary"
                    />
                  }
                  label="Enable"
                />
              </FormGroup>
              <p />
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
                error={!this.state.unsavedDepositPublicKeyValid}
                placeholder="Account Public Key"
                className={classes.publicKeyTextField}
                onChange={this.onDepositAccountChange}
                value={this.state.unsavedDepositPublicKey}
                onKeyDown={this.onDepositAccountKeyDown}
                margin="normal"
                helperText={
                  this.state.unsavedDepositPublicKeyValid
                    ? this.state.depositPublicKeyBalance
                    : 'Enter a valid account public key'
                }
                InputProps={{
                  /* eslint-disable indent */
                  endAdornment: this.state.unsavedDepositPublicKeySavePrompt ? (
                    /* eslint-disable react/jsx-indent */
                    <InputAdornment position="end">
                      <IconButton
                        color="primary"
                        aria-label="Save"
                        onClick={this.onDepositAccountSave}
                      >
                        <SaveIcon />
                      </IconButton>
                    </InputAdornment>
                  ) : /* eslint-enable react/jsx-indent */
                  null,
                  /* eslint-enable indent */
                }}
              />
            </Grid>
          </Grid>
        </Container>
        <footer className={classes.footer}>
          <Container className={classes.summary}>
            <Grid container spacing={1}>
              <Grid item xs>
                <Typography variant="caption" noWrap>
                  Total Lamports mined: {this.state.totalMined}
                </Typography>
              </Grid>
              <Grid item xs>
                <Typography variant="caption" noWrap>
                  Recently mined Lamports: {this.state.newMined}
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
          <LinearProgress
            variant={this.state.enabled ? 'indeterminate' : 'determinate'}
            value={100}
            className={classes.progressBar}
          />
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
