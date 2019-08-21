import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormGroup from '@material-ui/core/FormGroup';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import PropTypes from 'prop-types';
import React from 'react';
import Slider from '@material-ui/core/Slider';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import log from 'electron-log';
import {Connection, PublicKey} from '@solana/web3.js';
import {withStyles} from '@material-ui/core/styles';
import Store from 'electron-store';
import IconButton from '@material-ui/core/IconButton';
import SaveIcon from '@material-ui/icons/Save';
import autoscroll from 'autoscroll-react';
import {Hook, Console, Decode} from 'console-feed';

import {url} from './url';
import {Replicator} from './replicator';

const styles = theme => ({
  root: {
    height: '100%',
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

class LogConsole extends React.Component {
  render() {
    return (
      <div
        style={{
          backgroundColor: '#242424',
          height: '470px',
          overflowX: 'scroll',
          overflowY: 'hidden',
        }}
      >
        <div style={{width: '1000%'}}>
          <Console logs={this.props.logs} variant="dark" />
        </div>
      </div>
    );
  }
}
LogConsole.propTypes = {
  logs: PropTypes.array.isRequired, // eslint-disable-line react/forbid-prop-types
};

// eslint-disable-next-line react/no-multi-comp
class App extends React.Component {
  constructor(props) {
    super(props);
    this.terminalHeight = 10;
    this.store = new Store();
    this.depositPublicKey = this.store.get('depositPublicKey', '');

    this.state = {
      transactionCount: 0,
      totalMined: this.store.get('totalMined', 0),
      newMined: 0,
      logs: [],
      totalSupply: 0,
      enabled: this.store.get('enabled', true),
      unsavedDepositPublicKey: this.depositPublicKey,
      unsavedDepositPublicKeyValid: isValidPublicKey(this.depositPublicKey),
      unsavedDepositPublicKeySavePrompt: false,
      depositPublicKeyBalance: ' ',
      // TODO: Make 10000 configurable by the user.  Smaller values will cause
      // the user to pay more transaction fees.  Also consider adding logic to
      // monitor the current cluster fees and redeem when fees are low
      depositMinimumLamports: this.store.get('depositMinimumLamports', 10000),
    };
  }

  componentDidMount() {
    Hook(console, newLog => {
      const decodeLog = Decode(newLog);
      log.info('term:', decodeLog.data[0]);
      const {logs} = this.state;
      logs.push(decodeLog);
      const max = 20;
      if (logs.length > max) {
        logs.splice(0, logs.length - max);
      }
      this.setState({logs});
    });
    this.connection = new Connection(url);

    this.clearTerminal();
    log.info(`Cluster entrypoint: ${url}...`);

    this.replicator = new Replicator(this.connection);
    if (this.state.enabled) {
      this.replicator.start();
    } else {
      console.warn('Mining disabled');
    }

    this.updateClusterStats();
    this.id = setInterval(() => this.updateClusterStats(), 10000);
  }

  componentWillUnmount() {
    clearInterval(this.id);
  }

  clearTerminal() {
    this.setState({logs: []});
  }

  clusterRestart() {
    console.warn(`Cluster restart detected at ${new Date()}`);
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
        console.warn(
          `Transaction count decreased from ${this.state.transactionCount} to ${transactionCount}`,
        );
        this.clusterRestart();
        return;
      }

      const totalSupply = await this.connection.getTotalSupply();
      const newMined = await this.replicator.adjustedReplicatorBalance();
      let totalMined = this.state.totalMined;

      if (newMined > this.state.depositMinimumLamports) {
        if (isValidPublicKey(this.depositPublicKey)) {
          const success = await this.replicator.depositMiningRewards(
            new PublicKey(this.depositPublicKey),
            newMined,
          );
          if (success) {
            totalMined += newMined;
            this.store.set('totalMined', totalMined);
          }
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
      log.warn('updateClusterStats failed', err);
    }
  }

  onEnabledSwitch = event => {
    const enabled = event.target.checked;
    this.store.set('enabled', enabled);
    this.setState({enabled});
    if (enabled) {
      this.clearTerminal();
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

    const AutoscrollLogConsole = autoscroll(LogConsole, {
      isScrolledDownThreshold: 0,
    });

    // eslint-disable-next-line no-restricted-properties
    const totalSupplySOL = (this.state.totalSupply / Math.pow(2, 34)).toFixed(
      2,
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
                  label="Enabled"
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
                Deposit rewards into this account every{' '}
                {this.state.depositMinimumLamports} lamports mined:
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
        <div className={classes.footer}>
          <Container className={classes.summary}>
            <Grid container spacing={1}>
              <Grid item xs>
                <Typography variant="caption" noWrap>
                  Recently mined Lamports: {this.state.newMined}
                </Typography>
              </Grid>
              <Grid item xs>
                <Typography variant="caption" noWrap>
                  Total mined Lamports:{' '}
                  {this.state.totalMined + this.state.newMined}
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
          <AutoscrollLogConsole logs={this.state.logs} variant="dark" />
        </div>
      </div>
    );
  }
}

App.propTypes = {
  classes: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
};

const StyledApp = withStyles(styles)(App);
export default StyledApp;
