import {
  ClothingCategory,
  ClothingItemDefinition,
  ClothingSetId,
  EquippedOutfit,
  PlayerAppearance,
  SaveState,
} from './types';

export const INITIAL_COINS = 100;

export const CLOTHING_SET_LABELS: Record<ClothingSetId, string> = {
  inicial: 'Atuendo Inicial',
  sencillo: 'Prendas Sencillas',
  viajero: 'Atuendo de Viajero',
  bosque: 'Atuendo del Bosque',
  observatorio: 'Atuendo del Observatorio',
  guardian: 'Atuendo del Guardián',
  celestial: 'Atuendo Celestial',
};

export const DEFAULT_STARTER_OUTFIT: EquippedOutfit = {
  top: 'top_tunica_basica',
  bottom: 'bottom_pantalon_sencillo',
  footwear: 'shoe_botas_basicas',
  accessory: 'acc_ninguno',
};

export const CLOTHING_CATALOG: ClothingItemDefinition[] = [
  // =========================================================================
  // 1. ATUENDOS INICIALES GRATUITOS (Modestos y funcionales, 0 monedas)
  // =========================================================================
  {
    id: 'top_camiseta_sencilla',
    name: 'Camiseta sencilla',
    description:
      'Prenda ligera de algodón tejida en los telares cotidianos del valle. Cómoda para comenzar el camino.',
    category: 'top',
    setId: 'inicial',
    setLabel: 'Atuendo Inicial',
    price: 0,
    isStarter: true,
    compatibleWith: 'both',
    style: {
      primaryColor: '#475569',
      secondaryColor: '#64748b',
      trimColor: '#cbd5e1',
      sleeveStyle: 'short',
      isLongTunic: false,
    },
  },
  {
    id: 'top_tunica_basica',
    name: 'Túnica básica',
    description:
      'Túnica funcional de aprendiz con ribete color crema, tradicional entre quienes llegan por primera vez a Vespera.',
    category: 'top',
    setId: 'inicial',
    setLabel: 'Atuendo Inicial',
    price: 0,
    isStarter: true,
    compatibleWith: 'both',
    style: {
      primaryColor: '#2563eb',
      secondaryColor: '#3b82f6',
      trimColor: '#f5b942',
      sleeveStyle: 'long',
      isLongTunic: true,
    },
  },
  {
    id: 'bottom_pantalon_sencillo',
    name: 'Pantalón sencillo',
    description:
      'Pantalón de tela resistente en tono pizarra oscuro, ideal para largas caminatas por senderos empedrados.',
    category: 'bottom',
    setId: 'inicial',
    setLabel: 'Atuendo Inicial',
    price: 0,
    isStarter: true,
    compatibleWith: 'both',
    style: {
      primaryColor: '#1e293b',
      secondaryColor: '#334155',
      trimColor: '#64748b',
    },
  },
  {
    id: 'bottom_pantalon_viajero_basico',
    name: 'Pantalón de viajero básico',
    description:
      'Pantalón de lona color tierra con costuras reforzadas en las rodillas para cruzar caminos rurales.',
    category: 'bottom',
    setId: 'inicial',
    setLabel: 'Atuendo Inicial',
    price: 0,
    isStarter: true,
    compatibleWith: 'both',
    style: {
      primaryColor: '#5c4033',
      secondaryColor: '#7c5338',
      trimColor: '#d6b672',
    },
  },
  {
    id: 'shoe_zapatos_sencillos',
    name: 'Zapatos sencillos',
    description:
      'Calzado bajo de cuero suave hecho a mano por los artesanos de la plaza.',
    category: 'footwear',
    setId: 'inicial',
    setLabel: 'Atuendo Inicial',
    price: 0,
    isStarter: true,
    compatibleWith: 'both',
    style: {
      primaryColor: '#451a03',
      secondaryColor: '#78350f',
      bootHeight: 'low',
    },
  },
  {
    id: 'shoe_botas_basicas',
    name: 'Botas básicas',
    description:
      'Botas sencillas de media caña que protegen del rocío matinal en los caminos de Vespera.',
    category: 'footwear',
    setId: 'inicial',
    setLabel: 'Atuendo Inicial',
    price: 0,
    isStarter: true,
    compatibleWith: 'both',
    style: {
      primaryColor: '#3b2314',
      secondaryColor: '#6b3e26',
      trimColor: '#b45309',
      bootHeight: 'mid',
    },
  },
  {
    id: 'acc_ninguno',
    name: 'Sin accesorio',
    description: 'Aspecto despejado sin capa ni tocado adicional.',
    category: 'accessory',
    setId: 'inicial',
    setLabel: 'Atuendo Inicial',
    price: 0,
    isStarter: true,
    compatibleWith: 'both',
    style: {
      primaryColor: 'transparent',
      secondaryColor: 'transparent',
    },
  },

  // =========================================================================
  // 2. PRENDAS SENCILLAS DE ARTESANO (60 - 95 Monedas de Vespera)
  // =========================================================================
  {
    id: 'top_chaleco_artesano',
    name: 'Chaleco de artesano',
    description:
      'Chaleco de paño cálido con camisa color marfil, muy apreciado en el Distrito de los Signos.',
    category: 'top',
    setId: 'sencillo',
    setLabel: 'Prendas Sencillas',
    price: 80,
    compatibleWith: 'both',
    style: {
      primaryColor: '#92400e',
      secondaryColor: '#f6f0dd',
      trimColor: '#f5b942',
      sleeveStyle: 'long',
      isLongTunic: false,
    },
  },
  {
    id: 'bottom_pantalon_lino',
    name: 'Pantalón de lino claro',
    description:
      'Tejido fresco y ligero confeccionado en El Telar de Vespera para los días soleados.',
    category: 'bottom',
    setId: 'sencillo',
    setLabel: 'Prendas Sencillas',
    price: 70,
    compatibleWith: 'both',
    style: {
      primaryColor: '#94a3b8',
      secondaryColor: '#cbd5e1',
      trimColor: '#475569',
    },
  },
  {
    id: 'shoe_botas_caminante',
    name: 'Botas de caminante',
    description:
      'Botas resistentes con hebilla de bronce pulido para recorrer largas distancias.',
    category: 'footwear',
    setId: 'sencillo',
    setLabel: 'Prendas Sencillas',
    price: 65,
    compatibleWith: 'both',
    style: {
      primaryColor: '#5c2d16',
      secondaryColor: '#854d27',
      trimColor: '#fbbf24',
      bootHeight: 'mid',
    },
  },
  {
    id: 'acc_panuelo_viajero',
    name: 'Pañuelo de caminante',
    description:
      'Pañuelo carmesí anudado al cuello con broche dorado, símbolo de los mensajeros del valle.',
    category: 'accessory',
    setId: 'sencillo',
    setLabel: 'Prendas Sencillas',
    price: 60,
    compatibleWith: 'both',
    style: {
      primaryColor: '#dc2626',
      secondaryColor: '#f87171',
      trimColor: '#fbbf24',
      hasHoodOrCrown: 'bandana',
    },
  },

  // =========================================================================
  // 3. ATUENDO DE VIAJERO (120 - 180 Monedas de Vespera)
  // =========================================================================
  {
    id: 'top_casaca_viajero',
    name: 'Casaca de Viajero',
    description:
      'Casaca azul cobalto con refuerzos de cuero y cinturón de cartógrafo para expediciones entre regiones.',
    category: 'top',
    setId: 'viajero',
    setLabel: 'Atuendo de Viajero',
    price: 160,
    compatibleWith: 'both',
    style: {
      primaryColor: '#0284c7',
      secondaryColor: '#38bdf8',
      trimColor: '#fbbf24',
      sleeveStyle: 'long',
      isLongTunic: true,
    },
  },
  {
    id: 'bottom_pantalon_viajero',
    name: 'Brezas de Viajero',
    description:
      'Pantalón de expedición con pliegues reforzados que facilitan el paso por puentes y colinas.',
    category: 'bottom',
    setId: 'viajero',
    setLabel: 'Atuendo de Viajero',
    price: 140,
    compatibleWith: 'both',
    style: {
      primaryColor: '#0f172a',
      secondaryColor: '#1e3a8a',
      trimColor: '#38bdf8',
    },
  },
  {
    id: 'shoe_botas_viajero',
    name: 'Botas de Ruta Estelar',
    description:
      'Botas altas de cuero azulado con suela antideslizante para terrenos escarpados.',
    category: 'footwear',
    setId: 'viajero',
    setLabel: 'Atuendo de Viajero',
    price: 120,
    compatibleWith: 'both',
    style: {
      primaryColor: '#1e293b',
      secondaryColor: '#0284c7',
      trimColor: '#f5b942',
      bootHeight: 'tall',
    },
  },
  {
    id: 'acc_morral_explorador',
    name: 'Morral de Cronista',
    description:
      'Bandolera cruzada de cuero con estuche para mapas, pluma y fragmentos temporales.',
    category: 'accessory',
    setId: 'viajero',
    setLabel: 'Atuendo de Viajero',
    price: 130,
    compatibleWith: 'both',
    style: {
      primaryColor: '#b45309',
      secondaryColor: '#f59e0b',
      trimColor: '#fef08a',
      hasHoodOrCrown: 'satchel',
    },
  },

  // =========================================================================
  // 4. ATUENDO DEL BOSQUE (160 - 220 Monedas de Vespera)
  // =========================================================================
  {
    id: 'top_manto_bosque',
    name: 'Túnica del Bosque del Equilibrio',
    description:
      'Tejida con fibras naturales verde esmeralda y bordados dorados inspirados en la comunidad de Amaru.',
    category: 'top',
    setId: 'bosque',
    setLabel: 'Atuendo del Bosque',
    price: 210,
    compatibleWith: 'both',
    style: {
      primaryColor: '#15803d',
      secondaryColor: '#22c55e',
      trimColor: '#fde047',
      sleeveStyle: 'long',
      isLongTunic: true,
    },
  },
  {
    id: 'bottom_calzas_bosque',
    name: 'Calzas de Guardabosques',
    description:
      'Prenda inferior flexible en tonos musgo y corteza, ideal para caminar en silencio bajo los árboles.',
    category: 'bottom',
    setId: 'bosque',
    setLabel: 'Atuendo del Bosque',
    price: 180,
    compatibleWith: 'both',
    style: {
      primaryColor: '#14532d',
      secondaryColor: '#166534',
      trimColor: '#86efac',
    },
  },
  {
    id: 'shoe_botas_raices',
    name: 'Botas del Valle de las Raíces',
    description:
      'Calzado artesanal trenzado con cuero flexible y hojas grabadas en el talón.',
    category: 'footwear',
    setId: 'bosque',
    setLabel: 'Atuendo del Bosque',
    price: 160,
    compatibleWith: 'both',
    style: {
      primaryColor: '#3f6212',
      secondaryColor: '#65a30d',
      trimColor: '#fde047',
      bootHeight: 'tall',
    },
  },
  {
    id: 'acc_capa_bosque',
    name: 'Capa de Hojas Vivientes',
    description:
      'Capa corta esmeralda sujeta con un broche de ámbar que ondea suavemente al caminar.',
    category: 'accessory',
    setId: 'bosque',
    setLabel: 'Atuendo del Bosque',
    price: 220,
    compatibleWith: 'both',
    style: {
      primaryColor: '#166534',
      secondaryColor: '#4ade80',
      trimColor: '#f5b942',
      hasCape: true,
    },
  },

  // =========================================================================
  // 5. ATUENDO DEL OBSERVATORIO (260 - 340 Monedas de Vespera)
  // =========================================================================
  {
    id: 'top_tunica_observatorio',
    name: 'Túnica Astral del Observatorio',
    description:
      'Vestidura índigo y violeta bordada con hilos de plata que reproducen el mapa celeste de Lía.',
    category: 'top',
    setId: 'observatorio',
    setLabel: 'Atuendo del Observatorio',
    price: 320,
    compatibleWith: 'both',
    style: {
      primaryColor: '#4c1d95',
      secondaryColor: '#7c3aed',
      trimColor: '#38bdf8',
      sleeveStyle: 'long',
      isLongTunic: true,
    },
  },
  {
    id: 'bottom_faldellin_observatorio',
    name: 'Faldellín de los Signos',
    description:
      'Prenda ceremonial de terciopelo nocturno con cenefas de constelaciones en el borde inferior.',
    category: 'bottom',
    setId: 'observatorio',
    setLabel: 'Atuendo del Observatorio',
    price: 280,
    compatibleWith: 'both',
    style: {
      primaryColor: '#2e1065',
      secondaryColor: '#5b21b6',
      trimColor: '#c084fc',
    },
  },
  {
    id: 'shoe_calzado_estelar',
    name: 'Calzado de Vigía Estelar',
    description:
      'Botines violeta profundo con puntera argéntea utilizados por los astrónomos de la colina.',
    category: 'footwear',
    setId: 'observatorio',
    setLabel: 'Atuendo del Observatorio',
    price: 260,
    compatibleWith: 'both',
    style: {
      primaryColor: '#3b0764',
      secondaryColor: '#6d28d9',
      trimColor: '#7dd3fc',
      bootHeight: 'mid',
    },
  },
  {
    id: 'acc_diadema_astral',
    name: 'Diadema de Resonancia Celeste',
    description:
      'Aro de plata estelar con un pequeño cristal violeta que brilla en sintonía con los Ecos del Futuro.',
    category: 'accessory',
    setId: 'observatorio',
    setLabel: 'Atuendo del Observatorio',
    price: 340,
    compatibleWith: 'both',
    style: {
      primaryColor: '#a855f7',
      secondaryColor: '#e9d5ff',
      trimColor: '#38bdf8',
      hasHoodOrCrown: 'diadem',
      hasCape: true,
    },
  },

  // =========================================================================
  // 6. ATUENDO DEL GUARDIÁN (320 - 390 Monedas de Vespera)
  // =========================================================================
  {
    id: 'top_coraza_guardian',
    name: 'Cota Ligera del Guardián',
    description:
      'Peto ceremonial de acero bruñido y paño carmesí forjado con energía limpia en el Santuario del Fuego.',
    category: 'top',
    setId: 'guardian',
    setLabel: 'Atuendo del Guardián',
    price: 390,
    compatibleWith: 'both',
    style: {
      primaryColor: '#991b1b',
      secondaryColor: '#cbd5e1',
      trimColor: '#f5b942',
      sleeveStyle: 'armored',
      isLongTunic: true,
    },
  },
  {
    id: 'bottom_grebas_guardian',
    name: 'Grebas de Forja Solar',
    description:
      'Pantalón acorazado con placas ligeras que simbolizan la fortaleza y la protección de la comunidad.',
    category: 'bottom',
    setId: 'guardian',
    setLabel: 'Atuendo del Guardián',
    price: 350,
    compatibleWith: 'both',
    style: {
      primaryColor: '#334155',
      secondaryColor: '#64748b',
      trimColor: '#fbbf24',
    },
  },
  {
    id: 'shoe_escarpes_guardian',
    name: 'Escarpes del Santuario',
    description:
      'Botas reforzadas con aleación dorada y suela firme para custodiar los cuatro santuarios.',
    category: 'footwear',
    setId: 'guardian',
    setLabel: 'Atuendo del Guardián',
    price: 320,
    compatibleWith: 'both',
    style: {
      primaryColor: '#475569',
      secondaryColor: '#94a3b8',
      trimColor: '#f5b942',
      bootHeight: 'tall',
    },
  },
  {
    id: 'acc_emblema_guardian',
    name: 'Manto y Emblema del Guardián',
    description:
      'Capa carmesí de honor con el escudo dorado de los protectores del equilibrio.',
    category: 'accessory',
    setId: 'guardian',
    setLabel: 'Atuendo del Guardián',
    price: 380,
    compatibleWith: 'both',
    style: {
      primaryColor: '#b91c1c',
      secondaryColor: '#fbbf24',
      trimColor: '#fef08a',
      hasCape: true,
      hasHoodOrCrown: 'emblem',
    },
  },

  // =========================================================================
  // 7. ATUENDO CELESTIAL EXCLUSIVO (460 - 580 Monedas de Vespera)
  // =========================================================================
  {
    id: 'top_vestidura_celestial',
    name: 'Vestidura Celestial del Mañana',
    description:
      'Obra maestra de El Telar de Vespera: tejido blanco astral y oro solar reservado a los Arquitectos del Futuro.',
    category: 'top',
    setId: 'celestial',
    setLabel: 'Atuendo Celestial',
    price: 580,
    compatibleWith: 'both',
    style: {
      primaryColor: '#f8fafc',
      secondaryColor: '#f5b942',
      trimColor: '#38bdf8',
      sleeveStyle: 'long',
      isLongTunic: true,
    },
  },
  {
    id: 'bottom_toga_celestial',
    name: 'Toga de Luz Temporal',
    description:
      'Prenda inferior de seda luminosa con bordados en hilo de oro que destellan al caminar.',
    category: 'bottom',
    setId: 'celestial',
    setLabel: 'Atuendo Celestial',
    price: 490,
    compatibleWith: 'both',
    style: {
      primaryColor: '#e2e8f0',
      secondaryColor: '#fef08a',
      trimColor: '#f5b942',
    },
  },
  {
    id: 'shoe_botas_celestiales',
    name: 'Botas Aladas de Vespera',
    description:
      'Calzado blanco y dorado de artesanía legendaria, ligero como el viento del Santuario del Aire.',
    category: 'footwear',
    setId: 'celestial',
    setLabel: 'Atuendo Celestial',
    price: 460,
    compatibleWith: 'both',
    style: {
      primaryColor: '#f5b942',
      secondaryColor: '#fef08a',
      trimColor: '#38bdf8',
      bootHeight: 'tall',
    },
  },
  {
    id: 'acc_corona_estelar',
    name: 'Corona y Manto de las Estrellas',
    description:
      'La insignia suprema de la Ciudad del Mañana: una diadema áurea acompañada de un manto de luz celeste.',
    category: 'accessory',
    setId: 'celestial',
    setLabel: 'Atuendo Celestial',
    price: 550,
    compatibleWith: 'both',
    style: {
      primaryColor: '#fbbf24',
      secondaryColor: '#38bdf8',
      trimColor: '#ffffff',
      hasCape: true,
      hasHoodOrCrown: 'crown',
    },
  },
  // ================= V4: PRENDAS EXCLUSIVAS DE MISIONES Y DECISIONES =================
  {
    id: 'top_manto_corrientes',
    name: 'Manto de las Dos Corrientes',
    category: 'top',
    setId: 'observatorio',
    setLabel: 'Reliquia de las Decisiones',
    description:
      'Tejido por Valeria tras resolver el dilema del Reloj de las Dos Corrientes entre Tomás y Lía. Sus hilos plateados y violetas reflejan el pulso del tiempo.',
    price: 340,
    compatibleWith: 'both',
    style: {
      primaryColor: '#4c1d95',
      secondaryColor: '#38bdf8',
      trimColor: '#fbbf24',
      hasCape: true,
      sleeveStyle: 'long',
    },
  },
  {
    id: 'hat_diadema_cronista',
    name: 'Diadema del Cronista Sincero',
    category: 'accessory',
    setId: 'celestial',
    setLabel: 'Reliquia de las Decisiones',
    description:
      'Insignia de bronce y cristal estelar otorgada a quienes desvelan el misterio completo de "El mensaje que nunca llegó" y unen a las regiones de Vespera.',
    price: 290,
    compatibleWith: 'both',
    style: {
      primaryColor: '#38bdf8',
      secondaryColor: '#fbbf24',
      trimColor: '#ffffff',
      hasHoodOrCrown: 'crown',
    },
  },
  {
    id: 'shoes_botas_pacto_solar',
    name: 'Botas del Pacto del Bosque y la Forja',
    category: 'footwear',
    setId: 'bosque',
    setLabel: 'Reliquia de las Decisiones',
    description:
      'Calzado forjado con savia viva y bronce solar tras sellar la alianza entre la comunidad de Amaru y la Forja de Ígnea.',
    price: 240,
    compatibleWith: 'both',
    style: {
      primaryColor: '#047857',
      secondaryColor: '#f59e0b',
      trimColor: '#fef08a',
      bootHeight: 'tall',
    },
  },
  {
    id: 'suit_cronista_ecos',
    name: 'Túnica de los Ecos Anclados',
    category: 'top',
    setId: 'celestial',
    setLabel: 'Reliquia de las Decisiones',
    description:
      'Vestidura legendaria que resuena con los Ecos del Futuro anclados por toda Vespera. Combina capa astral, bordados de luz y corona de cristal.',
    price: 620,
    compatibleWith: 'both',
    style: {
      primaryColor: '#312e81',
      secondaryColor: '#c084fc',
      trimColor: '#fde047',
      hasCape: true,
      isLongTunic: true,
      sleeveStyle: 'long',
    },
  },
  // ================= V5: PRENDAS EXCLUSIVAS DE EXPLORACIÓN Y SECRETOS =================
  {
    id: 'top_caminante_astral',
    name: 'Manto del Caminante Astral',
    category: 'top',
    setId: 'celestial',
    setLabel: 'Reliquia del Espejismo',
    description:
      'Manto tejido con luz de niebla y plata temporal obtenido al resolver el misterio de "La Ciudad que no debería existir".',
    price: 540,
    compatibleWith: 'both',
    style: {
      primaryColor: '#0f172a',
      secondaryColor: '#38bdf8',
      trimColor: '#fde047',
      hasCape: true,
      isLongTunic: true,
      sleeveStyle: 'long',
    },
  },
  {
    id: 'acc_insignia_espejismo',
    name: 'Corona de la Ciudad Espejismo',
    category: 'accessory',
    setId: 'observatorio',
    setLabel: 'Reliquia del Espejismo',
    description:
      'Diadema de cristal resonante descubierta en la cámara secreta de la Galería del Espejismo.',
    price: 360,
    compatibleWith: 'both',
    style: {
      primaryColor: '#38bdf8',
      secondaryColor: '#e0f2fe',
      trimColor: '#f5b942',
      hasCape: true,
      hasHoodOrCrown: 'diadem',
    },
  },
];

