import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, 
  TextInput, KeyboardAvoidingView, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { STORAGE_KEYS } from '../../constants/Keys';

export default function SupportScreen({ navigation }: any) {
  const [nome, setNome] = useState('A carregar...');
  const [email, setEmail] = useState('');
  const [emMatilha, setEmMatilha] = useState(false);
  const [xp, setXp] = useState(1250); 
  const [streak, setStreak] = useState(12); 

  const [modalAtivo, setModalAtivo] = useState<'nenhum' | 'editar' | 'faq' | 'contato'>('nenhum');

  const [editNome, setEditNome] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editSenha, setEditSenha] = useState('');
  const [msgContato, setMsgContato] = useState('');

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarUsuario();
    });
    return unsubscribe;
  }, [navigation]);

  const carregarUsuario = async () => {
    try {
   
      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setNome(userData.nome);
        setEmail(userData.email);
        setEditNome(userData.nome);
        setEditEmail(userData.email);
        setEditSenha(userData.senha || '');
      }

      const matilhaAtiva = await AsyncStorage.getItem('@PetGuardian_MatilhaAtiva');
      setEmMatilha(matilhaAtiva === 'sim');
    } catch (error) {
      console.log('Erro ao carregar dados:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LOGADO);
      navigation.replace('Welcome');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const salvarEdicao = async () => {
    if (!editNome || !editEmail || !editSenha) {
      Alert.alert('Aviso', 'Por favor, preencha os dados.');
      return;
    }
    
    try {
      const nomeAntigo = nome.trim();
      const nomeNovo = editNome.trim();

      const userDataString = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      const userData = userDataString ? JSON.parse(userDataString) : {};
      const novosDados = { ...userData, nome: nomeNovo, email: editEmail.trim(), senha: editSenha };
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(novosDados));
      
      const cuidadoresString = await AsyncStorage.getItem(STORAGE_KEYS.CUIDADORES);
      if (cuidadoresString) {
        let listaCuidadores = JSON.parse(cuidadoresString);
        listaCuidadores = listaCuidadores.map((c: any) => {
          const nomeNaLista = c.nome.replace(' (Você)', '').trim();
          if (nomeNaLista === nomeAntigo) { return { ...c, nome: nomeNovo }; }
          return c;
        });
        await AsyncStorage.setItem(STORAGE_KEYS.CUIDADORES, JSON.stringify(listaCuidadores));
      }

      setNome(nomeNovo);
      setEmail(editEmail);
      Alert.alert('Sucesso', 'Perfil atualizado!');
      setModalAtivo('nenhum');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  const enviarContato = () => {
    if (!msgContato) { Alert.alert('Aviso', 'Escreva uma mensagem.'); return; }
    Alert.alert('Mensagem Enviada!', 'A equipa entrará em contacto.');
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
            <View style={styles.avatarIconWrapper}><Ionicons name="person" size={50} color="#FFF" /></View>
            <TouchableOpacity style={styles.editBadge} onPress={() => setModalAtivo('editar')}><MaterialCommunityIcons name="pencil" size={16} color="#FFF" /></TouchableOpacity>
          </View>
          <Text style={styles.userName}>{nome}</Text>
          <Text style={styles.userEmail}>{email}</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard icon="fire" label="Ofensiva" value={emMatilha ? `${streak} dias` : '0 dias'} color={emMatilha ? "#FF9600" : "#A0AEC0"} />
          <StatCard icon="star" label="XP Total" value={emMatilha ? xp : '0'} color={emMatilha ? "#1CB0F6" : "#A0AEC0"} />
          <StatCard icon="medal" label="Ranking" value={emMatilha ? "Top 5" : "---"} color={emMatilha ? "#58CC02" : "#A0AEC0"} />
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.menuTitle}>Suporte</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => setModalAtivo('contato')}>
            <View style={styles.menuIconWrapper}><Ionicons name="chatbubbles-outline" size={22} color="#0066FF" /></View>
            <Text style={styles.menuText}>Falar com a Equipe</Text>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E0" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* JANELAS SOBREPOSTAS */}
      {modalAtivo === 'contato' && (
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Contato</Text>
              <TouchableOpacity onPress={() => setModalAtivo('nenhum')} style={styles.closeBtn}><Ionicons name="close" size={24} color="#718096" /></TouchableOpacity>
            </View>
            <TextInput style={[styles.modalInput, { height: 140, textAlignVertical: 'top' }]} placeholder="Sua mensagem..." value={msgContato} onChangeText={setMsgContato} multiline />
            <TouchableOpacity style={styles.modalBtnSalvar} onPress={enviarContato}><Text style={styles.modalBtnSalvarText}>Enviar</Text></TouchableOpacity>
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
  statCard: { flex: 1, backgroundColor: '#FFF', marginHorizontal: 5, padding: 15, borderRadius: 20, alignItems: 'center', elevation: 2 },
  statIconCircle: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#A0AEC0', marginTop: 2 },
  menuContainer: { marginTop: 35, paddingHorizontal: 20 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#4A5568', marginBottom: 15, marginLeft: 5 },
  menuItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 12, borderRadius: 16, marginBottom: 12, elevation: 1 },
  menuIconWrapper: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#EBF4FF', justifyContent: 'center', alignItems: 'center' },
  menuText: { flex: 1, marginLeft: 15, fontSize: 16, color: '#2D3748', fontWeight: '600' },
  
 
  modalOverlay: { 
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(10, 22, 40, 0.6)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20,
    zIndex: 1000 
  },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1A202C' },
  closeBtn: { padding: 4, backgroundColor: '#F7FAFC', borderRadius: 20 },
  modalInput: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 14, padding: 16, marginBottom: 18, fontSize: 16, color: '#2D3748' },
  modalBtnSalvar: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 5 },
  modalBtnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});