import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, AppState, Alert, Platform, Linking } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Geolocation from '@react-native-community/geolocation';
import SignupScreen from './src/authflow/signupScreen';

import LoginScreen from './src/authflow/loginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';
import LocationAlert from './src/components/LocationAlert';

const Stack = createNativeStackNavigator();

function App(): React.JSX.Element {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [locationAlertVisible, setLocationAlertVisible] = useState(false);

  const handleOpenSettings = () => {
    setLocationAlertVisible(false);
    if (Platform.OS === 'ios') {
      Linking.openSettings();
    } else {
      Linking.sendIntent('android.settings.LOCATION_SOURCE_SETTINGS').catch(() => {
        Linking.openSettings();
      });
    }
  };

  const checkLocationEnabled = () => {
    Geolocation.getCurrentPosition(
      () => {
        // Location is on and working
        console.log('Location services enabled');
      },
      (error) => {
        if (error.code === 2) { // POSITION_UNAVAILABLE
          setLocationAlertVisible(true);
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 10000 }
    );
  };

  useEffect(() => {
    const handleAppStateChange = (nextAppState: any) => {
      if (nextAppState === 'active') {
        checkLocationEnabled();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Check on initial load too
    checkLocationEnabled();

    return () => {
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (token) {
          setInitialRoute('Home');
        } else {
          setInitialRoute('Signup');
        }
      } catch (e) {
        setInitialRoute('Signup');
      }
    };
    checkToken();
  }, []);

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRoute}>
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>

      <LocationAlert
        visible={locationAlertVisible}
        onClose={() => setLocationAlertVisible(false)}
        onConfirm={handleOpenSettings}
      />
    </View>
  );
}

export default App;
