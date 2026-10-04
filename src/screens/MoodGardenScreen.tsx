import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAuthUserId } from '../api/authStore';

type MoodGardenProps = {
  onBack: () => void;
};

type GardenView = 'home' | 'choose' | 'activity' | 'reward';
type GardenActivityId = 'breathe' | 'water' | 'notice' | 'gratitude' | 'kind';

type GardenProgress = {
  completedActivities: number;
};

type GardenActivity = {
  id: GardenActivityId;
  emoji: string;
  title: string;
  description: string;
  color: string;
};

const STORAGE_PREFIX = '@mood_garden_';
const DEFAULT_PROGRESS: GardenProgress = { completedActivities: 0 };

const gardenActivities: GardenActivity[] = [
  {
    id: 'breathe',
    emoji: '🫁',
    title: 'Three slow breaths',
    description: 'Make a little room to settle your body.',
    color: '#DDF4EC',
  },
  {
    id: 'water',
    emoji: '💧',
    title: 'A small sip of water',
    description: 'Pause and offer your body something refreshing.',
    color: '#DDEDF8',
  },
  {
    id: 'notice',
    emoji: '🌿',
    title: 'Notice three things',
    description: 'Gently reconnect with what is around you.',
    color: '#E8F3D9',
  },
  {
    id: 'gratitude',
    emoji: '💛',
    title: 'A small gratitude',
    description: 'Name one thing that feels meaningful or kind.',
    color: '#FFF2C9',
  },
  {
    id: 'kind',
    emoji: '🤝',
    title: 'A kind connection',
    description: 'Think of someone you could reach out to today.',
    color: '#F7E2EE',
  },
];

const getGardenStage = (count: number) => {
  if (count >= 5) return { label: 'Growing garden', icon: '🌳', next: null };
  if (count >= 3) return { label: 'First flowers', icon: '🌸', next: 5 };
  if (count >= 1) return { label: 'A little sprout', icon: '🌿', next: 3 };
  return { label: 'A new seed', icon: '🌱', next: 1 };
};

type GardenGameSceneProps = {
  progress: number;
};