export const STARTER_CLOTHING_IDS: string[] = CLOTHING_CATALOG.filter(
  (item) => item.isStarter
).map((item) => item.id);

export function getClothingItemById(
  itemId?: string
): ClothingItemDefinition | undefined {
  if (!itemId) return undefined;
  return CLOTHING_CATALOG.find((item) => item.id === itemId);
}

export function getStarterItemsByCategory(
  category: ClothingCategory
): ClothingItemDefinition[] {
  return CLOTHING_CATALOG.filter(
    (item) => item.isStarter && item.category === category
  );
}

export function getShopItemsByCategory(
  category: ClothingCategory
): ClothingItemDefinition[] {
  return CLOTHING_CATALOG.filter(
    (item) => !item.isStarter && item.category === category
  );
}

export function ensureValidEquippedOutfit(
  outfit?: Partial<EquippedOutfit>
): EquippedOutfit {
  const top =
    outfit?.top && getClothingItemById(outfit.top)?.category === 'top'
      ? outfit.top
      : DEFAULT_STARTER_OUTFIT.top;
  const bottom =
    outfit?.bottom && getClothingItemById(outfit.bottom)?.category === 'bottom'
      ? outfit.bottom
      : DEFAULT_STARTER_OUTFIT.bottom;
  const footwear =
    outfit?.footwear &&
    getClothingItemById(outfit.footwear)?.category === 'footwear'
      ? outfit.footwear
      : DEFAULT_STARTER_OUTFIT.footwear;
  const accessory =
    outfit?.accessory &&
    getClothingItemById(outfit.accessory)?.category === 'accessory'
      ? outfit.accessory
      : DEFAULT_STARTER_OUTFIT.accessory;

  return { top, bottom, footwear, accessory };
}

