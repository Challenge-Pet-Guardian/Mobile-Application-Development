import { Text, View } from "react-native";

export default function Header() {
    return (
        <View style={{
            alignItems: "center",
            padding: 16,
            margin: 16,
            marginBottom: 0,
            borderRadius: 16,
            backgroundColor: "#416f9b"
        }}>
            <Text style={{
                fontSize: 15,
                color: "#fff",
                fontWeight: "600"
            }}>Exercícios</Text>
        </View>
    )
}