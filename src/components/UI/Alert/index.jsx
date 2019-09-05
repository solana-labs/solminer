import React from 'react';
import cn from 'classnames';
import { observer } from 'mobx-react-lite';
import PropTypes from 'prop-types';
import { AppStore } from 'store';
import CloseIcon from '../../../images/icon/close.svg';
import ErrorIcon from '../../../images/icon/error.svg';
import css from './styles.module.scss';

const icons = {
  error: <ErrorIcon />,
};

const Alert = ({ children, type }) => {
  const { hideAlert } = AppStore;
  return (
    <div className={css.root}>
      <div className={cn(css.body, css[type])}>
        <span className={css.icon}>{icons[type]}</span>
        {children}
      </div>
      <button type="button" className={css.close} onClick={hideAlert}>
        <CloseIcon width={19} height={19} fill="#fff" />
      </button>
    </div>
  );
};

Alert.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
  type: PropTypes.string,
};

export default observer(Alert);
