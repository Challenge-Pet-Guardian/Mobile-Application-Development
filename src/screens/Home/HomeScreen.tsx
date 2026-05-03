import React, { useState, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, FlatList, Image, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Entypo, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { Header } from "../../components/Header";
import { StreakCard } from "../../components/streakCard";

// Interface das Tarefas
interface Tarefa {
    id: number;
    titulo: string;
    horario: string;
    concluida: boolean;
    xp: number;
}

// Interface para o Streak de Dias (Atualizada)
interface StreakDay {
    id: number;
    dayLabel: string; // S, T, Q...
    dayNumber: string; // 01, 15, 22...
    status: 'feito' | 'perdido' | 'hoje' | 'futuro';
}

export default function Home() {
    const [tarefas, setTarefas] = useState<Tarefa[]>([
        { id: 1, titulo: "Remédio: Vermífugo", horario: "15:30", concluida: false, xp: 50 },
        { id: 2, titulo: "Passeio Longo", horario: "18:00", concluida: false, xp: 20 },
        { id: 3, titulo: "Jantar", horario: "19:30", concluida: false, xp: 10 },
    ]);

    const [streakDays, setStreakDays] = useState<StreakDay[]>([]);

    // Função para gerar a semana dinamicamente com base na data do sistema
    useEffect(() => {
        const gerarDiasDaSemana = () => {
            const hoje = new Date();
            const diaDaSemanaAtual = hoje.getDay(); // 0 = Domingo, 1 = Segunda...

            // Ajuste para a semana começar na Segunda-feira (0 = Dom vira 6, etc)
            const distanciaParaSegunda = diaDaSemanaAtual === 0 ? 6 : diaDaSemanaAtual - 1;

            const segunda = new Date(hoje);
            segunda.setDate(hoje.getDate() - distanciaParaSegunda);

            const letras = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
            const dias: StreakDay[] = [];

            for (let i = 0; i < 7; i++) {
                const dataAtual = new Date(segunda);
                dataAtual.setDate(segunda.getDate() + i);

                const numeroDia = dataAtual.getDate().toString().padStart(2, '0');

                let status: StreakDay['status'] = 'futuro';

                // Zerando as horas para comparar exatamente as datas
                const dataSemHora = new Date(dataAtual.toDateString());
                const hojeSemHora = new Date(hoje.toDateString());

                if (dataSemHora.getTime() === hojeSemHora.getTime()) {
                    status = 'hoje';
                } else if (dataSemHora < hojeSemHora) {
                    // Simulação: Vamos dizer que ele perdeu a terça-feira (index 1), mas fez o resto.
                    // No futuro, isso virá do seu banco de dados (AsyncStorage/API).
                    status = i === 1 ? 'perdido' : 'feito';
                }

                dias.push({
                    id: i,
                    dayLabel: letras[i],
                    dayNumber: numeroDia,
                    status: status
                });
            }
            setStreakDays(dias);
        };

        gerarDiasDaSemana();
    }, []);

    const toggleTarefa = (id: number) => {
        setTarefas(tarefas.map(t =>
            t.id === id ? { ...t, concluida: !t.concluida } : t
        ));
    };



    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'bottom', 'right']}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                <Header title="Home" />

                {/* 1. PET PROFILE */}
                <View style={styles.petProfileContainer}>
                    <View style={styles.avatarBorder}>
                        <Image
                            source={{ uri: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&q=80' }}
                            style={styles.avatarImage}
                        />
                    </View>
                    <View style={styles.petInfoContainer}>
                        <Text style={styles.petName}>Carlos</Text>
                        <Text style={styles.petStatus}>Bulldog Francês - 3 anos</Text>
                    </View>
                </View>

                {/* 2. WEEKLY STREAK DINÂMICO */}
                <StreakCard streakDays={streakDays} />

                {/* 3. STATUS & NEXT TASK */}
                <View style={styles.highlightCard}>
                    <View style={styles.highlightHeader}>
                        <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#FFF" />
                        <Text style={styles.highlightLabel}>Próxima Tarefa</Text>
                    </View>
                    <Text style={styles.highlightTitle}>Vermífugo do Carlos</Text>
                    <Text style={styles.highlightTime}>Hoje às 15:30</Text>
                    <TouchableOpacity style={styles.primaryButton}>
                        <Text style={styles.primaryButtonText}>Marcar como Feito (+50 XP)</Text>
                    </TouchableOpacity>
                </View>

                {/* 4. TASK LIST */}
                <View style={styles.tasksContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Tarefas de Hoje</Text>
                        <Text style={styles.progressText}>
                            {tarefas.filter(t => t.concluida).length}/{tarefas.length}
                        </Text>
                    </View>

                    {tarefas.map((tarefa) => (
                        <TouchableOpacity
                            key={tarefa.id}
                            style={[styles.taskRow, tarefa.concluida && styles.taskRowDone]}
                            onPress={() => toggleTarefa(tarefa.id)}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.radioCircle, tarefa.concluida && styles.radioCircleDone]}>
                                {tarefa.concluida && <Entypo name="check" size={16} color="#FFF" />}
                            </View>
                            <View style={styles.taskInfo}>
                                <Text style={[styles.taskText, tarefa.concluida && styles.taskTextDone]}>
                                    {tarefa.titulo}
                                </Text>
                                <Text style={styles.taskTime}>{tarefa.horario}</Text>
                            </View>
                            <Text style={styles.xpText}>+{tarefa.xp} XP</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* 5. GAMIFIED TIP */}
                <View style={styles.tipCard}>
                    <View style={styles.tipIconContainer}>
                        <FontAwesome5 name="lightbulb" size={20} color="#FFC800" />
                    </View>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Dica do Dia</Text>
                        <Text style={styles.tipText}>Manter as vacinas em dia previne 90% das doenças comuns. O retorno está próximo!</Text>
                    </View>
                </View>

                {/* 6. HEALTH SUMMARY */}
                <View style={styles.healthCard}>
                    <Text style={styles.sectionTitle}>Histórico Clínico Resumido</Text>
                    <View style={styles.healthRow}>
                        <View style={styles.healthItem}>
                            <MaterialCommunityIcons name="weight" size={24} color="#1CB0F6" />
                            <Text style={styles.healthValue}>28kg</Text>
                            <Text style={styles.healthLabel}>Peso</Text>
                        </View>
                        <View style={styles.healthDivider} />
                        <View style={styles.healthItem}>
                            <MaterialCommunityIcons name="needle" size={24} color="#FF9600" />
                            <Text style={styles.healthValue}>15/04</Text>
                            <Text style={styles.healthLabel}>Vacina</Text>
                        </View>
                        <View style={styles.healthDivider} />
                        <View style={styles.healthItem}>
                            <FontAwesome5 name="stethoscope" size={20} color="#58CC02" />
                            <Text style={styles.healthValue}>05/05</Text>
                            <Text style={styles.healthLabel}>Consulta</Text>
                        </View>
                    </View>
                </View>

            </ScrollView>
            <StatusBar style="dark" />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FA' },
    scrollContent: { padding: 24, gap: 20 },

    // Pet Profile
    petProfileContainer: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 5, marginBottom: 10 },
    avatarBorder: { width: 84, height: 84, borderRadius: 42, borderWidth: 1.5, borderColor: '#1E293B', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%', resizeMode: 'cover' },
    petInfoContainer: { flex: 1, justifyContent: 'center' },
    petName: { fontSize: 32, fontWeight: 'bold', color: '#000', marginBottom: 4 },
    petStatus: { fontSize: 16, color: '#000', fontWeight: '600' },

    // Highlight Card
    highlightCard: { backgroundColor: '#1CB0F6', borderRadius: 24, padding: 20, shadowColor: '#1CB0F6', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
    highlightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    highlightLabel: { color: '#FFF', fontSize: 14, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
    highlightTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    highlightTime: { color: '#E0F2FE', fontSize: 16, marginBottom: 20 },
    primaryButton: { backgroundColor: '#FFF', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    primaryButtonText: { color: '#1CB0F6', fontSize: 16, fontWeight: 'bold' },

    // Gamified Tip
    tipCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 16, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    tipIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFBEB', justifyContent: 'center', alignItems: 'center' },
    tipContent: { flex: 1 },
    tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    tipText: { fontSize: 14, color: '#64748B', lineHeight: 20 },

    // Tasks List
    tasksContainer: { gap: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    progressText: { fontSize: 16, fontWeight: '600', color: '#1CB0F6' },
    taskRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    taskRowDone: { backgroundColor: '#F8FAFC', borderColor: '#F1F5F9' },
    radioCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: '#CBD5E1', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    radioCircleDone: { backgroundColor: '#58CC02', borderColor: '#58CC02' },
    taskInfo: { flex: 1 },
    taskText: { fontSize: 16, fontWeight: '600', color: '#1E293B', marginBottom: 4 },
    taskTextDone: { color: '#94A3B8', textDecorationLine: 'line-through' },
    taskTime: { fontSize: 14, color: '#64748B' },
    xpText: { fontSize: 14, fontWeight: 'bold', color: '#FF9600' },

    // Health Summary
    healthCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
    healthItem: { alignItems: 'center', flex: 1 },
    healthValue: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 8 },
    healthLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
    healthDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },
});