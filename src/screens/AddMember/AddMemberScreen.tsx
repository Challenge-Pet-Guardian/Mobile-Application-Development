import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const maxWidth = 400;

export default function AddMemberScreen({ navigation }: any) {
  const [nome, setNome] = useState('');
  const [funcao, setFuncao] = useState('');

  const salvar = async () => {
    if (!nome || !funcao) {
      alert('Preencha tudo');
      return;
    }

    const novo = {
      id: Date.now().toString(),
      nome,
      funcao
    };

    const dados = await AsyncStorage.getItem('@Matilha_Cuidadores');
    const lista = dados ? JSON.parse(dados) : [];

    lista.push(novo);

    await AsyncStorage.setItem('@Matilha_Cuidadores', JSON.stringify(lista));

    navigation.goBack();
  };

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

        <TouchableOpacity style={styles.btn} onPress={salvar}>
          <Text style={styles.btnText}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ marginTop: 10 }}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center', backgroundColor: '#f5f5f5' },
  contentContainer: { width: '100%', maxWidth, padding: 20 },

  title: { fontSize: 22, marginBottom: 20 },

  input: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    borderRadius: 10
  },

  btn: {
    backgroundColor: '#0066ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },

  btnText: { color: '#fff', fontWeight: 'bold' }
});