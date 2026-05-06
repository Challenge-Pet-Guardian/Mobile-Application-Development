import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, Modal, KeyboardAvoidingView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { STORAGE_CUIDADORES, STORAGE_RECADOS, STORAGE_USER_DATA } from '../../constants/Keys';
import { Header } from '../../components/Header';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

type Recado = {
  id: string;
  texto: string;
  hora: string;
  autor: string; 
};

// 1. ADICIONADO O TIPO CUIDADOR AQUI
type Cuidador = {
  id: string;
  nome: string;
  funcao: string;
};

export default function FamilyPetScreen({ navigation }: Props) {
  // 2. CORRIGIDO O USESTATE PARA RECEBER A LISTA DE CUIDADORES
  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [recados, setRecados] = useState<Recado[]>([]);
  const [novoRecado, setNovoRecado] = useState('');
  
  const [usuarioLogado, setUsuarioLogado] = useState('Tutor');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [modalVisivel, setModalVisivel] = useState(false);
  const [nomeFamiliar, setNomeFamiliar] = useState('');
  const [funcaoFamiliar, setFuncaoFamiliar] = useState('');

  const carregarDados = async () => {
    try {
      const dadosCuidadores = await AsyncStorage.getItem(STORAGE_CUIDADORES);
      if (dadosCuidadores) {
        setCuidadores(JSON.parse(dadosCuidadores));
      }

      const dadosRecados = await AsyncStorage.getItem(STORAGE_RECADOS);
      if (dadosRecados) {
        setRecados(JSON.parse(dadosRecados));
      }

      const dadosConta = await AsyncStorage.getItem(STORAGE_USER_DATA);
      if (dadosConta) {
        const conta = JSON.parse(dadosConta);
        if (conta.nome) {
          setUsuarioLogado(conta.nome);
        }
      }
    } catch (error) {
      console.log("Deu erro ao carregar AsyncStorage:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const salvarCuidador = async () => {
    if (nomeFamiliar.trim() === '' || funcaoFamiliar.trim() === '') return;

    const novo: Cuidador = {
      id: Date.now().toString(),
      nome: nomeFamiliar,
      funcao: funcaoFamiliar
    };

    const novaLista = [...cuidadores, novo];
    setCuidadores(novaLista);
    await AsyncStorage.setItem(STORAGE_CUIDADORES, JSON.stringify(novaLista));

    setNomeFamiliar('');
    setFuncaoFamiliar('');
    setModalVisivel(false);
  };

  const removerCuidador = async (id: string) => {
    const novaLista = cuidadores.filter((c) => c.id !== id);
    setCuidadores(novaLista);
    await AsyncStorage.setItem(STORAGE_CUIDADORES, JSON.stringify(novaLista));
  };

  const salvarRecado = async () => {
    if (novoRecado === '') return; 

    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    let novaLista = [...recados];

    if (editandoId !== null) {
      novaLista = novaLista.map(r => 
        r.id === editandoId ? { ...r, texto: novoRecado, hora: horaAtual + " (editado)" } : r
      );
      setEditandoId(null); 
    } else {
      const recadoCriado: Recado = {
        id: Date.now().toString(),
        texto: novoRecado,
        hora: horaAtual,
        autor: usuarioLogado
      };
      novaLista = [recadoCriado, ...recados]; 
    }

    setRecados(novaLista);
    setNovoRecado(''); 
    await AsyncStorage.setItem(STORAGE_RECADOS, JSON.stringify(novaLista));
  };

  const prepararEdicao = (recado: Recado) => {
    setNovoRecado(recado.texto);
    setEditandoId(recado.id);
  };

  const removerRecado = async (id: string) => {
    const novaLista = recados.filter(r => r.id !== id);
    setRecados(novaLista);
    await AsyncStorage.setItem(STORAGE_RECADOS, JSON.stringify(novaLista));
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <Header title='Family Pet'/>

        <Text style={styles.sectionTitle}>Canto da Matilha: Tutores de Carlos</Text>
        <Text style={styles.subSectionTitle}>Lista de Cuidadores</Text>

        {cuidadores.map((c, index) => (
          <Animated.View 
            key={c.id} 
            entering={FadeInDown.delay(index * 100)}
            style={[styles.card, styles.whiteShadow]}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(c.nome)}</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardName}>{c.nome}</Text>
              <Text style={styles.cardRole}>{c.funcao}</Text>
            </View>
            
            <TouchableOpacity onPress={() => removerCuidador(c.id)} style={styles.btnAcao}>
              <Text style={{ fontSize: 18 }}>🚪</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <TouchableOpacity
          style={[styles.addButton, styles.buttonShadow]}
          onPress={() => setModalVisivel(true)}
        >
          <Text style={styles.addButtonText}>+ Adicionar Novo Familiar</Text>
        </TouchableOpacity>

        <View style={[styles.recadosCard, styles.whiteShadow]}>
          <Text style={styles.recadosTitle}>Mural da Matilha:</Text>
          
          <TextInput
            style={styles.recadosInput}
            placeholder="Digite aqui o que aconteceu..."
            placeholderTextColor="#999"
            value={novoRecado}
            onChangeText={setNovoRecado}
            multiline
          />
          
          <TouchableOpacity 
            style={styles.recadosButton} 
            onPress={salvarRecado}
          >
            <Text style={styles.recadosButtonText}>
              {editandoId ? 'Atualizar Recado' : 'Adicionar Recado'}
            </Text>
          </TouchableOpacity>

          {editandoId && (
            <TouchableOpacity onPress={() => { setEditandoId(null); setNovoRecado(''); }}>
              <Text style={styles.cancelarEdicaoText}>Cancelar Edição</Text>
            </TouchableOpacity>
          )}

          <View style={styles.recadosList}>
            {recados.length === 0 ? (
              <Text style={styles.recadosVazio}>Nenhum recado ainda hoje.</Text>
            ) : (
              recados.map((recado) => (
                <View key={recado.id} style={styles.recadoItem}>
                  <View style={styles.recadoTextoContainer}>
                    <Text style={styles.recadoAutor}>{recado.autor}</Text>
                    <Text style={styles.recadoTexto}>{recado.texto}</Text>
                    <Text style={styles.recadoHora}>{recado.hora}</Text>
                  </View>
                  
                  <View style={styles.acoesRecado}>
                    <TouchableOpacity onPress={() => prepararEdicao(recado)} style={styles.btnAcao}>
                      <Text style={styles.iconeAcao}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removerRecado(recado.id)} style={styles.btnAcao}>
                      <Text style={styles.iconeAcao}>🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

      </ScrollView>

      {/* POP-UP (MODAL) DE ADICIONAR FAMILIAR */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisivel}
        onRequestClose={() => setModalVisivel(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Novo Familiar</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome (ex: Enzo)"
              placeholderTextColor="#999"
              value={nomeFamiliar}
              onChangeText={setNomeFamiliar}
            />
            
            <TextInput
              style={styles.modalInput}
              placeholder="Função (ex: Passeador)"
              placeholderTextColor="#999"
              value={funcaoFamiliar}
              onChangeText={setFuncaoFamiliar}
            />

            <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarCuidador}>
              <Text style={styles.modalBtnSalvarText}>Salvar</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => { setModalVisivel(false); setNomeFamiliar(''); setFuncaoFamiliar(''); }}>
              <Text style={styles.modalBtnCancelarText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  contentContainer: { padding: 24, paddingBottom: 40 },

  whiteShadow: {
    backgroundColor: '#FFF',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6 },
      android: { elevation: 4 },
    }),
  },

  buttonShadow: {
    ...Platform.select({
      ios: { shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 6 },
    }),
  },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4 },
  subSectionTitle: { fontSize: 14, color: '#666', marginBottom: 20 },

  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarText: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  cardTextContainer: { flex: 1 },
  cardName: { fontWeight: 'bold', fontSize: 16, color: '#1A1A1A' },
  cardRole: { fontSize: 13, color: '#666', marginTop: 2 },

  addButton: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 35 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  recadosCard: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  recadosTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  recadosInput: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 14, backgroundColor: '#FAFAFA', minHeight: 60, textAlignVertical: 'top' },
  
  recadosButton: { backgroundColor: '#0066FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  recadosButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  cancelarEdicaoText: { textAlign: 'center', color: '#666', marginBottom: 15, fontSize: 13, textDecorationLine: 'underline' },

  recadosList: { marginTop: 10 },
  recadosVazio: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center' },
  
  recadoItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  recadoTextoContainer: { flex: 1, paddingRight: 10 },
  recadoAutor: { fontSize: 12, fontWeight: '700', color: '#0066FF', marginBottom: 2 },
  recadoTexto: { fontSize: 14, color: '#333', lineHeight: 20 },
  recadoHora: { fontSize: 11, color: '#999', marginTop: 4 },
  
  acoesRecado: { flexDirection: 'row', gap: 10, paddingTop: 4 },
  btnAcao: { padding: 8 },
  iconeAcao: { fontSize: 16 },

  // --- ESTILOS DO MODAL ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, backgroundColor: '#FAFAFA' },
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalBtnCancelarText: { color: '#666', fontSize: 14, textAlign: 'center', textDecorationLine: 'underline' }
});