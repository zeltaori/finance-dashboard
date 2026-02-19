import { useState, useRef, useEffect, createContext } from 'react';
import { 
  Wallet, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, 
  Check, X, TrendingUp, TrendingDown, Calendar, DollarSign, Sun, Moon, Download, Upload
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';
import { meses as initialMeses, formatCurrency, type Receita, type Despesa, type MesData, bancoDados } from './data/dadosFinanceiros';
import './App.css';

// Tema Context
const ThemeContext = createContext<{ isDark: boolean; toggleTheme: () => void }>({ isDark: true, toggleTheme: () => {} });

// Cores para tema claro
const COLORS_LIGHT = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
// Cores para tema escuro (mais claras)
const COLORS_DARK = ['#4ade80', '#60a5fa', '#fbbf24', '#f87171', '#c084fc', '#f472b6', '#22d3ee', '#bfdbfe'];
const COLORS = COLORS_LIGHT;

function App() {
  const [isDark, setIsDark] = useState(true);
  const [meses, setMeses] = useState<MesData[]>(() => {
    // Limpar dados antigos do localStorage para usar os novos dados
    localStorage.removeItem('gestaoFinanceira_dados');
    return initialMeses;
  });
  const [mesSelecionado, setMesSelecionado] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('mes');
  const [dinheiroEspecie, setDinheiroEspecie] = useState(0);
  const [dataHoje, setDataHoje] = useState(new Date().toISOString().split('T')[0]);
  const [dataFinal, setDataFinal] = useState('2026-02-28');
  const [finsDeSemanaEditavel, setFinsDeSemanaEditavel] = useState(4);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mesData = meses[mesSelecionado];

  // Salvar no localStorage
  useEffect(() => {
    localStorage.setItem('gestaoFinanceira_dados', JSON.stringify(meses));
  }, [meses]);

  // Backup automático ao fechar
  useEffect(() => {
    const handleBeforeUnload = () => {
      const backupData = { meses, timestamp: new Date().toISOString(), versao: '1.0' };
      localStorage.setItem('gestaoFinanceira_backup_auto', JSON.stringify(backupData));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [meses]);

  const toggleTheme = () => setIsDark(!isDark);

  // Calcular VR FDS que falta gastar
  const calcularVRFDSFalta = () => {
    const vrFds = mesData.despesas.find(d => d.descricao.toUpperCase().includes('VR FDS'));
    return vrFds ? vrFds.falta : 0;
  };

  // Calcular gastos em "Outras"
  const calcularGastosOutras = () => {
    const outras = mesData.despesas.find(d => d.isOutras);
    return outras ? outras.gastei : 0;
  };

  // Calcular sobra: receitas - despesas + VR FDS que falta - gastos Outras
  const calcularSobra = () => {
    const vrFdsFalta = calcularVRFDSFalta();
    const gastosOutras = calcularGastosOutras();
    return mesData.total_receitas - mesData.total_despesas + vrFdsFalta - gastosOutras;
  };

  // Calcular saldo VR (VR SEMANA + VR FDS)
  const calcularSaldoVR = () => {
    const vrSemana = mesData.despesas.find(d => d.descricao.toUpperCase().includes('VR SEMANA'));
    const vrFds = mesData.despesas.find(d => d.descricao.toUpperCase().includes('VR FDS'));
    return (vrSemana ? vrSemana.falta : 0) + (vrFds ? vrFds.falta : 0);
  };

  // Calcular dias restantes
  const calcularDiasRestantes = () => {
    const hoje = new Date(dataHoje);
    const final = new Date(dataFinal);
    const diffTime = final.getTime() - hoje.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const diasRestantes = calcularDiasRestantes();
  const sobra = calcularSobra();
  const saldoVR = calcularSaldoVR();
  const totalLivre = sobra + dinheiroEspecie;
  const livreFDS = finsDeSemanaEditavel > 0 ? totalLivre / finsDeSemanaEditavel : 0;
  const mediaDiaria = diasRestantes > 0 ? totalLivre / diasRestantes : 0;

  const scrollMeses = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: direction === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  // Recalcular falta
  const recalcularFalta = (despesa: Despesa) => {
    if (despesa.isOutras) {
      despesa.valor = -despesa.gastei;
      despesa.falta = 0;
    } else {
      despesa.falta = Math.max(0, Math.abs(despesa.valor) - despesa.gastei);
    }
  };

  // Adicionar Receita
  const handleAddReceita = (novaReceita: Omit<Receita, 'id'>) => {
    const newMeses = [...meses];
    const id = `r${Date.now()}`;
    newMeses[mesSelecionado].receitas.push({ ...novaReceita, id });
    newMeses[mesSelecionado].total_receitas += novaReceita.valor;
    setMeses(newMeses);
  };

  // Adicionar Despesa
  const handleAddDespesa = (novaDespesa: Omit<Despesa, 'id' | 'falta' | 'historico_gastos'>) => {
    const newMeses = [...meses];
    const id = `d${Date.now()}`;
    const isOutras = novaDespesa.descricao === 'Outras';
    const gastei = isOutras ? 0 : (novaDespesa.gastei || 0);
    const valor = isOutras ? 0 : novaDespesa.valor;
    const falta = isOutras ? 0 : Math.max(0, Math.abs(valor) - gastei);
    
    newMeses[mesSelecionado].despesas.push({ 
      ...novaDespesa, id, falta,
      historico_gastos: gastei > 0 ? [gastei] : [],
      isOutras
    });
    
    if (!isOutras) {
      newMeses[mesSelecionado].total_despesas += Math.abs(valor);
    }
    setMeses(newMeses);
  };

  // Editar Receita
  const handleEditReceita = (id: string, field: string, value: unknown) => {
    const newMeses = [...meses];
    const receita = newMeses[mesSelecionado].receitas.find(r => r.id === id);
    if (receita) {
      const oldValor = receita.valor;
      (receita as unknown as Record<string, unknown>)[field] = value;
      if (field === 'valor') {
        newMeses[mesSelecionado].total_receitas += (value as number) - oldValor;
      }
    }
    setMeses(newMeses);
  };

  // Editar Despesa
  const handleEditDespesa = (id: string, field: string, value: unknown) => {
    const newMeses = [...meses];
    const despesa = newMeses[mesSelecionado].despesas.find(d => d.id === id);
    if (despesa) {
      if (field === 'valor') {
        const oldValor = despesa.valor;
        despesa.valor = value as number;
        newMeses[mesSelecionado].total_despesas += Math.abs(value as number) - Math.abs(oldValor);
        recalcularFalta(despesa);
      } else if (field === 'gastei') {
        despesa.gastei = value as number;
        recalcularFalta(despesa);
      } else {
        (despesa as unknown as Record<string, unknown>)[field] = value;
      }
    }
    setMeses(newMeses);
  };

  // Deletar Receita
  const handleDeleteReceita = (id: string) => {
    const newMeses = [...meses];
    const index = newMeses[mesSelecionado].receitas.findIndex(r => r.id === id);
    if (index !== -1) {
      const receita = newMeses[mesSelecionado].receitas[index];
      newMeses[mesSelecionado].total_receitas -= receita.valor;
      newMeses[mesSelecionado].receitas.splice(index, 1);
      setMeses(newMeses);
    }
  };

  // Deletar Despesa
  const handleDeleteDespesa = (id: string) => {
    const newMeses = [...meses];
    const index = newMeses[mesSelecionado].despesas.findIndex(d => d.id === id);
    if (index !== -1) {
      const despesa = newMeses[mesSelecionado].despesas[index];
      if (!despesa.isOutras) {
        newMeses[mesSelecionado].total_despesas -= Math.abs(despesa.valor);
      }
      newMeses[mesSelecionado].despesas.splice(index, 1);
      setMeses(newMeses);
    }
  };

  // Download JSON
  const handleDownloadJSON = () => {
    const dataStr = JSON.stringify(meses, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gestao_financeira_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Upload JSON
  const handleUploadJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data && Array.isArray(data)) {
            setMeses(data);
            alert('Dados importados com sucesso!');
          }
        } catch {
          alert('Erro ao importar arquivo. Verifique se é um JSON válido.');
        }
      };
      reader.readAsText(file);
    }
  };

  // Cores de texto por tema
  const textColorH1 = isDark ? '#f8fafc' : '#0f172a';
  const textColorH2 = isDark ? '#e2e8f0' : '#1e293b';
  const textColorBody = isDark ? '#cbd5e1' : '#334155';
  const textColorLabel = isDark ? '#94a3b8' : '#64748b';
  const textColorSecondary = isDark ? '#64748b' : '#94a3b8';
  
  // Cores para gráficos por tema
  const chartColors = isDark ? COLORS_DARK : COLORS_LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <div className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`} style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
        {/* Header */}
        <header className={`${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-200'} border-b sticky top-0 z-50 shadow-sm`}>
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH1 }}>Gestão Financeira</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Download className="w-4 h-4" />
                    Exportar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Exportar Dados</DialogTitle>
                  </DialogHeader>
                  <Button onClick={handleDownloadJSON} className="w-full">
                    Baixar como JSON
                  </Button>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Upload className="w-4 h-4" />
                    Importar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Importar Dados</DialogTitle>
                  </DialogHeader>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleUploadJSON}
                    className="w-full"
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-8">
          {/* Seleção de Mês */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH2 }}>Selecione o Mês</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scrollMeses('left')}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => scrollMeses('right')}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto pb-4 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {meses.map((mes, index) => (
                <button
                  key={index}
                  onClick={() => setMesSelecionado(index)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-semibold transition-colors ${
                    mesSelecionado === index
                      ? 'bg-blue-500 text-white shadow-lg'
                      : isDark
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  }`}
                >
                  {mes.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Resumo do Mês */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold" style={{ color: textColorLabel }}>Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(mesData.total_receitas)}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold" style={{ color: textColorLabel }}>Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(mesData.total_despesas)}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold" style={{ color: textColorLabel }}>Sobra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${sobra >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(sobra)}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold" style={{ color: textColorLabel }}>Saldo VR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-500">
                  {formatCurrency(saldoVR)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Configurações */}
          <Card className={`mb-8 ${isDark ? 'bg-slate-800 border-slate-700' : ''}`}>
            <CardHeader>
              <CardTitle className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH2 }}>Configurações</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Dinheiro em Espécie (R$)</Label>
                  <Input
                    type="number"
                    value={dinheiroEspecie}
                    onChange={(e) => setDinheiroEspecie(parseFloat(e.target.value) || 0)}
                    className={isDark ? 'bg-slate-700 border-slate-600 text-slate-50' : ''}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Data Hoje</Label>
                  <Input
                    type="date"
                    value={dataHoje}
                    onChange={(e) => setDataHoje(e.target.value)}
                    className={isDark ? 'bg-slate-700 border-slate-600 text-slate-50' : ''}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Data Final do Mês</Label>
                  <Input
                    type="date"
                    value={dataFinal}
                    onChange={(e) => setDataFinal(e.target.value)}
                    className={isDark ? 'bg-slate-700 border-slate-600 text-slate-50' : ''}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Fins de Semana</Label>
                  <Input
                    type="number"
                    value={finsDeSemanaEditavel}
                    onChange={(e) => setFinsDeSemanaEditavel(parseInt(e.target.value) || 0)}
                    className={isDark ? 'bg-slate-700 border-slate-600 text-slate-50' : ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Total Livre</Label>
                  <div className="text-xl font-bold text-blue-400 mt-1">{formatCurrency(totalLivre)}</div>
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Por Fim de Semana</Label>
                  <div className="text-xl font-bold text-emerald-400 mt-1">{formatCurrency(livreFDS)}</div>
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Dias Restantes</Label>
                  <div className="text-xl font-bold text-purple-400 mt-1">{diasRestantes}</div>
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Média Diária</Label>
                  <div className="text-xl font-bold text-orange-400 mt-1">{formatCurrency(mediaDiaria)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className={`grid w-full grid-cols-2 ${isDark ? 'bg-slate-800' : ''}`}>
              <TabsTrigger value="mes">Mês Atual</TabsTrigger>
              <TabsTrigger value="comparativo">Comparativo</TabsTrigger>
            </TabsList>

            {/* Tab: Mês Atual */}
            <TabsContent value="mes" className="space-y-6">
              {/* Receitas */}
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH2 }}>
                      <TrendingUp className="w-5 h-5 text-green-400" />
                      Receitas
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Receita</DialogTitle>
                        </DialogHeader>
                        <ReceitaForm onSubmit={handleAddReceita} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mesData.receitas.map((receita) => (
                      <div
                        key={receita.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-base" style={{ color: isDark ? '#f1f5f9' : textColorBody }}>{receita.descricao}</div>
                          <Badge variant="outline" className="text-xs mt-1 font-medium" style={{ color: isDark ? '#f1f5f9' : '#334155' }}>
                            {receita.categoria}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-green-400 text-lg">
                            {formatCurrency(receita.valor)}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Receita</DialogTitle>
                              </DialogHeader>
                              <ReceitaEditForm
                                receita={receita}
                                onSubmit={(field, value) => handleEditReceita(receita.id, field, value)}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReceita(receita.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Despesas */}
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-lg font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH2 }}>
                      <TrendingDown className="w-5 h-5 text-red-400" />
                      Despesas
                    </CardTitle>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-2">
                          <Plus className="w-4 h-4" />
                          Adicionar
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Adicionar Despesa</DialogTitle>
                        </DialogHeader>
                        <DespesaForm onSubmit={handleAddDespesa} />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {mesData.despesas.map((despesa) => (
                      <div
                        key={despesa.id}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          isDark ? 'bg-slate-700 hover:bg-slate-600' : 'bg-gray-100 hover:bg-gray-200'
                        } transition-colors`}
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-base" style={{ color: isDark ? '#f1f5f9' : textColorBody }}>{despesa.descricao}</div>
                          <Badge variant="outline" className="text-xs mt-1 font-medium" style={{ color: isDark ? '#f1f5f9' : '#334155' }}>
                            {despesa.categoria}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-400 text-lg">
                            {formatCurrency(Math.abs(despesa.valor))}
                          </div>
                          <div className="text-xs" style={{ color: textColorSecondary }}>
                            Gastei: {formatCurrency(despesa.gastei)} | Falta: {formatCurrency(despesa.falta)}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Editar Despesa</DialogTitle>
                              </DialogHeader>
                              <DespesaEditForm
                                despesa={despesa}
                                onSubmit={(field, value) => handleEditDespesa(despesa.id, field, value)}
                              />
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDespesa(despesa.id)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab: Comparativo */}
            <TabsContent value="comparativo">
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
                <CardHeader>
                  <CardTitle className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH2 }}>Comparativo de Meses</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={meses.map(m => ({
                        nome: m.nome,
                        receitas: m.total_receitas,
                        despesas: m.total_despesas,
                        sobra: m.sobra
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                      <XAxis stroke={isDark ? '#cbd5e1' : '#6b7280'} angle={-45} textAnchor="end" height={80} />
                      <YAxis stroke={isDark ? '#cbd5e1' : '#6b7280'} />
                      <Legend wrapperStyle={{ color: isDark ? '#cbd5e1' : '#334155' }} />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                          border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                          color: isDark ? '#f1f5f9' : '#111827'
                        }}
                      />
                      <Bar dataKey="receitas" fill={isDark ? '#4ade80' : '#10b981'} />
                      <Bar dataKey="despesas" fill={isDark ? '#f87171' : '#ef4444'} />
                      <Bar dataKey="sobra" fill={isDark ? '#60a5fa' : '#3b82f6'} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

          </Tabs>
        </main>
      </div>
    </ThemeContext.Provider>
  );
}

