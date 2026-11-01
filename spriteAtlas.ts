import {
  CharacterArchetype,
  Direction,
  EquippedOutfit,
  PlayerAppearance,
} from './types';
import {
  DEFAULT_STARTER_OUTFIT,
  ensureValidEquippedOutfit,
  getClothingItemById,
} from './customizationData';

export const SPRITE_W = 24;
export const SPRITE_H = 32;
export const SHEET_COLS = 6; // Cols 0,1 = Idle (2 frames); Cols 2,3,4,5 = Walk (4 frames)
export const SHEET_ROWS = 4; // Row 0 = down, 1 = up, 2 = left, 3 = right

export const DIRECTION_ROW: Record<Direction, number> = {
  down: 0,
  up: 1,
  left: 2,
  right: 3,
};

interface ArchetypeStyle {
  skin: string;
  skinShadow: string;
  hair: string;
  hairHighlight: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  boots: string;
  hatType:
    | 'adventurer_band'
    | 'astrologer_cone'
    | 'woven_headband'
    | 'goggles'
    | 'bandana'
    | 'hood'
    | 'straw_hat'
    | 'beret'
    | 'parka_hood'
    | 'none';
  accessory:
    | 'satchel'
    | 'star_staff'
    | 'wood_staff'
    | 'map_pack'
    | 'apron'
    | 'tome'
    | 'hammer'
    | 'none';
  robeLength: 'short' | 'long' | 'poncho';
}

const ARCHETYPE_STYLES: Record<CharacterArchetype, ArchetypeStyle> = {
  protagonist: {
    skin: '#fbd3b0',
    skinShadow: '#dfa478',
    hair: '#8c2d19',
    hairHighlight: '#c84b31',
    primary: '#1d4ed8',
    primaryDark: '#1e3a8a',
    secondary: '#f5b942',
    accent: '#38bdf8',
    boots: '#451a03',
    hatType: 'adventurer_band',
    accessory: 'satchel',
    robeLength: 'short',
  },
  lia: {
    skin: '#fde2c8',
    skinShadow: '#e2b58d',
    hair: '#a855f7',
    hairHighlight: '#d8b4fe',
    primary: '#4c1d95',
    primaryDark: '#2e1065',
    secondary: '#f5b942',
    accent: '#38bdf8',
    boots: '#3b0764',
    hatType: 'astrologer_cone',
    accessory: 'star_staff',
    robeLength: 'long',
  },
  amaru: {
    skin: '#d99b66',
    skinShadow: '#b57845',
    hair: '#1c1917',
    hairHighlight: '#44403c',
    primary: '#15803d',
    primaryDark: '#14532d',
    secondary: '#d97706',
    accent: '#fbbf24',
    boots: '#422006',
    hatType: 'woven_headband',
    accessory: 'wood_staff',
    robeLength: 'poncho',
  },
  nilo: {
    skin: '#f6cfa7',
    skinShadow: '#d4a373',
    hair: '#1e293b',
    hairHighlight: '#475569',
    primary: '#0369a1',
    primaryDark: '#0c4a6e',
    secondary: '#eab308',
    accent: '#7dd3fc',
    boots: '#334155',
    hatType: 'goggles',
    accessory: 'map_pack',
    robeLength: 'short',
  },
  mara: {
    skin: '#fbd3b0',
    skinShadow: '#dca172',
    hair: '#9a3412',
    hairHighlight: '#ea580c',
    primary: '#be123c',
    primaryDark: '#881337',
    secondary: '#fef3c7',
    accent: '#fbbf24',
    boots: '#451a03',
    hatType: 'bandana',
    accessory: 'apron',
    robeLength: 'long',
  },
  valeria: {
    skin: '#fde2c8',
    skinShadow: '#deb089',
    hair: '#c026d3',
    hairHighlight: '#f0abfc',
    primary: '#7e22ce',
    primaryDark: '#581c87',
    secondary: '#fde047',
    accent: '#38bdf8',
    boots: '#3b0764',
    hatType: 'beret',
    accessory: 'apron',
    robeLength: 'long',
  },
  cronista: {
    skin: '#e2e8f0',
    skinShadow: '#94a3b8',
    hair: '#f8fafc',
    hairHighlight: '#ffffff',
    primary: '#312e81',
    primaryDark: '#1e1b4b',
    secondary: '#f5b942',
    accent: '#c084fc',
    boots: '#1e1b4b',
    hatType: 'hood',
    accessory: 'tome',
    robeLength: 'long',
  },
  citizen_elder: {
    skin: '#f5cba7',
    skinShadow: '#d4a373',
    hair: '#cbd5e1',
    hairHighlight: '#f1f5f9',
    primary: '#0f766e',
    primaryDark: '#115e59',
    secondary: '#d97706',
    accent: '#fde047',
    boots: '#3f2e21',
    hatType: 'none',
    accessory: 'none',
    robeLength: 'short',
  },
  citizen_scholar: {
    skin: '#fde2c8',
    skinShadow: '#dcb088',
    hair: '#3f3f46',
    hairHighlight: '#71717a',
    primary: '#4338ca',
    primaryDark: '#312e81',
    secondary: '#38bdf8',
    accent: '#f5b942',
    boots: '#27272a',
    hatType: 'beret',
    accessory: 'tome',
    robeLength: 'short',
  },
  citizen_gardener: {
    skin: '#eab688',
    skinShadow: '#c68c5a',
    hair: '#78350f',
    hairHighlight: '#b45309',
    primary: '#4d7c0f',
    primaryDark: '#365314',
    secondary: '#facc15',
    accent: '#a3e635',
    boots: '#451a03',
    hatType: 'straw_hat',
    accessory: 'apron',
    robeLength: 'short',
  },
  citizen_smith: {
    skin: '#f2bfa0',
    skinShadow: '#ce926f',
    hair: '#b91c1c',
    hairHighlight: '#ef4444',
    primary: '#7f1d1d',
    primaryDark: '#450a0a',
    secondary: '#78350f',
    accent: '#fb923c',
    boots: '#292524',
    hatType: 'bandana',
    accessory: 'hammer',
    robeLength: 'short',
  },
  citizen_arctic: {
    skin: '#fde2c8',
    skinShadow: '#deb089',
    hair: '#0284c7',
    hairHighlight: '#7dd3fc',
    primary: '#0369a1',
    primaryDark: '#075985',
    secondary: '#f8fafc',
    accent: '#38bdf8',
    boots: '#1e293b',
    hatType: 'parka_hood',
    accessory: 'none',
    robeLength: 'short',
  },
  capsule: {
    skin: '#f5b942',
    skinShadow: '#b45309',
    hair: '#ffe082',
    hairHighlight: '#ffffff',
    primary: '#38bdf8',
    primaryDark: '#0284c7',
    secondary: '#78350f',
    accent: '#c084fc',
    boots: '#334155',
    hatType: 'none',
    accessory: 'none',
    robeLength: 'long',
  },
};

