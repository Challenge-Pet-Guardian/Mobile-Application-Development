import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function FamilyPetScreen({ navigation }: any) {
  const [cuidadores, setCuidadores] = useState([]);
  
  // Novos estados para os Recados
  const [recados, setRecados] = useState<{id: string, texto: string, hora: string}[]>([]);
  const [novoRecado, setNovoRecado] = useState('');

  // Carrega Cuidadores e Recados do armazenamento local
  const carregarDados = async () => {
    const dadosCuidadores = await AsyncStorage.getItem('@Matilha_Cuidadores');
    if (dadosCuidadores) setCuidadores(JSON.parse(dadosCuidadores));

    const dadosRecados = await AsyncStorage.getItem('@Matilha_Recados');
    if (dadosRecados) setRecados(JSON.parse(dadosRecados));
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  // Lógica para adicionar um recado na lista
  const adicionarRecado = async () => {
    if (novoRecado.trim() === '') return;

    const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    
    const recadoCriado = {
      id: Date.now().toString(),
      texto: novoRecado,
      hora: horaAtual
    };

    const novaLista = [recadoCriado, ...recados]; // Adiciona no topo da lista
    setRecados(novaLista);
    setNovoRecado(''); // Limpa o campo de texto

    await AsyncStorage.setItem('@Matilha_Recados', JSON.stringify(novaLista));
  };

  // Lógica para remover um recado (Para testes no protótipo)
  const removerRecado = async (id: string) => {
    const novaLista = recados.filter(r => r.id !== id);
    setRecados(novaLista);
    await AsyncStorage.setItem('@Matilha_Recados', JSON.stringify(novaLista));
  };

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const dataFormatada = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.headerTitle}>PetGuardian</Text>
        <Text style={styles.dateText}>{dataFormatada}</Text>

        <Text style={styles.sectionTitle}>Canto da Matilha: Tutores de Carlos</Text>
        <Text style={styles.subSectionTitle}>Lista de Cuidadores</Text>

        {cuidadores.map((c: any) => (
          <View key={c.id} style={[styles.card, styles.whiteShadow]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(c.nome)}</Text>
            </View>
            <View style={styles.cardTextContainer}>
              <Text style={styles.cardName}>{c.nome}</Text>
              <Text style={styles.cardRole}>Função: {c.funcao}</Text>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={[styles.addButton, styles.buttonShadow]}
          onPress={() => navigation.navigate('AddMember')}
        >
          <Text style={styles.addButtonText}>+ Adicionar Novo Familiar</Text>
        </TouchableOpacity>

        {/* Nova Secção de Recados Interativa */}
        <View style={[styles.recadosCard, styles.whiteShadow]}>
          <Text style={styles.recadosTitle}>Mural da Matilha:</Text>
          
          {/* Campo de Digitação */}
          <TextInput
            style={styles.recadosInput}
            placeholder="Ex: Dei o remédio de carrapato!"
            placeholderTextColor="#999"
            value={novoRecado}
            onChangeText={setNovoRecado}
          />
          
          <TouchableOpacity style={styles.recadosButton} onPress={adicionarRecado}>
            <Text style={styles.recadosButtonText}>Adicionar Recado</Text>
          </TouchableOpacity>

          {/* Lista de Recados */}
          <View style={styles.recadosList}>
            {recados.length === 0 ? (
              <Text style={styles.recadosVazio}>Nenhum recado ainda hoje.</Text>
            ) : (
              recados.map((recado) => (
                <View key={recado.id} style={styles.recadoItem}>
                  <View style={styles.recadoTextoContainer}>
                    <Text style={styles.recadoTexto}>• {recado.texto}</Text>
                    <Text style={styles.recadoHora}>{recado.hora}</Text>
                  </View>
                  <TouchableOpacity onPress={() => removerRecado(recado.id)}>
                    <Text style={styles.recadoExcluir}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>

        </View>

      </ScrollView>
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
      web: { boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)' }
    }),
  },

  buttonShadow: {
    ...Platform.select({
      ios: { shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 6 },
      android: { elevation: 6 },
      web: { boxShadow: '0px 6px 15px rgba(0, 102, 255, 0.25)' }
    }),
  },

  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A' },
  dateText: { fontSize: 14, color: '#666', marginBottom: 25 },
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

  // Estilos atualizados dos Recados
  recadosCard: { padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0' },
  recadosTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  
  recadosInput: {
    borderWidth: 1,
    borderColor: '#EAEAEA',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    fontSize: 14,
    backgroundColor: '#FAFAFA'
  },
  
  recadosButton: { backgroundColor: '#0066FF', paddingVertical: 12, borderRadius: 30, alignItems: 'center', marginBottom: 20 },
  recadosButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  
  recadosList: { marginTop: 5 },
  recadosVazio: { fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center' },
  
  recadoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5'
  },
  recadoTextoContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 10 },
  recadoTexto: { fontSize: 14, color: '#333', flex: 1 },
  recadoHora: { fontSize: 12, color: '#999', marginLeft: 10 },
  recadoExcluir: { fontSize: 16 }
});