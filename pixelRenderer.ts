import {
  CharacterArchetype,
  CompanionId,
  Direction,
  EchoVision,
  EquippedOutfit,
  ExplorationToolId,
  MapDefinition,
  NPCData,
  PlayerAppearance,
  TileType,
  TimeOfDay,
  WeatherCondition,
  WorldEventDefinition,
  WorldItemPickup,
} from './types';
import {
  DIRECTION_ROW,
  resolveNpcArchetype,
  SPRITE_H,
  SPRITE_W,
  spriteAtlas,
} from './spriteAtlas';
import { ResolvedInteractionTarget } from './interactionManager';
import {
  getLightingOverlay,
  isInteriorMap,
  NpcRuntimeSimState,
} from './worldLivingSystem';

export const INTERNAL_WIDTH = 480;
export const INTERNAL_HEIGHT = 320;
export const TILE_SIZE = 16;

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  phase: number;
  kind: 'mote' | 'leaf' | 'butterfly';
}

interface WeatherDrop {
  x: number;
  y: number;
  speedY: number;
  speedX: number;
  len: number;
  phase: number;
}

interface BurstEffect {
  x: number;
  y: number;
  age: number;
  maxAge: number;
  color: string;
}

const MAX_PARTICLES = 36;
const MAX_WEATHER_DROPS = 56;

export class PixelRenderer {
  private tileCache: Map<string, HTMLCanvasElement> = new Map();
  private particles: AmbientParticle[] = [];
  private weatherDrops: WeatherDrop[] = [];
  private bursts: BurstEffect[] = [];

  constructor() {
    this.initParticles();
    this.initWeatherDrops();
    this.prebuildTiles();
  }

  public triggerBurst(worldTileX: number, worldTileY: number, color = '#f5b942') {
    this.bursts.push({
      x: worldTileX * TILE_SIZE + 8,
      y: worldTileY * TILE_SIZE + 8,
      age: 0,
      maxAge: 0.85,
      color,
    });
  }

