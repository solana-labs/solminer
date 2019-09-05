import { shell } from 'electron';
import React from 'react';
import cn from 'classnames';
import PropTypes from 'prop-types';
import Squares from '../UI/Squares';
import css from './styles.module.scss';
import arrowIcon from '../../images/arrow-right.png';
import { useTranslation } from 'react-i18next';

const CreateWalletBtn = ({ horizontal = false }) => {
  const { t } = useTranslation();
  const openLink = e => {
    e.preventDefault();
    shell.openExternal('https://solana-example-webwallet.herokuapp.com/');
  };
  return (
    <>
      <div className={cn(css.root, { [css.horizontal]: horizontal })}>
        <div>{t('no_wallet')}</div>
        <button type="button" onClick={openLink}>
          <div>{t('create_new_wallet')}</div>
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
