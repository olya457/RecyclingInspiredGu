import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  useWindowDimensions,
  Platform,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'AchievementsAllLocked'>;
const KEY_POINTS_TOTAL = '@eco_points_total';
const KEY_POINTS_EARNED_TOTAL = '@eco_points_earned_total';
const KEY_POINTS_SPENT_TOTAL = '@eco_points_spent_total';

const KEY_UNLOCKED_STORIES = '@unlocked_story_ids';
const KEY_UNLOCKED_WALLS = '@unlocked_wallpaper_ids';
const KEY_READ_STORIES = '@read_story_ids';

const KEY_QUIZ_CORRECT_TOTAL = '@quiz_correct_total';
const KEY_QUIZ_ANSWERED_TOTAL = '@quiz_answered_total';

const KEY_PURCHASES_TOTAL = '@purchases_total';
const KEY_PURCHASES_STORIES_TOTAL = '@purchases_stories_total';
const KEY_PURCHASES_WALLS_TOTAL = '@purchases_walls_total';

const IMG_LOCK_SAFE = require('../assets/ach_locked.png');
const IMG_SAFE_OPEN = require('../assets/ach_safe_open.png');

const IMG_LOCK_PIG = require('../assets/ach_locked.png');
const IMG_PIG_OPEN = require('../assets/ach_pig_open.png');

const IMG_LOCK_RECYCLE = require('../assets/ach_locked.png');
const IMG_RECYCLE_OPEN = require('../assets/ach_recycle_open.png');

const IMG_LOCK_SPEND = require('../assets/ach_locked.png');
const IMG_SPEND_OPEN = require('../assets/ach_spend_locked.png');

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

async function ensureIntKey(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) await AsyncStorage.setItem(key, '0');
  } catch {}
}

async function ensureArrayKey(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) await AsyncStorage.setItem(key, '[]');
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

async function readStringArray(key: string) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return [] as string[];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? (arr.filter((x) => typeof x === 'string') as string[]) : [];
  } catch {
    return [] as string[];
  }
}

function progress10FromValue(value: number, goal: number) {
  if (goal <= 0) return 0;
  return clamp(Math.floor((value / goal) * 10), 0, 10);
}