class SpriteAtlasManager {
  private sheets: Map<CharacterArchetype, HTMLCanvasElement> = new Map();
  private protagonistSheets: Map<string, HTMLCanvasElement> = new Map();

  public getSheet(archetype: CharacterArchetype): HTMLCanvasElement {
    const cached = this.sheets.get(archetype);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_W * SHEET_COLS;
    canvas.height = SPRITE_H * SHEET_ROWS;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const dirs: Direction[] = ['down', 'up', 'left', 'right'];
    dirs.forEach((dir, rowIdx) => {
      for (let colIdx = 0; colIdx < SHEET_COLS; colIdx++) {
        this.drawFrame(
          ctx,
          colIdx * SPRITE_W,
          rowIdx * SPRITE_H,
          archetype,
          dir,
          colIdx
        );
      }
    });

    this.sheets.set(archetype, canvas);
    return canvas;
  }

  /**
   * Builds and caches a 6-column x 4-row modular layered sprite sheet for the protagonist
   * based on appearance ('hombre' | 'mujer') and equipped outfit layers.
   */
  public getProtagonistSheet(
    appearance: PlayerAppearance = 'hombre',
    outfit?: Partial<EquippedOutfit>
  ): HTMLCanvasElement {
    const valid = ensureValidEquippedOutfit(outfit || DEFAULT_STARTER_OUTFIT);
    const cacheKey = `${appearance}_${valid.top}_${valid.bottom}_${valid.footwear}_${valid.accessory}`;
    const cached = this.protagonistSheets.get(cacheKey);
    if (cached) return cached;

    const canvas = document.createElement('canvas');
    canvas.width = SPRITE_W * SHEET_COLS;
    canvas.height = SPRITE_H * SHEET_ROWS;
    const ctx = canvas.getContext('2d')!;
    ctx.imageSmoothingEnabled = false;

    const dirs: Direction[] = ['down', 'up', 'left', 'right'];
    dirs.forEach((dir, rowIdx) => {
      for (let colIdx = 0; colIdx < SHEET_COLS; colIdx++) {
        this.drawLayeredProtagonistFrame(
          ctx,
          colIdx * SPRITE_W,
          rowIdx * SPRITE_H,
          appearance,
          valid,
          dir,
          colIdx
        );
      }
    });

    this.protagonistSheets.set(cacheKey, canvas);
    return canvas;
  }

