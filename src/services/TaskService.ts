import AsyncStorage from '@react-native-async-storage/async-storage';
import { Tarefa } from '../types/models';
import { STORAGE_KEYS } from '../constants/Keys';

export const TaskService = {
    /** Retorna todas as tarefas da matilha (mock das tarefas que viriam da API/Firebase) */
    async getTodasAsTarefas(): Promise<Tarefa[]> {
        const tarefasStr = await AsyncStorage.getItem(STORAGE_KEYS.MATILHA_TAREFAS);
        if (!tarefasStr) {
            return [];
        }
        return JSON.parse(tarefasStr);
    },

    /** Retorna apenas as tarefas de um dia específico da semana */
    async getTarefasDoDia(diaDaSemana: number): Promise<Tarefa[]> {
        const todas = await this.getTodasAsTarefas();
        return todas.filter(t => t.diaDaSemana === diaDaSemana);
    },

    /** Adiciona uma nova tarefa à matilha (que aparecerá para todos os membros) */
    async adicionarTarefaMatilha(novaTarefa: Omit<Tarefa, 'id' | 'concluida'>): Promise<void> {
        const todas = await this.getTodasAsTarefas();
        const maxId = todas.length > 0 ? Math.max(...todas.map(t => t.id)) : 0;
        
        const tarefaCriada: Tarefa = {
            ...novaTarefa,
            id: maxId + 1,
            concluida: false
        };

        // 1. Salva na "lista mãe" da Matilha
        const novasTarefas = [...todas, tarefaCriada];
        await AsyncStorage.setItem(STORAGE_KEYS.MATILHA_TAREFAS, JSON.stringify(novasTarefas));

        // 2. Tenta salvar na cópia de progresso de HOJE (para aparecer no ecrã na hora!)
        const dataHoje = new Date().toDateString();
        const progressoKey = `${STORAGE_KEYS.PROGRESSO_PREFIX}${dataHoje}`;
        const progressoSalvo = await AsyncStorage.getItem(progressoKey);

        if (progressoSalvo) {
            const tarefasHoje = JSON.parse(progressoSalvo);
            // Adiciona a tarefa nova no final da lista de hoje
            tarefasHoje.push(tarefaCriada);
            await AsyncStorage.setItem(progressoKey, JSON.stringify(tarefasHoje));
        }
    },

    /** Marca uma tarefa como concluída/pendente para o dia de HOJE */
    async atualizarStatusTarefaHoje(idTarefa: number, concluida: boolean): Promise<Tarefa[]> {
        // Como o app faz reset diariamente às tarefas feitas, guardamos o progresso do dia atual
        const dataHoje = new Date().toDateString();
        const progressoKey = `${STORAGE_KEYS.PROGRESSO_PREFIX}${dataHoje}`;
        
        let progressoSalvo = await AsyncStorage.getItem(progressoKey);
        let tarefasHoje = progressoSalvo ? JSON.parse(progressoSalvo) : [];

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

    /** Busca as tarefas com o status de hoje */
    async carregarTarefasHoje(): Promise<Tarefa[]> {
        const dataHoje = new Date().toDateString();
        const progressoKey = `${STORAGE_KEYS.PROGRESSO_PREFIX}${dataHoje}`;
        
        const progressoSalvo = await AsyncStorage.getItem(progressoKey);
        if (progressoSalvo) {
            return JSON.parse(progressoSalvo);
        }

        const diaDaSemana = new Date().getDay();
        const tarefasIniciaisDoDia = await this.getTarefasDoDia(diaDaSemana);
        
        // Inicializar todas como não concluídas
        const resetadas = tarefasIniciaisDoDia.map(t => ({...t, concluida: false}));
        await AsyncStorage.setItem(progressoKey, JSON.stringify(resetadas));
        
        return resetadas;
    }
};