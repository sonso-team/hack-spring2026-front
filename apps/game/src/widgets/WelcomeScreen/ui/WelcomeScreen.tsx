import { useEffect } from 'react';
import './welcome-screen.scss';

interface WelcomeScreenProps {
    onDone: () => void;
}

export function WelcomeScreen ({ onDone }: WelcomeScreenProps)
{
    useEffect(() =>
    {
        const t = setTimeout(onDone, 3000);
        return () => clearTimeout(t);
    }, [onDone]);

    return (
        <div className="welcome-screen">
            <div className="welcome-screen__inner">
                <div className="game-over-screen__header">
                    <img alt='DDOS-GUARD' className="game-over-screen__logo" src={`${import.meta.env.BASE_URL}assets/logo/logo.svg`} />
                </div>
                <h1 className="welcome-screen__title">Добро<br />пожаловать!</h1>
                <img
                    src={`${import.meta.env.BASE_URL}assets/characters/drakon.png`}
                    alt=""
                    aria-hidden="true"
                    className="welcome-screen__mascot"
                />
                
            </div>
        </div>
    );
}
