import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceArticle, resourceArticles } from '../types/ResourceArticle';

const quickTips = [
  {
    title: 'Breathing exercise',
    time: '5 min',
    accent: '#C9E8D3',
    icon: '❋',
  },
  {
    title: 'Mindfulness break',
    time: '3 min',
    accent: '#D8E6FC',
    icon: '✦',
  },
  {
    title: 'Journaling prompt',
    time: 'Open-ended',
    accent: '#F2D9BC',
    icon: '✎',
  },
];

const breathingSequence = [
  {
    label: 'Inhale',
    title: 'Breathe in slowly',
    detail: 'Let the breath rise gently and settle into the moment.',
    duration: 4,
    scale: 1.1,
  },
  {
    label: 'Hold',
    title: 'Hold softly',
    detail: 'Rest without forcing anything. Give your body a moment to settle.',
    duration: 4,
    scale: 1.2,
  },
  {
    label: 'Exhale',
    title: 'Breathe out slowly',
    detail: 'Release the breath with ease and allow tension to drift away.',
    duration: 5,
    scale: 0.95,
  },
  {
    label: 'Rest',
    title: 'Let your body rest',
    detail: 'Notice the stillness and return to a soft, steady rhythm.',
    duration: 5,
    scale: 0.9,
  },
];

const mindfulnessSteps = [
  {
    title: '5 things you can see',
    instruction:
      'Look around you. Notice 5 things you can see. They can be colors, shapes, people, objects, or anything else around you.',
  },
  {
    title: '4 things you can feel',
    instruction:
      'Notice 4 things you can physically feel. For example, your feet on the floor, your clothes against your skin, or your phone in your hand.',
  },
  {
    title: '3 things you can hear',
    instruction:
      'Pause and notice 3 sounds around you. They can be loud, quiet, near, or far away.',
  },
  {
    title: '2 things you can smell',
    instruction: 'Notice 2 scents around you. They can be strong or subtle.',
  },
  {
    title: '1 thing you appreciate',
    instruction:
      'Think of one small thing you appreciate right now. It can be something very simple.',
  },
];

const journalingPrompts = [
  {
    question: 'What’s on your mind right now?',
    placeholder: 'Write whatever comes to mind...',
  },
  {
    question: 'What is one thing you need today?',
    placeholder: 'Write here...',
  },
  {
    question: 'What is one small thing that made today a little better?',
    placeholder: 'Write here...',
  },
];

type ResourceFilter =
  | 'All'
  | 'Emotional Wellbeing'
  | 'Student Life'
  | 'Self Care'
  | 'Healthy Habits'
  | 'Peer Support';

const categoryFilters: ResourceFilter[] = [
  'All',
  'Emotional Wellbeing',
  'Student Life',
  'Self Care',
  'Healthy Habits',
  'Peer Support',
];

const sectionOrder = [
  'Explore Resources',
  'Student Wellbeing',
  'Self Care & Healthy Habits',
] as const;

type ResourcesScreenProps = {
  onOpenArticle: (article: ResourceArticle) => void;
  savedResources?: string[];
};

