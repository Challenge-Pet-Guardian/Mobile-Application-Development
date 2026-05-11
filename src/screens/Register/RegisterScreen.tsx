import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, KeyboardAvoidingView, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { STORAGE_KEYS } from '../../constants/Keys'; 

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const [nomeErro, setNomeErro] = useState('');
  const [emailErro, setEmailErro] = useState('');
  const [senhaErro, setSenhaErro] = useState('');
  const [confirmarSenhaErro, setConfirmarSenhaErro] = useState('');

  const handleRegister = async () => {
    setNomeErro('');
    setEmailErro('');
    setSenhaErro('');
    setConfirmarSenhaErro('');

    let temErro = false;
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

    if (nome.trim() === '') {
      setNomeErro('O nome é obrigatório!');
      temErro = true;
    }

    if (email.trim() === '') {
      setEmailErro('O e-mail é obrigatório!');
      temErro = true;
    } else if (reg.test(email) === false) {
      setEmailErro('O e-mail está com formato errado!');
      temErro = true;
    }

    if (senha.trim() === '') {
      setSenhaErro('A senha é obrigatória!');
      temErro = true;
    } else if (senha.length < 8) {
      setSenhaErro('A senha deve ter no mínimo 8 dígitos!');
      temErro = true;
    }

    if (confirmarSenha.trim() === '') {
      setConfirmarSenhaErro('Confirme sua senha!');
      temErro = true;
    } else if (senha !== confirmarSenha) {
      setConfirmarSenhaErro('As senhas não coincidem!');
      temErro = true;
    }

    if (temErro) {
      return;
    }

    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem('@PetGuardian_MatilhaAtiva');

      const userData = { nome, email, senha };
      
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      
      if (Platform.OS === 'web') {
        window.alert('Conta criada! Faça o login para entrar na matilha.');
      } else {
        Alert.alert('Sucesso!', 'Conta criada! Faça o login para entrar na matilha.');
      }
      navigation.goBack();
    } catch (e) {
      if (Platform.OS === 'web') {
        window.alert('Não foi possível criar a conta.');
      } else {
        Alert.alert('Erro', 'Não foi possível criar a conta.');
      }
    }
  };

  return (
    <KeyboardAvoidingView style={styles.mainContainer} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Preencha seus dados para começar a usar o PetGuardian.</Text>
          </View>

          <View style={styles.formContainer}>
            
            <Text style={styles.inputLabel}>Seu Nome</Text>
            <TextInput
              style={[styles.input, nomeErro !== '' ? styles.inputErro : null]}
              placeholder="Como quer ser chamado?"
              placeholderTextColor="#A0AEC0"
              value={nome}
              onChangeText={(texto) => { setNome(texto); setNomeErro(''); }}
            />
            {nomeErro !== '' && <Text style={styles.erroTexto}>{nomeErro}</Text>}

            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={[styles.input, emailErro !== '' ? styles.inputErro : null]}
              placeholder="seu@email.com"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(texto) => { setEmail(texto); setEmailErro(''); }}
            />
            {emailErro !== '' && <Text style={styles.erroTexto}>{emailErro}</Text>}

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={[styles.input, senhaErro !== '' ? styles.inputErro : null]}
              placeholder="Crie uma senha forte"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={senha}
              onChangeText={(texto) => { setSenha(texto); setSenhaErro(''); }}
            />
            {senhaErro !== '' && <Text style={styles.erroTexto}>{senhaErro}</Text>}

            <Text style={styles.inputLabel}>Confirmar Senha</Text>
            <TextInput
              style={[styles.input, confirmarSenhaErro !== '' ? styles.inputErro : null]}
              placeholder="Digite a senha novamente"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={(texto) => { setConfirmarSenha(texto); setConfirmarSenhaErro(''); }}
            />
            {confirmarSenhaErro !== '' && <Text style={styles.erroTexto}>{confirmarSenhaErro}</Text>}

            <TouchableOpacity style={[styles.button, styles.buttonShadow]} onPress={handleRegister}>
              <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Já faz parte de uma matilha? </Text>
              <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Fazer Login</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContainer: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  contentWrapper: { width: '100%', maxWidth: 400, alignItems: 'center' },
  headerContainer: { alignItems: 'center', marginBottom: 30, marginTop: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A202C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#718096', textAlign: 'center', paddingHorizontal: 10 },
  formContainer: {
    width: '100%', backgroundColor: '#FFFFFF', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#EDF2F7',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
      web: { boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.04)' }
    }),
  },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#4A5568', marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: '#F7FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 16, borderRadius: 16, marginBottom: 20, fontSize: 16, color: '#2D3748' },
  inputErro: { borderColor: '#E53E3E', borderWidth: 1.5, backgroundColor: '#FFF5F5' },
  erroTexto: { color: '#E53E3E', fontSize: 12, marginTop: -15, marginBottom: 15, marginLeft: 8, fontWeight: '500' },
  button: { backgroundColor: '#0066FF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  buttonShadow: {
    ...Platform.select({
      ios: { shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
      web: { boxShadow: '0px 8px 20px rgba(0, 102, 255, 0.25)' }
    }),
  },
  buttonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 16 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 24 },
  footerText: { color: '#718096', fontSize: 15 },
  linkText: { color: '#0066FF', fontWeight: '700', fontSize: 15 }
});