import { yupResolver } from '@hookform/resolvers/yup';

import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { SignInSchema } from '../../helpers/validationSchemas';
import ROUTES from '../../utils/routes';
import Input from '../Input/Input';
import styles from './SignInForm.module.css';

// Функция для шифрования (замените на вашу реализацию)
const encryptData = async (data) => {
  // Замените на вашу реализацию шифрования
  return JSON.stringify(data);
};

function SignInForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: yupResolver(SignInSchema) });
  const [serverErrors, setServerErrors] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
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

      // Здесь делается запрос на вход
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          toast.error(result.errors.message || 'Ошибка входа');
          setServerErrors(result);
        } else {
          toast.error('Ошибка входа');
        }
        return;
      }

      if (result.user) {
        // Шифруем и сохраняем данные пользователя
        try {
          const encryptedData = await encryptData(result.user);
          localStorage.setItem('user', encryptedData);
          setUserData(result.user);
          toast.success('Вход успешен!');
          navigate(ROUTES.HOME);
        } catch (encryptError) {
          toast.error('Ошибка сохранения данных пользователя');
        }
      }
    } catch (err) {
      toast.error(`Ошибка: ${err.message || err}`);
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

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Вход...' : 'Войти'}
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
        theme="light"
      />
    </section>
  );
}

export default SignInForm;
