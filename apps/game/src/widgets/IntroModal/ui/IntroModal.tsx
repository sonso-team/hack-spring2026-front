import { Button } from '../../../shared/ui/Button';
import { Layout } from '../../../shared/ui/Layout';
import './intro-modal.scss';

interface IntroModalProps
{
    onStart: () => void;
    isPending?: boolean;
}

export function IntroModal ({ onStart, isPending = false }: IntroModalProps)
{
    return (
        <Layout>
            <div className="intro-modal-overlay" role="presentation">
                <section
                    aria-describedby="game-intro-description"
                    aria-labelledby="game-intro-title"
                    aria-modal="true"
                    className="intro-modal"
                    role="dialog"
                >
                    <div className="intro-modal__content">
                        <h1 className="intro-modal__title" id="game-intro-title">Как играть</h1>
                        <div className="intro-modal__description" id="game-intro-description">
                            <p>Уничтожай вредоносные запросы, нажимая на них в зоне файрвола. Пропустил — сервер получает урон.</p>
                        </div>
                        <p className="intro-modal__footer">Удачи, защитник!</p>
                    </div>
                    <Button className="intro-modal__action" onClick={isPending ? undefined : onStart}>
                        {isPending ? 'Загружаем…' : 'Начать'}
                    </Button>
                </section>
            </div>
        </Layout>
    );
}
