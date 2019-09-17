import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';
import './styles.scss';
import useOnClickOutside from 'use-onclickoutside';
import css from './styles.module.scss';
import Popup from './Popup';

const ToggleContent = ({ toggle, content }) => {
  const node = useRef(null);
  const [isShown, setIsShown] = useState(false);
  const hide = () => setIsShown(false);
  const toggleShown = () => setIsShown(!isShown);
  useOnClickOutside(node, hide);
  return (
    <div ref={node} className={css.wrap}>
      <div>{toggle(toggleShown, isShown)}</div>
      <CSSTransition
        classNames="opacity"
        timeout={200}
        unmountOnExit
        in={isShown}
      >
        <Popup hide={hide}>{content(hide)}</Popup>
      </CSSTransition>
    </div>
  );
};

ToggleContent.propTypes = {
  toggle: PropTypes.func.isRequired,
  content: PropTypes.func.isRequired,
};

export default ToggleContent;
