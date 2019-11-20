import React, { useState } from 'react';
import PropTypes from 'prop-types';
import css from './styles.module.scss';
import EyeIcon from '../../../images/icon/eye.svg';

const Input = ({ prefix, ...props }) => {
  const [hideValue, setHideValue] = useState(false);
  const handleClick = () => {
    setHideValue(!hideValue);
  };

  return (
    <div className={css.root}>
      {prefix && <div className={css.prefix}>{prefix()}</div>}
      <span onClick={handleClick} className={`${css.icon} ${css.eyeIcon}`}><EyeIcon/></span>
      <input className={css.input} type={`${hideValue? 'password' : 'text'}`} {...props} />
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