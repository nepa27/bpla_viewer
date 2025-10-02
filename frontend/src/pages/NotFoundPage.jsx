import { Link } from 'react-router-dom';

import ROUTES from '../utils/routes';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
  return (
    <div className={styles.notFoundContainer}>
      <div className={styles.notFoundContent}>
        <div className={styles.notFoundAnimation}>
          <div className={styles.errorCode}>404</div>
          <div className={styles.errorMessage}>Страница не найдена</div>
          <div className={styles.errorSubmessage}>Кажется, вы заблудились в космосе</div>
        </div>

        <div className={styles.notFoundIllustration}>
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

        <div className={styles.notFoundActions}>
          <Link to={ROUTES.HOME} className={styles.backButton}>
            Вернуться к карте
          </Link>
          <div className={styles.helpText}>Возможно, вы искали другие данные?</div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