function ResourcesScreen({
  onOpenArticle,
  savedResources = [],
}: ResourcesScreenProps) {
  const [breathingState, setBreathingState] = useState<'idle' | 'active' | 'done'>('idle');
  const [breathingStepIndex, setBreathingStepIndex] = useState(0);
  const [mindfulnessState, setMindfulnessState] = useState<'idle' | 'intro' | 'step' | 'done'>('idle');
  const [mindfulnessStepIndex, setMindfulnessStepIndex] = useState(0);
  const [journalingState, setJournalingState] = useState<'idle' | 'writing' | 'done'>('idle');
  const [journalAnswers, setJournalAnswers] = useState<string[]>(['', '', '']);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<ResourceFilter>('All');
  const [imageLoadErrors, setImageLoadErrors] = useState<string[]>([]);
  const [saveOverrides, setSaveOverrides] = useState<Record<string, boolean>>({});

  const { width: screenWidth } = useWindowDimensions();
  const breathingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);
  const horizontalPadding = 36;
  const cardGap = 12;
  const computedCardWidth = (screenWidth - horizontalPadding - cardGap) / 2;
  const useSingleColumn = computedCardWidth < 170;
  const gridCardWidth = useSingleColumn
    ? screenWidth - horizontalPadding
    : computedCardWidth;

  const activeBreathingStep =
    breathingSequence[breathingStepIndex] ?? breathingSequence[0];
  const currentMindfulnessStep =
    mindfulnessSteps[mindfulnessStepIndex] ?? mindfulnessSteps[0];

  const savedFromProp = useMemo(() => {
    return savedResources
      .map(value => {
        const byId = resourceArticles.find(article => article.id === value);
        if (byId) {
          return byId.id;
        }

        const byTitle = resourceArticles.find(
          article => article.title.toLowerCase() === value.toLowerCase(),
        );

        return byTitle?.id;
      })
      .filter((value): value is string => Boolean(value));
  }, [savedResources]);

  const isResourceSaved = (resourceId: string) => {
    if (Object.prototype.hasOwnProperty.call(saveOverrides, resourceId)) {
      return Boolean(saveOverrides[resourceId]);
    }

    return savedFromProp.includes(resourceId);
  };

  const toggleSavedResource = (resourceId: string) => {
    const nextValue = !isResourceSaved(resourceId);
    setSaveOverrides(current => ({
      ...current,
      [resourceId]: nextValue,
    }));
  };

  const resolvedSavedResources = useMemo(() => {
    return resourceArticles.filter(article => isResourceSaved(article.id));
  }, [saveOverrides, savedFromProp]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    return resourceArticles.filter(article => {
      const matchesCategory =
        selectedFilter === 'All' || article.category === selectedFilter;

      const matchesSearch =
        normalizedQuery.length === 0 ||
        article.title.toLowerCase().includes(normalizedQuery) ||
        article.description.toLowerCase().includes(normalizedQuery) ||
        article.category.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesSearch;
    });
  }, [normalizedQuery, selectedFilter]);

  const featuredArticle = resourceArticles.find(
    article => article.id === 'small-steps-for-difficult-days',
  );

  const visibleFeatured =
    featuredArticle && filteredResources.some(article => article.id === featuredArticle.id)
      ? featuredArticle
      : null;

  const resourcesBySection = useMemo(() => {
    const sectionMap: Record<string, ResourceArticle[]> = {
      'Explore Resources': [],
      'Student Wellbeing': [],
      'Self Care & Healthy Habits': [],
    };

    filteredResources.forEach(article => {
      if (article.section === 'Featured') {
        return;
      }

      if (!sectionMap[article.section]) {
        sectionMap[article.section] = [];
      }

      sectionMap[article.section].push(article);
    });

    return sectionMap;
  }, [filteredResources]);

  const shouldShowEmptyResults = filteredResources.length === 0;

  const addImageError = (resourceId: string) => {
    setImageLoadErrors(current => {
      if (current.includes(resourceId)) {
        return current;
      }

      return [...current, resourceId];
    });
  };

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;

      if (breathingTimerRef.current) {
        clearTimeout(breathingTimerRef.current);
        breathingTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (breathingState !== 'active') {
      return undefined;
    }

    if (breathingTimerRef.current) {
      clearTimeout(breathingTimerRef.current);
    }

    const step = breathingSequence[breathingStepIndex];
    if (!step) {
      return undefined;
    }

    breathingTimerRef.current = setTimeout(() => {
      if (!isMountedRef.current) {
        return;
      }

      if (breathingStepIndex >= breathingSequence.length - 1) {
        setBreathingState('done');
        return;
      }

      setBreathingStepIndex(current => current + 1);
    }, step.duration * 1000);

    return () => {
      if (breathingTimerRef.current) {
        clearTimeout(breathingTimerRef.current);
        breathingTimerRef.current = null;
      }
    };
  }, [breathingState, breathingStepIndex]);

  const resetBreathingActivity = () => {
    if (breathingTimerRef.current) {
      clearTimeout(breathingTimerRef.current);
      breathingTimerRef.current = null;
    }

    setBreathingStepIndex(0);
    setBreathingState('idle');
  };

  const startBreathingExercise = () => {
    setBreathingStepIndex(0);
    setBreathingState('active');
  };

  const skipBreathingExercise = () => {
    resetBreathingActivity();
  };

  const resetMindfulnessActivity = () => {
    setMindfulnessState('idle');
    setMindfulnessStepIndex(0);
  };

  const startMindfulnessBreak = () => {
    setMindfulnessStepIndex(0);
    setMindfulnessState('intro');
  };

  const skipMindfulnessActivity = () => {
    resetMindfulnessActivity();
  };

  const showNextMindfulnessStep = () => {
    if (mindfulnessStepIndex >= mindfulnessSteps.length - 1) {
      setMindfulnessState('done');
      return;
    }

    setMindfulnessStepIndex(current => current + 1);
  };

  const startMindfulnessSteps = () => {
    setMindfulnessStepIndex(0);
    setMindfulnessState('step');
  };

  const resetJournalingActivity = () => {
    setJournalAnswers(['', '', '']);
    setJournalingState('idle');
  };

  const startJournalingActivity = () => {
    setJournalAnswers(['', '', '']);
    setJournalingState('writing');
  };

  const updateJournalAnswer = (index: number, value: string) => {
    setJournalAnswers(current =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  };

  const skipJournalPrompt = (index: number) => {
    updateJournalAnswer(index, '');
  };

  const saveReflection = () => {
    setJournalingState('done');
  };

  const renderResourceImage = (
    resource: ResourceArticle,
    height: number,
    isSaved: boolean,
  ) => {
    const hasImageError = imageLoadErrors.includes(resource.id);

    return (
      <View style={[styles.imageWrap, { height }]}> 
        {hasImageError ? (
          <View style={styles.imageFallback}>
            <Text style={styles.imageFallbackIcon}>{resource.icon}</Text>
            <Text style={styles.imageFallbackText}>Image unavailable</Text>
          </View>
        ) : (
          <Image
            source={{ uri: resource.image }}
            style={styles.resourceImage}
            resizeMode="cover"
            onError={() => addImageError(resource.id)}
          />
        )}

        <Pressable
          onPress={event => {
            event.stopPropagation();
            toggleSavedResource(resource.id);
          }}
          hitSlop={8}
          style={[
            styles.saveButton,
            isSaved && styles.saveButtonActive,
          ]}
        >
          <Text style={styles.saveButtonText}>{isSaved ? '♥' : '♡'}</Text>
        </Pressable>
      </View>
    );
  };

  const renderResourceCard = (
    resource: ResourceArticle,
    isFeatured: boolean,
  ) => {
    const isSaved = isResourceSaved(resource.id);

    return (
      <Pressable
        key={resource.id}
        testID="resource-article-card"
        style={({ pressed }) => [
          isFeatured ? styles.featuredCard : styles.gridCard,
          !isFeatured && { width: gridCardWidth },
          pressed && styles.cardPressed,
        ]}
        onPress={() => onOpenArticle(resource)}
      >
        {renderResourceImage(resource, isFeatured ? 220 : 120, isSaved)}

        <View style={styles.cardContent}>
          <Text style={styles.cardCategory}>{resource.category.toUpperCase()}</Text>
          <Text style={styles.cardTitle}>{resource.title}</Text>
          <Text style={styles.cardDescription}>{resource.description}</Text>

          <View style={styles.cardMetaRow}>
            <Text style={styles.cardMetaText}>{resource.readTime}</Text>
            <View style={styles.arrowButton}>
              <Text style={styles.arrowText}>↗</Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>Resources</Text>
          <Text style={styles.pageSubtitle}>
            Explore tools, guidance, and small activities to support your wellbeing.
          </Text>
        </View>

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search resources..."
            placeholderTextColor="#9AA3AE"
            style={styles.searchInput}
          />
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {categoryFilters.map(filter => {
            const isSelected = selectedFilter === filter;

            return (
              <Pressable
                key={filter}
                style={[
                  styles.filterChip,
                  isSelected ? styles.filterChipSelected : styles.filterChipIdle,
                ]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected ? styles.filterChipTextSelected : styles.filterChipTextIdle,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {shouldShowEmptyResults ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No resources found</Text>
            <Text style={styles.emptyText}>
              Try changing your search or category filter.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Featured</Text>
              {visibleFeatured ? renderResourceCard(visibleFeatured, true) : null}
            </View>

            {sectionOrder.map(sectionName => {
              const sectionItems = resourcesBySection[sectionName] ?? [];

              if (sectionItems.length === 0) {
                return null;
              }

              return (
                <View key={sectionName} style={styles.sectionBlock}>
                  <Text style={styles.sectionTitle}>{sectionName}</Text>
                  <View
                    style={[
                      styles.gridWrap,
                      useSingleColumn && styles.singleColumnGridWrap,
                    ]}
                  >
                    {sectionItems.map(article => renderResourceCard(article, false))}
                  </View>
                </View>
              );
            })}
          </>
        )}

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Try Something New</Text>

          {quickTips.map(item => {
            const isBreathingCard = item.title === 'Breathing exercise';
            const isMindfulnessCard = item.title === 'Mindfulness break';
            const isJournalingCard = item.title === 'Journaling prompt';

            return (
              <View key={item.title} style={styles.tipRow}>
                <View
                  style={[
                    styles.tipIcon,
                    { backgroundColor: item.accent },
                  ]}
                >
                  <Text style={styles.tipIconText}>{item.icon}</Text>
                </View>

                <View style={styles.tipCopy}>
                  <Text style={styles.tipTitle}>{item.title}</Text>
                  <Text style={styles.tipMeta}>{item.time}</Text>
                </View>

                <Pressable
                  testID={
                    isBreathingCard
                      ? 'breathing-start-button'
                      : isMindfulnessCard
                        ? 'mindfulness-start-button'
                        : isJournalingCard
                          ? 'journaling-start-button'
                          : undefined
                  }
                  style={styles.startButton}
                  onPress={() => {
                    if (isBreathingCard) {
                      startBreathingExercise();
                    }

                    if (isMindfulnessCard) {
                      startMindfulnessBreak();
                    }

                    if (isJournalingCard) {
                      startJournalingActivity();
                    }
                  }}
                >
                  <Text style={styles.startButtonText}>Start</Text>
                </Pressable>
              </View>
            );
          })}
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.sectionTitle}>Saved Resources</Text>
          <View style={styles.savedList}>
            {resolvedSavedResources.length > 0 ? (
              resolvedSavedResources.map(resource => (
                <Text key={resource.id} style={styles.savedResource}>
                  {resource.title}
                </Text>
              ))
            ) : (
              <Text style={styles.savedEmptyText}>
                Your saved resources will appear here.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {breathingState !== 'idle' && (
        <View style={styles.activityOverlay} pointerEvents="box-none">
          <View style={styles.activityCard}>
            {breathingState === 'active' ? (
              <>
                <Text style={styles.activityTag}>Sample activity</Text>
                <Text style={styles.activityStep}>
                  Step {breathingStepIndex + 1} of {breathingSequence.length}
                </Text>

                <View
                  style={[
                    styles.breathingCircle,
                    { transform: [{ scale: activeBreathingStep.scale }] },
                  ]}
                >
                  <Text style={styles.breathingLabel}>{activeBreathingStep.label}</Text>
                </View>

                <Text style={styles.activityTitle}>{activeBreathingStep.title}</Text>
                <Text style={styles.activityDetail}>{activeBreathingStep.detail}</Text>

                <View style={styles.progressRow}>
                  {breathingSequence.map((step, index) => (
                    <View
                      key={`${step.label}-${index}`}
                      style={[
                        styles.progressDot,
                        index <= breathingStepIndex && styles.progressDotActive,
                      ]}
                    />
                  ))}
                </View>

                <Pressable style={styles.skipAction} onPress={skipBreathingExercise}>
                  <Text style={styles.skipActionText}>Skip activity</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.successIconWrap}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>

                <Text style={styles.activityTag}>Activity completed</Text>
                <Text style={styles.activityTitle}>Well done!</Text>
                <Text style={styles.activityDetail}>
                  You completed a short breathing reset. Take a moment to notice how you feel now.
                </Text>

                <Pressable style={styles.primaryAction} onPress={resetBreathingActivity}>
                  <Text style={styles.primaryActionText}>Try another activity</Text>
                </Pressable>

                <Pressable style={styles.secondaryAction} onPress={resetBreathingActivity}>
                  <Text style={styles.secondaryActionText}>Back to Home</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      )}

      {mindfulnessState !== 'idle' && (
        <View style={styles.activityOverlay} pointerEvents="box-none">
          <View style={styles.activityCard}>
            {mindfulnessState === 'intro' && (
              <>
                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>🌿</Text>
                </View>
                <Text style={styles.activityTag}>Mindfulness Break</Text>
                <Text style={styles.activityTitle}>Mindfulness Break</Text>
                <Text style={styles.subtitleText}>Take a moment to reconnect with the present.</Text>
                <Text style={styles.activityDetail}>
                  This short grounding exercise helps you focus on the world around you.
                </Text>

                <Pressable style={styles.primaryAction} onPress={startMindfulnessSteps}>
                  <Text style={styles.primaryActionText}>Begin</Text>
                </Pressable>

                <Pressable style={styles.skipAction} onPress={skipMindfulnessActivity}>
                  <Text style={styles.skipActionText}>Skip</Text>
                </Pressable>
              </>
            )}

            {mindfulnessState === 'step' && (
              <>
                <Text style={styles.activityTag}>Mindfulness</Text>
                <Text style={styles.activityStep}>
                  Step {mindfulnessStepIndex + 1} of {mindfulnessSteps.length}
                </Text>

                <View style={styles.iconBadge}>
                  <Text style={styles.iconBadgeText}>🌿</Text>
                </View>

                <Text style={styles.activityTitle}>{currentMindfulnessStep.title}</Text>
                <Text style={styles.activityDetail}>{currentMindfulnessStep.instruction}</Text>

                <View style={styles.progressRow}>
                  {mindfulnessSteps.map((step, index) => (
                    <View
                      key={`${step.title}-${index}`}
                      style={[
                        styles.progressDot,
                        index <= mindfulnessStepIndex && styles.progressDotActive,
                      ]}
                    />
                  ))}
                </View>

                <Pressable
                  style={styles.primaryAction}
                  onPress={showNextMindfulnessStep}
                >
                  <Text style={styles.primaryActionText}>
                    {mindfulnessStepIndex === mindfulnessSteps.length - 1 ? 'Complete' : 'Next'}
                  </Text>
                </Pressable>

                <Pressable style={styles.skipAction} onPress={skipMindfulnessActivity}>
                  <Text style={styles.skipActionText}>Skip</Text>
                </Pressable>
              </>
            )}

            {mindfulnessState === 'done' && (
              <>
                <View style={styles.successIconWrap}>
                  <Text style={styles.successIcon}>✓</Text>
                </View>
                <Text style={styles.activityTag}>Mindfulness complete</Text>
                <Text style={styles.activityTitle}>You’re back in the moment.</Text>
                <Text style={styles.activityDetail}>
                  Take one more slow breath and notice how you feel.
                </Text>

                <Pressable style={styles.primaryAction} onPress={resetMindfulnessActivity}>
                  <Text style={styles.primaryActionText}>Done</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      )}

      {journalingState !== 'idle' && (
        <View style={styles.activityOverlay} pointerEvents="box-none">
          <KeyboardAvoidingView
            style={styles.journalKeyboardView}
            behavior="padding"
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.journalScrollContent}
            >
              <View style={styles.journalCard}>
                {journalingState === 'writing' ? (
                  <>
                    <Text style={styles.activityTag}>Journaling</Text>
                    <Text style={styles.activityTitle}>Journaling</Text>
                    <Text style={styles.subtitleText}>A moment for yourself</Text>
                    <Text style={styles.activityDetail}>
                      Take a few minutes to put your thoughts into words. There’s no right or wrong answer.
                    </Text>

                    {journalingPrompts.map((prompt, index) => (
                      <View key={prompt.question} style={styles.promptCard}>
                        <Text style={styles.promptQuestion}>{prompt.question}</Text>

                        <TextInput
                          multiline
                          value={journalAnswers[index]}
                          onChangeText={value => updateJournalAnswer(index, value)}
                          placeholder={prompt.placeholder}
                          placeholderTextColor="#97A1AB"
                          style={styles.textInput}
                          textAlignVertical="top"
                        />

                        <Pressable style={styles.promptSkip} onPress={() => skipJournalPrompt(index)}>
                          <Text style={styles.promptSkipText}>Skip</Text>
                        </Pressable>
                      </View>
                    ))}

                    <Pressable style={styles.primaryAction} onPress={saveReflection}>
                      <Text style={styles.primaryActionText}>Save Reflection</Text>
                    </Pressable>

                    <Pressable style={styles.secondaryAction} onPress={resetJournalingActivity}>
                      <Text style={styles.secondaryActionText}>Exit</Text>
                    </Pressable>
                  </>
                ) : (
                  <>
                    <View style={styles.successIconWrap}>
                      <Text style={styles.successIcon}>✓</Text>
                    </View>
                    <Text style={styles.activityTag}>Reflection saved</Text>
                    <Text style={styles.activityTitle}>You made space for yourself.</Text>
                    <Text style={styles.activityDetail}>
                      You don't need to solve everything today. Sometimes putting your thoughts into words is enough.
                    </Text>

                    <Pressable style={styles.primaryAction} onPress={resetJournalingActivity}>
                      <Text style={styles.primaryActionText}>Done</Text>
                    </Pressable>
                  </>
                )}
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F2F5F7',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 110,
  },
  pageHeader: {
    marginBottom: 16,
  },
  pageTitle: {
    color: '#1F2A37',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 8,
  },
  pageSubtitle: {
    color: '#6A7280',
    fontSize: 15,
    lineHeight: 22,
  },
  searchWrap: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    color: '#7A8694',
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#1F2A37',
    fontSize: 15,
    paddingVertical: 0,
  },
  filterRow: {
    paddingVertical: 4,
    paddingRight: 8,
    gap: 10,
    marginBottom: 18,
  },
  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },
  filterChipSelected: {
    backgroundColor: '#CBE9D8',
    borderColor: '#CBE9D8',
  },
  filterChipIdle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E6E8',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextSelected: {
    color: '#1F2A37',
  },
  filterChipTextIdle: {
    color: '#6A7280',
  },
  sectionBlock: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#1F2A37',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    overflow: 'hidden',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  singleColumnGridWrap: {
    justifyContent: 'center',
  },
  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    overflow: 'hidden',
  },
  cardPressed: {
    opacity: 0.86,
  },
  imageWrap: {
    width: '100%',
    backgroundColor: '#E8EEF2',
    position: 'relative',
  },
  resourceImage: {
    width: '100%',
    height: '100%',
  },
  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8E6FC',
  },
  imageFallbackIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  imageFallbackText: {
    color: '#5F6875',
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  saveButtonActive: {
    backgroundColor: '#EAF6EF',
    borderColor: '#CBE9D8',
  },
  saveButtonText: {
    color: '#1F2A37',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },
  cardCategory: {
    color: '#6A7280',
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#1F2A37',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardDescription: {
    color: '#6A7280',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardMetaText: {
    color: '#6A7280',
    fontSize: 12,
    fontWeight: '600',
  },
  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#1F2A37',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  emptyTitle: {
    color: '#1F2A37',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyText: {
    color: '#6A7280',
    fontSize: 14,
    lineHeight: 20,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    marginBottom: 10,
  },
  tipIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  tipIconText: {
    fontSize: 18,
  },
  tipCopy: {
    flex: 1,
  },
  tipTitle: {
    color: '#202938',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  tipMeta: {
    color: '#758195',
    fontSize: 12,
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#CBE9D8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  startButtonText: {
    color: '#1D2E25',
    fontSize: 12,
    fontWeight: '800',
  },
  savedList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  savedResource: {
    color: '#1F2A37',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    paddingVertical: 4,
  },
  savedEmptyText: {
    color: '#6A7280',
    fontSize: 13,
    lineHeight: 18,
  },
  activityOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(52, 43, 82, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  activityCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#F4F8F6',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDE7E2',
    alignItems: 'center',
  },
  activityTag: {
    color: '#5B6A72',
    fontSize: 11,
    letterSpacing: 1.1,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  activityStep: {
    color: '#7E8C96',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 18,
  },
  breathingCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#CFE7D8',
    borderWidth: 1,
    borderColor: '#B6D7C3',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  breathingLabel: {
    color: '#1F2A37',
    fontSize: 24,
    fontWeight: '800',
  },
  activityTitle: {
    color: '#1F2A37',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleText: {
    color: '#5F6875',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 12,
  },
  activityDetail: {
    color: '#5F6875',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D9E3E7',
    marginHorizontal: 5,
  },
  progressDotActive: {
    backgroundColor: '#5AAE7A',
  },
  successIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D9F0DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successIcon: {
    color: '#238E47',
    fontSize: 32,
    fontWeight: '800',
  },
  primaryAction: {
    width: '100%',
    backgroundColor: '#CBE9D8',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryActionText: {
    color: '#1F2A37',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryAction: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E2E8',
  },
  secondaryActionText: {
    color: '#1F2A37',
    fontSize: 14,
    fontWeight: '700',
  },
  skipAction: {
    width: '100%',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginTop: 2,
  },
  skipActionText: {
    color: '#5F6875',
    fontSize: 13,
    fontWeight: '700',
  },
  iconBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#DCEEF0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconBadgeText: {
    fontSize: 28,
  },
  journalKeyboardView: {
    width: '100%',
    maxWidth: 380,
  },
  journalScrollContent: {
    paddingBottom: 24,
  },
  journalCard: {
    width: '100%',
    backgroundColor: '#F4F8F6',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#DDE7E2',
  },
  promptCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    marginBottom: 12,
  },
  promptQuestion: {
    color: '#1F2A37',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  textInput: {
    minHeight: 90,
    borderRadius: 12,
    backgroundColor: '#F5F7F8',
    borderWidth: 1,
    borderColor: '#DDE3E8',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1F2A37',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  promptSkip: {
    marginTop: 8,
    alignSelf: 'flex-end',
  },
  promptSkipText: {
    color: '#5F6875',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default ResourcesScreen;
