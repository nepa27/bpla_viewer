import { yupResolver } from '@hookform/resolvers/yup';

import { useEffect, useState } from 'react';

import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';

import { SignUpSchema } from '../../helpers/validationSchemas';
import { useAuth } from '../../hooks/useAuth';
import ROUTES from '../../utils/routes';
import Input from '../Input/Input';
import styles from './SignUpForm.module.css';

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
  const { auth, isSignupPending } = useAuth();

  // Проверка авторизации при загрузке
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
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

      const userData = {
        // username: data.username,
        email: data.email,
        password: data.password,
      };

      const response = await auth(userData);

      if (response) {
        toast.success('Регистрация успешна!');
        navigate(ROUTES.SIGN_IN);
      }
    } catch (err) {
      if (err.message) {
        toast.error(`Ошибка: ${err.message}`);
      } else {
        toast.error('Ошибка регистрации');
      }
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

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isLoading || isSignupPending}
        >
          {isLoading || isSignupPending ? 'Регистрация...' : 'Создать аккаунт'}
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
        theme="colored"
        toastClassName={styles.toast}
        bodyClassName={styles.toastBody}
        progressClassName={styles.toastProgress}
      />
    </section>
  );
}

export default SignUpForm;
