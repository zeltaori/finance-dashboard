// Banco de dados de categorias e descrições para autocomplete
export const bancoDados = {
  receitas: [
    { descricao: "Salário", categoria: "Salário" },
    { descricao: "FGTS", categoria: "Benefício" },
    { descricao: "Adiantamento", categoria: "Adiantamento" },
    { descricao: "VA", categoria: "Vale" },
    { descricao: "VR", categoria: "Vale" },
    { descricao: "VT", categoria: "Vale" },
    { descricao: "Saldo Anterior", categoria: "Saldo" },
    { descricao: "Auxílio", categoria: "Benefício" },
    { descricao: "Ajuda de Custo", categoria: "Benefício" },
    { descricao: "Outros", categoria: "Outros" },
    { descricao: "Férias", categoria: "Benefício" },
    { descricao: "Décimo", categoria: "Benefício" },
    { descricao: "PC", categoria: "Renda Extra" },
  ],
  despesas: [
    { descricao: "Aluguel", categoria: "Moradia" },
    { descricao: "Condomínio", categoria: "Moradia" },
    { descricao: "Internet", categoria: "Serviços" },
    { descricao: "Celular", categoria: "Serviços" },
    { descricao: "Cabelo", categoria: "Cuidados" },
    { descricao: "Aparelho", categoria: "Saúde" },
    { descricao: "Facul", categoria: "Educação" },
    { descricao: "Cartões", categoria: "Dívidas" },
    { descricao: "Cartão Sant", categoria: "Cartão" },
    { descricao: "Cartão Sam.", categoria: "Cartão" },
    { descricao: "Cartão MP", categoria: "Cartão" },
    { descricao: "Empréstimo MP", categoria: "Dívidas" },
    { descricao: "Investimentos", categoria: "Investimentos" },
    { descricao: "Metas", categoria: "Metas" },
    { descricao: "Lazer", categoria: "Lazer" },
    { descricao: "Prazeres", categoria: "Lazer" },
    { descricao: "Mercado", categoria: "Alimentação" },
    { descricao: "Alimentação", categoria: "Alimentação" },
    { descricao: "Alim. Semana", categoria: "Alimentação" },
    { descricao: "VR SEMANA", categoria: "VR" },
    { descricao: "VR FDS", categoria: "VR" },
    { descricao: "VR", categoria: "VR" },
    { descricao: "VR ALMOÇO", categoria: "VR" },
    { descricao: "VR JANTA", categoria: "VR" },
    { descricao: "VT", categoria: "Transporte" },
    { descricao: "Transporte", categoria: "Transporte" },
    { descricao: "VT Ida Mon", categoria: "Transporte" },
    { descricao: "VT Volta Mon", categoria: "Transporte" },
    { descricao: "VT Camp", categoria: "Transporte" },
    { descricao: "Van", categoria: "Transporte" },
    { descricao: "Mãe", categoria: "Família" },
    { descricao: "Lorena", categoria: "Família" },
    { descricao: "Acordo", categoria: "Dívidas" },
    { descricao: "Cheque Esp.", categoria: "Banco" },
    { descricao: "Dízimo", categoria: "Outros" },
    { descricao: "Outras", categoria: "Outras" },
    { descricao: "SOBRA EMP.", categoria: "Outros" },
    { descricao: "Saldo para janeiro", categoria: "Outros" },
    { descricao: "Santander mãe", categoria: "Família" },
    { descricao: "Provisão Janeiro", categoria: "Outros" },
  ]
};

export interface Receita {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
}

export interface Despesa {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  gastei: number;
  falta: number;
  historico_gastos: number[];
  isOutras?: boolean; // Flag para identificar despesa "Outras"
}

export interface MesData {
  nome: string;
  receitas: Receita[];
  despesas: Despesa[];
  total_receitas: number;
  total_despesas: number;
  sobra: number;
}

