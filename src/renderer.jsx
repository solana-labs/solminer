import React from 'react';
import { render } from 'react-dom';
import App from 'components/App';
import pkg from '../package.json';

window.document.title = `${pkg.name} ${pkg.version}`;

render(<App />, document.getElementById('root'));
