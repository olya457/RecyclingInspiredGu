import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing, Image, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Menu'>;

const LOGO = require('../assets/menu_logo.png');
const HERO = require('../assets/hero_articles.png');

type Item = {
  key: string;
  label: string;
  route:
    | typeof ROUTES.ArticlesPaper
    | typeof ROUTES.QuizIntro
    | typeof ROUTES.MiniGameIntroNotChosenContainer
    | typeof ROUTES.PointsExchangeArticles
    | typeof ROUTES.AchievementsAllLocked;
};

export default function MenuScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;
  const isVerySmall = height < 690 || width < 360;

  const items: Item[] = useMemo(
    () => [
      { key: 'articles', label: 'Articles', route: ROUTES.ArticlesPaper },
      { key: 'quiz', label: 'Quiz', route: ROUTES.QuizIntro },
      { key: 'mini', label: 'Mini Game', route: ROUTES.MiniGameIntroNotChosenContainer },
      { key: 'exchange', label: 'Exchange Eco Points', route: ROUTES.PointsExchangeArticles },
      { key: 'ach', label: 'Achievements', route: ROUTES.AchievementsAllLocked },
    ],
    []
  );

  const [focused, setFocused] = useState(0);

  const appear = useRef(new Animated.Value(0)).current;
  const hiliteY = useRef(new Animated.Value(0)).current;

  const rowH = isVerySmall ? 40 : isSmall ? 44 : 48;
  const listW = Math.min(560, width - 40);
  const hiliteH = isVerySmall ? 30 : isSmall ? 34 : 36;
  const hiliteRadius = 16;

  const listTopPad = isVerySmall ? 6 : isSmall ? 8 : 10;
  const listBottomPad = isVerySmall ? 4 : isSmall ? 6 : 8;

  const topPad = insets.top + (isVerySmall ? 10 : 14);

  const logoSize = Math.round(Math.min(230, width * (isSmall ? 0.44 : 0.48)));

  const calcHiliteTop = (i: number) => listTopPad + i * rowH + Math.round((rowH - hiliteH) / 2);

  useEffect(() => {
    setFocused(0);
    hiliteY.setValue(calcHiliteTop(0));

    appear.setValue(0);
    Animated.timing(appear, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const moveHilite = (i: number) => {
    Animated.timing(hiliteY, {
      toValue: calcHiliteTop(i),
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const openItem = (i: number) => {
    setFocused(i);
    moveHilite(i);

    const r = items[i].route;
    setTimeout(() => navigation.navigate(r as any), 120);
  };

  const openArticlesHub = () => navigation.navigate(ROUTES.ArticlesHub as any);
  const openSettings = () => navigation.navigate(ROUTES.Settings as any);

  const fadeIn = appear.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const down = appear.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] });

  const leftCircleSize = isSmall ? 120 : 150;
  const rightCircleSize = isSmall ? 100 : 120;

  const heroW = listW;
  const heroHBase = Math.round(heroW * (isVerySmall ? 0.52 : isSmall ? 0.50 : 0.46));
  const heroH = heroHBase + (isVerySmall ? 20 : 30);
  const heroPad = isVerySmall ? 12 : isSmall ? 14 : 16;

  return (
    <View style={styles.root}>
      <View
        pointerEvents="none"
        style={[
          styles.leftCircle,
          { width: leftCircleSize, height: leftCircleSize, borderRadius: leftCircleSize, top: topPad + 40, left: 20 },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.rightCircle,
          { width: rightCircleSize, height: rightCircleSize, borderRadius: rightCircleSize, top: topPad + 90, right: 22 },
        ]}
      />

      <Animated.View
        style={[
          styles.centerWrap,
          {
            paddingTop: topPad,
            opacity: fadeIn,
            transform: [{ translateY: down }],
          },
        ]}
      >
        <View style={[styles.heroCard, { width: heroW, height: heroH }]}>
          <Image source={HERO} style={styles.heroImg} resizeMode="cover" />
          <View style={[styles.heroOverlay, { padding: heroPad }]}>
            <Text style={[styles.heroTitle, { fontSize: isVerySmall ? 18 : isSmall ? 20 : 22 }]}>
              The Impact of Trash{'\n'}on Nature
            </Text>

            <Text style={[styles.heroDesc, { fontSize: isVerySmall ? 12 : 13 }]}>
              Learn how litter affects water, soil, and wildlife — and what simple habits can reduce waste.
            </Text>

            <View style={{ flex: 1 }} />

            <Pressable onPress={openArticlesHub} style={styles.heroBtn}>
              <Text style={styles.heroBtnText}>Open articles</Text>
            </Pressable>
          </View>
        </View>

        <View style={{ height: isVerySmall ? 10 : 12 }} />

        <View style={styles.headerUnderHero}>
          <Text style={[styles.header, { fontSize: isSmall ? 20 : 22 }]}>Menu</Text>
          <Text style={[styles.sub, { fontSize: isSmall ? 13 : 14 }]}>Tap to open a section</Text>
        </View>

        <View style={{ height: isVerySmall ? 10 : 14 }} />

        <View style={[styles.list, { width: listW, paddingTop: listTopPad, paddingBottom: listBottomPad }]}>
          <Animated.View
            pointerEvents="none"
            style={[
              styles.hilite,
              { top: hiliteY, left: 0, right: 0, height: hiliteH, borderRadius: hiliteRadius },
            ]}
          />
          {items.map((it, i) => (
            <Pressable key={it.key} onPress={() => openItem(i)} style={[styles.row, { height: rowH }]}>
              <Text style={[styles.rowText, { fontSize: isVerySmall ? 24 : isSmall ? 26 : 28 }]}>{it.label}</Text>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={openSettings}
          style={[
            styles.settingsBtn,
            {
              marginTop: isVerySmall ? 10 : isSmall ? 12 : 14,
              width: Math.min(320, width - 110),
              height: isVerySmall ? 56 : isSmall ? 60 : 62,
            },
          ]}
        >
          <Text style={[styles.settingsText, { fontSize: isVerySmall ? 18 : isSmall ? 20 : 22 }]}>Settings</Text>
        </Pressable>

        <View style={{ height: isVerySmall ? 8 : 10 }} />

        <Image source={LOGO} style={{ width: logoSize, height: logoSize, opacity: 0.95 }} resizeMode="contain" />

        <View style={{ height: Math.max(insets.bottom, 12) }} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#6B4BD9' },

  centerWrap: { flex: 1, alignItems: 'center', justifyContent: 'flex-start', paddingHorizontal: 20 },

  headerUnderHero: { alignItems: 'center' },
  header: { color: '#FFFFFF', fontWeight: '800' },
  sub: { marginTop: 6, color: '#FFFFFF', opacity: 0.65, fontWeight: '700' },

  heroCard: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroImg: { ...StyleSheet.absoluteFillObject, width: undefined, height: undefined },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)' },

  heroTitle: { color: '#FFFFFF', fontWeight: '900', lineHeight: 24 },
  heroDesc: { marginTop: 8, color: 'rgba(255,255,255,0.90)', fontWeight: '700', maxWidth: '96%', lineHeight: 18 },

  heroBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(240,139,197,0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  heroBtnText: { color: '#111', fontWeight: '900', fontSize: 14 },

  list: { alignSelf: 'center' },
  hilite: { position: 'absolute', backgroundColor: '#F08BC5', opacity: 0.95 },
  row: { alignItems: 'center', justifyContent: 'center' },
  rowText: { color: '#111', fontWeight: '900', textAlign: 'center' },

  settingsBtn: {
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsText: { color: '#FFFFFF', fontWeight: '900' },

  leftCircle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.10)' },
  rightCircle: { position: 'absolute', backgroundColor: 'rgba(255,255,255,0.10)' },
});