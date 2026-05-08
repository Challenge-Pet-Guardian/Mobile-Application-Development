import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons'; // <-- Importando os ícones profissionais!

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

type Cuidador = {
  id: string;
  nome: string;
  funcao: string;
};

export default function FamilyPetScreen({ navigation }: Props) {
  const [temMatilha, setTemMatilha] = useState(false);
  const [fluxoAberto, setFluxoAberto] = useState<'nenhum' | 'criando' | 'entrando'>('nenhum');
  const [nomeMatilha, setNomeMatilha] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [minhaFuncao, setMinhaFuncao] = useState('');
  const [codigoMatilhaAtiva, setCodigoMatilhaAtiva] = useState('');

  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [recados, setRecados] = useState<Recado[]>([]);
  const [novoRecado, setNovoRecado] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState('Tutor');
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const [modalConviteVisivel, setModalConviteVisivel] = useState(false);

  const carregarDados = async () => {
    try {
      let nomeUsuarioAtual = 'Tutor';
      const dadosConta = await AsyncStorage.getItem(STORAGE_USER_DATA);
      if (dadosConta) {
        const conta = JSON.parse(dadosConta);
        if (conta.nome) {
          nomeUsuarioAtual = conta.nome;
          setUsuarioLogado(conta.nome);
        }
      }

      let listaCuidadores: Cuidador[] = [];
      const dadosCuidadores = await AsyncStorage.getItem(STORAGE_CUIDADORES);
      if (dadosCuidadores) {
        listaCuidadores = JSON.parse(dadosCuidadores);
        setCuidadores(listaCuidadores);
      }

      const dadosRecados = await AsyncStorage.getItem(STORAGE_RECADOS);
      if (dadosRecados) setRecados(JSON.parse(dadosRecados));

      const matilhaSalva = await AsyncStorage.getItem('@PetGuardian_MatilhaAtiva');
      let codigoSalvo = await AsyncStorage.getItem('@PetGuardian_CodigoMatilha');
      
      if (matilhaSalva && !codigoSalvo) {
        codigoSalvo = `PET-${Math.floor(1000 + Math.random() * 9000)}`;
        await AsyncStorage.setItem('@PetGuardian_CodigoMatilha', codigoSalvo);
      }

      if (codigoSalvo) setCodigoMatilhaAtiva(codigoSalvo);
      
      const usuarioEstaNaLista = listaCuidadores.some(c => c.nome.replace(' (Você)', '') === nomeUsuarioAtual);

      if (matilhaSalva && usuarioEstaNaLista) {
        setTemMatilha(true);
      } else {
        setTemMatilha(false);
      }

    } catch (error) {
      console.log(error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const finalizarAcaoMatilha = async () => {
    if (fluxoAberto === 'criando' && nomeMatilha.trim() === '') return;
    if (fluxoAberto === 'entrando' && (codigoConvite.trim() === '' || minhaFuncao.trim() === '')) return;

    if (fluxoAberto === 'entrando') {
      const codigoRealDaMatilha = await AsyncStorage.getItem('@PetGuardian_CodigoMatilha');
      
      if (codigoConvite.toUpperCase() !== codigoRealDaMatilha) {
        Alert.alert(
          'Código Inválido 🚫', 
          'Não encontramos nenhuma matilha com esse código. Peça o código correto para o dono da matilha (Ex: PET-1234).'
        );
        return; 
      }
    }

    let nomeTratado = usuarioLogado.replace(' (Você)', '');
    const jaEstaNaLista = cuidadores.some(c => c.nome.replace(' (Você)', '') === nomeTratado);
    
    if (!jaEstaNaLista) {
      const meuUsuario: Cuidador = {
        id: Date.now().toString(),
        nome: nomeTratado,
        funcao: fluxoAberto === 'criando' ? 'Dono(a) da Matilha' : minhaFuncao
      };
      
      const novaLista = [meuUsuario, ...cuidadores];
      setCuidadores(novaLista);
      await AsyncStorage.setItem(STORAGE_CUIDADORES, JSON.stringify(novaLista));
    }

    let codigoFinal = '';
    if (fluxoAberto === 'criando') {
      const numeroAleatorio = Math.floor(1000 + Math.random() * 9000);
      codigoFinal = `PET-${numeroAleatorio}`;
      await AsyncStorage.setItem('@PetGuardian_CodigoMatilha', codigoFinal);
      setCodigoMatilhaAtiva(codigoFinal);
    } else {
      setCodigoMatilhaAtiva(codigoConvite.toUpperCase());
    }

    await AsyncStorage.setItem('@PetGuardian_MatilhaAtiva', 'sim');
    setTemMatilha(true);
    setFluxoAberto('nenhum');
    setMinhaFuncao('');
    setCodigoConvite('');
    setNomeMatilha('');
  };

  const sairMatilha = async () => {
    const novaLista = cuidadores.filter(c => c.nome.replace(' (Você)', '') !== usuarioLogado);
    setCuidadores(novaLista);
    await AsyncStorage.setItem(STORAGE_CUIDADORES, JSON.stringify(novaLista));

    await AsyncStorage.removeItem('@PetGuardian_MatilhaAtiva');
    await AsyncStorage.removeItem('@PetGuardian_CodigoMatilha');

    if (novaLista.length === 0) {
      await AsyncStorage.removeItem(STORAGE_RECADOS);
      setRecados([]);
    }

    setTemMatilha(false);
  };

  const removerCuidador = async (id: string) => {
    const novaLista = cuidadores.filter((c) => c.id !== id);
    setCuidadores(novaLista);
    await AsyncStorage.setItem(STORAGE_CUIDADORES, JSON.stringify(novaLista));
  };

  const salvarRecado = async () => {
    if (novoRecado.trim() === '') return; 

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
    const cleanName = name.replace(' (Você)', '');
    return cleanName.substring(0, 2).toUpperCase();
  };

  if (!temMatilha) {
    return (
      <View style={styles.mainContainer}>
        <Header title='Family Pet' />
        <View style={styles.choiceContainer}>
          <Text style={styles.sectionTitleCenter}>Você ainda não faz parte de uma matilha!</Text>
          <Text style={styles.subSectionTitleCenter}>Escolha uma opção para começar a cuidar do seu pet em grupo.</Text>

          <TouchableOpacity style={styles.addButton} onPress={() => setFluxoAberto('criando')}>
            <Text style={styles.addButtonText}>Criar Nova Matilha</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecundario} onPress={() => setFluxoAberto('entrando')}>
            <Text style={styles.btnSecundarioText}>Entrar com Código</Text>
          </TouchableOpacity>
        </View>

        {/* Substituição do Modal pelo View Condicional Absoluto */}
        {fluxoAberto !== 'nenhum' && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {fluxoAberto === 'criando' ? 'Nome da Matilha' : 'Entrar na Matilha'}
              </Text>
              
              <TextInput 
                style={styles.modalInput}
                placeholder={fluxoAberto === 'criando' ? "Ex: Casa do Carlos" : "Código de Convite (Ex: PET-777)"}
                placeholderTextColor="#999"
                value={fluxoAberto === 'criando' ? nomeMatilha : codigoConvite}
                onChangeText={fluxoAberto === 'criando' ? setNomeMatilha : setCodigoConvite}
              />

              {fluxoAberto === 'entrando' && (
                <TextInput 
                  style={styles.modalInput}
                  placeholder="Sua função (ex: Veterinário, Tio...)"
                  placeholderTextColor="#999"
                  value={minhaFuncao}
                  onChangeText={setMinhaFuncao}
                />
              )}

              <TouchableOpacity style={styles.modalBtnSalvar} onPress={finalizarAcaoMatilha}>
                <Text style={styles.modalBtnSalvarText}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setFluxoAberto('nenhum'); setMinhaFuncao(''); setCodigoConvite(''); setNomeMatilha(''); }}>
                <Text style={styles.modalBtnCancelarText}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    );
  }

  const meuPerfil = cuidadores.find(c => c.nome.replace(' (Você)', '') === usuarioLogado);
  const souDono = meuPerfil?.funcao === 'Dono(a) da Matilha';

  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        
        <Header title='Family Pet'/>

        <Text style={styles.sectionTitle}>Canto da Matilha</Text>
        <Text style={styles.subSectionTitle}>Lista de Cuidadores</Text>

        {cuidadores.map((c, index) => {
          const nomeLimpo = c.nome.replace(' (Você)', '');
          const isEuMesmo = nomeLimpo === usuarioLogado;
          const isDono = c.funcao === 'Dono(a) da Matilha';
          const nomeExibicao = isEuMesmo ? `${nomeLimpo} (Você)` : nomeLimpo;

          return (
            <Animated.View 
              key={c.id} 
              entering={FadeInDown.delay(index * 100)}
              style={[styles.card, styles.whiteShadow]}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(nomeLimpo)}</Text>
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardName}>{nomeExibicao}</Text>
                <Text style={styles.cardRole}>{c.funcao}</Text>
              </View>
              
              {souDono && !isEuMesmo && !isDono && (
                <TouchableOpacity onPress={() => removerCuidador(c.id)} style={styles.btnAcao}>
                  <Ionicons name="exit-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </Animated.View>
          );
        })}

        <TouchableOpacity
          style={[styles.addButton, styles.buttonShadow]}
          onPress={() => setModalConviteVisivel(true)}
        >
          <Text style={styles.addButtonText}>+ Convidar Familiar</Text>
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
                    {recado.autor === usuarioLogado && (
                      <TouchableOpacity onPress={() => prepararEdicao(recado)} style={styles.btnAcao}>
                         <Ionicons name="pencil" size={20} color="#666" />
                      </TouchableOpacity>
                    )}
                    
                    {(recado.autor === usuarioLogado || souDono) && (
                      <TouchableOpacity onPress={() => removerRecado(recado.id)} style={styles.btnAcao}>
                         <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <TouchableOpacity onPress={sairMatilha} style={{ marginTop: 30 }}>
           <Text style={styles.sairMatilhaText}>Sair da Matilha (Simulação)</Text>
        </TouchableOpacity>

      </ScrollView>

      {/* Substituição do Modal pelo View Condicional Absoluto */}
      {modalConviteVisivel && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Convite da Matilha</Text>
            
            <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>
              Compartilhe o código abaixo com seus familiares para eles entrarem no grupo!
            </Text>

            <View style={styles.codigoContainer}>
              <Text style={styles.codigoText}>{codigoMatilhaAtiva}</Text>
            </View>

            <TouchableOpacity style={styles.modalBtnSalvar} onPress={() => setModalConviteVisivel(false)}>
              <Text style={styles.modalBtnSalvarText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#FAFAFA' },
  contentContainer: { padding: 24, paddingBottom: 40 },
  choiceContainer: { flex: 1, justifyContent: 'center', padding: 30, gap: 15 },
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
  
  sectionTitleCenter: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 4, textAlign: 'center' },
  subSectionTitleCenter: { fontSize: 14, color: '#666', marginBottom: 20, textAlign: 'center' },

  card: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  avatar: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 15 },
  avatarText: { fontWeight: 'bold', fontSize: 15, color: '#333' },
  cardTextContainer: { flex: 1 },
  cardName: { fontWeight: 'bold', fontSize: 16, color: '#1A1A1A' },
  cardRole: { fontSize: 13, color: '#666', marginTop: 2 },
  addButton: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 35 },
  addButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  btnSecundario: { borderWidth: 2, borderColor: '#0066FF', paddingVertical: 18, borderRadius: 15, alignItems: 'center' },
  btnSecundarioText: { color: '#0066FF', fontWeight: 'bold', fontSize: 16 },
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
  
  // A mágica de simular o Modal com View Absoluta
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, backgroundColor: '#FAFAFA' },
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  modalBtnCancelarText: { color: '#666', fontSize: 14, textAlign: 'center', textDecorationLine: 'underline' },
  sairMatilhaText: { textAlign: 'center', color: '#FF3B30', fontWeight: 'bold', fontSize: 14 },
  codigoContainer: { backgroundColor: '#F0F8FF', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#0066FF', borderStyle: 'dashed' },
  codigoText: { fontSize: 24, fontWeight: 'bold', color: '#0066FF', letterSpacing: 2 }
});