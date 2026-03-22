import { Math as PhaserMath, Scene } from 'phaser';
import { type EnemyState, type EnemyType, GameState } from '../../core/GameState';
import type { EnemyRuntime, EnemySystemOptions } from './enemy.types';
import { DIFFICULTY_STAGES, ENEMY_TYPE_CONFIG } from './enemy.config';
import { createTrailObjects, destroyTrail, drawTrail } from './EnemyTrail';
import { playEnemyDeathAnimation, playHitFlash } from './EnemyEffects';

type ResolvedOptions =
    Required<Omit<EnemySystemOptions, 'onEnemyHit' | 'onEnemyDestroyed' | 'onEnemyReachedServer'>>
    & Pick<EnemySystemOptions, 'onEnemyHit' | 'onEnemyDestroyed' | 'onEnemyReachedServer'>;

const MAX_DELTA_MS             = 250;
const POSITION_SYNC_INTERVAL_MS = 100;

export class EnemySystem
{
    private readonly options: ResolvedOptions;
    private readonly enemies = new Map<string, EnemyRuntime>();
    private readonly center  = new PhaserMath.Vector2();
    private width: number;
    private height: number;
    private spawnTimerMs = 0;
    private enemySeq     = 0;

    constructor (
        private readonly scene: Scene,
        private readonly gameState: GameState,
        options: EnemySystemOptions = {},
    )
    {
        this.options = {
            maxEnemies:           options.maxEnemies          ?? 10,
            minSpawnIntervalMs:   options.minSpawnIntervalMs  ?? 920,
            maxSpawnIntervalMs:   options.maxSpawnIntervalMs  ?? 1580,
            minSpeed:             options.minSpeed            ?? 76,
            maxSpeed:             options.maxSpeed            ?? 98,
            spawnMargin:          options.spawnMargin         ?? 84,
            turnIntervalMinMs:    options.turnIntervalMinMs   ?? 260,
            turnIntervalMaxMs:    options.turnIntervalMaxMs   ?? 1920,
            inwardBias:           options.inwardBias          ?? 0.82,
            turnResponsiveness:   options.turnResponsiveness  ?? 7.2,
            maxDriftFactor:       options.maxDriftFactor      ?? 3.42,
            firewallRadius:       options.firewallRadius      ?? 120,
            serverHitRadius:      options.serverHitRadius     ?? 56,
            enemyWidthDesktopPx:  options.enemyWidthDesktopPx ?? 58,
            enemyWidthTabletPx:   options.enemyWidthTabletPx  ?? 50,
            enemyWidthMobilePx:   options.enemyWidthMobilePx  ?? 42,
            onEnemyHit:           options.onEnemyHit,
            onEnemyDestroyed:     options.onEnemyDestroyed,
            onEnemyReachedServer: options.onEnemyReachedServer,
        };

        this.width  = scene.scale.width;
        this.height = scene.scale.height;
        this.center.set(this.width / 2, this.height / 2);
        this.resetSpawnTimer();
    }

    // ─── Публичный API ─────────────────────────────────────────────────────────

    resize (width: number, height: number)
    {
        this.width  = width;
        this.height = height;
        this.center.set(width / 2, height / 2);
    }

    setFirewallRadius (radius: number)
    {
        this.options.firewallRadius = Number.isFinite(radius) ? Math.max(8, radius) : this.options.firewallRadius;
    }

    setServerHitRadius (radius: number)
    {
        this.options.serverHitRadius = Number.isFinite(radius) ? Math.max(4, radius) : this.options.serverHitRadius;
    }

    tryHitEnemy (worldX: number, worldY: number): boolean
    {
        if (this.gameState.getPhase() !== 'running') { return false; }

        let selectedEnemy: EnemyRuntime | null = null;
        let selectedDistance = Number.POSITIVE_INFINITY;

        for (const enemy of this.enemies.values())
        {
            if (!enemy.inFirewall) { continue; }

            const distance = PhaserMath.Distance.Between(worldX, worldY, enemy.sprite.x, enemy.sprite.y);
            if (distance > enemy.tapRadius || distance >= selectedDistance) { continue; }

            selectedDistance = distance;
            selectedEnemy    = enemy;
        }

        if (!selectedEnemy) { return false; }

        selectedEnemy.hp -= 1;
        this.options.onEnemyHit?.(selectedEnemy.type, selectedEnemy.sprite.x, selectedEnemy.sprite.y);

        if (selectedEnemy.hp <= 0)
        {
            this.resolveEnemyDestroyed(selectedEnemy);
        }
        else
        {
            playHitFlash(this.scene, selectedEnemy);
        }

        return true;
    }

