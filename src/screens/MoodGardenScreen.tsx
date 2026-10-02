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

const getGardenPlants = (count: number) => {
  const plants = ['🌱'];
  if (count >= 1) plants.push('🌿');
  if (count >= 3) plants.push('🌸');
  if (count >= 5) plants.push('🌳');
  return plants;
};

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
  const plants = getGardenPlants(progress.completedActivities);

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
            <Text style={styles.rewardIcon}>🌸</Text>
            <Text style={styles.rewardTitle}>Your garden is growing</Text>
            <Text style={styles.rewardText}>Small steps count. You made a little space for yourself today.</Text>
            <View style={styles.plantRow}>
              {plants.map((plant, index) => <Text key={`${plant}-${index}`} style={styles.plant}>{plant}</Text>)}
            </View>
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
          <View style={styles.gardenScene}>
            <Text style={styles.cloud}>☁️</Text>
            <Text style={styles.gardenMain}>{stage.icon}</Text>
            <View style={styles.plantRow}>{plants.map((plant, index) => <Text key={`${plant}-${index}`} style={styles.plant}>{plant}</Text>)}</View>
          </View>
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
  gardenScene: { width: '100%', minHeight: 190, backgroundColor: '#F0FAF0', borderRadius: 22, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 16, overflow: 'hidden' },
  cloud: { position: 'absolute', top: 16, right: 24, fontSize: 28 },
  gardenMain: { fontSize: 86, marginBottom: -2 },
  plantRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 10, minHeight: 36 },
  plant: { fontSize: 28 },
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
  rewardIcon: { fontSize: 64, marginBottom: 10 },
  rewardTitle: { color: '#775C20', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  rewardText: { color: '#8A7545', fontSize: 13, lineHeight: 20, textAlign: 'center', marginTop: 8 },
});

export default MoodGardenScreen;
