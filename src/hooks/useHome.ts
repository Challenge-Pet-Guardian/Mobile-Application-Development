import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { STORAGE_KEYS } from '../constants/Keys';
import { TaskService } from '../services/TaskService';
import { Pet, Tarefa, DiaOfensiva } from '../types/models';

export function useHome() {
    const [loading, setLoading] = useState(true);
    const [temFamilia, setTemFamilia] = useState(false);
    
    const [xpTotal, setXpTotal] = useState(0);
    const [ofensivaTotal, setOfensivaTotal] = useState(0); 
    const [householdName, setHouseholdName] = useState('Minha Família'); 
    const [petsDaFamilia, setPetsDaFamilia] = useState<Pet[]>([]);

    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
    const [diasOfensiva, setDiasOfensiva] = useState<DiaOfensiva[]>([]);

    const carregarDadosFuncionais = async () => {
        try {
            setLoading(true);

            const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            let meuNome = '';
            if (userDataString) meuNome = JSON.parse(userDataString).nome.trim();

            const cuidadoresString = await AsyncStorage.getItem(STORAGE_KEYS.CUIDADORES);
            let usuarioEstaNaLista = false;
            if (cuidadoresString && meuNome) {
                const lista = JSON.parse(cuidadoresString);
                usuarioEstaNaLista = lista.some((c: any) => c.nome.replace(' (Você)', '').trim() === meuNome);
            }

            let FamiliaAtiva = await AsyncStorage.getItem(STORAGE_KEYS.FAMILIA_ATIVA);
            
            if (usuarioEstaNaLista && FamiliaAtiva !== 'sim') {
                await AsyncStorage.setItem(STORAGE_KEYS.FAMILIA_ATIVA, 'sim');
                FamiliaAtiva = 'sim';
            } else if (!usuarioEstaNaLista && FamiliaAtiva === 'sim') {
                await AsyncStorage.setItem(STORAGE_KEYS.FAMILIA_ATIVA, 'nao');
                FamiliaAtiva = 'nao';
            }

            if (FamiliaAtiva !== 'sim') {
                setTemFamilia(false);
                setLoading(false);
                return;
            }
            
            setTemFamilia(true);

            const nomeCasaSalvo = await AsyncStorage.getItem(STORAGE_KEYS.NOME_FAMILIA);
            if (nomeCasaSalvo) setHouseholdName(nomeCasaSalvo);

            const FamiliaStr = await AsyncStorage.getItem(STORAGE_KEYS.LISTA_PETS);
            let FamiliaArray: Pet[] = [];
            if (FamiliaStr) FamiliaArray = JSON.parse(FamiliaStr);
            setPetsDaFamilia(FamiliaArray);

            const pontosSalvos = await AsyncStorage.getItem(STORAGE_KEYS.PONTOS_XP);
            if (pontosSalvos) setXpTotal(Number(pontosSalvos));

            const ofensivaSalva = await AsyncStorage.getItem(STORAGE_KEYS.OFENSIVA_DIAS);
            if (ofensivaSalva) setOfensivaTotal(Number(ofensivaSalva));

            const tarefasDoDia = await TaskService.carregarTarefasHoje();
            setTarefas(tarefasDoDia);

            await gerarDiasDaSemana();

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const atualizarOfensivaReal = useCallback(async () => {
        try {
            const hoje = new Date().toDateString();
            const ultimaDataOfensiva = await AsyncStorage.getItem(STORAGE_KEYS.DATA_ULTIMA_OFENSIVA);
            const ofensivaAtualStr = await AsyncStorage.getItem(STORAGE_KEYS.OFENSIVA_DIAS);
            let ofensivaAtual = ofensivaAtualStr ? Number(ofensivaAtualStr) : 0;

            if (ultimaDataOfensiva === hoje) return; 

            const ontem = new Date();
            ontem.setDate(ontem.getDate() - 1);
            const ontemStr = ontem.toDateString();

            if (ultimaDataOfensiva === ontemStr) {
                ofensivaAtual += 1;
            } else {
                ofensivaAtual = 1; 
            }

            await AsyncStorage.setItem(STORAGE_KEYS.OFENSIVA_DIAS, String(ofensivaAtual));
            await AsyncStorage.setItem(STORAGE_KEYS.DATA_ULTIMA_OFENSIVA, hoje);
            setOfensivaTotal(ofensivaAtual);
        } catch (e) { console.log(e); }
    }, []);

    const registrarXPIndividual = useCallback(async (pontos: number) => {
        try {
            const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            if (!userDataString) return;
            const userData = JSON.parse(userDataString);
            const meuNome = userData.nome.trim();

            const cuidadoresString = await AsyncStorage.getItem(STORAGE_KEYS.CUIDADORES);
            if (cuidadoresString) {
                let listaCuidadores = JSON.parse(cuidadoresString);
                listaCuidadores = listaCuidadores.map((c: any) => {
                    const nomeNaLista = c.nome.replace(' (Você)', '').trim();
                    if (nomeNaLista === meuNome) return { ...c, xp: (c.xp || 0) + pontos };
                    return c;
                });
                await AsyncStorage.setItem(STORAGE_KEYS.CUIDADORES, JSON.stringify(listaCuidadores));
            }
        } catch (e) { console.log(e); }
    }, []);

    const gerarDiasDaSemana = useCallback(async () => {
        const hoje = new Date();
        const diaDaSemanaAtual = hoje.getDay(); 
        const distanciaParaSegunda = diaDaSemanaAtual === 0 ? 6 : diaDaSemanaAtual - 1;
        const segunda = new Date(hoje);
        segunda.setDate(hoje.getDate() - distanciaParaSegunda);

        const letras = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
        const dias: DiaOfensiva[] = [];

        let todasAsTarefas: Tarefa[] = [];
        try {
            const tarefasStr = await AsyncStorage.getItem(STORAGE_KEYS.FAMILIA_TAREFAS);
            if (tarefasStr) todasAsTarefas = JSON.parse(tarefasStr);
        } catch (e) {
            console.log(e);
        }

        for (let i = 0; i < 7; i++) {
            const dataAtual = new Date(segunda);
            dataAtual.setDate(segunda.getDate() + i);
            const numeroDia = dataAtual.getDate().toString().padStart(2, '0');
            const dataSemHora = new Date(dataAtual.toDateString());
            const hojeSemHora = new Date(hoje.toDateString());

            let status: DiaOfensiva['status'] = 'futuro';

            if (dataSemHora.getTime() === hojeSemHora.getTime()) {
                status = 'hoje';
            } else if (dataSemHora < hojeSemHora) {
                const dateStr = dataAtual.toDateString();
                const progressoKey = `${STORAGE_KEYS.PROGRESSO_PREFIX}${dateStr}`;
                
                try {
                    const progressoSalvo = await AsyncStorage.getItem(progressoKey);
                    
                    if (progressoSalvo) {
                        const tarefasDoDia = JSON.parse(progressoSalvo) as Tarefa[];
                        if (tarefasDoDia.length === 0) {
                            status = 'futuro';
                        } else {
                              const todasConcluidas = tarefasDoDia.every(t => t.concluida);
                              status = todasConcluidas ? 'feito' : 'perdido';
                        }
                    } else {
                        const diaDaSemana = dataAtual.getDay();
                        const temTarefasAgendadas = todasAsTarefas.some(t => t.diaDaSemana === diaDaSemana);
                        
                        if (temTarefasAgendadas) {
                            status = 'perdido';
                        } else {
                            status = 'futuro';
                        }
                    }
                } catch (e) {
                    status = 'futuro';
                }
            }

            dias.push({ id: i, dayLabel: letras[i], dayNumber: numeroDia, status: status });
        }
        setDiasOfensiva(dias);
    }, []);

    const handleCriarTarefa = useCallback(async (titulo: string, descricao: string) => {
        const novaTarefaParaService = {
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            xp: 15,
            diaDaSemana: new Date().getDay(),
            petId: petsDaFamilia[0]?.id || "0" 
        };

        await TaskService.adicionarTarefaFamilia(novaTarefaParaService);
        const tarefasAtualizadas = await TaskService.carregarTarefasHoje();
        setTarefas(tarefasAtualizadas);
    }, [petsDaFamilia]);

    const alternarTarefaStatus = useCallback(async (id: number) => {
        const tarefaClicada = tarefas.find(t => t.id === id);
        if (!tarefaClicada) return;

        const isConcluindo = !tarefaClicada.concluida; 
        
        const novasTarefas = await TaskService.atualizarStatusTarefaHoje(id, isConcluindo);
        setTarefas(novasTarefas);

        const mudancaXP = isConcluindo ? tarefaClicada.xp : -tarefaClicada.xp;
        const novoXP = xpTotal + mudancaXP;
        setXpTotal(novoXP);

        await AsyncStorage.setItem(STORAGE_KEYS.PONTOS_XP, String(novoXP));

        if (isConcluindo) atualizarOfensivaReal(); 
        await registrarXPIndividual(mudancaXP);
    }, [tarefas, xpTotal, atualizarOfensivaReal, registrarXPIndividual]);

    useFocusEffect(
        useCallback(() => {
            carregarDadosFuncionais();
        }, [])
    );

    const proximaTarefaPendente = tarefas.find(t => !t.concluida) || null;

    return {
        loading,
        temFamilia,
        xpTotal,
        ofensivaTotal,
        householdName,
        petsDaFamilia,
        tarefas,
        diasOfensiva,
        handleCriarTarefa,
        alternarTarefaStatus,
        proximaTarefaPendente,
    };
}
