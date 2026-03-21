import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { Background } from '../Background';

export class MainMenu extends Scene
{
    backgroundEffect!: Background;
    private readonly handleResize = (gameSize: Phaser.Structs.Size) => {
        this.updateLayout(gameSize.width, gameSize.height);
    };

    constructor ()
    {
        super('MainMenu');
    }

    private updateLayout (width = this.scale.width, height = this.scale.height)
    {
        this.backgroundEffect.resize(width, height);
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
