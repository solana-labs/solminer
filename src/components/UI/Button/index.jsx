import React from 'react';
import PropTypes from 'prop-types';
import css from './styles.module.scss';

const Button = props => (
  <div className={css.root}>
    <button type="button" className={css.btn} {...props} />
  </div>
);

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string,
  ]).isRequired,
  onClick: PropTypes.func,
};

export default Button;
