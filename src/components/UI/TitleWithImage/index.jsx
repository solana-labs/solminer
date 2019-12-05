import React from 'react';
import { Typography } from 'components/UI';
import PropTypes from 'prop-types';
import css from './styles.module.scss';
import SquaresLogo from '../../../images/icon/squares.svg';

const TitleWithImage = ({ title }) => {

  return (
    <div className={css.titleWrap}>
      <div className={css.titleImg}>
        <SquaresLogo />
      </div>
      <Typography className={`${css.title}`} type="title">
        {`${title}`}
      </Typography>
    </div>
  );
};

TitleWithImage.propTypes = {
  title: PropTypes.string,
};

export default TitleWithImage;