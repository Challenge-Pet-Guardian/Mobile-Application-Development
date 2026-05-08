import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, Image, Alert 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Header } from '../../components/Header';

const AVATARES_DISPONIVEIS = [
  { id: '1', imagem: require('../../assets/img/cachorro-01.jpg') }, 
  { id: '2', imagem: require('../../assets/img/cachorro-02.jpg') }, 
  { id: '3', imagem: require('../../assets/img/gato-01.jpg') }, 
  { id: '4', imagem: require('../../assets/img/gato-02.jpg') }, 
  { id: '5', imagem: require('../../assets/img/coelho.jpg') }, 
];

export default function PetProfileScreen() {
  const [avatarEscolhidoId, setAvatarEscolhidoId] = useState<string>('1'); 
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [sexo, setSexo] = useState('');
  const [castrado, setCastrado] = useState('');
  const [ultimaVacina, setUltimaVacina] = useState('');

  useEffect(() => {
    carregarDadosPet();
  }, []);

  const carregarDadosPet = async () => {
    try {
      const dados = await AsyncStorage.getItem('@PetGuardian_DadosPet');
      if (dados) {
        const pet = JSON.parse(dados);
        if (pet.avatarId) setAvatarEscolhidoId(pet.avatarId);
        setNome(pet.nome || '');
        setRaca(pet.raca || '');
        setIdade(pet.idade || '');
        setPeso(pet.peso || '');
        setSexo(pet.sexo || '');
        setCastrado(pet.castrado || '');
        setUltimaVacina(pet.ultimaVacina || '');
      }
    } catch (error) {
      console.log('Erro ao carregar dados do pet:', error);
    }
  };

  const salvarDadosPet = async () => {
    if (!nome) {
      Alert.alert('Aviso', 'O nome do pet é obrigatório!');
      return;
    }

    try {
      const dadosPet = { 
        avatarId: avatarEscolhidoId,
        nome, raca, idade, peso, sexo, castrado, ultimaVacina 
      };
      await AsyncStorage.setItem('@PetGuardian_DadosPet', JSON.stringify(dadosPet));
      Alert.alert('Sucesso!', 'Os dados do seu parceiro foram atualizados.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar os dados.');
    }
  };

  const avatarAtual = AVATARES_DISPONIVEIS.find(a => a.id === avatarEscolhidoId)?.imagem;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Header title="Dados do Pet" />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.imageWrapper}>
            {avatarAtual ? (
              <Image source={avatarAtual} style={styles.petImage} />
            ) : (
              <View style={styles.petImagePlaceholder}>
                <MaterialCommunityIcons name="paw" size={40} color="#A0AEC0" />
              </View>
            )}
          </View>
          
          <Text style={styles.avatarSubtitle}>Escolha um avatar para o perfil:</Text>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarList}>
            {AVATARES_DISPONIVEIS.map((avatar) => (
              <TouchableOpacity 
                key={avatar.id} 
                onPress={() => setAvatarEscolhidoId(avatar.id)}
                style={[
                  styles.avatarOption, 
                  avatarEscolhidoId === avatar.id && styles.avatarOptionSelected 
                ]}
              >
                <Image source={avatar.imagem} style={styles.avatarOptionImage} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.formContainer}>
          
          <Text style={styles.inputLabel}>Nome do Pet</Text>
          <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Bob" />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Raça</Text>
              <TextInput style={styles.input} value={raca} onChangeText={setRaca} placeholder="Ex: Husky" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Idade</Text>
              <TextInput style={styles.input} value={idade} onChangeText={setIdade} placeholder="Ex: 4 anos" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Peso</Text>
              <TextInput style={styles.input} value={peso} onChangeText={setPeso} placeholder="Ex: 28 kg" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Sexo</Text>
              <TextInput style={styles.input} value={sexo} onChangeText={setSexo} placeholder="Ex: Macho" />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.inputLabel}>Castrado?</Text>
              <TextInput style={styles.input} value={castrado} onChangeText={setCastrado} placeholder="Sim ou Não" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Última Vacina</Text>
              <TextInput style={styles.input} value={ultimaVacina} onChangeText={setUltimaVacina} placeholder="DD/MM/AAAA" />
            </View>
          </View>

          <TouchableOpacity style={styles.btnSalvar} onPress={salvarDadosPet}>
            <Text style={styles.btnSalvarText}>Salvar Informações</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  
  avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 20 },
  imageWrapper: { position: 'relative', marginBottom: 15 },
  petImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FFF' },
  petImagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  
  avatarSubtitle: { color: '#4A5568', fontSize: 14, fontWeight: '600', marginBottom: 10 },
  
  avatarList: { paddingHorizontal: 20, gap: 12, alignItems: 'center' },
  avatarOption: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: 'transparent', padding: 2 },
  avatarOptionSelected: { borderColor: '#0066FF' },
  avatarOptionImage: { width: '100%', height: '100%', borderRadius: 30 },

  formContainer: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#EDF2F7', elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, marginBottom: 15, fontSize: 15, color: '#2D3748' },
  
  btnSalvar: { backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});