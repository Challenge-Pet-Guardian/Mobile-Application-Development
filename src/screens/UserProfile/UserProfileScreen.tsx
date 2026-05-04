import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { STORAGE_PERFIL, STORAGE_LOGADO } from '../../constants/Keys';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function UserProfileScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [idade, setIdade] = useState('');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarPerfil();
  }, []);

  const carregarPerfil = async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_PERFIL);
      if (raw !== null) {
        const dados = JSON.parse(raw);
        setNome(dados.nome || '');
        setEmail(dados.email || '');
        setIdade(dados.idade || '');
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setCarregando(false);
    }
  };

  const salvarPerfil = async () => {
    try {
      const perfil = { nome, email, idade };
      await AsyncStorage.setItem(STORAGE_PERFIL, JSON.stringify(perfil));
      alert('Perfil salvo com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
    }
  };

  const limparPerfil = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_PERFIL);
      setNome('');
      setEmail('');
      setIdade('');
      alert('Perfil apagado!');
    } catch (error) {
      console.error('Erro ao limpar dados:', error);
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

  if (carregando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0ea5e9" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações da Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Tutor"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Idade do Tutor"
        value={idade}
        onChangeText={setIdade}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.buttonSave} onPress={salvarPerfil}>
        <Text style={styles.buttonText}>Salvar Perfil</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.buttonClear} onPress={limparPerfil}>
        <Text style={styles.buttonTextClear}>Limpar Perfil</Text>
      </TouchableOpacity>

      {/* Botão de Logout */}
      <TouchableOpacity style={styles.buttonLogout} onPress={handleLogout}>
        <Text style={styles.buttonTextLogout}>Sair da Conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#0f172a' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#0f172a',
    padding: 15,
    marginBottom: 15,
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  buttonSave: {
    backgroundColor: '#0ea5e9',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  buttonClear: {
    backgroundColor: '#ef4444',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
    marginBottom: 15,
  },
  buttonLogout: {
    backgroundColor: '#1e293b',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#0f172a',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  buttonTextClear: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  buttonTextLogout: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});