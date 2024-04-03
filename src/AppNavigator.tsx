import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {HomeScreen} from './screens';
import Toolbar, { ToolbarAnimated, ToolbarReanimated } from './custom_toolbar';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  return (
   <Stack.Navigator screenOptions={{headerShown:false}}>
        <Stack.Screen name="home" component={HomeScreen} />
        <Stack.Group>
            <Stack.Group>
              <Stack.Screen name="toolbar" component={Toolbar} />
              <Stack.Screen name="toolbar-animated" component={ToolbarAnimated} />
              <Stack.Screen name="toolbar-reanimated" component={ToolbarReanimated}/>
            </Stack.Group>
        </Stack.Group>
   </Stack.Navigator>
  )
}

export default AppNavigator
