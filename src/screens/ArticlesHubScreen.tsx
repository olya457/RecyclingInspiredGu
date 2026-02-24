import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ImageBackground,
  Modal,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/RootNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'ArticlesHub'>;

type Article = {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  bg: any;
  accent: string;
};

const BG_1 = require('../assets/article_bg_1.png');
const BG_2 = require('../assets/article_bg_2.png');
const BG_3 = require('../assets/article_bg_3.png');
const BG_4 = require('../assets/article_bg_4.png');
const BG_5 = require('../assets/article_bg_5.png');
const BG_6 = require('../assets/article_bg_6.png');

export default function ArticlesHubScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();

  const isSmall = height < 740 || width < 375;
  const isVerySmall = height < 690 || width < 360;

  const articles: Article[] = useMemo(
    () => [
      {
        id: 'a1',
        title: 'Plastic in Water',
        subtitle: 'How litter reaches rivers and oceans.',
        body:
          'Plastic waste often starts as everyday litter. Wind and rain carry lightweight items into storm drains, streams, and rivers.\n\n' +
          'Once plastic enters water, it can break into tiny fragments over time. These fragments are difficult to remove and can be mistaken for food by wildlife.\n\n' +
          'Simple habits help: use reusable bottles and bags, sort packaging, and never leave trash near water.',
        bg: BG_1,
        accent: '#7C5CFF',
      },
      {
        id: 'a2',
        title: 'Soil Pollution',
        subtitle: 'Why trash affects plants and food.',
        body:
          'When waste is left on the ground, chemicals and micro-particles can seep into soil. Even small pieces of plastic can change how soil holds water and air.\n\n' +
          'Over time this reduces soil quality, impacts plant growth, and can affect the wider ecosystem.\n\n' +
          'Try: choose products with less packaging, reuse containers, and sort recyclables correctly.',
        bg: BG_2,
        accent: '#FF5CA8',
      },
      {
        id: 'a3',
        title: 'Wildlife Safety',
        subtitle: 'How litter harms animals.',
        body:
          'Animals may get trapped in rings, bags, or containers. Some animals swallow small pieces of waste, thinking it is food.\n\n' +
          'This can cause injury and makes it harder for animals to survive.\n\n' +
          'Helpful actions: pick up litter during walks, keep trash bins closed, and recycle items that can be processed safely.',
        bg: BG_3,
        accent: '#4FE0B6',
      },
      {
        id: 'a4',
        title: 'Air & Smoke',
        subtitle: 'Why burning trash is dangerous.',
        body:
          'Burning waste releases smoke and harmful particles into the air. Some materials produce toxic gases when heated.\n\n' +
          'Clean air is important for people, animals, and plants.\n\n' +
          'Choose safer alternatives: sort waste, use local collection points, and avoid burning any household trash.',
        bg: BG_4,
        accent: '#FFB84F',
      },
      {
        id: 'a5',
        title: 'Recycling Basics',
        subtitle: 'How to sort items the right way.',
        body:
          'Recycling works best when items are clean and correctly sorted. Mixing the wrong materials can contaminate the whole batch.\n\n' +
          'A simple rule: follow the labels on bins, keep paper dry, rinse containers, and remove leftover food.\n\n' +
          'Small steps make recycling more effective and reduce waste going to landfills.',
        bg: BG_5,
        accent: '#5FD6FF',
      },
      {
        id: 'a6',
        title: 'Everyday Habits',
        subtitle: 'Small choices that reduce waste.',
        body:
          'Waste reduction starts before an item becomes trash. Choosing durable products, reusing bags, and repairing items can reduce waste.\n\n' +
          'Try a weekly habit: carry a reusable bottle, refuse single-use extras, and keep a small bag for recycling.\n\n' +
          'Consistency matters more than perfection—small changes add up over time.',
        bg: BG_6,
        accent: '#A3FF5C',
      },
    ],
    []
  );

  const [selected, setSelected] = useState<Article | null>(null);

  const topPad = insets.top + (isVerySmall ? 8 : 12);
  const bottomPad = Math.max(insets.bottom, 12);

  const listPadX = isVerySmall ? 12 : 14;

  const modalMaxW = Math.min(560, width - (isVerySmall ? 20 : 28));
  const modalH = Math.min(Math.round(height * (isVerySmall ? 0.86 : 0.80)), isVerySmall ? 580 : 660);

  const cardH = isVerySmall ? 118 : isSmall ? 126 : 134;
  const cardPad = isVerySmall ? 12 : 14;

  const panelPad = isVerySmall ? 12 : 14;
  const panelRadius = 18;

  return (
    <View style={[styles.root, { paddingTop: topPad, paddingBottom: bottomPad }]}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn} hitSlop={10}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.topCenter}>
          <Text style={[styles.title, { fontSize: isSmall ? 20 : 22 }]}>Articles</Text>
          <Text style={[styles.sub, { fontSize: isVerySmall ? 12 : 13 }]}>Choose a topic to read</Text>
        </View>

        <View style={{ width: 58 }} />
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: listPadX,
          paddingTop: isVerySmall ? 10 : 12,
          paddingBottom: 18,
        }}
        showsVerticalScrollIndicator={false}
      >
        {articles.map((a) => (
          <View key={a.id} style={[styles.card, { height: cardH, borderColor: `${a.accent}55` }]}>
            <ImageBackground source={a.bg} style={styles.cardBg} imageStyle={styles.cardBgImg}>
              <View style={styles.cardOverlay} />
              <View style={[styles.cardInner, { padding: cardPad }]}>
                <Text style={[styles.cardTitle, { fontSize: isSmall ? 18 : 20 }]} numberOfLines={1}>
                  {a.title}
                </Text>
                <Text style={[styles.cardSub, { fontSize: isVerySmall ? 12 : 13 }]} numberOfLines={2}>
                  {a.subtitle}
                </Text>

                <View style={{ flex: 1 }} />

                <Pressable onPress={() => setSelected(a)} style={[styles.readBtn, { backgroundColor: `${a.accent}E6` }]}>
                  <Text style={styles.readBtnText}>Read</Text>
                </Pressable>
              </View>
            </ImageBackground>
          </View>
        ))}
      </ScrollView>

      <Modal transparent visible={!!selected} animationType="fade" onRequestClose={() => setSelected(null)}>
        <View style={styles.modalDim}>
          <View style={[styles.modalWrap, { width: modalMaxW, height: modalH }]}>
            {selected && (
              <ImageBackground source={selected.bg} style={styles.modalBg} imageStyle={styles.modalBgImg}>
                <View style={styles.modalShade} />

                <View style={styles.modalTop}>
                  <Pressable onPress={() => setSelected(null)} style={styles.closeBtn} hitSlop={10}>
                    <Text style={styles.closeText}>Close</Text>
                  </Pressable>
                </View>

                <View style={styles.modalContent}>
                  <View
                    style={[
                      styles.textPanel,
                      {
                        paddingHorizontal: panelPad,
                        paddingTop: panelPad,
                        paddingBottom: panelPad,
                        borderRadius: panelRadius,
                      },
                    ]}
                  >
                    <Text style={[styles.modalTitle, { fontSize: isSmall ? 20 : 22 }]}>{selected.title}</Text>
                    <Text style={[styles.modalSubtitle, { fontSize: isVerySmall ? 12 : 13 }]}>{selected.subtitle}</Text>

                    <ScrollView
                      style={styles.modalScroll}
                      contentContainerStyle={{ paddingBottom: 10 }}
                      showsVerticalScrollIndicator={false}
                    >
                      <Text style={[styles.modalBody, { fontSize: isSmall ? 14 : 15 }]}>{selected.body}</Text>
                    </ScrollView>
                  </View>
                </View>
              </ImageBackground>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#6B4BD9' },

  topBar: {
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  backBtn: {
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
  },
  backText: { color: '#FFFFFF', fontWeight: '900', fontSize: 14 },

  topCenter: { flex: 1, alignItems: 'center' },
  title: { color: '#FFFFFF', fontWeight: '900' },
  sub: { marginTop: 4, color: 'rgba(255,255,255,0.72)', fontWeight: '800' },

  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    borderWidth: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  cardBg: { flex: 1 },
  cardBgImg: { borderRadius: 20 },

  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.20)' },
  cardInner: { flex: 1 },

  cardTitle: { color: '#FFFFFF', fontWeight: '900' },
  cardSub: { marginTop: 6, color: 'rgba(255,255,255,0.88)', fontWeight: '700', maxWidth: '92%' },

  readBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: Platform.select({ ios: 10, android: 9 }),
    borderRadius: 14,
  },
  readBtnText: { color: '#111', fontWeight: '900', fontSize: 14 },

  modalDim: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.70)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  modalWrap: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  modalBg: { flex: 1 },
  modalBgImg: { borderRadius: 22 },

  modalShade: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.22)' },

  modalTop: {
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  closeBtn: {
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(240,139,197,0.95)',
    justifyContent: 'center',
  },
  closeText: { color: '#111', fontWeight: '900', fontSize: 14 },

  modalContent: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },

  textPanel: {
    flexShrink: 1,
    maxHeight: '88%',
    backgroundColor: 'rgba(0,0,0,0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },

  modalTitle: { color: '#FFFFFF', fontWeight: '900' },
  modalSubtitle: { marginTop: 6, color: 'rgba(255,255,255,0.86)', fontWeight: '800' },

  modalScroll: { marginTop: 12, flexGrow: 0 },
  modalBody: { color: '#FFFFFF', fontWeight: '700', lineHeight: 22 },
});