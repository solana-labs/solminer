import React from 'react';
import PropTypes from 'prop-types';
import css from './styles.module.scss';

const Input = ({ prefix, ...props }) => {
  return (
    <div className={css.root}>
      {prefix && <div className={css.prefix}>{prefix()}</div>}
      <input className={css.input} type="text" {...props} />
    </div>
  );
};

Input.propTypes = {
  prefix: PropTypes.func,
};
Input.defaultProps = {
  prefix: null,
};

export default Input;
