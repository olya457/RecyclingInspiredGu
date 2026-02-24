import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  PanResponder,
  useWindowDimensions,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'MiniGamePlay'>;

type Category = 'paper' | 'plastic' | 'glass' | 'organic';

type FallingItem = {
  uid: string;
  id: string;
  category: Category;
  source: any;
  x: number;
  y: Animated.Value;
};

const KEY_POINTS_TOTAL = '@eco_points_total';

async function addEcoPoints(delta: number) {
  try {
    const raw = await AsyncStorage.getItem(KEY_POINTS_TOTAL);
    const cur = raw ? parseInt(raw, 10) : 0;
    const safeCur = Number.isFinite(cur) ? cur : 0;
    const next = Math.max(0, safeCur + delta);
    await AsyncStorage.setItem(KEY_POINTS_TOTAL, String(next));
    return next;
  } catch {
    return null;
  }
}

const BIN_PAPER = require('../assets/bin_paper.png');
const BIN_PLASTIC = require('../assets/bin_plastic.png');
const BIN_GLASS = require('../assets/bin_glass.png');
const BIN_ORGANIC = require('../assets/bin_organic.png');

const HERO_WIN = require('../assets/quiz_hero_win.png');
const HERO_LOSE = require('../assets/quiz_hero_lose.png');

const PAPER_ITEMS = [
  { id: 'p1', source: require('../assets/paper1.png') },
  { id: 'p2', source: require('../assets/paper2.png') },
  { id: 'p3', source: require('../assets/paper3.png') },
  { id: 'p4', source: require('../assets/paper4.png') },
  { id: 'p5', source: require('../assets/paper5.png') },
];

const PLASTIC_ITEMS = [
  { id: 'pl1', source: require('../assets/plastic1.png') },
  { id: 'pl2', source: require('../assets/plastic2.png') },
  { id: 'pl3', source: require('../assets/plastic3.png') },
  { id: 'pl4', source: require('../assets/plastic4.png') },
  { id: 'pl5', source: require('../assets/plastic5.png') },
];

const GLASS_ITEMS = [
  { id: 'g1', source: require('../assets/glass1.png') },
  { id: 'g2', source: require('../assets/glass2.png') },
  { id: 'g3', source: require('../assets/glass3.png') },
  { id: 'g4', source: require('../assets/glass4.png') },
  { id: 'g5', source: require('../assets/glass5.png') },
];

const ORGANIC_ITEMS = [
  { id: 'o1', source: require('../assets/organic1.png') },
  { id: 'o2', source: require('../assets/organic2.png') },
  { id: 'o3', source: require('../assets/organic3.png') },
  { id: 'o4', source: require('../assets/organic4.png') },
  { id: 'o5', source: require('../assets/organic5.png') },
];

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

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

function poolFor(category: Category) {
  switch (category) {
    case 'paper':
      return PAPER_ITEMS;
    case 'plastic':
      return PLASTIC_ITEMS;
    case 'glass':
      return GLASS_ITEMS;
    case 'organic':
      return ORGANIC_ITEMS;
  }
}

type Phase = 'playing' | 'lose' | 'win';

