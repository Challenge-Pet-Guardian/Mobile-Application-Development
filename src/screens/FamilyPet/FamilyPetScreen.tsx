import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, KeyboardAvoidingView, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'; 

import { STORAGE_KEYS } from '../../constants/Keys';
import { Header } from '../../components/Header';
import { Pet, Cuidador, Recado } from '../../types/models';
import { AVATARES_DISPONIVEIS, getAvatarById } from '../../constants/Avatares';

type Props = { navigation: NativeStackNavigationProp<any>; };

// Helpers externos para evitar recriação em renderização
const getInitials = (name: string) => { 
  if (!name) return '??'; 
  return name.replace(' (Você)', '').substring(0, 2).toUpperCase(); 
};

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function FamilyPetScreen({ navigation }: Props) {
  const [temFamilia, setTemFamilia] = useState(false);
  const [fluxoAberto, setFluxoAberto] = useState<'nenhum' | 'criando' | 'entrando'>('nenhum');
  const [nomeFamilia, setNomeFamilia] = useState('');
  const [codigoConvite, setCodigoConvite] = useState('');
  const [minhaFuncao, setMinhaFuncao] = useState('');
  
  const [codigoFamiliaAtiva, setCodigoFamiliaAtiva] = useState('');
  const [nomeDaFamiliaAtual, setNomeDaFamiliaAtual] = useState('Family Pet'); 

  const [cuidadores, setCuidadores] = useState<Cuidador[]>([]);
  const [recados, setRecados] = useState<Recado[]>([]);
  const [petsDaFamilia, setPetsDaFamilia] = useState<Pet[]>([]); 

  const [novoRecado, setNovoRecado] = useState('');
  const [usuarioLogado, setUsuarioLogado] = useState('Tutor');
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [caixaConviteVisivel, setCaixaConviteVisivel] = useState(false);

  const [modalNomeAberto, setModalNomeAberto] = useState(false);
  const [inputNovoNome, setInputNovoNome] = useState('');

  // Carregamento de dados com useCallback
  const carregarDados = useCallback(async () => {
    try {
      let nomeUsuarioAtual = 'Tutor';
      const dadosConta = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (dadosConta) {
        const conta = JSON.parse(dadosConta);
        if (conta.nome) { 
          nomeUsuarioAtual = conta.nome; 
          setUsuarioLogado(conta.nome); 
        }
      }

      const nomeSalvo = await AsyncStorage.getItem(STORAGE_KEYS.NOME_FAMILIA);
      if (nomeSalvo) setNomeDaFamiliaAtual(nomeSalvo);

      const petsSalvos = await AsyncStorage.getItem(STORAGE_KEYS.LISTA_PETS);
      if (petsSalvos) setPetsDaFamilia(JSON.parse(petsSalvos));

      let listaCuidadores: Cuidador[] = [];
      const dadosCuidadores = await AsyncStorage.getItem(STORAGE_KEYS.CUIDADORES);
      if (dadosCuidadores) { 
        listaCuidadores = JSON.parse(dadosCuidadores); 
        setCuidadores(listaCuidadores); 
      }

      const dadosRecados = await AsyncStorage.getItem(STORAGE_KEYS.RECADOS);
      if (dadosRecados) setRecados(JSON.parse(dadosRecados));

      let FamiliaSalva = await AsyncStorage.getItem(STORAGE_KEYS.FAMILIA_ATIVA);
      const usuarioEstaNaLista = listaCuidadores.some(c => c.nome.replace(' (Você)', '').trim() === nomeUsuarioAtual.trim());

      if (usuarioEstaNaLista && FamiliaSalva !== 'sim') {
          await AsyncStorage.setItem(STORAGE_KEYS.FAMILIA_ATIVA, 'sim');
          FamiliaSalva = 'sim';
      } else if (!usuarioEstaNaLista && FamiliaSalva === 'sim') {
          await AsyncStorage.setItem(STORAGE_KEYS.FAMILIA_ATIVA, 'nao');
          FamiliaSalva = 'nao';
      }

      let codigoSalvo = await AsyncStorage.getItem(STORAGE_KEYS.CODIGO_FAMILIA);
      
      if (FamiliaSalva === 'sim' && !codigoSalvo) {
        codigoSalvo = `PET-${Math.floor(1000 + Math.random() * 9000)}`;
        await AsyncStorage.setItem(STORAGE_KEYS.CODIGO_FAMILIA, codigoSalvo);
      }

      if (codigoSalvo) setCodigoFamiliaAtiva(codigoSalvo);
      
      setTemFamilia(FamiliaSalva === 'sim' && usuarioEstaNaLista);
    } catch (error) { 
      console.log(error); 
    }
  }, []);

  useFocusEffect(useCallback(() => { 
    carregarDados(); 
  }, [carregarDados]));

  // Criação ou entrada de família com useCallback
  const finalizarAcaoFamilia = useCallback(async () => {
    if (fluxoAberto === 'criando' && nomeFamilia.trim() === '') return;
    if (fluxoAberto === 'entrando' && (codigoConvite.trim() === '' || minhaFuncao.trim() === '')) return;

    if (fluxoAberto === 'entrando') {
      const codigoRealDaFamilia = await AsyncStorage.getItem(STORAGE_KEYS.CODIGO_FAMILIA);
      if (codigoConvite.toUpperCase() !== codigoRealDaFamilia) {
        showAlert('Código Inválido 🚫', 'Não encontramos nenhuma família com esse código.');
        return; 
      }
    }

    let novaListaCuidadores = [...cuidadores];
    let nomeTratado = usuarioLogado.replace(' (Você)', '').trim();

    const jaEstaNaLista = novaListaCuidadores.some(c => c.nome.replace(' (Você)', '').trim() === nomeTratado);
    
    if (jaEstaNaLista && fluxoAberto === 'entrando') {
        showAlert('Aviso', 'Você já faz parte desta família!');
        setFluxoAberto('nenhum');
        setMinhaFuncao('');
        setCodigoConvite('');
        return; 
    }

    if (fluxoAberto === 'criando') {
      novaListaCuidadores = [];
      await AsyncStorage.setItem(STORAGE_KEYS.NOME_FAMILIA, nomeFamilia);
      setNomeDaFamiliaAtual(nomeFamilia);
      setRecados([]); 
      await AsyncStorage.removeItem(STORAGE_KEYS.RECADOS);
    }
    
    if (!jaEstaNaLista) {
      const pontosSalvos = await AsyncStorage.getItem(STORAGE_KEYS.PONTOS_XP);
      const xpAtual = pontosSalvos ? Number(pontosSalvos) : 0;

      const meuUsuario: Cuidador = { 
        id: Date.now().toString(), 
        nome: nomeTratado, 
        funcao: fluxoAberto === 'criando' ? 'Dono(a) da Família' : minhaFuncao,
        xp: xpAtual
      };
      novaListaCuidadores = [meuUsuario, ...novaListaCuidadores];
      setCuidadores(novaListaCuidadores);
      await AsyncStorage.setItem(STORAGE_KEYS.CUIDADORES, JSON.stringify(novaListaCuidadores));
    }

    if (fluxoAberto === 'criando') {
      const codigoFinal = `PET-${Math.floor(1000 + Math.random() * 9000)}`;
      await AsyncStorage.setItem(STORAGE_KEYS.CODIGO_FAMILIA, codigoFinal);
      setCodigoFamiliaAtiva(codigoFinal);
    } else {
      setCodigoFamiliaAtiva(codigoConvite.toUpperCase());
    }

    await AsyncStorage.setItem(STORAGE_KEYS.FAMILIA_ATIVA, 'sim');
    setTemFamilia(true); 
    setFluxoAberto('nenhum'); 
    setMinhaFuncao(''); 
    setCodigoConvite(''); 
    setNomeFamilia('');
  }, [fluxoAberto, nomeFamilia, codigoConvite, minhaFuncao, cuidadores, usuarioLogado]);

  // Sair da família com useCallback
  const sairFamilia = useCallback(async () => {
    const novaLista = cuidadores.filter(c => c.nome.replace(' (Você)', '') !== usuarioLogado);
    setCuidadores(novaLista);
    await AsyncStorage.setItem(STORAGE_KEYS.CUIDADORES, JSON.stringify(novaLista));
    await AsyncStorage.removeItem(STORAGE_KEYS.FAMILIA_ATIVA);
    await AsyncStorage.removeItem(STORAGE_KEYS.CODIGO_FAMILIA);
    if (novaLista.length === 0) { 
      await AsyncStorage.removeItem(STORAGE_KEYS.RECADOS); 
      setRecados([]); 
    }
    setTemFamilia(false);
  }, [cuidadores, usuarioLogado]);

  // Remover cuidador com useCallback
  const removerCuidador = useCallback(async (id: string) => {
    const novaLista = cuidadores.filter((c) => c.id !== id);
    setCuidadores(novaLista);
    await AsyncStorage.setItem(STORAGE_KEYS.CUIDADORES, JSON.stringify(novaLista));
  }, [cuidadores]);

  // Salvar ou editar recados com useCallback
  const salvarRecado = useCallback(async () => {
    if (novoRecado.trim() === '') return; 
    
    const dataHj = new Date();
    const horaStr = dataHj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dataStr = dataHj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const dataHoraFormatada = `${dataStr} às ${horaStr}`;

    let novaLista = [...recados];

    if (editandoId !== null) {
      novaLista = novaLista.map(r => r.id === editandoId ? { ...r, texto: novoRecado, hora: dataHoraFormatada + " (editado)" } : r);
      setEditandoId(null); 
    } else {
      novaLista = [{ id: Date.now().toString(), texto: novoRecado, hora: dataHoraFormatada, autor: usuarioLogado }, ...recados]; 
    }
    setRecados(novaLista); 
    setNovoRecado(''); 
    await AsyncStorage.setItem(STORAGE_KEYS.RECADOS, JSON.stringify(novaLista));
  }, [novoRecado, recados, editandoId, usuarioLogado]);

  // Prepara edição de recado
  const prepararEdicao = useCallback((recado: Recado) => { 
    setNovoRecado(recado.texto); 
    setEditandoId(recado.id); 
  }, []);

  // Remover recado
  const removerRecado = useCallback(async (id: string) => { 
    const novaLista = recados.filter(r => r.id !== id); 
    setRecados(novaLista); 
    await AsyncStorage.setItem(STORAGE_KEYS.RECADOS, JSON.stringify(novaLista)); 
  }, [recados]);

  // Alterar nome da família
  const alterarNomeFamilia = useCallback(async () => {
    if (inputNovoNome.trim() === '') return;
    await AsyncStorage.setItem(STORAGE_KEYS.NOME_FAMILIA, inputNovoNome);
    setNomeDaFamiliaAtual(inputNovoNome);
    setModalNomeAberto(false);
  }, [inputNovoNome]);

  // Verificação do papel de dono do usuário
  const meuPerfil = cuidadores.find(c => c.nome.replace(' (Você)', '') === usuarioLogado);
  const souDono = meuPerfil?.funcao === 'Dono(a) da Família';

  if (!temFamilia) {
    return (
      <View style={styles.container}>
        <View style={{ paddingTop: Platform.OS === 'ios' ? 50 : 30, paddingHorizontal: 20 }}>
            <Header title='Family Pet' />
        </View>
        
        <View style={{ flex: 1, justifyContent: 'center', padding: 30, gap: 15 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', textAlign: 'center', marginBottom: 4 }}>Você ainda não faz parte de uma família!</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 20 }}>Escolha uma opção para começar a cuidar do seu pet em grupo.</Text>

          <TouchableOpacity style={{ backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 15, alignItems: 'center' }} onPress={() => setFluxoAberto('criando')}>
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Criar Nova Família</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ borderWidth: 2, borderColor: '#0066FF', paddingVertical: 18, borderRadius: 15, alignItems: 'center' }} onPress={() => setFluxoAberto('entrando')}>
            <Text style={{ color: '#0066FF', fontWeight: 'bold', fontSize: 16 }}>Entrar com Código</Text>
          </TouchableOpacity>
        </View>

        {fluxoAberto !== 'nenhum' && (
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 }}>
            <View style={{ width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 10 }}>
              <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 }}>
                {fluxoAberto === 'criando' ? 'Nome da Família' : 'Entrar na Família'}
              </Text>
              
              <TextInput style={{ borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, backgroundColor: '#FAFAFA' }} placeholder={fluxoAberto === 'criando' ? "Ex: Casa do Carlos" : "Código de Convite (Ex: PET-777)"} placeholderTextColor="#999" value={fluxoAberto === 'criando' ? nomeFamilia : codigoConvite} onChangeText={fluxoAberto === 'criando' ? setNomeFamilia : setCodigoConvite} />

              {fluxoAberto === 'entrando' && (
                <TextInput style={{ borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, backgroundColor: '#FAFAFA' }} placeholder="Sua função (ex: Veterinário, Tio...)" placeholderTextColor="#999" value={minhaFuncao} onChangeText={setMinhaFuncao} />
              )}

              <TouchableOpacity style={{ backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 }} onPress={finalizarAcaoFamilia}>
                <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Confirmar</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setFluxoAberto('nenhum'); setMinhaFuncao(''); setCodigoConvite(''); setNomeFamilia(''); }}>
                <Text style={{ color: '#666', fontSize: 14, textAlign: 'center', textDecorationLine: 'underline' }}>Voltar</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={{ paddingTop: Platform.OS === 'ios' ? 30 : 10, paddingBottom: 10 }}>
            <Header title={nomeDaFamiliaAtual}/>
        </View>

        <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginBottom: 10 }}>Nossos Animais</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 25 }}>
          {petsDaFamilia.length === 0 ? (
            <Text style={{ color: '#999', fontStyle: 'italic' }}>Nenhum pet cadastrado no Perfil ainda.</Text>
          ) : (
            petsDaFamilia.map(pet => {
              const avatarImage = getAvatarById(pet.avatarId);
              return (
                <View key={pet.id} style={{ alignItems: 'center', marginRight: 15 }}>
                  <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#0066FF', overflow: 'hidden' }}>
                    {avatarImage ? (
                      <Image source={avatarImage} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <MaterialCommunityIcons name="paw" size={30} color="#0066FF" />
                    )}
                  </View>
                  <Text style={{ marginTop: 5, fontWeight: 'bold', color: '#333' }}>{pet.nome.split(' ')[0]}</Text>
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: '#1A1A1A' }}>Canto da Família</Text>
          {souDono && (
            <TouchableOpacity onPress={() => { setInputNovoNome(nomeDaFamiliaAtual); setModalNomeAberto(true); }} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="pencil" size={16} color="#0066FF" />
              <Text style={{ color: '#0066FF', fontWeight: 'bold', marginLeft: 4, fontSize: 14 }}>Renomear</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 20 }}>Lista de Cuidadores</Text>

        {cuidadores.map((c, index) => {
          const nomeLimpo = c.nome.replace(' (Você)', '');
          const isEuMesmo = nomeLimpo === usuarioLogado;
          return (
            <Animated.View key={c.id} entering={FadeInDown.delay(index * 100)} style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#FFF', elevation: 2 }}>
              <View style={{ width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 15 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 15, color: '#333' }}>{getInitials(nomeLimpo)}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 16, color: '#1A1A1A' }}>{isEuMesmo ? `${nomeLimpo} (Você)` : nomeLimpo}</Text>
                <Text style={{ fontSize: 13, color: '#666', marginTop: 2 }}>{c.funcao}</Text>
              </View>
              {souDono && !isEuMesmo && c.funcao !== 'Dono(a) da Família' && (
                <TouchableOpacity onPress={() => removerCuidador(c.id)} style={{ padding: 8 }}>
                  <Ionicons name="exit-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </Animated.View>
          );
        })}

        <TouchableOpacity style={{ backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 10, marginBottom: 35, elevation: 5 }} onPress={() => setCaixaConviteVisivel(true)}>
          <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>+ Convidar Familiar</Text>
        </TouchableOpacity>

        <View style={{ padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#F0F0F0', backgroundColor: '#FFF', elevation: 2 }}>
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 15 }}>Mural da Família:</Text>
          <TextInput style={{ borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 12, marginBottom: 12, fontSize: 14, backgroundColor: '#FAFAFA', minHeight: 60, textAlignVertical: 'top' }} placeholder="Digite aqui o que aconteceu..." placeholderTextColor="#999" value={novoRecado} onChangeText={setNovoRecado} multiline />
          <TouchableOpacity style={{ backgroundColor: '#0066FF', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginBottom: 10 }} onPress={salvarRecado}>
            <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 14 }}>{editandoId ? 'Atualizar Recado' : 'Adicionar Recado'}</Text>
          </TouchableOpacity>
          {editandoId && (
            <TouchableOpacity onPress={() => { setEditandoId(null); setNovoRecado(''); }}>
              <Text style={{ textAlign: 'center', color: '#666', marginBottom: 15, fontSize: 13, textDecorationLine: 'underline' }}>Cancelar Edição</Text>
            </TouchableOpacity>
          )}

          <View style={{ marginTop: 10 }}>
            {recados.length === 0 ? (
              <Text style={{ fontSize: 14, color: '#999', fontStyle: 'italic', textAlign: 'center' }}>Nenhum recado ainda hoje.</Text>
            ) : (
              recados.map((recado) => (
                <View key={recado.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0066FF', marginBottom: 2 }}>{recado.autor}</Text>
                    <Text style={{ fontSize: 14, color: '#333', lineHeight: 20 }}>{recado.texto}</Text>
                    <Text style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{recado.hora}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 10, paddingTop: 4 }}>
                    {recado.autor === usuarioLogado && (
                      <TouchableOpacity onPress={() => prepararEdicao(recado)} style={{ padding: 8 }}><Ionicons name="pencil" size={20} color="#666" /></TouchableOpacity>
                    )}
                    {(recado.autor === usuarioLogado || souDono) && (
                      <TouchableOpacity onPress={() => removerRecado(recado.id)} style={{ padding: 8 }}><Ionicons name="trash-outline" size={20} color="#FF3B30" /></TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <TouchableOpacity onPress={sairFamilia} style={{ marginTop: 30 }}>
           <Text style={{ textAlign: 'center', color: '#FF3B30', fontWeight: 'bold', fontSize: 14 }}>Sair da Família</Text>
        </TouchableOpacity>

      </ScrollView>

      {modalNomeAberto && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 }}>
          <View style={{ width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 10 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 }}>Renomear Família</Text>
            <TextInput style={{ borderWidth: 1, borderColor: '#EAEAEA', borderRadius: 12, padding: 16, marginBottom: 16, fontSize: 16, backgroundColor: '#FAFAFA' }} placeholder="Novo nome da família..." placeholderTextColor="#999" value={inputNovoNome} onChangeText={setInputNovoNome} />
            <TouchableOpacity style={{ backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 }} onPress={alterarNomeFamilia}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Salvar</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalNomeAberto(false)}>
              <Text style={{ color: '#666', fontSize: 14, textAlign: 'center', textDecorationLine: 'underline' }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {caixaConviteVisivel && (
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 }}>
          <View style={{ width: '100%', backgroundColor: '#FFF', borderRadius: 20, padding: 24, elevation: 10 }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 20 }}>Convite da Família</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20, color: '#666' }}>Compartilhe o código abaixo com seus familiares!</Text>
            <View style={{ backgroundColor: '#F0F8FF', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#0066FF', borderStyle: 'dashed' }}>
              <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0066FF', letterSpacing: 2 }}>{codigoFamiliaAtiva}</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 15 }} onPress={() => setCaixaConviteVisivel(false)}>
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' }
});