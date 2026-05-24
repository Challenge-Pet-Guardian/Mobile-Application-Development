import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { STORAGE_KEYS } from '../../constants/Keys';
import { StatCard } from '../../components/StatCard';
import { ProfileEditSchema } from '../../utils/schemas';
import { z } from 'zod';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function UserProfileScreen({ navigation }: any) {
  const [nome, setNome] = useState('Carregando...');
  const [email, setEmail] = useState('');
  const [emFamilia, setEmFamilia] = useState(false);
  const [xp, setXp] = useState(0); 
  const [streak, setStreak] = useState(0); 
  const [meuRank, setMeuRank] = useState('---');

  const [janelaAberta, setJanelaAberta] = useState<'nenhum' | 'editar' | 'faq' | 'contato'>('nenhum');
  
  // Consolidação de estados locais em objetos estruturados
  const [editForm, setEditForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const [editErros, setEditErros] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const [msgContato, setMsgContato] = useState('');

  // Atualização genérica de inputs e limpeza automática de erros
  const handleEditChange = useCallback((campo: keyof typeof editForm, valor: string) => {
    setEditForm(prev => ({ ...prev, [campo]: valor }));
    setEditErros(prev => ({ ...prev, [campo]: '' }));
  }, []);

  // Busca e processamento dos dados do usuário
  const carregarUsuario = useCallback(async () => {
    try {
      let nomeUsuario = 'Usuário';
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        nomeUsuario = userData.nome || 'Usuário';
        setNome(nomeUsuario);
        setEmail(userData.email || '');
        setEditForm({
          nome: userData.nome || '',
          email: userData.email || '',
          senha: userData.senha || '',
          confirmarSenha: userData.senha || ''
        });
      }

      const FamiliaAtiva = await AsyncStorage.getItem(STORAGE_KEYS.FAMILIA_ATIVA);
      setEmFamilia(FamiliaAtiva === 'sim');

      const ofensivaSalva = await AsyncStorage.getItem(STORAGE_KEYS.OFENSIVA_DIAS);
      if (ofensivaSalva) setStreak(Number(ofensivaSalva));

      const cuidadoresString = await AsyncStorage.getItem(STORAGE_KEYS.CUIDADORES);
      if (cuidadoresString && FamiliaAtiva === 'sim') {
        const listaCuidadores = JSON.parse(cuidadoresString);
        
        const meuPerfil = listaCuidadores.find((c: any) => c.nome.replace(' (Você)', '').trim() === nomeUsuario.trim());
        if (meuPerfil) {
          setXp(meuPerfil.xp || 0); 
        }

        const listaOrdenada = [...listaCuidadores].sort((a: any, b: any) => {
            const xpA = a.xp || 0;
            const xpB = b.xp || 0;
            if (xpB !== xpA) return xpB - xpA;
            return Number(a.id) - Number(b.id);
        });
        
        const posicao = listaOrdenada.findIndex((c: any) => c.nome.replace(' (Você)', '').trim() === nomeUsuario.trim());
        
        if (posicao !== -1) {
          setMeuRank(`${posicao + 1}º`);
        } else {
          setMeuRank('---');
        }
      } else {
        setMeuRank('---');
        setXp(0);
      }

    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarUsuario();
    });
    return unsubscribe;
  }, [navigation, carregarUsuario]);

  // Handler de logout memoizado
  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LOGADO);
      navigation.replace('Welcome');
    } catch (error) {
      console.error(error);
    }
  }, [navigation]);

  // Fechamento de modal e limpeza de erros
  const handleFecharModal = useCallback(() => {
    setJanelaAberta('nenhum');
    setEditErros({ nome: '', email: '', senha: '', confirmarSenha: '' });
    setMsgContato('');
  }, []);

  // Salvar edições do perfil memoizado
  const salvarEdicao = useCallback(async () => {
    setEditErros({ nome: '', email: '', senha: '', confirmarSenha: '' });

    try {
      ProfileEditSchema.parse({ 
        nome: editForm.nome.trim(), 
        email: editForm.email.trim(), 
        senha: editForm.senha, 
        confirmarSenha: editForm.confirmarSenha 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const novosErros = { nome: '', email: '', senha: '', confirmarSenha: '' };
        error.issues.forEach((err) => {
          const field = err.path[0] as keyof typeof novosErros;
          if (field) {
            novosErros[field] = err.message;
          }
        });
        setEditErros(novosErros);
      }
      return;
    }
    
    try {
      const nomeAntigo = nome.trim();
      const nomeNovo = editForm.nome.trim();
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const userData = userDataString ? JSON.parse(userDataString) : {};
      const novosDados = { ...userData, nome: nomeNovo, email: editForm.email.trim(), senha: editForm.senha };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(novosDados));
      
      const cuidadoresString = await AsyncStorage.getItem(STORAGE_KEYS.CUIDADORES);
      if (cuidadoresString) {
        let listaCuidadores = JSON.parse(cuidadoresString);
        listaCuidadores = listaCuidadores.map((c: any) => {
          const nomeNaLista = c.nome.replace(' (Você)', '').trim();
          if (nomeNaLista === nomeAntigo) return { ...c, nome: nomeNovo };
          return c;
        });
        await AsyncStorage.setItem(STORAGE_KEYS.CUIDADORES, JSON.stringify(listaCuidadores));
      }

      const recadosString = await AsyncStorage.getItem(STORAGE_KEYS.RECADOS);
      if (recadosString) {
        let listaRecados = JSON.parse(recadosString);
        listaRecados = listaRecados.map((r: any) => {
          if (r.autor.trim() === nomeAntigo) return { ...r, autor: nomeNovo };
          return r;
        });
        await AsyncStorage.setItem(STORAGE_KEYS.RECADOS, JSON.stringify(listaRecados));
      }
      
      setNome(nomeNovo);
      setEmail(editForm.email);
      showAlert('Sucesso', 'Perfil atualizado!');
      setJanelaAberta('nenhum');
    } catch (error) {
      showAlert('Erro', 'Não foi possível salvar.');
    }
  }, [nome, editForm]);

  // Enviar feedback de contato memoizado
  const enviarContato = useCallback(() => {
    if (!msgContato.trim()) {
      showAlert('Aviso', 'Escreva uma mensagem antes de enviar.');
      return;
    }
    showAlert('Mensagem Enviada!', 'A equipe entrará em contato em breve.');
    setMsgContato('');
    setJanelaAberta('nenhum');
  }, [msgContato]);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 130 }} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBg} />
        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarIconWrapper}><Ionicons name="person" size={50} color="#FFF" /></View>
            <TouchableOpacity style={styles.editBadge} onPress={() => setJanelaAberta('editar')}>
              <MaterialCommunityIcons name="pencil" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{nome}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="fire" label="Ofensiva" value={emFamilia ? `${streak} dias` : '0 dias'} color={emFamilia ? "#FF9600" : "#A0AEC0"} />
          <StatCard icon="star" label="Meu XP" value={emFamilia ? xp : '0'} color={emFamilia ? "#1CB0F6" : "#A0AEC0"} />
          <StatCard icon="medal" label="Ranking" value={emFamilia ? meuRank : "---"} color={emFamilia ? "#58CC02" : "#A0AEC0"} />
        </View>

        {!emFamilia && (
          <Text style={styles.avisoSemFamilia}>Entre ou crie uma família para começar a ganhar pontos!</Text>
        )}

        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Conta</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => setJanelaAberta('editar')}>
            <View style={styles.menuIconWrapper}><Ionicons name="person-outline" size={22} color="#0066FF" /></View>
            <Text style={styles.menuText}>Gerenciar Perfil & Segurança</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setJanelaAberta('faq')}>
            <View style={styles.menuIconWrapper}><Ionicons name="help-buoy-outline" size={22} color="#0066FF" /></View>
            <Text style={styles.menuText}>Perguntas Frequentes</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={() => setJanelaAberta('contato')}>
            <View style={styles.menuIconWrapper}><Ionicons name="chatbubbles-outline" size={22} color="#0066FF" /></View>
            <Text style={styles.menuText}>Contato / Suporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]} onPress={handleLogout}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FFF5F5' }]}><Ionicons name="log-out-outline" size={22} color="#E53E3E" /></View>
            <Text style={[styles.menuText, { color: '#E53E3E' }]} >Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {janelaAberta === 'editar' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciar Perfil</Text>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Nome Completo</Text>
              <TextInput style={[styles.modalInput, editErros.nome !== '' ? styles.inputErro : null]} value={editForm.nome} onChangeText={(t) => handleEditChange('nome', t)} />
              {editErros.nome !== '' && <Text style={styles.erroTexto}>{editErros.nome}</Text>}

              <Text style={styles.inputLabel}>E-mail</Text>
              <TextInput style={[styles.modalInput, editErros.email !== '' ? styles.inputErro : null]} value={editForm.email} onChangeText={(t) => handleEditChange('email', t)} keyboardType="email-address" autoCapitalize="none" />
              {editErros.email !== '' && <Text style={styles.erroTexto}>{editErros.email}</Text>}

              <Text style={styles.inputLabel}>Senha</Text>
              <TextInput style={[styles.modalInput, editErros.senha !== '' ? styles.inputErro : null]} value={editForm.senha} onChangeText={(t) => handleEditChange('senha', t)} secureTextEntry />
              {editErros.senha !== '' && <Text style={styles.erroTexto}>{editErros.senha}</Text>}

              <Text style={styles.inputLabel}>Confirmar Senha</Text>
              <TextInput style={[styles.modalInput, editErros.confirmarSenha !== '' ? styles.inputErro : null]} value={editForm.confirmarSenha} onChangeText={(t) => handleEditChange('confirmarSenha', t)} secureTextEntry />
              {editErros.confirmarSenha !== '' && <Text style={styles.erroTexto}>{editErros.confirmarSenha}</Text>}

              <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarEdicao}>
                <Text style={styles.modalBtnSalvarText}>Salvar Alterações</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}

      {janelaAberta === 'faq' && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="help-buoy" size={24} color="#0066FF" style={{marginRight: 8}} />
                <Text style={styles.modalTitle}>Dúvidas Frequentes</Text>
              </View>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
              
              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="people-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Como convidar familiares?</Text>
                </View>
                <Text style={styles.faqAnswer}>Na aba "Family Pet", clique em "Convidar Familiar" para gerar um código seguro. Compartilhe este código para eles entrarem na sua família e cuidarem do pet juntos.</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="checkmark-done-circle-outline" size={22} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Se eu fizer uma tarefa, os outros veem?</Text>
                </View>
                <Text style={styles.faqAnswer}>Sim! A rotina do animal é sincronizada. Se você marcar que já deu a ração, todos os outros tutores saberão que o pet já foi alimentado, evitando dose dupla.</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="trophy-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Como funciona o Ranking e o XP?</Text>
                </View>
                <Text style={styles.faqAnswer}>Cada vez que você completa uma tarefa na Home, você ganha XP. O Ranking mostra a sua posição dentro da família. Quem cuidar mais do pet, fica em primeiro lugar!</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="paw-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Posso ter mais de um pet na família?</Text>
                </View>
                <Text style={styles.faqAnswer}>Com certeza! Vá até a tela "Meu Pet", deslize os avatares dos animais para o lado e clique no botão tracejado "Novo" para adicionar outro bichinho à família.</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="flame-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>O que significa o foguinho de Ofensiva?</Text>
                </View>
                <Text style={styles.faqAnswer}>É o seu combo de dias seguidos cuidando do pet! Conclua pelo menos uma tarefa principal por dia na Home para manter a chama acesa e não perder a sua ofensiva.</Text>
              </View>

            </ScrollView>
          </View>
        </View>
      )}

      {janelaAberta === 'contato' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suporte Técnico</Text>
              <TouchableOpacity onPress={handleFecharModal} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.contatoDesc}>Encontrou um problema? Envie sua mensagem para nossa equipe de desenvolvimento.</Text>
              <TextInput style={[styles.modalInput, { height: 160, textAlignVertical: 'top', paddingTop: 16 }]} placeholder="Descreva aqui o que precisa..." placeholderTextColor="#A0AEC0" value={msgContato} onChangeText={setMsgContato} multiline />
              <TouchableOpacity style={styles.modalBtnSalvar} onPress={enviarContato}>
                <Ionicons name="paper-plane-outline" size={20} color="#FFF" style={{marginRight: 8}} />
                <Text style={styles.modalBtnSalvarText}>Enviar Feedback</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  headerBg: { height: 120, backgroundColor: '#0A1628', width: '100%' },
  profileInfo: { alignItems: 'center', marginTop: -50 },
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F8FAFC', backgroundColor: '#E2E8F0', elevation: 4 },
  avatarIconWrapper: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#A0AEC0', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0066FF', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#F8FAFC' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1A202C', marginTop: 15 },
  userEmail: { fontSize: 15, color: '#718096', marginTop: 4 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 25 },
  avisoSemFamilia: { textAlign: 'center', color: '#718096', fontSize: 13, marginTop: 15, paddingHorizontal: 40 },
  menuContainer: { marginTop: 35, paddingHorizontal: 20 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginBottom: 15, marginLeft: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 16, marginBottom: 12, elevation: 1 },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#2D3748', fontWeight: '600' },
  modalOverlay: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(10, 22, 40, 0.6)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 10, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  closeBtn: { padding: 4, backgroundColor: '#F7FAFC', borderRadius: 20 },
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  modalInput: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, marginBottom: 18, fontSize: 16, color: '#2D3748' },
  inputErro: { borderColor: '#E53E3E', borderWidth: 1.5, backgroundColor: '#FFF5F5' },
  erroTexto: { color: '#E53E3E', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 8, fontWeight: '500' },
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 5, flexDirection: 'row', justifyContent: 'center' },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  faqCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EDF2F7' },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  faqQuestion: { fontWeight: 'bold', color: '#1A202C', fontSize: 16, marginLeft: 8, flex: 1 },
  faqAnswer: { color: '#4A5568', fontSize: 14, lineHeight: 22 },
  contatoDesc: { color: '#718096', marginBottom: 20, fontSize: 15, lineHeight: 22 },
});