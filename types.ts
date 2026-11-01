export type Direction = 'up' | 'down' | 'left' | 'right';

export type GameState = 'title' | 'playing' | 'paused' | 'combat' | 'gameover';

export type SlotIndex = 1 | 2 | 3;

export type PlayerAppearance = 'hombre' | 'mujer';

export type ClothingCategory = 'top' | 'bottom' | 'footwear' | 'accessory';

export type ClothingSetId =
  | 'inicial'
  | 'sencillo'
  | 'viajero'
  | 'bosque'
  | 'observatorio'
  | 'guardian'
  | 'celestial';

export interface ClothingItemStyle {
  primaryColor: string;
  secondaryColor: string;
  trimColor?: string;
  accentColor?: string;
  hasCape?: boolean;
  hasHoodOrCrown?: 'bandana' | 'diadem' | 'crown' | 'hood' | 'emblem' | 'satchel';
  isLongTunic?: boolean;
  sleeveStyle?: 'short' | 'long' | 'armored';
  bootHeight?: 'low' | 'mid' | 'tall';
}

export interface ClothingItemDefinition {
  id: string;
  name: string;
  description: string;
  category: ClothingCategory;
  setId: ClothingSetId;
  setLabel: string;
  price: number;
  isStarter?: boolean;
  compatibleWith: 'both' | 'hombre' | 'mujer';
  style: ClothingItemStyle;
}

export interface EquippedOutfit {
  top: string;
  bottom: string;
  footwear: string;
  accessory: string;
}

export interface PurchaseRecord {
  itemId: string;
  price: number;
  timestamp: string;
}

export type CharacterArchetype =
  | 'protagonist'
  | 'lia'
  | 'amaru'
  | 'nilo'
  | 'mara'
  | 'valeria'
  | 'cronista'
  | 'citizen_elder'
  | 'citizen_scholar'
  | 'citizen_gardener'
  | 'citizen_smith'
  | 'citizen_arctic'
  | 'capsule';

export type TileType =
  | 'grass'
  | 'dark_grass'
  | 'path'
  | 'water'
  | 'water_anim'
  | 'tree'
  | 'flowers'
  | 'rock'
  | 'house_wall'
  | 'roof_purple'
  | 'roof_teal'
  | 'roof_terracotta'
  | 'door'
  | 'window'
  | 'bridge'
  | 'cliff'
  | 'stairs'
  | 'sign'
  | 'bush'
  | 'fence'
  | 'shrine'
  | 'sand'
  | 'soil'
  | 'special_ground'
  | 'wood_floor'
  | 'bookshelf'
  | 'table'
  | 'capsule_pedestal'
  | 'chest'
  | 'chest_open'
  | 'lantern'
  | 'fountain'
  | 'crystal'
  | 'clothing_rack'
  | 'mannequin'
  | 'statue'
  | 'brazier'
  | 'water_valve';

export type MapId =
  | 'plaza_vespera'
  | 'distrito_signos'
  | 'observatorio_ext'
  | 'observatorio_int'
  | 'archivo_estrellas'
  | 'biblioteca_int'
  | 'tienda_mara'
  | 'telar_vespera_int'
  | 'sendero_bosque'
  | 'bosque_equilibrio'
  | 'rio_recuerdos'
  | 'valle_raices'
  | 'santuario_fuego'
  | 'santuario_aire'
  | 'ciudad_manana'
  | 'camara_tiempo'
  | 'camara_int'
  | 'casa_relojero_int'
  | 'cueva_eco_int'
  | 'santuario_raices_int'
  | 'ruinas_acueducto'
  | 'umbral_espejismo'
  | 'ciudad_espejismo_atrio_int'
  | 'ciudad_espejismo_galeria_int'
  | 'ciudad_espejismo_nucleo_int';

export type TimeOfDay = 'manana' | 'tarde' | 'atardecer' | 'noche';

export type WeatherCondition =
  | 'despejado'
  | 'nublado'
  | 'lluvia'
  | 'neblina'
  | 'tormenta'
  | 'nieve';

