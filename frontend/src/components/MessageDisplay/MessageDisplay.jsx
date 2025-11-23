import { useCallback } from 'react';

import styles from './MessageDisplay.module.css';

const MessageDisplay = ({
  message = 'Нет данных для отображения',
  title = 'Ошибка',
  submessage = 'Произошла ошибка',
  buttonText = 'Перезагрузить страницу',
  linkTo = '/',
  showIcon = true,
  icon = '⚠️',
  children,
  onReload,
}) => {
  const handleReload = useCallback(() => {
    if (onReload) {
      onReload();
    } else {
      // Перезагрузка текущей страницы
      window.location.reload();
    }
  }, [onReload]);

  return (
    <div className={styles.messageContainer}>
      <div className={styles.messageContent}>
        {showIcon && <div className={styles.messageIcon}>{icon}</div>}
        <div className={styles.messageTitle}>{title}</div>
        <div className={styles.messageSubmessage}>{message}</div>

        <div className={styles.messageActions}>
          <button onClick={handleReload} className={styles.backButton}>
            {buttonText}
          </button>
          <div className={styles.helpText}>Возможно, вы искали другие данные?</div>
        </div>

        {children && <div className={styles.messageChildren}>{children}</div>}
      </div>
    </div>
  );
};

export default MessageDisplay;
