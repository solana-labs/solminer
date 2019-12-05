import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import css from './styles.module.scss';

const Button = ({ disabled, small, ...props }) => (
  <div className={cn(css.root, { [css.disabled]: disabled })}>
    <button type="button" className={`${css.btn} ${small? css.small : css.long}`} {...props} disabled={disabled} />
  </div>
);

Button.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element.isRequired,
    PropTypes.string,
  ]).isRequired,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  small: PropTypes.bool,
};

export default Button;