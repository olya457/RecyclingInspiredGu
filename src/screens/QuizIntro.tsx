import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
  Modal,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'QuizIntro'>;

type TF = true | false;

type QuizItem = {
  id: string;
  category: 'paper' | 'plastic' | 'glass' | 'organic';
  articleTitle: string;
  statement: string;
  answer: TF;
};

const IMG_PAPER_1 = require('../assets/paper_1.png');
const IMG_PAPER_2 = require('../assets/paper_2.png');
const IMG_PAPER_3 = require('../assets/paper_3.png');

const IMG_PLASTIC_1 = require('../assets/plastic_1.png');
const IMG_PLASTIC_2 = require('../assets/plastic_2.png');
const IMG_PLASTIC_3 = require('../assets/plastic_3.png');

const IMG_GLASS_1 = require('../assets/glass_1.png');
const IMG_GLASS_2 = require('../assets/glass_2.png');
const IMG_GLASS_3 = require('../assets/glass_3.png');

const IMG_ORGANIC_1 = require('../assets/organic_1.png');
const IMG_ORGANIC_2 = require('../assets/organic_2.png');
const IMG_ORGANIC_3 = require('../assets/organic_3.png');

const HERO_NEUTRAL = require('../assets/quiz_hero_neutral.png');
const HERO_HAPPY = require('../assets/quiz_hero_happy.png');
const HERO_SAD = require('../assets/quiz_hero_sad.png');
const HERO_WIN = require('../assets/quiz_hero_win.png');
const HERO_LOSE = require('../assets/quiz_hero_lose.png');

const ICO_COIN = require('../assets/eco_coin.png');

type Phase = 'intro' | 'question' | 'feedback' | 'win' | 'lose';
const KEY_POINTS_TOTAL = '@eco_points_total';
const KEY_POINTS_EARNED_TOTAL = '@eco_points_earned_total';
const KEY_QUIZ_CORRECT_TOTAL = '@quiz_correct_total';
const KEY_QUIZ_ANSWERED_TOTAL = '@quiz_answered_total';

const TOTAL_QUESTIONS = 25;
const WIN_AT = 20;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

async function ensureIntKey(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) await AsyncStorage.setItem(key, '0');
  } catch {}
}

