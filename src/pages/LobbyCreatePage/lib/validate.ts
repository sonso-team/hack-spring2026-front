export const validate = (name: string, gameOverText: string): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!name.trim()) {
    errors.name = 'Обязательное поле';
  } else if (name.length > 100) {
    errors.name = 'Максимум 100 символов';
  }

  if (!gameOverText.trim()) {
    errors.gameOverText = 'Обязательное поле';
  } else if (gameOverText.length > 500) {
    errors.gameOverText = 'Максимум 500 символов';
  }

  return errors;
};
