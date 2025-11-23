import * as yup from 'yup';

const RegExpEmail = /(^[a-z][a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/;

export const SignUpSchema = yup.object().shape({
  email: yup
    .string()
    .required('Это поле обязательно!')
    .matches(RegExpEmail, 'Некорректный формат почты'),
  password: yup
    .string()
    .required('Это поле обязательно!')
    .min(5, 'Минимально 5 символов')
    .max(40, 'Максимальная длина 40 символов'),
  repeatPassword: yup
    .string()
    .required('Это поле обязательно!')
    .oneOf([yup.ref('password')], 'Пароли не совпадают'),
});

export const SignInSchema = yup.object().shape({
  email: yup
    .string()
    .required('Это поле обязательно!')
    .matches(RegExpEmail, 'Некорректный формат почты'),
  password: yup
    .string()
    .required('Это поле обязательно!')
    .min(5, 'Минимально 5 символов')
    .max(40, 'Максимальная длина 40 символов'),
});
