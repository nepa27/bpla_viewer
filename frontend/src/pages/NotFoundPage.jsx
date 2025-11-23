import ErrorDisplay from '../components/ErrorDisplay/ErrorDisplay';
import ROUTES from '../utils/routes';

const NotFoundPage = () => {
  return (
    <ErrorDisplay
      errorCode="404"
      errorMessage="Страница не найдена"
      errorSubmessage="Кажется, вы заблудились в космосе"
      buttonText="Вернуться на главную"
      linkTo={ROUTES.HOME}
    />
  );
};

export default NotFoundPage;
