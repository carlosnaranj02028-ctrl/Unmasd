import {
  CompanionId,
  EquippedOutfit,
  PlayerAppearance,
} from './types';
import {
  DEFAULT_STARTER_OUTFIT,
  ensureValidEquippedOutfit,
  getClothingItemById,
} from './customizationData';

export const ALLY_FRAME_W = 36;
export const ALLY_FRAME_H = 36;
export const ALLY_FRAME_COUNT = 10; // 360 x 36 px total

export const KRAGOR_FRAME_W = 56;
export const KRAGOR_FRAME_H = 56;
export const KRAGOR_FRAME_COUNT = 8; // 448 x 56 px total

export const COMBAT_ICON_SIZE = 16;
export const COMBAT_ICON_COUNT = 10; // 160 x 16 px total

export type AllyCombatFrameIndex =
  | 0 // Guardia 1
  | 1 // Guardia 2
  | 2 // Desplazamiento 1
  | 3 // Desplazamiento 2
  | 4 // Ataque Básico 1
  | 5 // Ataque Básico 2
  | 6 // Habilidad Especial 1
  | 7 // Habilidad Especial 2
  | 8 // Defensa Táctica
  | 9; // Reacción de Daño

export type KragorCombatFrameIndex =
  | 0 // Espera 1
  | 1 // Espera 2
  | 2 // Preparación Embestida
  | 3 // Embestida 1
  | 4 // Embestida 2
  | 5 // Puño de Granito 1
  | 6 // Puño de Granito 2
  | 7; // Reacción de Daño Dedicada

export type CombatIconType =
  | 'move'
  | 'attack'
  | 'skills'
  | 'defend'
  | 'end_turn'
  | 'broken_armor'
  | 'stunned'
  | 'slowed'
  | 'synchronized'
  | 'weakened';

const ICON_INDEX_MAP: Record<CombatIconType, number> = {
  move: 0,
  attack: 1,
  skills: 2,
  defend: 3,
  end_turn: 4,
  broken_armor: 5,
  stunned: 6,
  slowed: 7,
  synchronized: 8,
  weakened: 9,
};

function createOffscreenCanvas(width: number, height: number): HTMLCanvasElement {
  if (typeof document !== 'undefined') {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    return c;
  }
  return { width, height, getContext: () => null } as unknown as HTMLCanvasElement;
}

class CombatSpriteAtlas {
  private tivanCache: Map<string, HTMLCanvasElement> = new Map();
  private companionCache: Map<CompanionId, HTMLCanvasElement> = new Map();
  private kragorIntactSheet: HTMLCanvasElement | null = null;
  private kragorBrokenSheet: HTMLCanvasElement | null = null;
  private enemyCache: Map<string, HTMLCanvasElement> = new Map();
  private iconStrip: HTMLCanvasElement | null = null;

  /**
   * Returns the 360 x 36 px (10 frames of 36x36) modular combat sprite sheet for Tivan,
   * respecting gender appearance and all 4 equipped clothing slots.
   */
  public getTivanCombatSheet(
    appearance: PlayerAppearance = 'hombre',
    outfit?: Partial<EquippedOutfit>
  ): HTMLCanvasElement {
    const valid = ensureValidEquippedOutfit(outfit || DEFAULT_STARTER_OUTFIT);
    const cacheKey = `tivan_combat_${appearance}_${valid.top}_${valid.bottom}_${valid.footwear}_${valid.accessory}`;
    const existing = this.tivanCache.get(cacheKey);
    if (existing) return existing;

    const canvas = createOffscreenCanvas(ALLY_FRAME_W * ALLY_FRAME_COUNT, ALLY_FRAME_H);
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < ALLY_FRAME_COUNT; f++) {
      this.drawTivanFrame(ctx, f * ALLY_FRAME_W, 0, f as AllyCombatFrameIndex, appearance, valid);
    }

