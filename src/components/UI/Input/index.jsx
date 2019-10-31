import React from 'react';
import PropTypes from 'prop-types';
import css from './styles.module.scss';
import CheckIcon from '../../../images/icon/done.svg';
import CrossIcon from '../../../images/icon/errorClose.svg';

const Input = ({ prefix, isSuccess, ...props }) => {
  return (
    <div className={`${css.root} ${isSuccess ? css.success : css.error}`}>
      {prefix && <div className={css.prefix}>{prefix()}</div>}
      <input className={css.input} type="text" {...props} />
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
