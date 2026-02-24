import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  Animated,
  Easing,
  ScrollView,
  Share,
  useWindowDimensions,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';
import { ROUTES } from '../navigation/routes';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticlesPaper'>;
type CategoryKey = 'paper' | 'plastic' | 'glass' | 'organic';

type Article = {
  id: string;
  title: string;
  body: string;
  image: any;
  category: CategoryKey;
};

const KEY_READ_STORIES = '@read_story_ids';

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

const CATS: { key: CategoryKey; label: string }[] = [
  { key: 'paper', label: 'Paper' },
  { key: 'plastic', label: 'Plastic' },
  { key: 'glass', label: 'Glass' },
  { key: 'organic', label: 'Organic' },
];

function catColor(k: CategoryKey) {
  if (k === 'paper') return '#A6B6FF';
  if (k === 'plastic') return '#FFD167';
  if (k === 'glass') return '#7EE08B';
  return '#B98968';
}

async function markArticleRead(articleId: string) {
  try {
    const raw = await AsyncStorage.getItem(KEY_READ_STORIES);
    const arr = raw ? JSON.parse(raw) : [];
    const safe = Array.isArray(arr) ? arr.filter((x) => typeof x === 'string') : [];
    if (!safe.includes(articleId)) {
      safe.push(articleId);
      await AsyncStorage.setItem(KEY_READ_STORIES, JSON.stringify(safe));
    }
  } catch {}
}

