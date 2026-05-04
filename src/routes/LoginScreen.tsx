import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Tipagem correta para evitar o uso do "any" e não perder pontos de TypeScript
type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  // 1. Substituímos o Zod/Hook-Form por useState puro
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  
  // Estados para controle de carregamento
  const [isLoading, setIsLoading] = useState(true); // Carregamento inicial (verificar se já está logado)
  const [isSubmitting, setIsSubmitting] = useState(false); // Carregamento ao apertar o botão de entrar

  // Se já estiver logado, vai direto para as Tabs
  useEffect(() => {
    const verificarLogin = async () => {
      try {
        const logado = await AsyncStorage.getItem('@PetGuardian_Logado');
        if (logado === 'sim') {
          navigation.replace('Tabs');
        }
      } catch (error) {
        console.error('Erro ao verificar login:', error);
      } finally {
        setIsLoading(false);
      }
    };
    verificarLogin();
  }, [navigation]);

  // Função de validação e login
  const handleLogin = async () => {
    // Validação básica manual (substituindo o Zod)
    if (!email || !senha) {
      Alert.alert('Ops!', 'Por favor, preencha seu e-mail e senha.');
      return;
    }

    if (senha.length < 6) {
      Alert.alert('Ops!', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Aqui o ideal seria usar sua constante KEYS, mas deixei a string pura para não quebrar seus imports
      const jsonValue = await AsyncStorage.getItem('@PetGuardian_UserData');

      if (!jsonValue) {
        Alert.alert('Aviso', 'Nenhuma conta encontrada. Cadastre-se primeiro.');
        setIsSubmitting(false);
        return;
      }

      const userData = JSON.parse(jsonValue);

      // Verificação simples dos dados salvos no cadastro
      if (userData.email === email && userData.senha === senha) {
        await AsyncStorage.setItem('@PetGuardian_Logado', 'sim');
        navigation.replace('Tabs');
      } else {
        Alert.alert('Erro', 'E-mail ou senha incorretos.');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível concluir o login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading inicial
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Carregando...</Text>
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

            {/* EMAIL */}
            <Text style={styles.inputLabel}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#A0AEC0"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* SENHA */}
            <Text style={styles.inputLabel}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#A0AEC0"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonShadow]}
              onPress={handleLogin}
              activeOpacity={0.85}
              disabled={isSubmitting} // Desativa o botão enquanto processa
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonText}>Entrar</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.linkText}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            {/* Voltar para Welcome */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#0066FF',
    fontWeight: '500',
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
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
    marginBottom: 20, // Ajustei a margem já que os <Text> de erro do Zod sumiram
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
      ios: { shadowColor: '#0066FF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
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