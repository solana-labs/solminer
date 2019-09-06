import React from 'react';
import BaseSwitch from 'react-switch';
import PropTypes from 'prop-types';
import css from './styles.module.scss';

const Switch = ({ label, ...props }) => (
  <label className={css.root}>
    {label && <span>{label}</span>}
    <BaseSwitch
      onColor="#00ffad"
      offHandleColor="#fff"
      onHandleColor="#000"
      handleDiameter={22}
      activeBoxShadow="none"
      width={60}
      height={28}
      checkedIcon={false}
      uncheckedIcon={false}
      className={css.switch}
      {...props}
    />
  </label>
);

Switch.propTypes = {
  label: PropTypes.string,
};

export default Switch;