export interface WeatherState {
  seed: number;
  currentByRegion: Partial<Record<MapId, WeatherCondition>>;
  lastChangeClockMinutes: number;
  nextChangeClockMinutes: number;
  cycleCount: number;
}

export type ExplorationToolId =
  | 'tool_lente_astral'
  | 'tool_brujula_vespera'
  | 'tool_cristal_resonante'
  | 'tool_llave_antigua'
  | 'tool_amuleto_eco';

export interface ExplorationToolDefinition {
  id: ExplorationToolId;
  name: string;
  shortLabel: string;
  icon: string;
  color: string;
  description: string;
  usageHint: string;
  sourceHint: string;
}

export type CardinalOrientation = 'norte' | 'este' | 'sur' | 'oeste';

export interface SecretRecordDefinition {
  id: string;
  title: string;
  regionName: string;
  mapId: MapId;
  clueText: string;
  discoveredText: string;
  clueObjectIds?: string[];
  requiredToolId?: ExplorationToolId;
}

export type InteractableKind =
  | 'npc'
  | 'capsule'
  | 'chest'
  | 'sign'
  | 'door'
  | 'fountain'
  | 'shrine'
  | 'book'
  | 'crystal'
  | 'pickup'
  | 'echo_vision'
  | 'event_actor'
  | 'puzzle_mechanism';

export interface WorldObject {
  id: string;
  kind: InteractableKind;
  mapId: MapId;
  x: number;
  y: number;
  label: string; // e.g., "Abrir cofre", "Examinar fuente", "Leer códice"
  title: string;
  lines: string[];
  rewardItemId?: string;
  rewardClothingId?: string;
  rewardXp?: number;
  rewardFragments?: number;
  rewardCoins?: number;
  grantsToolId?: ExplorationToolId;
  requiredToolId?: ExplorationToolId;
  toolLockedTitle?: string;
  toolLockedLines?: string[];
  puzzleId?: string;
  secretId?: string;
  hiddenUntilEcho?: boolean;
  hiddenUntilWeather?: WeatherCondition[];
  advancesQuestId?: string;
  requiredQuestStage?: number;
  nextQuestStage?: number;
  reputationDelta?: Partial<ReputationState>;
  worldEffect?: Partial<WorldVariables>;
  targetPortal?: Portal;
}

export interface EchoVision {
  id: string;
  mapId: MapId;
  x: number;
  y: number;
  title: string;
  visionText: string[];
  interpretationPrompt: string;
  linguisticHint?: string;
  isFivePhase?: boolean;
  explorationPhaseText?: string[];
  requiredInspectionId?: string;
  requiredToolId?: ExplorationToolId;
  unlocksPuzzleKey?: string;
  secretId?: string;
  options: {
    id: string;
    label: string;
    actionType?: 'anclar' | 'evitar';
    consequenceText: string;
    isAccuratePrediction: boolean;
    linguisticHint?: string;
    worldEffect?: Partial<WorldVariables>;
    reputationDelta?: Partial<ReputationState>;
    decisionFlag?: string;
    advancesQuestId?: string;
    nextQuestStage?: number;
    completesQuestId?: string;
    rewardCoins?: number;
    rewardClothingId?: string;
    grantsToolId?: ExplorationToolId;
    unlocksPuzzleKey?: string;
    secretId?: string;
  }[];
}

export interface ReputationState {
  vespera: number; // 0 - 100
  bosque: number;  // 0 - 100
  rio: number;     // 0 - 100
}

export type AchievementId =
  | 'primer_descubrimiento'
  | 'explorador_vespera'
  | 'guardian_equilibrio'
  | 'coleccionista'
  | 'arquitecto_futuro'
  | 'caminante_espejismo'
  | 'maestro_acertijos'
  | 'buscador_secretos';

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
}

export interface WorldEventDefinition {
  id: string;
  mapId: MapId;
  x: number;
  y: number;
  npcName: string;
  npcRole: string;
  archetype: CharacterArchetype;
  timeOfDayRequired?: TimeOfDay[];
  weatherRequired?: WeatherCondition[];
  minLevel?: number;
  requiredDecisionFlag?: string;
  promptLabel: string;
  lines: string[];
  linguisticHint?: string;
  choices?: {
    label: string;
    response: string;
    linguisticHint?: string;
    reputationDelta?: Partial<ReputationState>;
    worldEffect?: Partial<WorldVariables>;
    rewardItemId?: string;
    rewardXp?: number;
    rewardCoins?: number;
    rewardClothingId?: string;
    decisionFlag?: string;
  }[];
}