    update (deltaMs: number)
    {
        if (this.gameState.getPhase() !== 'running') { return; }

        const safeDelta = Number.isFinite(deltaMs) ? Math.max(0, Math.min(deltaMs, MAX_DELTA_MS)) : 0;
        if (safeDelta <= 0) { return; }

        this.tickSpawn(safeDelta);
        this.tickEnemies(safeDelta);
    }

    destroy ()
    {
        for (const enemy of this.enemies.values())
        {
            destroyTrail(enemy);
            enemy.sprite.destroy();
        }
        this.enemies.clear();
        this.gameState.clearEnemies();
    }

    // ─── Спавн ─────────────────────────────────────────────────────────────────

    private tickSpawn (deltaMs: number)
    {
        this.spawnTimerMs -= deltaMs;
        if (this.spawnTimerMs > 0) { return; }
        this.resetSpawnTimer();
        this.trySpawnEnemy();
    }

    private resetSpawnTimer ()
    {
        const stage = this.getCurrentStage();
        this.spawnTimerMs = PhaserMath.Between(stage.minSpawnIntervalMs, stage.maxSpawnIntervalMs);
    }

    private trySpawnEnemy ()
    {
        const stage = this.getCurrentStage();
        if (this.enemies.size >= stage.maxEnemies) { return; }

        const type    = this.pickEnemyType();
        const typeCfg = ENEMY_TYPE_CONFIG[type];
        const id      = `enemy-${++this.enemySeq}`;

        const angle        = PhaserMath.FloatBetween(0, Math.PI * 2);
        const spawnRadius  = Math.hypot(this.width, this.height) * 0.5 + this.options.spawnMargin;
        const spawnPos     = new PhaserMath.Vector2(
            this.center.x + Math.cos(angle) * spawnRadius,
            this.center.y + Math.sin(angle) * spawnRadius,
        );

        const toCenter   = new PhaserMath.Vector2(this.center.x - spawnPos.x, this.center.y - spawnPos.y).normalize();
        const driftFactor = PhaserMath.FloatBetween(-this.options.maxDriftFactor, this.options.maxDriftFactor);
        const direction  = this.composeDirection(toCenter, driftFactor);
        const speed      = PhaserMath.FloatBetween(stage.minSpeed, stage.maxSpeed) * typeCfg.speedMultiplier * this.getViewportSpeedScale();
        const hp         = PhaserMath.Between(typeCfg.hp, typeCfg.hpMax);

        const sprite = this.scene.add.image(spawnPos.x, spawnPos.y, typeCfg.textureKey).setDepth(140);
        this.applyEnemySize(sprite, type);
        if (typeCfg.tint !== null) { sprite.setTint(typeCfg.tint); }

        const trail = createTrailObjects(this.scene, type, sprite.depth);

        const enemy: EnemyRuntime = {
            id, type, hp, maxHp: hp, sprite,
            velocity:           direction.scale(speed),
            speed, driftFactor,
            turnTimerMs:        PhaserMath.Between(this.options.turnIntervalMinMs, this.options.turnIntervalMaxMs),
            syncTimerMs:        0,
            inFirewall:         false,
            enteredFirewallAtMs: null,
            tapRadius:          this.getEnemyTapRadius(sprite.displayWidth, type),
            frozenUntilMs:      0,
            trailDistAccum:     0,
            trailPositions:     [],
            ...trail,
        };

        this.enemies.set(id, enemy);

        const stateEnemy: EnemyState = {
            id, type,
            x:                 spawnPos.x,
            y:                 spawnPos.y,
            state:             'approaching',
            spawnedAtMs:       this.gameState.getElapsedMs(),
            enteredFirewallAtMs: null,
        };

        this.gameState.upsertEnemy(stateEnemy);
    }

