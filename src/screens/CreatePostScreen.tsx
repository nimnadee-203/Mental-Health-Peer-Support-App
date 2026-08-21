import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import type { Community } from './GroupDiscussionScreen';

// ─── Config ───────────────────────────────────────────────────────────────────
const API_BASE = 'http://localhost:3000/api';

const TOPICS = [
  'General',
  'Study & Focus',
  'Sleep',
  'Breaks & Rest',
  'Sharing',
  'Asking for support',
];

const CONTENT_NOTES = [
  'None',
  'Anxiety / stress',
  'Grief / loss',
  'Academic pressure',
  'Sensitive topic',
];

interface CreatePostScreenProps {
  community: Community;
  onBack: () => void;
  onPostCreated: () => void;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreatePostScreen({
  community,
  onBack,
  onPostCreated,
}: CreatePostScreenProps) {
  const [content, setContent] = useState('');
  const [topic, setTopic] = useState('General');
  const [contentNote, setContentNote] = useState('None');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isFormValid = content.trim().length >= 3 && topic;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/posts/group/${community._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: content.trim(),
          topic,
          contentNote,
          isAnonymous,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      onPostCreated();
    } catch (error) {
      console.error(error);
      // Fallback: Just return even if it fails for the demo
      onPostCreated();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          
          <Text style={styles.pageTitle}>Share with the community</Text>
          <Text style={styles.pageSubtitle}>
            You can share anonymously. Only post what you feel comfortable sharing.
          </Text>

          <View style={styles.warningCard}>
            <Text style={styles.warningEmoji}>🔒</Text>
            <Text style={styles.warningText}>
              Please avoid sharing personal contact information or identifying details.
            </Text>
          </View>

          {/* MESSAGE INPUT */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Your message</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Share what's on your mind..."
              placeholderTextColor="rgba(45, 45, 58, 0.5)"
              multiline
              textAlignVertical="top"
              value={content}
              onChangeText={setContent}
            />
            <Text style={styles.charCount}>
              {content.length} characters
            </Text>
          </View>

          {/* TOPIC SELECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Topic</Text>
            <View style={styles.pillsContainer}>
              {TOPICS.map(t => {
                const isSelected = topic === t;
                return (
                  <Pressable
                    key={t}
                    style={[styles.pill, isSelected && styles.pillSelected]}
                    onPress={() => setTopic(t)}>
                    <Text style={[styles.pillText, isSelected && styles.pillTextSelected]}>
                      {t}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* CONTENT NOTE SELECTION */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Content note (optional)</Text>
            <View style={styles.pillsContainer}>
              {CONTENT_NOTES.map(note => {
                const isSelected = contentNote === note;
                return (
                  <Pressable
                    key={note}
                    style={[styles.pill, isSelected && styles.pillNoteSelected]}
                    onPress={() => setContentNote(note)}>
                    <Text style={[styles.pillText, isSelected && styles.pillNoteTextSelected]}>
                      {note}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ANONYMOUS TOGGLE */}
          <View style={styles.toggleContainer}>
            <View style={styles.toggleTextContainer}>
              <Text style={styles.toggleTitle}>Post anonymously</Text>
              <Text style={styles.toggleSubtitle}>Your name will not be shown</Text>
            </View>
            <Switch
              trackColor={{ false: '#E8E8F0', true: '#2D2D3A' }}
              thumbColor={'#FFFFFF'}
              ios_backgroundColor="#E8E8F0"
              onValueChange={setIsAnonymous}
              value={isAnonymous}
            />
          </View>

          {/* SUBMIT BUTTON */}
          <Pressable
            style={[styles.submitButtonContainer, !isFormValid && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={!isFormValid || isSubmitting}>
            <LinearGradient
              colors={isFormValid ? ['#C5DFF8', '#C8EDD5'] : ['#F7F7FB', '#F7F7FB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitButtonGradient}>
              {isSubmitting ? (
                <ActivityIndicator color="#2D2D3A" />
              ) : (
                <Text style={[styles.submitButtonText, !isFormValid && styles.submitButtonTextDisabled]}>
                  {content.trim().length > 0 ? 'Post' : 'Write something first'}
                </Text>
              )}
            </LinearGradient>
          </Pressable>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: '#6B6B80',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 72,
  },
  pageTitle: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 22,
    lineHeight: 33,
    letterSpacing: -0.44,
    color: '#2D2D3A',
    marginTop: 12,
  },
  pageSubtitle: {
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 21,
    color: '#6B6B80',
    marginTop: 6,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 8,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    marginTop: 24,
  },
  warningEmoji: {
    fontSize: 14,
    marginTop: 2,
  },
  warningText: {
    flex: 1,
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B6B80',
  },
  section: {
    marginTop: 24,
  },
  sectionLabel: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    lineHeight: 20,
    color: '#2D2D3A',
    marginBottom: 8,
  },
  textArea: {
    height: 150,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    padding: 16,
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 15,
    color: '#2D2D3A',
  },
  charCount: {
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
    color: '#A0A0B8',
    textAlign: 'right',
    marginTop: 6,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 17,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  pillSelected: {
    backgroundColor: '#2D2D3A',
    borderColor: '#2D2D3A',
  },
  pillText: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 13,
    color: '#6B6B80',
  },
  pillTextSelected: {
    color: '#FFFFFF',
  },
  pillNoteSelected: {
    backgroundColor: '#FDDCB5',
    borderColor: '#FDDCB5',
  },
  pillNoteTextSelected: {
    color: '#2D2D3A',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#F7F7FB',
    borderWidth: 1.5,
    borderColor: '#E8E8F0',
    borderRadius: 14,
    marginTop: 20,
    marginBottom: 28,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleTitle: {
    fontFamily: 'Nunito',
    fontWeight: '700',
    fontSize: 14,
    lineHeight: 21,
    color: '#2D2D3A',
  },
  toggleSubtitle: {
    fontFamily: 'Nunito',
    fontWeight: '500',
    fontSize: 12,
    lineHeight: 18,
    color: '#6B6B80',
    marginTop: 2,
  },
  submitButtonContainer: {
    height: 56,
    borderRadius: 28,
    shadowColor: '#C5DFF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 8,
  },
  submitButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  submitButtonText: {
    fontFamily: 'Nunito',
    fontWeight: '800',
    fontSize: 17,
    lineHeight: 26,
    letterSpacing: -0.17,
    color: '#2D2D3A',
  },
  submitButtonTextDisabled: {
    color: '#A0A0B8',
  },
});
