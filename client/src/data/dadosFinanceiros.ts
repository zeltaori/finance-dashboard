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
  dataFinal?: string; // Data final do mês (ex: 2026-02-28)
  finsDeSemana?: number; // Número de fins de semana no mês
}

export const meses: MesData[] = [
  {
    nome: "Fevereiro 2026",
    dataFinal: "2026-02-28",
    finsDeSemana: 4,
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 0 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 0 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 0 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 0 },
    ],
    despesas: [
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 0,
    total_despesas: 0,
    sobra: 0,
  },
  {
    nome: "Março 2026",
    dataFinal: "2026-03-31",
    finsDeSemana: 4,
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 0 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 0 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 0 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 0 },
    ],
    despesas: [
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 0,
    total_despesas: 0,
    sobra: 0,
  },
  {
    nome: "Abril 2026",
    dataFinal: "2026-04-30",
    finsDeSemana: 4,
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 0 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 0 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 0 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 0 },
    ],
    despesas: [
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 0,
    total_despesas: 0,
    sobra: 0,
  },
  {
    nome: "Maio 2026",
    dataFinal: "2026-05-31",
    finsDeSemana: 4,
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 0 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 0 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 0 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 0 },
    ],
    despesas: [
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 0,
    total_despesas: 0,
    sobra: 0,
  },
  {
    nome: "Junho 2026",
    dataFinal: "2026-06-30",
    finsDeSemana: 4,
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 0 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 0 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 0 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 0 },
    ],
    despesas: [
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 0,
    total_despesas: 0,
    sobra: 0,
  },
  {
    nome: "Julho 2026",
    dataFinal: "2026-07-31",
    finsDeSemana: 4,
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 0 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 0 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 0 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 0 },
    ],
    despesas: [
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 0,
    total_despesas: 0,
    sobra: 0,
  },
  {
    nome: "Agosto 2026",
    dataFinal: "2026-08-31",
    finsDeSemana: 4,
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 0 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 0 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 0 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 0 },
    ],
    despesas: [
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 0,
    total_despesas: 0,
    sobra: 0,
  },
  {
    nome: "Setembro 2026",
    dataFinal: "2026-09-30",
    finsDeSemana: 4,
    receitas: [
      { id: "r1", descricao: "Salário", categoria: "Salário", valor: 0 },
      { id: "r3", descricao: "Adiantamento", categoria: "Adiantamento", valor: 0 },
      { id: "r4", descricao: "VR", categoria: "VR", valor: 0 },
      { id: "r5", descricao: "Saldo Anterior", categoria: "Saldo", valor: 0 },
    ],
    despesas: [
      { id: "d2", descricao: "Aluguel", categoria: "Moradia", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d6", descricao: "Cartão Sant", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d7", descricao: "Cartão Sam.", categoria: "Cartão", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d9", descricao: "VR SEMANA", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d10", descricao: "VR FDS", categoria: "VR", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d15", descricao: "Internet", categoria: "Serviços", valor: 0, gastei: 0, falta: 0, historico_gastos: [] },
      { id: "d16", descricao: "Outras", categoria: "Outras", valor: 0, gastei: 0, falta: 0, historico_gastos: [], isOutras: true },
    ],
    total_receitas: 0,
    total_despesas: 0,
    sobra: 0,
  },
];

export const initialMeses = meses;

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