export interface Portal {
  x: number;
  y: number;
  targetMap: MapId;
  targetX: number;
  targetY: number;
  targetDir: Direction;
  requiredLevel?: number;
  requiredPuzzleKey?: string;
  requiredDecisionFlag?: string;
  lockedMessage?: string;
  label: string;
  isDoor?: boolean;
}

export interface SignPost {
  x: number;
  y: number;
  title: string;
  lines: string[];
}

export interface WorldItemPickup {
  id: string;
  itemId: string;
  mapId: MapId;
  x: number;
  y: number;
  dialogText: string;
  rewardCoins?: number;
}

export type ChallengeType =
  | 'recognize' // A. Reconocer
  | 'match'     // B. Relacionar
  | 'infer'     // C. Inferir
  | 'complete'  // D. Completar
  | 'order'     // E. Ordenar
  | 'correct'   // F. Corregir
  | 'produce'   // G. Producir
  | 'explain'   // H. Explicar
  | 'listen'    // Comprensión oral (SpeechSynthesis + texto)
  | 'oral';     // Producción oral (lectura en voz alta + check)

export interface LanguageChallenge {
  id: string;
  type: ChallengeType;
  prompt: string;
  contextQuote?: string;
  audioLines?: string[];
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
    worldEffect?: Partial<WorldVariables>;
  }[];
  scrambledWords?: string[];
  expectedAnswers?: string[];
  requiredPronoun?: 'yo' | 'tu' | 'el' | 'nosotros' | 'ellos';
  requiredMinVerbs?: number;
  requireConnector?: boolean;
  samplePrompts?: string[];
  hints: string[];
  successResponse: string;
  diaryEntryOnSuccess?: {
    category: 'found' | 'written' | 'plan' | 'decision';
    title: string;
  };
  rewardItem?: string;
  worldEffectOnSuccess?: Partial<WorldVariables>;
}

export interface DialogChoice {
  label: string;
  nextNodeId?: string;
  worldEffect?: Partial<WorldVariables>;
  reputationDelta?: Partial<ReputationState>;
  decisionFlag?: string;
  diaryNote?: string;
  advancesQuestId?: string;
  nextQuestStage?: number;
  completesQuestId?: string;
  opensShop?: boolean;
  linguisticHint?: string;
  consequencePreview?: string;
  rewardClothingId?: string;
  rewardCoins?: number;
  grantsToolId?: ExplorationToolId;
  unlocksPuzzleKey?: string;
  secretId?: string;
  requiredInspectedObject?: string;
  requiredDecisionFlag?: string;
}

export interface DialogNode {
  id: string;
  speaker: string;
  speakerTitle?: string;
  portraitColor?: string;
  archetype?: CharacterArchetype;
  lines: string[];
  audioText?: string;
  choices?: DialogChoice[];
  challenge?: LanguageChallenge;
  nextNodeId?: string;
  completesQuestId?: string;
  startsQuestId?: string;
  advancesQuestId?: string;
  nextQuestStage?: number;
  reputationDelta?: Partial<ReputationState>;
  unlocksTimeCapsule?: boolean;
  opensShop?: boolean;
  memoryBanner?: string;
  linguisticHint?: string;
  rewardClothingId?: string;
  rewardCoins?: number;
  grantsToolId?: ExplorationToolId;
  unlocksPuzzleKey?: string;
  secretId?: string;
}

export interface NpcWaypoint {
  x: number;
  y: number;
  waitSec?: number;
  lookDir?: Direction;
}

