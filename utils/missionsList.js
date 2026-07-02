export const MISSOES = [
  // ============================
  // COMUNS (fáceis, rápidas)
  // ============================
  {
    id: "platina_1",
    raridade: "Comum",
    categoria: "Platinas",
    descricao: "Faz 1 platina esta semana.",
    objetivo: { platinas: 1, carreira: 0, xp: 0 },
    recompensa: 20,
    premium: false,
    secreta: false
  },
  {
    id: "carreira_1",
    raridade: "Comum",
    categoria: "Carreira GTA",
    descricao: "Completa 1 progresso de carreira GTA esta semana.",
    objetivo: { platinas: 0, carreira: 1, xp: 0 },
    recompensa: 20,
    premium: false,
    secreta: false
  },
  {
    id: "xp_200",
    raridade: "Comum",
    categoria: "XP",
    descricao: "Ganha 200 XP esta semana.",
    objetivo: { platinas: 0, carreira: 0, xp: 200 },
    recompensa: 20,
    premium: false,
    secreta: false
  },

  // ============================
  // INCOMUNS
  // ============================
  {
    id: "platina_2",
    raridade: "Incomum",
    categoria: "Platinas",
    descricao: "Faz 2 platinas esta semana.",
    objetivo: { platinas: 2, carreira: 0, xp: 0 },
    recompensa: 40,
    premium: false,
    secreta: false
  },
  {
    id: "carreira_3",
    raridade: "Incomum",
    categoria: "Carreira GTA",
    descricao: "Completa 3 progressos de carreira GTA esta semana.",
    objetivo: { platinas: 0, carreira: 3, xp: 0 },
    recompensa: 40,
    premium: false,
    secreta: false
  },

  // ============================
  // RARAS
  // ============================
  {
    id: "platina_3",
    raridade: "Rara",
    categoria: "Platinas",
    descricao: "Faz 3 platinas esta semana.",
    objetivo: { platinas: 3, carreira: 0, xp: 0 },
    recompensa: 75,
    premium: false,
    secreta: false
  },
  {
    id: "carreira_5",
    raridade: "Rara",
    categoria: "Carreira GTA",
    descricao: "Completa 5 progressos de carreira GTA esta semana.",
    objetivo: { platinas: 0, carreira: 5, xp: 0 },
    recompensa: 75,
    premium: false,
    secreta: false
  },

  // ============================
  // ÉPICAS
  // ============================
  {
    id: "platina_4",
    raridade: "Épica",
    categoria: "Platinas",
    descricao: "Faz 4 platinas esta semana.",
    objetivo: { platinas: 4, carreira: 0, xp: 0 },
    recompensa: 120,
    premium: false,
    secreta: false
  },
  {
    id: "carreira_7",
    raridade: "Épica",
    categoria: "Carreira GTA",
    descricao: "Completa 7 progressos de carreira GTA esta semana.",
    objetivo: { platinas: 0, carreira: 7, xp: 0 },
    recompensa: 120,
    premium: false,
    secreta: false
  },

  // ============================
  // LENDÁRIAS
  // ============================
  {
    id: "platina_5",
    raridade: "Lendária",
    categoria: "Platinas",
    descricao: "Faz 5 platinas esta semana.",
    objetivo: { platinas: 5, carreira: 0, xp: 0 },
    recompensa: 180,
    premium: false,
    secreta: false
  },
  {
    id: "carreira_10",
    raridade: "Lendária",
    categoria: "Carreira GTA",
    descricao: "Completa 10 progressos de carreira GTA esta semana.",
    objetivo: { platinas: 0, carreira: 10, xp: 0 },
    recompensa: 180,
    premium: false,
    secreta: false
  },

  // ============================
  // MÍTICAS
  // ============================
  {
    id: "mitica_combo",
    raridade: "Mítica",
    categoria: "Multi",
    descricao: "Faz 2 platinas e 5 progressos de carreira GTA.",
    objetivo: { platinas: 2, carreira: 5, xp: 0 },
    recompensa: 250,
    premium: false,
    secreta: false
  },

  // ============================
  // EXÓTICAS
  // ============================
  {
    id: "exotica_xp",
    raridade: "Exótica",
    categoria: "XP",
    descricao: "Ganha 1500 XP esta semana.",
    objetivo: { platinas: 0, carreira: 0, xp: 1500 },
    recompensa: 350,
    premium: false,
    secreta: false
  },

  // ============================
  // PREMIUM
  // ============================
  {
    id: "premium_combo",
    raridade: "Premium",
    categoria: "Multi",
    descricao: "Faz 1 platina e 5 progressos de carreira GTA.",
    objetivo: { platinas: 1, carreira: 5, xp: 0 },
    recompensa: 500,
    premium: true,
    secreta: false
  },

  // ============================
  // SECRETAS
  // ============================
  {
    id: "secreta_1",
    raridade: "Secreta",
    categoria: "Secreta",
    descricao: "Missão secreta… descobre como completar.",
    objetivo: { platinas: 1, carreira: 1, xp: 100 },
    recompensa: 999,
    premium: false,
    secreta: true
  }
];
