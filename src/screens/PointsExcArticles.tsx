import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Modal,
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

type Props = NativeStackScreenProps<RootStackParamList, 'PointsExchangeArticles'>;

const KEY_POINTS_TOTAL = '@eco_points_total';
const KEY_POINTS_SPENT_TOTAL = '@eco_points_spent_total';

const KEY_UNLOCKED_STORIES = '@unlocked_story_ids';
const KEY_UNLOCKED_WALLS = '@unlocked_wallpaper_ids';
const KEY_READ_STORIES = '@read_story_ids';

const KEY_PURCHASES_TOTAL = '@purchases_total';
const KEY_PURCHASES_STORIES_TOTAL = '@purchases_stories_total';
const KEY_PURCHASES_WALLS_TOTAL = '@purchases_walls_total';

const ICO_COIN = require('../assets/eco_coin.png');
const ICO_LOCK = require('../assets/icon_lock.png');

const IMG_STORY_GLASS = require('../assets/cat_glass.png');
const IMG_STORY_PAPER = require('../assets/cat_paper.png');
const IMG_STORY_PLASTIC = require('../assets/cat_plastic.png');
const IMG_STORY_ORGANIC = require('../assets/cat_organic.png');

const IMG_WALL_1 = require('../assets/exchange_wall_1.png');
const IMG_WALL_2 = require('../assets/exchange_wall_2.png');
const IMG_WALL_3 = require('../assets/exchange_wall_3.png');
const IMG_WALL_4 = require('../assets/exchange_wall_4.png');

type Tab = 'articles' | 'wallpapers';

type StoreItem = {
  id: string;
  title: string;
  img: any;
  price: number;
};

type StoryItem = StoreItem & {
  storyTitle: string;
  storyBody: string;
};

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

async function writeInt(key: string, n: number) {
  try {
    await AsyncStorage.setItem(key, String(n));
  } catch {}
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

async function writeStringArray(key: string, arr: string[]) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(arr));
  } catch {}
}

