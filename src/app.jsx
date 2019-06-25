/* eslint no-console: "off" */
import React from 'react';
import {Connection} from '@solana/web3.js';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import {url} from './url';

const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  main: {
    marginTop: theme.spacing(8),
    marginBottom: theme.spacing(2),
  },
  footer: {
    padding: theme.spacing(2),
    marginTop: 'auto',
    backgroundColor: 'white',
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
  },
});

const connection = new Connection(url);
console.log('connection:', url);

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
      console.log('updateTransactionCount failed', err);
    }
  }

  render() {
    const {classes} = this.props;

    // eslint-disable-next-line no-restricted-properties
    const totalSupplySOL = (this.state.totalSupply / Math.pow(2, 34)).toFixed(
      2,
    );
    return (
      <div>
        <div className={classes.root}>
          <CssBaseline />
          <Container component="main" className={classes.main} maxWidth="sm">
            <Typography variant="h2" component="h1" gutterBottom>
              <span role="img" aria-label="pick">
                ⛏️
              </span>{' '}
              SolMiner
            </Typography>
            <Typography variant="h5" component="h2" gutterBottom>
              Coming soon...
            </Typography>
          </Container>
          <footer className={classes.footer}>
            <Grid container spacing={2}>
              <Grid item xs>
                <Paper className={classes.paper}>
                  <Typography>
                    Total mined: {this.state.totalMined} lamports
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs>
                <Paper className={classes.paper}>
                  <Typography>
                    Total transactions: {this.state.transactionCount}
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs>
                <Paper className={classes.paper}>
                  <Typography>Total supply: {totalSupplySOL} SOL</Typography>
                </Paper>
              </Grid>
            </Grid>
          </footer>
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
