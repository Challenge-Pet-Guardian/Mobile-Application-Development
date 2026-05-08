import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, 
  TextInput, KeyboardAvoidingView, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { STORAGE_USER_DATA, STORAGE_LOGADO, STORAGE_CUIDADORES, STORAGE_RECADOS } from '../../constants/Keys';

export default function UserProfileScreen({ navigation }: any) {
  // Dados principais de exibição
  const [nome, setNome] = useState('Carregando...');
  const [email, setEmail] = useState('');
  
  // Controle de estado da Matilha
  const [emMatilha, setEmMatilha] = useState(false);
  
  // Dados de Gamificação
  const [xp, setXp] = useState(1250); 
  const [streak, setStreak] = useState(12); 

  // Controle das janelas (Simulando Modais com View Condicional)
  const [modalAtivo, setModalAtivo] = useState<'nenhum' | 'editar' | 'faq' | 'contato'>('nenhum');

  // Estados temporários
  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSenha, setEditSenha] = useState('');
  const [msgContato, setMsgContato] = useState('');

  // Toda vez que a tela abrir, ele roda essa função para buscar os dados frescos
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarUsuario();
    });
    return unsubscribe;
  }, [navigation]);

  const carregarUsuario = async () => {
    try {
      // 1. Carrega os dados do Usuário
      const userDataString = await AsyncStorage.getItem(STORAGE_USER_DATA);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setNome(userData.nome);
        setEmail(userData.email);
        setEditNome(userData.nome);
        setEditEmail(userData.email);
        setEditSenha(userData.senha || '');
      }

      // 2. Verifica se está numa Matilha para arrumar os cards de Gamificação!
      const matilhaAtiva = await AsyncStorage.getItem('@PetGuardian_MatilhaAtiva');
      setEmMatilha(matilhaAtiva === 'sim');

    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_LOGADO);
      navigation.replace('Welcome');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const salvarEdicao = async () => {
    if (!editNome || !editEmail || !editSenha) {
      Alert.alert('Aviso', 'Por favor, preencha o nome, e-mail e senha.');
      return;
    }
    
    try {
      const nomeAntigo = nome.trim();
      const nomeNovo = editNome.trim();

      // Atualizamos o Perfil Principal
      const userDataString = await AsyncStorage.getItem(STORAGE_USER_DATA);
      const userData = userDataString ? JSON.parse(userDataString) : {};
      const novosDados = { ...userData, nome: nomeNovo, email: editEmail.trim(), senha: editSenha };
      await AsyncStorage.setItem(STORAGE_USER_DATA, JSON.stringify(novosDados));
      
      // SINCRONIZAÇÃO DA MATILHA
      const cuidadoresString = await AsyncStorage.getItem(STORAGE_CUIDADORES);
      if (cuidadoresString) {
        let listaCuidadores = JSON.parse(cuidadoresString);
        listaCuidadores = listaCuidadores.map((c: any) => {
          const nomeNaLista = c.nome.replace(' (Você)', '').trim();
          if (nomeNaLista === nomeAntigo) {
            return { ...c, nome: nomeNovo };
          }
          return c;
        });
        await AsyncStorage.setItem(STORAGE_CUIDADORES, JSON.stringify(listaCuidadores));
      }

      // SINCRONIZAÇÃO DO MURAL
      const recadosString = await AsyncStorage.getItem(STORAGE_RECADOS);
      if (recadosString) {
        let listaRecados = JSON.parse(recadosString);
        listaRecados = listaRecados.map((r: any) => {
          if (r.autor.trim() === nomeAntigo) {
            return { ...r, autor: nomeNovo };
          }
          return r;
        });
        await AsyncStorage.setItem(STORAGE_RECADOS, JSON.stringify(listaRecados));
      }
      
      setNome(nomeNovo);
      setEmail(editEmail);
      Alert.alert('Sucesso', 'Perfil atualizado com segurança!');
      setModalAtivo('nenhum');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
    }
  };

  const enviarContato = () => {
    if (!msgContato) {
      Alert.alert('Aviso', 'Escreva uma mensagem antes de enviar.');
      return;
    }
    Alert.alert('Mensagem Enviada!', 'A equipe do PetGuardian entrará em contato em breve.');
    setMsgContato('');
    setModalAtivo('nenhum');
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={styles.statCard}>
      <View style={[styles.statIconCircle, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.statValue, { color: color === '#A0AEC0' ? '#A0AEC0' : '#1A202C' }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        <View style={styles.headerBg} />

        <View style={styles.profileInfo}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarIconWrapper}>
               <Ionicons name="person" size={50} color="#FFF" />
            </View>
            <TouchableOpacity style={styles.editBadge} onPress={() => setModalAtivo('editar')}>
              <MaterialCommunityIcons name="pencil" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{nome}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        {/* Lógica Condicional: Se não estiver em matilha, zera os stats e avisa o usuário! */}
        <View style={styles.statsRow}>
          <StatCard 
            icon="fire" 
            label="Ofensiva" 
            value={emMatilha ? `${streak} dias` : '0 dias'} 
            color={emMatilha ? "#FF9600" : "#A0AEC0"} 
          />
          <StatCard 
            icon="star" 
            label="XP Total" 
            value={emMatilha ? xp : '0'} 
            color={emMatilha ? "#1CB0F6" : "#A0AEC0"} 
          />
          <StatCard 
            icon="medal" 
            label="Ranking" 
            value={emMatilha ? "Top 5" : "---"} 
            color={emMatilha ? "#58CC02" : "#A0AEC0"} 
          />
        </View>

        {!emMatilha && (
          <Text style={styles.avisoSemMatilha}>
            Entre ou crie uma matilha para começar a ganhar pontos de experiência!
          </Text>
        )}

        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Conta</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setModalAtivo('editar')}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="person-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Gerenciar Perfil & Segurança</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => setModalAtivo('faq')}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="help-buoy-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Perguntas Frequentes</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => setModalAtivo('contato')}>
            <View style={styles.menuIconWrapper}>
              <Ionicons name="chatbubbles-outline" size={22} color="#0066FF" />
            </View>
            <Text style={styles.menuText}>Contato / Suporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { marginTop: 20 }]} onPress={handleLogout}>
            <View style={[styles.menuIconWrapper, { backgroundColor: '#FFF5F5' }]}>
              <Ionicons name="log-out-outline" size={22} color="#E53E3E" />
            </View>
            <Text style={[styles.menuText, { color: '#E53E3E' }]}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* ========================================== */}
      {/* MODAL 1 (VIEW ABSOLUTA): EDITAR PERFIL */}
      {/* ========================================== */}
      {modalAtivo === 'editar' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Gerenciar Perfil</Text>
              <TouchableOpacity onPress={() => setModalAtivo('nenhum')} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <TextInput style={styles.modalInput} value={editNome} onChangeText={setEditNome} />

            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput style={styles.modalInput} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" autoCapitalize="none" />

            <Text style={styles.inputLabel}>Confirmar Senha</Text>
            <TextInput style={styles.modalInput} value={editSenha} onChangeText={setEditSenha} secureTextEntry />

            <TouchableOpacity style={styles.modalBtnSalvar} onPress={salvarEdicao}>
              <Text style={styles.modalBtnSalvarText}>Salvar Alterações</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {/* ========================================== */}
      {/* MODAL 2 (VIEW ABSOLUTA): PERGUNTAS FREQUENTES (FAQ) */}
      {/* ========================================== */}
      {modalAtivo === 'faq' && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '85%' }]}>
            
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="help-buoy" size={24} color="#0066FF" style={{marginRight: 8}} />
                <Text style={styles.modalTitle}>Dúvidas Frequentes</Text>
              </View>
              <TouchableOpacity onPress={() => setModalAtivo('nenhum')} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="people-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Como convidar familiares?</Text>
                </View>
                <Text style={styles.faqAnswer}>No separador "Family Pet", clique em "Convidar Familiar" para gerar um código seguro. Compartilhe este código para eles entrarem na sua matilha e dividirem os cuidados.</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="checkmark-done-circle-outline" size={22} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Se eu fizer uma tarefa, os outros veem?</Text>
                </View>
                <Text style={styles.faqAnswer}>Sim! A rotina é sincronizada. Se marcar que já deu a medicação ou ração, os restantes tutores saberão que o pet já foi cuidado e evitam dar a dose repetida.</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="star-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>Como funciona o ganho de XP?</Text>
                </View>
                <Text style={styles.faqAnswer}>Sempre que conclui uma tarefa agendada para o seu pet (como passeios ou higiene), ganha pontos de Experiência (XP). Quem tiver mais XP lidera o Ranking da casa!</Text>
              </View>

              <View style={styles.faqCard}>
                <View style={styles.faqQuestionRow}>
                  <Ionicons name="flame-outline" size={20} color="#0066FF" />
                  <Text style={styles.faqQuestion}>O que é a Ofensiva de dias?</Text>
                </View>
                <Text style={styles.faqAnswer}>A Ofensiva (ou Streak) mostra quantos dias seguidos a sua matilha cuidou de todas as tarefas obrigatórias sem falhar nenhuma. Mantenha a chama acesa!</Text>
              </View>
            </ScrollView>
          </View>
        </View>
      )}

      {/* ========================================== */}
      {/* MODAL 3 (VIEW ABSOLUTA): CONTATO / SUPORTE */}
      {/* ========================================== */}
      {modalAtivo === 'contato' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Suporte Técnico</Text>
              <TouchableOpacity onPress={() => setModalAtivo('nenhum')} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#718096" />
              </TouchableOpacity>
            </View>

            <Text style={styles.contatoDesc}>Encontrou um problema ou tem uma sugestão? Envie a sua mensagem diretamente para a nossa equipe de desenvolvimento.</Text>
            
            <TextInput 
              style={[styles.modalInput, { height: 140, textAlignVertical: 'top' }]}
              placeholder="Descreva aqui o que precisa..."
              placeholderTextColor="#A0AEC0"
              value={msgContato}
              onChangeText={setMsgContato}
              multiline
            />

            <TouchableOpacity style={styles.modalBtnSalvar} onPress={enviarContato}>
              <Ionicons name="paper-plane-outline" size={20} color="#FFF" style={{marginRight: 8}} />
              <Text style={styles.modalBtnSalvarText}>Enviar Feedback</Text>
            </TouchableOpacity>
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
  avatarContainer: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: '#F8FAFC', backgroundColor: '#E2E8F0', elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8 },
  avatarIconWrapper: { width: '100%', height: '100%', borderRadius: 50, backgroundColor: '#A0AEC0', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#0066FF', width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#F8FAFC' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#1A202C', marginTop: 15 },
  userEmail: { fontSize: 15, color: '#718096', marginTop: 4 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 25 },
  statCard: { flex: 1, backgroundColor: '#FFF', marginHorizontal: 5, padding: 15, borderRadius: 20, alignItems: 'center', elevation: 2, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10 },
  statIconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  
  avisoSemMatilha: { textAlign: 'center', color: '#718096', fontSize: 13, marginTop: 15, paddingHorizontal: 40 },

  menuContainer: { marginTop: 35, paddingHorizontal: 20 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginBottom: 15, marginLeft: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 16, marginBottom: 12, elevation: 1, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5 },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#2D3748', fontWeight: '600' },
  
  // Transformando a View num Modal perfeito
  modalOverlay: { 
    ...StyleSheet.absoluteFillObject, 
    backgroundColor: 'rgba(10, 22, 40, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    zIndex: 1000 
  },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 10, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  closeBtn: { padding: 4, backgroundColor: '#F7FAFC', borderRadius: 20 },
  
  inputLabel: { fontSize: 14, fontWeight: '700', color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  modalInput: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, marginBottom: 18, fontSize: 16, color: '#2D3748' },
  
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 5, flexDirection: 'row', justifyContent: 'center' },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  
  faqCard: { backgroundColor: '#F8FAFC', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EDF2F7' },
  faqQuestionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  faqQuestion: { fontWeight: 'bold', color: '#1A202C', fontSize: 16, marginLeft: 8, flex: 1 },
  faqAnswer: { color: '#4A5568', fontSize: 14, lineHeight: 22 },
  contatoDesc: { color: '#718096', marginBottom: 20, fontSize: 15, lineHeight: 22 },
});