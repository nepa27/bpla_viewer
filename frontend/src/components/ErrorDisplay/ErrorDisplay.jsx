import { Link } from 'react-router-dom';

import styles from './ErrorDisplay.module.css';

const ErrorDisplay = ({
  errorCode = '404',
  errorMessage = 'Ошибка',
  errorSubmessage = 'Произошла ошибка',
  buttonText = 'Вернуться к карте',
  linkTo = '/',
  showSpaceship = true,
}) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <div className={styles.errorAnimation}>
          <div className={styles.errorCode}>{errorCode}</div>
          <div className={styles.errorMessage}>{errorMessage}</div>
          <div className={styles.errorSubmessage}>{errorSubmessage}</div>
        </div>

        {showSpaceship && (
          <div className={styles.errorIllustration}>
            <div className={styles.spaceship}>
              <div className={styles.spaceshipBody}></div>
              <div className={`${styles.spaceshipWing} ${styles.leftWing}`}></div>
              <div className={`${styles.spaceshipWing} ${styles.rightWing}`}></div>
              <div className={styles.spaceshipWindow}></div>
            </div>
            <div className={styles.stars}>
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className={styles.star}
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 3}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.errorActions}>
          <Link to={linkTo} className={styles.backButton}>
            {buttonText}
          </Link>
          <div className={styles.helpText}>Возможно, вы искали другие данные?</div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
