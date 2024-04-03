import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './AppNavigator';

const AppControlFlow: React.FC=() => {
  return (
    <NavigationContainer>
        <GestureHandlerRootView style={{flex:1}}>
            <AppNavigator />
        </GestureHandlerRootView>
    </NavigationContainer>
  )
}

export default AppControlFlow