export interface NPCData {
  id: string;
  name: string;
  role: string;
  mapId: MapId;
  x: number;
  y: number;
  dir: Direction;
  archetype?: CharacterArchetype;
  palette: {
    hair: string;
    skin: string;
    tunic: string;
    accent: string;
  };
  patrolRadius?: number;
  waypoints?: NpcWaypoint[];
  routineByTime?: Partial<Record<TimeOfDay, { x: number; y: number; dir: Direction; bark?: string }>>;
  ambientBarks?: string[];
  questId?: string;
  initialDialogId: string;
  completedDialogId?: string;
  dialogs: Record<string, DialogNode>;
}

export interface MapDefinition {
  id: MapId;
  name: string;
  subtitle: string;
  arc: 1 | 2 | 3;
  campaignLevel: number;
  width: number;
  height: number;
  ambientTheme:
    | 'plaza'
    | 'zodiac'
    | 'observatory'
    | 'forest'
    | 'river'
    | 'fire'
    | 'air'
    | 'tomorrow'
    | 'chamber'
    | 'interior';
  loreQuote?: string;
  tiles: TileType[][];
  portals: Portal[];
  signs: SignPost[];
  objects?: WorldObject[];
}

export type SkillId =
  | 'observador'
  | 'predictor'
  | 'visionario'
  | 'transformador'
  | 'arquitecto';

export interface SkillDefinition {
  id: SkillId;
  name: string;
  unlockLevel: number;
  description: string;
  effectText: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'estrella' | 'semilla' | 'cristal' | 'pagina' | 'reliquia';
  description: string;
  quantity: number;
  color: string;
}

export interface QuestStageDefinition {
  stage: number;
  title: string;
  description: string;
  targetMapId: MapId;
  targetX?: number;
  targetY?: number;
}

export interface QuestDefinition {
  id: string;
  levelNumber: number;
  arc: 1 | 2 | 3;
  isMain: boolean;
  title: string;
  zoneName: string;
  mapId: MapId;
  npcName: string;
  description: string;
  objectives: string[];
  stages?: QuestStageDefinition[];
  xpReward: number;
  fragmentReward: number;
  coinReward?: number;
  itemRewardId?: string;
  rewardClothingId?: string;
  grantsToolId?: ExplorationToolId;
  branchingSummary?: string;
  unlocksSkill?: SkillId;
  unlocksLevel?: number;
  reputationReward?: Partial<ReputationState>;
}

export interface WorldVariables {
  equilibrio: number; // 0 - 100
  confianza: number;  // 0 - 100
  esperanza: number;  // 0 - 100
}

export interface DiaryEntry {
  id: string;
  category: 'found' | 'written' | 'plan' | 'decision';
  title: string;
  text: string;
  zone: string;
  timestamp: string;
}

export interface NpcMemorySummary {
  npcId: string;
  name: string;
  role: string;
  regionName: string;
  archetype: CharacterArchetype;
  portraitColor: string;
  affinityLevel: 'Conocido' | 'Aliado' | 'Confidente del Mañana';
  affinityScore: number;
  currentImpression: string;
  memories: string[];
}

export interface TimeCapsuleData {
  completed: boolean;
  prediction1: string;
  prediction2: string;
  prediction3: string;
  explanation: string;
  culturalPerspective: 'horoscopo' | 'amaru' | 'experiencia';
  culturalReflection: string;
  presentAction: string;
  oralPresented: boolean;
}

export type EndingType = 'equilibrio' | 'incierto' | 'cambiante';

export type TextSpeed = 'normal' | 'fast' | 'instant';

