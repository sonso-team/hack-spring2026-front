import type { GameObjects, Math as PhaserMath } from 'phaser';
import type { EnemyType } from '../../core/GameState';

export interface EnemyTypeConfig
{
    textureKey: string;
    hp: number;
    hpMax: number;
    speedMultiplier: number;
    sizeMultiplier: number;
    tapRadiusMultiplier: number;
    tint: number | null;
    hitTints: number[];
    deathFlashColor: number;
    deathRingColor: number;
    deathBitPalette: string[];
    deathBurstScale: number;
    deathDuration: number;
    deathSpriteColor: number;
    trailLineColor: number;
    trailLineWidth: number;
    trailGlyphColor: string;
    trailGlyphFontSize: number;
    trailSampleDistPx: number;
    trailMaxSamples: number;
    trailGlyphCount: number;
    trailRowCount: number;
}

export interface DifficultyStage
{
    fromMs: number;
    maxEnemies: number;
    minSpawnIntervalMs: number;
    maxSpawnIntervalMs: number;
    minSpeed: number;
    maxSpeed: number;
    typeWeights: Partial<Record<EnemyType, number>>;
}

export interface EnemyRuntime
{
    id: string;
    type: EnemyType;
    hp: number;
    maxHp: number;
    sprite: GameObjects.Image;
    velocity: PhaserMath.Vector2;
    speed: number;
    driftFactor: number;
    turnTimerMs: number;
    syncTimerMs: number;
    inFirewall: boolean;
    enteredFirewallAtMs: number | null;
    tapRadius: number;
    frozenUntilMs: number;
    trailDistAccum: number;
    trailPositions: { x: number; y: number }[];
    trailGraphics: GameObjects.Graphics;
    trailGlyphs: GameObjects.Text[];
}

export interface EnemySystemOptions
{
    maxEnemies?: number;
    minSpawnIntervalMs?: number;
    maxSpawnIntervalMs?: number;
    minSpeed?: number;
    maxSpeed?: number;
    spawnMargin?: number;
    turnIntervalMinMs?: number;
    turnIntervalMaxMs?: number;
    inwardBias?: number;
    turnResponsiveness?: number;
    maxDriftFactor?: number;
    firewallRadius?: number;
    serverHitRadius?: number;
    enemyWidthDesktopPx?: number;
    enemyWidthTabletPx?: number;
    enemyWidthMobilePx?: number;
    onEnemyHit?: (type: EnemyType, x: number, y: number) => void;
    onEnemyDestroyed?: (enemyId: string) => void;
    onEnemyReachedServer?: (enemyId: string) => void;
}
