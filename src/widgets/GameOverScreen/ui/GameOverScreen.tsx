import { VkSocialPill, TelegramSocialPill } from '../../../shared/ui/SocialPills';
import { Button } from '../../../shared/ui/Button';
import './game-over-screen.scss';

export interface GameOverScreenProps
{
    title: string;
    scoreValue: number | string;
    scoreCaption: string;
    description: string;
    canRestart: boolean;
    restartText?: string;
    bottomText: string;
    vkText: string;
    telegramText: string;
    vkHref?: string;
    telegramHref?: string;
    logoSrc?: string;
    logoAlt?: string;
    onRestart?: () => void;
}

export function GameOverScreen ({
    title,
    scoreValue,
    scoreCaption,
    description,
    canRestart,
    restartText = 'Рестарт',
    bottomText,
    vkText,
    telegramText,
    vkHref,
    telegramHref,
    logoSrc = '/assets/logo/logo.svg',
    logoAlt = 'DDOS-GUARD',
    onRestart,
}: GameOverScreenProps)
{
    return (
        <section aria-label={title} className="game-over-screen" role="region">
            <div className="game-over-screen__content">
                <header className="game-over-screen__header">
                    <img alt={logoAlt} className="game-over-screen__logo" src={logoSrc} />
                </header>

                <h1 className="game-over-screen__title">{title}</h1>

                <div className="game-over-screen__score-card">
                    <strong className="game-over-screen__score-value">{scoreValue}</strong>
                    <p className="game-over-screen__score-caption">{scoreCaption}</p>
                </div>

                <p className="game-over-screen__description">{description}</p>

                {canRestart && (
                    <Button className="game-over-screen__restart" onClick={onRestart}>
                        {restartText}
                    </Button>
                )}

                <div className="game-over-screen__bottom">
                    <p className="game-over-screen__bottom-text">{bottomText}</p>
                    <div className="game-over-screen__socials">
                        <VkSocialPill href={vkHref} text={vkText} />
                        <TelegramSocialPill href={telegramHref} text={telegramText} />
                    </div>
                </div>
            </div>
        </section>
    );
}