export default function MiniGamePlayScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isFocused = useIsFocused();

  const category = route.params.category;

  const isSmall = height < 740 || width < 375;
  const isTiny = height < 690 || width < 360;

  const topPad = Math.max(insets.top + 10, isSmall ? 14 : 18);
  const bottomPad = Math.max(insets.bottom + 12, 14);

  const topBarH = isTiny ? 56 : 62;

  const itemSize = isTiny ? 40 : isSmall ? 46 : 54;
  const binW = isTiny ? 70 : isSmall ? 80 : 92;
  const binH = isTiny ? 80 : isSmall ? 94 : 108;

  const playW = width;
  const playH = height;

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [phase, setPhase] = useState<Phase>('playing');
  const [items, setItems] = useState<FallingItem[]>([]);

  const phaseRef = useRef<Phase>('playing');
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const [fxText, setFxText] = useState<string | null>(null);
  const fxOpacity = useRef(new Animated.Value(0)).current;
  const fxLift = useRef(new Animated.Value(0)).current;
  const fxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showFx = useCallback(
    (text: string) => {
      if (fxTimer.current) clearTimeout(fxTimer.current);

      setFxText(text);
      fxOpacity.setValue(0);
      fxLift.setValue(0);

      Animated.parallel([
        Animated.timing(fxOpacity, {
          toValue: 1,
          duration: 140,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fxLift, {
          toValue: -16,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();

      fxTimer.current = setTimeout(() => {
        Animated.timing(fxOpacity, {
          toValue: 0,
          duration: 180,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(({ finished }) => {
          if (finished) setFxText(null);
        });
      }, 1000);
    },
    [fxLift, fxOpacity]
  );

  useEffect(() => {
    return () => {
      if (fxTimer.current) clearTimeout(fxTimer.current);
    };
  }, []);

  const correctPool = useMemo(() => poolFor(category), [category]);

  const wrongPool = useMemo(() => {
    const all: { id: string; category: Category; source: any }[] = [];
    (['paper', 'plastic', 'glass', 'organic'] as Category[]).forEach((c) => {
      poolFor(c).forEach((it) => all.push({ id: it.id, category: c, source: it.source }));
    });
    return all.filter((x) => x.category !== category);
  }, [category]);

  const binX = useRef(new Animated.Value((playW - binW) / 2)).current;
  const binXValue = useRef((playW - binW) / 2);

  useEffect(() => {
    const sub = binX.addListener(({ value }) => {
      binXValue.current = value;
    });
    return () => {
      binX.removeListener(sub);
    };
  }, [binX]);

  useEffect(() => {
    const center = (playW - binW) / 2;
    binX.setValue(center);
    binXValue.current = center;
  }, [playW, binW, binX]);

  const gestureStartX = useRef(0);

  const moveTo = useCallback(
    (x: number) => {
      const next = clamp(x, 10, playW - binW - 10);
      binX.setValue(next);
    },
    [binX, binW, playW]
  );

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 2,
      onPanResponderGrant: () => {
        gestureStartX.current = binXValue.current;
      },
      onPanResponderMove: (_, g) => {
        if (phaseRef.current !== 'playing') return;
        moveTo(gestureStartX.current + g.dx);
      },
      onPanResponderRelease: () => {},
      onPanResponderTerminate: () => {},
    })
  ).current;

  const spawnOne = useCallback(() => {
    if (phaseRef.current !== 'playing') return;

    const chooseCorrect = Math.random() < 0.7;
    const chosen = chooseCorrect
      ? { ...correctPool[Math.floor(Math.random() * correctPool.length)], category }
      : wrongPool[Math.floor(Math.random() * wrongPool.length)];

    if (!chosen) return;

    const uid = `${Date.now()}_${Math.random().toString(16).slice(2)}`;

    const spawnX = Math.round(12 + Math.random() * (playW - itemSize - 24));
    const y = new Animated.Value(-itemSize - 20);

    const baseSpeed = isTiny ? 4000 : isSmall ? 3700 : 3400;
    const jitter = Math.round(Math.random() * (isTiny ? 450 : 650));
    const speedMs = baseSpeed + jitter;

    const it: FallingItem = {
      uid,
      id: chosen.id,
      category: chosen.category,
      source: chosen.source,
      x: spawnX,
      y,
    };

    setItems((prev) => [...prev, it]);

    Animated.timing(y, {
      toValue: playH + 90,
      duration: speedMs,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (!finished) return;
      if (phaseRef.current !== 'playing') return;
      setItems((prev) => prev.filter((x) => x.uid !== uid));
    });
  }, [category, correctPool, wrongPool, playH, playW, itemSize, isSmall, isTiny]);

  useEffect(() => {
    setPhase('playing');
    setScore(0);
    setLives(3);
    setItems([]);

    const t0 = setTimeout(() => spawnOne(), 260);
    const t1 = setTimeout(() => spawnOne(), 860);

    const interval = setInterval(() => {
      spawnOne();
    }, isTiny ? 1120 : isSmall ? 1040 : 960);

    return () => {
      clearTimeout(t0);
      clearTimeout(t1);
      clearInterval(interval);
    };
  }, [category, spawnOne, isSmall, isTiny]);

  useEffect(() => {
    const tick = setInterval(() => {
      if (phaseRef.current !== 'playing') return;

      const binLeft = binXValue.current;
      const binRight = binLeft + binW;

      const binLift = 20;
      const catchY = playH - bottomPad - binH - (isTiny ? 10 : 14) - binLift;
      const catchBand = isTiny ? 22 : 26;

      setItems((prev) => {
        let hitUid: string | null = null;

        for (const it of prev) {
          // @ts-ignore
          const yVal: number = typeof it.y.__getValue === 'function' ? it.y.__getValue() : it.y._value;

          const withinY = yVal >= catchY - catchBand && yVal <= catchY + catchBand;
          if (!withinY) continue;

          const itemLeft = it.x;
          const itemRight = it.x + itemSize;
          const overlapX = itemRight >= binLeft + 10 && itemLeft <= binRight - 10;

          if (overlapX) {
            hitUid = it.uid;
            break;
          }
        }

        if (!hitUid) return prev;

        const hit = prev.find((x) => x.uid === hitUid);
        if (!hit) return prev;

        const next = prev.filter((x) => x.uid !== hitUid);

        if (hit.category === category) {
          setScore((s) => s + 1);
          showFx('+1');
          addEcoPoints(1);
        } else {
          setLives((l) => Math.max(0, l - 1));
          showFx('-❤️');
        }

        return next;
      });
    }, isTiny ? 90 : 80);

    return () => clearInterval(tick);
  }, [binW, binH, bottomPad, category, itemSize, playH, isTiny, showFx]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (lives <= 0) setPhase('lose');
  }, [lives, phase]);

  const winScore = 12;
  useEffect(() => {
    if (phase !== 'playing') return;
    if (score >= winScore) setPhase('win');
  }, [score, phase]);

  const onMenu = () => navigation.navigate(ROUTES.Menu);
  const onSettings = () => navigation.navigate(ROUTES.Settings);

  const restart = () => {
    setPhase('playing');
    setScore(0);
    setLives(3);
    setItems([]);
    navigation.replace(ROUTES.MiniGamePlay, { category });
  };

  const backToPick = () => {
    setPhase('playing');
    navigation.replace(ROUTES.MiniGameIntroNotChosenContainer);
  };

  const hero = phase === 'win' ? HERO_WIN : HERO_LOSE;
  const heroW = Math.min(isTiny ? 210 : isSmall ? 240 : 280, width - 84);
  const heroH = heroW;

  const resultCardW = Math.min(430, width - (isTiny ? 34 : 44));
  const resultCardH = isTiny ? 118 : 130;

  const restartW = isTiny ? 126 : 140;
  const restartH = isTiny ? 34 : 36;

  const titleSize = isTiny ? 17 : isSmall ? 19 : 20;

  const binLift = 20;
  const fxLeft = clamp(binXValue.current + binW / 2 - 24, 12, width - 60);
  const fxBottom = bottomPad + (isTiny ? 6 : 8) + 20 + binH + 10;

  useFocusEffect(
    useCallback(() => {
      return () => {
        setPhase('playing');
        setFxText(null);
        try {
          fxOpacity.setValue(0);
          fxLift.setValue(0);
        } catch {}
        if (fxTimer.current) {
          clearTimeout(fxTimer.current);
          fxTimer.current = null;
        }
      };
    }, [fxLift, fxOpacity])
  );

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]} {...pan.panHandlers}>
      <View style={[styles.topBar, { height: topBarH }]}>
        <Pressable onPress={onMenu} style={styles.topBtn} hitSlop={10}>
          <Text style={styles.topIcon}>≡</Text>
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { fontSize: titleSize }]}>Current Score: {score}</Text>
          <Text style={[styles.livesText, { marginTop: 4, fontSize: isTiny ? 15 : 16 }]}>{'❤️'.repeat(lives)}</Text>
        </View>

        <Pressable onPress={onSettings} style={styles.topBtn} hitSlop={10}>
          <Text style={styles.topIcon}>⚙</Text>
        </Pressable>
      </View>

      {phase === 'playing' && (
        <>
          {items.map((it) => (
            <Animated.View
              key={it.uid}
              style={[
                styles.itemWrap,
                {
                  width: itemSize,
                  height: itemSize,
                  left: it.x,
                  transform: [{ translateY: it.y }],
                },
              ]}
              pointerEvents="none"
            >
              <Image source={it.source} style={{ width: itemSize, height: itemSize }} resizeMode="contain" />
            </Animated.View>
          ))}

          <Animated.View
            style={[
              styles.binWrap,
              {
                width: binW,
                height: binH,
                transform: [{ translateX: binX }],
                bottom: bottomPad + (isTiny ? 6 : 8) + binLift,
              },
            ]}
            pointerEvents="none"
          >
            <Image source={catBin(category)} style={{ width: binW, height: binH }} resizeMode="contain" />
          </Animated.View>

          {fxText && (
            <Animated.View
              pointerEvents="none"
              style={[
                styles.fxWrap,
                {
                  left: fxLeft,
                  bottom: fxBottom,
                  opacity: fxOpacity,
                  transform: [{ translateY: fxLift }],
                },
              ]}
            >
              <Text style={[styles.fxText, { fontSize: isTiny ? 18 : 20 }]}>{fxText}</Text>
            </Animated.View>
          )}
        </>
      )}

      <Modal transparent visible={isFocused && phase !== 'playing'} animationType="fade" onRequestClose={() => setPhase('playing')}>
        <View style={[styles.resultsOverlay, { paddingTop: topPad + topBarH + (isTiny ? 16 : 22) }]}>
          <View style={{ alignItems: 'center', width: '100%' }}>
            <View style={[styles.resultCard, { width: resultCardW, height: resultCardH }]}>
              <Text style={styles.resultTitle}>{phase === 'win' ? 'Well Done!' : 'Better Luck Next Time'}</Text>
              <Text style={styles.resultLine}>Your result: {score}</Text>
              <Text style={styles.resultLine2}>
                You received: <Text style={{ fontWeight: '900' }}>{phase === 'win' ? 'x 2' : 'x 0'}</Text>
              </Text>
            </View>

            <Image source={hero} style={{ width: heroW, height: heroH, marginTop: isTiny ? 16 : 24 }} resizeMode="contain" />

            <Pressable onPress={restart} style={[styles.restartBtn, { width: restartW, height: restartH, marginTop: isTiny ? 12 : 16 }]}>
              <Text style={styles.restartText}>Restart</Text>
            </Pressable>

            <Pressable onPress={backToPick} style={{ marginTop: 10 }} hitSlop={10}>
              <Text style={styles.changeText}>Change bin</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3A1E8A' },

  topBar: {
    width: '100%',
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
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
  topIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, opacity: 0.95 },
  topCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: '#FFFFFF', fontWeight: '900' },
  livesText: { color: '#FFFFFF', fontWeight: '900' },

  itemWrap: { position: 'absolute', top: 0 },
  binWrap: { position: 'absolute', left: 0 },

  fxWrap: {
    position: 'absolute',
    zIndex: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  fxText: {
    color: '#FFFFFF',
    fontWeight: '900',
    textAlign: 'center',
  },

  resultsOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.0)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
  },
  resultCard: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  resultTitle: {
    color: '#0B0B0B',
    fontWeight: '900',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultLine: {
    color: '#0B0B0B',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 6,
  },
  resultLine2: {
    color: '#0B0B0B',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
  },

  restartBtn: {
    borderRadius: 10,
    backgroundColor: '#2BB673',
    alignItems: 'center',
    justifyContent: 'center',
  },
  restartText: { color: '#111', fontWeight: '900', fontSize: 14 },
  changeText: {
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '800',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
});