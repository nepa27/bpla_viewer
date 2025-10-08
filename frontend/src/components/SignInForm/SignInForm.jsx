import { yupResolver } from '@hookform/resolvers/yup';

import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { SignInSchema } from '../../helpers/validationSchemas';
import { useAuth } from '../../hooks/useAuth';
import ROUTES from '../../utils/routes';
import Input from '../Input/Input';
import styles from './SignInForm.module.css';

function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {},
    resolver: yupResolver(SignInSchema),
  });

  const [serverErrors, setServerErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, isLoginPending, isFaceLoginPending } = useAuth();

  const fromPage = location.state?.from?.pathname || ROUTES.HOME;

  const [userData, setUserData] = useState(null);

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUserData(parsedUser);
        // Если пользователь уже авторизован, перенаправляем на домашнюю страницу
        navigate(ROUTES.HOME);
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
  }, [navigate]);

  const submitForm = async (data) => {
    try {
      setIsLoading(true);
      setServerErrors(null);

      const authData = {
        email: data.email,
        password: data.password,
      };

      const response = await signIn(authData);

      if (response) {
        toast.success('Вход successful!');
        navigate(fromPage, { replace: true });
      }
    } catch (err) {
      if (err.message) {
        toast.error(`Ошибка: ${err.message}`);
      } else {
        toast.error('Ошибка входа');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className={styles.section}>
      <form
        className={`${styles.form} ${styles.formContainer}`}
        action=""
        onSubmit={handleSubmit(submitForm)}
      >
        <span className={styles.title}>Войти в систему</span>

        <Input
          type="email"
          label="Email адрес"
          autoComplete="email"
          containerClass={styles.inputContainer}
          {...register('email')}
          error={serverErrors?.errors?.email || errors.email?.message}
        />

        <Input
          type="password"
          label="Пароль"
          autoComplete="password"
          containerClass={styles.inputContainer}
          error={serverErrors?.errors?.password || errors.password?.message}
          {...register('password')}
        />

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || isLoginPending || isFaceLoginPending}
        >
          {isLoading || isLoginPending || isFaceLoginPending ? 'Вход...' : 'Войти'}
        </button>

        <span className={styles.footerText}>
          Нет аккаунта?&nbsp;
          <Link to={ROUTES.SIGN_UP} className={styles.link}>
            Зарегистрироваться.
          </Link>
        </span>
      </form>

      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable={false}
        pauseOnHover
        theme="colored"
        toastClassName={styles.toast}
        bodyClassName={styles.toastBody}
        progressClassName={styles.toastProgress}
      />
    </section>
  );
}

export default SignInForm;
