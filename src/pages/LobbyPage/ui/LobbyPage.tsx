import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  exportResults,
  getLobby,
  getLobbyLink,
  getLobbyResults,
  getOnlinePlayers,
  getRandomWinner,
  toggleLobby,
} from '@/api/lobby';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { PlayerResult } from '@/shared/types';

import './LobbyPage.scss';

const LIMIT = 20;

const fmtTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const avgDuration = (results: PlayerResult[]): string => {
  if (!results.length) {
    return '—';
  }
  const avg = results.reduce((sum, r) => sum + r.duration_seconds, 0) / results.length;
  return fmtTime(Math.round(avg));
};

export const LobbyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [qrFullscreen, setQrFullscreen] = useState(false);
  const [winner, setWinner] = useState<{
    first_name: string;
    last_name: string;
    score: number;
  } | null>(null);

  const { data: lobby, isLoading: lobbyLoading } = useQuery({
    queryKey: ['lobby'],
    queryFn: getLobby,
    refetchInterval: (query) => (query.state.data?.status === 'active' ? 30_000 : false),
  });

  const { data: onlineData } = useQuery({
    queryKey: ['lobby-online'],
    queryFn: getOnlinePlayers,
    enabled: lobby?.status === 'active',
    refetchInterval: 5_000,
  });

  const { data: lobbyLink } = useQuery({
    queryKey: ['lobby-link'],
    queryFn: getLobbyLink,
    enabled: !!lobby,
  });

  useEffect(() => {
    if (!lobbyLoading && lobby === null) {
      navigate('/lobby/create', { replace: true });
    }
  }, [lobbyLoading, lobby, navigate]);

  useEffect(() => {
    if (!lobbyLink?.url) {
      return;
    }
    QRCode.toDataURL(lobbyLink.url, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setQrDataUrl);
  }, [lobbyLink?.url]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!qrFullscreen) {
      return;
    }
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQrFullscreen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [qrFullscreen]);

  const { data: resultsData } = useQuery({
    queryKey: ['results', debouncedSearch, page],
    queryFn: () =>
      getLobbyResults({
        search: debouncedSearch || undefined,
        sort_by: 'score',
        order: 'desc',
        page,
        limit: LIMIT,
      }),
    enabled: !!lobby,
  });

  const { data: allResultsData } = useQuery({
    queryKey: ['results-all'],
    queryFn: () => getLobbyResults({ sort_by: 'score', order: 'desc', limit: 9999 }),
    enabled: !!lobby,
  });

  const toggleMutation = useMutation({
    mutationFn: toggleLobby,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lobby'] });
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });

  const exportMutation = useMutation({ mutationFn: exportResults });

  const randomMutation = useMutation({
    mutationFn: getRandomWinner,
    onSuccess: (data) => setWinner(data),
  });

  const handleCopy = async () => {
    const text = lobbyLink?.url ?? lobby?.invite_code ?? '';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) {
      return;
    }
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${lobby?.invite_code ?? 'lobby'}.png`;
    a.click();
  };

  if (lobbyLoading || !lobby) {
    return null;
  }

  const results = resultsData?.results ?? [];
  const total = resultsData?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const isActive = lobby.status === 'active';

  const allResults = allResultsData?.results ?? [];
  const allTotal = allResultsData?.total ?? 0;

  return (
    <div className="lobby">
      {/* ── Hero ── */}
      <div className="lobby__hero">
        <button
          className="lobby__qr-block"
          onClick={() => qrDataUrl && setQrFullscreen(true)}
          title="Открыть QR на весь экран"
          type="button"
        >
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="QR-код мероприятия" className="lobby__qr-img" />
          ) : (
            <div className="lobby__qr-placeholder">
              <span className="lobby__qr-code">{lobby.invite_code}</span>
            </div>
          )}
          {qrDataUrl && <div className="lobby__qr-expand">⤢</div>}
        </button>

        <div className="lobby__hero-content">
          <div className="lobby__hero-top">
            <h1 className="lobby__title">{lobby.name}</h1>
            <span className={`lobby__status-badge lobby__status-badge--${lobby.status}`}>
              {isActive ? 'Активно' : 'Завершено'}
            </span>
          </div>

          <div className="lobby__hero-actions">
            <Button variant="outline" onClick={handleDownloadQr} disabled={!qrDataUrl}>
              Скачать QR
            </Button>
            <Button variant="outline" onClick={handleCopy}>
              {copied ? 'Скопировано!' : 'Скопировать ссылку'}
            </Button>
            <Button
              variant="outline"
              onClick={() => randomMutation.mutate()}
              disabled={randomMutation.isPending}
            >
              Случайный победитель
            </Button>
            {!isActive && (
              <Button onClick={() => exportMutation.mutate()} disabled={exportMutation.isPending}>
                Экспорт данных
              </Button>
            )}
            {isActive && (
              <Button
                variant="destructive"
                onClick={() => toggleMutation.mutate()}
                disabled={toggleMutation.isPending}
              >
                Закрыть мероприятие
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="lobby__stats">
        <div className="lobby__stat">
          <span className="lobby__stat-label">Играют сейчас</span>
          <span className="lobby__stat-value">{onlineData?.online ?? '—'}</span>
        </div>
        <div className="lobby__stat">
          <span className="lobby__stat-label">Сыграли всего</span>
          <span className="lobby__stat-value">{allTotal}</span>
        </div>
        <div className="lobby__stat">
          <span className="lobby__stat-label">Ср. время сессии</span>
          <span className="lobby__stat-value">{avgDuration(allResults)}</span>
        </div>
      </div>

      {/* ── Table card ── */}
      <div className="lobby__table-card">
        <div className="lobby__search-field">
          <Input
            placeholder="Поиск по участникам..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="lobby__search-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </span>
        </div>

        <div className="lobby__table-wrap">
          <table className="lobby__table">
            <thead>
              <tr>
                <th>Место</th>
                <th>Фамилия</th>
                <th>Имя</th>
                <th>Телефон</th>
                <th>Очки</th>
                <th>Время</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 ? (
                <tr>
                  <td colSpan={6} className="lobby__table-empty">
                    Нет данных
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <tr key={r.player_id}>
                    <td>
                      <span
                        className={`lobby__rank${r.rank <= 3 ? ` lobby__rank--${['gold', 'silver', 'bronze'][r.rank - 1]}` : ''}`}
                      >
                        {r.rank}
                      </span>
                    </td>
                    <td>{r.last_name}</td>
                    <td>{r.first_name}</td>
                    <td>{r.phone}</td>
                    <td className="lobby__score">{r.score}</td>
                    <td>{fmtTime(r.duration_seconds)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="lobby__pagination">
            <button
              className="lobby__page-btn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ←
            </button>
            <span className="lobby__page-info">
              {page} / {totalPages}
            </span>
            <button
              className="lobby__page-btn"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              →
            </button>
          </div>
        )}
      </div>

      {/* ── QR fullscreen ── */}
      {qrFullscreen && (
        <div className="lobby__modal-overlay" onClick={() => setQrFullscreen(false)}>
          <div className="lobby__qr-fullscreen" onClick={(e) => e.stopPropagation()}>
            <img src={qrDataUrl!} alt="QR-код" className="lobby__qr-fullscreen-img" />
            <p className="lobby__qr-fullscreen-code">{lobby.invite_code}</p>
            <button className="lobby__qr-close" onClick={() => setQrFullscreen(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Random winner modal ── */}
      {winner && (
        <div className="lobby__modal-overlay" onClick={() => setWinner(null)}>
          <div className="lobby__modal" onClick={(e) => e.stopPropagation()}>
            <p className="lobby__modal-label">Случайный победитель</p>
            <p className="lobby__modal-name">
              {winner.first_name} {winner.last_name}
            </p>
            <p className="lobby__modal-score">{winner.score.toLocaleString()} очков</p>
            <Button onClick={() => setWinner(null)} fullWidth>
              Закрыть
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
