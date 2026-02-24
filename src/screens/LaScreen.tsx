import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  Animated,
  Easing,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Launch'>;

const BG = require('../assets/launch_bg.png');
const CENTER = require('../assets/launch_center.png');

export default function LaunchScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;

  const logoSize = Math.round(Math.min(width * 0.62, isSmall ? 200 : 240));
  const webW = Math.round(Math.min(240, width * 0.72));
  const webH = isSmall ? 56 : 64;

  const appear = useRef(new Animated.Value(0)).current; 
  const breathe = useRef(new Animated.Value(0)).current; 

  const html = useMemo(() => {
    return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        background: transparent;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }
      .wrap {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preloader {
        width: 160px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 14px;
      }

      .dot {
        width: 14px;
        height: 14px;
        border-radius: 999px;
        background: #e75e8d;
        box-shadow: 0 0 14px rgba(231, 94, 141, 0.55);
        animation: bounce 900ms infinite ease-in-out;
        transform: translateY(0);
      }
      .dot:nth-child(2){ animation-delay: 120ms; opacity: .92; }
      .dot:nth-child(3){ animation-delay: 240ms; opacity: .85; }
      .dot:nth-child(4){ animation-delay: 360ms; opacity: .78; }

      @keyframes bounce {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
    </style>
  </head>
  <body>
    <div class="wrap">
      <div class="preloader" aria-label="loading">
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
      </div>
    </div>
  </body>
</html>`;
  }, []);

  useEffect(() => {
    appear.setValue(0);
    breathe.setValue(0);

    Animated.timing(appear, {
      toValue: 1,
      duration: 520,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1100,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const t = setTimeout(() => {
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.Onboarding }],
      });
    }, 5000);

    return () => clearTimeout(t);
  }, [navigation, appear, breathe]);

  const topPad = Math.max(10, insets.top + 10);
  const bottomPad = Math.max(18, insets.bottom + (isSmall ? 10 : 14));

  const logoOpacity = appear;
  const enterScale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
  const enterY = appear.interpolate({ inputRange: [0, 1], outputRange: [14, 0] });

  const breatheScale = breathe.interpolate({ inputRange: [0, 1], outputRange: [0.965, 1.035] });

  return (
    <ImageBackground source={BG} resizeMode="cover" style={styles.bg}>
      <View style={styles.overlay}>
        <View style={[styles.centerBox, { paddingTop: topPad }]}>
          <Animated.View
            style={{
              opacity: logoOpacity,
              transform: [{ translateY: enterY }, { scale: enterScale }],
            }}
          >
            <Animated.View style={{ transform: [{ scale: breatheScale }] }}>
              <Image source={CENTER} style={{ width: logoSize, height: logoSize }} resizeMode="contain" />
            </Animated.View>
          </Animated.View>
        </View>

        <View style={[styles.webBox, { paddingBottom: bottomPad }]}>
          <View style={{ width: webW, height: webH, backgroundColor: 'transparent' }}>
            <WebView
              originWhitelist={['*']}
              source={{ html }}
              style={styles.web}
              javaScriptEnabled
              domStorageEnabled
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              bounces={false}
              overScrollMode="never"
              setSupportMultipleWindows={false}
              backgroundColor="transparent"
              opaque={false}
              androidLayerType={Platform.OS === 'android' ? 'software' : undefined}
              renderToHardwareTextureAndroid={false}
            />
          </View>

          <Text style={[styles.loadingText, { marginTop: isSmall ? 6 : 8 }]}>Loading…</Text>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
  },
  centerBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  webBox: {
    paddingTop: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  web: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0.85,
  },
});