async function readInt(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

async function writeInt(key: string, n: number) {
  try {
    await AsyncStorage.setItem(key, String(n));
  } catch {}
}

function getArticleImage(category: QuizItem['category'], articleTitle: string) {
  if (category === 'paper') {
    if (articleTitle.includes('What Belongs')) return IMG_PAPER_1;
    if (articleTitle.includes('How to Prepare')) return IMG_PAPER_2;
    return IMG_PAPER_3;
  }
  if (category === 'plastic') {
    if (articleTitle.includes('What Belongs')) return IMG_PLASTIC_1;
    if (articleTitle.includes('How to Prepare')) return IMG_PLASTIC_2;
    return IMG_PLASTIC_3;
  }
  if (category === 'glass') {
    if (articleTitle.includes('What Belongs')) return IMG_GLASS_1;
    if (articleTitle.includes('Preparing')) return IMG_GLASS_2;
    return IMG_GLASS_3;
  }
  if (articleTitle.includes('What Belongs')) return IMG_ORGANIC_1;
  if (articleTitle.includes('How Organic Waste')) return IMG_ORGANIC_2;
  return IMG_ORGANIC_3;
}

export default function QuizIntro({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;
  const isTiny = height < 690 || width < 360;

  const topPad = Math.max(insets.top + 10, isSmall ? 18 : 22);
  const bottomPad = Math.max(insets.bottom + 12, 14);

  const quiz: QuizItem[] = useMemo(() => {
    const full: QuizItem[] = [
      { id: 'p-1-1', category: 'paper', articleTitle: 'What Belongs in the Paper Container', statement: 'Newspapers and magazines can be placed in the paper container.', answer: true },
      { id: 'p-1-2', category: 'paper', articleTitle: 'What Belongs in the Paper Container', statement: 'Wet or greasy paper can always be recycled with paper.', answer: false },
      { id: 'p-1-3', category: 'paper', articleTitle: 'What Belongs in the Paper Container', statement: 'Cardboard boxes should be flattened before recycling.', answer: true },

      { id: 'p-2-1', category: 'paper', articleTitle: 'How to Prepare Paper for Recycling', statement: 'Paper should be clean and dry before recycling.', answer: true },
      { id: 'p-2-2', category: 'paper', articleTitle: 'How to Prepare Paper for Recycling', statement: 'Plastic windows in envelopes should always remain attached.', answer: false },
      { id: 'p-2-3', category: 'paper', articleTitle: 'How to Prepare Paper for Recycling', statement: 'Flattening cardboard helps improve recycling efficiency.', answer: true },

      { id: 'p-3-1', category: 'paper', articleTitle: 'Why Recycling Paper Matters', statement: 'Recycling paper helps reduce the number of trees cut down.', answer: true },
      { id: 'p-3-2', category: 'paper', articleTitle: 'Why Recycling Paper Matters', statement: 'Recycling paper increases landfill waste.', answer: false },
      { id: 'p-3-3', category: 'paper', articleTitle: 'Why Recycling Paper Matters', statement: 'Paper can be recycled into new paper products.', answer: true },

      { id: 'pl-1-1', category: 'plastic', articleTitle: 'What Belongs in the Plastic Container', statement: 'Empty plastic bottles can be recycled.', answer: true },
      { id: 'pl-1-2', category: 'plastic', articleTitle: 'What Belongs in the Plastic Container', statement: 'Plastic containers filled with liquid should be recycled immediately.', answer: false },
      { id: 'pl-1-3', category: 'plastic', articleTitle: 'What Belongs in the Plastic Container', statement: 'Plastic packaging can be placed in the plastic container.', answer: true },

      { id: 'pl-2-1', category: 'plastic', articleTitle: 'How to Prepare Plastic for Recycling', statement: 'Plastic containers should be empty before recycling.', answer: true },
      { id: 'pl-2-2', category: 'plastic', articleTitle: 'How to Prepare Plastic for Recycling', statement: 'Plastic items covered in food should always be recycled without preparation.', answer: false },
      { id: 'pl-2-3', category: 'plastic', articleTitle: 'How to Prepare Plastic for Recycling', statement: 'Compressing plastic bottles helps save space.', answer: true },

      { id: 'pl-3-1', category: 'plastic', articleTitle: 'Why Plastic Recycling Is Important', statement: 'Plastic recycling helps reduce pollution.', answer: true },
      { id: 'pl-3-2', category: 'plastic', articleTitle: 'Why Plastic Recycling Is Important', statement: 'Plastic decomposes quickly in nature.', answer: false },
      { id: 'pl-3-3', category: 'plastic', articleTitle: 'Why Plastic Recycling Is Important', statement: 'Recycled plastic can be used to create new products.', answer: true },

      { id: 'g-1-1', category: 'glass', articleTitle: 'What Belongs in the Glass Container', statement: 'Glass bottles can be recycled.', answer: true },
      { id: 'g-1-2', category: 'glass', articleTitle: 'What Belongs in the Glass Container', statement: 'Mirrors should be placed in glass recycling containers.', answer: false },
      { id: 'g-1-3', category: 'glass', articleTitle: 'What Belongs in the Glass Container', statement: 'Glass jars belong in the glass container.', answer: true },

      { id: 'g-2-1', category: 'glass', articleTitle: 'Preparing Glass for Recycling', statement: 'Glass should be empty before recycling.', answer: true },
      { id: 'g-2-2', category: 'glass', articleTitle: 'Preparing Glass for Recycling', statement: 'Glass containers filled with food should be recycled immediately.', answer: false },
      { id: 'g-2-3', category: 'glass', articleTitle: 'Preparing Glass for Recycling', statement: 'Glass labels usually do not need to be removed.', answer: true },

      { id: 'g-3-1', category: 'glass', articleTitle: 'Environmental Benefits of Glass Recycling', statement: 'Glass can be recycled multiple times.', answer: true },
      { id: 'g-3-2', category: 'glass', articleTitle: 'Environmental Benefits of Glass Recycling', statement: 'Recycling glass increases environmental damage.', answer: false },
      { id: 'g-3-3', category: 'glass', articleTitle: 'Environmental Benefits of Glass Recycling', statement: 'Recycling glass reduces landfill waste.', answer: true },

      { id: 'o-1-1', category: 'organic', articleTitle: 'What Belongs in the Organic Container', statement: 'Banana peels belong in the organic container.', answer: true },
      { id: 'o-1-2', category: 'organic', articleTitle: 'What Belongs in the Organic Container', statement: 'Plastic belongs in the organic container.', answer: false },
      { id: 'o-1-3', category: 'organic', articleTitle: 'What Belongs in the Organic Container', statement: 'Vegetable scraps can be placed in organic waste.', answer: true },

      { id: 'o-2-1', category: 'organic', articleTitle: 'How Organic Waste Is Recycled', statement: 'Organic waste can be turned into compost.', answer: true },
      { id: 'o-2-2', category: 'organic', articleTitle: 'How Organic Waste Is Recycled', statement: 'Organic waste cannot be reused.', answer: false },
      { id: 'o-2-3', category: 'organic', articleTitle: 'How Organic Waste Is Recycled', statement: 'Compost can help plants grow.', answer: true },

      { id: 'o-3-1', category: 'organic', articleTitle: 'Why Organic Recycling Matters', statement: 'Organic recycling helps reduce landfill waste.', answer: true },
      { id: 'o-3-2', category: 'organic', articleTitle: 'Why Organic Recycling Matters', statement: 'Organic waste never decomposes naturally.', answer: false },
      { id: 'o-3-3', category: 'organic', articleTitle: 'Why Organic Recycling Matters', statement: 'Recycling organic waste helps the environment.', answer: true },
    ];

    return full.slice(0, TOTAL_QUESTIONS);
  }, []);

  const total = quiz.length;

  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [runScore, setRunScore] = useState(0);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [interruptVisible, setInterruptVisible] = useState(false);

  const item = quiz[idx];
  const qImage = item ? getArticleImage(item.category, item.articleTitle) : IMG_PAPER_1;

  const appear = useRef(new Animated.Value(0)).current;
  const heroPop = useRef(new Animated.Value(0)).current;
  const cardA = useRef(new Animated.Value(0)).current;
  const cardY = useRef(new Animated.Value(12)).current;

  const btnTrueScale = useRef(new Animated.Value(1)).current;
  const btnFalseScale = useRef(new Animated.Value(1)).current;

  const shakeX = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;

  const pointsPop = useRef(new Animated.Value(0)).current;
  const pointsY = useRef(new Animated.Value(8)).current;

  const runAppear = useCallback(() => {
    appear.setValue(0);
    heroPop.setValue(0);
    cardA.setValue(0);
    cardY.setValue(12);
    shakeX.setValue(0);
    glow.setValue(0);

    Animated.parallel([
      Animated.timing(appear, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.sequence([
        Animated.delay(60),
        Animated.timing(heroPop, { toValue: 1, duration: 340, easing: Easing.out(Easing.back(1.18)), useNativeDriver: true }),
      ]),
      Animated.sequence([
        Animated.delay(80),
        Animated.parallel([
          Animated.timing(cardA, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
          Animated.timing(cardY, { toValue: 0, duration: 250, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [appear, heroPop, cardA, cardY, shakeX, glow]);

  useEffect(() => {
    (async () => {
      await Promise.all([
        ensureIntKey(KEY_POINTS_TOTAL),
        ensureIntKey(KEY_POINTS_EARNED_TOTAL),
        ensureIntKey(KEY_QUIZ_CORRECT_TOTAL),
        ensureIntKey(KEY_QUIZ_ANSWERED_TOTAL),
      ]);
    })();
  }, []);

  useEffect(() => {
    runAppear();
  }, [runAppear, phase, idx]);

  const popPoints = useCallback(() => {
    pointsPop.stopAnimation();
    pointsY.stopAnimation();

    pointsPop.setValue(0);
    pointsY.setValue(10);

    Animated.sequence([
      Animated.parallel([
        Animated.timing(pointsPop, { toValue: 1, duration: 220, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(pointsY, { toValue: 0, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(650),
      Animated.timing(pointsPop, { toValue: 0, duration: 220, easing: Easing.in(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [pointsPop, pointsY]);

  const onMenu = () => {
    if (phase === 'intro') {
      navigation.navigate(ROUTES.Menu);
      return;
    }
    setInterruptVisible(true);
  };

  const onSettings = () => {
    navigation.navigate(ROUTES.Settings);
  };

  const resetQuiz = () => {
    setPhase('intro');
    setIdx(0);
    setRunScore(0);
    setAnsweredCount(0);
    setLastCorrect(null);
    setInterruptVisible(false);
  };

  const startQuiz = () => {
    setPhase('question');
    setIdx(0);
    setRunScore(0);
    setAnsweredCount(0);
    setLastCorrect(null);
  };

  const pulseGood = () => {
    glow.setValue(0);
    Animated.sequence([
      Animated.timing(glow, { toValue: 1, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(glow, { toValue: 0, duration: 240, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const shakeBad = () => {
    shakeX.setValue(0);
    Animated.sequence([
      Animated.timing(shakeX, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: -1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 1, duration: 50, easing: Easing.linear, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue: 0, duration: 70, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const pressScale = (v: Animated.Value) => {
    v.setValue(1);
    Animated.sequence([
      Animated.timing(v, { toValue: 0.96, duration: 70, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(v, { toValue: 1, duration: 120, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  };

  const addBalanceAndEarned = useCallback(async (delta: number) => {
    const [bal, earned] = await Promise.all([readInt(KEY_POINTS_TOTAL), readInt(KEY_POINTS_EARNED_TOTAL)]);
    const nextBal = bal + delta;
    const nextEarned = earned + Math.max(0, delta);
    await Promise.all([writeInt(KEY_POINTS_TOTAL, nextBal), writeInt(KEY_POINTS_EARNED_TOTAL, nextEarned)]);
  }, []);

  const addQuizStats = useCallback(async (isCorrect: boolean) => {
    const [c, a] = await Promise.all([readInt(KEY_QUIZ_CORRECT_TOTAL), readInt(KEY_QUIZ_ANSWERED_TOTAL)]);
    const nextA = a + 1;
    const nextC = isCorrect ? c + 1 : c;
    await Promise.all([writeInt(KEY_QUIZ_CORRECT_TOTAL, nextC), writeInt(KEY_QUIZ_ANSWERED_TOTAL, nextA)]);
  }, []);

  const answer = async (val: TF) => {
    if (phase !== 'question' || !item) return;

    pressScale(val ? btnTrueScale : btnFalseScale);

    const correct = val === item.answer;
    setLastCorrect(correct);
    setAnsweredCount((c) => c + 1);

    await addQuizStats(correct);

    if (correct) {
      setRunScore((s) => s + 1);
      await addBalanceAndEarned(1);
      popPoints();
      pulseGood();
    } else {
      shakeBad();
    }

    setPhase('feedback');
  };

  const next = () => {
    if (phase !== 'feedback') return;

    const nextIndex = idx + 1;

    if (nextIndex >= total) {
      const pass = runScore >= WIN_AT;
      setPhase(pass ? 'win' : 'lose');
      return;
    }

    setIdx(nextIndex);
    setPhase('question');
    setLastCorrect(null);
  };

  const heroImage =
    phase === 'intro' || phase === 'question'
      ? HERO_NEUTRAL
      : phase === 'feedback'
      ? lastCorrect
        ? HERO_HAPPY
        : HERO_SAD
      : phase === 'win'
      ? HERO_WIN
      : HERO_LOSE;

  const headerTitle = phase === 'intro' ? 'Quiz' : `Current Score: ${runScore}`;

  const panelTitle =
    phase === 'intro'
      ? 'Test Your Recycling Knowledge'
      : phase === 'question'
      ? item.articleTitle
      : phase === 'feedback'
      ? item.articleTitle
      : phase === 'win'
      ? 'Well Done!'
      : 'Better Luck Next Time';

  const showTF = phase === 'question';
  const showNext = phase === 'feedback';
  const showStart = phase === 'intro';
  const showRestart = phase === 'win' || phase === 'lose';

  const cardW = Math.min(392, width - 28);
  const heroH = clamp(height * 0.38, isTiny ? 230 : isSmall ? 260 : 300, isTiny ? 330 : isSmall ? 360 : 420);

  const panelPad = isTiny ? 12 : isSmall ? 14 : 16;
  const iconSize = isTiny ? 44 : isSmall ? 48 : 52;
  const titleSize = isTiny ? 13 : 14;
  const bodySize = isTiny ? 12 : 12.5;
  const btnW = isTiny ? 132 : 140;
  const btnH = isTiny ? 40 : 44;

  const shakeTranslate = shakeX.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-8, 0, 8],
  });

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.22],
  });

  const showPageCounter = phase === 'question' || phase === 'feedback';
  const pageCounterText = `${clamp(idx + 1, 1, total)}/${total}`;

  const receivedThisRun = runScore;

  const panelBody =
    phase === 'intro'
      ? `Read each statement and decide whether it is true or false.\n\nWin condition: ${WIN_AT} correct out of ${TOTAL_QUESTIONS}.`
      : phase === 'question'
      ? item.statement
      : phase === 'feedback'
      ? item.statement
      : `Your result: ${runScore}\nAnswered: ${answeredCount}/${total}\n\nYou received:`;

  const toastTop = Math.max(topPad + 64, 96);

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={onMenu} style={styles.topBtn} hitSlop={10}>
          <Text style={styles.topIcon}>≡</Text>
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { fontSize: isTiny ? 18 : 20 }]}>{headerTitle}</Text>
        </View>

        <Pressable onPress={onSettings} style={styles.topBtn} hitSlop={10}>
          <Text style={styles.topIcon}>⚙</Text>
        </Pressable>
      </View>

      <Animated.View
        style={[
          styles.heroWrap,
          {
            height: heroH,
            opacity: appear,
            transform: [
              {
                translateY: appear.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-8, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Animated.Image
          source={heroImage}
          style={[
            styles.hero,
            {
              transform: [
                {
                  scale: heroPop.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.92, 1],
                  }),
                },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.panel,
          {
            width: cardW,
            opacity: cardA,
            transform: [{ translateY: cardY }, { translateX: shakeTranslate }],
            padding: panelPad,
          },
        ]}
      >
        <Animated.View style={[styles.goodGlow, { opacity: glowOpacity }]} />

        <View style={styles.panelTopRow}>
          <Image source={qImage} style={[styles.panelIcon, { width: iconSize, height: iconSize }]} resizeMode="contain" />
          <Text style={[styles.panelTitle, { fontSize: titleSize, lineHeight: titleSize + 4 }]} numberOfLines={2}>
            {panelTitle}
          </Text>
        </View>

        <Text style={[styles.panelBody, { fontSize: bodySize, lineHeight: bodySize + 6 }]}>{panelBody}</Text>

        {(phase === 'win' || phase === 'lose') && (
          <View style={styles.rewardRow}>
            <Image source={ICO_COIN} style={styles.coin} resizeMode="contain" />
            <Text style={styles.rewardText}>x {receivedThisRun}</Text>
          </View>
        )}

        {showPageCounter && (
          <View style={styles.pageRow}>
            <Text style={[styles.pageText, { fontSize: isTiny ? 12 : 13 }]}>{pageCounterText}</Text>
          </View>
        )}

        {showTF && (
          <View style={styles.tfRow}>
            <Animated.View style={{ transform: [{ scale: btnTrueScale }] }}>
              <Pressable style={[styles.tfBtn, styles.tfTrue, { width: btnW, height: btnH }]} onPress={() => answer(true)}>
                <Text style={[styles.tfText, { fontSize: isTiny ? 14 : 15 }]}>True</Text>
              </Pressable>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: btnFalseScale }] }}>
              <Pressable style={[styles.tfBtn, styles.tfFalse, { width: btnW, height: btnH }]} onPress={() => answer(false)}>
                <Text style={[styles.tfText, { fontSize: isTiny ? 14 : 15 }]}>False</Text>
              </Pressable>
            </Animated.View>
          </View>
        )}

        {showStart && (
          <Pressable style={[styles.primaryBtn, { width: isTiny ? 220 : 240, height: btnH }]} onPress={startQuiz}>
            <Text style={[styles.primaryText, { fontSize: isTiny ? 14 : 15 }]}>Start</Text>
          </Pressable>
        )}

        {showNext && (
          <Pressable style={[styles.primaryBtn, { width: isTiny ? 220 : 240, height: btnH }]} onPress={next}>
            <Text style={[styles.primaryText, { fontSize: isTiny ? 14 : 15 }]}>Next</Text>
          </Pressable>
        )}

        {showRestart && (
          <Pressable style={[styles.primaryBtn, { width: isTiny ? 220 : 240, height: btnH }]} onPress={resetQuiz}>
            <Text style={[styles.primaryText, { fontSize: isTiny ? 14 : 15 }]}>Restart</Text>
          </Pressable>
        )}
      </Animated.View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.pointsToast,
          {
            top: toastTop,
            opacity: pointsPop,
            transform: [{ translateY: pointsY }],
          },
        ]}
      >
        <View style={styles.pointsToastInner}>
          <Image source={ICO_COIN} style={styles.pointsToastCoin} resizeMode="contain" />
          <Text style={styles.pointsToastText}>+1 point</Text>
        </View>
      </Animated.View>

      <Modal transparent visible={interruptVisible} animationType="fade" onRequestClose={() => setInterruptVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { width: Math.min(340, width - 40) }]}>
            <Text style={styles.modalTitle}>Interrupt Quiz?</Text>
            <Text style={styles.modalBodyText}>Are you sure?</Text>

            <View style={styles.modalBtns}>
              <Pressable style={[styles.modalBtn, styles.modalCancel]} onPress={() => setInterruptVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={[styles.modalBtn, styles.modalConfirm]}
                onPress={() => {
                  setInterruptVisible(false);
                  resetQuiz();
                }}
              >
                <Text style={styles.modalBtnText}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: Platform.OS === 'ios' ? 6 : 10 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3A1E8A', alignItems: 'center' },

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
  topIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, opacity: 0.95 },
  topCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: '#FFFFFF', fontWeight: '900' },

  heroWrap: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  hero: { width: '86%', height: '100%' },

  panel: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  goodGlow: { position: 'absolute', left: -40, right: -40, top: -60, bottom: -60, backgroundColor: '#24B55B' },

  panelTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  panelIcon: { borderRadius: 14 },
  panelTitle: { flex: 1, color: '#FFFFFF', fontWeight: '900' },
  panelBody: { color: '#FFFFFF', fontWeight: '600', opacity: 0.95, marginBottom: 12 },

  rewardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 2, marginBottom: 10 },
  coin: { width: 22, height: 22 },
  rewardText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12, opacity: 0.95 },

  pageRow: { alignItems: 'center', justifyContent: 'center', marginBottom: 12, marginTop: -2 },
  pageText: { color: 'rgba(255,255,255,0.85)', fontWeight: '900' },

  tfRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  tfBtn: { borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  tfTrue: { backgroundColor: '#24B55B' },
  tfFalse: { backgroundColor: '#F05555' },
  tfText: { color: '#111', fontWeight: '900' },

  primaryBtn: { alignSelf: 'center', marginTop: 6, borderRadius: 14, backgroundColor: '#6FD0FF', alignItems: 'center', justifyContent: 'center' },
  primaryText: { color: '#111', fontWeight: '900' },

  pointsToast: { position: 'absolute', alignSelf: 'center', zIndex: 999, elevation: 999 },
  pointsToastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  pointsToastCoin: { width: 18, height: 18 },
  pointsToastText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  modalCard: { borderRadius: 18, backgroundColor: '#B58BEA', padding: 16 },
  modalTitle: { color: '#111', fontWeight: '900', fontSize: 14, textAlign: 'center', marginBottom: 6 },
  modalBodyText: { color: '#111', fontWeight: '700', fontSize: 12, textAlign: 'center', opacity: 0.85, marginBottom: 12 },
  modalBtns: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  modalBtn: { flex: 1, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalCancel: { backgroundColor: '#24B55B' },
  modalConfirm: { backgroundColor: '#F05555' },
  modalBtnText: { color: '#111', fontWeight: '900', fontSize: 12 },
});