    private spawnEnemyAtPosition (type: EnemyType, x: number, y: number, direction: PhaserMath.Vector2, freezeMs = 0)
    {
        if (this.enemies.size >= this.options.maxEnemies) { return; }

        const typeCfg    = ENEMY_TYPE_CONFIG[type];
        const id         = `enemy-${++this.enemySeq}`;
        const speed      = PhaserMath.FloatBetween(this.options.minSpeed, this.options.maxSpeed) * typeCfg.speedMultiplier * this.getViewportSpeedScale();
        const inFirewall = PhaserMath.Distance.Between(x, y, this.center.x, this.center.y) <= this.options.firewallRadius;

        const sprite = this.scene.add.image(x, y, typeCfg.textureKey).setDepth(140);
        this.applyEnemySize(sprite, type);
        if (typeCfg.tint !== null) { sprite.setTint(typeCfg.tint); }

        const trail = createTrailObjects(this.scene, type, sprite.depth);

        const enemy: EnemyRuntime = {
            id, type,
            hp: typeCfg.hp, maxHp: typeCfg.hp, sprite,
            velocity:           direction.clone().normalize().scale(speed),
            speed,
            driftFactor:        PhaserMath.FloatBetween(-this.options.maxDriftFactor, this.options.maxDriftFactor),
            turnTimerMs:        PhaserMath.Between(this.options.turnIntervalMinMs, this.options.turnIntervalMaxMs),
            syncTimerMs:        0,
            inFirewall,
            enteredFirewallAtMs: inFirewall ? this.gameState.getElapsedMs() : null,
            tapRadius:          this.getEnemyTapRadius(sprite.displayWidth, type),
            frozenUntilMs:      freezeMs > 0 ? this.gameState.getElapsedMs() + freezeMs : 0,
            trailDistAccum:     0,
            trailPositions:     [],
            ...trail,
        };

        this.enemies.set(id, enemy);

        this.gameState.upsertEnemy({
            id, type, x, y,
            state:             inFirewall ? 'in_firewall' : 'approaching',
            spawnedAtMs:       this.gameState.getElapsedMs(),
            enteredFirewallAtMs: enemy.enteredFirewallAtMs,
        });
    }

    // ─── Движение ──────────────────────────────────────────────────────────────

    private tickEnemies (deltaMs: number)
    {
        const deltaSec = deltaMs / 1000;

        for (const enemy of this.enemies.values())
        {
            enemy.turnTimerMs -= deltaMs;
            if (enemy.turnTimerMs <= 0)
            {
                enemy.driftFactor = PhaserMath.FloatBetween(-this.options.maxDriftFactor, this.options.maxDriftFactor);
                enemy.turnTimerMs = PhaserMath.Between(this.options.turnIntervalMinMs, this.options.turnIntervalMaxMs);
            }

            const toCenter      = new PhaserMath.Vector2(this.center.x - enemy.sprite.x, this.center.y - enemy.sprite.y);
            const distToCenter  = toCenter.length();

            if (distToCenter <= this.options.serverHitRadius)
            {
                this.resolveEnemyReachedServer(enemy);
                continue;
            }

            if (this.gameState.getElapsedMs() < enemy.frozenUntilMs) { continue; }

            const wasInFirewall = enemy.inFirewall;
            enemy.inFirewall    = distToCenter <= this.options.firewallRadius;
            if (enemy.inFirewall && !wasInFirewall)
            {
                enemy.enteredFirewallAtMs = this.gameState.getElapsedMs();
            }

            const toCenterNorm   = distToCenter > 0 ? toCenter.scale(1 / distToCenter) : new PhaserMath.Vector2(0, 1);
            const desiredDir     = this.composeDirection(toCenterNorm, enemy.driftFactor);
            const currentDir     = enemy.velocity.clone().normalize();
            const turnLerp       = Math.min(1, this.options.turnResponsiveness * deltaSec);
            const nextDir        = currentDir.lerp(desiredDir, turnLerp).normalize();

            enemy.velocity.copy(nextDir.scale(enemy.speed * this.getGlobalSpeedMultiplier(enemy.type)));
            enemy.sprite.x += enemy.velocity.x * deltaSec;
            enemy.sprite.y += enemy.velocity.y * deltaSec;

            enemy.trailDistAccum += Math.hypot(enemy.velocity.x, enemy.velocity.y) * deltaSec;
            const trailCfg = ENEMY_TYPE_CONFIG[enemy.type];
            if (enemy.trailDistAccum >= trailCfg.trailSampleDistPx)
            {
                enemy.trailDistAccum -= trailCfg.trailSampleDistPx;
                enemy.trailPositions.unshift({ x: enemy.sprite.x, y: enemy.sprite.y });
                if (enemy.trailPositions.length > trailCfg.trailMaxSamples)
                {
                    enemy.trailPositions.pop();
                }
            }
            drawTrail(enemy);

            enemy.syncTimerMs -= deltaMs;
            if (enemy.syncTimerMs <= 0)
            {
                enemy.syncTimerMs = POSITION_SYNC_INTERVAL_MS;
                this.gameState.patchEnemy(enemy.id, {
                    x:                 enemy.sprite.x,
                    y:                 enemy.sprite.y,
                    state:             enemy.inFirewall ? 'in_firewall' : 'approaching',
                    enteredFirewallAtMs: enemy.enteredFirewallAtMs,
                });
            }
        }
    }

