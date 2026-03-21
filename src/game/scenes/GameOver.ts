import { EventBus } from '../EventBus';
import { Background } from '../Background';
import { Scene } from 'phaser';

interface GameOverData
{
    score?: number;
    elapsedMs?: number;
}

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    backgroundEffect!: Background;
    gameOverText: Phaser.GameObjects.Text;
    scoreText: Phaser.GameObjects.Text;
    promptText: Phaser.GameObjects.Text;
    private score = 0;
    private elapsedMs = 0;
    private hasRestarted = false;
    private readonly handleRestart = () => {
        this.changeScene();
    };
    private readonly handleResize = (gameSize: Phaser.Structs.Size) => {
        this.updateLayout(gameSize.width, gameSize.height);
    };

    constructor ()
    {
        super('GameOver');
    }

    private updateLayout (width = this.scale.width, height = this.scale.height)
    {
        const centerX = width / 2;
        const centerY = height / 2;

        this.backgroundEffect.resize(width, height);
        this.gameOverText.setPosition(centerX, centerY - 92);
        this.scoreText.setPosition(centerX, centerY + 8);
        this.promptText.setPosition(centerX, centerY + 110);

        const wrapWidth = Math.max(width - 64, 240);
        this.gameOverText.setWordWrapWidth(wrapWidth, true);
        this.scoreText.setWordWrapWidth(wrapWidth, true);
        this.promptText.setWordWrapWidth(wrapWidth, true);
    }

    create (data: GameOverData)
    {
        const { width, height } = this.scale;
        const centerX = width / 2;
        const centerY = height / 2;
        this.score = data?.score ?? 0;
        this.elapsedMs = data?.elapsedMs ?? 0;
        this.hasRestarted = false;

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x0f092b);

        this.backgroundEffect = new Background(this);

        this.gameOverText = this.add.text(centerX, centerY - 92, 'Game Over', {
            fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 64, fontStyle: '700', color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const survivalTimeSeconds = (this.elapsedMs / 1000).toFixed(1);
        this.scoreText = this.add.text(centerX, centerY + 8, `Score: ${this.score}\nTime: ${survivalTimeSeconds}s`, {
            fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 34, fontStyle: '700', color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.promptText = this.add.text(centerX, centerY + 110, 'Tap / Click to restart', {
            fontFamily: 'Montserrat, Arial, sans-serif', fontSize: 24, fontStyle: '600', color: '#8ecbff',
            stroke: '#000000', strokeThickness: 5,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        const wrapWidth = Math.max(width - 64, 240);
        this.gameOverText.setWordWrapWidth(wrapWidth, true);
        this.scoreText.setWordWrapWidth(wrapWidth, true);
        this.promptText.setWordWrapWidth(wrapWidth, true);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
        this.input.once(Phaser.Input.Events.POINTER_DOWN, this.handleRestart);
        this.input.keyboard?.once('keydown-ENTER', this.handleRestart);
        this.input.keyboard?.once('keydown-SPACE', this.handleRestart);
        this.scale.on('resize', this.handleResize);
        
        EventBus.emit('current-scene-ready', this);
    }

    update (_time: number, delta: number)
    {
        this.backgroundEffect.update(delta);
    }

    changeScene ()
    {
        if (this.hasRestarted)
        {
            return;
        }

        this.hasRestarted = true;
        this.scene.start('MainMenu');
    }

    shutdown ()
    {
        this.scale.off('resize', this.handleResize);
        this.input.off(Phaser.Input.Events.POINTER_DOWN, this.handleRestart);
        this.input.keyboard?.off('keydown-ENTER', this.handleRestart);
        this.input.keyboard?.off('keydown-SPACE', this.handleRestart);
        this.backgroundEffect.destroy();
    }
}
