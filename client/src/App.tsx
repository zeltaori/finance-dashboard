import { useState, useRef, useEffect, createContext } from 'react';
import { 
  Wallet, ChevronLeft, ChevronRight, Plus, Pencil, Trash2, 
  Check, X, TrendingUp, TrendingDown, Calendar, DollarSign, Sun, Moon, Download, Upload, Cloud, LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
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
import { nanoid } from 'nanoid';
import { firebaseService, type BackupFile } from './services/firebaseService';
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
  const [meses, setMeses] = useState<MesData[]>(initialMeses);
  const [isLoadingFromFirebase, setIsLoadingFromFirebase] = useState(false);
  const [mesSelecionado, setMesSelecionado] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('mes');
  const [dinheiroEspecie, setDinheiroEspecie] = useState(0);
  const [dataHoje, setDataHoje] = useState(new Date().toISOString().split('T')[0]);
  const [user, setUser] = useState<any>(null);
  const [backups, setBackups] = useState<BackupFile[]>([]);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showNovoMesDialog, setShowNovoMesDialog] = useState(false);
  const [novoMesData, setNovoMesData] = useState<Date | undefined>(() => {
    const hoje = new Date();
    const ultimoDia = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
    return new Date(hoje.getFullYear(), hoje.getMonth(), ultimoDia);
  });
  const [copiarDados, setCopiarDados] = useState(true);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  const scrollRef = useRef<HTMLDivElement>(null);

  const mesData = meses[mesSelecionado];

  // Rastrear mudanças de tamanho da janela
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Salvar no localStorage apenas se usuario estiver logado
  useEffect(() => {
    if (user) {
      localStorage.setItem('gestaoFinanceira_dados', JSON.stringify(meses));
    }
  }, [meses, user]);

  // Backup automático ao fechar
  useEffect(() => {
    const handleBeforeUnload = () => {
      const backupData = { meses, timestamp: new Date().toISOString(), versao: '1.0' };
      localStorage.setItem('gestaoFinanceira_backup_auto', JSON.stringify(backupData));
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [meses]);

  // Monitorar autenticação Firebase
  useEffect(() => {
    const unsubscribe = firebaseService.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        console.log("Usuario autenticado:", currentUser.uid);
        setIsLoadingFromFirebase(true);
        loadBackups();
        // Aumentar delay para garantir que o Firebase esteja pronto
        setTimeout(async () => {
          console.log("Chamando loadUserData com delay de 1 segundo...");
          await loadUserData();
          console.log("loadUserData concluido!");
          setIsLoadingFromFirebase(false);
        }, 1000);
      } else {
        // Usuario nao esta logado - usar base simplificada
        console.log("Usuario nao autenticado, usando base simplificada");
        setMeses(initialMeses);
        setIsLoadingFromFirebase(false);
      }
    });
    return unsubscribe;
  }, []);

  // Fazer backup automático quando dados mudam (imediatamente + a cada 30 segundos como fallback)
  useEffect(() => {
    if (!user) return;
    
    // Salvar imediatamente quando dados mudam
    const saveToFirebase = async () => {
      try {
        console.log('Salvando dados no Firebase...');
        await firebaseService.backup({ meses, timestamp: new Date().toISOString(), versao: '1.0' });
        console.log('Dados salvos no Firebase com sucesso');
      } catch (error) {
        console.error('Erro ao salvar dados no Firebase:', error);
      }
    };
    
    saveToFirebase();
    
    // Também fazer backup a cada 30 segundos como fallback
    const interval = setInterval(saveToFirebase, 30000);

    return () => clearInterval(interval);
  }, [user, meses]);

  const loadBackups = async () => {
    try {
      const backupsList = await firebaseService.listBackups();
      setBackups(backupsList);
    } catch (error) {
      console.error('Erro ao carregar backups:', error);
    }
  };

  const loadUserData = async () => {
    try {
      console.log('Iniciando loadUserData...');
      const backupsList = await firebaseService.listBackups();
      console.log('Backups carregados:', backupsList.length);
      if (backupsList.length > 0) {
        const latestBackup = backupsList[0];
        console.log('Ultimo backup:', latestBackup);
        const userData = latestBackup.data as any;
        console.log('Dados do usuario:', userData);
        if (userData && userData.meses && userData.meses.length > 0) {
          console.log('Carregando meses do Firebase:', userData.meses.length);
          setMeses(userData.meses);
        } else {
          console.log('Nenhum dado de meses encontrado no backup, usando base simplificada');
          setMeses(initialMeses);
        }
      } else {
        console.log('Nenhum backup encontrado para este usuario, usando base simplificada');
        setMeses(initialMeses);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuario:', error);
      // Em caso de erro, manter base simplificada
    }
  };

  const handleLoginGoogle = async () => {
    try {
      await firebaseService.loginWithGoogle();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await firebaseService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleRestoreBackup = async (backupId: string) => {
    try {
      const restoredData = await firebaseService.restoreBackup(backupId);
      if (restoredData && (restoredData as any).meses) {
        setMeses((restoredData as any).meses);
        alert('Backup restaurado com sucesso!');
        setShowBackupDialog(false);
      }
    } catch (error) {
      console.error('Erro ao restaurar backup:', error);
      alert('Erro ao restaurar backup');
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    try {
      await firebaseService.deleteBackup(backupId);
      await loadBackups();
    } catch (error) {
      console.error('Erro ao deletar backup:', error);
    }
  };

  const handleDownloadLastBackup = async () => {
    try {
      const backupsList = await firebaseService.listBackups();
      if (backupsList.length === 0) {
        alert('Nenhum backup encontrado');
        return;
      }
      const lastBackup = backupsList[0];
      const restoredData = await firebaseService.restoreBackup(lastBackup.id);
      if (restoredData) {
        const dataStr = JSON.stringify(restoredData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Erro ao baixar backup:', error);
      alert('Erro ao baixar backup');
    }
  };

  const handleBackupToFirebase = async () => {
    try {
      const backupName = `Backup ${new Date().toLocaleString('pt-BR')}`;
      await firebaseService.backup({ meses, timestamp: new Date().toISOString(), versao: '1.0' }, backupName);
      alert('Backup salvo com sucesso no Firebase!');
    } catch (error) {
      console.error('Erro ao fazer backup:', error);
      alert('Erro ao fazer backup: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    }
  };

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
    const dataFinalMes = mesData?.dataFinal || '2026-02-28';
    const final = new Date(dataFinalMes);
    const diffTime = final.getTime() - hoje.getTime();
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  };

  const diasRestantes = calcularDiasRestantes();
  const sobra = calcularSobra();
  const saldoVR = calcularSaldoVR();
  const totalLivre = sobra + dinheiroEspecie;
  const finsDeSemana = mesData?.finsDeSemana || 4;
  const livreFDS = finsDeSemana > 0 ? totalLivre / finsDeSemana : 0;
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
      } else if (field === 'historico_gastos') {
        // Atualizar historico_gastos e recalcular gastei
        despesa.historico_gastos = value as number[];
        despesa.gastei = (value as number[]).reduce((a, b) => a + b, 0);
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
          <div className="max-w-7xl mx-auto px-4 py-3 md:py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-2 md:gap-0">
            <div className="flex items-center gap-2 md:gap-3">
              <Wallet className="w-6 md:w-8 h-6 md:h-8 text-blue-400" />
              <h1 className="text-xl md:text-3xl font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH1 }}>Gestão Financeira</h1>
            </div>
            <div className="flex items-center gap-1 md:gap-4 flex-wrap justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </Button>
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadLastBackup}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Backup
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleLoginGoogle}
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Cloud className="w-4 h-4" />
                  Login Google
                </Button>
              )}
              {user && (
                <Button
                  onClick={handleBackupToFirebase}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Cloud className="w-4 h-4" />
                  Backup
                </Button>
              )}
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
                  <div className="space-y-4">
                    <p style={{ color: isDark ? '#cbd5e1' : '#64748b' }}>Baixe todos os seus dados financeiros em formato JSON para backup local:</p>
                    <Button onClick={handleDownloadJSON} className="w-full bg-blue-600 hover:bg-blue-700">
                      <Download className="w-4 h-4 mr-2" />
                      Baixar como JSON
                    </Button>
                  </div>
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
                  <div className="space-y-4">
                    <p style={{ color: isDark ? '#cbd5e1' : '#64748b' }}>Selecione um arquivo JSON para restaurar seus dados:</p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleUploadJSON}
                      className="w-full p-2 rounded border"
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#f1f5f9',
                        borderColor: isDark ? '#475569' : '#cbd5e1',
                        color: isDark ? '#e2e8f0' : '#1e293b'
                      }}
                    />
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-3 md:px-4 py-6 md:py-8">
          {/* Seleção de Mês */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 gap-2 md:gap-0">
              <h2 className="text-xl md:text-2xl font-bold tracking-tight" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH2 }}>Selecione o Mês</h2>
              <div className="flex gap-1 md:gap-2 w-full md:w-auto">
                <Dialog open={showNovoMesDialog} onOpenChange={setShowNovoMesDialog}>
                  <Button
                    onClick={() => setShowNovoMesDialog(true)}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    + Novo Mês
                  </Button>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Mês</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <Label className="mb-2 block">Mês:</Label>
                          <select
                            value={novoMesData ? novoMesData.getMonth() : new Date().getMonth()}
                            onChange={(e) => {
                              const mes = parseInt(e.target.value);
                              const ano = novoMesData ? novoMesData.getFullYear() : new Date().getFullYear();
                              const ultimoDia = new Date(ano, mes + 1, 0).getDate();
                              setNovoMesData(new Date(ano, mes, ultimoDia));
                            }}
                            className="w-full p-2 border rounded-md bg-background text-foreground"
                          >
                            {Array.from({ length: 12 }, (_, i) => {
                              const data = new Date(2026, i, 1);
                              const nomeMes = data.toLocaleString('pt-BR', { month: 'long' });
                              return (
                                <option key={i} value={i}>
                                  {nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                        <div>
                          <Label className="mb-2 block">Ano:</Label>
                          <select
                            value={novoMesData ? novoMesData.getFullYear() : new Date().getFullYear()}
                            onChange={(e) => {
                              const ano = parseInt(e.target.value);
                              const mes = novoMesData ? novoMesData.getMonth() : new Date().getMonth();
                              const ultimoDia = new Date(ano, mes + 1, 0).getDate();
                              setNovoMesData(new Date(ano, mes, ultimoDia));
                            }}
                            className="w-full p-2 border rounded-md bg-background text-foreground"
                          >
                            {Array.from({ length: 10 }, (_, i) => {
                              const ano = 2020 + i;
                              return (
                                <option key={ano} value={ano}>
                                  {ano}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="copiarDados"
                          checked={copiarDados}
                          onChange={(e) => setCopiarDados(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="copiarDados" className="cursor-pointer">
                          Copiar receitas e despesas do mês anterior
                        </Label>
                      </div>
                      <Button
                        onClick={() => {
                          if (!novoMesData) {
                            alert('Selecione uma data');
                            return;
                          }
                          const ultimoMes = meses[meses.length - 1];
                          const nomeMes = novoMesData.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase());
                          let receitas: Receita[] = [];
                          let despesas: Despesa[] = [];
                          if (copiarDados) {
                            receitas = ultimoMes.receitas.map(r => ({ ...r, id: nanoid() }));
                            despesas = ultimoMes.despesas.map(d => {
                              if (d.descricao === 'Outras') {
                                return { ...d, id: nanoid(), valor: 0, gastei: 0, historico_gastos: [] };
                              }
                              return { ...d, id: nanoid(), historico_gastos: [] };
                            });

                          }
                          const total_receitas = receitas.reduce((sum, r) => sum + r.valor, 0);
                          const total_despesas = despesas.reduce((sum, d) => sum + Math.abs(d.valor), 0);
                          const sobra = total_receitas - total_despesas;
                          const novoMes: MesData = {
                            nome: nomeMes,
                            receitas,
                            despesas,
                            total_receitas,
                            total_despesas,
                            sobra,
                            dataFinal: novoMesData.toISOString().split('T')[0],
                            finsDeSemana: ultimoMes.finsDeSemana
                          };
                          setMeses([...meses, novoMes]);
                          setMesSelecionado(meses.length);
                          setShowNovoMesDialog(false);
                          setNovoMesData(undefined);
                          setCopiarDados(true);
                        }}
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                      >
                        Criar Mês
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
              className="flex gap-2 md:gap-3 overflow-x-auto pb-3 md:pb-4 scroll-smooth"
              style={{ scrollBehavior: 'smooth' }}
            >
              {meses.map((mes, index) => (
                <div key={index} className="flex flex-col md:flex-row items-center gap-1 md:gap-2 flex-shrink-0">
                  <button
                    onClick={() => setMesSelecionado(index)}
                    className={`px-3 md:px-4 py-2 rounded-lg font-semibold transition-colors text-xs md:text-base min-w-max ${
                      mesSelecionado === index
                        ? 'bg-blue-500 text-white shadow-lg'
                        : isDark
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-100'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {mes.nome}
                  </button>
                  {meses.length > 1 && mesSelecionado === index && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        const novosMeses = meses.filter((_, i) => i !== index);
                        setMeses(novosMeses);
                        if (mesSelecionado >= novosMeses.length) {
                          setMesSelecionado(Math.max(0, novosMeses.length - 1));
                        }
                      }}
                      className={`p-2 md:p-1 flex-shrink-0 ${
                        isDark
                          ? 'text-red-400 hover:text-red-300 hover:bg-red-950'
                          : 'text-red-500 hover:text-red-700 hover:bg-red-100'
                      }`}
                      title="Deletar mes"
                    >
                      <Trash2 className="w-5 h-5 md:w-4 md:h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Resumo do Mês */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6 md:mb-8">
            <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-semibold" style={{ color: textColorLabel }}>Total de Receitas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-green-500">
                  {formatCurrency(mesData.total_receitas)}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-semibold" style={{ color: textColorLabel }}>Total de Despesas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-red-500">
                  {formatCurrency(mesData.total_despesas)}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-semibold" style={{ color: textColorLabel }}>Sobra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-lg md:text-2xl font-bold ${sobra >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(sobra)}
                </div>
              </CardContent>
            </Card>

            <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
              <CardHeader className="pb-2 md:pb-3">
                <CardTitle className="text-xs md:text-sm font-semibold" style={{ color: textColorLabel }}>Saldo VR</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg md:text-2xl font-bold text-blue-500">
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
                    value={mesData?.dataFinal || '2026-02-28'}
                    onChange={(e) => {
                      const novosMeses = [...meses];
                      novosMeses[mesSelecionado] = {
                        ...novosMeses[mesSelecionado],
                        dataFinal: e.target.value
                      };
                      setMeses(novosMeses);
                    }}
                    className={isDark ? 'bg-slate-700 border-slate-600 text-slate-50' : ''}
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold" style={{ color: textColorLabel }}>Fins de Semana</Label>
                  <Input
                    type="number"
                    value={mesData?.finsDeSemana || 4}
                    onChange={(e) => {
                      const novosMeses = [...meses];
                      novosMeses[mesSelecionado] = {
                        ...novosMeses[mesSelecionado],
                        finsDeSemana: parseInt(e.target.value) || 0
                      };
                      setMeses(novosMeses);
                    }}
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6 md:mb-8">
            <TabsList className={`grid w-full grid-cols-2 gap-1 md:gap-2 p-1 ${isDark ? 'bg-slate-800' : ''}`}>
              <TabsTrigger value="mes" className="text-xs md:text-sm py-2 md:py-3 px-2 md:px-4 whitespace-nowrap">Mês Atual</TabsTrigger>
              <TabsTrigger value="comparativo" className="text-xs md:text-sm py-2 md:py-3 px-2 md:px-4 whitespace-nowrap">Comparativo</TabsTrigger>
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
            <TabsContent value="comparativo" className="w-full">
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : ''}>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif', color: textColorH2 }}>Comparativo de Meses</CardTitle>
                </CardHeader>
                <CardContent className="w-full overflow-x-auto p-2 md:p-4">
                  <div style={{ width: '100%', height: windowWidth < 640 ? '280px' : '400px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={meses.map(m => {
                          let mesRef = '01/26';
                          if (m.dataFinal) {
                            const [ano, mes] = m.dataFinal.split('-');
                            mesRef = `${mes}/${ano.slice(-2)}`;
                          } else {
                            const mesesMap: Record<string, string> = { 'Janeiro': '01', 'Fevereiro': '02', 'Março': '03', 'Abril': '04', 'Maio': '05', 'Junho': '06', 'Julho': '07', 'Agosto': '08', 'Setembro': '09', 'Outubro': '10', 'Novembro': '11', 'Dezembro': '12' };
                            const mesAno = m.nome.split(' ');
                            const mesNum = mesesMap[mesAno[0]] || '01';
                            const ano = mesAno[1].slice(-2);
                            mesRef = `${mesNum}/${ano}`;
                          }
                          return {
                            nome: mesRef,
                            receitas: m.total_receitas,
                            despesas: m.total_despesas,
                            sobra: m.sobra
                          };
                        })
                      }
                      margin={windowWidth < 640 ? { top: 5, right: 10, left: -20, bottom: 50 } : { top: 5, right: 30, left: 0, bottom: 80 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e5e7eb'} />
                        <XAxis 
                          dataKey="nome" 
                          stroke={isDark ? '#cbd5e1' : '#6b7280'} 
                          angle={windowWidth < 640 ? -45 : -45} 
                          textAnchor="end" 
                          height={windowWidth < 640 ? 60 : 80}
                          tick={{ fontSize: windowWidth < 640 ? 10 : 12 }}
                        />
                        <YAxis 
                          stroke={isDark ? '#cbd5e1' : '#6b7280'}
                          tick={{ fontSize: windowWidth < 640 ? 10 : 12 }}
                        />
                        <Legend 
                          wrapperStyle={{ color: isDark ? '#cbd5e1' : '#334155', fontSize: windowWidth < 640 ? '11px' : '12px' }}
                          verticalAlign={windowWidth < 640 ? 'bottom' : 'bottom'}
                          height={windowWidth < 640 ? 20 : 30}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#0f172a' : '#f9fafb',
                            border: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                            color: isDark ? '#f1f5f9' : '#111827',
                            fontSize: windowWidth < 640 ? '11px' : '12px'
                          }}
                        />
                        <Bar dataKey="receitas" fill={isDark ? '#4ade80' : '#10b981'} />
                        <Bar dataKey="despesas" fill={isDark ? '#f87171' : '#ef4444'} />
                        <Bar dataKey="sobra" fill={isDark ? '#60a5fa' : '#3b82f6'} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