// Componentes de Formulário
function ReceitaForm({ onSubmit }: { onSubmit: (receita: Omit<Receita, 'id'>) => void }) {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (descricao && categoria && valor) {
      onSubmit({
        descricao,
        categoria,
        valor: parseFloat(valor)
      });
      setDescricao('');
      setCategoria('');
      setValor('');
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Descrição</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {descricao || 'Selecione uma descrição'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Buscar descrição..."
                value={descricao}
                onValueChange={setDescricao}
              />
              <CommandEmpty>Nenhuma descrição encontrada.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {bancoDados.receitas.map((item) => (
                    <CommandItem
                      key={item.descricao}
                      value={item.descricao}
                      onSelect={(value) => {
                        setDescricao(value);
                        setCategoria(item.categoria);
                        setOpen(false);
                      }}
                    >
                      {item.descricao}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label>Categoria</Label>
        <Input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoria"
        />
      </div>
      <div>
        <Label>Valor (R$)</Label>
        <Input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
      </div>
      <Button onClick={handleSubmit} className="w-full">
        Adicionar Receita
      </Button>
    </div>
  );
}

function ReceitaEditForm({
  receita,
  onSubmit
}: {
  receita: Receita;
  onSubmit: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Descrição</Label>
        <Input
          value={receita.descricao}
          onChange={(e) => onSubmit('descricao', e.target.value)}
        />
      </div>
      <div>
        <Label>Categoria</Label>
        <Input
          value={receita.categoria}
          onChange={(e) => onSubmit('categoria', e.target.value)}
        />
      </div>
      <div>
        <Label>Valor (R$)</Label>
        <Input
          type="number"
          value={receita.valor}
          onChange={(e) => onSubmit('valor', parseFloat(e.target.value))}
          step="0.01"
        />
      </div>
    </div>
  );
}

function DespesaForm({ onSubmit }: { onSubmit: (despesa: Omit<Despesa, 'id' | 'falta' | 'historico_gastos'>) => void }) {
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState('');
  const [valor, setValor] = useState('');
  const [gastei, setGastei] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    if (descricao && categoria && valor) {
      onSubmit({
        descricao,
        categoria,
        valor: -parseFloat(valor),
        gastei: parseFloat(gastei) || 0
      });
      setDescricao('');
      setCategoria('');
      setValor('');
      setGastei('');
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Descrição</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start">
              {descricao || 'Selecione uma descrição'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput
                placeholder="Buscar descrição..."
                value={descricao}
                onValueChange={setDescricao}
              />
              <CommandEmpty>Nenhuma descrição encontrada.</CommandEmpty>
              <CommandGroup>
                <CommandList>
                  {bancoDados.despesas.map((item) => (
                    <CommandItem
                      key={item.descricao}
                      value={item.descricao}
                      onSelect={(value) => {
                        setDescricao(value);
                        setCategoria(item.categoria);
                        setOpen(false);
                      }}
                    >
                      {item.descricao}
                    </CommandItem>
                  ))}
                </CommandList>
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <Label>Categoria</Label>
        <Input
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          placeholder="Categoria"
        />
      </div>
      <div>
        <Label>Valor (R$)</Label>
        <Input
          type="number"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
      </div>
      <div>
        <Label>Já Gastei (R$)</Label>
        <Input
          type="number"
          value={gastei}
          onChange={(e) => setGastei(e.target.value)}
          placeholder="0.00"
          step="0.01"
        />
      </div>
      <Button onClick={handleSubmit} className="w-full">
        Adicionar Despesa
      </Button>
    </div>
  );
}

function DespesaEditForm({
  despesa,
  onSubmit
}: {
  despesa: Despesa;
  onSubmit: (field: string, value: unknown) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Descrição</Label>
        <Input
          value={despesa.descricao}
          onChange={(e) => onSubmit('descricao', e.target.value)}
        />
      </div>
      <div>
        <Label>Categoria</Label>
        <Input
          value={despesa.categoria}
          onChange={(e) => onSubmit('categoria', e.target.value)}
        />
      </div>
      <div>
        <Label>Valor (R$)</Label>
        <Input
          type="number"
          value={Math.abs(despesa.valor)}
          onChange={(e) => onSubmit('valor', -parseFloat(e.target.value))}
          step="0.01"
        />
      </div>
      <div>
        <Label>Já Gastei (R$)</Label>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Adicione um valor"
              id="novoGasto"
              step="0.01"
            />
            <Button
              type="button"
              onClick={() => {
                const input = document.getElementById('novoGasto') as HTMLInputElement;
                if (input && input.value) {
                  const valor = parseFloat(input.value);
                  const novoHistorico = [...despesa.historico_gastos, valor];
                  const novoGastei = novoHistorico.reduce((a, b) => a + b, 0);
                  onSubmit('historico_gastos', novoHistorico);
                  onSubmit('gastei', novoGastei);
                  input.value = '';
                }
              }}
            >
              Adicionar
            </Button>
          </div>
          <div className="text-sm font-semibold" style={{ color: '#4ade80' }}>
            Total: {formatCurrency(despesa.gastei)}
          </div>
          {despesa.historico_gastos && despesa.historico_gastos.length > 0 && (
            <div className="space-y-1 max-h-40 overflow-y-auto border border-slate-600 rounded-md p-2">
              {despesa.historico_gastos.map((valor, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-2 rounded hover:bg-slate-600 transition-colors">
                  <span style={{ color: '#cbd5e1' }}>{formatCurrency(valor)}</span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const novoHistorico = despesa.historico_gastos.filter((_, i) => i !== idx);
                      const novoGastei = novoHistorico.reduce((a, b) => a + b, 0);
                      onSubmit('historico_gastos', novoHistorico);
                      onSubmit('gastei', novoGastei);
                    }}
                  >
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
