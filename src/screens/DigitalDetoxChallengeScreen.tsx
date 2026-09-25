import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  completeDigitalDetoxDay,
  DigitalDetoxProgress,
  getDigitalDetoxProgress,
  startDigitalDetox,
} from '../api/digitalDetoxApi';
import { DIGITAL_DETOX_CHALLENGES } from '../types/digitalDetox';

type Props = { onBack: () => void };
type Mood = '😣' | '😐' | '🙂' | '😌';

const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;

function DigitalDetoxChallengeScreen({ onBack }: Props) {
  const [progress, setProgress] = useState<DigitalDetoxProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [started, setStarted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [guidedStep, setGuidedStep] = useState(0);
  const [completedDay, setCompletedDay] = useState<number | null>(null);
  const [mood, setMood] = useState<Mood | undefined>();
  const [error, setError] = useState('');
  const progressWidth = useRef(new Animated.Value(0)).current;
  const completionScale = useRef(new Animated.Value(0.8)).current;

  const loadProgress = async () => {
    setError('');
    try {
      const existing = await getDigitalDetoxProgress();
      setProgress(existing || (await startDigitalDetox()));
    } catch {
      setError('Could not load your challenge. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProgress();
  }, []);

  const day = progress?.currentDay || 1;
  const currentChallenge = DIGITAL_DETOX_CHALLENGES[day - 1];
  const completedDays = progress?.completedDays || [];
  const isCurrentCompleted = completedDays.includes(day);
  const isTimerComplete = currentChallenge?.durationSeconds ? timeLeft === 0 : true;

  useEffect(() => {
    if (!started || paused || !currentChallenge?.durationSeconds || timeLeft <= 0) {
      return;
    }
    const timer = setInterval(() => setTimeLeft(current => Math.max(0, current - 1)), 1000);
    return () => clearInterval(timer);
  }, [started, paused, currentChallenge?.durationSeconds, timeLeft]);

  useEffect(() => {
    Animated.timing(progressWidth, {
      toValue: completedDays.length / DIGITAL_DETOX_CHALLENGES.length,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [completedDays.length, progressWidth]);

  const beginChallenge = () => {
    setError('');
    setStarted(true);
    setPaused(false);
    setGuidedStep(0);
    if (timeLeft === 0) {
      setTimeLeft(currentChallenge?.durationSeconds || 0);
    }
  };

  const saveCompletion = async () => {
    if (!progress || saving || !isTimerComplete) return;
    setSaving(true);
    setError('');
    try {
      const updated = await completeDigitalDetoxDay(day, undefined, mood);
      setProgress(updated);
      setCompletedDay(day);
      setStarted(false);
      setPaused(false);
      Animated.spring(completionScale, { toValue: 1, useNativeDriver: true }).start();
    } catch {
      setError("Couldn't save your progress. Please check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SafeAreaView style={styles.screen}><ActivityIndicator color="#198F78" size="large" /></SafeAreaView>;
  }

  if (completedDay) {
    const nextDay = completedDay < 31 ? completedDay + 1 : null;
    return (
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>← Back</Text></Pressable>
          <Animated.View style={[styles.card, { transform: [{ scale: completionScale }] }]}>
            <Text style={styles.successEmoji}>🌿</Text>
            <Text style={styles.title}>Nice work!</Text>
            <Text style={styles.detail}>You completed Day {completedDay} of your Digital Balance Challenge.</Text>
            <Text style={styles.prompt}>How do you feel now?</Text>
            <View style={styles.moods}>{(['😣', '😐', '🙂', '😌'] as Mood[]).map(item => <Pressable key={item} onPress={() => setMood(item)} style={[styles.mood, mood === item && styles.moodSelected]}><Text style={styles.moodText}>{item}</Text></Pressable>)}</View>
            <Text style={styles.nextLabel}>{nextDay ? `Day ${nextDay} unlocked` : 'Challenge complete'}</Text>
            <Pressable style={styles.primary} onPress={onBack}><Text style={styles.primaryText}>{nextDay ? 'Continue' : 'Done'}</Text></Pressable>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (!currentChallenge || progress?.completed) {
    return <SafeAreaView style={styles.screen}><Text style={styles.title}>Your Digital Balance Challenge is complete.</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>← Back</Text></Pressable>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>🌿 31-DAY DIGITAL BALANCE</Text>
          <Text style={styles.title}>Small breaks. Better balance.</Text>
          <Text style={styles.dayLabel}>Day {day} of 31</Text>
          <View style={styles.track}><Animated.View style={[styles.fill, { width: progressWidth.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} /></View>
          <View style={styles.challengeIcon}><Text style={styles.iconText}>{currentChallenge.icon}</Text></View>
          <Text style={styles.sectionLabel}>TODAY'S CHALLENGE</Text>
          <Text style={styles.challengeTitle}>{currentChallenge.title}</Text>
          <Text style={styles.detail}>{currentChallenge.description}</Text>
          {started ? (
            <View style={styles.startedBox}>
              {currentChallenge.durationSeconds ? <Text style={styles.timer}>{formatTime(timeLeft)}</Text> : null}
              {day === 1 ? <><Text style={styles.stepLabel}>Step {guidedStep + 1} of {currentChallenge.instructions.length}</Text><Text style={styles.instruction}>{currentChallenge.instructions[guidedStep]}</Text><View style={styles.dots}>{currentChallenge.instructions.map((_, index) => <Text key={index} style={styles.dot}>{index === guidedStep ? '●' : '○'}</Text>)}</View><Pressable style={styles.primary} onPress={() => guidedStep < currentChallenge.instructions.length - 1 ? setGuidedStep(step => step + 1) : setTimeLeft(0)}><Text style={styles.primaryText}>{guidedStep < currentChallenge.instructions.length - 1 ? 'Next' : 'Finish activity'}</Text></Pressable></> : null}
              {day !== 1 && currentChallenge.durationSeconds ? <Text style={styles.instruction}>{timeLeft ? 'Stay with this pause. You are doing enough.' : 'Your break is complete.'}</Text> : null}
              {day !== 1 && !currentChallenge.durationSeconds ? currentChallenge.instructions.map(item => <Text key={item} style={styles.instruction}>• {item}</Text>) : null}
              {day !== 1 && currentChallenge.durationSeconds && timeLeft > 0 && !paused ? <Pressable style={styles.secondary} onPress={() => setPaused(true)}><Text style={styles.secondaryText}>Pause</Text></Pressable> : null}
              {day !== 1 && currentChallenge.durationSeconds && paused ? <Pressable style={styles.secondary} onPress={() => setPaused(false)}><Text style={styles.secondaryText}>Resume</Text></Pressable> : null}
              {isTimerComplete ? <Pressable style={styles.primary} onPress={saveCompletion} disabled={saving}><Text style={styles.primaryText}>{saving ? 'Saving...' : 'Mark Day Complete'}</Text></Pressable> : null}
            </View>
          ) : <Pressable testID="digital-detox-start" style={styles.primary} onPress={beginChallenge}><Text style={styles.primaryText}>Start Challenge</Text></Pressable>}
          {isCurrentCompleted ? <Text style={styles.completed}>✓ Completed</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <Text style={styles.journeyTitle}>Your journey</Text>
        {DIGITAL_DETOX_CHALLENGES.map(item => <View key={item.day} style={[styles.journeyRow, item.day === day && styles.journeyCurrent]}><Text style={styles.journeyStatus}>{completedDays.includes(item.day) ? '✓' : item.day === day ? '→' : item.day > day ? '🔒' : '○'}</Text><Text style={styles.journeyDay}>Day {item.day}</Text><Text style={styles.journeyChallenge}>{item.title}</Text></View>)}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAF8F4', justifyContent: 'center' },
  content: { padding: 16, paddingBottom: 32 },
  back: { alignSelf: 'flex-start', paddingVertical: 8, marginBottom: 8 },
  backText: { color: '#31545B', fontWeight: '800' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 22, borderWidth: 1, borderColor: '#D4ECE4', alignItems: 'center' },
  eyebrow: { color: '#198F78', fontSize: 11, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  title: { color: '#173B42', fontSize: 24, lineHeight: 31, fontWeight: '900', textAlign: 'center', marginVertical: 10 },
  dayLabel: { color: '#60727A', fontWeight: '800', marginBottom: 8 },
  track: { height: 8, width: '100%', borderRadius: 8, backgroundColor: '#DCEDE7', overflow: 'hidden', marginBottom: 22 },
  fill: { height: '100%', backgroundColor: '#42C79F' },
  challengeIcon: { width: 70, height: 70, borderRadius: 22, backgroundColor: '#DDF6EC', alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  iconText: { fontSize: 34 },
  sectionLabel: { color: '#198F78', fontSize: 10, letterSpacing: 1.3, fontWeight: '900' },
  challengeTitle: { color: '#173B42', fontSize: 21, fontWeight: '900', textAlign: 'center', marginTop: 8 },
  detail: { color: '#65777D', fontSize: 14, lineHeight: 21, textAlign: 'center', marginVertical: 10 },
  primary: { width: '100%', backgroundColor: '#42C79F', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  primaryText: { color: '#FFFFFF', fontWeight: '900' },
  secondary: { width: '100%', borderWidth: 1, borderColor: '#D1E0DC', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 8 },
  secondaryText: { color: '#31545B', fontWeight: '800' },
  startedBox: { width: '100%', backgroundColor: '#F7FCFA', borderRadius: 16, padding: 14, marginTop: 10 },
  timer: { color: '#173B42', fontSize: 34, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  stepLabel: { color: '#198F78', fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  instruction: { color: '#31545B', fontSize: 14, lineHeight: 21, marginBottom: 8 },
  dots: { textAlign: 'center', color: '#198F78', marginVertical: 5 },
  dot: { color: '#198F78', fontSize: 16, marginHorizontal: 2 },
  completed: { color: '#198F78', fontWeight: '900', marginTop: 12 },
  error: { color: '#B34B4B', textAlign: 'center', marginTop: 12, lineHeight: 18 },
  journeyTitle: { color: '#173B42', fontSize: 18, fontWeight: '900', marginTop: 22, marginBottom: 10 },
  journeyRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, padding: 11, marginBottom: 6 },
  journeyCurrent: { borderWidth: 1, borderColor: '#42C79F', backgroundColor: '#F1FBF7' },
  journeyStatus: { width: 28, color: '#198F78', fontWeight: '900', textAlign: 'center' },
  journeyDay: { width: 52, color: '#31545B', fontWeight: '900', fontSize: 12 },
  journeyChallenge: { flex: 1, color: '#60727A', fontSize: 12 },
  successEmoji: { fontSize: 54 },
  prompt: { color: '#173B42', fontWeight: '900', marginTop: 14, marginBottom: 10 },
  moods: { flexDirection: 'row', gap: 10 },
  mood: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#F2F7F5', alignItems: 'center', justifyContent: 'center' },
  moodSelected: { backgroundColor: '#DDF6EC', borderWidth: 2, borderColor: '#42C79F' },
  moodText: { fontSize: 22 },
  nextLabel: { color: '#198F78', fontWeight: '900', marginTop: 22 },
});

export default DigitalDetoxChallengeScreen;