export default function ArticlesPaper({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isAndroid = Platform.OS === 'android';

  const dataByCat = useMemo<Record<CategoryKey, Article[]>>(() => ({
    paper: [
      {
        id: 'paper-1',
        category: 'paper',
        image: IMG_PAPER_1,
        title: 'What Belongs in the Paper Container',
        body: 'Paper containers are designed for clean and dry paper products that can be processed and recycled into new materials. Common examples include newspapers, magazines, office paper, notebooks, envelopes, and cardboard packaging. These items can be collected, cleaned, and reused to produce new paper products, reducing the need for cutting down trees.\n\nCardboard boxes are also accepted, but they should be flattened before disposal. This helps save space in containers and improves transportation efficiency. Removing plastic tape, foam, or other non-paper materials is recommended whenever possible.\n\nClean paper bags and paper packaging can also be recycled. These materials are easy to process and are commonly reused in paper production. Recycling paper helps reduce waste and conserves natural resources.\n\nHowever, paper that is heavily contaminated with food, grease, or liquids cannot be recycled. When paper fibers are damaged or mixed with substances, the recycling process becomes difficult or impossible.\n\nBy placing the correct materials in the paper container, you help reduce environmental impact and support sustainable recycling systems.',
      },
      {
        id: 'paper-2',
        category: 'paper',
        image: IMG_PAPER_2,
        title: 'How to Prepare Paper for Recycling',
        body: 'Proper preparation of paper waste improves recycling efficiency and ensures materials can be successfully reused. Paper should always be clean and dry before being placed in the container. Wet or contaminated paper can damage other recyclable materials.\n\nCardboard boxes should be flattened to reduce volume and improve storage. Removing plastic windows from envelopes or separating paper from mixed packaging helps make the recycling process more effective.\n\nStaples and small paper clips usually do not need to be removed, as recycling facilities are designed to handle small metal components. However, large non-paper elements should be separated when possible.\n\nAvoid placing laminated paper, wax-coated paper, or paper combined with plastic layers into the paper container. These materials require special processing and may not be recyclable through standard systems.\n\nTaking a few seconds to prepare paper waste properly helps ensure that it can be recycled efficiently and reused in the production of new materials.',
      },
      {
        id: 'paper-3',
        category: 'paper',
        image: IMG_PAPER_3,
        title: 'Why Recycling Paper Matters',
        body: 'Paper recycling plays an important role in protecting forests and reducing environmental impact. When paper is recycled, fewer trees need to be cut down to produce new paper products. This helps preserve natural ecosystems and supports biodiversity.\n\nRecycling paper also saves energy and water. Producing paper from recycled materials requires significantly fewer resources compared to producing paper from raw materials. This reduces pollution and lowers overall environmental strain.\n\nBy recycling paper, waste sent to landfills is reduced. Paper waste decomposes over time and can release harmful gases. Recycling helps prevent unnecessary waste accumulation and supports cleaner environments.\n\nEvery correctly recycled paper item contributes to a more sustainable system. Small actions, such as recycling newspapers or packaging, can collectively make a meaningful difference.',
      },
    ],
    plastic: [
      {
        id: 'plastic-1',
        category: 'plastic',
        image: IMG_PLASTIC_1,
        title: 'What Belongs in the Plastic Container',
        body: 'Plastic containers are used for recyclable plastic packaging such as bottles, containers, and food packaging. Common examples include water bottles, beverage bottles, yogurt containers, and plastic packaging from household products.\n\nBefore placing plastic items into the container, they should be empty. Liquids and food residues can interfere with the recycling process and contaminate other recyclable materials.\n\nPlastic caps can usually remain attached to bottles, as modern recycling systems are designed to handle them. However, large non-plastic components should be removed when possible.\n\nPlastic bags and thin films may require special recycling systems depending on your location. These materials should only be placed in the container if local guidelines allow it.\n\nSorting plastic correctly helps reduce pollution and allows materials to be reused in the production of new items.',
      },
      {
        id: 'plastic-2',
        category: 'plastic',
        image: IMG_PLASTIC_2,
        title: 'How to Prepare Plastic for Recycling',
        body: 'Preparing plastic properly helps improve recycling efficiency. Containers should be emptied and lightly rinsed if they contain food or liquid residue. This prevents contamination and supports better recycling outcomes.\n\nPlastic bottles can be compressed to save space. This makes transportation more efficient and allows more materials to be collected.\n\nLabels usually do not need to be removed, as recycling facilities are able to separate them during processing. However, large non-plastic parts should be separated when possible.\n\nAvoid placing heavily contaminated plastic, such as plastic covered in grease or chemicals, into the recycling container. These materials may not be suitable for recycling.\n\nProper preparation ensures that plastic can be successfully processed and reused.',
      },
      {
        id: 'plastic-3',
        category: 'plastic',
        image: IMG_PLASTIC_3,
        title: 'Why Plastic Recycling Is Important',
        body: 'Plastic recycling reduces the amount of waste that ends up in landfills and natural environments. Many plastic products take hundreds of years to decompose, making recycling essential for waste management.\n\nRecycling plastic helps consere resources and reduces the need to produce new plastic from raw materials. This lowers environmental impact and energy consumption.\n\nRecycled plastic can be used to produce new containers, packaging, and other useful products. This supports a more sustainable production cycle.\n\nEvery correctly sorted plastic item helps reduce pollution and protects ecosystems.',
      },
    ],
    glass: [
      {
        id: 'glass-1',
        category: 'glass',
        image: IMG_GLASS_1,
        title: 'What Belongs in the Glass Container',
        body: 'Glass containers are used for bottles and jars made from glass. These items can be recycled and turned into new glass products without losing quality.\n\nGlass bottles and jars should be empty before disposal. Removing liquid residue helps maintain the quality of recyclable materials.\n\nGlass lids made of metal or plastic should be separated when possible. These materials are recycled through different systems.\n\nCeramics, mirrors, and heat-resistant glass should not be placed in glass containers, as they require different recycling processes.\n\nSorting glass correctly helps ensure safe and efficient recycling.',
      },
      {
        id: 'glass-2',
        category: 'glass',
        image: IMG_GLASS_2,
        title: 'Preparing Glass for Recycling',
        body: 'Glass items should be empty and free of food or liquid. This helps recycling facilities process the material more effectively.\n\nGlass labels usually do not need to be removed, as they are separated during recycling. However, removing non-glass components is helpful.\n\nBroken glass can often be recycled, but care should be taken when handling it to prevent injury.\n\nAvoid placing non-glass materials in glass containers, as this can interfere with recycling.\n\nProper preparation helps ensure glass can be reused efficiently.',
      },
      {
        id: 'glass-3',
        category: 'glass',
        image: IMG_GLASS_3,
        title: 'Environmental Benefits of Glass Recycling',
        body: 'Glass can be recycled repeatedly without losing quality. This makes it one of the most sustainable recyclable materials.\n\nRecycling glass reduces the need for raw materials and lowers energy consumption during production.\n\nIt also helps reduce waste in landfills and supports cleaner environments.\n\nEvery recycled glass item contributes to environmental protection.',
      },
    ],
    organic: [
      {
        id: 'organic-1',
        category: 'organic',
        image: IMG_ORGANIC_1,
        title: 'What Belongs in the Organic Container',
        body: 'Organic containers are used for biodegradable waste such as fruit peels, food scraps, and plant materials.\n\nCommon examples include apple cores, banana peels, vegetable scraps, and garden waste.\n\nThese materials break down naturally and can be converted into compost.\n\nAvoid placing plastic, glass, or metal into organic containers.\n\nProper sorting supports natural recycling processes.',
      },
      {
        id: 'organic-2',
        category: 'organic',
        image: IMG_ORGANIC_2,
        title: 'How Organic Waste Is Recycled',
        body: 'Organic waste is processed through composting, which transforms waste into useful natural fertilizer.\n\nThis process helps enrich soil and supports plant growth.\n\nOrganic recycling reduces landfill waste and environmental impact.\n\nSeparating organic waste helps create sustainable natural cycles.\n\nComposting supports environmentally friendly waste management.',
      },
      {
        id: 'organic-3',
        category: 'organic',
        image: IMG_ORGANIC_3,
        title: 'Why Organic Recycling Matters',
        body: 'Organic recycling helps reduce landfill waste and supports natural decomposition processes.\n\nIt helps create compost that can be used to improve soil quality.\n\nRecycling organic waste reduces environmental impact and supports sustainability.\n\nProper organic sorting helps protect natural ecosystems.',
      },
    ],
  }), []);

  const [cat, setCat] = useState<CategoryKey>('paper');
  const [opened, setOpened] = useState<Article | null>(null);

  const tabsA = useRef(new Animated.Value(0)).current;
  const listA = useRef(new Animated.Value(0)).current;
  const c1 = useRef(new Animated.Value(0)).current;
  const c2 = useRef(new Animated.Value(0)).current;
  const c3 = useRef(new Animated.Value(0)).current;
  const modalA = useRef(new Animated.Value(0)).current;
  const modalY = useRef(new Animated.Value(12)).current;

  const readTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topPad = Math.max(insets.top + 10, 20);
  const bottomPad = Math.max(insets.bottom + 10, 10);
  const cards = dataByCat[cat];

  const runListAnim = () => {
    [tabsA, listA, c1, c2, c3].forEach(a => a.setValue(0));
    Animated.sequence([
      Animated.timing(tabsA, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(listA, { toValue: 1, duration: 160, useNativeDriver: true }),
      Animated.stagger(90, [
        Animated.timing(c1, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(c2, { toValue: 1, duration: 240, useNativeDriver: true }),
        Animated.timing(c3, { toValue: 1, duration: 240, useNativeDriver: true }),
      ]),
    ]).start();
  };

  useEffect(() => { if (!opened) runListAnim(); }, [cat, opened]);

  const openArticle = (a: Article) => {
    setOpened(a);
    if (readTimer.current) clearTimeout(readTimer.current);
    readTimer.current = setTimeout(() => markArticleRead(a.id), 8000);
    modalA.setValue(0);
    modalY.setValue(14);
    Animated.parallel([
      Animated.timing(modalA, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(modalY, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  };

  const closeArticle = () => {
    if (readTimer.current) clearTimeout(readTimer.current);
    Animated.parallel([
      Animated.timing(modalA, { toValue: 0, duration: 160, useNativeDriver: true }),
      Animated.timing(modalY, { toValue: 12, duration: 160, useNativeDriver: true }),
    ]).start(() => setOpened(null));
  };

  const onShare = async (a: Article) => {
    try { await Share.share({ message: `${a.title}\n\n${a.body}` }); } catch {}
  };

  const cardAnim = (v: Animated.Value) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }],
  });

  return (
    <View style={styles.root}>
      <View style={[styles.topBar, { paddingTop: topPad }]}>
        <Pressable onPress={() => (opened ? closeArticle() : navigation.goBack())} style={styles.topIconBtn} hitSlop={10}>
          <Text style={styles.topIcon}>≡</Text>
        </Pressable>
        <View style={styles.topCenter}>
          <Text style={styles.topTitle}>Articles</Text>
        </View>
        <View style={styles.topRight}>
          <Pressable onPress={() => navigation.navigate(ROUTES.Settings)} style={styles.topIconBtn} hitSlop={10}>
            <Text style={styles.topIcon}>⚙</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.body}>
        {!opened ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad + 40 }}>
            <Animated.View style={[styles.tabsOuter, { opacity: tabsA, marginBottom: 14 }]}>
              <View style={styles.tabs}>
                {CATS.map((t) => (
                  <Pressable
                    key={t.key}
                    onPress={() => setCat(t.key)}
                    style={[styles.tabPill, { 
                      backgroundColor: t.key === cat ? catColor(t.key) : 'rgba(255,255,255,0.06)',
                      borderColor: t.key === cat ? 'transparent' : 'rgba(255,255,255,0.14)',
                    }]}
                  >
                    <Text style={[styles.tabText, { color: t.key === cat ? '#111' : '#FFF' }]}>{t.label}</Text>
                  </Pressable>
                ))}
              </View>
            </Animated.View>

            <Animated.View style={{ opacity: listA }}>
              {cards.map((item, idx) => (
                <Animated.View key={item.id} style={[styles.card, cardAnim([c1, c2, c3][idx])]}>
                  <View style={styles.cardInner}>
                    <Image source={item.image} style={styles.cardImg} resizeMode="contain" />
                    <View style={styles.cardTextWrap}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                      <View style={styles.cardActions}>
                        <Pressable style={styles.readBtn} onPress={() => openArticle(item)}>
                          <Text style={styles.readText}>Read</Text>
                        </Pressable>
                        <Pressable style={styles.shareBtn} onPress={() => onShare(item)} hitSlop={10}>
                          <Text style={styles.shareIcon}>↗</Text>
                        </Pressable>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </Animated.View>
          </ScrollView>
        ) : (
          <Animated.View style={[styles.openedWrap, { opacity: modalA, transform: [{ translateY: modalY }] }]}>
            <View style={styles.openedCard}>
              <Image source={opened.image} style={styles.openedImg} resizeMode="contain" />
              <Text style={styles.openedTitle}>{opened.title}</Text>
           
              <View style={styles.scrollContainer}>
                <ScrollView 
                  style={styles.openedBodyScroll} 
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={true}
                >
                  <Text style={styles.openedBody}>{opened.body}</Text>
                </ScrollView>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={closeArticle}>
              <Text style={styles.closeText}>Back</Text>
            </Pressable>
            <View style={{ height: 30 + bottomPad }} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#3A1E8A' },
  topBar: { paddingHorizontal: 14, paddingBottom: 10, flexDirection: 'row', alignItems: 'center' },
  topIconBtn: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  topIcon: { color: '#FFFFFF', fontWeight: '900', fontSize: 18 },
  topCenter: { flex: 1, alignItems: 'center' },
  topTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 26 },
  topRight: { width: 52 },
  body: { flex: 1, paddingHorizontal: 14 },
  tabsOuter: { alignItems: 'center' },
  tabs: { borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.18)', padding: 4, flexDirection: 'row', width: '100%' },
  tabPill: { flex: 1, height: 34, borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginHorizontal: 2 },
  tabText: { fontWeight: '900', fontSize: 12 },
  card: { backgroundColor: '#5A3AC2', borderRadius: 22, marginBottom: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  cardInner: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardImg: { width: 100, height: 100 },
  cardTextWrap: { flex: 1 },
  cardTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 18, marginBottom: 10 },
  cardActions: { flexDirection: 'row', gap: 10 },
  readBtn: { height: 34, paddingHorizontal: 20, borderRadius: 14, backgroundColor: '#8BD0FF', justifyContent: 'center' },
  readText: { color: '#111', fontWeight: '900' },
  shareBtn: { width: 40, height: 34, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  shareIcon: { color: '#FFF', fontWeight: '900' },
  
  openedWrap: { flex: 1, paddingTop: 10 },
  openedCard: { 
    flex: 1, 
    backgroundColor: '#5A3AC2', 
    borderRadius: 22, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden'
  },
  openedImg: { 
    width: '100%', 
    height: 120, 
    marginBottom: 8 
  },
  openedTitle: { color: '#FFFFFF', fontWeight: '900', fontSize: 20, marginBottom: 8 },
  scrollContainer: {
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: 14,
  },
  openedBodyScroll: { flex: 1 },
  scrollContent: { padding: 12, flexGrow: 1 },
  openedBody: { color: '#FFFFFF', fontSize: 16, lineHeight: 24, fontWeight: '600' },
  
  closeBtn: { 
    marginTop: 15, 
    height: 52, 
    borderRadius: 16, 
    backgroundColor: 'rgba(255,255,255,0.1)', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.16)',
    marginBottom: 10,
  },
  closeText: { color: '#FFF', fontWeight: '900', fontSize: 16 },
});