    this.tivanCache.set(cacheKey, canvas);
    return canvas;
  }

  /**
   * Returns the 360 x 36 px (10 frames of 36x36) combat sprite sheet for a companion.
   */
  public getCompanionCombatSheet(companionId: CompanionId): HTMLCanvasElement {
    const existing = this.companionCache.get(companionId);
    if (existing) return existing;

    const canvas = createOffscreenCanvas(ALLY_FRAME_W * ALLY_FRAME_COUNT, ALLY_FRAME_H);
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < ALLY_FRAME_COUNT; f++) {
      this.drawCompanionFrame(ctx, f * ALLY_FRAME_W, 0, f as AllyCombatFrameIndex, companionId);
    }

    this.companionCache.set(companionId, canvas);
    return canvas;
  }

  /**
   * Returns the 448 x 56 px (8 frames of 56x56) combat sprite sheet for Kragor
   * in either Intact Armor or Broken Armor state.
   */
  public getKragorCombatSheet(brokenArmor: boolean): HTMLCanvasElement {
    if (brokenArmor && this.kragorBrokenSheet) return this.kragorBrokenSheet;
    if (!brokenArmor && this.kragorIntactSheet) return this.kragorIntactSheet;

    const canvas = createOffscreenCanvas(KRAGOR_FRAME_W * KRAGOR_FRAME_COUNT, KRAGOR_FRAME_H);
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < KRAGOR_FRAME_COUNT; f++) {
      this.drawKragorFrame(ctx, f * KRAGOR_FRAME_W, 0, f as KragorCombatFrameIndex, brokenArmor);
    }

    if (brokenArmor) {
      this.kragorBrokenSheet = canvas;
    } else {
      this.kragorIntactSheet = canvas;
    }
    return canvas;
  }

  /**
   * Returns a 360 x 36 px or 448 x 56 px combat sheet for other V6 enemies (Gorehound, Neus Norial, Malakor).
   */
  public getEnemyCombatSheet(enemyId: string): HTMLCanvasElement {
    const key = enemyId.includes('malakor')
      ? 'malakor'
      : enemyId.includes('neus_norial')
      ? 'neus_norial'
      : 'gorehound';
    const existing = this.enemyCache.get(key);
    if (existing) return existing;

    const isColossal = key === 'malakor';
    const fw = isColossal ? KRAGOR_FRAME_W : ALLY_FRAME_W;
    const fh = isColossal ? KRAGOR_FRAME_H : ALLY_FRAME_H;
    const count = isColossal ? KRAGOR_FRAME_COUNT : ALLY_FRAME_COUNT;

    const canvas = createOffscreenCanvas(fw * count, fh);
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.imageSmoothingEnabled = false;

    for (let f = 0; f < count; f++) {
      this.drawOtherEnemyFrame(ctx, f * fw, 0, f, key);
    }

    this.enemyCache.set(key, canvas);
    return canvas;
  }

  /**
   * Returns the 160 x 16 px (10 icons of 16x16) pixel-art icon strip.
   */
  public getIconStrip(): HTMLCanvasElement {
    if (this.iconStrip) return this.iconStrip;

    const canvas = createOffscreenCanvas(COMBAT_ICON_SIZE * COMBAT_ICON_COUNT, COMBAT_ICON_SIZE);
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;
    ctx.imageSmoothingEnabled = false;

    const types: CombatIconType[] = [
      'move',
      'attack',
      'skills',
      'defend',
      'end_turn',
      'broken_armor',
      'stunned',
      'slowed',
      'synchronized',
      'weakened',
    ];

    types.forEach((type, idx) => {
      this.drawPixelIcon(ctx, idx * COMBAT_ICON_SIZE, 0, type);
    });

    this.iconStrip = canvas;
    return canvas;
  }

  public getIconIndex(type: CombatIconType): number {
    return ICON_INDEX_MAP[type];
  }

  // ============================================================================
  // 1. TIVAN MODULAR 7-LAYER COMBAT SPRITE COMPOSITOR (36 x 36 px)
  // ============================================================================

  private drawTivanFrame(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    frame: AllyCombatFrameIndex,
    appearance: PlayerAppearance,
    outfit: EquippedOutfit
  ) {
    const topItem =
      getClothingItemById(outfit.top) ||
      getClothingItemById(DEFAULT_STARTER_OUTFIT.top)!;
    const bottomItem =
      getClothingItemById(outfit.bottom) ||
      getClothingItemById(DEFAULT_STARTER_OUTFIT.bottom)!;
    const shoeItem =
      getClothingItemById(outfit.footwear) ||
      getClothingItemById(DEFAULT_STARTER_OUTFIT.footwear)!;
    const accItem =
      getClothingItemById(outfit.accessory) ||
      getClothingItemById(DEFAULT_STARTER_OUTFIT.accessory)!;

    const isFemale = appearance === 'mujer';
    const skin = isFemale ? '#fde2c8' : '#fbd3b0';
    const skinShadow = isFemale ? '#e2b58d' : '#dfa478';
    const hairMain = isFemale ? '#6b2114' : '#8c2d19';
    const hairHighlight = isFemale ? '#b45309' : '#d97706';
    const outline = '#090d16';

    // Pose kinematics per frame (0..9)
    let bodyDx = 0;
    let bodyDy = 0;
    let leftLegDx = 0;
    let leftLegDy = 0;
    let rightLegDx = 0;
    let rightLegDy = 0;
    let swordMode: 'guard' | 'windup' | 'slash' | 'skill_raise' | 'skill_release' | 'defend' | 'hurt' =
      'guard';

    switch (frame) {
      case 0: // Guardia 1
        bodyDy = 0;
        swordMode = 'guard';
        break;
      case 1: // Guardia 2 (respiración +1px)
        bodyDy = 1;
        swordMode = 'guard';
        break;
      case 2: // Desplazamiento 1
        bodyDx = 2;
        bodyDy = -1;
        leftLegDx = -3;
        leftLegDy = -1;
        rightLegDx = 3;
        swordMode = 'guard';
        break;
      case 3: // Desplazamiento 2
        bodyDx = 2;
        bodyDy = 0;
        leftLegDx = 3;
        rightLegDx = -3;
        rightLegDy = -1;
        swordMode = 'guard';
        break;
      case 4: // Ataque Básico 1 (carga)
        bodyDx = -2;
        bodyDy = 0;
        rightLegDx = 2;
        swordMode = 'windup';
        break;
      case 5: // Ataque Básico 2 (barrido frontal)
        bodyDx = 4;
        bodyDy = 1;
        leftLegDx = -2;
        rightLegDx = 4;
        swordMode = 'slash';
        break;
      case 6: // Habilidad Especial 1 (alzamiento de eco)
        bodyDx = 0;
        bodyDy = -1;
        swordMode = 'skill_raise';
        break;
      case 7: // Habilidad Especial 2 (liberación resonante)
        bodyDx = 3;
        bodyDy = 0;
        rightLegDx = 3;
        swordMode = 'skill_release';
        break;
      case 8: // Defensa Táctica
        bodyDx = -1;
        bodyDy = 2;
        swordMode = 'defend';
        break;
      case 9: // Reacción de Daño
        bodyDx = -4;
        bodyDy = 1;
        leftLegDx = 2;
        leftLegDy = -1;
        swordMode = 'hurt';
        break;
    }

    const bx = ox + 10 + bodyDx;
    const by = oy + 6 + bodyDy;

    // Ground shadow oval (Layer 1 base)
    ctx.fillStyle = 'rgba(8, 12, 24, 0.45)';
    ctx.fillRect(ox + 9, oy + 31, 18, 3);
    ctx.fillRect(ox + 11, oy + 30, 14, 1);

    // =========================================================================
    // LAYER 0: FLOWING CAPE BEHIND TORSO
    // =========================================================================
    if (accItem.style.hasCape) {
      const capeWave = frame === 2 || frame === 3 || frame === 5 || frame === 7 ? -3 : frame === 1 ? -1 : 0;
      ctx.fillStyle = outline;
      ctx.fillRect(bx - 4 + capeWave, by + 10, 11, 14);
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(bx - 3 + capeWave, by + 11, 9, 12);
      ctx.fillStyle = accItem.style.secondaryColor;
      ctx.fillRect(bx - 1 + capeWave, by + 11, 4, 10);
      if (accItem.style.trimColor) {
        ctx.fillStyle = accItem.style.trimColor;
        ctx.fillRect(bx - 3 + capeWave, by + 22, 9, 1);
      }
    }

    // =========================================================================
    // LAYER 2: LOWER BODY (BOTTOM) & FOOTWEAR (BOOTS/SHOES)
    // =========================================================================
    const bootH =
      shoeItem.style.bootHeight === 'tall'
        ? 4
        : shoeItem.style.bootHeight === 'mid'
        ? 3
        : 2;
    const pantsH = 7 - bootH;

    // Left (back) leg
    const llx = bx + 2 + leftLegDx;
    const lly = oy + 24 + leftLegDy;
    ctx.fillStyle = outline;
    ctx.fillRect(llx - 1, lly - 1, 6, 8);
    ctx.fillStyle = bottomItem.style.primaryColor;
    ctx.fillRect(llx, lly, 4, pantsH);
    ctx.fillStyle = shoeItem.style.primaryColor;
    ctx.fillRect(llx, lly + pantsH, 4, bootH);
    if (shoeItem.style.trimColor) {
      ctx.fillStyle = shoeItem.style.trimColor;
      ctx.fillRect(llx, lly + pantsH, 4, 1);
    }

    // Right (front) leg
    const rlx = bx + 8 + rightLegDx;
    const rly = oy + 24 + rightLegDy;
    ctx.fillStyle = outline;
    ctx.fillRect(rlx - 1, rly - 1, 6, 8);
    ctx.fillStyle = bottomItem.style.secondaryColor || bottomItem.style.primaryColor;
    ctx.fillRect(rlx, rly, 4, pantsH);
    ctx.fillStyle = shoeItem.style.secondaryColor || shoeItem.style.primaryColor;
    ctx.fillRect(rlx, rly + pantsH, 5, bootH);
    if (shoeItem.style.trimColor) {
      ctx.fillStyle = shoeItem.style.trimColor;
      ctx.fillRect(rlx, rly + pantsH, 4, 1);
    }

    // =========================================================================
    // LAYER 3: UPPER BODY (TOP) WITH SILHOUETTE DIFFERENTIATION
    // =========================================================================
    const torsoW = isFemale ? 11 : 13;
    const torsoX = isFemale ? bx + 2 : bx + 1;
    const torsoY = by + 10;
    const isLong = Boolean(topItem.style.isLongTunic);
    const torsoH = isLong ? 11 : 9;

    ctx.fillStyle = outline;
    ctx.fillRect(torsoX - 1, torsoY - 1, torsoW + 2, torsoH + 2);
    if (isFemale) {
      // Tapered waist & flared skirt/tunic hem
      ctx.fillRect(torsoX - 2, torsoY + 6, torsoW + 4, torsoH - 5);
    }

    ctx.fillStyle = topItem.style.primaryColor;
    ctx.fillRect(torsoX, torsoY, torsoW, torsoH);
    ctx.fillStyle = topItem.style.secondaryColor;
    ctx.fillRect(torsoX + 2, torsoY + 1, torsoW - 4, torsoH - 2);

    // Belt and trim details
    if (topItem.style.trimColor) {
      ctx.fillStyle = topItem.style.trimColor;
      ctx.fillRect(torsoX, torsoY + torsoH - 1, torsoW, 1);
      ctx.fillRect(torsoX + Math.floor(torsoW / 2) - 1, torsoY, 2, torsoH);
    }
    // Leather belt
    ctx.fillStyle = '#292524';
    ctx.fillRect(torsoX, torsoY + 6, torsoW, 2);
    ctx.fillStyle = '#f5b942';
    ctx.fillRect(torsoX + Math.floor(torsoW / 2), torsoY + 6, 2, 2);

    // Back arm (Left arm)
    ctx.fillStyle = outline;
    ctx.fillRect(torsoX - 3, torsoY + 1, 4, 7);
    ctx.fillStyle =
      topItem.style.sleeveStyle === 'short' ? skinShadow : topItem.style.primaryColor;
    ctx.fillRect(torsoX - 2, torsoY + 2, 2, 4);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(torsoX - 2, torsoY + 6, 2, 2);

    // =========================================================================
    // LAYER 4: HEAD, ANATOMY & HAIR (HOMBRE VS MUJER)
    // =========================================================================
    const hx = bx + 2;
    const hy = by;

    // Head outline & face 3/4 facing right
    ctx.fillStyle = outline;
    ctx.fillRect(hx - 1, hy - 1, 12, 11);
    ctx.fillStyle = skin;
    ctx.fillRect(hx, hy, 10, 9);
    ctx.fillStyle = skinShadow;
    ctx.fillRect(hx, hy + 6, 10, 3);
    ctx.fillRect(hx, hy, 2, 9);

    // Expressive eyes (3/4 right view)
    if (frame === 9) {
      // Hurt wince eyes
      ctx.fillStyle = '#090d16';
      ctx.fillRect(hx + 5, hy + 4, 2, 1);
      ctx.fillRect(hx + 8, hy + 4, 2, 1);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(hx + 4, hy + 4, 2, 2);
      ctx.fillRect(hx + 8, hy + 4, 2, 2);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(hx + 5, hy + 4, 1, 2);
      ctx.fillRect(hx + 9, hy + 4, 1, 2);
    }

    // Hair styling
    ctx.fillStyle = outline;
    ctx.fillRect(hx - 2, hy - 2, 13, 5);
    ctx.fillStyle = hairMain;
    ctx.fillRect(hx - 1, hy - 1, 11, 4);
    ctx.fillRect(hx - 1, hy + 1, 3, 6); // Back hairlock
    ctx.fillStyle = hairHighlight;
    ctx.fillRect(hx + 2, hy - 1, 6, 2);

    if (isFemale) {
      // Longer flowing hair locks over shoulders
      ctx.fillStyle = outline;
      ctx.fillRect(hx - 3, hy + 2, 4, 9);
      ctx.fillStyle = hairMain;
      ctx.fillRect(hx - 2, hy + 2, 3, 8);
      ctx.fillStyle = hairHighlight;
      ctx.fillRect(hx - 1, hy + 3, 1, 5);
    } else {
      // Spiky frontbangs for male Tivan
      ctx.fillStyle = hairMain;
      ctx.fillRect(hx + 7, hy + 1, 3, 2);
    }

    // =========================================================================
    // LAYER 5: HEADGEAR, SCARF, HOOD, CROWN OR SATCHEL ACCESSORY
    // =========================================================================
    const headAcc = accItem.style.hasHoodOrCrown;
    if (headAcc === 'bandana') {
      // Crimson traveler scarf / bandana around neck & forehead
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(hx - 1, hy + 1, 11, 2);
      ctx.fillRect(torsoX, torsoY, torsoW, 2);
      ctx.fillStyle = accItem.style.trimColor || '#fbbf24';
      ctx.fillRect(hx + 8, hy + 1, 2, 2);
    } else if (headAcc === 'diadem') {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(hx, hy, 10, 1);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(hx + 6, hy - 1, 2, 2);
    } else if (headAcc === 'crown') {
      ctx.fillStyle = outline;
      ctx.fillRect(hx, hy - 4, 10, 4);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(hx + 1, hy - 3, 8, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(hx + 5, hy - 2, 2, 2);
    } else if (headAcc === 'hood') {
      ctx.fillStyle = outline;
      ctx.fillRect(hx - 2, hy - 2, 13, 10);
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(hx - 1, hy - 1, 11, 4);
      ctx.fillRect(hx - 1, hy + 1, 4, 7);
    } else if (headAcc === 'satchel') {
      // Cross-body chronicle strap
      ctx.fillStyle = accItem.style.primaryColor;
      for (let i = 0; i < 7; i++) {
        ctx.fillRect(torsoX + 1 + i, torsoY + i, 2, 2);
      }
      ctx.fillStyle = accItem.style.trimColor || '#fbbf24';
      ctx.fillRect(torsoX + 7, torsoY + 6, 4, 4);
    }

    // =========================================================================
    // LAYER 6: RIGHT ARM, CHRONO-BLADE & SKILL RESONANCE
    // =========================================================================
    const armX = torsoX + torsoW - 2;
    const armY = torsoY + 2;

    if (swordMode === 'guard') {
      // Forward arm holding sword at 45 deg
      ctx.fillStyle = outline;
      ctx.fillRect(armX, armY, 5, 5);
      ctx.fillStyle = topItem.style.primaryColor;
      ctx.fillRect(armX + 1, armY + 1, 3, 3);
      ctx.fillStyle = skin;
      ctx.fillRect(armX + 3, armY + 2, 2, 2);

      // Hilt & Guard
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(armX + 4, armY - 1, 3, 5);
      // Steel Blade diagonal up-right
      for (let b = 0; b < 9; b++) {
        ctx.fillStyle = outline;
        ctx.fillRect(armX + 6 + b, armY - 1 - b, 3, 3);
        ctx.fillStyle = b % 2 === 0 ? '#f8fafc' : '#cbd5e1';
        ctx.fillRect(armX + 7 + b, armY - b, 2, 2);
      }
      if (frame === 1) {
        // Subtle glint on blade tip
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(armX + 13, armY - 7, 2, 2);
      }
    } else if (swordMode === 'windup') {
      // Sword pulled back behind shoulder
      ctx.fillStyle = skin;
      ctx.fillRect(bx - 2, armY - 2, 3, 3);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(bx - 4, armY - 4, 3, 3);
      for (let b = 0; b < 8; b++) {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(bx - 5 - b, armY - 5 - Math.floor(b / 2), 2, 2);
      }
    } else if (swordMode === 'slash') {
      // Extended forward horizontal slash with motion trail
      ctx.fillStyle = skin;
      ctx.fillRect(armX + 2, armY, 4, 3);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(armX + 5, armY - 1, 2, 5);
      ctx.fillStyle = outline;
      ctx.fillRect(armX + 7, armY - 1, 11, 4);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(armX + 7, armY, 10, 2);
      // Slash arc trail
      ctx.fillStyle = 'rgba(56, 189, 248, 0.85)';
      ctx.fillRect(armX + 9, armY - 6, 6, 2);
      ctx.fillRect(armX + 13, armY - 4, 4, 3);
      ctx.fillRect(armX + 12, armY + 3, 5, 2);
    } else if (swordMode === 'skill_raise') {
      // Blade raised straight to the sky with temporal echo aura
      ctx.fillStyle = skin;
      ctx.fillRect(armX + 1, hy + 2, 3, 4);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(armX, hy, 5, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(armX + 1, oy + 1, 3, hy - oy);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(armX + 2, oy + 2, 1, hy - oy - 2);
    } else if (swordMode === 'skill_release') {
      // Resonant energy wave discharge
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(armX + 4, armY - 1, 2, 5);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(armX + 6, armY - 2, 12, 5);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(armX + 7, armY - 1, 10, 3);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(armX + 15, armY - 5, 2, 11);
    } else if (swordMode === 'defend') {
      // Guarding behind vertical blade & golden barrier
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(armX + 4, hy + 2, 3, 16);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.fillRect(armX + 7, hy, 2, 22);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(armX + 7, hy + 8, 3, 4);
    } else if (swordMode === 'hurt') {
      // Recoiling arm & flash
      ctx.fillStyle = skin;
      ctx.fillRect(armX + 1, armY - 2, 3, 3);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(armX + 3, armY + 1, 7, 2);
    }
  }

  // ============================================================================
  // 2. COMPANION COMBAT SPRITES (TOMÁS, LÍA, CLARA, AMARU) — 360 x 36 px
  // ============================================================================

  private drawCompanionFrame(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    frame: AllyCombatFrameIndex,
    companionId: CompanionId
  ) {
    const outline = '#090d16';

    let bodyDx = 0;
    let bodyDy = 0;
    let stride = 0;

    if (frame === 1) bodyDy = 1;
    if (frame === 2) {
      bodyDx = 2;
      bodyDy = -1;
      stride = -3;
    }
    if (frame === 3) {
      bodyDx = 2;
      stride = 3;
    }
    if (frame === 4) bodyDx = -2;
    if (frame === 5) {
      bodyDx = 4;
      bodyDy = 1;
    }
    if (frame === 6) bodyDy = -1;
    if (frame === 7) bodyDx = 3;
    if (frame === 8) {
      bodyDx = -1;
      bodyDy = 2;
    }
    if (frame === 9) {
      bodyDx = -4;
      bodyDy = 1;
    }

    const bx = ox + 9 + bodyDx;
    const by = oy + 5 + bodyDy;

    // Ground shadow
    ctx.fillStyle = 'rgba(8, 12, 24, 0.45)';
    ctx.fillRect(ox + 8, oy + 31, 19, 3);

    if (companionId === 'tomas') {
      // TOMÁS: Artificer & Clockwork Manipulator (Steampunk goggles, leather apron, brass wrench-hammer, clockwork pack)
      // Backpack brass gear
      ctx.fillStyle = outline;
      ctx.fillRect(bx - 4, by + 9, 6, 11);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(bx - 3, by + 10, 4, 9);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(bx - 2, by + 12, 2, 5);

      // Boots & heavy trousers
      ctx.fillStyle = outline;
      ctx.fillRect(bx + 1 + stride, oy + 24, 5, 8);
      ctx.fillRect(bx + 8 - stride, oy + 24, 5, 8);
      ctx.fillStyle = '#334155';
      ctx.fillRect(bx + 2 + stride, oy + 24, 3, 4);
      ctx.fillRect(bx + 9 - stride, oy + 24, 3, 4);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bx + 2 + stride, oy + 28, 4, 3);
      ctx.fillRect(bx + 9 - stride, oy + 28, 4, 3);

      // Torso: Crimson vest + blacksmith leather apron
      ctx.fillStyle = outline;
      ctx.fillRect(bx, by + 10, 14, 11);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(bx + 1, by + 11, 12, 9);
      ctx.fillStyle = '#78350f'; // Apron
      ctx.fillRect(bx + 3, by + 12, 9, 8);
      ctx.fillStyle = '#f59e0b'; // Brass buckle
      ctx.fillRect(bx + 6, by + 15, 3, 2);

      // Head & Brass Goggles
      ctx.fillStyle = outline;
      ctx.fillRect(bx + 1, by, 12, 11);
      ctx.fillStyle = '#f2bfa0';
      ctx.fillRect(bx + 2, by + 1, 10, 9);
      ctx.fillStyle = '#b91c1c'; // Auburn hair
      ctx.fillRect(bx + 1, by, 11, 4);
      // Goggles on forehead
      ctx.fillStyle = '#451a03';
      ctx.fillRect(bx + 1, by + 2, 11, 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(bx + 4, by + 1, 4, 3);
      ctx.fillRect(bx + 9, by + 1, 3, 3);
      ctx.fillStyle = '#38bdf8'; // Cyan lenses
      ctx.fillRect(bx + 5, by + 2, 2, 1);
      ctx.fillRect(bx + 10, by + 2, 1, 1);

      // Eyes
      ctx.fillStyle = '#090d16';
      ctx.fillRect(bx + 7, by + 6, 1, 2);
      ctx.fillRect(bx + 10, by + 6, 1, 2);

      // Weapon: Brass Clockwork Wrench-Hammer
      const wx = bx + 12;
      const wy = by + 11;
      if (frame === 5) {
        // Hammer smash forward
        ctx.fillStyle = '#78350f';
        ctx.fillRect(wx, wy + 2, 8, 2);
        ctx.fillStyle = outline;
        ctx.fillRect(wx + 6, wy - 3, 7, 10);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(wx + 7, wy - 2, 5, 8);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(wx + 9, wy, 2, 4);
      } else if (frame === 6 || frame === 7) {
        // Launching glowing Golden Clockwork Gear
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(wx + 4, wy - 4, 8, 8);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(wx + 6, wy - 2, 4, 4);
      } else if (frame === 8) {
        // Brass shield barrier
        ctx.fillStyle = '#d97706';
        ctx.fillRect(wx + 2, by + 4, 4, 18);
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(wx + 3, by + 8, 2, 10);
      } else {
        // Ready wrench-hammer pose
        ctx.fillStyle = '#78350f';
        ctx.fillRect(wx + 1, wy - 4, 2, 11);
        ctx.fillStyle = outline;
        ctx.fillRect(wx - 2, wy - 8, 8, 6);
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(wx - 1, wy - 7, 6, 4);
      }
    } else if (companionId === 'lia') {
      // LÍA: Agile Vanguard & Star Explorer (Violet robe, cyan star-bow/staff, purple hair)
      ctx.fillStyle = outline;
      ctx.fillRect(bx + 2 + stride, oy + 24, 4, 7);
      ctx.fillRect(bx + 8 - stride, oy + 24, 4, 7);
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(bx + 3 + stride, oy + 24, 2, 6);
      ctx.fillRect(bx + 9 - stride, oy + 24, 2, 6);

      // Astral Tunic
      ctx.fillStyle = outline;
      ctx.fillRect(bx + 1, by + 10, 12, 12);
      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(bx + 2, by + 11, 10, 10);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(bx + 2, by + 19, 10, 1);

      // Head & Violet Hair
      ctx.fillStyle = outline;
      ctx.fillRect(bx + 1, by, 11, 10);
      ctx.fillStyle = '#fde2c8';
      ctx.fillRect(bx + 2, by + 1, 9, 8);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(bx, by - 1, 11, 4);
      ctx.fillRect(bx, by + 2, 3, 8);
      ctx.fillStyle = '#090d16';
      ctx.fillRect(bx + 6, by + 5, 1, 2);
      ctx.fillRect(bx + 9, by + 5, 1, 2);

      // Wind Bow / Star Staff
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(bx + 13, by + 5, 2, 14);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx + 12, by + 3, 4, 4);
      if (frame === 5 || frame === 7) {
        // Wind arrow streak
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(bx + 15, by + 10, 10, 2);
      }
    } else if (companionId === 'clara') {
      // CLARA: Botanist & Healer (Emerald tunic, herbalist oak staff, straw ribbon)
      ctx.fillStyle = outline;
      ctx.fillRect(bx + 1, by + 10, 12, 13);
      ctx.fillStyle = '#065f46';
      ctx.fillRect(bx + 2, by + 11, 10, 11);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(bx + 4, by + 12, 6, 8);

      ctx.fillStyle = outline;
      ctx.fillRect(bx + 1, by, 11, 10);
      ctx.fillStyle = '#eab688';
      ctx.fillRect(bx + 2, by + 1, 9, 8);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(bx + 1, by, 10, 4);
      ctx.fillStyle = '#10b981';
      ctx.fillRect(bx + 13, by + 3, 3, 18);
      if (frame === 6 || frame === 7) {
        ctx.fillStyle = '#6ee7b7';
        ctx.fillRect(bx + 12, by, 5, 5);
      }
    } else {
      // AMARU: Tectonic Tank & Forgemaster (Broad shoulders, poncho, volcanic warhammer)
      ctx.fillStyle = outline;
      ctx.fillRect(bx - 1, by + 9, 16, 14);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(bx, by + 10, 14, 12);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(bx + 2, by + 11, 10, 4);
      ctx.fillStyle = '#d99b66';
      ctx.fillRect(bx + 2, by + 1, 10, 8);
      ctx.fillStyle = '#1c1917';
      ctx.fillRect(bx + 1, by, 11, 3);
      // Forge Hammer
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(bx + 14, by + 4, 6, 10);
    }
  }

  // ============================================================================
  // 3. KRAGOR COLOSSAL BOSS SPRITES (448 x 56 px · 8 FRAMES OF 56x56)
  //    Hoja A: Coraza Íntegra | Hoja B: Coraza Quebrada (Exposed Blue Astral Core)
  // ============================================================================

  private drawKragorFrame(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    frame: KragorCombatFrameIndex,
    brokenArmor: boolean
  ) {
    const outline = '#090d16';
    const rockDark = '#292524';
    const rockMain = '#57534e';
    const rockLight = '#78716c';
    const bronzeDark = '#7c2d12';
    const bronzeMain = '#c2410c';
    const bronzeBright = '#f59e0b';
    const mossColor = '#3f6212';

    // Frame pose offsets (facing LEFT towards the party)
    let bodyDx = 0;
    let bodyDy = brokenArmor ? 2 : 0; // Slightly hunched when armor is shattered
    let armRaiseY = 0;
    let armSmashY = 0;
    let isCharging = false;
    let isHurtPose = false;

    switch (frame) {
      case 0: // Espera 1
        break;
      case 1: // Espera 2 (heavy breathing +1px)
        bodyDy += 1;
        break;
      case 2: // Preparación Embestida (low crouch, glowing eyes)
        bodyDx = 2;
        bodyDy += 3;
        break;
      case 3: // Embestida 1 (charging forward left)
        bodyDx = -4;
        bodyDy += 2;
        isCharging = true;
        break;
      case 4: // Embestida 2 (massive shoulder impact)
        bodyDx = -6;
        bodyDy += 1;
        isCharging = true;
        break;
      case 5: // Puño de Granito 1 (arms raised high)
        bodyDy -= 2;
        armRaiseY = -10;
        break;
      case 6: // Puño de Granito 2 (ground slam)
        bodyDx = -3;
        bodyDy += 3;
        armSmashY = 8;
        break;
      case 7: // Reacción de Daño Dedicada (recoil right +4px, chest arched)
        bodyDx = 4;
        bodyDy -= 1;
        isHurtPose = true;
        break;
    }

    const bx = ox + 10 + bodyDx;
    const by = oy + 6 + bodyDy;

    // 1. Colossal elliptical shadow on floor
    ctx.fillStyle = 'rgba(5, 8, 17, 0.55)';
    ctx.fillRect(ox + 6, oy + 48, 44, 5);
    ctx.fillRect(ox + 10, oy + 46, 36, 7);

    // 2. Massive Pillar Legs (Granite & Bronze Greaves)
    const leftLegX = bx + (isCharging ? 4 : 8);
    const rightLegX = bx + (isCharging ? 22 : 20);
    const legY = oy + 35;

    // Back leg
    ctx.fillStyle = outline;
    ctx.fillRect(rightLegX - 1, legY - 1, 11, 15);
    ctx.fillStyle = rockDark;
    ctx.fillRect(rightLegX, legY, 9, 13);
    ctx.fillStyle = bronzeDark;
    ctx.fillRect(rightLegX, legY + 4, 9, 6);

    // Front leg
    ctx.fillStyle = outline;
    ctx.fillRect(leftLegX - 1, legY - 1, 12, 15);
    ctx.fillStyle = rockMain;
    ctx.fillRect(leftLegX, legY, 10, 13);
    ctx.fillStyle = bronzeMain;
    ctx.fillRect(leftLegX, legY + 3, 10, 7);
    ctx.fillStyle = bronzeBright;
    ctx.fillRect(leftLegX + 1, legY + 4, 2, 5);

    // 3. Monolithic Torso (Granite Body + Bronze Chestplate)
    ctx.fillStyle = outline;
    ctx.fillRect(bx + 3, by + 8, 30, 24);
    ctx.fillStyle = rockDark;
    ctx.fillRect(bx + 4, by + 9, 28, 22);
    ctx.fillStyle = rockMain;
    ctx.fillRect(bx + 6, by + 10, 24, 20);
    ctx.fillStyle = rockLight;
    ctx.fillRect(bx + 7, by + 11, 10, 6);

    if (!brokenArmor) {
      // =====================================================================
      // HOJA A: CORAZA ÍNTEGRA (Intact Riveted Bronze Chestplate & Grate)
      // =====================================================================
      ctx.fillStyle = outline;
      ctx.fillRect(bx + 5, by + 12, 24, 16);
      ctx.fillStyle = bronzeDark;
      ctx.fillRect(bx + 6, by + 13, 22, 14);
      ctx.fillStyle = bronzeMain;
      ctx.fillRect(bx + 7, by + 14, 18, 12);
      ctx.fillStyle = bronzeBright;
      ctx.fillRect(bx + 8, by + 14, 16, 2);
      // Rivets
      ctx.fillRect(bx + 8, by + 17, 2, 2);
      ctx.fillRect(bx + 21, by + 17, 2, 2);
      ctx.fillRect(bx + 8, by + 23, 2, 2);
      ctx.fillRect(bx + 21, by + 23, 2, 2);

      // Protective chest grate with subtle inner glow
      ctx.fillStyle = '#090d16';
      ctx.fillRect(bx + 11, by + 17, 9, 7);
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(bx + 13, by + 19, 5, 3);
      // Intact vertical bronze bars covering core
      ctx.fillStyle = bronzeBright;
      ctx.fillRect(bx + 13, by + 17, 1, 7);
      ctx.fillRect(bx + 15, by + 17, 1, 7);
      ctx.fillRect(bx + 17, by + 17, 1, 7);

      if (isHurtPose) {
        // Frame 7 Intact: Metallic friction sparks on bronze armor
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(bx + 4, by + 14, 3, 3);
        ctx.fillRect(bx + 9, by + 10, 2, 4);
        ctx.fillRect(bx + 2, by + 22, 4, 2);
      }
    } else {
      // =====================================================================
      // HOJA B: CORAZA QUEBRADA (Shattered Plates & Exposed Astral Core)
      // =====================================================================
      // Jagged broken bronze edges on sides
      ctx.fillStyle = bronzeDark;
      ctx.fillRect(bx + 6, by + 13, 6, 13);
      ctx.fillRect(bx + 21, by + 14, 6, 12);
      ctx.fillStyle = bronzeMain;
      ctx.fillRect(bx + 7, by + 14, 4, 10);

      // Deep fractures across granite torso
      ctx.fillStyle = '#090d16';
      ctx.fillRect(bx + 10, by + 12, 13, 15);
      ctx.fillRect(bx + 8, by + 16, 3, 2);
      ctx.fillRect(bx + 22, by + 19, 4, 2);

      // EXPOSED BLAZING BLUE ASTRAL CORE
      const corePulse = frame % 2 === 0 || isHurtPose ? 1 : 0;
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(bx + 10 - corePulse, by + 14 - corePulse, 12 + corePulse * 2, 11 + corePulse * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx + 12, by + 15, 8, 9);
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(bx + 14, by + 17, 4, 5);

      if (isHurtPose) {
        // Frame 7 Broken: Violent astral ether eruption & flying rock shards
        ctx.fillStyle = '#7dd3fc';
        ctx.fillRect(bx + 5, by + 11, 4, 4);
        ctx.fillRect(bx + 15, by + 8, 3, 5);
        ctx.fillRect(bx + 3, by + 21, 5, 3);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx + 13, by + 16, 6, 6);
      }
    }

    // 4. Colossal Helmeted Head (Set low into massive shoulders, facing left)
    const hx = bx + (isHurtPose ? 8 : 5);
    const hy = by + (isHurtPose ? 2 : 5);
    ctx.fillStyle = outline;
    ctx.fillRect(hx - 1, hy - 1, 15, 13);
    ctx.fillStyle = bronzeDark;
    ctx.fillRect(hx, hy, 13, 11);
    ctx.fillStyle = bronzeMain;
    ctx.fillRect(hx + 2, hy + 1, 9, 5);
    // Ancient crest & moss
    ctx.fillStyle = mossColor;
    ctx.fillRect(hx + 4, hy, 6, 2);
    // Visor slit with blazing eyes
    ctx.fillStyle = '#090d16';
    ctx.fillRect(hx + 1, hy + 5, 8, 3);
    ctx.fillStyle = frame === 2 || isCharging ? '#ef4444' : '#f59e0b';
    ctx.fillRect(hx + 2, hy + 6, 3, 2);
    ctx.fillRect(hx + 6, hy + 6, 2, 2);

    // 5. Massive Pauldrons & Granite-Fist Arms
    // Right (Front/East) Shoulder & Arm
    const rArmX = bx + 24;
    const rArmY = by + 9 + armRaiseY + armSmashY;

    ctx.fillStyle = outline;
    ctx.fillRect(rArmX - 1, rArmY - 2, 14, 24);
    // Pauldron (cracked if brokenArmor)
    ctx.fillStyle = brokenArmor ? rockDark : bronzeMain;
    ctx.fillRect(rArmX, rArmY - 1, 12, 9);
    if (!brokenArmor) {
      ctx.fillStyle = bronzeBright;
      ctx.fillRect(rArmX + 2, rArmY, 8, 2);
      ctx.fillStyle = mossColor;
      ctx.fillRect(rArmX + 1, rArmY + 1, 5, 3);
    } else {
      // Cracked shoulder fissure
      ctx.fillStyle = '#090d16';
      ctx.fillRect(rArmX + 4, rArmY - 1, 3, 6);
    }

    // Granite Forearm & Fist
    ctx.fillStyle = rockMain;
    ctx.fillRect(rArmX + 1, rArmY + 8, 11, 13);
    ctx.fillStyle = rockLight;
    ctx.fillRect(rArmX + 2, rArmY + 9, 4, 10);
    ctx.fillStyle = bronzeDark; // Bronze knuckles
    ctx.fillRect(rArmX, rArmY + 17, 12, 4);

    // Left (Leading/West) Arm
    const lArmX = bx - (isCharging ? 6 : 3);
    const lArmY = by + 11 + armRaiseY + armSmashY;
    ctx.fillStyle = outline;
    ctx.fillRect(lArmX - 1, lArmY - 1, 10, 19);
    ctx.fillStyle = rockMain;
    ctx.fillRect(lArmX, lArmY, 8, 17);
    ctx.fillStyle = bronzeMain;
    ctx.fillRect(lArmX, lArmY + 12, 8, 4);

    // Ground shockwave on Frame 6 (Puño de Granito impact)
    if (frame === 6) {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(ox + 2, oy + 46, 18, 3);
      ctx.fillStyle = '#78716c';
      ctx.fillRect(ox + 4, oy + 42, 4, 4);
      ctx.fillRect(ox + 14, oy + 40, 3, 5);
    }
  }

  // ============================================================================
  // 4. OTHER V6 ENEMY SPRITES (GOREHOUND, NEUS NORIAL, MALAKOR)
  // ============================================================================

  private drawOtherEnemyFrame(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    frame: number,
    enemyKey: 'gorehound' | 'neus_norial' | 'malakor'
  ) {
    const outline = '#090d16';
    const bob = frame % 2 === 1 ? 1 : 0;
    const attackShift = frame === 4 || frame === 5 ? -4 : frame === 7 || frame === 9 ? 3 : 0;

    if (enemyKey === 'gorehound') {
      // Spectral River Hound (36x36)
      const bx = ox + 6 + attackShift;
      const by = oy + 12 + bob;
      ctx.fillStyle = 'rgba(8, 12, 24, 0.45)';
      ctx.fillRect(ox + 6, oy + 31, 24, 3);
      ctx.fillStyle = outline;
      ctx.fillRect(bx, by + 4, 22, 11);
      ctx.fillStyle = '#581c87';
      ctx.fillRect(bx + 1, by + 5, 20, 9);
      ctx.fillStyle = '#9333ea';
      ctx.fillRect(bx + 3, by + 3, 12, 6);
      // Spectral mane & fangs
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(bx + 6, by + 1, 8, 3);
      ctx.fillStyle = '#ef4444'; // Glowing eye
      ctx.fillRect(bx + 2, by + 5, 2, 2);
      ctx.fillStyle = '#f8fafc'; // Fangs
      ctx.fillRect(bx, by + 9, 3, 2);
      // Legs
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(bx + 3, by + 14, 3, 6);
      ctx.fillRect(bx + 16, by + 14, 3, 6);
    } else if (enemyKey === 'neus_norial') {
      // Mirage City Tactical Commander (36x36)
      const bx = ox + 10 + attackShift;
      const by = oy + 5 + bob;
      ctx.fillStyle = 'rgba(8, 12, 24, 0.45)';
      ctx.fillRect(ox + 9, oy + 31, 18, 3);
      // Flowing white-gold cape
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(bx + 8, by + 10, 9, 16);
      // Armor torso
      ctx.fillStyle = outline;
      ctx.fillRect(bx, by + 9, 13, 14);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(bx + 1, by + 10, 11, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx + 3, by + 11, 7, 8);
      // Head & Silver hair
      ctx.fillStyle = '#fde2c8';
      ctx.fillRect(bx + 2, by + 1, 9, 8);
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(bx + 1, by - 1, 11, 4);
      // Mirage Rapier pointing left
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(bx - 2, by + 13, 3, 4);
      ctx.fillStyle = '#7dd3fc';
      ctx.fillRect(bx - 11, by + 14, 9, 2);
    } else {
      // Malakor: Resonant Colossus of the Tomorrow (56x56)
      const bx = ox + 10 + attackShift;
      const by = oy + 4 + bob;
      ctx.fillStyle = 'rgba(8, 12, 24, 0.6)';
      ctx.fillRect(ox + 8, oy + 48, 40, 5);
      ctx.fillStyle = outline;
      ctx.fillRect(bx + 2, by + 6, 32, 36);
      ctx.fillStyle = '#311042';
      ctx.fillRect(bx + 4, by + 8, 28, 32);
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(bx + 10, by + 14, 16, 16);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(bx + 8, by + 2, 20, 6);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(bx + 14, by + 18, 8, 8);
    }
  }

  // ============================================================================
  // 5. PIXEL-ART COMBAT ICONS (16 x 16 px) — ZERO EMOJIS
  // ============================================================================

  private drawPixelIcon(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    type: CombatIconType
  ) {
    ctx.fillStyle = '#090d16';
    ctx.fillRect(ox + 1, oy + 1, 14, 14);

    switch (type) {
      case 'move': // Winged Boot
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(ox + 6, oy + 3, 5, 6);
        ctx.fillRect(ox + 4, oy + 9, 8, 4);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(ox + 11, oy + 4, 3, 2);
        ctx.fillRect(ox + 4, oy + 12, 8, 1);
        break;
      case 'attack': // Crossed Chrono-Sword
        ctx.fillStyle = '#f8fafc';
        for (let i = 0; i < 9; i++) {
          ctx.fillRect(ox + 4 + i, oy + 11 - i, 2, 2);
        }
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(ox + 3, oy + 10, 4, 3);
        break;
      case 'skills': // Resonant 4-point Star
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(ox + 7, oy + 2, 2, 12);
        ctx.fillRect(ox + 2, oy + 7, 12, 2);
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(ox + 6, oy + 6, 4, 4);
        break;
      case 'defend': // Heater Shield
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(ox + 3, oy + 3, 10, 7);
        ctx.fillRect(ox + 5, oy + 10, 6, 3);
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(ox + 4, oy + 4, 8, 5);
        break;
      case 'end_turn': // Hourglass
        ctx.fillStyle = '#f5b942';
        ctx.fillRect(ox + 3, oy + 2, 10, 2);
        ctx.fillRect(ox + 3, oy + 12, 10, 2);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(ox + 5, oy + 4, 6, 3);
        ctx.fillRect(ox + 7, oy + 7, 2, 2);
        ctx.fillRect(ox + 5, oy + 9, 6, 3);
        break;
      case 'broken_armor': // Cracked Chestplate
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(ox + 3, oy + 3, 10, 10);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 7, oy + 3, 2, 4);
        ctx.fillRect(ox + 6, oy + 7, 2, 3);
        ctx.fillRect(ox + 8, oy + 10, 2, 3);
        break;
      case 'stunned': // Lightning Star
        ctx.fillStyle = '#facc15';
        ctx.fillRect(ox + 8, oy + 2, 4, 4);
        ctx.fillRect(ox + 5, oy + 6, 6, 3);
        ctx.fillRect(ox + 4, oy + 9, 4, 5);
        break;
      case 'slowed': // Heavy Shackled Clock
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(ox + 4, oy + 4, 8, 8);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 7, oy + 5, 2, 4);
        break;
      case 'synchronized': // Twin Resonance Rings
        ctx.fillStyle = '#34d399';
        ctx.fillRect(ox + 3, oy + 5, 6, 6);
        ctx.fillRect(ox + 7, oy + 5, 6, 6);
        break;
      case 'weakened': // Downward Violet Chevron
        ctx.fillStyle = '#a855f7';
        ctx.fillRect(ox + 6, oy + 3, 4, 6);
        ctx.fillRect(ox + 4, oy + 9, 8, 3);
        ctx.fillRect(ox + 6, oy + 12, 4, 2);
        break;
    }
  }
}

export const combatSprites = new CombatSpriteAtlas();
