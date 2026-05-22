// ===== Modelos do Pet =====
export interface Pet {
    id?: string;
    nome: string;
    breed?: string;
    age?: string;
    avatarId?: string;
    uri?: string;
    peso?: string;
    ultimaVacina?: string;
    ultimaConsulta?: string;
    vacina?: string;
    dataVacina?: string;
    raca?: string;
    idade?: string;
    sexo?: string;
    castrado?: string;
    veterinario?: string;
    alergias?: string;
    medicamentos?: string;
}

// ===== Modelos de Tarefas =====
export interface Tarefa {
    id: number;
    titulo: string;
    horario: string;
    concluida: boolean;
    xp: number;
    diaDaSemana?: number; // 0 (Domingo) a 6 (Sábado)
    criadoPor?: string;
}

// ===== Modelos de Ofensiva =====
export interface DiaOfensiva {
    id: number;
    dayLabel: string;
    dayNumber: string;
    status: 'feito' | 'perdido' | 'hoje' | 'futuro';
}

// ===== Modelos da Familia =====
export interface Cuidador {
    id: string;
    nome: string;
    funcao: string;
    xp?: number;
}

export interface Recado {
    id: string;
    texto: string;
    hora: string;
    autor: string;
}
