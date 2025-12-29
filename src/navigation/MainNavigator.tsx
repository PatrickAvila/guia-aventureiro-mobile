// mobile/src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { GenerateScreen } from '../screens/GenerateScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ItineraryDetailScreen } from '../screens/ItineraryDetailScreen';
import { EditPreferencesScreen } from '../screens/EditPreferencesScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { ExploreScreen } from '../screens/ExploreScreen';
import { useColors } from '../hooks/useColors';
import { Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { EditItineraryScreen } from '../screens/EditItineraryScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack do Dashboard (adicionar EditItinerary)
const DashboardStack = () => {
  return (
    <Stack.Navigator
      id="DashboardStack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DashboardMain" component={DashboardScreen} />
      <Stack.Screen name="ItineraryDetail" component={ItineraryDetailScreen} />
      <Stack.Screen name="EditItinerary" component={EditItineraryScreen} />
    </Stack.Navigator>
  );
};

// Stack de Geração (pode adicionar mais telas depois)
const GenerateStack = () => {
  return (
    <Stack.Navigator
      id="GenerateStack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="GenerateMain" component={GenerateScreen} />
      <Stack.Screen name="ItineraryDetail" component={ItineraryDetailScreen} />
    </Stack.Navigator>
  );
};

// Stack de Perfil
const ProfileStack = () => {
  return (
    <Stack.Navigator
      id="ProfileStack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditPreferences" component={EditPreferencesScreen} />
      <Stack.Screen name="Achievements" component={AchievementsScreen} />
    </Stack.Navigator>
  );
};

// Stack de Explorar
const ExploreStack = () => {
  return (
    <Stack.Navigator
      id="ExploreStack"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ExploreMain" component={ExploreScreen} />
      <Stack.Screen name="ItineraryDetail" component={ItineraryDetailScreen} />
    </Stack.Navigator>
  );
};

// Ícones customizados (simples, usando emoji)
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{icon}</Text>
);

export const MainNavigator = () => {
  const colors = useColors();
  
  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          paddingBottom: 20,
          paddingTop: 8,
          height: 85,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          backgroundColor: colors.card,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarLabel: 'Roteiros',
          tabBarIcon: ({ focused }) => <TabIcon icon="🗺️" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreStack}
        options={{
          tabBarLabel: 'Explorar',
          tabBarIcon: ({ focused }) => <TabIcon icon="🌍" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Generate"
        component={GenerateStack}
        options={{
          tabBarLabel: 'Criar',
          tabBarIcon: ({ focused }) => <TabIcon icon="✨" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    fontSize: 24,
    opacity: 0.5,
  },
  tabIconFocused: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
});