    private composeDirection (toCenter: PhaserMath.Vector2, driftFactor: number): PhaserMath.Vector2
    {
        const perpendicular = new PhaserMath.Vector2(-toCenter.y, toCenter.x);
        const desired       = toCenter.clone().scale(this.options.inwardBias).add(perpendicular.scale(driftFactor));

        if (desired.lengthSq() <= Number.EPSILON) { return toCenter.clone(); }

        desired.normalize();
        return desired.dot(toCenter) < 0.45
            ? toCenter.clone().lerp(desired, 0.2).normalize()
            : desired;
    }

    // ─── Разрешение событий ────────────────────────────────────────────────────

    private resolveEnemyDestroyed (enemy: EnemyRuntime)
    {
        this.gameState.patchEnemy(enemy.id, {
            x: enemy.sprite.x, y: enemy.sprite.y,
            state:             'dead',
            enteredFirewallAtMs: enemy.enteredFirewallAtMs,
        });
        this.gameState.removeEnemy(enemy.id);
        this.enemies.delete(enemy.id);
        destroyTrail(enemy);
        playEnemyDeathAnimation(this.scene, enemy);

        if (enemy.type === 'orange') { this.spawnSplitterChildren(enemy); }

        this.options.onEnemyDestroyed?.(enemy.id);
    }

    private resolveEnemyReachedServer (enemy: EnemyRuntime)
    {
        this.gameState.patchEnemy(enemy.id, {
            x: enemy.sprite.x, y: enemy.sprite.y,
            state:             'hit_server',
            enteredFirewallAtMs: enemy.enteredFirewallAtMs,
        });
        this.gameState.removeEnemy(enemy.id);
        this.enemies.delete(enemy.id);
        destroyTrail(enemy);
        enemy.sprite.destroy();
        this.options.onEnemyReachedServer?.(enemy.id);
    }

    private spawnSplitterChildren (parent: EnemyRuntime)
    {
        const parentDir = parent.velocity.lengthSq() > 0
            ? parent.velocity.clone().normalize()
            : new PhaserMath.Vector2(0, -1);

        for (let i = 0; i < 2; i++)
        {
            const sideAngle = (i === 0 ? -1 : 1) * (Math.PI / 4);
            const cos       = Math.cos(sideAngle);
            const sin       = Math.sin(sideAngle);
            const childDir  = new PhaserMath.Vector2(
                parentDir.x * cos - parentDir.y * sin,
                parentDir.x * sin + parentDir.y * cos,
            );
            this.spawnEnemyAtPosition('green', parent.sprite.x, parent.sprite.y, childDir, 500);
        }
    }

    // ─── Вспомогательные методы ────────────────────────────────────────────────

    private getCurrentStage ()
    {
        const elapsed = this.gameState.getElapsedMs();
        let stage = DIFFICULTY_STAGES[0];
        for (const s of DIFFICULTY_STAGES)
        {
            if (elapsed >= s.fromMs) { stage = s; } else { break; }
        }
        return stage;
    }

    private pickEnemyType (): EnemyType
    {
        const { typeWeights } = this.getCurrentStage();
        const entries = Object.entries(typeWeights) as [EnemyType, number][];
        const total   = entries.reduce((sum, [, w]) => sum + w, 0);
        let roll      = PhaserMath.FloatBetween(0, total);
        for (const [type, weight] of entries)
        {
            roll -= weight;
            if (roll < 0) { return type; }
        }
        return 'red';
    }

    private getViewportSpeedScale (): number
    {
        const referenceSpawnRadius = 511;
        const currentSpawnRadius   = Math.hypot(this.width, this.height) / 2 + this.options.spawnMargin;
        return Math.max(1, currentSpawnRadius / referenceSpawnRadius);
    }

    private getGlobalSpeedMultiplier (type: EnemyType): number
    {
        if (type === 'green') { return 1; }
        const elapsed = this.gameState.getElapsedMs();
        if (elapsed >= 210_000) return 3;
        if (elapsed >= 150_000) return 2;
        if (elapsed >= 90_000)  return 1.5;
        return 1;
    }

    private applyEnemySize (sprite: Phaser.GameObjects.Image, type: EnemyType)
    {
        const baseWidth   = Math.max(1, sprite.width);
        const targetWidth = this.getTargetEnemyWidth() * ENEMY_TYPE_CONFIG[type].sizeMultiplier;
        sprite.setScale(targetWidth / baseWidth);
    }

    private getTargetEnemyWidth (): number
    {
        if (this.width <= 480) return this.options.enemyWidthMobilePx;
        if (this.width <= 768) return this.options.enemyWidthTabletPx;
        return this.options.enemyWidthDesktopPx;
    }

    private getEnemyTapRadius (displayWidth: number, type: EnemyType): number
    {
        return Math.max(14, displayWidth * ENEMY_TYPE_CONFIG[type].tapRadiusMultiplier);
    }
}
