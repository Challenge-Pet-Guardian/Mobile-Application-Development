import React, { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { Text, View, Image, StyleSheet, ScrollView, Platform, ActivityIndicator, TouchableOpacity, TextInput, KeyboardAvoidingView, Alert } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from "../../components/Header";
import { StreakCard } from "../../components/streakCard";
import { EmptyState } from "../../components/EmptyState";
import { TipCard } from "../../components/TipCard";
import { TaskItem } from "../../components/TaskItem";
import { HighlightTaskCard } from "../../components/HighlightTaskCard";
import { HealthHistoryCard } from "../../components/HealthHistoryCard";
import { getAvatarById } from '../../constants/Avatares';
import { useHome } from "../../hooks/useHome";

export default function Home({ navigation }: any) {
    const [formVisivel, setFormVisivel] = useState(false);
    const [titulo, setTitulo] = useState('');
    const [descricao, setDescricao] = useState('');

    const { 
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
        proximaTarefaPendente 
    } = useHome();

    // Cálculo de tarefas concluídas
    const tarefasConcluidasCount = tarefas.filter(t => t.concluida).length;

    // Handlers de navegação memoizados
    const handleNavigateToFamily = useCallback(() => {
        navigation.navigate('Family');
    }, [navigation]);

    const handleNavigateToMeuPet = useCallback(() => {
        navigation.navigate('MeuPet');
    }, [navigation]);

    // Handlers de modal memoizados
    const handleAbrirForm = useCallback(() => {
        setFormVisivel(true);
    }, []);

    const handleFecharForm = useCallback(() => {
        setFormVisivel(false);
        setTitulo('');
        setDescricao('');
    }, []);

    // Ação de salvar tarefa memoizada com suporte a Web/Native Alerts
    const salvarTarefa = useCallback(async () => {
        if (!titulo.trim() || !descricao.trim()) {
            if (Platform.OS === 'web') {
                window.alert("É necessário informar título e descrição para salvar!");
            } else {
                Alert.alert("Campos vazios", "É necessário informar título e descrição para salvar!");
            }
            return;
        }
        await handleCriarTarefa(titulo, descricao);
        handleFecharForm();
    }, [titulo, descricao, handleCriarTarefa, handleFecharForm]);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#1CB0F6" />
            </View>
        );
    }

    if (!temFamilia) {
        return (
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Header title="Home" />
                    <EmptyState 
                        iconName="home-group"
                        iconColor="#1CB0F6"
                        title="Bem-vindo ao PetGuardian!"
                        description="Para ver as tarefas do dia, você precisa de uma Familia."
                        buttonText="Criar ou Entrar numa Familia"
                        onButtonPress={handleNavigateToFamily}
                    />
                </ScrollView>
                <StatusBar style="dark" />
            </View>
        );
    }

    if (temFamilia && petsDaFamilia.length === 0) {
        return (
            <View style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    <Header title="Home" />
                    <EmptyState 
                        iconName="dog"
                        iconColor="#FF9600"
                        title="Familia Pronta!"
                        description="Cadastre o seu primeiro pet para liberar o painel de tarefas!"
                        buttonText="Cadastrar meu Pet"
                        buttonColor="#FF9600"
                        onButtonPress={handleNavigateToMeuPet}
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
                    <View style={styles.FamiliaAvatars}>
                        {petsDaFamilia.slice(0, 2).map((pet, index) => {
                            const imagemCerta = getAvatarById(pet.avatarId);
                            return (
                                <View key={pet.id ?? index.toString()} style={[styles.avatarWrapper, index === 1 && { marginLeft: -35, zIndex: 1 }]}>
                                    {imagemCerta ? <Image source={imagemCerta} style={styles.avatarImageFamilia} /> : <View style={styles.avatarPlaceholder}><MaterialCommunityIcons name="paw" size={30} color="#A0AEC0" /></View>}
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
                    onPress={handleAbrirForm}
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
                        <Text style={styles.progressText}>{tarefasConcluidasCount}/{tarefas.length}</Text>
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

                <HealthHistoryCard pets={petsDaFamilia} />
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
                                <TouchableOpacity style={styles.btnCancelar} onPress={handleFecharForm}>
                                    <Text style={{color: '#64748B', fontWeight: 'bold'}}>Cancelar</Text>
                                </TouchableOpacity>
                                
                                <TouchableOpacity style={styles.btnSalvar} onPress={salvarTarefa}>
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
    FamiliaAvatars: { flexDirection: 'row', width: 95 },
    avatarWrapper: { zIndex: 2, borderRadius: 35, borderWidth: 3, borderColor: '#FFF', backgroundColor: '#FFF' },
    avatarImageFamilia: { width: 64, height: 64, borderRadius: 32 },
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
    btnCriar: { backgroundColor: '#0066FF', flexDirection: 'row', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', gap: 10, elevation: 4 },
    btnCriarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    absoluteOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20, zIndex: 999, elevation: 10 },
    modalContent: { backgroundColor: '#FFF', borderRadius: 24, padding: 25, elevation: 10 },
    modalHeader: { fontSize: 20, fontWeight: 'bold', color: '#134879', marginBottom: 20, textAlign: 'center' },
    inputModal: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 15, marginBottom: 15, color: '#333' },
    modalButtons: { flexDirection: 'row', gap: 10 },
    btnCancelar: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#EDF2F7' },
    btnSalvar: { flex: 1, padding: 15, alignItems: 'center', borderRadius: 12, backgroundColor: '#0066FF' }
});