import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import App from './app';
import pkg from '../package.json';

window.document.title = `${pkg.name} ${pkg.version}`;

const render = () => {
  ReactDOM.render(
    <AppContainer>
      <App />
    </AppContainer>,
    document.getElementById('App')
  );
};

render();
if (module.hot) {
  module.hot.accept(render);
}
