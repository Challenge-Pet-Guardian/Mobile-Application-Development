import React, { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { 
    Text, View, Image, StyleSheet, ScrollView, Platform, 
    ActivityIndicator, TouchableOpacity, 
    TextInput, KeyboardAvoidingView, Alert 
} from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

import { Header } from "../../components/Header";
import { StreakCard } from "../../components/streakCard";
import { STORAGE_KEYS } from '../../constants/Keys';
import { EmptyState } from "../../components/EmptyState";
import { TipCard } from "../../components/TipCard";
import { TaskItem } from "../../components/TaskItem";
import { HighlightTaskCard } from "../../components/HighlightTaskCard";
import { HealthHistoryCard } from "../../components/HealthHistoryCard";
import { Pet, Tarefa, DiaOfensiva } from '../../types/models';
import { TaskService } from '../../services/TaskService';
import { getAvatarById } from '../../constants/Avatares';

export default function Home({ navigation }: any) {
    const [loading, setLoading] = useState(true);
    const [temMatilha, setTemMatilha] = useState(false);
    
    // Estados do Formulário (Sem usar o componente Modal)
    const [formVisivel, setFormVisivel] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');
    
    const [xpTotal, setXpTotal] = useState(0);
    const [ofensivaTotal, setOfensivaTotal] = useState(0); 
    const [householdName, setHouseholdName] = useState('Minha Família'); 
    const [petsDaMatilha, setPetsDaMatilha] = useState<Pet[]>([]);

    const [tarefas, setTarefas] = useState<Tarefa[]>([]);
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

            const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
            let meuNome = '';
            if (userDataString) meuNome = JSON.parse(userDataString).nome.trim();

            const cuidadoresString = await AsyncStorage.getItem(STORAGE_KEYS.CUIDADORES);
            let usuarioEstaNaLista = false;
            if (cuidadoresString && meuNome) {
                const lista = JSON.parse(cuidadoresString);
                usuarioEstaNaLista = lista.some((c: any) => c.nome.replace(' (Você)', '').trim() === meuNome);
            }

            let matilhaAtiva = await AsyncStorage.getItem(STORAGE_KEYS.MATILHA_ATIVA);
            
            if (usuarioEstaNaLista && matilhaAtiva !== 'sim') {
                await AsyncStorage.setItem(STORAGE_KEYS.MATILHA_ATIVA, 'sim');
                matilhaAtiva = 'sim';
            } else if (!usuarioEstaNaLista && matilhaAtiva === 'sim') {
                await AsyncStorage.setItem(STORAGE_KEYS.MATILHA_ATIVA, 'nao');
                matilhaAtiva = 'nao';
            }

            if (matilhaAtiva !== 'sim') {
                setTemMatilha(false);
                setLoading(false);
                return;
            }
            
            setTemMatilha(true);

            const nomeCasaSalvo = await AsyncStorage.getItem(STORAGE_KEYS.NOME_MATILHA);
            if (nomeCasaSalvo) setHouseholdName(nomeCasaSalvo);

            const matilhaStr = await AsyncStorage.getItem(STORAGE_KEYS.LISTA_PETS);
            let matilhaArray: Pet[] = [];
            if (matilhaStr) matilhaArray = JSON.parse(matilhaStr);
            setPetsDaMatilha(matilhaArray);

            const pontosSalvos = await AsyncStorage.getItem(STORAGE_KEYS.PONTOS_XP);
            if (pontosSalvos) setXpTotal(Number(pontosSalvos));

            const ofensivaSalva = await AsyncStorage.getItem(STORAGE_KEYS.OFENSIVA_DIAS);
            if (ofensivaSalva) setOfensivaTotal(Number(ofensivaSalva));

            const tarefasDoDia = await TaskService.carregarTarefasHoje();
            setTarefas(tarefasDoDia);

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const atualizarOfensivaReal = async () => {
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
    };

    const registrarXPIndividual = async (pontos: number) => {
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
            else if (dataSemHora < hojeSemHora) status = 'feito'; 
            dias.push({ id: i, dayLabel: letras[i], dayNumber: numeroDia, status: status });
        }
        setDiasOfensiva(dias);
    };

    const handleCriarTarefa = async () => {
        if (!titulo.trim() || !descricao.trim()) {
            Alert.alert("Campos vazios", "O C# exige título e descrição para salvar!");
            return;
        }

        const novaTarefaParaService = {
            titulo: titulo.trim(),
            descricao: descricao.trim(),
            horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            xp: 15,
            diaDaSemana: new Date().getDay(),
            petId: petsDaMatilha[0]?.id || "0" 
        };

        await TaskService.adicionarTarefaMatilha(novaTarefaParaService);
        setFormVisivel(false);
        setTitulo('');
        setDescricao('');
        
        const tarefasAtualizadas = await TaskService.carregarTarefasHoje();
        setTarefas(tarefasAtualizadas);
    };

    const alternarTarefaStatus = async (id: number) => {
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
    };

    const proximaTarefaPendente = tarefas.find(t => !t.concluida) || null;

    if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#1CB0F6" /></View>;

    if (!temMatilha) {
        return (
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Header title="Home" />
                    <EmptyState 
                        iconName="home-group"
                        iconColor="#1CB0F6"
                        title="Bem-vindo ao PetGuardian!"
                        description="Para ver as tarefas do dia, você precisa de uma matilha."
                        buttonText="Criar ou Entrar numa Matilha"
                        onButtonPress={() => navigation.navigate('Family')}
                    />
                </ScrollView>
                <StatusBar style="dark" />
            </View>
        );
    }

    if (temMatilha && petsDaMatilha.length === 0) {
        return (
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Header title="Home" />
                    <EmptyState 
                        iconName="dog"
                        iconColor="#FF9600"
                        title="Matilha Pronta!"
                        description="Cadastre o seu primeiro pet para liberar o painel de tarefas!"
                        buttonText="Cadastrar meu Pet"
                        buttonColor="#FF9600"
                        onButtonPress={() => navigation.navigate('MeuPet')}
                    />
                </ScrollView>
                <StatusBar style="dark" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                <Header title="Home" />
                <View style={styles.petProfileContainer}>
                    <View style={styles.matilhaAvatars}>
                        {petsDaMatilha.slice(0, 2).map((pet, index) => {
                            const imagemCerta = getAvatarById(pet.avatarId);
                            return (
                                <View key={pet.id ?? index.toString()} style={[styles.avatarWrapper, index === 1 && { marginLeft: -35, zIndex: 1 }]}>
                                    {imagemCerta ? <Image source={imagemCerta} style={styles.avatarImageMatilha} /> : <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="paw" size={30} color="#A0AEC0" /></View>}
                                </View>
                            );
                        })}
                    </View>
                    <View style={styles.petInfoContainer}>
                        <Text style={styles.petName} numberOfLines={1}>{householdName}</Text>
                        <Text style={styles.petStatus}>A família tem {xpTotal} XP!</Text>
                    </View>
                </View>

                <StreakCard streakDays={diasOfensiva} totalStreak={ofensivaTotal} />

                {/* Botão de Adicionar Tarefa */}
                <TouchableOpacity 
                    style={styles.btnCriar} 
                    onPress={() => setFormVisivel(true)}
                >
                    <MaterialCommunityIcons name="plus-circle" size={24} color="#FFF" />
                    <Text style={styles.btnCriarText}>Nova Tarefa do Dia</Text>
                </TouchableOpacity>

                <HighlightTaskCard 
                    tarefa={proximaTarefaPendente}
                    onComplete={alternarTarefaStatus}
                />

                <View style={styles.tasksContainer}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Tarefas de Hoje</Text>
                        <Text style={styles.progressText}>{tarefas.filter(t => t.concluida).length}/{tarefas.length}</Text>
                    </View>
                    {tarefas.length === 0 ? (
                        <View style={styles.emptyTasks}>
                            <MaterialCommunityIcons name="clipboard-text-outline" size={40} color="#CBD5E1" />
                            <Text style={styles.emptyTasksText}>Nenhuma tarefa cadastrada ainda.</Text>
                            <Text style={styles.emptyTasksSubtext}>Adicione tarefas no botão acima!</Text>
                        </View>
                    ) : (
                        tarefas.map((t) => (
                            <TaskItem 
                                key={t.id} 
                                id={t.id}
                                title={t.titulo}
                                time={t.horario}
                                xp={t.xp}
                                isDone={t.concluida}
                                onToggle={alternarTarefaStatus}
                            />
                        ))
                    )}
                </View>

                <TipCard text="Variar as atividades estimula a inteligência do seu pet." />

                <HealthHistoryCard pets={petsDaMatilha} />
                <View style={{ height: 130 }} />
            </ScrollView>

            {formVisivel && (
                <View style={styles.absoluteOverlay}>
                    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center' }}>
                        <View style={styles.modalContent}>
                            <Text style={styles.modalHeader}>O que faremos hoje?</Text>
                            
                            <TextInput 
                                style={styles.inputModal} 
                                placeholder="Título (Ex: Dar Remédio)" 
                                maxLength={30} 
                                value={titulo}
                                onChangeText={setTitulo}
                            />

                            <TextInput 
                                style={[styles.inputModal, { height: 80, textAlignVertical: 'top' }]} 
                                placeholder="Descrição detalhada..." 
                                maxLength={200} 
                                multiline
                                value={descricao}
                                onChangeText={setDescricao}
                            />

                            <View style={styles.modalButtons}>
                                <TouchableOpacity style={styles.btnCancelar} onPress={() => setFormVisivel(false)}>
                                    <Text style={{color: '#64748B', fontWeight: 'bold'}}>Cancelar</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.btnSalvar} onPress={handleCriarTarefa}>
                                    <Text style={{color: '#FFF', fontWeight: 'bold'}}>Salvar Tarefa</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </View>
            )}

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
    tasksContainer: { gap: 12 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
    sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
    progressText: { fontSize: 16, fontWeight: '600', color: '#1CB0F6' },
    emptyTasks: { backgroundColor: '#FFF', borderRadius: 20, padding: 30, alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', gap: 8 },
    emptyTasksText: { fontSize: 16, fontWeight: '600', color: '#94A3B8' },
    emptyTasksSubtext: { fontSize: 14, color: '#CBD5E1' },
    
    btnCriar: { 
        backgroundColor: '#0066FF', 
        flexDirection: 'row', 
        padding: 16, 
        borderRadius: 16, 
        justifyContent: 'center', 
        alignItems: 'center', 
        gap: 10,
        elevation: 4
    },
    btnCriarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },

    absoluteOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        padding: 20,
        zIndex: 999,
        elevation: 10,
    },
    modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 25, elevation: 10 },
    modalHeader: { fontSize: 20, fontWeight: 'bold', color: '#134879', marginBottom: 20, textAlign: 'center' },
    inputModal: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, marginBottom: 15, color: '#333' },
    modalButtons: { flexDirection: 'row', gap: 10 },
    btnCancelar: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#EDF2F7' },
    btnSalvar: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#0066FF' }
});