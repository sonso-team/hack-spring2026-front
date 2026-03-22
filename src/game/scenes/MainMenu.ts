import { Scene } from 'phaser';
import { EventBus } from '../core/EventBus';
import { Background } from '../background/Background';

export class MainMenu extends Scene
{
    private backgroundEffect!: Background;

    private readonly handleResize = (gameSize: Phaser.Structs.Size) =>
    {
        this.backgroundEffect.resize(gameSize.width, gameSize.height);
    };

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0x0f092b);
        this.backgroundEffect = new Background(this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
        this.scale.on('resize', this.handleResize);

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
