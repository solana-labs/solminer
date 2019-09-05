import React from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import './styles.scss';
import css from './styles.module.scss';

const Typography = ({type = 'text', as: Component = 'div', className, ...props}) => (
  <Component className={cn(css.root, css[type], className)} {...props} />
);

Typography.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  as: PropTypes.string,
};

Typography.defaultProps = {
  type: 'text',
  className: '',
  as: 'div',
};

export default Typography;
