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

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Estados para as mensagens de erro
  const [emailErro, setEmailErro] = useState('');
  const [senhaErro, setSenhaErro] = useState('');

  // Validação de E-mail
  const validarEmail = (text: string) => {
    setEmail(text);
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;
    if (reg.test(text) === false && text !== '') {
      setEmailErro('O e-mail está com formato errado!');
    } else {
      setEmailErro('');
    }
  };

  // Validação de Senha
  const validarSenha = (text: string) => {
    setSenha(text);
    if (text.length > 0 && text.length < 8) {
      setSenhaErro('A senha deve ter no mínimo 8 dígitos!');
    } else {
      setSenhaErro('');
    }
  };

  const handleLogin = async () => {
    // 1. Verifica se os campos estão vazios
    if (!email || !senha) {
      Alert.alert('Ops!', 'Por favor, preencha seu e-mail e senha.');
      return;
    }

    // 2. Trava de segurança: barra se houver erro de formatação
    if (emailErro !== '' || senhaErro !== '') {
      Alert.alert('Erro', 'Por favor, corrija os campos em destaque.');
      return;
    }

    // 3. Tenta fazer o login buscando no AsyncStorage
    try {
      const userDataString = await AsyncStorage.getItem(STORAGE_USER_DATA);
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Compara se o que foi digitado bate com o que está salvo
        if (userData.email === email && userData.senha === senha) {
          // IMPORTANTE: Aqui você coloca o nome da rota principal do seu app
          // Provavelmente é 'Tabs', 'Home' ou 'MainStack'
          navigation.navigate('Tabs'); 
        } else {
          Alert.alert('Erro', 'E-mail ou senha incorretos.');
        }
      } else {
        Alert.alert('Ops!', 'Nenhuma conta encontrada. Crie uma conta primeiro!');
      }
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível acessar a conta.');
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
            <Text style={{ fontSize: 40, marginBottom: 10 }}>🐾</Text>
            <Text style={styles.title}>PetGuardian</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
          </View>

          {/* Formulário num Card Branco */}
          <View style={styles.formContainer}>
            
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
              placeholder="Sua senha secreta"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={senha}
              onChangeText={validarSenha}
            />
            {senhaErro !== '' && <Text style={styles.erroTexto}>{senhaErro}</Text>}

            <TouchableOpacity style={[styles.button, styles.buttonShadow]} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={{ marginTop: 20, alignItems: 'center' }} onPress={() => navigation.goBack()}>
              <Text style={{ color: '#A0AEC0', fontSize: 14 }}>← Voltar</Text>
            </TouchableOpacity>

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
  title: { fontSize: 32, fontWeight: '900', color: '#1A202C', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#718096', textAlign: 'center' },
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