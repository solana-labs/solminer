import React from 'react';
import PropTypes from 'prop-types';
import css from './styles.module.scss';

const Popup = ({ children }) => <div className={css.popup}>{children}</div>;

Popup.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default Popup;
