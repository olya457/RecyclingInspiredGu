import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, Animated, Easing, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const IMG_1 = require('../assets/onb_1.png');
const IMG_2 = require('../assets/onb_2.png');
const IMG_3 = require('../assets/onb_3.png');
const IMG_4 = require('../assets/onb_4.png');

type Slide = { key: string; image: any; title: string; body: string };

export default function OnboardingScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;
  const isTiny = height < 690 || width < 360;

  const slides: Slide[] = useMemo(
    () => [
      {
        key: 's1',
        image: IMG_1,
        title: 'Inspired: Recycling Guide',
        body: 'Learn how to correctly sort paper, plastic, glass, and organic waste. Build simple habits that help protect the environment every day.',
      },
      {
        key: 's2',
        image: IMG_2,
        title: 'Learn with Clear Guides',
        body: 'Explore easy articles that explain what belongs in each container and how to avoid common recycling mistakes.',
      },
      {
        key: 's3',
        image: IMG_3,
        title: 'Test Your Knowledge',
        body: 'Answer simple true or false questions and improve your understanding of proper waste sorting through interactive learning.',
      },
      {
        key: 's4',
        image: IMG_4,
        title: 'Practice and Track Progress',
        body: 'Complete training activities, earn eco points, and unlock new content as you develop responsible recycling habits.',
      },
    ],
    []
  );

  const [index, setIndex] = useState(0);
  const slide = slides[index];

  const appear = useRef(new Animated.Value(0)).current;
  const imgFloat = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    appear.setValue(0);
    imgFloat.setValue(0);
    Animated.parallel([
      Animated.timing(appear, {
        toValue: 1,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(imgFloat, {
        toValue: 1,
        duration: 520,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [index]);

  const goMenu = () => navigation.reset({ index: 0, routes: [{ name: ROUTES.Menu }] });

  const onNext = () => {
    if (index >= slides.length - 1) goMenu();
    else setIndex((v) => Math.min(v + 1, slides.length - 1));
  };

  const side = isTiny ? 14 : isSmall ? 16 : 20;
  const gapBetweenHeroAndPanel = 0; 
  const panelBottom = Math.max(insets.bottom + (isTiny ? 46 : 50), 50);
  const panelMinH = isTiny ? 180 : isSmall ? 200 : 220;
  const panelRadius = isTiny ? 22 : 28;

  const topAreaH = Math.max(
    140,
    height - (panelBottom + panelMinH + gapBetweenHeroAndPanel) - Math.max(insets.top, 0)
  );

  const heroMax = isTiny ? 240 : isSmall ? 320 : 500;
  const heroH = Math.min(topAreaH, heroMax);

  const heroOpacity = appear.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const heroScale = appear.interpolate({ inputRange: [0, 1], outputRange: [0.98, 1] });
  const heroTranslateY = imgFloat.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  const panelOpacity = appear.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });
  const panelTranslateY = appear.interpolate({ inputRange: [0, 1], outputRange: [15, 0] });

  const titleSize = isTiny ? 16 : isSmall ? 17 : 18;
  const bodySize = isTiny ? 12 : isSmall ? 12.5 : 13;
  const bodyLines = isTiny ? 3 : 4;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.top,
          {
            height: topAreaH,
            paddingTop: Math.max(insets.top, 10),
            paddingBottom: gapBetweenHeroAndPanel,
            overflow: 'hidden',
          },
        ]}
      >
        <Animated.View
          style={[
            styles.heroWrap,
            {
              height: heroH,
              opacity: heroOpacity,
              transform: [{ translateY: heroTranslateY }, { scale: heroScale }],
            },
          ]}
        >
          <Image source={slide.image} style={[styles.hero, { width }]} resizeMode="contain" />
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.panel,
          {
            left: side,
            right: side,
            bottom: panelBottom,
            minHeight: panelMinH,
            borderRadius: panelRadius,
            opacity: panelOpacity,
            transform: [{ translateY: panelTranslateY }],
            paddingTop: isTiny ? 16 : 20,
            paddingHorizontal: isTiny ? 16 : 20,
            paddingBottom: isTiny ? 12 : 16,
          },
        ]}
      >
        <Text style={[styles.title, { fontSize: titleSize }]} numberOfLines={2}>
          {slide.title}
        </Text>

        <Text style={[styles.body, { fontSize: bodySize }]} numberOfLines={bodyLines}>
          {slide.body}
        </Text>

        <View style={[styles.bottomBar, { marginTop: isTiny ? 12 : 16, height: 44 }]}>
          <Pressable onPress={goMenu} style={styles.bottomBtn} hitSlop={15}>
            <Text style={[styles.bottomBtnText, { fontSize: isTiny ? 11 : 12 }]}>Skip</Text>
          </Pressable>

          <View style={styles.dots}>
            {slides.map((s, i) => (
              <View key={s.key} style={[styles.dot, i === index ? styles.dotActive : styles.dotIdle]} />
            ))}
          </View>

          <Pressable onPress={onNext} style={styles.bottomBtn} hitSlop={15}>
            <Text style={[styles.bottomBtnText, { fontSize: isTiny ? 11 : 12 }]}>
              Next <Text style={styles.arrow}>→</Text>
            </Text>
          </Pressable>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#4B2AA6' },
  top: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  heroWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: {
    height: '100%',
  },
  panel: {
    position: 'absolute',
    backgroundColor: '#B58BEA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    lineHeight: 22,
    fontWeight: '900',
    color: '#111',
    marginBottom: 8,
    textAlign: 'center',
  },
  body: {
    lineHeight: 18,
    fontWeight: '600',
    color: '#111',
    opacity: 0.8,
    textAlign: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bottomBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  bottomBtnText: {
    fontWeight: '800',
    color: '#111',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  arrow: {
    fontSize: 14,
    fontWeight: '900',
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: { backgroundColor: '#111' },
  dotIdle: { backgroundColor: '#fff', opacity: 0.5 },
});