import { useNavigate } from 'react-router-dom';

import ROUTES from '../utils/routes';

const ButtonGoBack = () => {
  const navigate = useNavigate();

  return (
    <button type="button" className="go-back-button" onClick={() => navigate(`${ROUTES.REGIONS}`)}>
      ← НАЗАД
    </button>
  );
};

export default ButtonGoBack;