export const meses: MesData[] = [
  {
    nome: "Fevereiro 2026",
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 1044.00 },
      { id: "r2", descricao: "PC", categoria: "PC", valor: 1032.73 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 1539.00 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 1020.00 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 500.00 },
    ],
    despesas: [
      { id: "d1", descricao: "Cabelo", categoria: "Cuidados", valor: -95.00, gastei: 69.31, falta: 25.69, historico_gastos: [69.31] },
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: -475.00, gastei: 350.00, falta: 125.00, historico_gastos: [350.00] },
      { id: "d3", descricao: "Cheque Esp.", categoria: "Banco", valor: -195.00, gastei: 195.00, falta: 0.00, historico_gastos: [195.00] },
      { id: "d4", descricao: "Mãe", categoria: "Família", valor: -447.63, gastei: 100.00, falta: 347.63, historico_gastos: [100.00] },
      { id: "d5", descricao: "Acordo", categoria: "Dívidas", valor: -80.00, gastei: 80.00, falta: 0.00, historico_gastos: [80.00] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: -218.89, gastei: 218.89, falta: 0.00, historico_gastos: [218.89] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: -372.07, gastei: 372.07, falta: 0.00, historico_gastos: [372.07] },
      { id: "d8", descricao: "Alim. Semana", categoria: "Alimentação", valor: -238.07, gastei: 88.37, falta: 149.70, historico_gastos: [88.37] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: -38.87, gastei: 35.88, falta: 2.99, historico_gastos: [35.88] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: -981.13, gastei: 808.29, falta: 172.84, historico_gastos: [808.29] },
      { id: "d11", descricao: "VT Ida Mon", categoria: "Transporte", valor: -140.00, gastei: 100.00, falta: 40.00, historico_gastos: [100.00] },
      { id: "d12", descricao: "VT Volta Mon", categoria: "Transporte", valor: -99.99, gastei: 0.00, falta: 99.99, historico_gastos: [] },
      { id: "d13", descricao: "VT Camp", categoria: "Transporte", valor: -370.00, gastei: 94.39, falta: 275.61, historico_gastos: [94.39] },
      { id: "d14", descricao: "SOBRA EMP.", categoria: "Outros", valor: -60.00, gastei: 60.00, falta: 0.00, historico_gastos: [60.00] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: -50.00, gastei: 50.00, falta: 0.00, historico_gastos: [50.00] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 5135.73,
    total_despesas: 3930.96,
    sobra: 1204.77,
  },
  {
    nome: "Março 2026",
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 6175.80 },
      { id: "r2", descricao: "Saldo Anterior", categoria: "Saldo", valor: 82.72 },
      { id: "r3", descricao: "VR", categoria: "VR", valor: 600.00 },
      { id: "r4", descricao: "VT", categoria: "VT", valor: 0.00 },
      { id: "r5", descricao: "Adiantamento", categoria: "Adiantamento", valor: 1040.00 },
    ],
    despesas: [
      { id: "d1", descricao: "Internet", categoria: "Serviços", valor: -89.90, gastei: 89.90, falta: 0.00, historico_gastos: [89.90] },
      { id: "d2", descricao: "Cabelo", categoria: "Cuidados", valor: -35.00, gastei: 35.00, falta: 0.00, historico_gastos: [35.00] },
      { id: "d3", descricao: "Facul", categoria: "Educação", valor: -137.56, gastei: 137.56, falta: 0.00, historico_gastos: [137.56] },
      { id: "d4", descricao: "Mercado", categoria: "Alimentação", valor: -240.00, gastei: 61.98, falta: 178.02, historico_gastos: [61.98] },
      { id: "d5", descricao: "Lazer", categoria: "Lazer", valor: -360.00, gastei: 184.46, falta: 175.54, historico_gastos: [184.46] },
      { id: "d6", descricao: "Transporte", categoria: "Transporte", valor: -150.00, gastei: 150.00, falta: 0.00, historico_gastos: [150.00] },
      { id: "d7", descricao: "Investimentos", categoria: "Investimentos", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d8", descricao: "Cartões", categoria: "Dívidas", valor: -2486.71, gastei: 2486.71, falta: 0.00, historico_gastos: [2486.71] },
      { id: "d9", descricao: "Aparelho", categoria: "Saúde", valor: -65.90, gastei: 65.90, falta: 0.00, historico_gastos: [65.90] },
      { id: "d10", descricao: "Celular", categoria: "Serviços", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d11", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 7898.52,
    total_despesas: 3565.07,
    sobra: 4333.45,
  },
  {
    nome: "Abril 2026",
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 1017.83 },
      { id: "r2", descricao: "Saldo Anterior", categoria: "Saldo", valor: 254.60 },
      { id: "r3", descricao: "VR", categoria: "VR", valor: 1050.00 },
      { id: "r4", descricao: "VT", categoria: "VT", valor: 0.00 },
      { id: "r5", descricao: "Adiantamento", categoria: "Adiantamento", valor: 1040.00 },
    ],
    despesas: [
      { id: "d1", descricao: "Internet", categoria: "Serviços", valor: -89.90, gastei: 89.90, falta: 0.00, historico_gastos: [89.90] },
      { id: "d2", descricao: "Cabelo", categoria: "Cuidados", valor: -70.00, gastei: 70.00, falta: 0.00, historico_gastos: [70.00] },
      { id: "d3", descricao: "Facul", categoria: "Educação", valor: -155.52, gastei: 155.52, falta: 0.00, historico_gastos: [155.52] },
      { id: "d4", descricao: "Transporte", categoria: "Transporte", valor: -250.00, gastei: 250.00, falta: 0.00, historico_gastos: [250.00] },
      { id: "d5", descricao: "Investimentos", categoria: "Investimentos", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d6", descricao: "Cartões", categoria: "Dívidas", valor: -334.76, gastei: 334.76, falta: 0.00, historico_gastos: [334.76] },
      { id: "d7", descricao: "Aparelho", categoria: "Saúde", valor: -65.90, gastei: 65.90, falta: 0.00, historico_gastos: [65.90] },
      { id: "d8", descricao: "Celular", categoria: "Serviços", valor: -20.00, gastei: 20.00, falta: 0.00, historico_gastos: [20.00] },
      { id: "d9", descricao: "Mercado", categoria: "Alimentação", valor: -420.00, gastei: 337.00, falta: 83.00, historico_gastos: [337.00] },
      { id: "d10", descricao: "Lazer", categoria: "Lazer", valor: -630.00, gastei: 600.82, falta: 29.18, historico_gastos: [600.82] },
      { id: "d11", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 3362.43,
    total_despesas: 2036.08,
    sobra: 1326.35,
  },
  {
    nome: "Maio 2026",
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 1353.00 },
      { id: "r2", descricao: "VT", categoria: "VT", valor: 0.00 },
      { id: "r3", descricao: "Saldo Anterior", categoria: "Saldo", valor: 3056.33 },
      { id: "r4", descricao: "Adiantamento", categoria: "Adiantamento", valor: 1040.00 },
      { id: "r5", descricao: "VR", categoria: "VR", valor: 1050.00 },
    ],
    despesas: [
      { id: "d1", descricao: "Aluguel", categoria: "Moradia", valor: -910.00, gastei: 910.00, falta: 0.00, historico_gastos: [910.00] },
      { id: "d2", descricao: "Internet", categoria: "Serviços", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d3", descricao: "Cabelo", categoria: "Cuidados", valor: -35.00, gastei: 35.00, falta: 0.00, historico_gastos: [35.00] },
      { id: "d4", descricao: "Aparelho", categoria: "Saúde", valor: -65.90, gastei: 65.90, falta: 0.00, historico_gastos: [65.90] },
      { id: "d5", descricao: "Celular", categoria: "Serviços", valor: -20.00, gastei: 20.00, falta: 0.00, historico_gastos: [20.00] },
      { id: "d6", descricao: "Facul", categoria: "Educação", valor: -155.52, gastei: 155.52, falta: 0.00, historico_gastos: [155.52] },
      { id: "d7", descricao: "Investimentos", categoria: "Investimentos", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d8", descricao: "Cartões", categoria: "Dívidas", valor: -1999.85, gastei: 1999.85, falta: 0.00, historico_gastos: [1999.85] },
      { id: "d9", descricao: "Metas", categoria: "Metas", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d10", descricao: "Prazeres", categoria: "Lazer", valor: -419.44, gastei: 419.44, falta: 0.00, historico_gastos: [419.44] },
      { id: "d11", descricao: "Alimentação", categoria: "Alimentação", valor: -1050.00, gastei: 753.77, falta: 296.23, historico_gastos: [753.77] },
      { id: "d12", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 6499.33,
    total_despesas: 4655.71,
    sobra: 1843.62,
  },
  {
    nome: "Junho 2026",
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 1270.40 },
      { id: "r2", descricao: "VT", categoria: "VT", valor: 259.60 },
      { id: "r3", descricao: "Saldo Anterior", categoria: "Saldo", valor: 1262.67 },
      { id: "r4", descricao: "Adiantamento", categoria: "Adiantamento", valor: 1400.00 },
      { id: "r5", descricao: "VR", categoria: "VR", valor: 950.00 },
    ],
    despesas: [
      { id: "d1", descricao: "Aluguel", categoria: "Moradia", valor: -910.00, gastei: 910.00, falta: 0.00, historico_gastos: [910.00] },
      { id: "d2", descricao: "Cabelo", categoria: "Cuidados", valor: -35.00, gastei: 35.00, falta: 0.00, historico_gastos: [35.00] },
      { id: "d3", descricao: "Aparelho", categoria: "Saúde", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d4", descricao: "Celular", categoria: "Serviços", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d5", descricao: "Facul", categoria: "Educação", valor: -155.52, gastei: 155.52, falta: 0.00, historico_gastos: [155.52] },
      { id: "d6", descricao: "Investimentos", categoria: "Investimentos", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d7", descricao: "Cartões", categoria: "Dívidas", valor: -2554.37, gastei: 2554.37, falta: 0.00, historico_gastos: [2554.37] },
      { id: "d8", descricao: "Metas", categoria: "Metas", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d9", descricao: "Alimentação", categoria: "Alimentação", valor: -950.00, gastei: 677.04, falta: 272.96, historico_gastos: [677.04] },
      { id: "d10", descricao: "Prazeres", categoria: "Lazer", valor: -112.24, gastei: 112.24, falta: 0.00, historico_gastos: [112.24] },
      { id: "d11", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 5142.67,
    total_despesas: 4717.13,
    sobra: 425.54,
  },
  {
    nome: "Julho 2026",
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 1516.00 },
      { id: "r2", descricao: "VT", categoria: "VT", valor: 0.00 },
      { id: "r3", descricao: "Saldo Anterior", categoria: "Saldo", valor: 779.76 },
      { id: "r4", descricao: "Adiantamento", categoria: "Adiantamento", valor: 1240.00 },
      { id: "r5", descricao: "VR", categoria: "VR", valor: 1050.00 },
    ],
    despesas: [
      { id: "d1", descricao: "Aluguel", categoria: "Moradia", valor: -940.34, gastei: 940.34, falta: 0.00, historico_gastos: [940.34] },
      { id: "d2", descricao: "Cabelo", categoria: "Cuidados", valor: -50.00, gastei: 50.00, falta: 0.00, historico_gastos: [50.00] },
      { id: "d3", descricao: "Aparelho", categoria: "Saúde", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d4", descricao: "Celular", categoria: "Serviços", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d5", descricao: "Facul", categoria: "Educação", valor: -155.53, gastei: 155.53, falta: 0.00, historico_gastos: [155.53] },
      { id: "d6", descricao: "Investimentos", categoria: "Investimentos", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d7", descricao: "Cartões", categoria: "Dívidas", valor: -1247.32, gastei: 1247.32, falta: 0.00, historico_gastos: [1247.32] },
      { id: "d8", descricao: "Metas", categoria: "Metas", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d9", descricao: "Alimentação", categoria: "Alimentação", valor: -1050.00, gastei: 1018.43, falta: 31.57, historico_gastos: [1018.43] },
      { id: "d10", descricao: "Prazeres", categoria: "Lazer", valor: -80.00, gastei: 80.00, falta: 0.00, historico_gastos: [80.00] },
      { id: "d11", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 4585.76,
    total_despesas: 3523.19,
    sobra: 1062.57,
  },
  {
    nome: "Agosto 2026",
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 1490.98 },
      { id: "r2", descricao: "VT", categoria: "VT", valor: 506.10 },
      { id: "r3", descricao: "Saldo Anterior", categoria: "Saldo", valor: 716.21 },
      { id: "r4", descricao: "Adiantamento", categoria: "Adiantamento", valor: 1240.00 },
      { id: "r5", descricao: "VR", categoria: "VR", valor: 1050.00 },
    ],
    despesas: [
      { id: "d1", descricao: "Transporte", categoria: "Transporte", valor: -350.00, gastei: 350.00, falta: 0.00, historico_gastos: [350.00] },
      { id: "d2", descricao: "Cabelo", categoria: "Cuidados", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d3", descricao: "Aparelho", categoria: "Saúde", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d4", descricao: "Celular", categoria: "Serviços", valor: -20.00, gastei: 20.00, falta: 0.00, historico_gastos: [20.00] },
      { id: "d5", descricao: "Facul", categoria: "Educação", valor: -155.52, gastei: 155.52, falta: 0.00, historico_gastos: [155.52] },
      { id: "d6", descricao: "Investimentos", categoria: "Investimentos", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d7", descricao: "Cartões", categoria: "Dívidas", valor: -2755.11, gastei: 2755.11, falta: 0.00, historico_gastos: [2755.11] },
      { id: "d8", descricao: "Metas", categoria: "Metas", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d9", descricao: "Alimentação", categoria: "Alimentação", valor: -1050.00, gastei: 1050.00, falta: 0.00, historico_gastos: [1050.00] },
      { id: "d10", descricao: "Prazeres", categoria: "Lazer", valor: -28.00, gastei: 28.00, falta: 0.00, historico_gastos: [28.00] },
      { id: "d11", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 5003.29,
    total_despesas: 4358.63,
    sobra: 644.66,
  },
  {
    nome: "Setembro 2026",
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 1724.00 },
      { id: "r2", descricao: "Saldo Anterior", categoria: "Saldo", valor: 2339.90 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 1220.00 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 856.41 },
      { id: "r5", descricao: "VT", categoria: "VT", valor: 0.00 },
    ],
    despesas: [
      { id: "d1", descricao: "Aluguel", categoria: "Moradia", valor: -1023.00, gastei: 1023.00, falta: 0.00, historico_gastos: [1023.00] },
      { id: "d2", descricao: "Cabelo", categoria: "Cuidados", valor: -30.00, gastei: 30.00, falta: 0.00, historico_gastos: [30.00] },
      { id: "d3", descricao: "Aparelho", categoria: "Saúde", valor: -66.90, gastei: 66.90, falta: 0.00, historico_gastos: [66.90] },
      { id: "d4", descricao: "Celular", categoria: "Serviços", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d5", descricao: "Facul", categoria: "Educação", valor: -155.52, gastei: 155.52, falta: 0.00, historico_gastos: [155.52] },
      { id: "d6", descricao: "Investimentos", categoria: "Investimentos", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d7", descricao: "Cartões", categoria: "Dívidas", valor: -1804.68, gastei: 1804.68, falta: 0.00, historico_gastos: [1804.68] },
      { id: "d8", descricao: "Cartão MP", categoria: "Cartão", valor: -624.33, gastei: 624.33, falta: 0.00, historico_gastos: [624.33] },
      { id: "d9", descricao: "Alimentação", categoria: "Alimentação", valor: -856.41, gastei: 856.41, falta: 0.00, historico_gastos: [856.41] },
      { id: "d10", descricao: "Prazeres", categoria: "Lazer", valor: 0.00, gastei: 0.00, falta: 0.00, historico_gastos: [] },
      { id: "d11", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 6140.31,
    total_despesas: 4560.84,
    sobra: 1579.47,
  },
];

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', { 
    style: 'currency', 
    currency: 'BRL' 
  }).format(value);
};
