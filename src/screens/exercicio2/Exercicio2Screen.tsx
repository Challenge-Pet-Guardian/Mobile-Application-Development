import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View, StyleSheet } from "react-native";
import { STORAGE_RASCUNHO } from "../../constants/Keys";

export default function Exercicio2() {
    const [rascunho, setRascunho] = useState("");
    const [salvamento, setSalvamento] = useState("");

    async function onChangeRascunho(texto: string) {
        try {
            setRascunho(texto);
            const agora = new Date().toLocaleString();
            setSalvamento(agora);

            const infos = { texto: texto, salvamento: agora }

            await AsyncStorage.setItem(STORAGE_RASCUNHO, JSON.stringify(infos));
        } catch (error) {
            console.error("Erro ao salvar o rascunho:", error);
        }
    }

    async function loadRascunho() {
        try {
            const savedRascunho = await AsyncStorage.getItem(STORAGE_RASCUNHO);
            if (savedRascunho) {
                const infos = JSON.parse(savedRascunho);
                setRascunho(infos.texto);
                setSalvamento(infos.salvamento);
            }
        } catch (error) {
            console.error("Erro ao carregar o rascunho:", error);
        }
    }


    async function onClear() {
        try {
            await AsyncStorage.removeItem(STORAGE_RASCUNHO);
            setRascunho("");
            setSalvamento("");
        } catch (error) {
            console.error("Erro ao limpar o rascunho:", error);
        }
    }

    useEffect(() => {
        loadRascunho();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Rascunho 2000</Text>

            <TextInput
                style={styles.input}
                multiline={true}
                placeholder="Digite seu texto aqui"
                onChangeText={onChangeRascunho}
                value={rascunho}
            />

            <Text style={{ fontSize: 16 }}>Último Salvamento: {salvamento}</Text>

            <TouchableOpacity style={styles.buttonApagar} onPress={onClear}>
                <Text style={{ fontSize: 20 }}>Apagar Rascunho!</Text>
            </TouchableOpacity>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        gap: 20,
        marginHorizontal: 30,
        justifyContent: "center",
    },
    title: {
        fontSize: 20,
        padding: 10,
        backgroundColor: "#3c9ac6",
        borderRadius: 10,
    },
    input: {
        height: 200,
        fontSize: 16,
        padding: 10,
        borderWidth: 2,
        textAlignVertical: 'top',
        borderColor: "#a0a0a0",
        borderRadius: 10,
    },
    buttonApagar: {
        backgroundColor: "#ff4949",
        borderRadius: 10,
        padding: 10,
        fontSize: 20,
    }
});
