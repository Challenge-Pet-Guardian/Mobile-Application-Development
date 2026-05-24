import React, { useEffect, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, TouchableOpacity, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../constants/Keys";

export default function WelcomeScreen({ navigation }: any) {

    useEffect(() => {
        const verificarSessaoAtiva = async () => {
            try {
                const logado = await AsyncStorage.getItem(STORAGE_KEYS.LOGADO);
                if (logado === "sim") {
                    navigation.replace("Tabs");
                }
            } catch (error) {
                console.log("Erro ao recuperar sessão:", error);
            }
        };

        verificarSessaoAtiva();
    }, [navigation]);

    // Handlers de navegação memoizados
    const handleRegister = useCallback(() => {
        navigation.navigate("Register");
    }, [navigation]);

    const handleLogin = useCallback(() => {
        navigation.navigate("Login");
    }, [navigation]);

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.content}>
                {/* Logo e Versão */}
                <View style={styles.headerSection}>
                    <MaterialCommunityIcons name="paw" size={60} color="#FF9600" />

                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>• v1.0 - Novo</Text>
                    </View>
                </View>

                {/* Títulos */}
                <Text style={styles.title}>PetGuardian</Text>
                <Text style={styles.subtitle}>
                    A rotina do seu pet, organizada em família.
                </Text>

                {/* Chips de Categorias */}
                <View style={styles.chipsRow}>
                    <View style={styles.chip}>
                        <MaterialCommunityIcons name="plus" size={14} color="#FFF" />
                        <Text style={styles.chipText}>Saúde</Text>
                    </View>
                    <View style={styles.chip}>
                        <MaterialCommunityIcons name="calendar-range" size={14} color="#FFF" />
                        <Text style={styles.chipText}>Rotina</Text>
                    </View>
                    <View style={styles.chip}>
                        <MaterialCommunityIcons name="account-group" size={14} color="#FFF" />
                        <Text style={styles.chipText}>Família</Text>
                    </View>
                </View>
            </View>

            {/* Ações Inferiores */}
            <View style={styles.footer}>
                <TouchableOpacity
                    style={styles.btnMain}
                    onPress={handleRegister}
                >
                    <Text style={styles.btnMainText}>Criar conta grátis →</Text>
                </TouchableOpacity>

                <Text style={styles.labelSimple}>já tenho conta</Text>

                <TouchableOpacity
                    style={styles.btnOutline}
                    onPress={handleLogin}
                >
                    <Text style={styles.btnOutlineText}>Entrar</Text>
                </TouchableOpacity>

                <Text style={styles.legalText}>
                    Ao continuar, você concorda com os nossos{" "}
                    <Text style={{ color: "#0066FF", fontWeight: "bold" }}>Termos de Uso</Text>
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#081324",
        paddingHorizontal: 30,
        paddingTop: Platform.OS === "android" ? 60 : 0,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerSection: {
        alignItems: "center",
        marginBottom: 20,
    },
    badge: {
        marginTop: 15,
        backgroundColor: "rgba(0, 102, 255, 0.15)",
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "rgba(0, 102, 255, 0.3)",
    },
    badgeText: {
        color: "#1CB0F6",
        fontSize: 12,
        fontWeight: "bold",
    },
    title: {
        fontSize: 42,
        fontWeight: "bold",
        color: "#FFF",
        textAlign: "center",
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: "#94A3B8",
        textAlign: "center",
        marginBottom: 30,
        lineHeight: 22,
    },
    chipsRow: {
        flexDirection: "row",
        gap: 10,
    },
    chip: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.1)",
        gap: 5,
    },
    chipText: {
        color: "#FFF",
        fontSize: 13,
    },
    footer: {
        width: "100%",
        paddingBottom: 40,
        alignItems: "center",
    },
    btnMain: {
        backgroundColor: "#0066FF",
        width: "100%",
        padding: 18,
        borderRadius: 15,
        alignItems: "center",
        marginBottom: 5,
    },
    btnMainText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    labelSimple: {
        color: "rgba(255, 255, 255, 0.4)",
        fontSize: 14,
        marginVertical: 10,
    },
    btnOutline: {
        width: "100%",
        padding: 18,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: "rgba(255, 255, 255, 0.2)",
        alignItems: "center",
        marginBottom: 20,
    },
    btnOutlineText: {
        color: "#FFF",
        fontSize: 18,
        fontWeight: "bold",
    },
    legalText: {
        color: "rgba(255, 255, 255, 0.3)",
        fontSize: 12,
        textAlign: "center",
    }
});