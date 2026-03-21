export const EMPTY_FORM = {
  first_name: '',
  last_name: '',
  position: '',
  email: '',
  password: '',
};

export type FormKey = keyof typeof EMPTY_FORM;
export type FormErrors = Partial<Record<FormKey, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validate = (form: typeof EMPTY_FORM): FormErrors => {
  const e: FormErrors = {};

  if (!form.last_name.trim()) {
    e.last_name = 'Введите фамилию';
  }

  if (!form.first_name.trim()) {
    e.first_name = 'Введите имя';
  }

  if (!form.email.trim()) {
    e.email = 'Введите почту';
  } else if (!EMAIL_RE.test(form.email)) {
    e.email = 'Некорректный email';
  }

  if (!form.password) {
    e.password = 'Введите пароль';
  } else if (form.password.length < 8) {
    e.password = 'Минимум 8 символов';
  }

  return e;
};
