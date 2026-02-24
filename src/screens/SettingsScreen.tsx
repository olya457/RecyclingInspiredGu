import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Switch,
  Animated,
  Easing,
  Share,
  Modal,
  Platform,
  useWindowDimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

const KEY_VIBRATION = '@prefs_vibration_enabled';
const KEY_NOTIFICATIONS = '@prefs_notifications_enabled';

const KEY_POINTS_TOTAL = '@eco_points_total';
const KEY_POINTS_EARNED_TOTAL = '@eco_points_earned_total';
const KEY_POINTS_SPENT_TOTAL = '@eco_points_spent_total';

const KEY_QUIZ_CORRECT_TOTAL = '@quiz_correct_total';
const KEY_QUIZ_ANSWERED_TOTAL = '@quiz_answered_total';

const KEY_UNLOCKED_STORIES = '@unlocked_story_ids';
const KEY_UNLOCKED_WALLS = '@unlocked_wallpaper_ids';
const KEY_READ_STORIES = '@read_story_ids';

const KEY_PURCHASES_TOTAL = '@purchases_total';
const KEY_PURCHASES_STORIES_TOTAL = '@purchases_stories_total';
const KEY_PURCHASES_WALLS_TOTAL = '@purchases_walls_total';

const IMG_MAN = require('../assets/settings_man.png');

const ICON_GEAR = '⚙';
const ICON_BACK = '≡';

async function readBool(key: string, def = true) {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (raw === null) return def;
    return raw === '1';
  } catch {
    return def;
  }
}

async function writeBool(key: string, v: boolean) {
  try {
    await AsyncStorage.setItem(key, v ? '1' : '0');
  } catch {}
}

async function resetProgressStorage() {
  await Promise.all([
    AsyncStorage.setItem(KEY_POINTS_TOTAL, '0'),
    AsyncStorage.setItem(KEY_POINTS_EARNED_TOTAL, '0'),
    AsyncStorage.setItem(KEY_POINTS_SPENT_TOTAL, '0'),

    AsyncStorage.setItem(KEY_QUIZ_CORRECT_TOTAL, '0'),
    AsyncStorage.setItem(KEY_QUIZ_ANSWERED_TOTAL, '0'),

    AsyncStorage.setItem(KEY_READ_STORIES, '[]'),
    AsyncStorage.setItem(KEY_UNLOCKED_STORIES, '[]'),
    AsyncStorage.setItem(KEY_UNLOCKED_WALLS, '[]'),

    AsyncStorage.setItem(KEY_PURCHASES_TOTAL, '0'),
    AsyncStorage.setItem(KEY_PURCHASES_STORIES_TOTAL, '0'),
    AsyncStorage.setItem(KEY_PURCHASES_WALLS_TOTAL, '0'),
  ]);
}

