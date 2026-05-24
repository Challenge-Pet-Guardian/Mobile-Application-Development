import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { STORAGE_KEYS } from '../../constants/Keys';

const maxWidth = 400;

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function AddMemberScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');

  const salvar = useCallback(async () => {
    if (!nome.trim() || !funcao.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Por favor, preencha o nome e a função do familiar.');
      } else {
        Alert.alert('Campos vazios', 'Por favor, preencha o nome e a função do familiar.');
      }
      return;
    }

    const novo = { id: Date.now().toString(), nome, funcao };

    const dados = await AsyncStorage.getItem(STORAGE_KEYS.CUIDADORES);
    const lista = dados ? JSON.parse(dados) : [];
    lista.push(novo);
    await AsyncStorage.setItem(STORAGE_KEYS.CUIDADORES, JSON.stringify(lista));
    navigation.goBack();
  }, [nome, funcao, navigation]);

  // Handler de cancelamento memoizado
  const handleCancel = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Novo Familiar</Text>

        <TextInput
          placeholder="Nome"
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

        <TextInput
          placeholder="Função"
          style={styles.input}
          value={funcao}
          onChangeText={setFuncao}
        />

        {(nome !== '' || funcao !== '') && (
          <View style={styles.previewContainer}>
            <Text style={styles.previewText}>
              Pré-visualização:{'\n'}
              <Text style={{ fontWeight: 'bold' }}>{nome ? nome : '???'}</Text> será adicionado(a) como <Text style={{ fontWeight: 'bold' }}>{funcao ? funcao : '???'}</Text> da família!
            </Text>
          </View>
        )}

        <TouchableOpacity style={styles.btn} onPress={salvar}>
          <Text style={styles.btnText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleCancel}>
          <Text style={{ marginTop: 15, textAlign: 'center', color: '#666' }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center', backgroundColor: '#f5f5f5', justifyContent: 'center' },
  contentContainer: { width: '100%', maxWidth, padding: 20 },
  title: { fontSize: 22, marginBottom: 20, fontWeight: 'bold', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', marginBottom: 15, padding: 15, borderRadius: 10, backgroundColor: '#fff' },
  btn: { backgroundColor: '#0066ff', padding: 15, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  previewContainer: { backgroundColor: '#EBF4FF', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#0066ff' },
  previewText: { color: '#0066ff', fontSize: 14, textAlign: 'center' }
});