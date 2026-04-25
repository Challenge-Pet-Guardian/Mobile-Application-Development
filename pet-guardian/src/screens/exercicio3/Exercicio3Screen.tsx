import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet, TouchableOpacityProps } from "react-native";
import { STORAGE_PERFIL } from "../../constants/Keys";

export default function Exercicio3(_: TouchableOpacityProps) {
    const [perfil, setPerfil] = useState({
        nome: "",
        email: "",
        idade: "",
    });
    const [PerfilSalvo, setPerfilSalvo] = useState<boolean>(false);

    async function onSavePerfil() {
        try {
            if (!perfil.nome || !perfil.email || !perfil.idade) {
                alert("Por favor, preencha todos os campos do perfil.");
                return;
            }

            if (perfil.nome.length < 3) {
                alert("O nome deve conter pelo menos 3 caracteres.");
                return;
            }

            if (!/\S+@\S+\.\S+/.test(perfil.email)) {
                alert("Por favor, insira um email válido.");
                return;
            }

            if (isNaN(Number(perfil.idade)) || Number(perfil.idade) <= 0) {
                alert("A idade deve ser um número válido e positivo.");
                return;
            }

            await AsyncStorage.setItem(STORAGE_PERFIL, JSON.stringify(perfil));
            setPerfilSalvo(true);
            alert("Perfil salvo com sucesso!");
        } catch (error) {
            console.error("Erro ao salvar o perfil:", error);
        }
    }

    async function loadPerfil() {
        try {
            const savedPerfil = await AsyncStorage.getItem(STORAGE_PERFIL);
            if (savedPerfil) {
                setPerfil(JSON.parse(savedPerfil));
                setPerfilSalvo(true);
            }
        } catch (error) {
            console.error("Erro ao carregar o perfil:", error);
        }
    }

    async function onClear() {
        try {
            await AsyncStorage.removeItem(STORAGE_PERFIL);
            setPerfil({ nome: "", email: "", idade: "" });
            alert("Perfil apagado com sucesso!");
            setPerfilSalvo(false);
        } catch (error) {
            console.error("Erro ao limpar o perfil:", error);
        }
    }

    useEffect(() => {
        loadPerfil();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Perfil Ultra Master Blaster</Text>
            <View style={styles.inputContainer}>
                <Text style={styles.textInput}>Nome:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu Nome"
                    value={perfil.nome}
                    onChangeText={(text) => setPerfil({ ...perfil, nome: text })}
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.textInput}>Email:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite seu Email"
                    value={perfil.email}
                    onChangeText={(text) => setPerfil({ ...perfil, email: text })}
                    keyboardType="email-address" 
                />
            </View>
            <View style={styles.inputContainer}>
                <Text style={styles.textInput}>Idade:</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Digite sua Idade"
                    value={perfil.idade}
                    onChangeText={(text) => setPerfil({ ...perfil, idade: text })}
                    keyboardType="numeric"
                />
            </View>
            <TouchableOpacity
                style={styles.buttonSalvar}
                activeOpacity={0.7}
                onPress={onSavePerfil}
            >
                <Text style={styles.textButtons}>Salvar Perfil</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.buttonApagar}
                activeOpacity={0.7}
                onPress={onClear}
            >
                <Text style={styles.textButtons}>Apagar Perfil</Text>
            </TouchableOpacity>

            {
                PerfilSalvo && (
                    <View style={styles.perfilCarregado}>
                        <Text>Perfil carregado do dispositivo</Text>
                    </View>
                )
            }

        </View>
    );
}


const styles = StyleSheet.create({
    // Container e seus conteúdos
    container: {
        flex: 1,
        gap: 20,
        marginHorizontal: 30,
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        padding: 10,
        backgroundColor: "#3cb8c6",
        borderRadius: 10,
        textAlign: "center",
    },

    buttonSalvar: {
        backgroundColor: "#3cc675",
        borderRadius: 10,
        padding: 10,
    },
    buttonApagar: {
        backgroundColor: "#ff4949",
        borderRadius: 10,
        padding: 10,
    },
    textButtons: {
        fontSize: 20,
        color: "#fff",
        textAlign: "center",
    },

    perfilCarregado: {
        alignItems: "center",
        borderRadius: 10,
        padding: 10,
        backgroundColor: "#d0f0c0",
    },

    //Fim Container e seus conteúdos

    // Inputs
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginHorizontal: 10,

    },
    input: {
        fontSize: 16,
        padding: 10,
        borderWidth: 2,
        borderColor: "#a0a0a0",
        borderRadius: 10,
        flex: 1
    },
    textInput: {
        fontSize: 16,
        fontWeight: "600",
    },
    // Fim Inputs

});
