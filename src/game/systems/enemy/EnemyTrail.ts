import { GameObjects, Scene } from 'phaser';
import type { EnemyType } from '../../core/GameState';
import type { EnemyRuntime } from './enemy.types';
import { ENEMY_TYPE_CONFIG } from './enemy.config';

export interface TrailObjects
{
    trailGraphics: GameObjects.Graphics;
    trailGlyphs: GameObjects.Text[];
}

export function createTrailObjects (scene: Scene, type: EnemyType, spriteDepth: number): TrailObjects
{
    const cfg = ENEMY_TYPE_CONFIG[type];

    const trailGraphics = scene.add.graphics().setDepth(spriteDepth - 2);
    const trailGlyphs: GameObjects.Text[] = [];

    for (let i = 0; i < cfg.trailGlyphCount; i++)
    {
        trailGlyphs.push(
            scene.add.text(0, 0, i % 2 === 0 ? '0' : '1', {
                fontFamily: 'Courier New, monospace',
                fontSize:   `${cfg.trailGlyphFontSize}px`,
                fontStyle:  'bold',
                color:      cfg.trailGlyphColor,
            }).setOrigin(0.5).setDepth(spriteDepth - 1).setVisible(false),
        );
    }

    return { trailGraphics, trailGlyphs };
}

export function drawTrail (enemy: EnemyRuntime)
{
    const cfg = ENEMY_TYPE_CONFIG[enemy.type];
    const pts = enemy.trailPositions;

    enemy.trailGraphics.clear();

    if (pts.length < 2)
    {
        enemy.trailGlyphs.forEach(g => g.setVisible(false));
        return;
    }

    for (let i = 1; i < pts.length; i++)
    {
        const alpha = (1 - i / pts.length) * 0.92;
        enemy.trailGraphics.lineStyle(cfg.trailLineWidth, cfg.trailLineColor, alpha);
        enemy.trailGraphics.beginPath();
        enemy.trailGraphics.moveTo(pts[i - 1].x, pts[i - 1].y);
        enemy.trailGraphics.lineTo(pts[i].x, pts[i].y);
        enemy.trailGraphics.strokePath();
    }

    const vLen  = enemy.velocity.length();
    const perpX = vLen > 0.1 ? -enemy.velocity.y / vLen : 0;
    const perpY = vLen > 0.1 ?  enemy.velocity.x / vLen : 1;

    const rowSpacing = cfg.trailGlyphFontSize * 1.15;
    const half       = (cfg.trailRowCount - 1) / 2;
    const rowOffsets = Array.from({ length: cfg.trailRowCount }, (_, r) => (r - half) * rowSpacing);

    const cols = Math.floor(cfg.trailGlyphCount / cfg.trailRowCount);
    const step = Math.max(1, Math.floor(pts.length / cols));

    for (let gi = 0; gi < enemy.trailGlyphs.length; gi++)
    {
        const row   = gi % cfg.trailRowCount;
        const col   = Math.floor(gi / cfg.trailRowCount);
        const posIdx = (col + 1) * step;
        const glyph = enemy.trailGlyphs[gi];

        if (posIdx < pts.length)
        {
            const pos   = pts[posIdx];
            const alpha = (1 - posIdx / pts.length) * 0.9;

            if (Math.random() < 0.18) { glyph.setText(Math.random() < 0.5 ? '0' : '1'); }

            glyph
                .setPosition(
                    pos.x + perpX * rowOffsets[row],
                    pos.y + perpY * rowOffsets[row],
                )
                .setAlpha(alpha)
                .setVisible(true);
        }
        else
        {
            glyph.setVisible(false);
        }
    }
}

export function destroyTrail (enemy: EnemyRuntime)
{
    enemy.trailGraphics.destroy();
    enemy.trailGlyphs.forEach(g => g.destroy());
}
