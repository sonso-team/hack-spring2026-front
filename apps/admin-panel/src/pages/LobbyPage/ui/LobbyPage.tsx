import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import QRCode from 'qrcode';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

import {
  exportResults,
  getLobby,
  getLobbyResults,
  getRandomWinner,
  toggleLobby,
} from '@/api/lobby';
import { Button } from '@/components/Button';
import { useModal } from '@/components/Modal';
import { Pagination } from '@/components/Pagination';
import { SearchInput } from '@/components/SearchInput';
import { StatCard } from '@/components/StatCard';
import { PLAYER_URL } from '@/shared/constants';

import { avgDuration, fmtTime } from '../lib/format';

import './LobbyPage.scss';

const LIMIT = 20;

export const LobbyPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { open, close } = useModal();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [copied, setCopied] = useState(false);
  const [onlineCount, setOnlineCount] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const hasLoadedLobby = useRef(false);

  const { data: lobby, isLoading: lobbyLoading } = useQuery({
    queryKey: ['lobby'],
    queryFn: getLobby,
    refetchInterval: (query) => (query.state.data?.status === 'active' ? 30_000 : false),
  });

  useEffect(() => {
    if (!lobbyLoading) {
      if (lobby) {
        hasLoadedLobby.current = true;
      } else if (!hasLoadedLobby.current) {
        navigate('/lobby/create', { replace: true });
      }
    }
  }, [lobbyLoading, lobby, navigate]);

  const playerLink = lobby ? `https://hack.kinoko.su/game/game?invite_code=${lobby.invite_code}` : '';

  useEffect(() => {
    if (!playerLink) {
      return;
    }
    QRCode.toDataURL(playerLink, {
      width: 400,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    }).then(setQrDataUrl);
  }, [playerLink]);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!lobby || lobby.status !== 'active') {
      wsRef.current?.close();
      wsRef.current = null;
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${window.location.host}/ws/play`);
    wsRef.current = ws;
    setOnlineCount(null);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as { players_in_game: number };
        if (typeof msg.players_in_game === 'number') {
          setOnlineCount(msg.players_in_game);
        }
      } catch {
        // ignore non-JSON messages
      }
    };

    ws.onclose = (event) => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
      // Бэкенд закрывает с NORMAL + reason при деактивации лобби — обновляем данные
      if (event.wasClean && event.reason?.includes('Lobby is inactive')) {
        queryClient.invalidateQueries({ queryKey: ['lobby'] });
      }
    };

    ws.onerror = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [lobby?.status, queryClient]);

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
    onSuccess: (data) => {
      queryClient.setQueryData(['lobby'], data);
      queryClient.invalidateQueries({ queryKey: ['results'] });
    },
  });

  const exportMutation = useMutation({ mutationFn: exportResults });

  const randomMutation = useMutation({
    mutationFn: getRandomWinner,
    onSuccess: (data) =>
      open(
        <div className="lobby__modal">
          <p className="lobby__modal-label">Случайный победитель</p>
          <p className="lobby__modal-name">
            {data.first_name} {data.last_name}
          </p>
          <p className="lobby__modal-score">{data.score.toLocaleString()} очков</p>
          <Button onClick={close} fullWidth>
            Закрыть
          </Button>
        </div>,
      ),
    onError: () =>
      open(
        <div className="lobby__modal">
          <p className="lobby__modal-label">Нет участников</p>
          <p
            className="lobby__modal-name"
            style={{ fontSize: '14px', color: 'var(--c-text-muted)' }}
          >
            Пока никто не сыграл в этом мероприятии
          </p>
          <Button onClick={close} fullWidth>
            Закрыть
          </Button>
        </div>,
      ),
  });

  const handleCopy = async () => {
    const text = playerLink;
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

  if (lobbyLoading || !lobby) {
    return null;
  }

  const handleDownloadQr = () => {
    if (!qrDataUrl) {
      return;
    }
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `qr-${lobby.invite_code}.png`;
    a.click();
  };

  const openQrModal = () => {
    if (!qrDataUrl) {
      return;
    }
    open(
      <div className="lobby__qr-fullscreen">
        <img src={qrDataUrl} alt="QR-код" className="lobby__qr-fullscreen-img" />
        <p className="lobby__qr-fullscreen-code">{lobby.invite_code}</p>
        <button className="lobby__qr-close" onClick={close} type="button">
          ✕
        </button>
      </div>,
    );
  };

  const results = resultsData?.results ?? [];
  const total = resultsData?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT);
  const isActive = lobby.status === 'active';

  const allResults = allResultsData?.results ?? [];
  const allTotal = allResultsData?.total ?? 0;

  return (
    <div className="lobby">
      <div className="lobby__hero">
        <button
          className="lobby__qr-block"
          onClick={openQrModal}
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

      <div className="lobby__stats">
        <StatCard label="Играют сейчас" value={onlineCount ?? lobby.online_players_count} />
        <StatCard label="Сыграли всего" value={allTotal} />
        <StatCard label="Ср. время сессии" value={avgDuration(allResults)} />
      </div>

      <div className="lobby__table-card">
        <SearchInput value={search} onChange={setSearch} placeholder="Поиск по участникам..." />

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

        {totalPages > 1 && <Pagination page={page} totalPages={totalPages} onPage={setPage} />}
      </div>
    </div>
  );
};