  private drawLayeredProtagonistFrame(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    appearance: PlayerAppearance,
    outfit: EquippedOutfit,
    dir: Direction,
    colIdx: number
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

    const isIdle = colIdx < 2;
    const idleBreath = isIdle && colIdx === 1 ? 1 : 0;
    const walkPhase = isIdle ? 0 : colIdx - 1; // 1, 2, 3, 4
    const bodyBob =
      walkPhase === 1 || walkPhase === 3 ? -1 : idleBreath === 1 ? 1 : 0;

    // Ground oval shadow
    ctx.fillStyle = 'rgba(8, 12, 24, 0.42)';
    ctx.fillRect(ox + 5, oy + 28, 14, 3);
    ctx.fillRect(ox + 7, oy + 27, 10, 1);

    let leftLegY = 0;
    let rightLegY = 0;
    let leftArmY = 0;
    let rightArmY = 0;

    if (walkPhase === 1) {
      leftLegY = -2;
      rightLegY = 1;
      leftArmY = 1;
      rightArmY = -1;
    } else if (walkPhase === 3) {
      leftLegY = 1;
      rightLegY = -2;
      leftArmY = -1;
      rightArmY = 1;
    }

    const ty = oy + 14 + bodyBob;
    const hy = oy + 4 + bodyBob;

    // =========================================================================
    // LAYER 0: CAPE BEHIND BODY (When wearing cape accessory and not facing up)
    // =========================================================================
    if (accItem.style.hasCape && dir !== 'up') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 4, ty + 1, 16, 13);
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(ox + 5, ty + 2, 14, 11);
      if (accItem.style.trimColor) {
        ctx.fillStyle = accItem.style.trimColor;
        ctx.fillRect(ox + 5, ty + 12, 14, 1);
      }
    }

    // =========================================================================
    // LAYER 1 & 2: LOWER BODY (BOTTOM) + FOOTWEAR (SHOES/BOOTS) (y: 22..29)
    // =========================================================================
    const bootH =
      shoeItem.style.bootHeight === 'tall'
        ? 3
        : shoeItem.style.bootHeight === 'mid'
        ? 2
        : 1;
    const pantsH = 5 - bootH;

    ctx.fillStyle = '#090d16';
    if (dir === 'left' || dir === 'right') {
      const stride = walkPhase === 1 ? -2 : walkPhase === 3 ? 2 : 0;
      ctx.fillRect(ox + 9 + stride, oy + 23, 5, 6);
      ctx.fillRect(ox + 9 - stride, oy + 23, 5, 6);

      // Lower body garment
      ctx.fillStyle = bottomItem.style.primaryColor;
      ctx.fillRect(ox + 10 + stride, oy + 23, 3, pantsH);
      ctx.fillRect(ox + 10 - stride, oy + 23, 3, pantsH);

      // Footwear
      ctx.fillStyle = shoeItem.style.primaryColor;
      ctx.fillRect(ox + 10 + stride, oy + 23 + pantsH, 3, bootH);
      ctx.fillRect(ox + 10 - stride, oy + 23 + pantsH, 3, bootH);
      if (shoeItem.style.trimColor) {
        ctx.fillStyle = shoeItem.style.trimColor;
        ctx.fillRect(ox + 10 + stride, oy + 23 + pantsH, 3, 1);
      }
    } else {
      // Front/Back legs
      ctx.fillRect(ox + 7, oy + 23 + leftLegY, 4, 6);
      ctx.fillRect(ox + 13, oy + 23 + rightLegY, 4, 6);

      ctx.fillStyle = bottomItem.style.primaryColor;
      ctx.fillRect(ox + 8, oy + 23 + leftLegY, 2, pantsH);
      ctx.fillRect(ox + 14, oy + 23 + rightLegY, 2, pantsH);
      if (bottomItem.style.trimColor) {
        ctx.fillStyle = bottomItem.style.trimColor;
        ctx.fillRect(ox + 8, oy + 22 + leftLegY, 2, 1);
        ctx.fillRect(ox + 14, oy + 22 + rightLegY, 2, 1);
      }

      // Boots/Shoes
      ctx.fillStyle = shoeItem.style.primaryColor;
      ctx.fillRect(ox + 8, oy + 23 + pantsH + leftLegY, 2, bootH);
      ctx.fillRect(ox + 14, oy + 23 + pantsH + rightLegY, 2, bootH);
      if (shoeItem.style.trimColor && bootH >= 2) {
        ctx.fillStyle = shoeItem.style.trimColor;
        ctx.fillRect(ox + 8, oy + 23 + pantsH + leftLegY, 2, 1);
        ctx.fillRect(ox + 14, oy + 23 + pantsH + rightLegY, 2, 1);
      }
    }

    // =========================================================================
    // LAYER 3: UPPER BODY (TOP) WITH SILHOUETTE DIFFERENTIATION (HOMBRE vs MUJER)
    // =========================================================================
    const isLong = Boolean(topItem.style.isLongTunic);
    ctx.fillStyle = '#090d16';

    if (isFemale) {
      // Feminine silhouette: tapered waist (x: 7..17) + flared tunic/skirt hem at bottom (x: 6..18)
      ctx.fillRect(ox + 6, ty, 12, 5);
      ctx.fillRect(ox + 7, ty + 4, 10, 4);
      ctx.fillRect(ox + 6, ty + 7, 12, isLong ? 4 : 3);

      ctx.fillStyle = topItem.style.primaryColor;
      ctx.fillRect(ox + 7, ty + 1, 10, 4);
      ctx.fillRect(ox + 8, ty + 4, 8, 3);
      ctx.fillRect(ox + 7, ty + 7, 10, isLong ? 3 : 2);

      // Belt & flared hem trim
      ctx.fillStyle = topItem.style.secondaryColor;
      ctx.fillRect(ox + 8, ty + 6, 8, 1);
      if (topItem.style.trimColor) {
        ctx.fillStyle = topItem.style.trimColor;
        ctx.fillRect(ox + 7, ty + (isLong ? 9 : 8), 10, 1);
        ctx.fillRect(ox + 9, ty + 1, 6, 1);
      }
    } else {
      // Masculine silhouette: broader structured shoulders and straight adventurer tunic/jacket
      ctx.fillRect(ox + 5, ty, 14, 5);
      ctx.fillRect(ox + 6, ty + 4, 12, isLong ? 7 : 6);

      ctx.fillStyle = topItem.style.primaryColor;
      ctx.fillRect(ox + 6, ty + 1, 12, 4);
      ctx.fillRect(ox + 7, ty + 4, 10, isLong ? 6 : 5);

      // Structured chest/vest & belt detail
      ctx.fillStyle = topItem.style.secondaryColor;
      ctx.fillRect(ox + 7, ty + 6, 10, 1);
      if (topItem.style.trimColor) {
        ctx.fillStyle = topItem.style.trimColor;
        ctx.fillRect(ox + 9, ty + 1, 6, 2);
        ctx.fillRect(ox + 11, ty + 3, 2, 3);
      }
    }

    // Arms & Sleeves
    const isShortSleeve = topItem.style.sleeveStyle === 'short';
    const sleeveColor =
      topItem.style.sleeveStyle === 'armored'
        ? topItem.style.secondaryColor
        : topItem.style.primaryColor;

    if (dir === 'down' || dir === 'up') {
      const leftArmX = isFemale ? ox + 5 : ox + 4;
      const rightArmX = isFemale ? ox + 16 : ox + 17;

      ctx.fillStyle = '#090d16';
      ctx.fillRect(leftArmX, ty + 1 + leftArmY, 3, 7);
      ctx.fillRect(rightArmX, ty + 1 + rightArmY, 3, 7);

      ctx.fillStyle = sleeveColor;
      ctx.fillRect(leftArmX + 1, ty + 2 + leftArmY, 2, isShortSleeve ? 2 : 4);
      ctx.fillRect(rightArmX, ty + 2 + rightArmY, 2, isShortSleeve ? 2 : 4);

      ctx.fillStyle = skin;
      ctx.fillRect(
        leftArmX + 1,
        ty + (isShortSleeve ? 4 : 6) + leftArmY,
        2,
        isShortSleeve ? 4 : 2
      );
      ctx.fillRect(
        rightArmX,
        ty + (isShortSleeve ? 4 : 6) + rightArmY,
        2,
        isShortSleeve ? 4 : 2
      );
    } else {
      const armOffset = walkPhase === 1 ? -1 : walkPhase === 3 ? 1 : 0;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 10 + armOffset, ty + 2, 4, 7);
      ctx.fillStyle = sleeveColor;
      ctx.fillRect(ox + 11 + armOffset, ty + 3, 2, isShortSleeve ? 2 : 4);
      ctx.fillStyle = skin;
      ctx.fillRect(
        ox + 11 + armOffset,
        ty + (isShortSleeve ? 5 : 7),
        2,
        isShortSleeve ? 4 : 2
      );
    }

    // Back cape when facing UP (covers back of torso)
    if (accItem.style.hasCape && dir === 'up') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 5, ty + 1, 14, 11);
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(ox + 6, ty + 2, 12, 9);
      if (accItem.style.trimColor) {
        ctx.fillStyle = accItem.style.trimColor;
        ctx.fillRect(ox + 6, ty + 10, 12, 1);
      }
    }

    // Torso Accessories (Bandana scarf, Satchel strap, Guardian emblem)
    if (accItem.style.hasHoodOrCrown === 'bandana' && dir !== 'up') {
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(ox + 8, ty, 8, 3);
      if (accItem.style.trimColor) {
        ctx.fillStyle = accItem.style.trimColor;
        ctx.fillRect(ox + 11, ty + 1, 2, 2);
      }
    } else if (accItem.style.hasHoodOrCrown === 'satchel') {
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(ox + 8, ty + 1, 2, 6);
      ctx.fillRect(ox + 10, ty + 4, 2, 4);
      ctx.fillStyle = accItem.style.secondaryColor;
      ctx.fillRect(ox + 12, ty + 6, 4, 3);
    } else if (accItem.style.hasHoodOrCrown === 'emblem' && dir === 'down') {
      ctx.fillStyle = accItem.style.secondaryColor;
      ctx.fillRect(ox + 10, ty + 2, 4, 4);
      ctx.fillStyle = accItem.style.trimColor || '#ffffff';
      ctx.fillRect(ox + 11, ty + 3, 2, 2);
    }

    // =========================================================================
    // LAYER 4: HEAD, FACE & DISTINCT HAIR SILHOUETTES (HOMBRE vs MUJER)
    // =========================================================================
    ctx.fillStyle = '#090d16';
    ctx.fillRect(ox + 5, hy, 14, 11);
    ctx.fillRect(ox + 6, hy - 1, 12, 12);

    if (isFemale) {
      // FEMININE HAIR & FACE: Long flowing locks past the shoulders + side bangs + eyelash detail
      if (dir === 'up') {
        // Long flowing back hair cascading over the upper back (y: hy..hy+14)
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 5, hy + 8, 14, 7);
        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 6, hy, 12, 14);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 8, hy + 2, 8, 2);
        ctx.fillRect(ox + 7, hy + 7, 10, 2);
      } else if (dir === 'down') {
        // Long hair framing shoulders behind face
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 4, hy + 4, 3, 10);
        ctx.fillRect(ox + 17, hy + 4, 3, 10);
        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 5, hy + 3, 2, 10);
        ctx.fillRect(ox + 17, hy + 3, 2, 10);

        // Face skin
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 7, hy + 3, 10, 7);
        ctx.fillStyle = skinShadow;
        ctx.fillRect(ox + 8, hy + 9, 8, 1);

        // Feminine eyes with eyelash accent & warm cheek pixel
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 7, hy + 5, 3, 1);
        ctx.fillRect(ox + 14, hy + 5, 3, 1);
        ctx.fillRect(ox + 8, hy + 6, 2, 2);
        ctx.fillRect(ox + 14, hy + 6, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox + 8, hy + 6, 1, 1);
        ctx.fillRect(ox + 14, hy + 6, 1, 1);
        ctx.fillStyle = '#f472b6';
        ctx.fillRect(ox + 7, hy + 8, 1, 1);
        ctx.fillRect(ox + 16, hy + 8, 1, 1);

        // Swept crown hair & soft parted bangs
        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 6, hy - 1, 12, 4);
        ctx.fillRect(ox + 6, hy + 3, 2, 4);
        ctx.fillRect(ox + 16, hy + 3, 2, 4);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 8, hy, 8, 2);
      } else if (dir === 'left') {
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 6, hy + 3, 8, 7);
        ctx.fillStyle = skinShadow;
        ctx.fillRect(ox + 6, hy + 9, 8, 1);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 7, hy + 5, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox + 7, hy + 5, 1, 1);

        // Long hair flowing down the right/back side
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 12, hy + 2, 7, 13);
        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 6, hy - 1, 12, 4);
        ctx.fillRect(ox + 12, hy + 3, 6, 11);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 13, hy + 2, 4, 2);
        ctx.fillRect(ox + 14, hy + 7, 3, 2);
      } else {
        // right
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 10, hy + 3, 8, 7);
        ctx.fillStyle = skinShadow;
        ctx.fillRect(ox + 10, hy + 9, 8, 1);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 15, hy + 5, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox + 16, hy + 5, 1, 1);

        // Long hair flowing down the left/back side
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 5, hy + 2, 7, 13);
        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 6, hy - 1, 12, 4);
        ctx.fillRect(ox + 6, hy + 3, 6, 11);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 7, hy + 2, 4, 2);
        ctx.fillRect(ox + 7, hy + 7, 3, 2);
      }
    } else {
      // MASCULINE HAIR & FACE: Spiky tousled short/medium adventurer hair + defined eyebrows
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 7, hy - 2, 3, 2);
      ctx.fillRect(ox + 12, hy - 2, 4, 2);

      if (dir === 'up') {
        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 6, hy, 12, 9);
        ctx.fillRect(ox + 8, hy - 1, 8, 2);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 8, hy + 1, 8, 2);
        ctx.fillStyle = skinShadow;
        ctx.fillRect(ox + 8, hy + 9, 8, 1);
      } else if (dir === 'down') {
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 7, hy + 3, 10, 7);
        ctx.fillStyle = skinShadow;
        ctx.fillRect(ox + 7, hy + 9, 10, 1);

        // Defined eyebrows & eyes
        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 8, hy + 4, 3, 1);
        ctx.fillRect(ox + 13, hy + 4, 3, 1);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 8, hy + 5, 2, 2);
        ctx.fillRect(ox + 14, hy + 5, 2, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ox + 8, hy + 5, 1, 1);
        ctx.fillRect(ox + 14, hy + 5, 1, 1);

        // Spiky tousled front hair & short sideburns
        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 6, hy, 12, 4);
        ctx.fillRect(ox + 8, hy - 1, 8, 2);
        ctx.fillRect(ox + 6, hy + 3, 2, 3);
        ctx.fillRect(ox + 16, hy + 3, 2, 3);
        ctx.fillRect(ox + 10, hy + 3, 2, 1);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 8, hy, 6, 2);
      } else if (dir === 'left') {
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 6, hy + 3, 8, 7);
        ctx.fillStyle = skinShadow;
        ctx.fillRect(ox + 6, hy + 9, 8, 1);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 7, hy + 5, 2, 2);

        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 6, hy, 12, 4);
        ctx.fillRect(ox + 8, hy - 1, 8, 2);
        ctx.fillRect(ox + 12, hy + 3, 6, 6);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 12, hy + 1, 4, 2);
      } else {
        ctx.fillStyle = skin;
        ctx.fillRect(ox + 10, hy + 3, 8, 7);
        ctx.fillStyle = skinShadow;
        ctx.fillRect(ox + 10, hy + 9, 8, 1);
        ctx.fillStyle = '#090d16';
        ctx.fillRect(ox + 15, hy + 5, 2, 2);

        ctx.fillStyle = hairMain;
        ctx.fillRect(ox + 6, hy, 12, 4);
        ctx.fillRect(ox + 8, hy - 1, 8, 2);
        ctx.fillRect(ox + 6, hy + 3, 6, 6);
        ctx.fillStyle = hairHighlight;
        ctx.fillRect(ox + 8, hy + 1, 4, 2);
      }
    }

    // =========================================================================
    // LAYER 5: HEADGEAR ACCESSORIES (Diadem, Star Crown)
    // =========================================================================
    if (accItem.style.hasHoodOrCrown === 'diadem') {
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(ox + 6, hy + 1, 12, 2);
      ctx.fillStyle = accItem.style.trimColor || '#38bdf8';
      ctx.fillRect(ox + 11, hy, 2, 3);
    } else if (accItem.style.hasHoodOrCrown === 'crown') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 6, hy - 3, 12, 4);
      ctx.fillStyle = accItem.style.primaryColor;
      ctx.fillRect(ox + 7, hy - 1, 10, 2);
      ctx.fillRect(ox + 7, hy - 2, 2, 1);
      ctx.fillRect(ox + 11, hy - 3, 2, 2);
      ctx.fillRect(ox + 15, hy - 2, 2, 1);
      ctx.fillStyle = accItem.style.secondaryColor;
      ctx.fillRect(ox + 11, hy - 2, 2, 1);
    }
  }

  private drawCapsuleFrame(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    colIdx: number
  ) {
    const pulse = colIdx % 2 === 1 ? 1 : 0;
    // Shadow
    ctx.fillStyle = 'rgba(8, 12, 24, 0.45)';
    ctx.fillRect(ox + 3, oy + 26, 18, 4);

    // Ornate Pedestal Base
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(ox + 4, oy + 22, 16, 7);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(ox + 5, oy + 23, 14, 5);
    ctx.fillStyle = '#f5b942';
    ctx.fillRect(ox + 5, oy + 22, 14, 2);

    // Bronze & Star-Crystal Cylinder
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(ox + 6, oy + 6 - pulse, 12, 16);
    ctx.fillStyle = '#b45309';
    ctx.fillRect(ox + 7, oy + 7 - pulse, 10, 14);
    ctx.fillStyle = '#f5b942';
    ctx.fillRect(ox + 7, oy + 7 - pulse, 10, 2);
    ctx.fillRect(ox + 7, oy + 19 - pulse, 10, 2);

    // Glowing Temporal Core
    ctx.fillStyle = colIdx % 2 === 0 ? '#38bdf8' : '#7dd3fc';
    ctx.fillRect(ox + 8, oy + 10 - pulse, 8, 8);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ox + 10, oy + 11 - pulse, 2, 5);
  }

  private drawFrame(
    ctx: CanvasRenderingContext2D,
    ox: number,
    oy: number,
    archetype: CharacterArchetype,
    dir: Direction,
    colIdx: number
  ) {
    if (archetype === 'capsule') {
      this.drawCapsuleFrame(ctx, ox, oy, colIdx);
      return;
    }

    const style = ARCHETYPE_STYLES[archetype] || ARCHETYPE_STYLES.protagonist;
    const isIdle = colIdx < 2;
    const idleBreath = isIdle && colIdx === 1 ? 1 : 0;
    const walkPhase = isIdle ? 0 : colIdx - 1; // 1, 2, 3, 4

    // Bobbing offset during walk cycle
    const bodyBob =
      walkPhase === 1 || walkPhase === 3 ? -1 : idleBreath === 1 ? 1 : 0;

    // Ground oval shadow
    ctx.fillStyle = 'rgba(8, 12, 24, 0.42)';
    ctx.fillRect(ox + 5, oy + 28, 14, 3);
    ctx.fillRect(ox + 7, oy + 27, 10, 1);

    // Leg swing offsets
    let leftLegY = 0;
    let rightLegY = 0;
    let leftArmY = 0;
    let rightArmY = 0;

    if (walkPhase === 1) {
      leftLegY = -2;
      rightLegY = 1;
      leftArmY = 1;
      rightArmY = -1;
    } else if (walkPhase === 3) {
      leftLegY = 1;
      rightLegY = -2;
      leftArmY = -1;
      rightArmY = 1;
    }

    // 1. LEGS & BOOTS (y: 22..29)
    ctx.fillStyle = '#090d16'; // Dark outline
    if (dir === 'left' || dir === 'right') {
      const stride = walkPhase === 1 ? -2 : walkPhase === 3 ? 2 : 0;
      ctx.fillRect(ox + 9 + stride, oy + 23, 5, 6);
      ctx.fillRect(ox + 9 - stride, oy + 23, 5, 6);
      ctx.fillStyle = style.primaryDark;
      ctx.fillRect(ox + 10 + stride, oy + 23, 3, 3);
      ctx.fillRect(ox + 10 - stride, oy + 23, 3, 3);
      ctx.fillStyle = style.boots;
      ctx.fillRect(ox + 10 + stride, oy + 26, 3, 2);
      ctx.fillRect(ox + 10 - stride, oy + 26, 3, 2);
    } else {
      // Left leg
      ctx.fillRect(ox + 7, oy + 23 + leftLegY, 4, 6);
      // Right leg
      ctx.fillRect(ox + 13, oy + 23 + rightLegY, 4, 6);

      ctx.fillStyle = style.primaryDark;
      ctx.fillRect(ox + 8, oy + 23 + leftLegY, 2, 3);
      ctx.fillRect(ox + 14, oy + 23 + rightLegY, 2, 3);

      ctx.fillStyle = style.boots;
      ctx.fillRect(ox + 8, oy + 26 + leftLegY, 2, 2);
      ctx.fillRect(ox + 14, oy + 26 + rightLegY, 2, 2);
    }

    // 2. BACKPACK / CAPE BEHIND WHEN FACING UP OR SIDE
    const ty = oy + 14 + bodyBob;
    if (style.accessory === 'map_pack' && dir !== 'down') {
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 6, ty, 12, 9);
      ctx.fillStyle = '#92400e';
      ctx.fillRect(ox + 7, ty + 1, 10, 7);
      // Rolled map scroll sticking out
      ctx.fillStyle = '#fef3c7';
      ctx.fillRect(ox + 15, ty - 2, 4, 4);
    }

    // 3. TORSO / TUNIC / PONCHO / ROBE (y: 14..24)
    const robeExtra = style.robeLength === 'long' ? 3 : 0;
    ctx.fillStyle = '#090d16'; // Outline
    ctx.fillRect(ox + 6, ty, 12, 10 + robeExtra);

    ctx.fillStyle = style.primary;
    ctx.fillRect(ox + 7, ty + 1, 10, 8 + robeExtra);

    // Shading on bottom/side of tunic
    ctx.fillStyle = style.primaryDark;
    ctx.fillRect(ox + 7, ty + 7 + robeExtra, 10, 2);

    // Poncho or Apron or Satchel details
    if (style.robeLength === 'poncho') {
      // Andean-inspired geometric trim
      ctx.fillStyle = style.secondary;
      ctx.fillRect(ox + 6, ty + 2, 12, 5);
      ctx.fillStyle = style.accent;
      ctx.fillRect(ox + 8, ty + 4, 2, 2);
      ctx.fillRect(ox + 14, ty + 4, 2, 2);
      ctx.fillStyle = style.primary;
      ctx.fillRect(ox + 10, ty + 1, 4, 6);
    } else if (style.accessory === 'apron') {
      ctx.fillStyle = style.secondary;
      ctx.fillRect(ox + 8, ty + 3, 8, 6 + robeExtra);
      ctx.fillStyle = style.accent;
      ctx.fillRect(ox + 9, ty + 4, 6, 1);
    } else if (style.accessory === 'satchel') {
      // Gold collar & diagonal leather strap
      ctx.fillStyle = style.secondary;
      ctx.fillRect(ox + 9, ty + 1, 6, 2);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox + 8, ty + 2, 2, 6);
      ctx.fillRect(ox + 10, ty + 4, 2, 4);
      ctx.fillStyle = style.accent;
      ctx.fillRect(ox + 11, ty + 5, 2, 2);
    } else {
      // Collar / Clasp
      ctx.fillStyle = style.secondary;
      ctx.fillRect(ox + 9, ty + 1, 6, 2);
      ctx.fillStyle = style.accent;
      ctx.fillRect(ox + 11, ty + 3, 2, 4);
    }

    // 4. ARMS & HANDS (y: 15..22)
    if (dir === 'down' || dir === 'up') {
      // Left arm
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 4, ty + 1 + leftArmY, 3, 7);
      ctx.fillStyle = style.primary;
      ctx.fillRect(ox + 5, ty + 2 + leftArmY, 2, 4);
      ctx.fillStyle = style.skin;
      ctx.fillRect(ox + 5, ty + 6 + leftArmY, 2, 2);

      // Right arm
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 17, ty + 1 + rightArmY, 3, 7);
      ctx.fillStyle = style.primary;
      ctx.fillRect(ox + 17, ty + 2 + rightArmY, 2, 4);
      ctx.fillStyle = style.skin;
      ctx.fillRect(ox + 17, ty + 6 + rightArmY, 2, 2);
    } else {
      // Side arm
      const armOffset = walkPhase === 1 ? -1 : walkPhase === 3 ? 1 : 0;
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 10 + armOffset, ty + 2, 4, 7);
      ctx.fillStyle = style.primary;
      ctx.fillRect(ox + 11 + armOffset, ty + 3, 2, 4);
      ctx.fillStyle = style.skin;
      ctx.fillRect(ox + 11 + armOffset, ty + 7, 2, 2);
    }

    // 5. HELD ACCESSORIES (Star staff, wooden staff, tome, hammer)
    if (style.accessory === 'star_staff' && dir !== 'left') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox + 19, ty - 4 + rightArmY, 2, 16);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(ox + 18, ty - 7 + rightArmY, 4, 4);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(ox + 19, ty - 6 + rightArmY, 2, 2);
    } else if (style.accessory === 'wood_staff' && dir !== 'left') {
      ctx.fillStyle = '#713f12';
      ctx.fillRect(ox + 19, ty - 3 + rightArmY, 2, 15);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(ox + 18, ty - 5 + rightArmY, 4, 3);
    } else if (style.accessory === 'tome' && dir === 'down') {
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(ox + 15, ty + 3 + rightArmY, 5, 5);
      ctx.fillStyle = '#312e81';
      ctx.fillRect(ox + 16, ty + 4 + rightArmY, 3, 3);
    }

    // 6. HEAD, FACE, HAIR & HEADGEAR (y: 3..15)
    const hy = oy + 4 + bodyBob;

    // Head dark outline
    ctx.fillStyle = '#090d16';
    ctx.fillRect(ox + 5, hy, 14, 11);
    ctx.fillRect(ox + 6, hy - 1, 12, 12);

    // Base Hair / Back of head
    ctx.fillStyle = style.hair;
    ctx.fillRect(ox + 6, hy, 12, 10);

    if (dir === 'up') {
      // Full back hair with highlights
      ctx.fillStyle = style.hair;
      ctx.fillRect(ox + 6, hy, 12, 10);
      ctx.fillStyle = style.hairHighlight;
      ctx.fillRect(ox + 8, hy + 2, 8, 2);
      ctx.fillStyle = style.skinShadow;
      ctx.fillRect(ox + 9, hy + 9, 6, 1);
    } else if (dir === 'down') {
      // Face skin
      ctx.fillStyle = style.skin;
      ctx.fillRect(ox + 7, hy + 3, 10, 7);
      ctx.fillStyle = style.skinShadow;
      ctx.fillRect(ox + 7, hy + 9, 10, 1);

      // Eyes (with subtle blink on idle frame 1 for lively feel)
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 8, hy + 5, 2, 2);
      ctx.fillRect(ox + 14, hy + 5, 2, 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + 8, hy + 5, 1, 1);
      ctx.fillRect(ox + 14, hy + 5, 1, 1);

      // Front hair bangs & sidelocks
      ctx.fillStyle = style.hair;
      ctx.fillRect(ox + 6, hy, 12, 4);
      ctx.fillRect(ox + 6, hy + 3, 2, 5);
      ctx.fillRect(ox + 16, hy + 3, 2, 5);
      ctx.fillStyle = style.hairHighlight;
      ctx.fillRect(ox + 8, hy + 1, 5, 1);
    } else if (dir === 'left') {
      ctx.fillStyle = style.skin;
      ctx.fillRect(ox + 6, hy + 3, 8, 7);
      ctx.fillStyle = style.skinShadow;
      ctx.fillRect(ox + 6, hy + 9, 8, 1);
      // Side eye
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 7, hy + 5, 2, 2);
      // Hair covering back/right of head
      ctx.fillStyle = style.hair;
      ctx.fillRect(ox + 6, hy, 12, 4);
      ctx.fillRect(ox + 12, hy + 3, 6, 7);
      ctx.fillStyle = style.hairHighlight;
      ctx.fillRect(ox + 13, hy + 2, 3, 2);
    } else {
      // right
      ctx.fillStyle = style.skin;
      ctx.fillRect(ox + 10, hy + 3, 8, 7);
      ctx.fillStyle = style.skinShadow;
      ctx.fillRect(ox + 10, hy + 9, 8, 1);
      // Side eye
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 15, hy + 5, 2, 2);
      // Hair covering back/left of head
      ctx.fillStyle = style.hair;
      ctx.fillRect(ox + 6, hy, 12, 4);
      ctx.fillRect(ox + 6, hy + 3, 6, 7);
      ctx.fillStyle = style.hairHighlight;
      ctx.fillRect(ox + 8, hy + 2, 3, 2);
    }

    // 7. DISTINCT HEADGEAR SILHOUETTES
    if (style.hatType === 'adventurer_band') {
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(ox + 6, hy + 2, 12, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(ox + 11, hy + 2, 2, 2);
    } else if (style.hatType === 'astrologer_cone') {
      // Pointed witch/astrologer brim & cone
      ctx.fillStyle = '#090d16';
      ctx.fillRect(ox + 3, hy + 1, 18, 3);
      ctx.fillRect(ox + 7, hy - 3, 10, 4);
      ctx.fillRect(ox + 9, hy - 5, 6, 3);
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(ox + 4, hy + 2, 16, 2);
      ctx.fillRect(ox + 8, hy - 2, 8, 3);
      ctx.fillRect(ox + 10, hy - 4, 4, 2);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(ox + 8, hy + 1, 8, 1);
    } else if (style.hatType === 'woven_headband') {
      ctx.fillStyle = '#d97706';
      ctx.fillRect(ox + 6, hy + 2, 12, 2);
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(ox + 8, hy + 2, 2, 2);
      ctx.fillRect(ox + 14, hy + 2, 2, 2);
    } else if (style.hatType === 'goggles') {
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ox + 6, hy + 1, 12, 2);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(ox + 7, hy + 1, 4, 3);
      ctx.fillRect(ox + 13, hy + 1, 4, 3);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(ox + 8, hy + 2, 2, 1);
      ctx.fillRect(ox + 14, hy + 2, 2, 1);
    } else if (style.hatType === 'bandana') {
      ctx.fillStyle = style.primary;
      ctx.fillRect(ox + 6, hy, 12, 3);
      ctx.fillStyle = style.accent;
      ctx.fillRect(ox + 7, hy + 2, 10, 1);
    } else if (style.hatType === 'hood' || style.hatType === 'parka_hood') {
      ctx.fillStyle = style.primaryDark;
      ctx.fillRect(ox + 5, hy - 1, 14, 4);
      ctx.fillRect(ox + 5, hy + 2, 2, 8);
      ctx.fillRect(ox + 17, hy + 2, 2, 8);
      ctx.fillStyle = style.secondary;
      ctx.fillRect(ox + 6, hy, 12, 1);
    } else if (style.hatType === 'straw_hat') {
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(ox + 3, hy + 1, 18, 2);
      ctx.fillStyle = '#fde047';
      ctx.fillRect(ox + 6, hy - 2, 12, 3);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(ox + 6, hy, 12, 1);
    } else if (style.hatType === 'beret') {
      ctx.fillStyle = '#312e81';
      ctx.fillRect(ox + 5, hy - 1, 13, 3);
      ctx.fillStyle = '#f5b942';
      ctx.fillRect(ox + 11, hy - 2, 2, 1);
    }
  }

  public drawPortrait(
    ctx: CanvasRenderingContext2D,
    archetype: CharacterArchetype,
    arg3: number,
    arg4: number,
    arg5?: number
  ) {
    const destX = typeof arg5 === 'number' ? arg3 : 0;
    const destY = typeof arg5 === 'number' ? arg4 : 0;
    const destW = typeof arg5 === 'number' ? arg5 : arg3;
    const destH = typeof arg5 === 'number' ? arg5 : arg4;

    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0d152a';
    ctx.fillRect(destX, destY, destW, destH);

    // Subtle inner glow
    ctx.fillStyle = 'rgba(245, 185, 66, 0.12)';
    ctx.fillRect(destX + 3, destY + 3, destW - 6, destH - 6);

    const sheet = this.getSheet(archetype);
    const drawW = Math.round(destW * 0.75);
    const drawH = Math.round(destH * 0.92);
    const offsetX = destX + Math.floor((destW - drawW) / 2);
    const offsetY = destY + Math.floor((destH - drawH) / 2) + 1;

    ctx.drawImage(sheet, 0, 0, SPRITE_W, SPRITE_H, offsetX, offsetY, drawW, drawH);
  }

  /**
   * Renders the customized protagonist portrait (or live animated frame) onto a target canvas.
   */
  public drawProtagonistPortrait(
    ctx: CanvasRenderingContext2D,
    appearance: PlayerAppearance = 'hombre',
    outfit?: Partial<EquippedOutfit>,
    destX = 0,
    destY = 0,
    size = 64,
    dir: Direction = 'down',
    colIdx = 0
  ) {
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = '#0d152a';
    ctx.fillRect(destX, destY, size, size);

    ctx.fillStyle = 'rgba(245, 185, 66, 0.12)';
    ctx.fillRect(destX + 3, destY + 3, size - 6, size - 6);

    const sheet = this.getProtagonistSheet(appearance, outfit);
    const row = DIRECTION_ROW[dir] || 0;
    const sx = (colIdx % SHEET_COLS) * SPRITE_W;
    const sy = row * SPRITE_H;

    const drawW = Math.round(size * 0.75);
    const drawH = Math.round(size * 0.92);
    const offsetX = destX + Math.floor((size - drawW) / 2);
    const offsetY = destY + Math.floor((size - drawH) / 2) + 1;

    ctx.drawImage(
      sheet,
      sx,
      sy,
      SPRITE_W,
      SPRITE_H,
      offsetX,
      offsetY,
      drawW,
      drawH
    );
  }
}