function GardenGameScene({ progress }: GardenGameSceneProps) {
  const growth = useRef(new Animated.Value(0)).current;
  const cloudDrift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    growth.setValue(0);
    Animated.spring(growth, {
      toValue: 1,
      useNativeDriver: true,
      friction: 7,
      tension: 45,
    }).start();
  }, [growth, progress]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(cloudDrift, {
          toValue: 1,
          duration: 4200,
          useNativeDriver: true,
        }),
        Animated.timing(cloudDrift, {
          toValue: 0,
          duration: 4200,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [cloudDrift]);

  const plantScale = growth.interpolate({
    inputRange: [0, 1],
    outputRange: [0.2, 1],
  });
  const cloudTranslate = cloudDrift.interpolate({
    inputRange: [0, 1],
    outputRange: [-6, 6],
  });

  return (
    <View style={styles.gameScene}>
      <View style={styles.gameSky}>
        <View style={styles.gameSun} />
        <Animated.View style={[styles.gameCloud, { transform: [{ translateX: cloudTranslate }] }]}>
          <View style={styles.cloudPuffSmall} />
          <View style={styles.cloudPuffLarge} />
          <View style={styles.cloudPuffSmall} />
        </Animated.View>
        <View style={styles.gameHillBack} />
        <View style={styles.gameHillFront} />
      </View>

      <View style={styles.gameGround}>
        <View style={styles.gameSoilPatch} />
        <View style={styles.gamePath} />
        <View style={styles.gameGrassTuftLeft} />
        <View style={styles.gameGrassTuftRight} />

        <Animated.View style={[styles.gamePlant, styles.gamePlantLeft, { transform: [{ scale: plantScale }] }]}>
          <View style={styles.gameStemSmall} />
          {progress >= 1 && <View style={[styles.gameLeaf, styles.gameLeafLeft]} />}
          {progress >= 2 && <View style={[styles.gameLeaf, styles.gameLeafRight]} />}
          {progress >= 3 && <View style={styles.gameFlower}>
            <View style={styles.gameFlowerCenter} />
          </View>}
        </Animated.View>

        <Animated.View style={[styles.gamePlant, styles.gamePlantCenter, { transform: [{ scale: plantScale }] }]}>
          <View style={styles.gameStem} />
          {progress >= 1 && <View style={[styles.gameLeaf, styles.gameLeafLeft]} />}
          {progress >= 2 && <View style={[styles.gameLeaf, styles.gameLeafRight]} />}
          {progress >= 3 && <View style={styles.gameFlower}>
            <View style={styles.gameFlowerCenter} />
          </View>}
        </Animated.View>

        {progress >= 4 && (
          <Animated.View style={[styles.gamePlant, styles.gamePlantRight, { transform: [{ scale: plantScale }] }]}>
            <View style={styles.gameStemSmall} />
            <View style={[styles.gameLeaf, styles.gameLeafLeft]} />
            <View style={[styles.gameLeaf, styles.gameLeafRight]} />
            <View style={styles.gameFlower}>
              <View style={styles.gameFlowerCenter} />
            </View>
          </Animated.View>
        )}

        {progress >= 5 && (
          <Animated.View style={[styles.gameTree, { transform: [{ scale: plantScale }] }]}>
            <View style={styles.gameTreeTrunk} />
            <View style={styles.gameTreeCrown} />
            <View style={styles.gameTreeCrownSmall} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function MoodGardenScreen({ onBack }: MoodGardenProps) {
  const [view, setView] = useState<GardenView>('home');
  const [progress, setProgress] = useState<GardenProgress>(DEFAULT_PROGRESS);
  const [selectedActivity, setSelectedActivity] = useState<GardenActivityId | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [breathStep, setBreathStep] = useState(0);
  const [isBreathing, setIsBreathing] = useState(false);
  const [noticeAnswers, setNoticeAnswers] = useState(['', '', '']);
  const [reflection, setReflection] = useState('');
  const rewardScale = useRef(new Animated.Value(0.75)).current;
  const userId = getAuthUserId();
  const storageKey = `${STORAGE_PREFIX}${userId || 'guest'}`;
  const selected = gardenActivities.find(item => item.id === selectedActivity);
  const stage = getGardenStage(progress.completedActivities);

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then(value => {
        if (value) {
          const saved = JSON.parse(value) as GardenProgress;
          setProgress({
            completedActivities: Math.max(0, saved.completedActivities || 0),
          });
        }
      })
      .catch(() => undefined)
      .finally(() => setIsLoading(false));
  }, [storageKey]);

  useEffect(() => {
    if (!isBreathing) return;

    const timer = setInterval(() => {
      setBreathStep(current => current + 1);
    }, 2200);

    return () => clearInterval(timer);
  }, [isBreathing]);

  const saveProgress = useCallback(async (nextProgress: GardenProgress) => {
    setProgress(nextProgress);
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(nextProgress));
    } finally {
      setIsSaving(false);
    }
  }, [storageKey]);

  const completeActivity = useCallback(async () => {
    if (isSaving) return;

    const nextProgress = {
      completedActivities: progress.completedActivities + 1,
    };
    await saveProgress(nextProgress);
    rewardScale.setValue(0.75);
    Animated.spring(rewardScale, {
      toValue: 1,
      useNativeDriver: true,
      friction: 6,
    }).start();
    setView('reward');
  }, [isSaving, progress.completedActivities, rewardScale, saveProgress]);

  useEffect(() => {
    if (isBreathing && breathStep >= 6) {
      setIsBreathing(false);
      completeActivity();
    }
  }, [breathStep, completeActivity, isBreathing]);

  const chooseActivity = (activityId: GardenActivityId) => {
    setSelectedActivity(activityId);
    setBreathStep(0);
    setIsBreathing(false);
    setNoticeAnswers(['', '', '']);
    setReflection('');
    setView('activity');
  };

  const goBack = () => {
    if (view === 'home') {
      onBack();
    } else if (view === 'choose' || view === 'reward') {
      setView('home');
    } else {
      setView('choose');
    }
  };

  const updateNoticeAnswer = (index: number, value: string) => {
    setNoticeAnswers(current => current.map((item, itemIndex) => (
      itemIndex === index ? value : item
    )));
  };

  const canComplete = selectedActivity === 'notice'
    ? noticeAnswers.every(answer => answer.trim().length > 0)
    : selectedActivity === 'gratitude'
      ? reflection.trim().length > 0
      : true;

  if (isLoading) {
    return <SafeAreaView style={styles.screen} />;
  }

  if (view === 'reward') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to garden</Text>
          </Pressable>
          <Animated.View style={[styles.rewardCard, { transform: [{ scale: rewardScale }] }]}>
            <GardenGameScene progress={progress.completedActivities} />
            <Text style={styles.rewardTitle}>Your garden is growing</Text>
            <Text style={styles.rewardText}>Small steps count. You made a little space for yourself today.</Text>
            <Text style={styles.progressText}>{progress.completedActivities} moments nurtured</Text>
            <Pressable testID="mood-garden-grow-again" style={styles.primaryButton} onPress={() => setView('choose')}>
              <Text style={styles.primaryButtonText}>Grow It Again</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'activity' && selected) {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Choose another</Text>
          </Pressable>
          <View style={styles.activityCard}>
            <View style={[styles.activityIcon, { backgroundColor: selected.color }]}>
              <Text style={styles.activityEmoji}>{selected.emoji}</Text>
            </View>
            <Text style={styles.eyebrow}>A GENTLE SUGGESTION</Text>
            <Text style={styles.title}>{selected.title}</Text>
            <Text style={styles.detail}>{selected.description}</Text>

            {selectedActivity === 'breathe' && (
              <View style={styles.interactionBox}>
                {isBreathing ? (
                  <>
                    <Text style={styles.breathCount}>Breath {Math.min(Math.floor(breathStep / 2) + 1, 3)} of 3</Text>
                    <Text style={styles.breathPrompt}>{breathStep % 2 === 0 ? 'Breathe in slowly' : 'Breathe out gently'}</Text>
                    <View style={styles.breathCircle}><Text style={styles.breathCircleText}>{breathStep % 2 === 0 ? 'In' : 'Out'}</Text></View>
                  </>
                ) : (
                  <Pressable testID="mood-garden-start-breathing" style={styles.primaryButton} onPress={() => setIsBreathing(true)}>
                    <Text style={styles.primaryButtonText}>Begin three breaths</Text>
                  </Pressable>
                )}
              </View>
            )}

            {selectedActivity === 'water' && (
              <View style={styles.interactionBox}>
                <Text style={styles.prompt}>Take your time. A small sip is enough.</Text>
                <Pressable testID="mood-garden-complete-water" style={styles.primaryButton} onPress={completeActivity}>
                  <Text style={styles.primaryButtonText}>I took a small sip</Text>
                </Pressable>
              </View>
            )}

            {selectedActivity === 'notice' && (
              <View style={styles.interactionBox}>
                <Text style={styles.prompt}>What are three things you notice?</Text>
                {noticeAnswers.map((answer, index) => (
                  <TextInput
                    key={index}
                    value={answer}
                    onChangeText={value => updateNoticeAnswer(index, value)}
                    placeholder={`Thing ${index + 1}`}
                    placeholderTextColor="#94A5A2"
                    style={styles.input}
                  />
                ))}
                <Pressable testID="mood-garden-complete-notice" style={[styles.primaryButton, !canComplete && styles.disabledButton]} disabled={!canComplete} onPress={completeActivity}>
                  <Text style={styles.primaryButtonText}>Finish this moment</Text>
                </Pressable>
              </View>
            )}

            {selectedActivity === 'gratitude' && (
              <View style={styles.interactionBox}>
                <Text style={styles.prompt}>What is one small thing you appreciate?</Text>
                <TextInput
                  value={reflection}
                  onChangeText={setReflection}
                  placeholder="It can be very simple..."
                  placeholderTextColor="#94A5A2"
                  multiline
                  style={[styles.input, styles.multilineInput]}
                />
                <Pressable style={[styles.primaryButton, !canComplete && styles.disabledButton]} disabled={!canComplete} onPress={completeActivity}>
                  <Text style={styles.primaryButtonText}>Keep this thought</Text>
                </Pressable>
              </View>
            )}

            {selectedActivity === 'kind' && (
              <View style={styles.interactionBox}>
                <Text style={styles.prompt}>Who could use a kind message today?</Text>
                <Text style={styles.detail}>You do not have to send anything now. Simply choosing someone is enough.</Text>
                <Pressable style={styles.primaryButton} onPress={completeActivity}>
                  <Text style={styles.primaryButtonText}>I have someone in mind</Text>
                </Pressable>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (view === 'choose') {
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={goBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to garden</Text>
          </Pressable>
          <Text style={styles.eyebrow}>CHOOSE A SMALL MOMENT</Text>
          <Text style={styles.title}>What feels kind today?</Text>
          <Text style={styles.detail}>There is no perfect choice. Follow what feels manageable.</Text>
          {gardenActivities.map(activity => (
            <Pressable key={activity.id} testID={`mood-garden-option-${activity.id}`} style={styles.choiceCard} onPress={() => chooseActivity(activity.id)}>
              <View style={[styles.choiceIcon, { backgroundColor: activity.color }]}><Text style={styles.choiceEmoji}>{activity.emoji}</Text></View>
              <View style={styles.choiceContent}><Text style={styles.choiceTitle}>{activity.title}</Text><Text style={styles.choiceDescription}>{activity.description}</Text></View>
              <Text style={styles.choiceArrow}>→</Text>
            </Pressable>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  const nextMilestone = stage.next ? stage.next - progress.completedActivities : null;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable onPress={goBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to activities</Text>
        </Pressable>
        <View style={styles.gardenCard}>
          <Text style={styles.eyebrow}>MOOD GARDEN</Text>
          <Text style={styles.title}>A softer place to grow</Text>
          <Text style={styles.detail}>Complete tiny, optional moments of care and watch your garden change.</Text>
          <GardenGameScene progress={progress.completedActivities} />
          <Text style={styles.stageLabel}>{stage.label}</Text>
          <Text style={styles.progressText}>{progress.completedActivities} moments nurtured</Text>
          <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${Math.min(progress.completedActivities / 5, 1) * 100}%` }]} /></View>
          {nextMilestone ? <Text style={styles.nextMilestone}>{nextMilestone} more gentle {nextMilestone === 1 ? 'step' : 'steps'} to the next garden stage</Text> : null}
          <Pressable testID="mood-garden-grow" style={styles.primaryButton} onPress={() => setView('choose')}>
            <Text style={styles.primaryButtonText}>Grow My Garden</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAF8F4' },
  content: { flexGrow: 1, padding: 16, paddingBottom: 32 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 7, paddingHorizontal: 2, marginBottom: 12 },
  backButtonText: { color: '#31545B', fontSize: 13, fontWeight: '800' },
  gardenCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#D4ECE4', alignItems: 'center' },
  activityCard: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 22, borderWidth: 1, borderColor: '#D4ECE4', alignItems: 'center' },
  rewardCard: { backgroundColor: '#FFFDF5', borderRadius: 28, padding: 24, borderWidth: 1, borderColor: '#F5E3B6', alignItems: 'center' },
  eyebrow: { color: '#198F78', fontSize: 10, fontWeight: '900', letterSpacing: 1.4, textAlign: 'center' },
  title: { color: '#173B42', fontSize: 24, lineHeight: 31, fontWeight: '900', textAlign: 'center', marginTop: 8, marginBottom: 8 },
  detail: { color: '#65777D', fontSize: 13, lineHeight: 20, textAlign: 'center', marginBottom: 14 },
  gameScene: { width: '100%', height: 220, borderRadius: 22, overflow: 'hidden', backgroundColor: '#BCE9F2' },
  gameSky: { flex: 1, overflow: 'hidden' },
  gameSun: { position: 'absolute', top: 18, right: 22, width: 34, height: 34, borderRadius: 17, backgroundColor: '#FFD977' },
  gameCloud: { position: 'absolute', top: 24, left: 28, flexDirection: 'row', alignItems: 'flex-end' },
  cloudPuffSmall: { width: 18, height: 13, borderRadius: 9, backgroundColor: '#FFFFFF', marginHorizontal: -3 },
  cloudPuffLarge: { width: 31, height: 21, borderRadius: 16, backgroundColor: '#FFFFFF' },
  gameHillBack: { position: 'absolute', bottom: -42, left: -25, width: 245, height: 105, borderRadius: 130, backgroundColor: '#91CFA8' },
  gameHillFront: { position: 'absolute', bottom: -55, right: -50, width: 270, height: 125, borderRadius: 150, backgroundColor: '#70B98D' },
  gameGround: { height: 91, backgroundColor: '#70B98D', borderTopWidth: 2, borderTopColor: '#559D76', position: 'relative' },
  gameSoilPatch: { position: 'absolute', bottom: 13, left: '27%', width: '48%', height: 37, borderRadius: 21, backgroundColor: '#916D52', borderWidth: 3, borderColor: '#A98161' },
  gamePath: { position: 'absolute', bottom: -16, right: 20, width: 42, height: 70, borderRadius: 22, backgroundColor: '#C5A071', transform: [{ rotate: '12deg' }] },
  gameGrassTuftLeft: { position: 'absolute', left: 20, bottom: 19, width: 5, height: 19, backgroundColor: '#3D8D62', transform: [{ rotate: '-25deg' }] },
  gameGrassTuftRight: { position: 'absolute', right: 25, bottom: 22, width: 5, height: 16, backgroundColor: '#3D8D62', transform: [{ rotate: '28deg' }] },
  gamePlant: { position: 'absolute', bottom: 29, width: 42, height: 66, alignItems: 'center', justifyContent: 'flex-end' },
  gamePlantLeft: { left: '25%' },
  gamePlantCenter: { left: '43%' },
  gamePlantRight: { right: '17%' },
  gameStemSmall: { width: 5, height: 29, borderRadius: 3, backgroundColor: '#3C9A62' },
  gameStem: { width: 6, height: 45, borderRadius: 3, backgroundColor: '#328B58' },
  gameLeaf: { position: 'absolute', width: 22, height: 11, borderRadius: 14, backgroundColor: '#4BAE6E' },
  gameLeafLeft: { left: 1, bottom: 29, transform: [{ rotate: '-30deg' }] },
  gameLeafRight: { right: 1, bottom: 40, transform: [{ rotate: '30deg' }] },
  gameFlower: { position: 'absolute', top: 3, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F49DB8', borderWidth: 5, borderColor: '#F8C5D5' },
  gameFlowerCenter: { position: 'absolute', top: 4, left: 4, width: 5, height: 5, borderRadius: 3, backgroundColor: '#F5C84B' },
  gameTree: { position: 'absolute', bottom: 26, right: '4%', width: 52, height: 83, alignItems: 'center' },
  gameTreeTrunk: { position: 'absolute', bottom: 0, width: 10, height: 37, borderRadius: 5, backgroundColor: '#76513D' },
  gameTreeCrown: { position: 'absolute', top: 7, width: 52, height: 52, borderRadius: 27, backgroundColor: '#3D9862' },
  gameTreeCrownSmall: { position: 'absolute', top: 0, left: 6, width: 31, height: 34, borderRadius: 18, backgroundColor: '#57B875' },
  stageLabel: { color: '#198F78', fontSize: 16, fontWeight: '900', marginTop: 14 },
  progressText: { color: '#775C20', fontSize: 12, fontWeight: '800', marginTop: 5 },
  progressTrack: { width: '100%', height: 9, borderRadius: 9, backgroundColor: '#DCEDE7', overflow: 'hidden', marginTop: 13 },
  progressFill: { height: '100%', borderRadius: 9, backgroundColor: '#42C79F' },
  nextMilestone: { color: '#718087', fontSize: 11, textAlign: 'center', marginTop: 8 },
  primaryButton: { width: '100%', backgroundColor: '#42C79F', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 14 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  choiceCard: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 18, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#DCECE7' },
  choiceIcon: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginRight: 11 },
  choiceEmoji: { fontSize: 24 },
  choiceContent: { flex: 1 },
  choiceTitle: { color: '#173B42', fontSize: 14, fontWeight: '900', marginBottom: 3 },
  choiceDescription: { color: '#687A7F', fontSize: 11, lineHeight: 16 },
  choiceArrow: { color: '#198F78', fontSize: 20, fontWeight: '900', marginLeft: 8 },
  activityIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  activityEmoji: { fontSize: 36 },
  interactionBox: { width: '100%', backgroundColor: '#F7FCFA', borderRadius: 17, padding: 14, marginTop: 8 },
  prompt: { color: '#173B42', fontSize: 14, lineHeight: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  input: { minHeight: 43, borderRadius: 11, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D7E5E1', paddingHorizontal: 11, paddingVertical: 9, color: '#173B42', fontSize: 13, marginTop: 8 },
  multilineInput: { minHeight: 82, textAlignVertical: 'top' },
  disabledButton: { backgroundColor: '#DDE9E5' },
  breathCount: { color: '#198F78', fontSize: 12, fontWeight: '900', textAlign: 'center' },
  breathPrompt: { color: '#173B42', fontSize: 17, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  breathCircle: { width: 112, height: 112, borderRadius: 56, backgroundColor: '#BCEBD9', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 16 },
  breathCircleText: { color: '#176E5D', fontSize: 20, fontWeight: '900' },
  rewardTitle: { color: '#775C20', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  rewardText: { color: '#8A7545', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
});

export default MoodGardenScreen;