export default function AchievementsAllLocked({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;
  const isTiny = height < 690 || width < 360;

  const topPad = Math.max(insets.top + 10, isSmall ? 18 : 22);
  const bottomPad = Math.max(insets.bottom + 14, 18);

  const [pointsBalance, setPointsBalance] = useState(0);
  const [earnedTotal, setEarnedTotal] = useState(0);
  const [spentTotal, setSpentTotal] = useState(0);

  const [quizCorrectTotal, setQuizCorrectTotal] = useState(0);
  const [quizAnsweredTotal, setQuizAnsweredTotal] = useState(0);

  const [readCount, setReadCount] = useState(0);
  const [unlockedStoriesCount, setUnlockedStoriesCount] = useState(0);
  const [unlockedWallsCount, setUnlockedWallsCount] = useState(0);

  const [purchasesTotal, setPurchasesTotal] = useState(0);
  const [purchasesStories, setPurchasesStories] = useState(0);
  const [purchasesWalls, setPurchasesWalls] = useState(0);

  const a1 = useRef(new Animated.Value(0)).current;
  const a2 = useRef(new Animated.Value(0)).current;
  const a3 = useRef(new Animated.Value(0)).current;
  const a4 = useRef(new Animated.Value(0)).current;

  const runAnim = useCallback(() => {
    a1.setValue(0);
    a2.setValue(0);
    a3.setValue(0);
    a4.setValue(0);

    Animated.stagger(120, [
      Animated.timing(a1, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(a2, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(a3, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(a4, { toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [a1, a2, a3, a4]);

  const loadAll = useCallback(async () => {
    await Promise.all([
      ensureIntKey(KEY_POINTS_TOTAL),
      ensureIntKey(KEY_POINTS_EARNED_TOTAL),
      ensureIntKey(KEY_POINTS_SPENT_TOTAL),

      ensureIntKey(KEY_QUIZ_CORRECT_TOTAL),
      ensureIntKey(KEY_QUIZ_ANSWERED_TOTAL),

      ensureArrayKey(KEY_READ_STORIES),
      ensureArrayKey(KEY_UNLOCKED_STORIES),
      ensureArrayKey(KEY_UNLOCKED_WALLS),

      ensureIntKey(KEY_PURCHASES_TOTAL),
      ensureIntKey(KEY_PURCHASES_STORIES_TOTAL),
      ensureIntKey(KEY_PURCHASES_WALLS_TOTAL),
    ]);

    const [
      balance,
      earnedKey,
      spent,

      qCorrect,
      qAnswered,

      readArr,
      sArr,
      wArr,

      purT,
      purS,
      purW,
    ] = await Promise.all([
      readInt(KEY_POINTS_TOTAL),
      readInt(KEY_POINTS_EARNED_TOTAL),
      readInt(KEY_POINTS_SPENT_TOTAL),

      readInt(KEY_QUIZ_CORRECT_TOTAL),
      readInt(KEY_QUIZ_ANSWERED_TOTAL),

      readStringArray(KEY_READ_STORIES),
      readStringArray(KEY_UNLOCKED_STORIES),
      readStringArray(KEY_UNLOCKED_WALLS),

      readInt(KEY_PURCHASES_TOTAL),
      readInt(KEY_PURCHASES_STORIES_TOTAL),
      readInt(KEY_PURCHASES_WALLS_TOTAL),
    ]);

    const earnedFallback = balance + spent;
    const earned = Math.max(earnedKey, earnedFallback);

    setPointsBalance(balance);
    setEarnedTotal(earned);
    setSpentTotal(spent);

    setQuizCorrectTotal(qCorrect);
    setQuizAnsweredTotal(qAnswered);

    setReadCount(readArr.length);
    setUnlockedStoriesCount(sArr.length);
    setUnlockedWallsCount(wArr.length);

    setPurchasesTotal(purT);
    setPurchasesStories(purS);
    setPurchasesWalls(purW);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAll();
      runAnim();
    }, [loadAll, runAnim])
  );

  const GOAL_READ = 10;
  const GOAL_EARNED = 100;     
  const GOAL_SPENT = 50;      
  const GOAL_PURCHASES = 10;  

  const pRead = progress10FromValue(readCount, GOAL_READ);
  const pEarned = progress10FromValue(earnedTotal, GOAL_EARNED);
  const pSpent = progress10FromValue(spentTotal, GOAL_SPENT);
  const pUnlocked = progress10FromValue(purchasesTotal, GOAL_PURCHASES);

  const gridW = Math.min(420, width - 28);
  const gap = isTiny ? 12 : 14;

  const tileW = Math.floor((gridW - gap) / 2);
  const tileH = isTiny ? 232 : isSmall ? 246 : 260;

  const iconBox = isTiny ? 112 : isSmall ? 120 : 126;
  const titleSize = isTiny ? 12 : 13;
  const barH = isTiny ? 16 : 18;
  const topBtnSize = isTiny ? 46 : isSmall ? 50 : 52;

  const cardAnim = (v: Animated.Value) => ({
    opacity: v,
    transform: [
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) },
      { scale: v.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) },
    ],
  });

  const Bar = ({ value }: { value: number }) => {
    const pct = clamp(value / 10, 0, 1);
    const minW = pct > 0 ? 14 : 0; 

    return (
      <View style={[styles.barTrack, { height: barH }]}>
        <View style={[styles.barFill, { width: `${pct * 100}%`, minWidth: minW }]} />
      </View>
    );
  };

  function AchievementTile(props: {
    w: number;
    h: number;
    iconBox: number;
    titleSize: number;
    title: string;
    progress: number;
    iconLocked: any;
    iconOpen: any;
    extraLines?: string[];
  }) {
    const unlocked = props.progress >= 10;
    const img = unlocked ? props.iconOpen : props.iconLocked;

    return (
      <View style={[styles.tile, { width: props.w, height: props.h }]}>
        <View style={[styles.iconWrap, { width: props.iconBox, height: props.iconBox }]}>
          <Image source={img} style={{ width: props.iconBox, height: props.iconBox }} resizeMode="contain" />
        </View>

        <Text style={[styles.tileTitle, { fontSize: props.titleSize }]} numberOfLines={1}>
          {props.title}
        </Text>

        {!!props.extraLines?.length && (
          <View style={styles.extraBox}>
            {props.extraLines.slice(0, 3).map((t) => (
              <Text key={t} style={styles.extraText} numberOfLines={1}>
                {t}
              </Text>
            ))}
          </View>
        )}

        <View style={{ width: '100%', paddingHorizontal: 14, marginTop: 10 }}>
          <Bar value={props.progress} />
        </View>

        <Text style={styles.progressText}>{`Progress: ${props.progress}/10`}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.topBar}>
        <Pressable
          onPress={() => navigation.navigate(ROUTES.Menu)}
          style={[styles.topBtn, { width: topBtnSize, height: topBtnSize }]}
          hitSlop={10}
        >
          <Text style={styles.topIcon}>≡</Text>
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { fontSize: isTiny ? 18 : 20 }]}>Achievements</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate(ROUTES.Settings)}
          style={[styles.topBtn, { width: topBtnSize, height: topBtnSize }]}
          hitSlop={10}
        >
          <Text style={styles.topIcon}>⚙</Text>
        </Pressable>
      </View>

      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{ alignItems: 'center', paddingBottom: 22 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: gridW, marginTop: isTiny ? 10 : 14 }}>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <Animated.View style={[cardAnim(a1), { marginRight: gap, marginBottom: gap }]}>
              <AchievementTile
                w={tileW}
                h={tileH}
                iconBox={iconBox}
                titleSize={titleSize}
                title="Articles Read"
                progress={pRead}
                iconLocked={IMG_LOCK_SAFE}
                iconOpen={IMG_SAFE_OPEN}
                extraLines={[`Read: ${readCount}`]}
              />
            </Animated.View>

            <Animated.View style={[cardAnim(a2), { marginBottom: gap }]}>
              <AchievementTile
                w={tileW}
                h={tileH}
                iconBox={iconBox}
                titleSize={titleSize}
                title="Points Earned"
                progress={pEarned}
                iconLocked={IMG_LOCK_PIG}
                iconOpen={IMG_PIG_OPEN}
                extraLines={[
                  `Quiz correct: ${quizCorrectTotal}`,
                  `Quiz answered: ${quizAnsweredTotal}`,
                ]}
              />
            </Animated.View>

            <Animated.View style={[cardAnim(a3), { marginRight: gap, marginBottom: gap }]}>
              <AchievementTile
                w={tileW}
                h={tileH}
                iconBox={iconBox}
                titleSize={titleSize}
                title="Points Spent"
                progress={pSpent}
                iconLocked={IMG_LOCK_SPEND}
                iconOpen={IMG_SPEND_OPEN}
                extraLines={[`Spent total: ${spentTotal}`]}
              />
            </Animated.View>

            <Animated.View style={[cardAnim(a4), { marginBottom: gap }]}>
              <AchievementTile
                w={tileW}
                h={tileH}
                iconBox={iconBox}
                titleSize={titleSize}
                title="Content Unlocked"
                progress={pUnlocked}
                iconLocked={IMG_LOCK_RECYCLE}
                iconOpen={IMG_RECYCLE_OPEN}
                extraLines={[
                  `Purchases total: ${purchasesTotal}`,
                  `Stories: ${purchasesStories} | Walls: ${purchasesWalls}`,
                ]}
              />
            </Animated.View>
          </View>
          <View style={{ marginTop: 6, alignItems: 'center' }}>
            <Text style={{ color: 'rgba(255,255,255,0.55)', fontWeight: '800', fontSize: 10 }}>
              {`Balance: ${pointsBalance} | Earned: ${earnedTotal} | Spent: ${spentTotal}`}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={{ height: Platform.OS === 'ios' ? 6 : 10 }} />
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
  },
  topCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: '#FFFFFF', fontWeight: '900' },

  topBtn: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  topIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, opacity: 0.95 },

  tile: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 10,
    paddingBottom: 12,
  },

  iconWrap: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
    marginBottom: 10,
  },

  tileTitle: { color: '#0B0B0B', fontWeight: '900', textAlign: 'center', paddingHorizontal: 10 },

  extraBox: { width: '100%', paddingHorizontal: 14, marginTop: 6, alignItems: 'center' },
  extraText: { color: 'rgba(255,255,255,0.88)', fontWeight: '900', fontSize: 11, textAlign: 'center' },

  barTrack: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: 'rgba(0,0,0,0.18)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  barFill: { height: '100%', borderRadius: 999, backgroundColor: '#24B55B', alignSelf: 'flex-start' },

  progressText: { marginTop: 10, color: 'rgba(255,255,255,0.88)', fontWeight: '900', fontSize: 11 },
});