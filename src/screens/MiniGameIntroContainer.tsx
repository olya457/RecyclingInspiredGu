import React, { useMemo, useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  useWindowDimensions,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'MiniGameIntroNotChosenContainer'>;

type Category = 'paper' | 'plastic' | 'glass' | 'organic';

const BIN_PAPER = require('../assets/bin_paper.png');
const BIN_PLASTIC = require('../assets/bin_plastic.png');
const BIN_GLASS = require('../assets/bin_glass.png');
const BIN_ORGANIC = require('../assets/bin_organic.png');

function catBin(category: Category) {
  switch (category) {
    case 'paper':
      return BIN_PAPER;
    case 'plastic':
      return BIN_PLASTIC;
    case 'glass':
      return BIN_GLASS;
    case 'organic':
      return BIN_ORGANIC;
  }
}

export default function MiniGameIntroNotChosenContainer({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;
  const isTiny = height < 690 || width < 360;

  const topPad = Math.max(insets.top + 10, isSmall ? 14 : 18);
  const bottomPad = Math.max(insets.bottom + 12, 14);

  const [selected, setSelected] = useState<Category | null>(null);

  const cardA = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(14)).current;
  const binsA = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    cardA.setValue(0);
    cardY.setValue(14);
    binsA.setValue(0);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(cardA, {
          toValue: 1,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(cardY, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(binsA, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [cardA, cardY, binsA]);

  const tiles = useMemo(
    () =>
      [
        { category: 'paper' as const },
        { category: 'plastic' as const },
        { category: 'glass' as const },
        { category: 'organic' as const },
      ] satisfies { category: Category }[],
    []
  );

  const contentW = Math.min(420, width - 28);

  const cardPad = isTiny ? 14 : isSmall ? 16 : 18;
  const h1Size = isTiny ? 18 : isSmall ? 20 : 22;
  const pSize = isTiny ? 12 : 13;

  const gridGap = isTiny ? 12 : 14;
  const gridW = Math.min(360, contentW);
  const tileW = Math.floor((gridW - gridGap) / 2);
  const tileH = isTiny ? 132 : isSmall ? 148 : 162;

  const binImg = isTiny ? 88 : isSmall ? 96 : 104;

  const startW = Math.min(220, contentW);
  const startH = isTiny ? 42 : 46;

  const onStart = () => {
    if (!selected) return;
    navigation.navigate(ROUTES.MiniGamePlay, { category: selected });
  };
  const startLift = isTiny ? 22 : 50;

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.navigate(ROUTES.Menu)} style={styles.topBtn} hitSlop={10}>
          <Text style={styles.topIcon}>≡</Text>
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { fontSize: isTiny ? 18 : 20 }]}>Mini Game</Text>
        </View>

        <Pressable onPress={() => navigation.navigate(ROUTES.Settings)} style={styles.topBtn} hitSlop={10}>
          <Text style={styles.topIcon}>⚙</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.card,
          {
            width: contentW,
            padding: cardPad,
            opacity: cardA,
            transform: [{ translateY: cardY }],
            marginTop: isTiny ? 8 : 12,
          },
        ]}
      >

        <Text
          style={[
            styles.h1,
            { fontSize: h1Size, lineHeight: h1Size + 6, textAlign: 'center' },
          ]}
        >
          Choose a Container{'\n'}and Start
        </Text>

        <Text
          style={[
            styles.p,
            { fontSize: pSize, lineHeight: pSize + 7, textAlign: 'center' },
          ]}
        >
          Select a recycling container and{'\n'}
          tap only the items that belong in{'\n'}
          it. Avoid incorrect items and don’t{'\n'}
          miss the correct ones. Earn Eco{'\n'}
          Points by sorting waste correctly.
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.gridWrap,
          {
            width: gridW,
            marginTop: isTiny ? 18 : 22,
            opacity: binsA,
          },
        ]}
      >
        <View style={[styles.grid, { gap: gridGap }]}>
          {tiles.map((t) => {
            const isSelected = selected === t.category;
            return (
              <Pressable
                key={t.category}
                onPress={() => setSelected(t.category)}
                style={[
                  styles.tile,
                  { width: tileW, height: tileH },
                  isSelected ? styles.tileSelected : styles.tileIdle,
                ]}
              >
                <Image
                  source={catBin(t.category)}
                  resizeMode="contain"
                  style={{
                    width: binImg,
                    height: binImg,
                    opacity: isSelected ? 1 : 0.55,
                  }}
                />
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <View style={{ flex: 1 }} />

      <View style={{ transform: [{ translateY: -startLift }] }}>
        <Pressable
          onPress={onStart}
          disabled={!selected}
          style={[
            styles.startBtn,
            {
              width: startW,
              height: startH,
              opacity: selected ? 1 : 0.45,
            },
          ]}
        >
          <Text style={[styles.startText, { fontSize: isTiny ? 15 : 16 }]}>Start</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#3A1E8A',
  },

  topBar: {
    width: '100%',
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  topIcon: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
    opacity: 0.95,
  },
  topCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topTitle: {
    color: '#FFFFFF',
    fontWeight: '900',
  },

  card: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  h1: {
    color: '#000',
    fontWeight: '900',
    marginBottom: 10,
  },
  p: {
    color: '#000',
    fontWeight: '600',
    opacity: 0.9,
  },

  gridWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileIdle: {
    backgroundColor: 'rgba(0,0,0,0.00)',
  },
  tileSelected: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  startBtn: {
    borderRadius: 14,
    backgroundColor: '#24B55B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startText: {
    color: '#111',
    fontWeight: '900',
  },
});