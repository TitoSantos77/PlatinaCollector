export const MISSOES = [
  // ============================
  // COMUNS (fáceis, rápidas)
  // ============================
  {
    id: "platina_1",
    raridade: "Comum",
    categoria: "Platinas",
    descricao: "Faz 1 platina esta semana.",
    objetivo: { platinas: 1, conquistas: 0, xp: 0 },
    recompensa: 20,
    premium: false,
    secreta: false
  },
  {
    id: "conquista_10",
    raridade: "Comum",
    categoria: "Conquistas",
    descricao: "Ganha 3 conquistas esta semana.",
    objetivo: { platinas: 0, conquistas: 3, xp: 0 },
    recompensa: 20,
    premium: false,
    secreta: false
  },
  {
    id: "xp_500",
    raridade: "Comum",
    categoria: "XP",
    descricao: "Ganha 200 XP esta semana.",
    objetivo: { platinas: 0, conquistas: 0, xp: 200 },
    recompensa: 20,
    premium: false,
    secreta: false
  },

  // ============================
  // INCOMUNS (um pouco mais)
  // ============================
  {
    id: "platina_2",
    raridade: "Incomum",
    categoria: "Platinas",
    descricao: "Faz 1 platina e 2 conquistas.",
    objetivo: { platinas: 1, conquistas: 2, xp: 0 },
    recompensa: 40,
    premium: false,
    secreta: false
  },
  {
    id: "conquista_25",
    raridade: "Incomum",
    categoria: "Conquistas",
    descricao: "Ganha 5 conquistas esta semana.",
    objetivo: { platinas: 0, conquistas: 5, xp: 0 },
    recompensa: 40,
    premium: false,
    secreta: false
  },

  // ============================
  // RARAS (missões com algum esforço)
  // ============================
  {
    id: "platina_3",
    raridade: "Rara",
    categoria: "Platinas",
    descricao: "Faz 1 platina e 3 conquistas.",
    objetivo: { platinas: 1, conquistas: 3, xp: 0 },
    recompensa: 75,
    premium: false,
    secreta: false
  },
  {
    id: "combo_1",
    raridade: "Rara",
    categoria: "Multi",
    descricao: "Ganha 7 conquistas esta semana.",
    objetivo: { platinas: 0, conquistas: 7, xp: 0 },
    recompensa: 75,
    premium: false,
    secreta: false
  },

  // ============================
  // ÉPICAS (para quem joga mais)
  // ============================
  {
    id: "platina_4",
    raridade: "Épica",
    categoria: "Platinas",
    descricao: "Faz 1 platina e 5 conquistas.",
    objetivo: { platinas: 1, conquistas: 5, xp: 0 },
    recompensa: 120,
    premium: false,
    secreta: false
  },
  {
    id: "combo_2",
    raridade: "Épica",
    categoria: "Multi",
    descricao: "Ganha 10 conquistas esta semana.",
    objetivo: { platinas: 0, conquistas: 10, xp: 0 },
    recompensa: 120,
    premium: false,
    secreta: false
  },

  // ============================
  // LENDÁRIAS (puxadas mas humanas)
  // ============================
  {
    id: "platina_5",
    raridade: "Lendária",
    categoria: "Platinas",
    descricao: "Faz 2 platinas esta semana.",
    objetivo: { platinas: 2, conquistas: 0, xp: 0 },
    recompensa: 180,
    premium: false,
    secreta: false
  },
  {
    id: "combo_3",
    raridade: "Lendária",
    categoria: "Multi",
    descricao: "Faz 1 platina e 10 conquistas.",
    objetivo: { platinas: 1, conquistas: 10, xp: 0 },
    recompensa: 180,
    premium: false,
    secreta: false
  },

  // ============================
  // MÍTICAS (para jogadores dedicados)
  // ============================
  {
    id: "mitica_1",
    raridade: "Mítica",
    categoria: "Multi",
    descricao: "Faz 2 platinas e 5 conquistas.",
    objetivo: { platinas: 2, conquistas: 5, xp: 0 },
    recompensa: 250,
    premium: false,
    secreta: false
  },

  // ============================
  // EXÓTICAS (muito raras)
  // ============================
  {
    id: "exotica_1",
    raridade: "Exótica",
    categoria: "XP",
    descricao: "Ganha 1500 XP esta semana.",
    objetivo: { platinas: 0, conquistas: 0, xp: 1500 },
    recompensa: 350,
    premium: false,
    secreta: false
  },

  // ============================
  // PREMIUM (para quem quer desafio)
  // ============================
  {
    id: "premium_1",
    raridade: "Premium",
    categoria: "Multi",
    descricao: "Faz 1 platina e 5 conquistas.",
    objetivo: { platinas: 1, conquistas: 5, xp: 0 },
    recompensa: 500,
    premium: true,
    secreta: false
  },

  // ============================
  // SECRETAS (mantemos a loucura)
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
