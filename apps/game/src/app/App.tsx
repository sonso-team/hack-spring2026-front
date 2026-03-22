import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { PhaserGame } from '../shared/phaser/PhaserGame';
import type { PhaserGameRef } from '../shared/phaser/types';
import { IntroModal } from '../widgets/IntroModal';
import { GameOverScreen } from '../widgets/GameOverScreen';
import { WelcomeScreen } from '../widgets/WelcomeScreen/ui/WelcomeScreen';
import { RegistrationForm } from '../widgets/RegistrationForm/ui/RegistrationForm';
import { Button } from '../shared/ui/Button';
import { EventBus } from '../game/core/EventBus';
import { startGame, finishGame } from '../shared/api';
import { useGameStore } from '../store/gameStore';
import '../widgets/IntroModal/ui/intro-modal.scss';

type AppStep = 'welcome' | 'register' | 'rules' | 'playing' | 'gameover';

const inviteCode = new URLSearchParams(window.location.search).get('invite_code') ?? '';

interface GameOverPayload
{
    score: number;
    elapsedMs: number;
}

export function App ()
{
    const phaserRef = useRef<PhaserGameRef>(null);
    const [step, setStep]               = useState<AppStep>('welcome');
    const [activeSceneKey, setActiveSceneKey] = useState('');
    const [gameOverData, setGameOverData]     = useState<GameOverPayload>({ score: 0, elapsedMs: 0 });
    const [noAttemptsOpen, setNoAttemptsOpen] = useState(false);
    const finishCalled = useRef(false);

    const { user, session, setSession, setUser } = useGameStore();

    useEffect(() =>
    {
        EventBus.on('game-over-data', setGameOverData);
        return () => { EventBus.off('game-over-data', setGameOverData); };
    }, []);

    // Trigger finish when game-over scene activates (only while playing, not during restart)
    useEffect(() =>
    {
        if (activeSceneKey === 'GameOver' && step === 'playing')
        {
            setStep('gameover');
        }
    }, [activeSceneKey, step]);

    const { mutate: mutateStart, isPending: isStartPending } = useMutation({
        mutationFn: () => startGame(user!.player_id),
        onSuccess: (data) =>
        {
            setSession(data);
            finishCalled.current = false;
            const { game, scene } = phaserRef.current ?? {};
            if (scene) scene.scene.start('Game');
            else game?.scene.start('Game');
            setActiveSceneKey('Game');
            setStep('playing');
        },
        onError: () =>
        {
            finishCalled.current = true; // не отправлять finish для незапущенной сессии
            if (user) setUser({ ...user, attempts_left: 0, can_play: false });
            setStep('gameover');
            setNoAttemptsOpen(true);
        },
    });

    const { mutate: mutateFinish } = useMutation({
        mutationFn: async () =>
        {
            if (!session) return;
            await finishGame(session.session_token, gameOverData.score);
        },
    });

    useEffect(() =>
    {
        if (step === 'gameover' && !finishCalled.current)
        {
            finishCalled.current = true;
            mutateFinish();
        }
    }, [step, mutateFinish]);

    const handleRestart = () =>
    {
        finishCalled.current = false;
        setStep('rules');
    };

    return (
        <div id="app">
            <div className="game-background">
                <PhaserGame ref={phaserRef} onSceneChange={setActiveSceneKey} />
            </div>

            {step === 'welcome' && (
                <WelcomeScreen onDone={() => setStep('register')} />
            )}

            {step === 'register' && (
                <RegistrationForm
                    inviteCode={inviteCode}
                    onSuccess={() => setStep('rules')}
                />
            )}

            {step === 'rules' && (
                <IntroModal
                    onStart={() => mutateStart()}
                    isPending={isStartPending}
                />
            )}

            {noAttemptsOpen && (
                <div className="intro-modal-overlay" role="presentation" style={{ position: 'fixed', zIndex: 999 }}>
                    <section className="intro-modal" role="dialog" aria-modal="true">
                        <div className="intro-modal__content">
                            <h1 className="intro-modal__title">Попытки<br />исчерпаны</h1>
                            <div className="intro-modal__description">
                                <p>Вы использовали все попытки в этом мероприятии. Спасибо за игру!</p>
                            </div>
                        </div>
                        <Button className="intro-modal__action" onClick={() => setNoAttemptsOpen(false)}>
                            Понятно
                        </Button>
                    </section>
                </div>
            )}

        {step === 'gameover' && (
                <GameOverScreen
                    bottomText="Узнавай первым о новых продуктах и мероприятиях DDoS-Guard. Подписывайся на наши соцсети."
                    canRestart={(user?.attempts_left ?? 0) > 1}
                    description="Спасибо за игру! Ждем Вас в наших социальных сетях!"
                    onRestart={handleRestart}
                    scoreCaption="Итоговый счёт"
                    scoreValue={gameOverData.score}
                    telegramText="Мы в Телеграм"
                    title="Игра окончена!"
                    vkText="Мы в Вконтакте"
                    vkHref={`https://vk.com/ddosguard`}
                    telegramHref={`https://telegram.me/ddos_guard`}
                    logoSrc={`${import.meta.env.BASE_URL}assets/logo/logo.svg`}
                />
            )}
        </div>
    );
}
