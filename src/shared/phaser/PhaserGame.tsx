import { forwardRef, useEffect, useLayoutEffect, useRef } from 'react';
import { startGame } from '../../game/config/game.config';
import { EventBus } from '../../game/core/EventBus';
import type { PhaserGameRef } from './types';

interface PhaserGameProps
{
    onSceneChange?: (sceneKey: string) => void;
}

export const PhaserGame = forwardRef<PhaserGameRef, PhaserGameProps>(function PhaserGame ({ onSceneChange }, ref)
{
    const gameRef = useRef<Phaser.Game | null>(null);

    useLayoutEffect(() =>
    {
        if (gameRef.current !== null) { return; }

        gameRef.current = startGame('game-container');

        if (typeof ref === 'function')
        {
            ref({ game: gameRef.current, scene: null });
        }
        else if (ref)
        {
            ref.current = { game: gameRef.current, scene: null };
        }

        return () =>
        {
            gameRef.current?.destroy(true);
            gameRef.current = null;
        };
    }, [ref]);

    useEffect(() =>
    {
        const onSceneReady = (scene: Phaser.Scene) =>
        {
            onSceneChange?.(scene.scene.key);

            if (typeof ref === 'function')
            {
                ref({ game: gameRef.current, scene });
            }
            else if (ref)
            {
                ref.current = { game: gameRef.current, scene };
            }
        };

        EventBus.on('current-scene-ready', onSceneReady);
        return () => { EventBus.off('current-scene-ready', onSceneReady); };
    }, [onSceneChange, ref]);

    return <div id="game-container" />;
});
