export const MISSOES = [
  // ============================
  // COMUNS
  // ============================
  {
    id: "platina_1",
    raridade: "Comum",
    categoria: "Platinas",
    descricao: "Faz 1 platina esta semana.",
    objetivo: { platinas: 1, conquistas: 0, xp: 0 },
    recompensa: 50,
    premium: false,
    secreta: false
  },
  {
    id: "conquista_10",
    raridade: "Comum",
    categoria: "Conquistas",
    descricao: "Ganha 10 conquistas esta semana.",
    objetivo: { platinas: 0, conquistas: 10, xp: 0 },
    recompensa: 40,
    premium: false,
    secreta: false
  },
  {
    id: "xp_500",
    raridade: "Comum",
    categoria: "XP",
    descricao: "Ganha 500 XP esta semana.",
    objetivo: { platinas: 0, conquistas: 0, xp: 500 },
    recompensa: 30,
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
    objetivo: { platinas: 2, conquistas: 0, xp: 0 },
    recompensa: 120,
    premium: false,
    secreta: false
  },
  {
    id: "conquista_25",
    raridade: "Incomum",
    categoria: "Conquistas",
    descricao: "Ganha 25 conquistas esta semana.",
    objetivo: { platinas: 0, conquistas: 25, xp: 0 },
    recompensa: 100,
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
    objetivo: { platinas: 3, conquistas: 0, xp: 0 },
    recompensa: 200,
    premium: false,
    secreta: false
  },
  {
    id: "combo_1",
    raridade: "Rara",
    categoria: "Multi",
    descricao: "Faz 1 platina e 20 conquistas.",
    objetivo: { platinas: 1, conquistas: 20, xp: 0 },
    recompensa: 220,
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
    objetivo: { platinas: 4, conquistas: 0, xp: 0 },
    recompensa: 350,
    premium: false,
    secreta: false
  },
  {
    id: "combo_2",
    raridade: "Épica",
    categoria: "Multi",
    descricao: "Faz 2 platinas e 40 conquistas.",
    objetivo: { platinas: 2, conquistas: 40, xp: 0 },
    recompensa: 400,
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
    objetivo: { platinas: 5, conquistas: 0, xp: 0 },
    recompensa: 600,
    premium: false,
    secreta: false
  },
  {
    id: "combo_3",
    raridade: "Lendária",
    categoria: "Multi",
    descricao: "Faz 3 platinas e 60 conquistas.",
    objetivo: { platinas: 3, conquistas: 60, xp: 0 },
    recompensa: 700,
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
    descricao: "Faz 4 platinas e 100 conquistas.",
    objetivo: { platinas: 4, conquistas: 100, xp: 0 },
    recompensa: 1000,
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
    descricao: "Ganha 5000 XP numa semana.",
    objetivo: { platinas: 0, conquistas: 0, xp: 5000 },
    recompensa: 1500,
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
    descricao: "Faz 5 platinas e 150 conquistas.",
    objetivo: { platinas: 5, conquistas: 150, xp: 0 },
    recompensa: 2500,
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
    objetivo: { platinas: 1, conquistas: 1, xp: 100 },
    recompensa: 999,
    premium: false,
    secreta: true
  }
];
