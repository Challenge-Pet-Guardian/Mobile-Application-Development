import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tarefa } from '../types/models';
import { STORAGE_KEYS } from '../constants/Keys';

export const TaskService = {
    // Helper para obter a chave de progresso das tarefas de hoje
    getProgressoKeyHoje(): string {
        const dataHoje = new Date().toDateString();
        return `${STORAGE_KEYS.PROGRESSO_PREFIX}${dataHoje}`;
    },

    // Helper para realizar JSON.parse seguro com fallback
    safeParse<T>(jsonStr: string | null, fallback: T): T {
        if (!jsonStr) return fallback;
        try {
            return JSON.parse(jsonStr) as T;
        } catch (e) {
            console.warn("Erro ao fazer parse do JSON no TaskService:", e);
            return fallback;
        }
    },

    // Retorna todas as tarefas da Familia (mock das tarefas que viriam da API/Firebase)
    async getTodasAsTarefas(): Promise<Tarefa[]> {
        const tarefasStr = await AsyncStorage.getItem(STORAGE_KEYS.FAMILIA_TAREFAS);
        return this.safeParse<Tarefa[]>(tarefasStr, []);
    },

    // Retorna apenas as tarefas de um dia específico da semana
    async getTarefasDoDia(diaDaSemana: number): Promise<Tarefa[]> {
        const todas = await this.getTodasAsTarefas();
        return todas.filter(t => t.diaDaSemana === diaDaSemana);
    },

    // Adiciona uma nova tarefa à Familia (que aparecerá para todos os membros)
    async adicionarTarefaFamilia(novaTarefa: Omit<Tarefa, 'id' | 'concluida'>): Promise<void> {
        const todas = await this.getTodasAsTarefas();

        // Uso de reduce em vez de spread Math.max para evitar estouro de pilha
        const maxId = todas.reduce((max, t) => (t.id > max ? t.id : max), 0);

        const tarefaCriada: Tarefa = {
            ...novaTarefa,
            id: maxId + 1,
            concluida: false
        };

        // 1. Salva na "lista mãe" da Familia
        const novasTarefas = [...todas, tarefaCriada];
        await AsyncStorage.setItem(STORAGE_KEYS.FAMILIA_TAREFAS, JSON.stringify(novasTarefas));

        // 2. Tenta salvar na cópia de progresso de HOJE (para aparecer no ecrã na hora!)
        const progressoKey = this.getProgressoKeyHoje();
        const progressoSalvo = await AsyncStorage.getItem(progressoKey);

        if (progressoSalvo) {
            const tarefasHoje = this.safeParse<Tarefa[]>(progressoSalvo, []);
            tarefasHoje.push(tarefaCriada);
            await AsyncStorage.setItem(progressoKey, JSON.stringify(tarefasHoje));
        }
    },

    // Marca uma tarefa como concluída/pendente para o dia de HOJE
    async atualizarStatusTarefaHoje(idTarefa: number, concluida: boolean): Promise<Tarefa[]> {
        const progressoKey = this.getProgressoKeyHoje();
        
        const progressoSalvo = await AsyncStorage.getItem(progressoKey);
        let tarefasHoje = this.safeParse<Tarefa[]>(progressoSalvo, []);

        if (tarefasHoje.length === 0) {
            const diaDaSemana = new Date().getDay();
            tarefasHoje = await this.getTarefasDoDia(diaDaSemana);
        }

        const tarefasAtualizadas = tarefasHoje.map((t: Tarefa) => 
            t.id === idTarefa ? { ...t, concluida } : t
        );

        await AsyncStorage.setItem(progressoKey, JSON.stringify(tarefasAtualizadas));
        return tarefasAtualizadas;
    },

    // Busca as tarefas com o status de hoje
    async carregarTarefasHoje(): Promise<Tarefa[]> {
        const progressoKey = this.getProgressoKeyHoje();
        
        const progressoSalvo = await AsyncStorage.getItem(progressoKey);
        if (progressoSalvo) {
            return this.safeParse<Tarefa[]>(progressoSalvo, []);
        }

        const diaDaSemana = new Date().getDay();
        const tarefasIniciaisDoDia = await this.getTarefasDoDia(diaDaSemana);
        
        // Inicializar todas como não concluídas
        const resetadas = tarefasIniciaisDoDia.map(t => ({ ...t, concluida: false }));
        await AsyncStorage.setItem(progressoKey, JSON.stringify(resetadas));
        
        return resetadas;
    }
};