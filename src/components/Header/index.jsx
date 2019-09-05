import React from 'react';
import { Logo } from 'components/UI';
import { AppStore } from '../../store';
import ToggleContent from '../ToogleContent';
import css from './styles.module.scss';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const { setScreen, screen } = AppStore;
  const handleChange = hide => () => {
    setScreen('change');
    hide();
  };
  const handleStored = hide => () => {
    setScreen('stored');
    hide();
  };
  const isShowMenu = ['mining', 'change', 'stored'].includes(screen);
  return (
    <header className={css.header}>
      <Logo />
      {isShowMenu && (
        <ToggleContent
          toggle={toggleShown => (
            <div onClick={toggleShown} className={css.headerMenu}>
              4553.....5684
            </div>
          )}
          content={hide => (
            <div className={css.popup}>
              <button type="button" onClick={handleChange(hide)}>
                {t('change_wallet')}
              </button>
              <button type="button" onClick={handleStored(hide)}>
                {t('stored_ledger')}
              </button>
            </div>
          )}
        />
      )}
    </header>
  );
};

export default Header;
