import { Math as PhaserMath, Scene } from 'phaser';
import type { EnemyRuntime } from './enemy.types';
import { ENEMY_TYPE_CONFIG } from './enemy.config';

export function playHitFlash (scene: Scene, enemy: EnemyRuntime)
{
    const { sprite } = enemy;
    if (!sprite.active) { return; }

    const cfg        = ENEMY_TYPE_CONFIG[enemy.type];
    const origScaleX = sprite.scaleX;
    const origScaleY = sprite.scaleY;
    const originX    = sprite.x;
    const originY    = sprite.y;

    sprite.setTintFill(0xffffff);

    for (let i = 0; i < 4; i++)
    {
        const chipAngle = PhaserMath.FloatBetween(0, Math.PI * 2);
        const travel    = PhaserMath.FloatBetween(18, 40);
        const glyph     = PhaserMath.Between(0, 1) === 0 ? '0' : '1';
        const color     = cfg.deathBitPalette[PhaserMath.Between(0, cfg.deathBitPalette.length - 1)];

        const chip = scene.add.text(originX, originY, glyph, {
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontSize:   `${PhaserMath.Between(9, 15)}px`,
            fontStyle:  '700',
            color,
        }).setOrigin(0.5).setDepth(sprite.depth + 1).setAlpha(0.9);

        scene.tweens.add({
            targets:  chip,
            x:        originX + Math.cos(chipAngle) * travel,
            y:        originY + Math.sin(chipAngle) * travel,
            alpha:    0,
            scale:    0.5,
            duration: PhaserMath.Between(180, 310),
            ease:     'Cubic.easeOut',
            onComplete: () => { chip.destroy(); },
        });
    }

    scene.tweens.add({
        targets:  sprite,
        scaleX:   origScaleX * 1.22,
        scaleY:   origScaleY * 1.22,
        duration: 72,
        ease:     'Sine.easeOut',
        yoyo:     true,
        onComplete: () =>
        {
            if (!sprite.active) { return; }

            const tintForHp = cfg.hitTints[enemy.hp - 1];
            if (tintForHp !== undefined)
            {
                sprite.setTint(tintForHp);
            }
            else if (cfg.tint !== null)
            {
                sprite.setTint(cfg.tint);
            }
            else
            {
                sprite.clearTint();
            }
        },
    });
}

export function playEnemyDeathAnimation (scene: Scene, enemy: EnemyRuntime)
{
    const { sprite } = enemy;
    const cfg        = ENEMY_TYPE_CONFIG[enemy.type];
    const originX    = sprite.x;
    const originY    = sprite.y;
    const baseScaleX = sprite.scaleX;
    const baseScaleY = sprite.scaleY;
    const baseDepth  = sprite.depth;
    const burstRadius = Math.max(22, sprite.displayWidth) * cfg.deathBurstScale;
    const dur         = cfg.deathDuration;

    // Центральная вспышка
    const coreR     = Math.max(6, sprite.displayWidth * 0.15);
    const coreFlash = scene.add.circle(originX, originY, coreR, cfg.deathFlashColor, 0.72).setDepth(baseDepth + 3);
    coreFlash.setBlendMode(Phaser.BlendModes.ADD);

    scene.tweens.add({
        targets:  coreFlash,
        scaleX:   4.4,
        scaleY:   4.4,
        alpha:    0,
        duration: Math.round(234 * Math.max(0.55, dur)),
        ease:     'Expo.easeOut',
        onComplete: () => { coreFlash.destroy(); },
    });

    // Ударная волна
    const ringR     = Math.max(4, sprite.displayWidth * 0.1);
    const shockRing = scene.add.circle(originX, originY, ringR).setDepth(baseDepth + 2);
    shockRing.setStrokeStyle(3, cfg.deathRingColor, 0.95);

    scene.tweens.add({
        targets:  shockRing,
        scaleX:   3.2,
        scaleY:   3.2,
        alpha:    0,
        duration: Math.round(288 * Math.max(0.55, dur)),
        ease:     'Cubic.easeOut',
        onComplete: () => { shockRing.destroy(); },
    });

    // Дополнительное внешнее кольцо для синих танков
    if (enemy.type === 'blue')
    {
        const outerRing = scene.add.circle(originX, originY, ringR * 1.5).setDepth(baseDepth + 1);
        outerRing.setStrokeStyle(2, cfg.deathRingColor, 0.55);

        scene.tweens.add({
            targets:  outerRing,
            scaleX:   6.0,
            scaleY:   6.0,
            alpha:    0,
            duration: 540,
            ease:     'Sine.easeOut',
            delay:    55,
            onComplete: () => { outerRing.destroy(); },
        });
    }

    // Разлёт битов
    const bitCount = enemy.type === 'blue' ? 22 : enemy.type === 'green' ? 10 : 15;
    const fontSize = enemy.type === 'green' ? { min: 9, max: 16 } : { min: 14, max: 24 };

    for (let i = 0; i < bitCount; i++)
    {
        const bitAngle = PhaserMath.FloatBetween(0, Math.PI * 2);
        const travel   = PhaserMath.FloatBetween(burstRadius * 0.45, burstRadius * 1.2);
        const glyph    = PhaserMath.Between(0, 1) === 0 ? '0' : '1';
        const color    = cfg.deathBitPalette[PhaserMath.Between(0, cfg.deathBitPalette.length - 1)];

        const bit = scene.add.text(originX, originY, glyph, {
            fontFamily: 'Montserrat, Arial, sans-serif',
            fontSize:   `${PhaserMath.Between(fontSize.min, fontSize.max)}px`,
            fontStyle:  '700',
            color,
        })
            .setOrigin(0.5)
            .setDepth(baseDepth + 1)
            .setRotation(PhaserMath.FloatBetween(-0.35, 0.35))
            .setAlpha(0.95);

        scene.tweens.add({
            targets:  bit,
            x:        originX + Math.cos(bitAngle) * travel * PhaserMath.FloatBetween(0.95, 1.35),
            y:        originY + Math.sin(bitAngle) * travel * PhaserMath.FloatBetween(0.95, 1.35),
            alpha:    0,
            scaleX:   PhaserMath.FloatBetween(0.52, 0.88),
            scaleY:   PhaserMath.FloatBetween(0.52, 0.88),
            angle:    PhaserMath.Between(-180, 180),
            duration: Math.round(PhaserMath.Between(414, 630) * Math.max(0.55, dur)),
            ease:     'Cubic.easeOut',
            onComplete: () => { bit.destroy(); },
        });
    }

    // Анимация смерти спрайта
    sprite.setTintFill(cfg.deathSpriteColor);

    scene.tweens.add({
        targets:  sprite,
        y:        originY + PhaserMath.Between(34, 58),
        scaleX:   baseScaleX * 1.34,
        scaleY:   baseScaleY * 1.34,
        alpha:    0,
        angle:    sprite.angle + PhaserMath.Between(-26, 26),
        duration: Math.round(387 * Math.max(0.55, dur)),
        ease:     'Sine.easeIn',
        onComplete: () =>
        {
            sprite.clearTint();
            sprite.destroy();
        },
    });
}