export default function SettingsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;
  const isTiny = height < 690 || width < 360;

  const topPad = Math.max(insets.top + 10, isSmall ? 14 : 18);

  const topBtn = isTiny ? 46 : isSmall ? 50 : 52;
  const titleSize = isTiny ? 17 : 18;
  const rowFont = isTiny ? 15 : 16;

  const manSize = isTiny ? 210 : isSmall ? 235 : 260;
  const SHARE_RAISE_PX = 60;
  const shareBottom = insets.bottom + SHARE_RAISE_PX;
  const shareReserved = shareBottom + (isTiny ? 42 : 46);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  const [confirmVisible, setConfirmVisible] = useState(false);

  const blurA = useRef(new Animated.Value(0)).current;
  const cardA = useRef(new Animated.Value(0)).current;
  const cardS = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    (async () => {
      const [n, v] = await Promise.all([readBool(KEY_NOTIFICATIONS, true), readBool(KEY_VIBRATION, true)]);
      setNotificationsEnabled(n);
      setVibrationEnabled(v);
    })();
  }, []);

  const onToggleNotifications = useCallback(async (val: boolean) => {
    setNotificationsEnabled(val);
    await writeBool(KEY_NOTIFICATIONS, val);
  }, []);

  const onToggleVibration = useCallback(async (val: boolean) => {
    setVibrationEnabled(val);
    await writeBool(KEY_VIBRATION, val);
  }, []);

  const openConfirm = useCallback(() => {
    setConfirmVisible(true);
    blurA.setValue(0);
    cardA.setValue(0);
    cardS.setValue(0.98);

    Animated.parallel([
      Animated.timing(blurA, { toValue: 1, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardA, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardS, { toValue: 1, duration: 240, easing: Easing.out(Easing.back(1.08)), useNativeDriver: true }),
    ]).start();
  }, [blurA, cardA, cardS]);

  const closeConfirm = useCallback(() => {
    Animated.parallel([
      Animated.timing(blurA, { toValue: 0, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardA, { toValue: 0, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(cardS, { toValue: 0.985, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setConfirmVisible(false);
    });
  }, [blurA, cardA, cardS]);

  const doReset = useCallback(async () => {
    await resetProgressStorage();
    closeConfirm();
  }, [closeConfirm]);

  const onShare = useCallback(async () => {
    try {
      await Share.share({
        message: 'Recycling Inspired Guide — learn sorting habits with quick tips, quiz, and mini-game.',
      });
    } catch {}
  }, []);

  const rowIcon = useMemo(() => ({ on: '◉', off: '○' }), []);

  return (
    <View style={[styles.root, { paddingTop: topPad }]}>
      <View style={[styles.topBar, { paddingHorizontal: isTiny ? 12 : 14 }]}>
        <Pressable onPress={() => navigation.goBack()} style={[styles.topBtn, { width: topBtn, height: topBtn }]} hitSlop={10}>
          <Text style={styles.topIcon}>{ICON_BACK}</Text>
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={[styles.topTitle, { fontSize: titleSize }]}>Settings</Text>
        </View>

        <Pressable onPress={() => {}} style={[styles.topBtn, { width: topBtn, height: topBtn }]} hitSlop={10}>
          <Text style={styles.topIcon}>{ICON_GEAR}</Text>
        </Pressable>
      </View>

      <View style={[styles.rows, { paddingHorizontal: isTiny ? 18 : 22, marginTop: isTiny ? 8 : 10, gap: isTiny ? 14 : 18 }]}>
        <View style={styles.row}>
          <Text style={[styles.rowLabel, { fontSize: rowFont }]}>Notifications</Text>
          <View style={styles.rowRight}>
            <Text style={styles.rowDot}>{notificationsEnabled ? rowIcon.on : rowIcon.off}</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={onToggleNotifications}
              thumbColor={Platform.OS === 'android' ? '#111' : undefined}
              trackColor={{ false: 'rgba(0,0,0,0.18)', true: 'rgba(0,0,0,0.22)' }}
              ios_backgroundColor="rgba(0,0,0,0.18)"
              style={{ transform: [{ scaleX: isTiny ? 0.9 : 0.95 }, { scaleY: isTiny ? 0.9 : 0.95 }] }}
            />
          </View>
        </View>

        <View style={styles.row}>
          <Text style={[styles.rowLabel, { fontSize: rowFont }]}>Vibration</Text>
          <View style={styles.rowRight}>
            <Text style={styles.rowDot}>{vibrationEnabled ? rowIcon.on : rowIcon.off}</Text>
            <Switch
              value={vibrationEnabled}
              onValueChange={onToggleVibration}
              thumbColor={Platform.OS === 'android' ? '#111' : undefined}
              trackColor={{ false: 'rgba(0,0,0,0.18)', true: 'rgba(0,0,0,0.22)' }}
              ios_backgroundColor="rgba(0,0,0,0.18)"
              style={{ transform: [{ scaleX: isTiny ? 0.9 : 0.95 }, { scaleY: isTiny ? 0.9 : 0.95 }] }}
            />
          </View>
        </View>

        <Pressable onPress={openConfirm} style={styles.rowBtn} hitSlop={10}>
          <Text style={[styles.rowLabel, { fontSize: rowFont }]}>Reset Progress</Text>
          <Text style={styles.resetIcon}>↻</Text>
        </Pressable>
      </View>

      <View style={[styles.manWrap, { paddingBottom: shareReserved }]}>
        <Image source={IMG_MAN} style={{ width: manSize, height: manSize }} resizeMode="contain" />
      </View>

      <Pressable
        onPress={onShare}
        style={[
          styles.shareBtn,
          {
            bottom: shareBottom,
            height: isTiny ? 32 : 34,
            minWidth: isTiny ? 176 : 190,
            paddingHorizontal: isTiny ? 16 : 18,
            borderRadius: isTiny ? 11 : 12,
          },
        ]}
        hitSlop={10}
      >
        <Text style={[styles.shareText, { fontSize: isTiny ? 12 : 13 }]}>Share App</Text>
        <Text style={[styles.shareIcon, { fontSize: isTiny ? 13 : 14 }]}>⇪</Text>
      </Pressable>

      <Modal transparent visible={confirmVisible} animationType="none" onRequestClose={closeConfirm}>
        <Animated.View style={[styles.overlay, { opacity: blurA }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeConfirm} />
        </Animated.View>

        <View style={styles.modalHost}>
          <Animated.View
            style={[
              styles.confirmCard,
              {
                opacity: cardA,
                transform: [{ scale: cardS }],
                maxWidth: isTiny ? 320 : 360,
                paddingVertical: isTiny ? 12 : 14,
                paddingHorizontal: isTiny ? 12 : 14,
              },
            ]}
          >
            <Text style={[styles.confirmTitle, { fontSize: isTiny ? 15 : 16 }]}>Reset your progress?</Text>
            <Text style={[styles.confirmSub, { fontSize: isTiny ? 12 : 13 }]}>Are you sure?</Text>

            <View style={[styles.confirmBtns, { gap: isTiny ? 10 : 12, marginTop: isTiny ? 10 : 12 }]}>
              <Pressable onPress={closeConfirm} style={[styles.cBtn, styles.cCancel, { height: isTiny ? 24 : 26, minWidth: isTiny ? 86 : 92 }]}>
                <Text style={[styles.cText, { fontSize: isTiny ? 11 : 12 }]}>Cancel</Text>
              </Pressable>

              <Pressable onPress={doReset} style={[styles.cBtn, styles.cOk, { height: isTiny ? 24 : 26, minWidth: isTiny ? 86 : 92 }]}>
                <Text style={[styles.cText, { fontSize: isTiny ? 11 : 12 }]}>Confirm</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#6B4BD9' },

  topBar: {
    width: '100%',
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  topTitle: { color: '#FFFFFF', fontWeight: '900' },

  topBtn: {
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  topIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, opacity: 0.95 },

  rows: {},
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  rowBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  rowLabel: { color: '#0B0B0B', fontWeight: '900' },
  rowRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowDot: { color: 'rgba(0,0,0,0.35)', fontWeight: '900', fontSize: 16 },

  resetIcon: { color: 'rgba(0,0,0,0.55)', fontWeight: '900', fontSize: 18 },

  manWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },

  shareBtn: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#24B55B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  shareText: { color: '#111', fontWeight: '900' },
  shareIcon: { color: '#111', fontWeight: '900', marginTop: -1 },

  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  modalHost: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  confirmCard: { width: '100%', borderRadius: 14, backgroundColor: '#E58BCB' },
  confirmTitle: { color: '#111', fontWeight: '900', textAlign: 'center' },
  confirmSub: { color: 'rgba(17,17,17,0.85)', fontWeight: '800', textAlign: 'center', marginTop: 4 },

  confirmBtns: { flexDirection: 'row', justifyContent: 'center' },
  cBtn: { borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
  cCancel: { backgroundColor: '#24B55B' },
  cOk: { backgroundColor: '#F05555' },
  cText: { color: '#111', fontWeight: '900' },
});