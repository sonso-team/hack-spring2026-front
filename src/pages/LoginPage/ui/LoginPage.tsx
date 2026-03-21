import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { loginRequest } from '@/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/store/authStore';

import './LoginPage.scss';

export const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [dragonOffset, setDragonOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = -(e.clientX / window.innerWidth - 0.5) * 28;
      const y = -(e.clientY / window.innerHeight - 0.5) * 18;
      setDragonOffset({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => loginRequest(email, password),
    onSuccess: (data) => {
      setAuth(data.token, data.admin);
      navigate('/', { replace: true });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  const errorMessage = error
    ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message ??
      'Неверный email или пароль')
    : null;

  return (
    <div className="login">
      <Link to="/" className="login__logo">
        <img src="/assets/logo.svg" alt="DDoS-Guard" className="login__logo-img" />
      </Link>

      <img
        src="/assets/dragon_mascot.png"
        alt=""
        className="login__mascot"
        aria-hidden="true"
        style={{
          transform: `translate(calc(-60px + ${dragonOffset.x}px), calc(-40px + ${dragonOffset.y}px))`,
        }}
      />

      <form className="login__form" onSubmit={handleSubmit} noValidate>
        <div className="login__field">
          <label className="login__label" htmlFor="email">
            Электронная почта
          </label>
          <Input
            id="email"
            type="email"
            placeholder="admin@ddos-guard.net"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            aria-invalid={!!errorMessage}
            required
          />
        </div>

        <div className="login__field">
          <label className="login__label" htmlFor="password">
            Пароль
          </label>
          <Input
            id="password"
            type="password"
            placeholder="••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            aria-invalid={!!errorMessage}
            required
          />
        </div>

        <div className="login__error">{errorMessage}</div>

        <Button type="submit" fullWidth size="lg" disabled={isPending}>
          {isPending ? 'Входим...' : 'Войти'}
        </Button>
      </form>
    </div>
  );
};
