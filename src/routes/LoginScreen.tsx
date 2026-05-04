import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Tipagem (sem any solto)
type Props = {
  navigation: any;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(true);

  // 🔐 Verifica se já está logado
  useEffect(() => {
    const verificarLogin = async () => {
      try {
        const logado = await AsyncStorage.getItem('@PetGuardian_Logado');

        if (logado === 'sim') {
          navigation.replace('Tabs');
          return;
        }
      } catch (e) {
        Alert.alert('Erro', 'Falha ao verificar login.');
      } finally {
        setLoading(false);
      }
    };

    verificarLogin();
  }, []);

  // 🔑 Login
  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Ops!', 'Preencha seu e-mail e senha.');
      return;
    }

    try {
      const jsonValue = await AsyncStorage.getItem('@PetGuardian_UserData');

      // ✅ Regra da atividade
      if (jsonValue === null) {
        Alert.alert('Aviso', 'Nenhuma conta encontrada. Cadastre-se primeiro.');
        return;
      }

      let userData;

      // ✅ try/catch no parse
      try {
        userData = JSON.parse(jsonValue);
      } catch {
        Alert.alert('Erro', 'Dados corrompidos.');
        return;
      }

      if (userData.email === email && userData.senha === senha) {
        await AsyncStorage.setItem('@PetGuardian_Logado', 'sim');
        navigation.replace('Tabs');
      } else {
        Alert.alert('Erro', 'E-mail ou senha incorretos.');
      }

    } catch (e) {
      Alert.alert('Erro', 'Falha ao tentar fazer login.');
    }
  };

  // ⏳ Loading inicial
  if (loading) {
    return (
      <View style={[styles.mainContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>

          {/* Header */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoIcon}>🐾</Text>
            </View>
            <Text style={styles.brandName}>PetGuardian</Text>
            <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
          </View>

          {/* Formulário */}
          <View style={styles.formContainer}>

            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonShadow]}
              onPress={handleLogin}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            {/* Voltar */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate('Welcome')}
            >
              <Text style={styles.backText}>← Voltar</Text>
            </TouchableOpacity>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: '#EBF4FF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#EDF2F7',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10
      },
      android: { elevation: 3 },
    }),
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#F7FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#2D3748',
  },
  button: {
    backgroundColor: '#0066FF',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonShadow: {
    ...Platform.select({
      ios: {
        shadowColor: '#0066FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8
      },
      android: { elevation: 6 },
    }),
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#718096',
    fontSize: 15,
  },
  linkText: {
    color: '#0066FF',
    fontWeight: '700',
    fontSize: 15,
  },
  backButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  backText: {
    color: '#A0AEC0',
    fontSize: 14,
    fontWeight: '500',
  },
});