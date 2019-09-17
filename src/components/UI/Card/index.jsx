import React from 'react';
import PropTypes from 'prop-types';
import css from './styles.module.scss';

const Card = ({ children }) => <div className={css.root}>{children}</div>;

Card.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default Card;
