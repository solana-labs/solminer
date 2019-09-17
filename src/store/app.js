import LocalStore from 'electron-store';
import { action, observable } from 'mobx';

const localStore = new LocalStore();

class AppStore {
  @observable depositPublicKey = localStore.get('depositPublicKey', '');

  @observable screen = 'whatYouNeed';

  @observable alertType = '';

  @observable locale = 'en';

  @observable secretKey = '';

  @observable gb = [20];

  @observable state = 'disabled';

  @action.bound
  setScreen(screen) {
    this.screen = screen;
  }

  @action.bound
  showAlert(alertType) {
    this.alertType = alertType;
  }

  @action.bound
  hideAlert() {
    this.alertType = null;
  }

  @action.bound
  setSecretKey(secretKey) {
    this.secretKey = secretKey;
  }

  @action.bound
  setGB(gb) {
    this.gb = gb;
  }

  @action.bound
  setDepositPublicKey(key) {
    this.depositPublicKey = key;
  }

  @action.bound
  setState(state) {
    this.state = state;
  }
}

const store = new AppStore();

export default store;
