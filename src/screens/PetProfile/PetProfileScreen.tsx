import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, TextInput, KeyboardAvoidingView, Image, Alert } from 'react-native';
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

interface Pet {
  id: string;
  avatarId: string;
  nome: string;
  raca: string;
  idade: string;
  peso: string;
  sexo: string;
  castrado: string;
  ultimaVacina: string;
  ultimaConsulta: string;
  veterinario: string;
  alergias: string;
  medicamentos: string;
}

export default function PetProfileScreen() {
  const [meusPets, setMeusPets] = useState<Pet[]>([]);
  const [petAtualId, setPetAtualId] = useState<string | null>(null);

  const [avatarEscolhidoId, setAvatarEscolhidoId] = useState<string>('1'); 
  const [nome, setNome] = useState('');
  const [raca, setRaca] = useState('');
  const [idade, setIdade] = useState('');
  const [peso, setPeso] = useState('');
  const [sexo, setSexo] = useState('');
  const [castrado, setCastrado] = useState('');
  const [ultimaVacina, setUltimaVacina] = useState('');
  const [ultimaConsulta, setUltimaConsulta] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [alergias, setAlergias] = useState('');
  const [medicamentos, setMedicamentos] = useState('');

  useEffect(() => {
    carregarPets();
  }, []);

  const carregarPets = async () => {
    try {
      const dados = await AsyncStorage.getItem('@PetGuardian_ListaPets');
      if (dados) {
        const lista: Pet[] = JSON.parse(dados);
        setMeusPets(lista);
        if (lista.length > 0) {
          selecionarPet(lista[0]);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const selecionarPet = (pet: Pet) => {
    setPetAtualId(pet.id);
    setAvatarEscolhidoId(pet.avatarId);
    setNome(pet.nome);
    setRaca(pet.raca);
    setIdade(pet.idade);
    setPeso(pet.peso);
    setSexo(pet.sexo);
    setCastrado(pet.castrado);
    setUltimaVacina(pet.ultimaVacina);
    setUltimaConsulta(pet.ultimaConsulta || '');
    setVeterinario(pet.veterinario);
    setAlergias(pet.alergias);
    setMedicamentos(pet.medicamentos);
  };

  const prepararNovoPet = () => {
    setPetAtualId(null);
    setAvatarEscolhidoId('1');
    setNome(''); setRaca(''); setIdade(''); setPeso(''); setSexo('');
    setCastrado(''); setUltimaVacina(''); setUltimaConsulta(''); setVeterinario('');
    setAlergias(''); setMedicamentos('');
  };

  const salvarDadosPet = async () => {
    if (!nome) {
      Alert.alert('Aviso', 'O nome do pet é obrigatório!');
      return;
    }

    const dadosDoFormulario: Pet = { 
      id: petAtualId || Date.now().toString(),
      avatarId: avatarEscolhidoId,
      nome, raca, idade, peso, sexo, castrado, ultimaVacina, ultimaConsulta,
      veterinario, alergias, medicamentos 
    };

    try {
      let novaLista = [...meusPets];
      if (petAtualId) {
        novaLista = novaLista.map(p => p.id === petAtualId ? dadosDoFormulario : p);
      } else {
        novaLista.push(dadosDoFormulario);
      }
      setMeusPets(novaLista);
      setPetAtualId(dadosDoFormulario.id);
      await AsyncStorage.setItem('@PetGuardian_ListaPets', JSON.stringify(novaLista));
      Alert.alert('Sucesso!', 'Perfil salvo com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível salvar.');
    }
  };

  const confirmarExclusao = () => {
    if (!petAtualId) return;

    if (Platform.OS === 'web') {
      const confirmou = window.confirm(`Tem certeza que deseja remover o(a) ${nome} da sua lista?`);
      if (confirmou) {
        excluirPet();
      }
    } else {
      Alert.alert(
        "Excluir Pet",
        `Tem certeza que deseja remover o(a) ${nome} da sua lista?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: excluirPet }
        ]
      );
    }
  };

  const excluirPet = async () => {
    try {
      const novaLista = meusPets.filter(p => p.id !== petAtualId);
      setMeusPets(novaLista);
      await AsyncStorage.setItem('@PetGuardian_ListaPets', JSON.stringify(novaLista));
      
      if (novaLista.length > 0) {
        selecionarPet(novaLista[0]);
      } else {
        prepararNovoPet();
      }
      
      if (Platform.OS !== 'web') {
        Alert.alert('Pronto', 'Pet removido com sucesso.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível excluir.');
    }
  };

  const avatarAtual = AVATARES_DISPONIVEIS.find(a => a.id === avatarEscolhidoId)?.imagem;

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        
        <View style={{ paddingHorizontal: 20, paddingTop: 10 }}>
          <Header title="Meus Pets" />
        </View>

        <View style={styles.carrosselContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listaDePets}>
            {meusPets.map((pet) => (
              <TouchableOpacity key={pet.id} onPress={() => selecionarPet(pet)} style={styles.itemPetCarrossel}>
                <View style={[styles.miniAvatarBorda, petAtualId === pet.id && styles.miniAvatarSelecionado]}>
                  <Image source={AVATARES_DISPONIVEIS.find(a => a.id === pet.avatarId)?.imagem} style={styles.miniAvatarImg} />
                </View>
                <Text style={[styles.miniAvatarTexto, petAtualId === pet.id && styles.miniAvatarTextoSelecionado]}>{pet.nome.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={prepararNovoPet} style={styles.itemPetCarrossel}>
              <View style={[styles.miniAvatarBorda, styles.botaoNovoPet, petAtualId === null && styles.miniAvatarSelecionado]}>
                <MaterialCommunityIcons name="plus" size={30} color={petAtualId === null ? "#0066FF" : "#A0AEC0"} />
              </View>
              <Text style={[styles.miniAvatarTexto, petAtualId === null && styles.miniAvatarTextoSelecionado]}>Novo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.imageWrapper}>
            {avatarAtual ? <Image source={avatarAtual} style={styles.petImage} /> : <View style={styles.petImagePlaceholder}><MaterialCommunityIcons name="paw" size={40} color="#A0AEC0" /></View>}
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.avatarList}>
            {AVATARES_DISPONIVEIS.map((avatar) => (
              <TouchableOpacity key={avatar.id} onPress={() => setAvatarEscolhidoId(avatar.id)} style={[styles.avatarOption, avatarEscolhidoId === avatar.id && styles.avatarOptionSelected]}><Image source={avatar.imagem} style={styles.avatarOptionImage} /></TouchableOpacity>
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

          <View style={styles.secaoSaude}>
            <Text style={styles.tituloSaude}>Histórico e Cuidados</Text>
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Text style={styles.inputLabel}>Veterinário</Text>
                <TextInput style={styles.input} value={veterinario} onChangeText={setVeterinario} placeholder="Nome/Tel" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Última Consulta</Text>
                <TextInput style={styles.input} value={ultimaConsulta} onChangeText={setUltimaConsulta} placeholder="DD/MM/AAAA" />
              </View>
            </View>

            <Text style={styles.inputLabel}>Alergias ou Restrições</Text>
            <TextInput style={styles.input} value={alergias} onChangeText={setAlergias} placeholder="Ex: Alergia a picada de pulga..." />

            <Text style={styles.inputLabel}>Medicamentos Contínuos</Text>
            <TextInput style={styles.input} value={medicamentos} onChangeText={setMedicamentos} placeholder="Remédios que ele toma sempre" />
          </View>

          <TouchableOpacity style={styles.btnSalvar} onPress={salvarDadosPet}>
            <Text style={styles.btnSalvarText}>{petAtualId ? 'Atualizar Informações' : 'Cadastrar Pet'}</Text>
          </TouchableOpacity>

          {petAtualId && (
            <TouchableOpacity style={styles.btnExcluir} onPress={confirmarExclusao}>
              <MaterialCommunityIcons name="trash-can-outline" size={20} color="#FF3B30" />
              <Text style={styles.btnExcluirText}>Remover este Pet</Text>
            </TouchableOpacity>
          )}

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  carrosselContainer: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EDF2F7', backgroundColor: '#FFF' },
  listaDePets: { paddingHorizontal: 20, gap: 15, alignItems: 'center' },
  itemPetCarrossel: { alignItems: 'center', width: 64 },
  miniAvatarBorda: { width: 56, height: 56, borderRadius: 28, borderWidth: 3, borderColor: '#EDF2F7', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  miniAvatarSelecionado: { borderColor: '#0066FF' },
  miniAvatarImg: { width: '100%', height: '100%' },
  miniAvatarTexto: { fontSize: 12, color: '#718096', marginTop: 4, fontWeight: '600' },
  miniAvatarTextoSelecionado: { color: '#0066FF', fontWeight: 'bold' },
  botaoNovoPet: { backgroundColor: '#F0F8FF', borderStyle: 'dashed' },
  avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 20 },
  imageWrapper: { position: 'relative', marginBottom: 15 },
  petImage: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: '#FFF' },
  petImagePlaceholder: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  avatarList: { paddingHorizontal: 20, gap: 12, alignItems: 'center' },
  avatarOption: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: 'transparent', padding: 2 },
  avatarOptionSelected: { borderColor: '#0066FF' },
  avatarOptionImage: { width: '100%', height: '100%', borderRadius: 30 },
  formContainer: { backgroundColor: '#FFF', marginHorizontal: 20, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#EDF2F7', elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 14, marginBottom: 15, fontSize: 15, color: '#2D3748' },
  secaoSaude: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  tituloSaude: { fontSize: 16, fontWeight: 'bold', color: '#1A202C', marginBottom: 15 },
  btnSalvar: { backgroundColor: '#0066FF', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  btnSalvarText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  btnExcluir: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 5 },
  btnExcluirText: { color: '#FF3B30', fontWeight: '600', fontSize: 14 }
});