import { AUTO, Game, Scale } from 'phaser';
import { Boot } from '../scenes/Boot';
import { Preloader } from '../scenes/Preloader';
import { MainMenu } from '../scenes/MainMenu';
import { Game as GameScene } from '../scenes/Game';
import { GameOver } from '../scenes/GameOver';

const PHASER_CONFIG: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    parent: 'game-container',
    backgroundColor: '#0e1335',
    scale: {
        mode: Scale.RESIZE,
        width: window.innerWidth,
        height: window.innerHeight,
        autoCenter: Scale.CENTER_BOTH,
    },
    scene: [Boot, Preloader, MainMenu, GameScene, GameOver],
};

export function startGame (parent: string): Phaser.Game
{
    return new Game({ ...PHASER_CONFIG, parent });
}
