export const MISSOES = [
  // ============================
  // COMUNS (fáceis, rápidas)
  // ============================
  {
    id: "platina_1",
    raridade: "Comum",
    categoria: "Platinas",
    descricao: "Faz 1 platina esta semana.",
    objetivo: { platinas: 1, proezas: 0, xp: 0 },
    recompensa: 20,
    premium: false,
    secreta: false
  },
  {
    id: "proeza_3",
    raridade: "Comum",
    categoria: "Proezas",
    descricao: "Ganha 3 proezas esta semana.",
    objetivo: { platinas: 0, proezas: 3, xp: 0 },
    recompensa: 20,
    premium: false,
    secreta: false
  },
  {
    id: "xp_200",
    raridade: "Comum",
    categoria: "XP",
    descricao: "Ganha 200 XP esta semana.",
    objetivo: { platinas: 0, proezas: 0, xp: 200 },
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
    descricao: "Faz 1 platina e 2 proezas.",
    objetivo: { platinas: 1, proezas: 2, xp: 0 },
    recompensa: 40,
    premium: false,
    secreta: false
  },
  {
    id: "proeza_5",
    raridade: "Incomum",
    categoria: "Proezas",
    descricao: "Ganha 5 proezas esta semana.",
    objetivo: { platinas: 0, proezas: 5, xp: 0 },
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
    descricao: "Faz 1 platina e 3 proezas.",
    objetivo: { platinas: 1, proezas: 3, xp: 0 },
    recompensa: 75,
    premium: false,
    secreta: false
  },
  {
    id: "proeza_7",
    raridade: "Rara",
    categoria: "Proezas",
    descricao: "Ganha 7 proezas esta semana.",
    objetivo: { platinas: 0, proezas: 7, xp: 0 },
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
    descricao: "Faz 1 platina e 5 proezas.",
    objetivo: { platinas: 1, proezas: 5, xp: 0 },
    recompensa: 120,
    premium: false,
    secreta: false
  },
  {
    id: "proeza_10",
    raridade: "Épica",
    categoria: "Proezas",
    descricao: "Ganha 10 proezas esta semana.",
    objetivo: { platinas: 0, proezas: 10, xp: 0 },
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
    descricao: "Faz 2 platinas esta semana.",
    objetivo: { platinas: 2, proezas: 0, xp: 0 },
    recompensa: 180,
    premium: false,
    secreta: false
  },
  {
    id: "combo_3",
    raridade: "Lendária",
    categoria: "Multi",
    descricao: "Faz 1 platina e 10 proezas.",
    objetivo: { platinas: 1, proezas: 10, xp: 0 },
    recompensa: 180,
    premium: false,
    secreta: false
  },

  // ============================
  // MÍTICAS
  // ============================
  {
    id: "mitica_1",
    raridade: "Mítica",
    categoria: "Multi",
    descricao: "Faz 2 platinas e 5 proezas.",
    objetivo: { platinas: 2, proezas: 5, xp: 0 },
    recompensa: 250,
    premium: false,
    secreta: false
  },

  // ============================
  // EXÓTICAS
  // ============================
  {
    id: "exotica_1",
    raridade: "Exótica",
    categoria: "XP",
    descricao: "Ganha 1500 XP esta semana.",
    objetivo: { platinas: 0, proezas: 0, xp: 1500 },
    recompensa: 350,
    premium: false,
    secreta: false
  },

  // ============================
  // PREMIUM
  // ============================
  {
    id: "premium_1",
    raridade: "Premium",
    categoria: "Multi",
    descricao: "Faz 1 platina e 5 proezas.",
    objetivo: { platinas: 1, proezas: 5, xp: 0 },
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
    objetivo: { platinas: 1, proezas: 1, xp: 100 },
    recompensa: 999,
    premium: false,
    secreta: true
  }
];