export default function PointsExchangeArticles({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;
  const isTiny = height < 690 || width < 360;

  const topPad = Math.max(insets.top + 10, isSmall ? 12 : 16);
  const bottomPad = Math.max(insets.bottom + 12, 14);

  const [tab, setTab] = useState<Tab>('articles');

  const [points, setPoints] = useState(0);
  const [unlockedStories, setUnlockedStories] = useState<string[]>([]);
  const [unlockedWalls, setUnlockedWalls] = useState<string[]>([]);
  const [readStories, setReadStories] = useState<string[]>([]);

  const [confirmVisible, setConfirmVisible] = useState(false);
  const [pending, setPending] = useState<{ kind: 'story' | 'wall'; item: StoreItem } | null>(null);

  const [storyVisible, setStoryVisible] = useState(false);
  const [storyPick, setStoryPick] = useState<StoryItem | null>(null);

  const modalScale = useRef(new Animated.Value(0.96)).current;
  const modalA = useRef(new Animated.Value(0)).current;

  const storyScale = useRef(new Animated.Value(0.96)).current;
  const storyA = useRef(new Animated.Value(0)).current;

  const contentW = Math.min(420, width - 28);
  const cardW = contentW;

  const stories: StoryItem[] = useMemo(
    () => [
      {
        id: 's_glass',
        title: 'Glass Story',
        img: IMG_STORY_GLASS,
        price: 10,
        storyTitle: 'The Bottle That Came Back',
        storyBody:
          'A glass bottle rolled into the kitchen bin and almost disappeared forever. But you rinsed it, removed the cap, and placed it into the glass container.\n\nWeeks later, that same glass returned as a brand-new jar on a store shelf. Glass can be recycled again and again without losing quality.\n\nTip: keep glass empty and clean. Lids usually go to a different category, so sort them separately.',
      },
      {
        id: 's_paper',
        title: 'Paper Story',
        img: IMG_STORY_PAPER,
        price: 10,
        storyTitle: 'The Cardboard Express',
        storyBody:
          'A delivery box arrived with tape, labels, and folded corners. Instead of tossing it whole, you removed plastic film, peeled off extra tape, and flattened the box.\n\nThat simple step saved space in the container and helped the recycling line work faster. Soon, your box became new packaging and notebook pages.\n\nTip: paper and cardboard should be dry. Greasy pizza boxes usually belong in organic waste, not paper recycling.',
      },
      {
        id: 's_plastic',
        title: 'Plastic Story',
        img: IMG_STORY_PLASTIC,
        price: 10,
        storyTitle: 'The Quick Rinse Rule',
        storyBody:
          'A plastic yogurt cup looked harmless, but leftover food could ruin a whole batch. You gave it a quick rinse, let it drip dry, and placed it in the plastic container.\n\nOn the next cycle, that plastic could become new packaging—or even part of a park bench.\n\nTip: keep plastic empty. If it’s heavily greasy or mixed with food, check local rules—sometimes it belongs in general waste.',
      },
      {
        id: 's_organic',
        title: 'Organic Story',
        img: IMG_STORY_ORGANIC,
        price: 10,
        storyTitle: 'From Scraps to Soil',
        storyBody:
          'Peels, coffee grounds, and vegetable scraps looked like “trash,” but they weren’t. In the organic container, they became compost—food for soil.\n\nCompost helps plants grow and keeps organic waste out of landfills, where it can create extra pollution.\n\nTip: organic waste is for food scraps and plant leftovers—no plastic, even if it looks “soft.”',
      },
    ],
    []
  );

  const walls: StoreItem[] = useMemo(
    () => [
      { id: 'w1', title: 'Wallpaper 1', img: IMG_WALL_1, price: 5 },
      { id: 'w2', title: 'Wallpaper 2', img: IMG_WALL_2, price: 5 },
      { id: 'w3', title: 'Wallpaper 3', img: IMG_WALL_3, price: 5 },
      { id: 'w4', title: 'Wallpaper 4', img: IMG_WALL_4, price: 5 },
    ],
    []
  );

  const loadAll = useCallback(async () => {
    await Promise.all([
      ensureIntKey(KEY_POINTS_TOTAL),
      ensureIntKey(KEY_POINTS_SPENT_TOTAL),

      ensureArrayKey(KEY_UNLOCKED_STORIES),
      ensureArrayKey(KEY_UNLOCKED_WALLS),
      ensureArrayKey(KEY_READ_STORIES),

      ensureIntKey(KEY_PURCHASES_TOTAL),
      ensureIntKey(KEY_PURCHASES_STORIES_TOTAL),
      ensureIntKey(KEY_PURCHASES_WALLS_TOTAL),
    ]);

    const [p, s, w, r] = await Promise.all([
      readInt(KEY_POINTS_TOTAL),
      readStringArray(KEY_UNLOCKED_STORIES),
      readStringArray(KEY_UNLOCKED_WALLS),
      readStringArray(KEY_READ_STORIES),
    ]);

    setPoints(p);
    setUnlockedStories(s);
    setUnlockedWalls(w);
    setReadStories(r);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ✅ важно: обновлять points при каждом возврате на экран
  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const openConfirm = (kind: 'story' | 'wall', item: StoreItem) => {
    setPending({ kind, item });
    setConfirmVisible(true);

    modalA.setValue(0);
    modalScale.setValue(0.96);

    Animated.parallel([
      Animated.timing(modalA, { toValue: 1, duration: 160, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(modalScale, { toValue: 1, duration: 220, easing: Easing.out(Easing.back(1.1)), useNativeDriver: true }),
    ]).start();
  };

  const closeConfirm = () => {
    Animated.parallel([
      Animated.timing(modalA, { toValue: 0, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(modalScale, { toValue: 0.98, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setConfirmVisible(false);
        setPending(null);
      }
    });
  };

  const markStoryRead = useCallback(async (storyId: string) => {
    const arr = await readStringArray(KEY_READ_STORIES);
    if (arr.includes(storyId)) return;
    const next = [...arr, storyId];
    await writeStringArray(KEY_READ_STORIES, next);
    setReadStories(next);
  }, []);

  const openStory = (it: StoryItem) => {
    setStoryPick(it);
    setStoryVisible(true);

    storyA.setValue(0);
    storyScale.setValue(0.96);

    Animated.parallel([
      Animated.timing(storyA, { toValue: 1, duration: 180, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(storyScale, { toValue: 1, duration: 240, easing: Easing.out(Easing.back(1.12)), useNativeDriver: true }),
    ]).start();

    markStoryRead(it.id);
  };

  const closeStory = () => {
    Animated.parallel([
      Animated.timing(storyA, { toValue: 0, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(storyScale, { toValue: 0.98, duration: 140, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) {
        setStoryVisible(false);
        setStoryPick(null);
      }
    });
  };

  const addPurchaseCounters = useCallback(async (kind: 'story' | 'wall') => {
    const [t, s, w] = await Promise.all([
      readInt(KEY_PURCHASES_TOTAL),
      readInt(KEY_PURCHASES_STORIES_TOTAL),
      readInt(KEY_PURCHASES_WALLS_TOTAL),
    ]);

    const nextT = t + 1;
    const nextS = kind === 'story' ? s + 1 : s;
    const nextW = kind === 'wall' ? w + 1 : w;

    await Promise.all([
      writeInt(KEY_PURCHASES_TOTAL, nextT),
      writeInt(KEY_PURCHASES_STORIES_TOTAL, nextS),
      writeInt(KEY_PURCHASES_WALLS_TOTAL, nextW),
    ]);
  }, []);

  const confirmUnlock = useCallback(async () => {
    if (!pending) return;

    const price = pending.item.price;

    const [currentBal, currentSpent] = await Promise.all([readInt(KEY_POINTS_TOTAL), readInt(KEY_POINTS_SPENT_TOTAL)]);

    if (currentBal < price) {
      closeConfirm();
      return;
    }

    if (pending.kind === 'story') {
      const arr = await readStringArray(KEY_UNLOCKED_STORIES);
      if (arr.includes(pending.item.id)) {
        closeConfirm();
        return;
      }

      const nextBal = currentBal - price;
      const nextSpent = currentSpent + price;

      await Promise.all([writeInt(KEY_POINTS_TOTAL, nextBal), writeInt(KEY_POINTS_SPENT_TOTAL, nextSpent)]);

      setPoints(nextBal);

      const next = [...arr, pending.item.id];
      await writeStringArray(KEY_UNLOCKED_STORIES, next);
      setUnlockedStories(next);

      await addPurchaseCounters('story');
      closeConfirm();
      return;
    }

    const arr = await readStringArray(KEY_UNLOCKED_WALLS);
    if (arr.includes(pending.item.id)) {
      closeConfirm();
      return;
    }

    const nextBal = currentBal - price;
    const nextSpent = currentSpent + price;

    await Promise.all([writeInt(KEY_POINTS_TOTAL, nextBal), writeInt(KEY_POINTS_SPENT_TOTAL, nextSpent)]);

    setPoints(nextBal);

    const next = [...arr, pending.item.id];
    await writeStringArray(KEY_UNLOCKED_WALLS, next);
    setUnlockedWalls(next);

    await addPurchaseCounters('wall');
    closeConfirm();
  }, [pending, addPurchaseCounters]);

  const onMenu = () => navigation.navigate(ROUTES.Menu);
  const onSettings = () => navigation.navigate(ROUTES.Settings);

  const topBtnSize = isTiny ? 46 : isSmall ? 50 : 52;

  const coinTextSize = isTiny ? 14 : 15;
  const coinIcon = isTiny ? 18 : 20;

  const tabsH = isTiny ? 40 : 44;

  const storyH = isTiny ? 92 : isSmall ? 102 : 110;
  const storyImg = isTiny ? 56 : isSmall ? 64 : 70;

  const unlockBtnH = isTiny ? 26 : 28;
  const unlockBtnPadX = isTiny ? 10 : 12;

  const wallGridW = Math.min(isTiny ? 340 : 360, contentW);
  const gap = isTiny ? 10 : 14;
  const tileW = Math.floor((wallGridW - gap) / 2);
  const tileH = isTiny ? 165 : isSmall ? 182 : 190;

  const wallBtnH = isTiny ? 22 : 24;

  const canAfford = pending ? points >= pending.item.price : true;

  const onWallpaperPress = (it: StoreItem) => {
    const unlocked = unlockedWalls.includes(it.id);
    if (!unlocked) openConfirm('wall', it);
  };

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={[styles.topBar, { paddingHorizontal: 14 }]}>
        <Pressable onPress={onMenu} style={[styles.topBtn, { width: topBtnSize, height: topBtnSize }]} hitSlop={10}>
          <Text style={styles.topIcon}>≡</Text>
        </Pressable>

        <View style={styles.topCenter}>
          <View style={styles.coinRow}>
            <Image source={ICO_COIN} style={{ width: coinIcon, height: coinIcon }} resizeMode="contain" />
            <Text style={[styles.coinText, { fontSize: coinTextSize }]}>{`x ${points}`}</Text>
          </View>
        </View>

        <Pressable onPress={onSettings} style={[styles.topBtn, { width: topBtnSize, height: topBtnSize }]} hitSlop={10}>
          <Text style={styles.topIcon}>⚙</Text>
        </Pressable>
      </View>

      <View style={[styles.topTabs, { height: tabsH, width: cardW, marginTop: isTiny ? 6 : 8 }]}>
        <Pressable onPress={() => setTab('articles')} style={[styles.tabBtn, tab === 'articles' ? styles.tabActive : styles.tabIdle]}>
          <Text style={[styles.tabText, tab === 'articles' ? styles.tabTextActive : styles.tabTextIdle]}>Articles</Text>
        </Pressable>

        <Pressable onPress={() => setTab('wallpapers')} style={[styles.tabBtn, tab === 'wallpapers' ? styles.tabActive : styles.tabIdle]}>
          <Text style={[styles.tabText, tab === 'wallpapers' ? styles.tabTextActive : styles.tabTextIdle]}>Wallpapers</Text>
        </Pressable>
      </View>

      <View style={{ width: '100%', alignItems: 'center', flex: 1 }}>
        {tab === 'articles' && (
          <ScrollView style={{ width: cardW, marginTop: isTiny ? 10 : 14 }} contentContainerStyle={{ paddingBottom: 18 }} showsVerticalScrollIndicator={false}>
            {stories.map((it) => {
              const unlocked = unlockedStories.includes(it.id);
              const read = readStories.includes(it.id);

              return (
                <Pressable
                  key={it.id}
                  onPress={() => (unlocked ? openStory(it) : openConfirm('story', it))}
                  style={[styles.storyCard, { minHeight: storyH }]}
                >
                  <View style={styles.storyLeft}>
                    <View style={[styles.storyImgWrap, { width: storyImg, height: storyImg }]}>
                      <Image source={it.img} style={{ width: storyImg, height: storyImg }} resizeMode="contain" />
                      {!unlocked && (
                        <View style={styles.lockOverlay}>
                          <Image source={ICO_LOCK} style={{ width: 22, height: 22 }} resizeMode="contain" />
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.storyRight}>
                    <Text style={[styles.storyTitle, { fontSize: isTiny ? 12 : 13 }]} numberOfLines={2}>
                      {it.storyTitle}
                    </Text>

                    {!unlocked ? (
                      <View style={[styles.unlockBtn, { height: unlockBtnH, paddingHorizontal: unlockBtnPadX }]}>
                        <Text style={[styles.unlockText, { fontSize: isTiny ? 10 : 11 }]}>{`Unlock for ${it.price}`}</Text>
                        <Image source={ICO_COIN} style={{ width: 14, height: 14, marginLeft: 6 }} resizeMode="contain" />
                      </View>
                    ) : (
                      <View style={[styles.unlockedPill, { height: unlockBtnH }]}>
                        <Text style={[styles.unlockedText, { fontSize: isTiny ? 10 : 11 }]}>{read ? 'Read' : 'Open'}</Text>
                      </View>
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        )}

        {tab === 'wallpapers' && (
          <ScrollView style={{ width: wallGridW, marginTop: isTiny ? 12 : 16 }} contentContainerStyle={{ paddingBottom: 18 }} showsVerticalScrollIndicator={false}>
            <View style={[styles.wallGrid, { gap }]}>
              {walls.map((it) => {
                const unlocked = unlockedWalls.includes(it.id);

                return (
                  <Pressable key={it.id} onPress={() => onWallpaperPress(it)} style={[styles.wallTile, { width: tileW, height: tileH }]}>
                    <Image source={it.img} style={styles.wallImg} resizeMode="cover" />

                    {!unlocked && (
                      <View style={styles.wallLock}>
                        <Image source={ICO_LOCK} style={{ width: 24, height: 24 }} resizeMode="contain" />
                        <View style={[styles.wallPill, { height: wallBtnH }]}>
                          <Text style={[styles.wallBtnText, { fontSize: isTiny ? 10 : 11 }]}>{`Unlock for ${it.price}`}</Text>
                          <Image source={ICO_COIN} style={{ width: 14, height: 14, marginLeft: 6 }} resizeMode="contain" />
                        </View>
                      </View>
                    )}

                    {unlocked && (
                      <View style={[styles.wallSelected, { height: wallBtnH }]}>
                        <Text style={[styles.wallSelectedText, { fontSize: isTiny ? 10 : 11 }]}>Selected</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      <Modal transparent visible={confirmVisible} animationType="fade" onRequestClose={closeConfirm}>
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalCard, { width: Math.min(360, width - 54), opacity: modalA, transform: [{ scale: modalScale }] }]}>
            <View style={styles.modalTopRow}>
              <Text style={styles.modalTitle}>Unlock the Item?</Text>
              <Image source={ICO_COIN} style={{ width: 18, height: 18, opacity: 0.9 }} resizeMode="contain" />
            </View>

            {pending && (
              <Text style={styles.modalSub}>
                Cost: {pending.item.price} points
                {!canAfford ? ' (not enough)' : ''}
              </Text>
            )}

            <View style={styles.modalBtns}>
              <Pressable onPress={confirmUnlock} disabled={!canAfford} style={[styles.modalBtn, styles.modalConfirm, !canAfford && { opacity: 0.4 }]}>
                <Text style={styles.modalBtnText}>Confirm</Text>
              </Pressable>

              <Pressable onPress={closeConfirm} style={[styles.modalBtn, styles.modalCancel]}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      <Modal transparent visible={storyVisible} animationType="fade" onRequestClose={closeStory}>
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.storyModal,
              {
                width: Math.min(420, width - 44),
                maxHeight: height - topPad - bottomPad - 60,
                opacity: storyA,
                transform: [{ scale: storyScale }],
              },
            ]}
          >
            <View style={styles.storyHead}>
              <Text style={styles.storyModalTitle} numberOfLines={2}>
                {storyPick?.storyTitle ?? ''}
              </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, paddingBottom: 14 }}>
              <Text style={styles.storyModalBody}>{storyPick?.storyBody ?? ''}</Text>
            </ScrollView>

            <Pressable onPress={closeStory} style={styles.storyCloseBtn}>
              <Text style={styles.storyCloseText}>Close</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>

      <View style={{ height: Platform.OS === 'ios' ? 4 : 10 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3A1E8A', alignItems: 'center' },

  topBar: { width: '100%', flexDirection: 'row', alignItems: 'center', paddingBottom: 8 },
  topBtn: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.10)',
  },
  topIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, opacity: 0.95 },
  topCenter: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coinRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  coinText: { color: '#FFFFFF', fontWeight: '900' },

  topTabs: { flexDirection: 'row', gap: 10, alignItems: 'center', justifyContent: 'center' },
  tabBtn: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.18)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)' },
  tabIdle: { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  tabText: { fontWeight: '900', fontSize: 12 },
  tabTextActive: { color: '#111' },
  tabTextIdle: { color: 'rgba(255,255,255,0.75)' },

  storyCard: {
    width: '100%',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    marginBottom: 12,
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  storyLeft: { width: 92, alignItems: 'center', justifyContent: 'center' },
  storyImgWrap: {
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.10)',
  },
  storyRight: { flex: 1, paddingLeft: 10, justifyContent: 'center' },
  storyTitle: { color: '#0B0B0B', fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  unlockBtn: {
    alignSelf: 'center',
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockText: { color: '#111', fontWeight: '900' },
  unlockedPill: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(111,208,255,0.72)',
    borderWidth: 1,
    borderColor: 'rgba(111,208,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  unlockedText: { color: '#111', fontWeight: '900' },

  wallGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  wallTile: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    marginBottom: 14,
    overflow: 'hidden',
  },
  wallImg: { width: '100%', height: '100%' },
  wallLock: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.14)' },
  wallPill: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallBtnText: { color: '#111', fontWeight: '900' },
  wallSelected: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(36,181,91,0.75)',
    borderWidth: 1,
    borderColor: 'rgba(36,181,91,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallSelectedText: { color: '#111', fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.28)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  modalCard: { borderRadius: 18, backgroundColor: '#B58BEA', paddingVertical: 14, paddingHorizontal: 14 },
  modalTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 10 },
  modalTitle: { color: '#111', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  modalSub: { color: 'rgba(17,17,17,0.85)', fontWeight: '800', fontSize: 12, textAlign: 'center', marginBottom: 12 },
  modalBtns: { flexDirection: 'row', gap: 10 },
  modalBtn: { flex: 1, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  modalConfirm: { backgroundColor: '#24B55B' },
  modalCancel: { backgroundColor: '#F05555' },
  modalBtnText: { color: '#111', fontWeight: '900', fontSize: 12 },

  storyModal: { borderRadius: 18, backgroundColor: '#B58BEA' },
  storyHead: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.10)',
    alignItems: 'center',
  },
  storyModalTitle: { color: '#111', fontWeight: '900', fontSize: 16, textAlign: 'center' },
  storyModalBody: { color: '#111', fontWeight: '700', fontSize: 13, lineHeight: 19, opacity: 0.92, marginTop: 12 },
  storyCloseBtn: {
    margin: 14,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storyCloseText: { color: '#111', fontWeight: '900', fontSize: 12 },
});