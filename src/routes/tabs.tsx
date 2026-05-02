import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from '../screens/Home/HomeScreen';
import FamilyPet from '../screens/FamilyPet/FamilyPetScreen';
import DicasPet from '../screens/DicasPet/DicasPetScreen';
import UserProfile from '../screens/UserProfile/UserProfileScreen';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';


const { Navigator, Screen } = createBottomTabNavigator();

export function TabRoutes() {
    return (
        <Navigator id='tab-routes' screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#4784ff',
            tabBarInactiveTintColor: '#747474',
            tabBarStyle: {
                backgroundColor: '#000',
                position: 'absolute',
                bottom: 30,
                marginHorizontal: 20,
                borderRadius: 17,
                borderTopWidth: 0,
                elevation: 5,
                height: 60,
            },
        }}>
            <Screen name='Home' component={Home} options={{
                tabBarIcon: ({ color, size }) => (
                    <FontAwesome name="home" size={size} color={color} />
                )
            }} />
            <Screen name='Family Pet' component={FamilyPet} options={{
                tabBarIcon: ({ color, size }) => (
                    <FontAwesome name="paw" size={size} color={color} />
                )
            }} />
            <Screen name='Dicas Pet' component={DicasPet} options={{
                tabBarIcon: ({ color, size }) => (
                    <MaterialIcons name="tips-and-updates" size={size} color={color} />
                )
            }} />
            <Screen name='User Profile' component={UserProfile} options={{
                tabBarIcon: ({ color, size }) => (
                    <FontAwesome name="user" size={size} color={color} />
                )
            }} />
        </Navigator>
    )
}