export interface SaveState {
  version: number;
  slotId?: SlotIndex;
  playerName: string;
  playerAppearance?: PlayerAppearance;
  appearanceMigrated?: boolean;
  initialOutfit?: EquippedOutfit;
  equippedOutfit?: EquippedOutfit;
  ownedClothing?: string[];
  coins?: number;
  purchaseHistory?: PurchaseRecord[];
  level: number;
  xp: number;
  fragments: number;
  unlockedCampaignLevel: number;
  currentMapId: MapId;
  playerX: number;
  playerY: number;
  playerDir: Direction;
  unlockedSkills: SkillId[];
  completedQuests: string[];
  activeQuestId: string;
  questStages?: Record<string, number>;
  collectedPickups: string[];
  openedChests?: string[];
  inspectedObjects?: string[];
  resolvedEchoes?: string[];
  completedEvents?: string[];
  reputation?: ReputationState;
  unlockedAchievements?: AchievementId[];
  gameClockMinutes?: number; // 0 - 1439 (e.g., 540 = 09:00 Mañana)
  weatherState?: WeatherState;
  puzzleStates?: Record<string, string | number | boolean>;
  unlockedTools?: ExplorationToolId[];
  activeToolId?: ExplorationToolId | null;
  discoveredSecrets?: string[];
  decisions: Record<string, string>;
  worldVars: WorldVariables;
  inventory: InventoryItem[];
  diary: DiaryEntry[];
  visitedMaps: MapId[];
  discoveredTiles?: Record<string, string[]>;
  knownNpcs?: string[];
  timeCapsule: TimeCapsuleData;
  unlockedEnding?: EndingType;
  playtimeSeconds?: number;
  lastSavedAt?: string;
  tutorialCompleted?: boolean;
  showMinimap?: boolean;
  soundEnabled: boolean;
  soundVolume: number;
  musicVolume?: number;
  textSpeed?: TextSpeed;
  reducedMotion?: boolean;
  touchControlsEnabled?: boolean;
  touchControlType?: 'joystick' | 'dpad';
  activeCompanionId?: CompanionId | null;
  companionTrust?: Partial<Record<CompanionId, number>>;
  defeatedEncounters?: string[];
  completedExpeditions?: string[];
}

export type CompanionId = 'lia' | 'tomas' | 'clara' | 'amaru';

export type CombatTargetType = 'enemy' | 'ally' | 'self' | 'area';
export type CombatElementType = 'physical' | 'fire' | 'electric_resonant';
export type SkillCategory = 'basic' | 'light' | 'major_synergy' | 'heal' | 'defend';

export interface CombatSkillDefinition {
  id: string;
  name: string;
  description: string;
  apCost: number;       // 1 o 2 PA
  focusCost: number;    // 0 a 2 Concentración
  targetType: CombatTargetType;
  range: number;        // Alcance en celdas (1 para melee, 2-3 para distancia)
  category: SkillCategory;
  element: CombatElementType;
  multiplier?: number;  // Multiplicador de daño o curación base
  appliesStatus?: {
    stunned?: boolean;
    slowed?: boolean;
    brokenArmor?: boolean;
    weakened?: boolean;
    synchronized?: boolean;
    pushCells?: number;
  };
  flavorHint?: string;
}

export interface CombatantState {
  id: string;
  name: string;
  isAlly: boolean;
  companionId?: CompanionId;
  archetype?: CharacterArchetype;
  x: number; // Coordenada en arena 0 a 7
  y: number; // Coordenada en arena 0 a 4
  currentHp: number;
  maxHp: number;
  atk: number;
  def: number;
  spd: number;
  ap: number;
  maxAp: number;
  focus: number;
  maxFocus: number;
  isDefending: boolean;
  statusStunned?: boolean;
  statusSlowed?: boolean;
  statusWeakened?: boolean;
  statusSynchronized?: boolean;
  statusBrokenArmor?: boolean;
  statusClockworkAura?: boolean;
  skills: CombatSkillDefinition[];
  facing: Direction;
}

export interface TacticalCell {
  x: number; // 0..7
  y: number; // 0..4
  kind: 'normal' | 'water' | 'ice' | 'column' | 'brazier' | 'crystal';
  telegraph?: {
    damage: number;
    sourceId: string;
    turnsRemaining: number;
    kind: 'line' | 'cross' | 'jump' | 'lightning';
  };
}

export interface ExpeditionDefinition {
  id: string;
  title: string;
  subtitle: string;
  regionMapId: MapId;
  recommendedLevel: number;
  recommendedCompanionId: CompanionId;
  recommendedToolId?: ExplorationToolId;
  preEchoHint: string;
  encounterId: string;
  campDialogue: {
    prompt: string;
    options: {
      label: string;
      tacticalBonus: 'focus_plus_1' | 'first_turn_shield' | 'reveal_weakness';
      companionReaction: string;
    }[];
  };
  rewards: {
    xp: number;
    coins: number;
    itemId?: string;
    trustCompanionId?: CompanionId;
  };
}