export const spriteAtlas = new SpriteAtlasManager();

export function resolveNpcArchetype(npcId: string, speakerName?: string): CharacterArchetype {
  const id = npcId.toLowerCase();
  const spk = (speakerName || '').toLowerCase();
  if (id.includes('capsula') || spk.includes('cápsula')) return 'capsule';
  if (id.includes('valeria') || spk.includes('valeria') || id.includes('telar'))
    return 'valeria';
  if (id.includes('lia') || spk.includes('lía')) return 'lia';
  if (id.includes('amaru') || spk.includes('amaru')) return 'amaru';
  if (id.includes('nilo') || spk.includes('nilo')) return 'nilo';
  if (id.includes('mara') || spk.includes('mara')) return 'mara';
  if (id.includes('cronista') || spk.includes('cronista')) return 'cronista';
  if (id.includes('tomas') || id.includes('aldeano')) return 'citizen_elder';
  if (id.includes('camilo') || id.includes('cancer')) return 'citizen_scholar';
  if (id.includes('gael') || id.includes('valle')) return 'citizen_gardener';
  if (id.includes('ignea') || id.includes('fuego')) return 'citizen_smith';
  if (id.includes('elena') || id.includes('aire') || id.includes('brisa')) return 'citizen_arctic';
  return 'protagonist';
}
