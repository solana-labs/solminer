import React from 'react';
import { render } from 'react-dom';
import App from 'components/App';
import pkg from '../package.json';
import './styles/index.scss';
import './i18n/index';

window.document.title = `${pkg.name} ${pkg.version}`;

render(<App />, document.getElementById('root'));
