import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
    return (
        <SafeAreaView style={{ flex: 1 }}>
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginHorizontal: 50, gap: 20 }}>
                <Text style={{ padding: 10, backgroundColor: "#998e8e69", borderRadius: 10 }}>BEM VINDO AO MEU APP MARAVILHOSO DE EXERCÍCIOS DE REACT NATIVE!</Text>
                <Text style={{ padding: 10, backgroundColor: "#ef3434be", borderRadius: 10 }}>Estou usando Drawer Routes, então navegue pelas abas do lado!</Text>
            </View>
            <StatusBar style="auto" />
        </SafeAreaView>
    )
}