import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useNavigate } from 'react-router';

import { createLobby } from '@/api/lobby';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { Stepper } from '@/components/Stepper';
import type { Difficulty, GameType } from '@/shared/types';

import { DIFFICULTIES, GAMES } from '../lib/constants';
import { validate } from '../lib/validate';

import './LobbyCreatePage.scss';

export const LobbyCreatePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [game, setGame] = useState<GameType>('ddos_ninja');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [durationHours, setDurationHours] = useState(8);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [gameOverText, setGameOverText] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const selectedGame = GAMES.find((g) => g.value === game);
  const hasDifficulty = selectedGame?.hasDifficulty ?? false;

  const { mutate, isPending } = useMutation({
    mutationFn: createLobby,
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
      navigate('/lobby');
    },
    onError: (err: Error) => {
      setFormError(err.message || 'Не удалось создать лобби');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const errs = validate(name, gameOverText);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    mutate({
      name: name.trim(),
      game,
      difficulty,
      duration_minutes: durationHours * 60,
      max_attempts: maxAttempts,
      game_over_text: gameOverText.trim(),
    });
  };

  const isValid = name.trim().length > 0 && gameOverText.trim().length > 0;

  return (
    <div className="lobby-create">
      <div className="lobby-create__card">
        <h1 className="lobby-create__title">Создать мероприятие</h1>

        <form className="lobby-create__form" onSubmit={handleSubmit} noValidate>
          <div className="lobby-create__field">
            <label className="lobby-create__label">Название мероприятия</label>
            <Input
              placeholder="Например: Южный ИТ-форум 2026"
              value={name}
              maxLength={100}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors((p) => ({ ...p, name: '' }));
                }
              }}
              aria-invalid={!!errors.name}
            />
            {errors.name && <p className="lobby-create__field-error">{errors.name}</p>}
          </div>

          <div className="lobby-create__field">
            <label className="lobby-create__label">Игра</label>
            <div className="lobby-create__select-wrap">
              <select
                className="lobby-create__select"
                value={game}
                onChange={(e) => setGame(e.target.value as GameType)}
              >
                {GAMES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasDifficulty && (
            <div className="lobby-create__field">
              <label className="lobby-create__label">Уровень сложности</label>
              <div className="lobby-create__select-wrap">
                <select
                  className="lobby-create__select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                >
                  {DIFFICULTIES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div className="lobby-create__field">
            <label className="lobby-create__label">Длительность</label>
            <Stepper value={durationHours} min={1} max={144} unit="ч" onChange={setDurationHours} />
          </div>

          <div className="lobby-create__field">
            <label className="lobby-create__label">Количество попыток</label>
            <Stepper value={maxAttempts} min={1} max={10} onChange={setMaxAttempts} />
          </div>

          <div className="lobby-create__field">
            <label className="lobby-create__label">Текст Game Over</label>
            <textarea
              className={`lobby-create__textarea${errors.gameOverText ? ' lobby-create__textarea--error' : ''}`}
              placeholder="Например: Спасибо за игру! Ожидайте результатов на стенде DDoS-Guard"
              value={gameOverText}
              maxLength={500}
              rows={4}
              onChange={(e) => {
                setGameOverText(e.target.value);
                if (errors.gameOverText) {
                  setErrors((p) => ({ ...p, gameOverText: '' }));
                }
              }}
            />
            <div className="lobby-create__char-count">
              <span className={gameOverText.length > 450 ? 'lobby-create__char-count--warn' : ''}>
                {gameOverText.length} / 500
              </span>
            </div>
            {errors.gameOverText && (
              <p className="lobby-create__field-error">{errors.gameOverText}</p>
            )}
          </div>

          {formError && <p className="lobby-create__form-error">{formError}</p>}

          <div className="lobby-create__actions">
            <Button type="button" variant="ghost" onClick={() => navigate('/')}>
              Отмена
            </Button>
            <Button type="submit" disabled={!isValid || isPending}>
              {isPending ? 'Создаём...' : 'Создать'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
