import { useNavigate } from 'react-router-dom';

import ROUTES from '../../utils/routes';
import style from './ButtonGoBack.module.css';

const ButtonGoBack = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      className={style['go-back-button']}
      onClick={() => navigate(`${ROUTES.REGIONS}`)}
    >
      ← НАЗАД
    </button>
  );
};

export default ButtonGoBack;
