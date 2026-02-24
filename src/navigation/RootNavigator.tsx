import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ROUTES } from './routes';

import LaunchScreen from '../screens/LaScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import MenuScreen from '../screens/MenuScreen';
import SettingsScreen from '../screens/SettingsScreen';

import ArticlesHubScreen from '../screens/ArticlesHubScreen'; 

import ArticlesPaper from '../screens/ArticPaper';
import QuizIntro from '../screens/QuizIntro';
import MiniGameIntroNotChosenContainer from '../screens/MiniGameIntroContainer';
import MiniGamePlayScreen from '../screens/MiniGameScreen';
import PointsExchangeArticles from '../screens/PointsExcArticles';
import AchievementsAllLocked from '../screens/AchievementsLocked';

export type RootStackParamList = {
  Launch: undefined;
  Onboarding: undefined;
  Menu: undefined;
  Settings: undefined;

  ArticlesHub: undefined;

  ArticlesPaper: undefined;
  QuizIntro: undefined;

  MiniGameIntroNotChosenContainer: undefined;
  MiniGamePlay: { category: 'paper' | 'plastic' | 'glass' | 'organic' };

  PointsExchangeArticles: undefined;
  AchievementsAllLocked: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={ROUTES.Launch}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name={ROUTES.Launch} component={LaunchScreen} />
        <Stack.Screen name={ROUTES.Onboarding} component={OnboardingScreen} />
        <Stack.Screen name={ROUTES.Menu} component={MenuScreen} />
        <Stack.Screen name={ROUTES.Settings} component={SettingsScreen} />
        <Stack.Screen name={ROUTES.ArticlesHub} component={ArticlesHubScreen} />
        <Stack.Screen name={ROUTES.ArticlesPaper} component={ArticlesPaper} />
        <Stack.Screen name={ROUTES.QuizIntro} component={QuizIntro} />

        <Stack.Screen
          name={ROUTES.MiniGameIntroNotChosenContainer}
          component={MiniGameIntroNotChosenContainer}
        />

        <Stack.Screen
          name={ROUTES.MiniGamePlay}
          component={MiniGamePlayScreen}
          options={{
            headerShown: false,
            animation: 'fade',
            gestureEnabled: false,
          }}
        />

        <Stack.Screen
          name={ROUTES.PointsExchangeArticles}
          component={PointsExchangeArticles}
        />
        <Stack.Screen
          name={ROUTES.AchievementsAllLocked}
          component={AchievementsAllLocked}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}