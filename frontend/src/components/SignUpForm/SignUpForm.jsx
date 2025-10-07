import { yupResolver } from '@hookform/resolvers/yup';

import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { SignUpSchema } from '../../helpers/validationSchemas';
import ROUTES from '../../utils/routes';
import Input from '../Input/Input';
import styles from './SignUpForm.module.css';

// Функция для шифрования (замените на вашу реализацию)
const encryptData = async (data) => {
  // Замените на вашу реализацию шифрования
  return JSON.stringify(data);
};

function SignUpForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {},
    resolver: yupResolver(SignUpSchema),
  });
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

      // Здесь делается запрос на регистрацию
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        if (result.errors) {
          toast.error(result.errors.message || 'Ошибка регистрации');
          setServerErrors(result);
        } else {
          toast.error('Ошибка регистрации');
        }
        return;
      }

      if (result.user) {
        // Шифруем и сохраняем данные пользователя
        try {
          const encryptedData = await encryptData(result.user);
          localStorage.setItem('user', encryptedData);
          setUserData(result.user);
          toast.success('Регистрация успешна!');
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
        onSubmit={handleSubmit(submitForm)}
      >
        <span className={styles.title}>Создать аккаунт</span>

        <Input
          type="text"
          label="Имя пользователя"
          autoComplete="username"
          containerClass={styles.inputContainer}
          error={serverErrors?.errors?.username || errors.username?.message}
          {...register('username')}
        />

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
          autoComplete="new-password"
          containerClass={styles.inputContainer}
          {...register('password')}
          error={serverErrors?.errors?.password || errors.password?.message}
        />

        <Input
          type="password"
          label="Повторите пароль"
          autoComplete="new-password"
          containerClass={styles.inputContainer}
          {...register('repeatPassword')}
          error={errors.repeatPassword?.message}
        />

        <hr className={styles.divider} />

        <Input
          {...register('agreement')}
          type="checkbox"
          value
          autoComplete="off"
          containerClass={styles.checkboxContainer}
          label={
            <span>
              Я согласен с <a href="/privacy">обработкой персональных данных</a>
            </span>
          }
          error={errors.agreement?.message}
        />

        <button type="submit" className={styles.submitButton} disabled={isLoading}>
          {isLoading ? 'Регистрация...' : 'Создать аккаунт'}
        </button>

        <span className={styles.footerText}>
          Уже есть аккаунт?&nbsp;
          <Link to={ROUTES.SIGN_IN} className={styles.link}>
            Войти.
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

export default SignUpForm;
