import { Scene } from 'phaser';
import { EventBus } from '../core/EventBus';
import { Background } from '../background/Background';

interface GameOverData
{
    score?: number;
    elapsedMs?: number;
}

export class GameOver extends Scene
{
    private backgroundEffect!: Background;
    private score     = 0;
    private elapsedMs = 0;

    private readonly handleResize = (gameSize: Phaser.Structs.Size) =>
    {
        this.backgroundEffect.resize(gameSize.width, gameSize.height);
    };

    constructor ()
    {
        super('GameOver');
    }

    create (data: GameOverData)
    {
        this.score     = data?.score     ?? 0;
        this.elapsedMs = data?.elapsedMs ?? 0;

        this.cameras.main.setBackgroundColor(0x0f092b);
        this.backgroundEffect = new Background(this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
        this.scale.on('resize', this.handleResize);

        EventBus.emit('game-over-data', { score: this.score, elapsedMs: this.elapsedMs });
        EventBus.emit('current-scene-ready', this);
    }

    update (_time: number, delta: number)
    {
        this.backgroundEffect.update(delta);
    }

    shutdown ()
    {
        this.scale.off('resize', this.handleResize);
        this.backgroundEffect.destroy();
    }
}
