import { useNavigate } from 'react-router-dom';

const ButtonGoBack = () => {
  const navigate = useNavigate();

  return (
    <button type="button" className="go-back-button" onClick={() => navigate(-1)}>
      ← НАЗАД
    </button>
  );
};

export default ButtonGoBack;
