import * as yup from 'yup';

const RegExpEmail = /(^[a-z][a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$)/;
const RegExpUser = /^[a-zA-ZА-Яа-я0-9]+$/;

export const SignUpSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required('Это поле обязательно!')
    .matches(RegExpUser, 'Можно использовать только русские и латинские буквы и цифры')
    .min(3, 'Минимально 3 символа')
    .max(25, 'Максимальная длина 25 символов'),
  email: yup
    .string()
    .required('Это поле обязательно!')
    .matches(RegExpEmail, 'Некорректный формат почты'),
  password: yup
    .string()
    .required('Это поле обязательно!')
    .min(6, 'Минимально 6 символов')
    .max(40, 'Максимальная длина 40 символов'),
  repeatPassword: yup
    .string()
    .required('Это поле обязательно!')
    .oneOf([yup.ref('password')], 'Пароли не совпадают'),
  agreement: yup
    .boolean()
    .oneOf([true], 'Необходимо согласиться, чтобы продолжить')
    .required('Необходимо согласиться, чтобы продолжить'),
});

export const SignInSchema = yup.object().shape({
  email: yup
    .string()
    .required('Это поле обязательно!')
    .matches(RegExpEmail, 'Некорректный формат почты'),
  password: yup
    .string()
    .required('Это поле обязательно!')
    .min(6, 'Минимально 6 символов')
    .max(40, 'Максимальная длина 40 символов'),
});