export function isItemCompatibleWithAppearance(
  item: ClothingItemDefinition,
  appearance: PlayerAppearance
): boolean {
  return (
    item.compatibleWith === 'both' || item.compatibleWith === appearance
  );
}

export interface PurchaseResult {
  ok: boolean;
  reason?:
    | 'not_found'
    | 'already_owned'
    | 'insufficient_coins'
    | 'insufficient_funds'
    | 'incompatible';
  message: string;
  nextState: SaveState;
}

/**
 * Pure function to validate and execute a clothing purchase in El Telar de Vespera.
 * Never charges twice for an owned item and checks coin balance strictly.
 */
export function purchaseClothingItem(
  state: SaveState,
  itemId: string,
  equipImmediately = false
): PurchaseResult {
  const item = getClothingItemById(itemId);
  if (!item) {
    return {
      ok: false,
      reason: 'not_found',
      message: 'Esta prenda no figura en el catálogo del Telar.',
      nextState: state,
    };
  }

  const owned = new Set([
    ...STARTER_CLOTHING_IDS,
    ...(state.ownedClothing || []),
  ]);

  if (owned.has(item.id)) {
    return {
      ok: false,
      reason: 'already_owned',
      message: 'Ya tienes esta prenda.',
      nextState: state,
    };
  }

  const appearance: PlayerAppearance = state.playerAppearance || 'hombre';
  if (!isItemCompatibleWithAppearance(item, appearance)) {
    return {
      ok: false,
      reason: 'incompatible',
      message: 'Esta prenda no es compatible con tu apariencia actual.',
      nextState: state,
    };
  }

  const currentCoins =
    typeof state.coins === 'number' ? state.coins : INITIAL_COINS;
  if (currentCoins < item.price) {
    return {
      ok: false,
      reason: 'insufficient_funds',
      message: 'No tienes suficientes monedas de Vespera.',
      nextState: state,
    };
  }

  owned.add(item.id);
  const nextCoins = currentCoins - item.price;
  const nextHistory = [
    ...(state.purchaseHistory || []),
    {
      itemId: item.id,
      price: item.price,
      timestamp: new Date().toISOString(),
    },
  ];

  const currentOutfit = ensureValidEquippedOutfit(state.equippedOutfit);
  const nextEquipped: EquippedOutfit = equipImmediately
    ? {
        ...currentOutfit,
        [item.category]: item.id,
      }
    : currentOutfit;

  const nextState: SaveState = {
    ...state,
    coins: nextCoins,
    ownedClothing: Array.from(owned),
    equippedOutfit: nextEquipped,
    purchaseHistory: nextHistory,
  };

  return {
    ok: true,
    message: `¡Has comprado ${item.name} por ${item.price} monedas de Vespera!`,
    nextState,
  };
}

