import React from 'react';
import PropTypes from 'prop-types';
import { Range } from 'react-range';
import css from './styles.module.scss';

const RangeSlider = rangeProps => {
  return (
    <Range
      renderTrack={({ props, children }) => (
        <div className={css.track} {...props}>
          {children}
        </div>
      )}
      renderThumb={({ props }) => <div className={css.thumb} {...props} />}
      {...rangeProps}
    />
  );
};

RangeSlider.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default RangeSlider;
