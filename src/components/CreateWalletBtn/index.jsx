import { shell } from 'electron';
import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import css from './styles.module.scss';
import arrowIcon from '../../images/arrow-right.png';

const CreateWalletBtn = ({ horizontal = false }) => {
  const openLink = e => {
    e.preventDefault();
    shell.openExternal('https://solana.com/');
  };
  return (
    <>
      <div className={cn(css.root, { [css.horizontal]: horizontal })}>
        <div>Don&apos;t have a wallet?</div>
        <button type="button" onClick={openLink}>
          <div>Create a new wallet now</div>
          <img src={arrowIcon} alt="" />
        </button>
      </div>
    </>
  );
};

CreateWalletBtn.propTypes = {
  horizontal: PropTypes.bool,
};

export default CreateWalletBtn;