export interface EquipResult {
  ok: boolean;
  message: string;
  nextState: SaveState;
}

/**
 * Pure function to equip an owned clothing item in its corresponding slot.
 */
export function equipClothingItem(
  state: SaveState,
  itemId: string
): EquipResult {
  const item = getClothingItemById(itemId);
  if (!item) {
    return {
      ok: false,
      message: 'Prenda no encontrada.',
      nextState: state,
    };
  }

  const owned = new Set([
    ...STARTER_CLOTHING_IDS,
    ...(state.ownedClothing || []),
  ]);
  if (!owned.has(item.id)) {
    return {
      ok: false,
      message: 'Aún no posees esta prenda en tu vestuario.',
      nextState: state,
    };
  }

  const currentOutfit = ensureValidEquippedOutfit(state.equippedOutfit);
  const nextOutfit: EquippedOutfit = {
    ...currentOutfit,
    [item.category]: item.id,
  };

  return {
    ok: true,
    message: `Equipado: ${item.name}.`,
    nextState: {
      ...state,
      equippedOutfit: nextOutfit,
    },
  };
}

/**
 * Pure function to restore the player's outfit to their chosen starter outfit.
 */
export function resetToInitialOutfit(state: SaveState): SaveState {
  const initial = ensureValidEquippedOutfit(
    state.initialOutfit || DEFAULT_STARTER_OUTFIT
  );
  return {
    ...state,
    equippedOutfit: { ...initial },
  };
}
