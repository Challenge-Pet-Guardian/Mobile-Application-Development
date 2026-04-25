import { createDrawerNavigator } from '@react-navigation/drawer';
import { DrawerActions } from '@react-navigation/native';
import { Pressable, Text } from 'react-native';
import Home from '../screens/Home/HomeScreen';
import Exercicio1 from '../screens/exercicio1/Exercicio1Screen';
import Exercicio2 from '../screens/exercicio2/Exercicio2Screen';
import Exercicio3 from '../screens/exercicio3/Exercicio3Screen';

const { Navigator, Screen } = createDrawerNavigator();

export function DrawerRoutes() {
    return (
        <Navigator id='drawer-routes'
            screenOptions={({ navigation, route }) => ({
                headerLeft: ({ tintColor }) => (
                    <Pressable
                        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                        style={{ marginLeft: 16, marginRight: 3 }}>
                        <Text style={{ fontSize: 24, color: tintColor ?? '#222' }}>≡</Text>
                    </Pressable>
                ),
            })}
        >
            <Screen name='Home' component={Home} />
            <Screen name='Exercício 1' component={Exercicio1} />
            <Screen name='Exercício 2' component={Exercicio2} />
            <Screen name='Exercício 3' component={Exercicio3} />
        </Navigator>
    )
}