import React, { useState, useEffect } from "react";
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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import AsyncStorage from "@react-native-async-storage/async-storage";

const loginSchema = z.object({
  email: z.string().min(1, "Email é obrigatório").email("Email inválido"),
  password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(false);

  // Se já estiver logado, vai direto para as Tabs
  useEffect(() => {
    const verificarLogin = async () => {
      const logado = await AsyncStorage.getItem("@PetGuardian_Logado");
      if (logado === "sim") {
        navigation.replace("Tabs");
      }
    };
    verificarLogin();
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const jsonValue = await AsyncStorage.getItem("@PetGuardian_UserData");

      if (!jsonValue) {
        Alert.alert("Aviso", "Nenhuma conta encontrada. Cadastre-se primeiro.");
        return;
      }

      const userData = JSON.parse(jsonValue);

      if (userData.email === data.email && userData.senha === data.password) {
        await AsyncStorage.setItem("@PetGuardian_Logado", "sim");
        navigation.replace("Tabs");
      } else {
        Alert.alert("Erro", "E-mail ou senha incorretos.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível concluir o login.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitting || isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066FF" />
        <Text style={styles.loadingText}>Entrando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.mainContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.email && styles.inputError]}
                    placeholder="Digite seu e-mail"
                    placeholderTextColor="#A0AEC0"
                    value={value}
                    onChangeText={onChange}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  {errors.email && (
                    <Text style={styles.error}>{errors.email.message}</Text>
                  )}
                </>
              )}
            />

            {/* SENHA */}
            <Text style={styles.inputLabel}>Senha</Text>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <>
                  <TextInput
                    style={[styles.input, errors.password && styles.inputError]}
                    placeholder="Digite sua senha"
                    placeholderTextColor="#A0AEC0"
                    value={value}
                    onChangeText={onChange}
                    secureTextEntry
                  />
                  {errors.password && (
                    <Text style={styles.error}>{errors.password.message}</Text>
                  )}
                </>
              )}
            />

            <TouchableOpacity
              style={[styles.button, styles.buttonShadow]}
              onPress={handleSubmit(onSubmit)}
              activeOpacity={0.85}
            >
              <Text style={styles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.linkText}>Criar conta</Text>
              </TouchableOpacity>
            </View>

            {/* Voltar para Welcome */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.navigate("Welcome")}
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
    backgroundColor: "#F8FAFC",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  contentWrapper: {
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#0066FF",
    fontWeight: "500",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    backgroundColor: "#EBF4FF",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  logoIcon: {
    fontSize: 40,
  },
  brandName: {
    fontSize: 32,
    fontWeight: "800",
    color: "#1A202C",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#718096",
    textAlign: "center",
  },
  formContainer: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#EDF2F7",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
      android: { elevation: 3 },
    }),
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F7FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    borderRadius: 16,
    marginBottom: 6,
    fontSize: 16,
    color: "#2D3748",
  },
  inputError: {
    borderColor: "#FC8181",
    backgroundColor: "#FFF5F5",
  },
  error: {
    color: "#E53E3E",
    fontSize: 13,
    marginBottom: 14,
    marginLeft: 4,
  },
  button: {
    backgroundColor: "#0066FF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonShadow: {
    ...Platform.select({
      ios: { shadowColor: "#0066FF", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  footerText: {
    color: "#718096",
    fontSize: 15,
  },
  linkText: {
    color: "#0066FF",
    fontWeight: "700",
    fontSize: 15,
  },
  backButton: {
    alignItems: "center",
    marginTop: 16,
  },
  backText: {
    color: "#A0AEC0",
    fontSize: 14,
    fontWeight: "500",
  },
});