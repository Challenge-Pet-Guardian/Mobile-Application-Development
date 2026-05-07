import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { STORAGE_USER_DATA } from '../../constants/Keys';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Estados para as mensagens de erro visuais
  const [nomeErro, setNomeErro] = useState('');
  const [emailErro, setEmailErro] = useState('');
  const [senhaErro, setSenhaErro] = useState('');

  // Validação do Nome
  const validarNome = (text: string) => {
    setNome(text);
    if (text.trim() === '') {
      setNomeErro('O nome é obrigatório!');
    } else {
      setNomeErro('');
    }
  };

  // Validação de E-mail usando Regex
  const validarEmail = (text: string) => {
    setEmail(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (text.trim() === '') {
      setEmailErro('O e-mail é obrigatório!');
    } else if (reg.test(text) === false) {
      setEmailErro('O e-mail está com formato errado!');
    } else {
      setEmailErro('');
    }
  };

  // Validação da Senha
  const validarSenha = (text: string) => {
    setSenha(text);
    if (text.trim() === '') {
      setSenhaErro('A senha é obrigatória!');
    } else if (text.length < 8) {
      setSenhaErro('A senha deve ter no mínimo 8 dígitos!');
    } else {
      setSenhaErro('');
    }
  };

  const handleRegister = async () => {
    let erroEncontrado = false;

    // Força a validação visual caso o utilizador clique no botão sem preencher nada
    if (nome.trim() === '') {
      setNomeErro('O nome é obrigatório!');
      erroEncontrado = true;
    }
    if (email.trim() === '') {
      setEmailErro('O e-mail é obrigatório!');
      erroEncontrado = true;
    }
    if (senha.trim() === '') {
      setSenhaErro('A senha é obrigatória!');
      erroEncontrado = true;
    }

    // Trava de segurança principal
    if (erroEncontrado || nomeErro !== '' || emailErro !== '' || senhaErro !== '') {
      Alert.alert('Aviso', 'Por favor, preencha os campos em destaque corretamente.');
      return;
    }

    try {
      const userData = { nome, email, senha };
      await AsyncStorage.setItem(STORAGE_USER_DATA, JSON.stringify(userData));
      
      Alert.alert('Sucesso!', 'A sua conta foi criada. Faça login para entrar na matilha.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível criar a conta.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.mainContainer} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrapper}>
          
          {/* Cabeçalho */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Preencha seus dados para começar a usar o PetGuardian.</Text>
          </View>

          {/* Formulário num Card Branco */}
          <View style={styles.formContainer}>
            
            <Text style={styles.inputLabel}>Seu Nome</Text>
            <TextInput
              style={[styles.input, nomeErro !== '' ? styles.inputErro : null]}
              placeholder="Como quer ser chamado?"
              placeholderTextColor="#A0AEC0"
              value={nome}
              onChangeText={validarNome}
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
              onChangeText={validarEmail}
            />
            {emailErro !== '' && <Text style={styles.erroTexto}>{emailErro}</Text>}

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={[styles.input, senhaErro !== '' ? styles.inputErro : null]}
              placeholder="Crie uma senha forte"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={senha}
              onChangeText={validarSenha}
            />
            {senhaErro !== '' && <Text style={styles.erroTexto}>{senhaErro}</Text>}

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
  
  // Estilos para os erros
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