import React from 'react';
import PropTypes from 'prop-types';
import { RangeSlider } from 'components/UI';
import { MAX_LEDGER_STORAGE_GB, MIN_LEDGER_STORAGE_GB } from '../../constants';
import css from './styles.module.scss';

const GBSlider = props => {
  const { values } = props;
  return (
    <>
      <div className={css.gigabites}>
        <span>{values}</span>
        <sup>gb</sup>
      </div>
      <div className={css.slider}>
        <RangeSlider
          min={MIN_LEDGER_STORAGE_GB}
          max={MAX_LEDGER_STORAGE_GB}
          {...props}
        />
        <div className={css.sliderFooter}>
          <div>
            <span>{MIN_LEDGER_STORAGE_GB}</span>
            <span>GB</span>
          </div>
          <div>
            <span>{MAX_LEDGER_STORAGE_GB}</span>
            <span>GB</span>
          </div>
        </div>
      </div>
    </>
  );
};

GBSlider.propTypes = {
  values: PropTypes.arrayOf(PropTypes.number),
};

export default GBSlider;
