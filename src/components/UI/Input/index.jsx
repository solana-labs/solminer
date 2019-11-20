import React, { useState } from 'react';
import PropTypes from 'prop-types';
import css from './styles.module.scss';
import CheckIcon from '../../../images/icon/done.svg';
import CrossIcon from '../../../images/icon/errorClose.svg';
import EyeIcon from '../../../images/icon/eye.svg';

const Input = ({ prefix, isSuccess, ...props }) => {
  const [hideValue, setHideValue] = useState(false);
  const handleClick = () => {
    setHideValue(!hideValue);
  };

  return (
    <div className={`${css.root} ${isSuccess ? css.success : css.error}`}>
      {prefix && <div className={css.prefix}>{prefix()}</div>}
      <span onClick={handleClick} className={`${css.icon} ${css.eyeIcon}`}><EyeIcon/></span>
      <input className={css.input} type={`${hideValue? 'password' : 'text'}`} {...props} />
      <span className={css.icon}>{isSuccess ? <CheckIcon/> : <CrossIcon/>}</span>
    </div>
  );
};

Input.propTypes = {
  prefix: PropTypes.func,
  isSuccess: PropTypes.bool,
};

Input.defaultProps = {
  prefix: null,
};

export default Input;