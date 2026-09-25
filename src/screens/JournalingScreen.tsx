import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createJournalEntry, getJournalEntries, JournalEntry, JournalFocusId, JournalMoodId } from '../api/journalsApi';

type Props = { onBack: () => void };
type Mood = { id: JournalMoodId; emoji: string; label: string; color: string; soft: string };
type Focus = { id: JournalFocusId; emoji: string; title: string; color: string; soft: string; prompts: Prompt[] };
type Prompt = { question: string; placeholder: string; suggestions: string[] };

const moods: Mood[] = [
  { id: 'great', emoji: '😄', label: 'Great', color: '#198F78', soft: '#DDF7EC' },
  { id: 'good', emoji: '🙂', label: 'Good', color: '#42C79F', soft: '#EAF9F4' },
  { id: 'okay', emoji: '😐', label: 'Okay', color: '#70A8D8', soft: '#E8F3FC' },
  { id: 'low', emoji: '😔', label: 'Low', color: '#9B8AD8', soft: '#F0ECFB' },
  { id: 'stressed', emoji: '😣', label: 'Stressed', color: '#D8896A', soft: '#FCEEE8' },
];

const focuses: Focus[] = [
  {
    id: 'clear', emoji: '🌿', title: 'Clear My Mind', color: '#198F78', soft: '#EAF9F4',
    prompts: [
      { question: "What's been taking up the most space in your mind lately?", placeholder: 'Write whatever comes to mind...', suggestions: ["Something I've been thinking about is...", 'Right now, I wish...', 'What I really need today is...'] },
      { question: 'Is there anything you can let go of for today?', placeholder: 'A worry, expectation, or pressure...', suggestions: ['I can release...', "It's okay if I don't...", 'For today, I choose to...'] },
      { question: 'What would help you feel a little lighter?', placeholder: 'A small action, thought, or reminder...', suggestions: ['I might feel lighter if...', 'A small step I can take is...', 'I want to remind myself that...'] },
    ],
  },
  {
    id: 'gratitude', emoji: '💛', title: 'Practice Gratitude', color: '#C9A227', soft: '#FFF8E8',
    prompts: [
      { question: "What is one small thing you're grateful for today?", placeholder: 'Even something tiny counts...', suggestions: ["Today I'm grateful for...", 'A simple joy was...', 'I appreciate...'] },
      { question: 'Who is someone who made your day a little better?', placeholder: 'A friend, family member, stranger, or yourself...', suggestions: ['Someone who helped me was...', 'I felt supported by...', 'I want to thank...'] },
      { question: 'What is something simple that brought you joy?', placeholder: 'A moment, sound, smell, or memory...', suggestions: ['I smiled when...', 'A small joy was...', 'I enjoyed...'] },
    ],
  },
  {
    id: 'feelings', emoji: '💭', title: 'Process My Feelings', color: '#6B8FD8', soft: '#EEF3FC',
    prompts: [
      { question: 'What happened?', placeholder: 'Describe the moment in your own words...', suggestions: ['Earlier today...', 'Something that affected me was...', 'I noticed that...'] },
      { question: 'How did it make you feel?', placeholder: 'Name the feelings without judging them...', suggestions: ['I felt...', 'Underneath that, I also felt...', 'My body felt...'] },
      { question: 'What do you need right now?', placeholder: 'Support, rest, space, kindness...', suggestions: ['Right now I need...', 'It would help if...', 'I can offer myself...'] },
    ],
  },
  {
    id: 'plan', emoji: '🎯', title: 'Plan Ahead', color: '#42A8C7', soft: '#E8F7FB',
    prompts: [
      { question: 'What is one thing you want to accomplish?', placeholder: 'Keep it realistic and kind...', suggestions: ['One thing I want to do is...', 'A small goal for me is...', 'I hope to finish...'] },
      { question: 'What might make today easier?', placeholder: 'A tool, habit, boundary, or support...', suggestions: ['Today might feel easier if...', 'I can prepare by...', 'I will ask for help with...'] },
      { question: 'What is one thing you can look forward to?', placeholder: 'Something upcoming, big or small...', suggestions: ["I'm looking forward to...", 'A bright spot later is...', 'I get to enjoy...'] },
    ],
  },
];

