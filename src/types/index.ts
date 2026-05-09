// Tipos para Componentes
export type HeaderProps = {
    title?: string;
};

// Tipos para a Ofensiva (Streak)
export interface StreakDay {
    id: number;
    dayLabel: string;
    dayNumber: string;
    status: 'feito' | 'perdido' | 'hoje' | 'futuro';
}

export interface StreakCardProps {
    streakDays: StreakDay[];
}