  private initParticles() {
    const colors = ['#ffe082', '#7dd3fc', '#d8b4fe', '#86efac'];
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const kind: AmbientParticle['kind'] =
        i % 9 === 0 ? 'butterfly' : i % 3 === 0 ? 'leaf' : 'mote';
      this.particles.push({
        x: (i * 47) % INTERNAL_WIDTH,
        y: (i * 31) % INTERNAL_HEIGHT,
        vx: kind === 'butterfly' ? 12 : kind === 'leaf' ? 6 : ((i % 3) - 1) * 5,
        vy: kind === 'leaf' ? 8 : -4 - (i % 4) * 2.5,
        size: kind === 'butterfly' ? 3 : i % 3 === 0 ? 2 : 1,
        alpha: 0.45 + (i % 5) * 0.1,
        color: colors[i % colors.length],
        phase: i * 0.7,
        kind,
      });
    }
  }

  private initWeatherDrops() {
    for (let i = 0; i < MAX_WEATHER_DROPS; i++) {
      this.weatherDrops.push({
        x: (i * 53) % INTERNAL_WIDTH,
        y: (i * 29) % INTERNAL_HEIGHT,
        speedY: 140 + (i % 5) * 22,
        speedX: -28 - (i % 3) * 6,
        len: 4 + (i % 3),
        phase: i * 0.55,
      });
    }
  }

  private createTileCanvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const ctx = c.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;
    return [c, ctx];
  }

  private prebuildTiles() {
    const types: TileType[] = [
      'grass',
      'dark_grass',
      'path',
      'water',
      'water_anim',
      'tree',
      'flowers',
      'rock',
      'house_wall',
      'roof_purple',
      'roof_teal',
      'roof_terracotta',
      'door',
      'window',
      'bridge',
      'cliff',
      'stairs',
      'sign',
      'bush',
      'fence',
      'shrine',
      'sand',
      'soil',
      'special_ground',
      'wood_floor',
      'bookshelf',
      'table',
      'capsule_pedestal',
      'chest',
      'chest_open',
      'lantern',
      'fountain',
      'crystal',
      'clothing_rack',
      'mannequin',
      'statue',
      'brazier',
      'water_valve',
    ];

    for (const t of types) {
      this.buildTileVariant(t, 0);
      this.buildTileVariant(t, 1);
      this.buildTileVariant(t, 2);
    }
  }

  /**
   * Returns a time-of-day palette-adapted tile canvas from the shared cache.
   * Only caches at most 4 time-of-day variants per tile (not 24 weather combinations),
   * keeping pixel art crisp and memory minimal.
   */
  private getTimeShiftedTile(
    type: TileType,
    variant: number,
    timeOfDay: TimeOfDay,
    isInterior: boolean
  ): HTMLCanvasElement | undefined {
    const baseKey = `${type}_${variant}`;
    const baseCanvas =
      this.tileCache.get(baseKey) ||
      this.tileCache.get(`${type}_0`) ||
      this.tileCache.get('grass_0');
    if (!baseCanvas) return undefined;

    const effectivePhase: TimeOfDay = isInterior ? 'tarde' : timeOfDay;
    if (effectivePhase === 'tarde') {
      return baseCanvas;
    }

    const phaseKey = `${type}_${variant}_${effectivePhase}`;
    const cached = this.tileCache.get(phaseKey);
    if (cached) return cached;

    const [canvas, ctx] = this.createTileCanvas();
    ctx.drawImage(baseCanvas, 0, 0);

    try {
      const imgData = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE);
      const data = imgData.data;

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Preserve bright luminous / emissive pixels (gold, cyan crystal, violet aura, white sparkle)
        const isLuminous =
          (r > 235 && g > 180 && b < 140) || // gold/amber flame
          (r < 140 && g > 175 && b > 235) || // bright cyan crystal/water highlight
          (r > 180 && g < 150 && b > 230) || // bright violet crystal
          (r > 240 && g > 240 && b > 240);   // pure white highlight

        if (isLuminous) continue;

        if (effectivePhase === 'manana') {
          // Morning dew: crisp, slightly cool-golden fresh tones
          data[i] = Math.min(255, Math.round(r * 1.03 + 6));
          data[i + 1] = Math.min(255, Math.round(g * 1.04 + 5));
          data[i + 2] = Math.min(255, Math.round(b * 0.98 + 4));
        } else if (effectivePhase === 'atardecer') {
          // Warm sunset: amber, copper, and soft violet shadows on foliage, stone, and roofs
          data[i] = Math.min(255, Math.round(r * 1.08 + 16));
          data[i + 1] = Math.max(0, Math.round(g * 0.87 - 4));
          data[i + 2] = Math.min(255, Math.round(b * 0.92 + 10));
        } else if (effectivePhase === 'noche') {
          // Deep moonlit night: indigo/slate foliage, cool stone, dark cobalt water
          const lum = r * 0.299 + g * 0.587 + b * 0.114;
          data[i] = Math.max(8, Math.round(r * 0.42 + lum * 0.08));
          data[i + 1] = Math.max(14, Math.round(g * 0.50 + lum * 0.12));
          data[i + 2] = Math.min(255, Math.round(b * 0.72 + lum * 0.22 + 18));
        }
      }

      ctx.putImageData(imgData, 0, 0);

      // Turn on warm interior window glow and bright lantern flames at sunset & night
      if (effectivePhase === 'atardecer' || effectivePhase === 'noche') {
        if (type === 'window') {
          ctx.fillStyle = effectivePhase === 'noche' ? '#f59e0b' : '#fbbf24';
          ctx.fillRect(3, 3, 4, 9);
          ctx.fillRect(9, 3, 4, 9);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(4, 4, 2, 5);
          ctx.fillRect(10, 4, 2, 5);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(4, 4, 1, 2);
          ctx.fillRect(10, 4, 1, 2);
        } else if (type === 'lantern') {
          ctx.fillStyle = variant % 2 === 0 ? '#fde047' : '#fb923c';
          ctx.fillRect(5, 3, 6, 3);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(7, 3, 2, 2);
        } else if (type === 'brazier') {
          ctx.fillStyle = variant % 2 === 0 ? '#fb923c' : '#f59e0b';
          ctx.fillRect(4, 2, 8, 5);
          ctx.fillStyle = '#fef08a';
          ctx.fillRect(6, 1, 4, 4);
        }
      }
    } catch {
      // Fallback to baseCanvas if getImageData is restricted
      return baseCanvas;
    }

    this.tileCache.set(phaseKey, canvas);
    return canvas;
  }

  private buildTileVariant(type: TileType, variant: number) {
    const [canvas, ctx] = this.createTileCanvas();

    // Rich JRPG grass base with organic texture variants
    ctx.fillStyle = '#7bd18b';
    ctx.fillRect(0, 0, 16, 16);
    ctx.fillStyle = '#65be76';
    if (variant === 0) {
      ctx.fillRect(2, 3, 2, 1);
      ctx.fillRect(11, 10, 2, 1);
      ctx.fillRect(6, 13, 1, 2);
    } else if (variant === 1) {
      ctx.fillRect(4, 6, 2, 1);
      ctx.fillRect(12, 3, 2, 2);
      ctx.fillRect(3, 12, 2, 1);
      ctx.fillStyle = '#96e2a4';
      ctx.fillRect(9, 8, 1, 1);
    } else {
      ctx.fillRect(1, 9, 2, 1);
      ctx.fillRect(8, 2, 2, 1);
      ctx.fillRect(13, 13, 2, 1);
      ctx.fillStyle = '#96e2a4';
      ctx.fillRect(5, 4, 1, 1);
    }

    switch (type) {
      case 'grass':
        break;

      case 'dark_grass':
        ctx.fillStyle = '#4ea865';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#3b8c50';
        for (let y = 2; y < 15; y += 4) {
          for (let x = (variant % 2) + 1; x < 15; x += 4) {
            ctx.fillRect(x, y, 2, 3);
            ctx.fillStyle = '#6cc482';
            ctx.fillRect(x, y, 1, 1);
            ctx.fillStyle = '#3b8c50';
          }
        }
        break;

      case 'path':
        ctx.fillStyle = '#d9c398';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#c4ab7c';
        ctx.fillRect(1, 2, 5, 4);
        ctx.fillRect(8, 1, 6, 5);
        ctx.fillRect(2, 9, 6, 5);
        ctx.fillRect(10, 8, 5, 6);
        ctx.fillStyle = '#e8d6b3';
        ctx.fillRect(2, 3, 3, 2);
        ctx.fillRect(9, 2, 4, 2);
        ctx.fillRect(3, 10, 4, 2);
        if (variant === 1) {
          ctx.fillStyle = '#b09566';
          ctx.fillRect(7, 7, 2, 2);
        }
        break;

      case 'sand':
        ctx.fillStyle = '#f0d894';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#d9be74';
        ctx.fillRect(2 + variant, 4, 3, 1);
        ctx.fillRect(10, 11 - variant, 3, 1);
        ctx.fillStyle = '#fff1bf';
        ctx.fillRect(6, 8, 2, 1);
        break;

      case 'soil':
        ctx.fillStyle = '#966d46';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#785330';
        ctx.fillRect(1, 2, 6, 2);
        ctx.fillRect(8, 7, 6, 2);
        ctx.fillRect(2, 12, 6, 2);
        ctx.fillStyle = '#b3865b';
        ctx.fillRect(2, 1, 4, 1);
        ctx.fillRect(9, 6, 4, 1);
        break;

      case 'special_ground':
        ctx.fillStyle = '#4c3575';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#6b4ca3';
        ctx.fillRect(1, 1, 14, 14);
        ctx.fillStyle = '#8b68c7';
        ctx.fillRect(2, 2, 12, 12);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(7, 7, 2, 2);
        ctx.fillStyle = '#a98be0';
        ctx.fillRect(3, 3, 2, 2);
        ctx.fillRect(11, 3, 2, 2);
        ctx.fillRect(3, 11, 2, 2);
        ctx.fillRect(11, 11, 2, 2);
        break;

      case 'wood_floor':
        ctx.fillStyle = '#c89662';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#a17242';
        ctx.fillRect(0, 3, 16, 1);
        ctx.fillRect(0, 7, 16, 1);
        ctx.fillRect(0, 11, 16, 1);
        ctx.fillRect(0, 15, 16, 1);
        ctx.fillRect(7, 0, 1, 4);
        ctx.fillRect(13, 4, 1, 4);
        ctx.fillRect(4, 8, 1, 4);
        break;

      case 'water':
      case 'water_anim':
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(0, 0, 16, 2);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect((2 + variant * 2) % 11, 4, 5, 1);
        ctx.fillRect((8 - variant * 2 + 11) % 11, 10, 5, 1);
        ctx.fillStyle = '#bae6fd';
        ctx.fillRect((3 + variant * 2) % 12, 4, 2, 1);
        ctx.fillRect((9 - variant * 2 + 12) % 12, 10, 2, 1);
        break;

      case 'bridge':
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#d99b43';
        ctx.fillRect(1, 0, 14, 16);
        ctx.fillStyle = '#9e6b20';
        for (let y = 0; y < 16; y += 3) {
          ctx.fillRect(1, y, 14, 1);
        }
        ctx.fillStyle = '#5c3a0d';
        ctx.fillRect(1, 0, 2, 16);
        ctx.fillRect(13, 0, 2, 16);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(1, 1, 2, 2);
        ctx.fillRect(13, 1, 2, 2);
        break;

      case 'cliff':
        ctx.fillStyle = '#5c3f2e';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#855d46';
        ctx.fillRect(1, 1, 6, 6);
        ctx.fillRect(8, 2, 7, 5);
        ctx.fillRect(2, 8, 7, 6);
        ctx.fillRect(10, 9, 5, 5);
        ctx.fillStyle = '#a87b60';
        ctx.fillRect(2, 2, 4, 2);
        ctx.fillRect(9, 3, 4, 2);
        ctx.fillRect(3, 9, 4, 2);
        ctx.fillStyle = '#3b261b';
        ctx.fillRect(0, 14, 16, 2);
        break;

      case 'stairs':
        ctx.fillStyle = '#64748b';
        ctx.fillRect(0, 0, 16, 16);
        for (let y = 0; y < 16; y += 4) {
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(1, y, 14, 2);
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(1, y + 2, 14, 1);
          ctx.fillStyle = '#475569';
          ctx.fillRect(1, y + 3, 14, 1);
        }
        break;

      case 'tree':
        ctx.fillStyle = '#451a03';
        ctx.fillRect(6, 12, 4, 4);
        ctx.fillStyle = '#14532d';
        ctx.fillRect(2, 1, 12, 13);
        ctx.fillRect(1, 3, 14, 9);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(2, 2, 12, 10);
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(3, 2, 10, 7);
        ctx.fillStyle = '#86efac';
        ctx.fillRect(4, 3, 4, 3);
        ctx.fillRect(9, 4, 3, 2);
        break;

      case 'flowers': {
        const shift = variant % 2;
        ctx.fillStyle = '#3b8c50';
        ctx.fillRect(2 + shift, 4, 3, 3);
        ctx.fillRect(10 - shift, 9, 3, 3);
        ctx.fillStyle = variant === 0 ? '#f472b6' : '#f5b942';
        ctx.fillRect(2 + shift, 3, 3, 2);
        ctx.fillStyle = variant === 0 ? '#f5b942' : '#c084fc';
        ctx.fillRect(10 - shift, 8, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(3 + shift, 4, 1, 1);
        ctx.fillRect(11 - shift, 9, 1, 1);
        break;
      }

      case 'rock':
        ctx.fillStyle = '#475569';
        ctx.fillRect(2, 4, 12, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(3, 3, 10, 9);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(4, 4, 5, 3);
        break;

      case 'roof_purple':
      case 'roof_teal':
      case 'roof_terracotta': {
        const mainColor =
          type === 'roof_purple'
            ? '#7e4a9e'
            : type === 'roof_teal'
            ? '#2b8a8a'
            : '#b85338';
        const darkColor =
          type === 'roof_purple'
            ? '#542e6e'
            : type === 'roof_teal'
            ? '#1b5c5c'
            : '#823420';
        const lightColor =
          type === 'roof_purple'
            ? '#a36ec4'
            : type === 'roof_teal'
            ? '#4bb3b3'
            : '#de7659';

        ctx.fillStyle = mainColor;
        ctx.fillRect(0, 0, 16, 16);
        for (let x = 0; x < 16; x += 4) {
          ctx.fillStyle = lightColor;
          ctx.fillRect(x, 0, 2, 15);
          ctx.fillStyle = darkColor;
          ctx.fillRect(x + 3, 0, 1, 15);
        }
        ctx.fillStyle = '#1e1b2e';
        ctx.fillRect(0, 15, 16, 1);
        break;
      }

      case 'house_wall':
        ctx.fillStyle = '#f1ead8';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#d8ceb8';
        ctx.fillRect(0, 4, 16, 1);
        ctx.fillRect(0, 9, 16, 1);
        ctx.fillRect(0, 14, 16, 2);
        ctx.fillStyle = '#925f30';
        ctx.fillRect(0, 0, 2, 16);
        ctx.fillRect(14, 0, 2, 16);
        break;

      case 'window':
        ctx.fillStyle = '#f1ead8';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#334155';
        ctx.fillRect(2, 2, 12, 11);
        ctx.fillStyle = variant % 2 === 0 ? '#38bdf8' : '#7dd3fc';
        ctx.fillRect(3, 3, 4, 9);
        ctx.fillRect(9, 3, 4, 9);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(4, 4, 2, 3);
        ctx.fillRect(10, 4, 2, 3);
        break;

      case 'door':
        ctx.fillStyle = '#f1ead8';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(2, 1, 12, 15);
        ctx.fillStyle = '#b4783c';
        ctx.fillRect(3, 2, 10, 14);
        ctx.fillStyle = '#784719';
        ctx.fillRect(5, 2, 1, 14);
        ctx.fillRect(9, 2, 1, 14);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(11, 8, 1, 2);
        break;

      case 'sign':
        ctx.fillStyle = '#451a03';
        ctx.fillRect(6, 11, 4, 5);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(1, 2, 14, 10);
        ctx.fillStyle = '#f6f0dd';
        ctx.fillRect(2, 3, 12, 8);
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(3, 5, 4, 2);
        ctx.fillStyle = '#475569';
        ctx.fillRect(8, 5, 5, 1);
        ctx.fillRect(3, 8, 9, 1);
        break;

      case 'shrine':
      case 'capsule_pedestal':
        ctx.fillStyle = '#334155';
        ctx.fillRect(2, 9, 12, 6);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(3, 8, 10, 5);
        ctx.fillStyle = variant % 2 === 0 ? '#38bdf8' : '#f5b942';
        ctx.fillRect(5, 2, 6, 7);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(7, 3, 2, 4);
        break;

      case 'bookshelf':
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(1, 2, 14, 5);
        ctx.fillRect(1, 9, 14, 5);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(2, 3, 3, 4);
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(6, 3, 3, 4);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(10, 3, 4, 4);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(2, 10, 4, 4);
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(7, 10, 4, 4);
        break;

      case 'table':
        ctx.fillStyle = '#78350f';
        ctx.fillRect(1, 3, 14, 10);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(2, 4, 12, 7);
        break;

      case 'chest':
        ctx.fillStyle = '#1e1b2e';
        ctx.fillRect(2, 4, 12, 10);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(3, 5, 10, 8);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(2, 7, 12, 2);
        ctx.fillRect(6, 6, 4, 4);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(7, 7, 2, 2);
        break;

      case 'chest_open':
        ctx.fillStyle = '#1e1b2e';
        ctx.fillRect(2, 3, 12, 11);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(3, 4, 10, 4);
        ctx.fillStyle = '#92400e';
        ctx.fillRect(3, 8, 10, 5);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(2, 8, 12, 1);
        break;

      case 'lantern':
        ctx.fillStyle = '#d9c398';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(6, 12, 4, 3);
        ctx.fillRect(7, 5, 2, 8);
        ctx.fillRect(5, 2, 6, 4);
        ctx.fillStyle = variant % 2 === 0 ? '#fde047' : '#f5b942';
        ctx.fillRect(6, 3, 4, 3);
        break;

      case 'fountain':
        ctx.fillStyle = '#475569';
        ctx.fillRect(1, 2, 14, 12);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(2, 3, 12, 10);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(3, 4, 10, 8);
        ctx.fillStyle = variant % 2 === 0 ? '#7dd3fc' : '#bae6fd';
        ctx.fillRect(6, 2, 4, 7);
        ctx.fillRect(4, 6, 8, 2);
        break;

      case 'crystal':
        ctx.fillStyle = '#3b0764';
        ctx.fillRect(3, 9, 10, 5);
        ctx.fillStyle = variant % 2 === 0 ? '#a855f7' : '#38bdf8';
        ctx.fillRect(5, 2, 6, 10);
        ctx.fillRect(3, 5, 10, 6);
        ctx.fillStyle = '#f3e8ff';
        ctx.fillRect(7, 3, 2, 6);
        break;

      case 'clothing_rack':
        ctx.fillStyle = '#c89662';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#a17242';
        ctx.fillRect(0, 5, 16, 1);
        ctx.fillRect(0, 11, 16, 1);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(1, 2, 2, 12);
        ctx.fillRect(13, 2, 2, 12);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(1, 2, 14, 2);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(3, 4, 3, 8);
        ctx.fillStyle = '#15803d';
        ctx.fillRect(7, 4, 3, 8);
        ctx.fillStyle = '#7c3aed';
        ctx.fillRect(10, 4, 3, 8);
        break;

      case 'mannequin':
        ctx.fillStyle = '#c89662';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#a17242';
        ctx.fillRect(0, 7, 16, 1);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(5, 13, 6, 2);
        ctx.fillRect(7, 10, 2, 4);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(4, 3, 8, 8);
        ctx.fillStyle = variant % 2 === 0 ? '#7e22ce' : '#0284c7';
        ctx.fillRect(5, 4, 6, 6);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(6, 4, 4, 1);
        ctx.fillRect(5, 8, 6, 1);
        ctx.fillStyle = '#d9b372';
        ctx.fillRect(7, 1, 2, 2);
        break;

      case 'statue':
        // Astral stone guardian statue on runic pedestal
        ctx.fillStyle = '#4c3575';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(2, 10, 12, 5);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(3, 9, 10, 5);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(4, 3, 8, 7);
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(5, 2, 6, 4);
        ctx.fillStyle = variant % 2 === 0 ? '#38bdf8' : '#f5b942';
        ctx.fillRect(6, 4, 4, 2);
        break;

      case 'brazier':
        // Ancient ceremonial brazier with glowing embers/fire
        ctx.fillStyle = '#4c3575';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(4, 11, 8, 4);
        ctx.fillStyle = '#b45309';
        ctx.fillRect(3, 7, 10, 5);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(4, 4, 8, 4);
        ctx.fillStyle = variant % 2 === 0 ? '#fef08a' : '#38bdf8';
        ctx.fillRect(6, 2, 4, 4);
        break;

      case 'water_valve':
        // Mechanical bronze aqueduct valve wheel on stone base
        ctx.fillStyle = '#d9c398';
        ctx.fillRect(0, 0, 16, 16);
        ctx.fillStyle = '#334155';
        ctx.fillRect(3, 9, 10, 6);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(4, 8, 8, 5);
        ctx.fillStyle = '#d97706';
        ctx.fillRect(3, 2, 10, 7);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(6, 4, 4, 3);
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(7, 11, 2, 3);
        break;

      default:
        break;
    }

    this.tileCache.set(`${type}_${variant}`, canvas);
  }

  private drawSheetSprite(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    dir: Direction,
    colIndex: number,
    archetype: CharacterArchetype = 'protagonist'
  ) {
    const sheet = spriteAtlas.getSheet(archetype);
    const row = DIRECTION_ROW[dir] || 0;
    const sx = (colIndex % 6) * SPRITE_W;
    const sy = row * SPRITE_H;

    const dx = Math.round(screenX - 4);
    const dy = Math.round(screenY - 14);

    ctx.drawImage(sheet, sx, sy, SPRITE_W, SPRITE_H, dx, dy, SPRITE_W, SPRITE_H);
  }

  private drawProtagonistSprite(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    dir: Direction,
    colIndex: number,
    appearance: PlayerAppearance = 'hombre',
    outfit?: Partial<EquippedOutfit>
  ) {
    const sheet = spriteAtlas.getProtagonistSheet(appearance, outfit);
    const row = DIRECTION_ROW[dir] || 0;
    const sx = (colIndex % 6) * SPRITE_W;
    const sy = row * SPRITE_H;

    const dx = Math.round(screenX - 4);
    const dy = Math.round(screenY - 14);

    ctx.drawImage(sheet, sx, sy, SPRITE_W, SPRITE_H, dx, dy, SPRITE_W, SPRITE_H);
  }

  public render(
    ctx: CanvasRenderingContext2D,
    map: MapDefinition,
    player: {
      x: number;
      y: number;
      dir: Direction;
      walkFrame: number;
      isMoving?: boolean;
    },
    npcs: NPCData[],
    pickups: WorldItemPickup[],
    collectedPickups: string[],
    completedQuests: string[],
    activeQuestId: string,
    timeSec: number,
    dt: number,
    options?: {
      timeOfDay?: TimeOfDay;
      weather?: WeatherCondition;
      echoActive?: boolean;
      echoVisions?: EchoVision[];
      resolvedEchoes?: string[];
      openedChests?: string[];
      activeTarget?: ResolvedInteractionTarget | null;
      npcSimStates?: Map<string, NpcRuntimeSimState>;
      activeEvents?: WorldEventDefinition[];
      completedEvents?: string[];
      playerAppearance?: PlayerAppearance;
      equippedOutfit?: EquippedOutfit;
      activeToolId?: ExplorationToolId | null;
      puzzleStates?: Record<string, string | number | boolean>;
      reducedMotion?: boolean;
      isMobile?: boolean;
      activeCompanionId?: CompanionId | null;
    }
  ) {
    ctx.imageSmoothingEnabled = false;

    const timeOfDay: TimeOfDay = options?.timeOfDay || 'manana';
    const isInterior = isInteriorMap(map.id);
    const weather: WeatherCondition = isInterior
      ? 'despejado'
      : options?.weather || 'despejado';
    const echoActive = Boolean(options?.echoActive);
    const openedChests = options?.openedChests || [];
    const activeTarget = options?.activeTarget || null;
    const npcSimStates = options?.npcSimStates;
    const activeEvents = options?.activeEvents || [];
    const completedEvents = options?.completedEvents || [];
    const activeToolId = options?.activeToolId || null;
    const puzzleStates = options?.puzzleStates || {};
    const reducedMotion = Boolean(options?.reducedMotion);

    const mapPixelW = map.width * TILE_SIZE;
    const mapPixelH = map.height * TILE_SIZE;

    let camX = Math.round(
      player.x * TILE_SIZE + TILE_SIZE / 2 - INTERNAL_WIDTH / 2
    );
    let camY = Math.round(
      player.y * TILE_SIZE + TILE_SIZE / 2 - INTERNAL_HEIGHT / 2
    );

    if (mapPixelW <= INTERNAL_WIDTH) {
      camX = -Math.floor((INTERNAL_WIDTH - mapPixelW) / 2);
    } else {
      camX = Math.max(0, Math.min(mapPixelW - INTERNAL_WIDTH, camX));
    }

    if (mapPixelH <= INTERNAL_HEIGHT) {
      camY = -Math.floor((INTERNAL_HEIGHT - mapPixelH) / 2);
    } else {
      camY = Math.max(0, Math.min(mapPixelH - INTERNAL_HEIGHT, camY));
    }

    ctx.fillStyle = '#080c18';
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    const animTick2 = Math.floor(timeSec * 2) % 2;
    const animTick3 = Math.floor(timeSec * 3) % 3;

    const lighting = getLightingOverlay(timeOfDay, isInterior, weather);
    const isWetWeather = weather === 'lluvia' || weather === 'tormenta';
    const isSnowWeather = weather === 'nieve';

    // 1. Draw Tiles with deterministic terrain variations, 4-phase time palettes & weather adaptations
    const chestObjects = (map.objects || []).filter((o) => o.kind === 'chest');

    for (let row = 0; row < map.height; row++) {
      const screenY = row * TILE_SIZE - camY;
      if (screenY < -TILE_SIZE || screenY > INTERNAL_HEIGHT) continue;

      for (let col = 0; col < map.width; col++) {
        const screenX = col * TILE_SIZE - camX;
        if (screenX < -TILE_SIZE || screenX > INTERNAL_WIDTH) continue;

        let tileType = map.tiles[row][col];
        if (tileType === 'chest') {
          const matchingChest = chestObjects.find(
            (c) => c.x === col && c.y === row
          );
          if (matchingChest && openedChests.includes(matchingChest.id)) {
            tileType = 'chest_open';
          }
        }

        let variant = (row * 17 + col * 31) % 3;
        if (tileType === 'water_anim') {
          variant = animTick3;
        } else if (
          tileType === 'flowers' ||
          tileType === 'shrine' ||
          tileType === 'capsule_pedestal' ||
          tileType === 'window' ||
          tileType === 'fountain' ||
          tileType === 'lantern' ||
          tileType === 'crystal' ||
          tileType === 'statue' ||
          tileType === 'brazier'
        ) {
          variant = animTick2;
        }

        const sprite = this.getTimeShiftedTile(
          tileType,
          variant,
          timeOfDay,
          isInterior
        );
        if (sprite) {
          ctx.drawImage(sprite, screenX, screenY);
        }

        // Directional shadow for tall exterior structures (trees, rocks, statues, shrines)
        if (
          !isInterior &&
          (tileType === 'tree' ||
            tileType === 'rock' ||
            tileType === 'statue' ||
            tileType === 'shrine') &&
          lighting.shadowAlpha > 0.1
        ) {
          ctx.fillStyle = `rgba(8, 12, 24, ${lighting.shadowAlpha * 0.7})`;
          const sx =
            lighting.shadowOffsetX >= 0
              ? screenX + 12
              : screenX - 2;
          ctx.fillRect(sx, screenY + 12, 4, 3);
        }

        // Wet ground puddles & raindrop ripples on paths/stone during rain or storm
        if (
          isWetWeather &&
          (tileType === 'path' ||
            tileType === 'special_ground' ||
            tileType === 'stairs') &&
          (row * 13 + col * 7) % 5 === 0
        ) {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
          ctx.fillRect(screenX + 3, screenY + 5, 8, 4);
          if ((row + col + animTick3) % 3 === 0) {
            ctx.fillStyle = 'rgba(186, 230, 253, 0.45)';
            ctx.fillRect(screenX + 6, screenY + 6, 2, 1);
          }
        }

        // Frost/snow cap details on trees, rocks, and cliffs during snow
        if (
          isSnowWeather &&
          (tileType === 'tree' ||
            tileType === 'rock' ||
            tileType === 'cliff' ||
            tileType === 'roof_purple' ||
            tileType === 'roof_teal')
        ) {
          ctx.fillStyle = 'rgba(241, 245, 249, 0.65)';
          ctx.fillRect(screenX + 3, screenY + 2, 10, 2);
        }

        // Subtle halo light around shrines, pedestals, fountains, crystals, statues & braziers
        if (
          tileType === 'shrine' ||
          tileType === 'capsule_pedestal' ||
          tileType === 'fountain' ||
          tileType === 'crystal' ||
          tileType === 'brazier' ||
          tileType === 'statue'
        ) {
          const nightBoost = timeOfDay === 'noche' ? 1.6 : 1.0;
          ctx.fillStyle =
            animTick2 === 0
              ? `rgba(56, 189, 248, ${0.14 * nightBoost})`
              : `rgba(245, 185, 66, ${0.16 * nightBoost})`;
          ctx.fillRect(screenX - 4, screenY - 4, 24, 24);
        }

        // Streetlamp / Lantern, Brazier & Window glow at sunset/night
        if (
          lighting.lanternGlowAlpha > 0.1 &&
          (tileType === 'lantern' ||
            tileType === 'window' ||
            tileType === 'brazier')
        ) {
          ctx.fillStyle = `rgba(253, 224, 71, ${
            lighting.lanternGlowAlpha * (animTick2 === 0 ? 0.26 : 0.34)
          })`;
          ctx.fillRect(screenX - 8, screenY - 8, 32, 32);
        }
      }
    }

    // 1b. Highlight tool-reactive objects or statue orientations on the current map
    for (const obj of map.objects || []) {
      const ox = obj.x * TILE_SIZE - camX;
      const oy = obj.y * TILE_SIZE - camY;
      if (ox < -TILE_SIZE || ox > INTERNAL_WIDTH || oy < -TILE_SIZE || oy > INTERNAL_HEIGHT) {
        continue;
      }

      // Draw directional indicator on rotatable statues
      if (obj.puzzleId && obj.puzzleId.startsWith('statue_')) {
        const dirVal = String(puzzleStates[obj.puzzleId] || 'sur');
        ctx.fillStyle = puzzleStates.atrio_statues_aligned
          ? '#38bdf8'
          : '#f5b942';
        if (dirVal === 'norte') ctx.fillRect(ox + 6, oy + 1, 4, 2);
        else if (dirVal === 'sur') ctx.fillRect(ox + 6, oy + 13, 4, 2);
        else if (dirVal === 'este') ctx.fillRect(ox + 13, oy + 6, 2, 4);
        else if (dirVal === 'oeste') ctx.fillRect(ox + 1, oy + 6, 2, 4);
      }

      // If Lente Astral is active, highlight objects that require Lente Astral or have hidden inscriptions
      if (
        activeToolId === 'tool_lente_astral' &&
        (obj.requiredToolId === 'tool_lente_astral' || obj.secretId)
      ) {
        ctx.fillStyle =
          animTick2 === 0
            ? 'rgba(56, 189, 248, 0.36)'
            : 'rgba(192, 132, 252, 0.32)';
        ctx.fillRect(ox - 2, oy - 2, 20, 20);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.strokeRect(ox + 0.5, oy + 0.5, 15, 15);
      }
    }

    // 2. Draw Portal exit indicators (respecting locked/hidden portals)
    for (const portal of map.portals) {
      if (
        portal.requiredPuzzleKey &&
        !puzzleStates[portal.requiredPuzzleKey]
      ) {
        // Draw sealed barrier rune until puzzle is solved
        const px = portal.x * TILE_SIZE - camX;
        const py = portal.y * TILE_SIZE - camY;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.32)';
        ctx.fillRect(px + 2, py + 2, 12, 12);
        ctx.fillStyle = '#fca5a5';
        ctx.fillRect(px + 6, py + 6, 4, 4);
        continue;
      }
      const px = portal.x * TILE_SIZE - camX;
      const py = portal.y * TILE_SIZE - camY;
      ctx.fillStyle =
        animTick2 === 0
          ? 'rgba(245, 185, 66, 0.42)'
          : 'rgba(157, 92, 255, 0.42)';
      ctx.fillRect(px + 3, py + 3, 10, 10);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(px + 6, py + 6, 4, 4);
    }

    // 3. Draw Collectible World Pickups with golden light halo
    for (const pickup of pickups) {
      if (pickup.mapId !== map.id || collectedPickups.includes(pickup.id))
        continue;
      const px = pickup.x * TILE_SIZE - camX;
      const py = pickup.y * TILE_SIZE - camY;
      const bob = reducedMotion ? 0 : Math.round(Math.sin(timeSec * 4) * 2);

      ctx.fillStyle = 'rgba(245, 185, 66, 0.22)';
      ctx.fillRect(px, py + bob, 16, 16);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(px + 4, py + 4 + bob, 8, 8);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(px + 5, py + 5 + bob, 6, 6);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(px + 6, py + 6 + bob, 2, 2);
    }

    // 3b. Draw Echo Visions (Sombras del Futuro) when ECOS DEL FUTURO is active
    const visions = (options?.echoVisions || []).filter(
      (v) => v.mapId === map.id
    );
    for (const v of visions) {
      const vx = v.x * TILE_SIZE - camX;
      const vy = v.y * TILE_SIZE - camY;
      const bob = reducedMotion ? 0 : Math.round(Math.sin(timeSec * 5) * 2);
      const isResolved = (options?.resolvedEchoes || []).includes(v.id);

      if (echoActive || activeToolId === 'tool_amuleto_eco') {
        ctx.fillStyle = isResolved
          ? 'rgba(56, 189, 248, 0.28)'
          : 'rgba(168, 85, 247, 0.36)';
        ctx.fillRect(vx - 4, vy - 4 + bob, 24, 24);
        ctx.fillStyle = '#1e1b4b';
        ctx.fillRect(vx + 2, vy + 1 + bob, 12, 14);
        ctx.fillStyle = isResolved ? '#38bdf8' : '#c084fc';
        ctx.fillRect(vx + 4, vy + 2 + bob, 8, 12);
        ctx.fillStyle = '#f5d0fe';
        ctx.fillRect(vx + 6, vy + 4 + bob, 4, 4);
      } else if (!isResolved) {
        ctx.fillStyle =
          animTick2 === 0
            ? 'rgba(168, 85, 247, 0.18)'
            : 'rgba(192, 132, 252, 0.08)';
        ctx.fillRect(vx + 5, vy + 5, 6, 6);
      }
    }

    // 4. Sort and Draw Actors (NPCs + Dynamic Event Actors + Player) with directional time shadows
    const idleCol = Math.floor(timeSec * 2.2) % 2;

    const renderList: { y: number; draw: () => void }[] = [];

    for (let idx = 0; idx < npcs.length; idx++) {
      const npc = npcs[idx];
      if (npc.mapId !== map.id) continue;
      // Do not duplicate NPC if they are currently traveling as the active companion
      if (options?.activeCompanionId && npc.id === `npc_${options.activeCompanionId}`) {
        continue;
      }
      renderList.push({
        y: npc.y,
        draw: () => {
          const nx = npc.x * TILE_SIZE - camX;
          const ny = npc.y * TILE_SIZE - camY;
          ctx.fillStyle = `rgba(8, 12, 24, ${lighting.shadowAlpha})`;
          ctx.fillRect(
            Math.round(nx + 3 + lighting.shadowOffsetX),
            Math.round(ny + 12 + lighting.shadowOffsetY),
            10,
            4
          );
          const arch =
            npc.archetype || resolveNpcArchetype(npc.id, npc.name);
          const simState = npcSimStates?.get(npc.id);
          const npcCol =
            simState && simState.walkFrame > 0
              ? 1 + ((simState.walkFrame - 1) % 4) + 1
              : Math.floor(timeSec * 2 + idx) % 2;
          this.drawSheetSprite(ctx, nx, ny, npc.dir, npcCol, arch);

          const hasUnfinishedQuest =
            npc.questId && !completedQuests.includes(npc.questId);
          if (hasUnfinishedQuest) {
            const bob = reducedMotion
              ? 0
              : Math.round(Math.sin(timeSec * 5) * 1.5);
            const isCurrentActive = npc.questId === activeQuestId;
            ctx.fillStyle = '#090d16';
            ctx.fillRect(nx + 4, ny - 22 + bob, 8, 9);
            ctx.fillStyle = isCurrentActive ? '#f5b942' : '#9d5cff';
            ctx.fillRect(nx + 5, ny - 21 + bob, 6, 7);
            ctx.fillStyle = '#090d16';
            ctx.fillRect(nx + 7, ny - 20 + bob, 2, 3);
            ctx.fillRect(nx + 7, ny - 16 + bob, 2, 1);
          }
        },
      });
    }

    for (let idx = 0; idx < activeEvents.length; idx++) {
      const ev = activeEvents[idx];
      if (ev.mapId !== map.id || completedEvents.includes(ev.id)) continue;
      renderList.push({
        y: ev.y,
        draw: () => {
          const ex = ev.x * TILE_SIZE - camX;
          const ey = ev.y * TILE_SIZE - camY;
          const evCol = Math.floor(timeSec * 2 + idx) % 2;
          this.drawSheetSprite(ctx, ex, ey, 'down', evCol, ev.archetype);
          const bob = reducedMotion
            ? 0
            : Math.round(Math.sin(timeSec * 4) * 1.5);
          ctx.fillStyle = '#090d16';
          ctx.fillRect(ex + 5, ey - 21 + bob, 6, 6);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(ex + 6, ey - 20 + bob, 4, 4);
        },
      });
    }

    renderList.push({
      y: player.y,
      draw: () => {
        const px = player.x * TILE_SIZE - camX;
        const py = player.y * TILE_SIZE - camY;
        ctx.fillStyle = `rgba(8, 12, 24, ${lighting.shadowAlpha})`;
        ctx.fillRect(
          Math.round(px + 3 + lighting.shadowOffsetX),
          Math.round(py + 12 + lighting.shadowOffsetY),
          10,
          4
        );
        const colIdx =
          player.walkFrame > 0 ? 1 + ((player.walkFrame - 1) % 4) + 1 : idleCol;
        this.drawProtagonistSprite(
          ctx,
          px,
          py,
          player.dir,
          colIdx,
          options?.playerAppearance || 'hombre',
          options?.equippedOutfit
        );

        // Active Brújula de Vespera directional pulse toward nearest unopened chest or secret on current map
        if (activeToolId === 'tool_brujula_vespera') {
          const uncollectedTarget = (map.objects || []).find(
            (o) =>
              (o.kind === 'chest' && !openedChests.includes(o.id)) ||
              (o.puzzleId && !puzzleStates[o.puzzleId])
          );
          if (uncollectedTarget) {
            const angle = Math.atan2(
              uncollectedTarget.y - player.y,
              uncollectedTarget.x - player.x
            );
            const rx = Math.round(px + 8 + Math.cos(angle) * 14);
            const ry = Math.round(py + 4 + Math.sin(angle) * 14);
            ctx.fillStyle = '#090d16';
            ctx.fillRect(rx - 2, ry - 2, 5, 5);
            ctx.fillStyle = animTick2 === 0 ? '#f5b942' : '#fef08a';
            ctx.fillRect(rx - 1, ry - 1, 3, 3);
          }
        }
      },
    });

    // Active Companion follower (V6)
    if (options?.activeCompanionId) {
      const compId = options.activeCompanionId;
      const archetype: CharacterArchetype =
        compId === 'lia'
          ? 'lia'
          : compId === 'tomas'
          ? 'citizen_smith'
          : compId === 'clara'
          ? 'citizen_gardener'
          : 'amaru';

      // Follower position 1 tile trailing the player's direction
      let fx = player.x;
      let fy = player.y;
      if (player.dir === 'up') fy += 1;
      else if (player.dir === 'down') fy -= 1;
      else if (player.dir === 'left') fx += 1;
      else if (player.dir === 'right') fx -= 1;

      // Keep within map boundaries
      fx = Math.max(0, Math.min(map.width - 1, fx));
      fy = Math.max(0, Math.min(map.height - 1, fy));

      const followerDir = player.dir;
      const followerCol =
        player.walkFrame > 0 ? 1 + ((player.walkFrame - 1) % 4) + 1 : idleCol;

      renderList.push({
        y: fy,
        draw: () => {
          const fxPx = fx * TILE_SIZE - camX;
          const fyPx = fy * TILE_SIZE - camY;
          ctx.fillStyle = `rgba(8, 12, 24, ${lighting.shadowAlpha})`;
          ctx.fillRect(
            Math.round(fxPx + 3 + lighting.shadowOffsetX),
            Math.round(fyPx + 12 + lighting.shadowOffsetY),
            10,
            4
          );
          this.drawSheetSprite(ctx, fxPx, fyPx, followerDir, followerCol, archetype);
        },
      });
    }

    renderList.sort((a, b) => a.y - b.y);
    for (const actor of renderList) {
      actor.draw();
    }

    // 5. Day/Night & Weather Ambient Lighting Tint
    ctx.fillStyle = lighting.tintColor;
    ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

    // 5a. Dynamic Regional Weather Layer (Exterior Maps)
    if (!isInterior && weather !== 'despejado') {
      const motionScale = reducedMotion ? 0.35 : 1.0;

      if (weather === 'nublado') {
        // Soft drifting cloud shadow bands
        ctx.fillStyle = 'rgba(15, 23, 42, 0.10)';
        const bandShift = Math.floor(timeSec * 8 * motionScale) % 120;
        ctx.fillRect(bandShift - 60, 30, 140, 48);
        ctx.fillRect(bandShift + 140, 150, 160, 56);
      } else if (weather === 'neblina') {
        // Layered horizontal mist banks
        ctx.fillStyle = 'rgba(226, 232, 240, 0.14)';
        ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
        const fogShift = Math.floor(timeSec * 14 * motionScale) % INTERNAL_WIDTH;
        ctx.fillStyle = 'rgba(241, 245, 249, 0.12)';
        for (let fy = 24; fy < INTERNAL_HEIGHT; fy += 52) {
          const offset = (fogShift + fy * 3) % INTERNAL_WIDTH;
          ctx.fillRect(offset - INTERNAL_WIDTH, fy, 220, 22);
          ctx.fillRect(offset, fy, 220, 22);
        }
      } else if (weather === 'lluvia' || weather === 'tormenta') {
        const isLowPower = reducedMotion || Boolean(options?.isMobile);
        const maxDrops = isLowPower ? 26 : MAX_WEATHER_DROPS;
        const dropCount =
          weather === 'tormenta'
            ? maxDrops
            : Math.floor(maxDrops * 0.65);
        ctx.fillStyle =
          weather === 'tormenta'
            ? 'rgba(186, 230, 253, 0.68)'
            : 'rgba(125, 211, 252, 0.55)';

        for (let i = 0; i < dropCount; i++) {
          const d = this.weatherDrops[i];
          d.x += d.speedX * dt * motionScale;
          d.y += d.speedY * dt * motionScale;
          if (d.y >= INTERNAL_HEIGHT) {
            d.y -= INTERNAL_HEIGHT;
            d.x = (d.x + 73) % INTERNAL_WIDTH;
          }
          if (d.x < 0) d.x += INTERNAL_WIDTH;

          const rx = Math.round(d.x);
          const ry = Math.round(d.y);
          ctx.fillRect(rx, ry, 1, d.len);
          ctx.fillRect(rx - 1, ry + 2, 1, Math.max(2, d.len - 2));
        }

        // Safe, gentle distant sky illumination during storm (disabled in reducedMotion)
        if (weather === 'tormenta' && !reducedMotion) {
          const stormCycle = timeSec % 9.5;
          if (stormCycle > 8.8 && stormCycle < 9.05) {
            ctx.fillStyle = 'rgba(224, 242, 254, 0.14)';
            ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);
          }
        }
      } else if (weather === 'nieve') {
        const isLowPower = reducedMotion || Boolean(options?.isMobile);
        const snowCount = isLowPower ? 20 : 38;
        ctx.fillStyle = 'rgba(248, 250, 252, 0.82)';
        for (let i = 0; i < snowCount; i++) {
          const d = this.weatherDrops[i];
          d.y += d.speedY * 0.22 * dt * motionScale;
          d.x +=
            Math.sin(timeSec * 2 + d.phase) * 12 * dt * motionScale;
          if (d.y >= INTERNAL_HEIGHT) d.y -= INTERNAL_HEIGHT;
          if (d.x < 0) d.x += INTERNAL_WIDTH;
          if (d.x >= INTERNAL_WIDTH) d.x -= INTERNAL_WIDTH;
          const size = i % 3 === 0 ? 2 : 1;
          ctx.fillRect(Math.round(d.x), Math.round(d.y), size, size);
        }
      }
    }

    // 5b. ECOS DEL FUTURO Visual Effect Overlay (Violet Tint + Distortion Waves)
    if (echoActive) {
      ctx.fillStyle = 'rgba(109, 40, 217, 0.24)';
      ctx.fillRect(0, 0, INTERNAL_WIDTH, INTERNAL_HEIGHT);

      if (!reducedMotion) {
        ctx.fillStyle = 'rgba(192, 132, 252, 0.15)';
        const waveOffset = Math.floor(timeSec * 28) % 16;
        for (let y = waveOffset; y < INTERNAL_HEIGHT; y += 16) {
          ctx.fillRect(0, y, INTERNAL_WIDTH, 1);
        }
      }

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.65)';
      ctx.lineWidth = 3;
      ctx.strokeRect(1.5, 1.5, INTERNAL_WIDTH - 3, INTERNAL_HEIGHT - 3);
    }

    // 6. Render Active Celebration Bursts (Fragments / Level Up / Puzzle Solved)
    for (let i = this.bursts.length - 1; i >= 0; i--) {
      const b = this.bursts[i];
      b.age += dt;
      if (b.age >= b.maxAge) {
        this.bursts.splice(i, 1);
        continue;
      }
      const progress = b.age / b.maxAge;
      const radius = 4 + progress * 22;
      const bx = b.x - camX;
      const by = b.y - camY;
      ctx.fillStyle = b.color;
      ctx.globalAlpha = 1 - progress;
      for (let a = 0; a < 8; a++) {
        const angle = (a * Math.PI) / 4 + progress * 1.5;
        const sx = Math.round(bx + Math.cos(angle) * radius);
        const sy = Math.round(by + Math.sin(angle) * radius);
        ctx.fillRect(sx, sy, 2, 2);
      }
    }
    ctx.globalAlpha = 1;

    // 7. Render Pooled Ambient Particles (Butterflies, Leaves, Starlight Motes / Violet Echo Motes)
    const particleMotion = reducedMotion ? 0.3 : 1.0;
    for (let i = 0; i < MAX_PARTICLES; i++) {
      const p = this.particles[i];
      p.x += p.vx * dt * particleMotion;
      p.y +=
        p.vy * dt * particleMotion +
        (p.kind === 'butterfly' && !reducedMotion
          ? Math.sin(timeSec * 8 + p.phase) * 0.4
          : 0);

      if (p.x < 0) p.x += INTERNAL_WIDTH;
      if (p.x >= INTERNAL_WIDTH) p.x -= INTERNAL_WIDTH;
      if (p.y < 0) p.y += INTERNAL_HEIGHT;
      if (p.y >= INTERNAL_HEIGHT) p.y -= INTERNAL_HEIGHT;

      ctx.fillStyle = echoActive ? '#e879f9' : p.color;
      ctx.globalAlpha =
        p.alpha * (0.65 + 0.35 * Math.sin(timeSec * 3 + p.phase));
      if (p.kind === 'butterfly') {
        const wing = Math.floor(timeSec * 10 + i) % 2;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), 2, wing === 0 ? 3 : 1);
        ctx.fillRect(
          Math.round(p.x + 2),
          Math.round(p.y),
          2,
          wing === 0 ? 3 : 1
        );
      } else {
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      }
    }
    ctx.globalAlpha = 1;

    // 8. Draw Floating Pixel-Art Proximity Indicator directly above the Single Active Target
    if (activeTarget) {
      const tx = Math.round(activeTarget.x * TILE_SIZE - camX + TILE_SIZE / 2);
      const ty = Math.round(activeTarget.y * TILE_SIZE - camY - 22);
      const bob = reducedMotion ? 0 : Math.round(Math.sin(timeSec * 6) * 1.5);

      ctx.font = 'bold 8px "Pixelify Sans", monospace';
      const label = activeTarget.shortTag;
      const textWidth = Math.ceil(ctx.measureText(label).width);
      const boxW = textWidth + 10;
      const boxH = 13;
      const boxX = Math.max(
        4,
        Math.min(INTERNAL_WIDTH - boxW - 4, Math.round(tx - boxW / 2))
      );
      const boxY = Math.max(4, ty - boxH + bob);

      ctx.fillStyle = '#080c18';
      ctx.fillRect(boxX - 1, boxY - 1, boxW + 2, boxH + 2);
      ctx.fillStyle = '#111b36';
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeStyle = '#f5b942';
      ctx.lineWidth = 1;
      ctx.strokeRect(boxX + 0.5, boxY + 0.5, boxW - 1, boxH - 1);

      ctx.fillStyle = '#fef08a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, boxX + boxW / 2, boxY + boxH / 2 + 0.5);

      ctx.fillStyle = '#f5b942';
      ctx.fillRect(tx - 2, boxY + boxH, 4, 2);
      ctx.fillRect(tx - 1, boxY + boxH + 2, 2, 1);
    }
  }
}