function JournalingScreen({ onBack }: Props) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedMood, setSelectedMood] = useState<JournalMoodId | null>(null);
  const [selectedFocus, setSelectedFocus] = useState<JournalFocusId | null>(null);
  const [answers, setAnswers] = useState(['', '', '']);
  const [tinyWin, setTinyWin] = useState('');
  const [isDone, setIsDone] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getJournalEntries().then(setEntries).catch(() => setError('Could not load your previous journals.')).finally(() => setIsLoading(false));
  }, []);

  const focus = focuses.find(item => item.id === selectedFocus);
  const mood = moods.find(item => item.id === selectedMood);
  const hasResponse = answers.some(answer => answer.trim()) || tinyWin.trim();
  const canFinish = Boolean(selectedMood && selectedFocus && hasResponse);
  const updateAnswer = (index: number, value: string) => setAnswers(current => current.map((answer, answerIndex) => answerIndex === index ? value : answer));
  const addSuggestion = (index: number, suggestion: string) => updateAnswer(index, answers[index].trim() ? `${answers[index].trim()} ${suggestion}` : suggestion);
  const reset = () => { setSelectedMood(null); setSelectedFocus(null); setAnswers(['', '', '']); setTinyWin(''); setIsDone(false); setError(''); };

  const save = async () => {
    if (!selectedMood || !selectedFocus || !canFinish || isSaving) return;
    setIsSaving(true);
    setError('');
    try {
      const entry = await createJournalEntry({ mood: selectedMood, focus: selectedFocus, answers, tinyWin });
      setEntries(current => [entry, ...current]);
      setIsDone(true);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Could not save your journal entry. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Pressable onPress={onBack} style={styles.back}><Text style={styles.backText}>← Back to activities</Text></Pressable>
        {isLoading ? <ActivityIndicator color="#198F78" size="large" /> : null}
        {isDone ? (
          <View style={styles.card}>
            <Text style={styles.success}>✓</Text><Text style={styles.eyebrow}>REFLECTION SAVED</Text>
            <Text style={styles.title}>You made space for yourself. 🌿</Text>
            <Text style={styles.detail}>Your reflection is saved privately to your account and will be here when you return.</Text>
            <View style={styles.summary}><Text style={styles.summaryHeading}>Your check-in</Text><Text style={styles.summaryText}>Mood: {mood?.emoji} {mood?.label}</Text><Text style={styles.summaryText}>Focus: {focus?.emoji} {focus?.title}</Text></View>
            <Pressable style={styles.primary} onPress={onBack}><Text style={styles.primaryText}>Done</Text></Pressable>
            <Pressable style={styles.secondary} onPress={reset}><Text style={styles.secondaryText}>Write Again</Text></Pressable>
          </View>
        ) : (
          <View style={styles.card}>
            <View style={styles.journalIcon}><Text style={styles.journalIconText}>✎</Text></View>
            <Text style={styles.eyebrow}>REFLECTION</Text><Text style={styles.title}>A moment for yourself</Text>
            <Text style={styles.detail}>Take a few minutes to check in, choose a focus, and put your thoughts into words.</Text>
            <Text style={styles.sectionTitle}>How are you feeling right now?</Text>
            <View style={styles.grid}>{moods.map(item => <Pressable key={item.id} testID={`journal-mood-${item.id}`} onPress={() => setSelectedMood(item.id)} style={[styles.moodChip, { backgroundColor: item.soft }, selectedMood === item.id && { borderColor: item.color, borderWidth: 2 }]}><Text style={styles.emoji}>{item.emoji}</Text><Text style={styles.chipText}>{item.label}</Text></Pressable>)}</View>
            <Text style={styles.sectionTitle}>What would you like to focus on?</Text>
            <View style={styles.grid}>{focuses.map(item => <Pressable key={item.id} testID={`journal-focus-${item.id}`} onPress={() => { setSelectedFocus(item.id); setAnswers(['', '', '']); }} style={[styles.focusChip, { backgroundColor: item.soft }, selectedFocus === item.id && { borderColor: item.color, borderWidth: 2 }]}><Text style={styles.emoji}>{item.emoji}</Text><Text style={styles.chipText}>{item.title}</Text></Pressable>)}</View>
            {focus ? <><Text style={styles.sectionTitle}>Guided prompts</Text>{focus.prompts.map((prompt, index) => <View key={prompt.question} style={styles.prompt}><Text style={styles.promptQuestion}>{prompt.question}</Text><TextInput multiline value={answers[index]} onChangeText={value => updateAnswer(index, value)} placeholder={prompt.placeholder} placeholderTextColor="#9AA8A8" style={styles.input} textAlignVertical="top" /><View style={styles.suggestions}>{prompt.suggestions.map(suggestion => <Pressable key={suggestion} onPress={() => addSuggestion(index, suggestion)} style={styles.suggestion}><Text style={styles.suggestionText}>{suggestion}</Text></Pressable>)}</View></View>)}<Text style={styles.sectionTitle}>🏆 What's one tiny win from today?</Text><TextInput multiline value={tinyWin} onChangeText={setTinyWin} placeholder="Even something small counts..." placeholderTextColor="#9AA8A8" style={styles.input} textAlignVertical="top" /></> : null}
            <Text style={styles.private}>🔒 Your reflection is private</Text>
            <Pressable testID="journal-save" style={[styles.primary, !canFinish && styles.disabled]} disabled={!canFinish || isSaving} onPress={save}><Text style={styles.primaryText}>{isSaving ? 'Saving...' : '✨ Save Reflection'}</Text></Pressable>
            {error ? <Text style={styles.error}>{error}</Text> : null}
          </View>
        )}
        <Text style={styles.historyTitle}>Previous journals</Text>
        {!isLoading && entries.length === 0 ? <Text style={styles.empty}>Your saved reflections will appear here.</Text> : null}
        {entries.map(entry => { const entryMood = moods.find(item => item.id === entry.mood); const entryFocus = focuses.find(item => item.id === entry.focus); return <View key={entry._id} style={styles.historyCard}><Text style={styles.historyDate}>{new Date(entry.createdAt).toLocaleDateString()}</Text><Text style={styles.historyHeading}>{entryMood?.emoji} {entryMood?.label} · {entryFocus?.title}</Text><Text style={styles.historyText}>{entry.answers.find(answer => answer.trim()) || entry.tinyWin || 'Reflection saved.'}</Text></View>; })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAF8F4' }, content: { padding: 16, paddingBottom: 32 }, back: { paddingVertical: 8, marginBottom: 8 }, backText: { color: '#31545B', fontWeight: '800' }, card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#D4ECE4' }, journalIcon: { alignSelf: 'center', width: 58, height: 58, borderRadius: 18, backgroundColor: '#F5E5D0', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }, journalIconText: { color: '#9C7147', fontSize: 27 }, eyebrow: { color: '#198F78', fontSize: 10, letterSpacing: 1.3, fontWeight: '900', textAlign: 'center' }, title: { color: '#173B42', fontSize: 23, lineHeight: 29, fontWeight: '900', textAlign: 'center', marginVertical: 9 }, detail: { color: '#65777D', fontSize: 13.5, lineHeight: 21, textAlign: 'center', marginBottom: 16 }, sectionTitle: { color: '#173B42', fontSize: 15, fontWeight: '900', marginTop: 16, marginBottom: 10 }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, moodChip: { width: '30%', minWidth: 82, flexGrow: 1, borderRadius: 14, paddingVertical: 10, alignItems: 'center', borderWidth: 1.5, borderColor: 'transparent' }, focusChip: { width: '47%', flexGrow: 1, minHeight: 76, borderRadius: 14, padding: 12, borderWidth: 1.5, borderColor: 'transparent' }, emoji: { fontSize: 21, marginBottom: 4 }, chipText: { color: '#31545B', fontSize: 11.5, fontWeight: '800' }, prompt: { backgroundColor: '#F7FCFA', borderRadius: 15, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#DCEDE7' }, promptQuestion: { color: '#173B42', fontSize: 14, fontWeight: '800', lineHeight: 19, marginBottom: 9 }, input: { minHeight: 82, borderRadius: 12, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D7E5E1', padding: 10, color: '#173B42', fontSize: 13, lineHeight: 19 }, suggestions: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 }, suggestion: { backgroundColor: '#FFF', borderRadius: 999, paddingVertical: 7, paddingHorizontal: 9, borderWidth: 1, borderColor: '#D7E5E1' }, suggestionText: { color: '#31545B', fontSize: 10.5, fontWeight: '700' }, private: { color: '#198F78', backgroundColor: '#EAF9F4', padding: 12, borderRadius: 12, marginTop: 16, fontWeight: '800', textAlign: 'center' }, primary: { backgroundColor: '#42C79F', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 }, primaryText: { color: '#FFF', fontWeight: '900' }, disabled: { backgroundColor: '#DDE9E5' }, secondary: { borderWidth: 1, borderColor: '#D1E0DC', borderRadius: 14, paddingVertical: 13, alignItems: 'center', marginTop: 8 }, secondaryText: { color: '#31545B', fontWeight: '800' }, error: { color: '#B34B4B', textAlign: 'center', marginTop: 12 }, success: { color: '#168A58', fontSize: 44, fontWeight: '900', textAlign: 'center' }, summary: { backgroundColor: '#F7FCFA', borderRadius: 15, padding: 14, marginTop: 10 }, summaryHeading: { color: '#198F78', fontWeight: '900', marginBottom: 8 }, summaryText: { color: '#31545B', marginBottom: 5 }, historyTitle: { color: '#173B42', fontSize: 19, fontWeight: '900', marginTop: 22, marginBottom: 10 }, empty: { color: '#60727A', textAlign: 'center', marginBottom: 12 }, historyCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#DCEDE7' }, historyDate: { color: '#198F78', fontSize: 11, fontWeight: '900', marginBottom: 5 }, historyHeading: { color: '#173B42', fontWeight: '900', marginBottom: 6 }, historyText: { color: '#60727A', lineHeight: 18 },
});

export default JournalingScreen;
