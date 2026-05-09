import React, { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, Image, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert } from "react-native";
import { Entypo, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { Header } from "../../components/Header";
import { StreakCard } from "../../components/streakCard"; 

interface Pet { id?: string; nome: string; breed?: string; age?: string; avatarId?: string; uri?: string; peso?: string; ultimaVacina?: string; vacina?: string; dataVacina?: string;}
interface Tarefa { id: number; titulo: string; horario: string; concluida: boolean; xp: number; }
interface DiaOfensiva { id: number; dayLabel: string; dayNumber: string; status: 'feito' | 'perdido' | 'hoje' | 'futuro'; }

const AVATARES_LOCAL: any = {
  '1': require('../../assets/img/cachorro-01.jpg'), 
  '2': require('../../assets/img/cachorro-02.jpg'), 
  '3': require('../../assets/img/gato-01.jpg'), 
  '4': require('../../assets/img/gato-02.jpg'), 
  '5': require('../../assets/img/coelho.jpg'), 
};

const TAREFAS_BASE: Tarefa[] = [
    { id: 1, titulo: "Passeio Longo", horario: "18:00", concluida: false, xp: 20 },
    { id: 2, titulo: "Jantar", horario: "19:30", concluida: false, xp: 10 },
    { id: 3, titulo: "Escovar os pelos", horario: "20:00", concluida: false, xp: 15 },
];

export default function Home() {
    const [loading, setLoading] = useState(true);
    const [xpTotal, setXpTotal] = useState(0);
    const [ofensivaTotal, setOfensivaTotal] = useState(0); 
    const [householdName, setHouseholdName] = useState('Minha Matilha'); 
    const [petsDaMatilha, setPetsDaMatilha] = useState<Pet[]>([]);
    const [nomePetPrincipal, setNomePetPrincipal] = useState('Pets'); 

    const [tarefaVermifugoAtiva, setTarefaVermifugoAtiva] = useState(false);
    const [tarefas, setTarefas] = useState<Tarefa[]>(TAREFAS_BASE);
    const [diasOfensiva, setDiasOfensiva] = useState<DiaOfensiva[]>([]);

    useFocusEffect(
        useCallback(() => {
            carregarDadosFuncionais();
            gerarDiasDaSemana();
        }, [])
    );

    const carregarDadosFuncionais = async () => {
        try {
            setLoading(true);

            const nomeCasaSalvo = await AsyncStorage.getItem('@PetGuardian_NomeMatilha');
            if (nomeCasaSalvo) setHouseholdName(nomeCasaSalvo);

            const matilhaStr = await AsyncStorage.getItem('@PetGuardian_ListaPets');
            let matilhaArray: Pet[] = [];
            if (matilhaStr) matilhaArray = JSON.parse(matilhaStr);

            if (matilhaArray.length === 0) {
                const petUnicoStr = await AsyncStorage.getItem('@PetGuardian_DadosPet');
                if (petUnicoStr) matilhaArray = [JSON.parse(petUnicoStr)];
            }

            if (matilhaArray.length > 0) {
                setPetsDaMatilha(matilhaArray);
                setNomePetPrincipal(matilhaArray[0].nome || 'Pets');
            }

            const pontosSalvos = await AsyncStorage.getItem('@PetGuardian_PontosXP');
            if (pontosSalvos) setXpTotal(Number(pontosSalvos));

    
            const ofensivaSalva = await AsyncStorage.getItem('@PetGuardian_OfensivaDias');
            if (ofensivaSalva) setOfensivaTotal(Number(ofensivaSalva));

            const hojeDataString = new Date().toDateString();
            const ultimoDiaAcesso = await AsyncStorage.getItem('@PetGuardian_UltimoDiaAcesso');

            if (ultimoDiaAcesso !== hojeDataString) {
                setTarefas(TAREFAS_BASE);
                setTarefaVermifugoAtiva(false);
                await AsyncStorage.setItem('@PetGuardian_UltimoDiaAcesso', hojeDataString);
                await AsyncStorage.setItem('@PetGuardian_TarefasHoje', JSON.stringify(TAREFAS_BASE));
                await AsyncStorage.setItem('@PetGuardian_TarefaVermifugoAtiva', 'false');
            } else {
                const statusTarefa = await AsyncStorage.getItem('@PetGuardian_TarefaVermifugoAtiva');
                if (statusTarefa === 'true') setTarefaVermifugoAtiva(true);

                const tarefasSalvas = await AsyncStorage.getItem('@PetGuardian_TarefasHoje');
                if (tarefasSalvas) setTarefas(JSON.parse(tarefasSalvas));
            }

        } catch (error) {
            console.log('Erro ao carregar dados na Home:', error);
        } finally {
            setLoading(false);
        }
    };

    const atualizarOfensivaReal = async () => {
        try {
            const hoje = new Date().toDateString();
            const ultimaDataOfensiva = await AsyncStorage.getItem('@PetGuardian_DataUltimaOfensiva');
            const ofensivaAtualStr = await AsyncStorage.getItem('@PetGuardian_OfensivaDias');
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

            await AsyncStorage.setItem('@PetGuardian_OfensivaDias', String(ofensivaAtual));
            await AsyncStorage.setItem('@PetGuardian_DataUltimaOfensiva', hoje);
            
            // Atualiza o valor na tela na hora!
            setOfensivaTotal(ofensivaAtual);

        } catch (e) {
            console.log("Erro ao atualizar ofensiva", e);
        }
    };

    const gerarDiasDaSemana = () => {
        const hoje = new Date();
        const diaDaSemanaAtual = hoje.getDay(); 
        const distanciaParaSegunda = diaDaSemanaAtual === 0 ? 6 : diaDaSemanaAtual - 1;
        const segunda = new Date(hoje);
        segunda.setDate(hoje.getDate() - distanciaParaSegunda);

        const letras = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];
        const dias: DiaOfensiva[] = [];

        for (let i = 0; i < 7; i++) {
            const dataAtual = new Date(segunda);
            dataAtual.setDate(segunda.getDate() + i);
            const numeroDia = dataAtual.getDate().toString().padStart(2, '0');
            let status: DiaOfensiva['status'] = 'futuro';

            const dataSemHora = new Date(dataAtual.toDateString());
            const hojeSemHora = new Date(hoje.toDateString());

            if (dataSemHora.getTime() === hojeSemHora.getTime()) status = 'hoje';
            else if (dataSemHora < hojeSemHora) status = i === 1 ? 'perdido' : 'feito'; 

            dias.push({ id: i, dayLabel: letras[i], dayNumber: numeroDia, status: status });
        }
        setDiasOfensiva(dias);
    };

    const alternarTarefaStatus = async (id: number) => {
        const tarefaClicada = tarefas.find(t => t.id === id);
        if (!tarefaClicada) return;

        const isConcluindo = !tarefaClicada.concluida; 
        const novasTarefas = tarefas.map(t => t.id === id ? { ...t, concluida: isConcluindo } : t );
        setTarefas(novasTarefas);

        const mudancaXP = isConcluindo ? tarefaClicada.xp : -tarefaClicada.xp;
        const novoXP = xpTotal + mudancaXP;
        setXpTotal(novoXP);

        await AsyncStorage.setItem('@PetGuardian_PontosXP', String(novoXP));
        await AsyncStorage.setItem('@PetGuardian_TarefasHoje', JSON.stringify(novasTarefas));

        if (isConcluindo) atualizarOfensivaReal(); 
    };

    const handleMainTaskXPClick = async () => {
        if (tarefaVermifugoAtiva) return;

        try {
            const novoXP = xpTotal + 50;
            setXpTotal(novoXP);
            setTarefaVermifugoAtiva(true); 

            await AsyncStorage.setItem('@PetGuardian_PontosXP', String(novoXP));
            await AsyncStorage.setItem('@PetGuardian_TarefaVermifugoAtiva', 'true');
            
            atualizarOfensivaReal(); 
            Alert.alert('Excelente!', '+50 XP ganhos pela matilha! 🐾');
        } catch (error) {
            console.log('Erro ao guardar XP:', error);
        }
    };

    const obterImagemPet = (pet: Pet) => {
        const identificador = pet.avatarId;
        if (identificador && AVATARES_LOCAL[identificador]) return AVATARES_LOCAL[identificador];
        return null;
    };

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#1CB0F6" /></View>;

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Header title="Home" />
                <View style={styles.petProfileContainer}>
                    <View style={styles.matilhaAvatars}>
                        {petsDaMatilha.length > 0 ? (
                            petsDaMatilha.slice(0, 2).map((pet, index) => {
                                const imagemCerta = obterImagemPet(pet);
                                return (
                                    <View key={index.toString()} style={[styles.avatarWrapper, index === 1 && { marginLeft: -35, zIndex: 1 }]}>
                                        {imagemCerta ? (
                                            <Image source={imagemCerta} style={styles.avatarImageMatilha} />
                                        ) : (
                                            <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="paw" size={30} color="#A0AEC0" /></View>
                                        )}
                                    </View>
                                );
                            })
                        ) : (
                            <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="paw" size={40} color="#A0AEC0" /></View>
                        )}
                    </View>
                    <View style={styles.petInfoContainer}>
                        <Text style={styles.petName} numberOfLines={1}>{householdName}</Text>
                        <Text style={styles.petStatus}>A matilha tem {xpTotal} XP!</Text>
                    </View>
                </View>

               
                <StreakCard streakDays={diasOfensiva} totalStreak={ofensivaTotal} />

                <View style={styles.highlightCard}>
                    <View style={styles.highlightHeader}>
                        <MaterialCommunityIcons name="clock-alert-outline" size={20} color="#FFF" />
                        <Text style={styles.highlightLabel}>Próxima Tarefa</Text>
                    </View>
                    <Text style={styles.highlightTitle}>Vermífugo de {nomePetPrincipal}</Text>
                    <Text style={styles.highlightTime}>Hoje às 15:30</Text>
                    <TouchableOpacity style={[styles.primaryButton, tarefaVermifugoAtiva && styles.primaryButtonDone]} onPress={handleMainTaskXPClick} disabled={tarefaVermifugoAtiva}>
                        <Text style={[styles.primaryButtonText, tarefaVermifugoAtiva && styles.primaryButtonTextDone]}>
                            {tarefaVermifugoAtiva ? "✓ Tarefa Concluída" : "Marcar como Feito (+50 XP)"}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.tasksContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Tarefas de Hoje</Text>
                        <Text style={styles.progressText}>{tarefas.filter(t => t.concluida).length}/{tarefas.length}</Text>
                    </View>
                    {tarefas.map((tarefa) => (
                        <TouchableOpacity key={tarefa.id} onPress={() => alternarTarefaStatus(tarefa.id)} activeOpacity={0.7} style={[styles.taskRow, tarefa.concluida && styles.taskRowDone]}>
                            <View style={[styles.radioCircle, tarefa.concluida && styles.radioCircleDone]}>
                                {tarefa.concluida && <Entypo name="check" size={16} color="#FFF" />}
                            </View>
                            <View style={styles.taskInfo}>
                                <Text style={[styles.taskText, tarefa.concluida && styles.taskTextDone]}>{tarefa.titulo}</Text>
                                <Text style={styles.taskTime}>{tarefa.horario}</Text>
                            </View>
                            <Text style={styles.xpText}>+{tarefa.xp} XP</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={styles.tipCard}>
                    <View style={styles.tipIconContainer}><FontAwesome5 name="lightbulb" size={20} color="#FFC800" /></View>
                    <View style={styles.tipContent}>
                        <Text style={styles.tipTitle}>Dica do Dia</Text>
                        <Text style={styles.tipText}>Manter as vacinas em dia previne 90% das doenças comuns.</Text>
                    </View>
                </View>

                <View style={styles.healthCard}>
                    <Text style={[styles.sectionTitle, { marginBottom: 20 }]}>Histórico Clínico</Text>
                    {petsDaMatilha.map((pet, index) => (
                        <View key={index} style={{ marginBottom: 15, borderBottomWidth: index === petsDaMatilha.length - 1 ? 0 : 1, borderBottomColor: '#F0F0F0', paddingBottom: index === petsDaMatilha.length - 1 ? 0 : 15 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#333', marginBottom: 10 }}>{pet.nome}</Text>
                            <View style={styles.healthRow}>
                                <View style={styles.healthItem}><MaterialCommunityIcons name="weight" size={24} color="#1CB0F6" /><Text style={styles.healthValue}>{pet.peso || '-- kg'}</Text><Text style={styles.healthLabel}>Peso</Text></View>
                                <View style={styles.healthDivider} />
                                <View style={styles.healthItem}><MaterialCommunityIcons name="needle" size={24} color="#FF9600" /><Text style={styles.healthValue}>{pet.ultimaVacina || '--/--'}</Text><Text style={styles.healthLabel}>Vacina</Text></View>
                                <View style={styles.healthDivider} />
                                <View style={styles.healthItem}><FontAwesome5 name="stethoscope" size={20} color="#58CC02" /><Text style={styles.healthValue}>--/--</Text><Text style={styles.healthLabel}>Consulta</Text></View>
                            </View>
                        </View>
                    ))}
                </View>
                <View style={{ height: 130 }} />
            </ScrollView>
            <StatusBar style="dark" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F7FA', paddingTop: Platform.OS === 'ios' ? 50 : 30 },
    scrollContent: { padding: 24, gap: 20 },
    petProfileContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 5, marginBottom: 10 },
    matilhaAvatars: { flexDirection: 'row', width: 95 },
    avatarWrapper: { zIndex: 2, borderRadius: 35, borderWidth: 3, borderColor: '#FFF', backgroundColor: '#FFF' },
    avatarImageMatilha: { width: 64, height: 64, borderRadius: 32 },
    avatarPlaceholder: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDF2F7' },
    petInfoContainer: { flex: 1, justifyContent: 'center' },
    petName: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 4 },
    petStatus: { fontSize: 16, color: '#1CB0F6', fontWeight: '700' },
    highlightCard: { backgroundColor: '#1CB0F6', borderRadius: 24, padding: 20, elevation: 8 },
    highlightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
    highlightLabel: { color: '#FFF', fontSize: 14, fontWeight: '600', textTransform: 'uppercase' },
    highlightTitle: { color: '#FFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    highlightTime: { color: '#E0F2FE', fontSize: 16, marginBottom: 20 },
    primaryButton: { backgroundColor: '#FFF', paddingVertical: 14, borderRadius: 16, alignItems: 'center' },
    primaryButtonText: { color: '#1CB0F6', fontSize: 16, fontWeight: 'bold' },
    primaryButtonDone: { backgroundColor: '#0284C7' }, 
    primaryButtonTextDone: { color: '#E0F2FE' },
    tipCard: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 20, padding: 16, alignItems: 'center', gap: 16, borderWidth: 1, borderColor: '#E2E8F0' },
    tipIconContainer: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#FFFBEB', justifyContent: 'center', alignItems: 'center' },
    tipContent: { flex: 1 },
    tipTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
    tipText: { fontSize: 14, color: '#64748B', lineHeight: 20 },
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
    healthCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#E2E8F0' },
    healthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
    healthItem: { alignItems: 'center', flex: 1 },
    healthValue: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginTop: 8 },
    healthLabel: { fontSize: 12, color: '#64748B', marginTop: 4 },
    healthDivider: { width: 1, height: 40, backgroundColor: '#E2E8F0' },
});