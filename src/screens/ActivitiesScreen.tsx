import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Sound from 'react-native-sound';
import { SafeAreaView } from 'react-native-safe-area-context';

type ActivityType =
  | 'breathing'
  | 'mindfulness'
  | 'journaling'
  | 'digitalDetox'
  | 'healthyRoutine';

type ActivitiesScreenProps = {
  activity?: ActivityType;
  onBack: () => void;
  onSelectActivity: (
    activity: ActivityType,
  ) => void;
};

/* =========================================================
   ACTIVITY DATA
========================================================= */

const activities = [
  {
    type: 'breathing' as ActivityType,
    title: 'Breathing Exercise',
    description:
      'Slow your breathing and create a little space to relax.',
    duration: '5 min',
    icon: '❋',
    color: '#C9E8D3',
  },

  {
    type: 'mindfulness' as ActivityType,
    title: 'Mindfulness Break',
    description:
      'Use your senses to reconnect with the present moment.',
    duration: '3 min',
    icon: '✦',
    color: '#D8E6FC',
  },

  {
    type: 'journaling' as ActivityType,
    title: 'Journaling',
    description:
      'Put your thoughts into words with a few gentle prompts.',
    duration: 'Open-ended',
    icon: '✎',
    color: '#F2D9BC',
  },

  {
    type: 'digitalDetox' as ActivityType,
    title: 'Digital Detox Break',
    description:
      'Step away from your screen for a few minutes and reconnect with yourself.',
    duration: '5 min',
    icon: '📵',
    color: '#E0D8F8',
  },

  {
    type: 'healthyRoutine' as ActivityType,
    title: 'Healthy Routine Check',
    description:
      'Check in with the small habits that support your wellbeing.',
    duration: '2 min',
    icon: '🌱',
    color: '#E8F5C8',
  },
];

/* =========================================================
   BREATHING
========================================================= */

const breathingSequence = [
  {
    label: 'INHALE',
    title: 'Breathe in slowly',
    detail:
      'Let your breath flow in gently. Fill your lungs without forcing it.',
    duration: 5,
    scale: 1.25,
    color: '#7ED6A5',
    message: 'Slow and steady 🌿',
  },

  {
    label: 'HOLD',
    title: 'Hold softly',
    detail:
      'Keep your body relaxed. Enjoy this quiet moment before breathing out.',
    duration: 5,
    scale: 1.25,
    color: '#70C9D8',
    message: 'You’re doing well 💙',
  },

  {
    label: 'EXHALE',
    title: 'Breathe out slowly',
    detail:
      'Release the breath gently and let some of the tension leave with it.',
    duration: 5,
    scale: 0.9,
    color: '#8EAFE8',
    message: 'Let it all out ✨',
  },

  {
    label: 'REST',
    title: 'Relax for a moment',
    detail:
      'Notice the calm between breaths. There is nothing you need to rush.',
    duration: 6,
    scale: 0.9,
    color: '#B5A5E8',
    message: 'Just be here 🌸',
  },
];

/* =========================================================
   MINDFULNESS
========================================================= */

const mindfulnessSteps = [
  {
    number: 5,
    title: 'Things you can see',
    instruction:
      'Look around you and choose 5 things you can see right now.',
    emoji: '👀',
    color: '#7ED6A5',
    options: [
      '🌿 A plant or something green',
      '🟦 A colour you like',
      '🪑 A piece of furniture',
      '📱 Something you use every day',
      '☀️ Something bright or shiny',
      '🪟 Something near a window',
      '🎨 Something with an interesting shape',
    ],
  },

  {
    number: 4,
    title: 'Things you can feel',
    instruction:
      'Notice 4 physical sensations around you. Choose what you can feel right now.',
    emoji: '🤲',
    color: '#70C9D8',
    options: [
      '🪑 Your body touching the chair',
      '👕 Your clothes against your skin',
      '👣 Your feet touching the floor',
      '📱 Your phone in your hand',
      '🌬️ Air moving across your skin',
      '💗 Your breathing',
    ],
  },

  {
    number: 3,
    title: 'Things you can hear',
    instruction:
      'Pause for a moment and listen carefully. Choose 3 sounds you can hear.',
    emoji: '👂',
    color: '#8EAFE8',
    options: [
      '🚗 Traffic or vehicles',
      '🗣️ Someone talking',
      '🌬️ Air, wind or a fan',
      '🎵 Music or a device',
      '🐦 Birds or animals',
      '🏠 Sounds inside your surroundings',
      '🔊 A sound coming from far away',
    ],
  },

  {
    number: 2,
    title: 'Things you can smell',
    instruction:
      'Notice 2 scents around you. They can be strong, subtle, pleasant or neutral.',
    emoji: '👃',
    color: '#B5A5E8',
    options: [
      '☕ Food or a drink',
      '🌸 Flowers or plants',
      '🧴 Soap, perfume or lotion',
      '🌿 The air around you',
      '🏠 A familiar smell nearby',
      '🍃 Something fresh',
    ],
  },

  {
    number: 1,
    title: 'Thing you appreciate',
    instruction:
      'Choose one small thing you appreciate right now. It can be something very simple.',
    emoji: '💛',
    color: '#F3C96B',
    options: [
      '🌸 Something about yourself',
      '💛 Someone in your life',
      '🌿 Something around you',
      '✨ Something you are looking forward to',
    ],
  },
];

/* =========================================================
   JOURNALING
========================================================= */

type JournalMoodId =
  | 'great'
  | 'good'
  | 'okay'
  | 'low'
  | 'stressed';

type JournalFocusId =
  | 'clear'
  | 'gratitude'
  | 'feelings'
  | 'plan';

type JournalMood = {
  id: JournalMoodId;
  emoji: string;
  label: string;
  color: string;
  soft: string;
};

type JournalFocus = {
  id: JournalFocusId;
  emoji: string;
  title: string;
  color: string;
  soft: string;
  prompts: {
    question: string;
    placeholder: string;
    suggestions: string[];
  }[];
};

const journalMoods: JournalMood[] = [
  {
    id: 'great',
    emoji: '😄',
    label: 'Great',
    color: '#198F78',
    soft: '#DDF7EC',
  },
  {
    id: 'good',
    emoji: '🙂',
    label: 'Good',
    color: '#42C79F',
    soft: '#EAF9F4',
  },
  {
    id: 'okay',
    emoji: '😐',
    label: 'Okay',
    color: '#70A8D8',
    soft: '#E8F3FC',
  },
  {
    id: 'low',
    emoji: '😔',
    label: 'Low',
    color: '#9B8AD8',
    soft: '#F0ECFB',
  },
  {
    id: 'stressed',
    emoji: '😣',
    label: 'Stressed',
    color: '#D8896A',
    soft: '#FCEEE8',
  },
];

const journalFocuses: JournalFocus[] = [
  {
    id: 'clear',
    emoji: '🌿',
    title: 'Clear My Mind',
    color: '#198F78',
    soft: '#EAF9F4',
    prompts: [
      {
        question:
          "What's been taking up the most space in your mind lately?",
        placeholder:
          'Write whatever comes to mind...',
        suggestions: [
          "Something I've been thinking about is...",
          'Right now, I wish...',
          'What I really need today is...',
        ],
      },
      {
        question:
          'Is there anything you can let go of for today?',
        placeholder:
          'It can be a worry, expectation, or pressure...',
        suggestions: [
          'I can release...',
          "It's okay if I don't...",
          'For today, I choose to...',
        ],
      },
      {
        question:
          'What would help you feel a little lighter?',
        placeholder:
          'A small action, thought, or reminder...',
        suggestions: [
          'I might feel lighter if...',
          'A small step I can take is...',
          'I want to remind myself that...',
        ],
      },
    ],
  },
  {
    id: 'gratitude',
    emoji: '💛',
    title: 'Practice Gratitude',
    color: '#C9A227',
    soft: '#FFF8E8',
    prompts: [
      {
        question:
          "What is one small thing you're grateful for today?",
        placeholder:
          'Even something tiny counts...',
        suggestions: [
          "Today I'm grateful for...",
          'A simple joy was...',
          'I appreciate...',
        ],
      },
      {
        question:
          'Who is someone who made your day a little better?',
        placeholder:
          'A friend, family member, stranger, or yourself...',
        suggestions: [
          'Someone who helped me was...',
          'I felt supported by...',
          'I want to thank...',
        ],
      },
      {
        question:
          'What is something simple that brought you joy?',
        placeholder:
          'A moment, sound, smell, or memory...',
        suggestions: [
          'I smiled when...',
          'A small joy was...',
          'I enjoyed...',
        ],
      },
    ],
  },
  {
    id: 'feelings',
    emoji: '💭',
    title: 'Process My Feelings',
    color: '#6B8FD8',
    soft: '#EEF3FC',
    prompts: [
      {
        question: 'What happened?',
        placeholder:
          'Describe the moment in your own words...',
        suggestions: [
          'Earlier today...',
          'Something that affected me was...',
          'I noticed that...',
        ],
      },
      {
        question:
          'How did it make you feel?',
        placeholder:
          'Name the feelings without judging them...',
        suggestions: [
          'I felt...',
          'Underneath that, I also felt...',
          'My body felt...',
        ],
      },
      {
        question:
          'What do you need right now?',
        placeholder:
          'Support, rest, space, kindness...',
        suggestions: [
          'Right now I need...',
          'It would help if...',
          'I can offer myself...',
        ],
      },
    ],
  },
  {
    id: 'plan',
    emoji: '🎯',
    title: 'Plan Ahead',
    color: '#42A8C7',
    soft: '#E8F7FB',
    prompts: [
      {
        question:
          'What is one thing you want to accomplish?',
        placeholder:
          'Keep it realistic and kind...',
        suggestions: [
          'One thing I want to do is...',
          'A small goal for me is...',
          'I hope to finish...',
        ],
      },
      {
        question:
          'What might make today easier?',
        placeholder:
          'A tool, habit, boundary, or support...',
        suggestions: [
          'Today might feel easier if...',
          'I can prepare by...',
          'I will ask for help with...',
        ],
      },
      {
        question:
          'What is one thing you can look forward to?',
        placeholder:
          'Something upcoming, big or small...',
        suggestions: [
          "I'm looking forward to...",
          'A bright spot later is...',
          'I get to enjoy...',
        ],
      },
    ],
  },
];

const digitalDetoxChecklist = [
  'Take a few slow breaths',
  'Look around your surroundings',
  'Stretch your shoulders',
  'Drink some water',
  'Notice how you feel without checking your phone',
];

const DETOX_DURATION_SECONDS = 5 * 60;

const healthyRoutineItems = [
  {
    id: 'water',
    emoji: '💧',
    label: "I've had enough water",
  },
  {
    id: 'meal',
    emoji: '🍎',
    label: "I've had a nourishing meal",
  },
  {
    id: 'rest',
    emoji: '😴',
    label: "I've had enough rest",
  },
  {
    id: 'move',
    emoji: '🚶',
    label: "I've moved or stretched my body",
  },
  {
    id: 'screen',
    emoji: '🌤️',
    label:
      "I've spent some time away from my screen",
  },
  {
    id: 'kind',
    emoji: '💛',
    label:
      "I've done something kind for myself",
  },
  {
    id: 'connect',
    emoji: '👥',
    label: "I've connected with someone",
  },
  {
    id: 'relax',
    emoji: '🧘',
    label: "I've taken a moment to relax",
  },
];

/* =========================================================
   COMPONENT
========================================================= */

function ActivitiesScreen({
  activity,
  onBack,
  onSelectActivity,
}: ActivitiesScreenProps) {
  /* =======================================================
     BREATHING STATE
  ======================================================= */

  const [
    breathingStepIndex,
    setBreathingStepIndex,
  ] = useState(0);

  const [breathingDone, setBreathingDone] =
    useState(false);

  const [isPaused, setIsPaused] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(
      breathingSequence[0].duration,
    );

  const [breathingCycle, setBreathingCycle] =
    useState(1);

  /* =======================================================
     MINDFULNESS STATE
  ======================================================= */

  const [
    mindfulnessStepIndex,
    setMindfulnessStepIndex,
  ] = useState(0);

  const [
    mindfulnessDone,
    setMindfulnessDone,
  ] = useState(false);

  const [
    mindfulnessSelections,
    setMindfulnessSelections,
  ] = useState<string[][]>(
    mindfulnessSteps.map(() => []),
  );

  const [musicEnabled, setMusicEnabled] =
    useState(false);

  const [soundLoaded, setSoundLoaded] =
    useState(false);

  /* =======================================================
     JOURNALING STATE
  ======================================================= */

  const [selectedMood, setSelectedMood] =
    useState<JournalMoodId | null>(null);

  const [selectedFocus, setSelectedFocus] =
    useState<JournalFocusId | null>(null);

  const [journalAnswers, setJournalAnswers] =
    useState(['', '', '']);

  const [tinyWin, setTinyWin] = useState('');

  const [journalingDone, setJournalingDone] =
    useState(false);

  const timerRef =
    useRef<ReturnType<
      typeof setInterval
    > | null>(null);

  /* =======================================================
     MUSIC
  ======================================================= */

  const soundRef =
    useRef<Sound | null>(null);

  useEffect(() => {
    Sound.setCategory('Playback');

    const calmMusicUri =
      Image.resolveAssetSource(
        require('../assets/audio/calm.mp3'),
      ).uri;

    const sound = new Sound(
      calmMusicUri,
      undefined,
      error => {
        if (error) {
          console.log(
            'Failed to load calm music:',
            error,
          );
          return;
        }

        sound.setNumberOfLoops(-1);
        sound.setVolume(0.35);

        soundRef.current = sound;

        setSoundLoaded(true);
      },
    );

    return () => {
      setSoundLoaded(false);

      if (soundRef.current) {
        soundRef.current.stop();
        soundRef.current.release();
        soundRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const sound = soundRef.current;

    if (!soundLoaded || !sound) {
      return;
    }

    if (
      musicEnabled &&
      activity === 'mindfulness'
    ) {
      sound.play(success => {
        if (!success) {
          console.log(
            'Music playback failed',
          );
        }
      });
    } else {
      sound.stop();
    }
  }, [
    musicEnabled,
    activity,
    soundLoaded,
  ]);

  useEffect(() => {
    if (
      activity !== 'mindfulness' &&
      musicEnabled
    ) {
      setMusicEnabled(false);
    }
  }, [activity, musicEnabled]);

  /* =======================================================
     ACTIVE STEPS
  ======================================================= */

  const activeBreathingStep =
    breathingSequence[
      breathingStepIndex
    ];

  const activeMindfulnessStep =
    mindfulnessSteps[
      mindfulnessStepIndex
    ];

  /* =======================================================
     BREATHING TIMER
  ======================================================= */

  useEffect(() => {
    if (
      activity !== 'breathing' ||
      breathingDone ||
      isPaused
    ) {
      return;
    }

    timerRef.current =
      setInterval(() => {
        setTimeLeft(current => {
          if (current <= 1) {
            return 0;
          }

          return current - 1;
        });
      }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(
          timerRef.current,
        );
      }
    };
  }, [
    activity,
    breathingStepIndex,
    breathingDone,
    isPaused,
  ]);

  useEffect(() => {
    if (
      activity !== 'breathing' ||
      breathingDone ||
      isPaused ||
      timeLeft > 0
    ) {
      return;
    }

    if (
      breathingStepIndex >=
      breathingSequence.length - 1
    ) {
      if (breathingCycle >= 3) {
        setBreathingDone(true);
        return;
      }

      setBreathingCycle(
        current => current + 1,
      );

      setBreathingStepIndex(0);

      setTimeLeft(
        breathingSequence[0].duration,
      );

      return;
    }

    const nextIndex =
      breathingStepIndex + 1;

    setBreathingStepIndex(nextIndex);

    setTimeLeft(
      breathingSequence[nextIndex]
        .duration,
    );
  }, [
    activity,
    breathingStepIndex,
    breathingCycle,
    breathingDone,
    isPaused,
    timeLeft,
  ]);

  /* =======================================================
     JOURNAL UPDATE
  ======================================================= */

  const updateJournalAnswer = (
    index: number,
    value: string,
  ) => {
    setJournalAnswers(current =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? value
            : item,
      ),
    );
  };

  const insertJournalSuggestion = (
    index: number,
    suggestion: string,
  ) => {
    setJournalAnswers(current =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const trimmed = item.trim();

        if (!trimmed) {
          return suggestion;
        }

        if (
          trimmed.endsWith(suggestion) ||
          trimmed.includes(suggestion)
        ) {
          return item;
        }

        const needsSpace = !trimmed.endsWith(' ');
        return `${trimmed}${needsSpace ? ' ' : ''}${suggestion}`;
      }),
    );
  };

  const resetJournaling = () => {
    setSelectedMood(null);
    setSelectedFocus(null);
    setJournalAnswers(['', '', '']);
    setTinyWin('');
    setJournalingDone(false);
  };

  const handleFocusSelect = (
    focusId: JournalFocusId,
  ) => {
    setSelectedFocus(focusId);
    setJournalAnswers(['', '', '']);
  };

  const activeJournalFocus =
    journalFocuses.find(
      focus => focus.id === selectedFocus,
    ) ?? null;

  const activeJournalMood =
    journalMoods.find(
      mood => mood.id === selectedMood,
    ) ?? null;

  const hasJournalResponse =
    journalAnswers.some(
      answer => answer.trim().length > 0,
    ) || tinyWin.trim().length > 0;

  const canFinishJournaling =
    selectedMood !== null &&
    selectedFocus !== null &&
    hasJournalResponse;

  const journalProgressSteps = [
    selectedMood !== null,
    selectedFocus !== null,
    hasJournalResponse || journalingDone,
  ];

  const journalCompletedSteps =
    journalProgressSteps.filter(Boolean)
      .length;

  const journalProgress =
    journalCompletedSteps / 3;

  /* =======================================================
     RESET BREATHING
  ======================================================= */

  const resetBreathing = () => {
    setBreathingStepIndex(0);
    setBreathingDone(false);
    setIsPaused(false);

    setTimeLeft(
      breathingSequence[0].duration,
    );

    setBreathingCycle(1);
  };

  /* =======================================================
     MINDFULNESS
  ======================================================= */

  const toggleMindfulnessOption = (
    option: string,
  ) => {
    setMindfulnessSelections(
      current => {
        const currentSelections =
          current[
            mindfulnessStepIndex
          ];

        const isSelected =
          currentSelections.includes(
            option,
          );

        const required =
          activeMindfulnessStep.number;

        if (isSelected) {
          return current.map(
            (items, index) =>
              index ===
              mindfulnessStepIndex
                ? items.filter(
                    item =>
                      item !== option,
                  )
                : items,
          );
        }

        if (
          currentSelections.length >=
          required
        ) {
          return current;
        }

        return current.map(
          (items, index) =>
            index ===
            mindfulnessStepIndex
              ? [...items, option]
              : items,
        );
      },
    );
  };

  const currentSelections =
    mindfulnessSelections[
      mindfulnessStepIndex
    ] || [];

  const canContinueMindfulness =
    currentSelections.length ===
    activeMindfulnessStep.number;

  const nextMindfulnessStep = () => {
    if (!canContinueMindfulness) {
      return;
    }

    if (
      mindfulnessStepIndex >=
      mindfulnessSteps.length - 1
    ) {
      setMindfulnessDone(true);

      if (soundRef.current) {
        soundRef.current.stop();
      }

      setMusicEnabled(false);

      return;
    }

    setMindfulnessStepIndex(
      current => current + 1,
    );
  };

  const previousMindfulnessStep = () => {
    if (
      mindfulnessStepIndex === 0
    ) {
      return;
    }

    setMindfulnessStepIndex(
      current => current - 1,
    );
  };

  const resetMindfulness = () => {
    if (soundRef.current) {
      soundRef.current.stop();
    }

    setMindfulnessStepIndex(0);
    setMindfulnessDone(false);
    setMusicEnabled(false);

    setMindfulnessSelections(
      mindfulnessSteps.map(
        () => [],
      ),
    );
  };

  const toggleMusic = () => {
    setMusicEnabled(
      current => !current,
    );
  };

  /* =======================================================
     ALL ACTIVITIES
  ======================================================= */

  const renderAllActivities = () => {
    return (
      <>
        <View
          style={
            styles.activitiesPageHeader
          }
        >
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>
              ✦
            </Text>
          </View>

          <Text
            style={styles.activityTag}
          >
            WELLBEING ACTIVITIES
          </Text>

          <Text
            style={
              styles.activitiesPageTitle
            }
          >
            Take a moment for yourself
          </Text>

          <Text
            style={
              styles.activitiesPageDescription
            }
          >
            Choose an activity that feels
            right for you right now. There
            is no pressure to finish
            everything.
          </Text>
        </View>

        <View
          style={styles.activitiesList}
        >
          {activities.map(item => (
            <Pressable
              key={item.type}
              testID={`${item.type}-activity-option`}
              style={({ pressed }) => [
                styles.activityOptionCard,
                pressed &&
                  styles.cardPressed,
              ]}
              onPress={() =>
                onSelectActivity(
                  item.type,
                )
              }
            >
              <View
                style={[
                  styles.activityOptionIcon,
                  {
                    backgroundColor:
                      item.color,
                  },
                ]}
              >
                <Text
                  style={
                    styles.activityOptionIconText
                  }
                >
                  {item.icon}
                </Text>
              </View>

              <View
                style={
                  styles.activityOptionContent
                }
              >
                <View
                  style={
                    styles.activityTitleRow
                  }
                >
                  <Text
                    style={
                      styles.activityOptionTitle
                    }
                  >
                    {item.title}
                  </Text>

                  <View
                    style={
                      styles.durationBadge
                    }
                  >
                    <Text
                      style={
                        styles.durationText
                      }
                    >
                      {item.duration}
                    </Text>
                  </View>
                </View>

                <Text
                  style={
                    styles.activityOptionDescription
                  }
                >
                  {item.description}
                </Text>

                <View
                  style={
                    styles.startActivityRow
                  }
                >
                  <Text
                    style={
                      styles.startActivityText
                    }
                  >
                    Start activity
                  </Text>

                  <Text
                    style={
                      styles.activityOptionArrowText
                    }
                  >
                    →
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      </>
    );
  };

  /* =======================================================
     BREATHING UI
  ======================================================= */

  const renderBreathing = () => {
    if (breathingDone) {
      return (
        <>
          <View
            style={
              styles.successIconWrap
            }
          >
            <Text
              style={styles.successIcon}
            >
              ✓
            </Text>
          </View>

          <Text
            style={styles.activityTag}
          >
            BREATHING COMPLETE
          </Text>

          <Text
            style={styles.activityTitle}
          >
            You made space to breathe.
          </Text>

          <Text
            style={styles.activityDetail}
          >
            You completed 3 breathing
            cycles. Take a moment to
            notice how your body and mind
            feel now.
          </Text>

          <View
            style={styles.completedCard}
          >
            <Text
              style={styles.completedEmoji}
            >
              🌿
            </Text>

            <View style={{ flex: 1 }}>
              <Text
                style={
                  styles.completedTitle
                }
              >
                3 cycles completed
              </Text>

              <Text
                style={
                  styles.completedText
                }
              >
                Nice work taking a few
                minutes for yourself.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={onBack}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Back to Activities
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.secondaryButton
            }
            onPress={resetBreathing}
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Try Again
            </Text>
          </Pressable>
        </>
      );
    }

    const progress =
      (activeBreathingStep.duration -
        timeLeft) /
      activeBreathingStep.duration;

    return (
      <>
        <View
          style={styles.breathingHeader}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={styles.activityTagLeft}
            >
              BREATHING RESET
            </Text>

            <Text
              style={styles.cycleText}
            >
              Cycle {breathingCycle} of 3
            </Text>
          </View>

          <View
            style={styles.timerBadge}
          >
            <View
              style={[
                styles.statusDot,
                isPaused &&
                  styles.statusDotPaused,
              ]}
            />

            <Text
              style={
                styles.timerBadgeText
              }
            >
              {isPaused
                ? 'PAUSED'
                : 'ACTIVE'}
            </Text>
          </View>
        </View>

        <Text
          style={
            styles.breathingInstruction
          }
        >
          Follow the circle and breathe
          with it
        </Text>

        <View
          style={styles.breathingVisual}
        >
          <View
            style={[
              styles.breathingGlow,
              {
                backgroundColor:
                  activeBreathingStep.color,
                transform: [
                  {
                    scale:
                      activeBreathingStep.scale,
                  },
                ],
              },
            ]}
          />

          <View
            style={[
              styles.breathingCircle,
              {
                backgroundColor:
                  activeBreathingStep.color,
                transform: [
                  {
                    scale:
                      activeBreathingStep.scale,
                  },
                ],
              },
            ]}
          >
            <Text
              style={
                styles.breathingLabel
              }
            >
              {activeBreathingStep.label}
            </Text>

            <Text
              style={styles.countdown}
            >
              {isPaused
                ? 'Ⅱ'
                : timeLeft}
            </Text>
          </View>
        </View>

        <View
          style={
            styles.breathingMessageCard
          }
        >
          <Text
            style={
              styles.breathingMessage
            }
          >
            {activeBreathingStep.message}
          </Text>
        </View>

        <Text
          style={styles.activityTitle}
        >
          {activeBreathingStep.title}
        </Text>

        <Text
          style={styles.activityDetail}
        >
          {activeBreathingStep.detail}
        </Text>

        <View
          style={
            styles.phaseProgressBackground
          }
        >
          <View
            style={[
              styles.phaseProgressFill,
              {
                width: `${Math.max(
                  progress * 100,
                  4,
                )}%`,
                backgroundColor:
                  activeBreathingStep.color,
              },
            ]}
          />
        </View>

        <View
          style={styles.phaseLabels}
        >
          {breathingSequence.map(
            (step, index) => (
              <View
                key={step.label}
                style={styles.phaseItem}
              >
                <View
                  style={[
                    styles.phaseDot,
                    index ===
                      breathingStepIndex &&
                      styles.phaseDotActive,
                    index <
                      breathingStepIndex &&
                      styles.phaseDotCompleted,
                  ]}
                />

                <Text
                  style={[
                    styles.phaseLabel,
                    index ===
                      breathingStepIndex &&
                      styles.phaseLabelActive,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            ),
          )}
        </View>

        <Pressable
          style={styles.pauseButton}
          onPress={() =>
            setIsPaused(
              current => !current,
            )
          }
        >
          <Text
            style={
              styles.pauseButtonText
            }
          >
            {isPaused
              ? '▶  Resume Breathing'
              : 'Ⅱ  Pause'}
          </Text>
        </Pressable>

        <Pressable
          style={
            styles.secondaryButton
          }
          onPress={onBack}
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Stop Activity
          </Text>
        </Pressable>
      </>
    );
  };

  /* =======================================================
     MINDFULNESS UI
  ======================================================= */

  const renderMindfulness = () => {
    if (mindfulnessDone) {
      return (
        <>
          <View
            style={
              styles.successIconWrap
            }
          >
            <Text
              style={styles.successIcon}
            >
              ✓
            </Text>
          </View>

          <Text
            style={styles.activityTag}
          >
            GROUNDING COMPLETE
          </Text>

          <Text
            style={styles.activityTitle}
          >
            You’re back in the moment. 🌿
          </Text>

          <Text
            style={styles.activityDetail}
          >
            You noticed the world around
            you and gave yourself a few
            quiet moments to reconnect.
          </Text>

          <View
            style={styles.completedCard}
          >
            <Text
              style={styles.completedEmoji}
            >
              ✨
            </Text>

            <View style={{ flex: 1 }}>
              <Text
                style={
                  styles.completedTitle
                }
              >
                5-4-3-2-1 completed
              </Text>

              <Text
                style={
                  styles.completedText
                }
              >
                You took a mindful pause
                for yourself.
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={onBack}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Done
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.secondaryButton
            }
            onPress={resetMindfulness}
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Try Again
            </Text>
          </Pressable>
        </>
      );
    }

    const selectedCount =
      currentSelections.length;

    const requiredCount =
      activeMindfulnessStep.number;

    const selectionComplete =
      selectedCount === requiredCount;

    return (
      <>
        <View
          style={
            styles.mindfulnessHeader
          }
        >
          <View style={{ flex: 1 }}>
            <Text
              style={
                styles.activityTagLeft
              }
            >
              MINDFULNESS BREAK
            </Text>

            <Text
              style={
                styles.mindfulnessSubtitle
              }
            >
              5-4-3-2-1 Grounding
            </Text>
          </View>

          <Pressable
            style={[
              styles.musicButton,
              musicEnabled &&
                styles.musicButtonActive,
            ]}
            onPress={toggleMusic}
          >
            <Text
              style={styles.musicIcon}
            >
              {musicEnabled
                ? '🎵'
                : '🔇'}
            </Text>

            <Text
              style={[
                styles.musicButtonText,
                musicEnabled &&
                  styles.musicButtonTextActive,
              ]}
            >
              {musicEnabled
                ? 'ON'
                : 'OFF'}
            </Text>
          </Pressable>
        </View>

        <View
          style={
            styles.mindfulnessProgress
          }
        >
          {mindfulnessSteps.map(
            (step, index) => (
              <View
                key={step.number}
                style={
                  styles.mindfulnessProgressItem
                }
              >
                <View
                  style={[
                    styles.mindfulnessProgressDot,
                    index <
                      mindfulnessStepIndex &&
                      styles.mindfulnessProgressCompleted,
                    index ===
                      mindfulnessStepIndex &&
                      styles.mindfulnessProgressCurrent,
                  ]}
                >
                  <Text
                    style={[
                      styles.mindfulnessProgressNumber,
                      index <=
                        mindfulnessStepIndex &&
                        styles.mindfulnessProgressNumberActive,
                    ]}
                  >
                    {step.number}
                  </Text>
                </View>

                {index <
                  mindfulnessSteps.length -
                    1 && (
                  <View
                    style={[
                      styles.mindfulnessProgressLine,
                      index <
                        mindfulnessStepIndex &&
                        styles.mindfulnessProgressLineActive,
                    ]}
                  />
                )}
              </View>
            ),
          )}
        </View>

        <View
          style={[
            styles.mindfulnessIconCircle,
            {
              backgroundColor:
                activeMindfulnessStep.color,
            },
          ]}
        >
          <Text
            style={
              styles.mindfulnessEmoji
            }
          >
            {activeMindfulnessStep.emoji}
          </Text>
        </View>

        <Text
          style={styles.stepCounter}
        >
          STEP {mindfulnessStepIndex + 1}{' '}
          OF 5
        </Text>

        <Text
          style={styles.activityTitle}
        >
          {activeMindfulnessStep.number}{' '}
          {activeMindfulnessStep.title}
        </Text>

        <Text
          style={styles.activityDetail}
        >
          {activeMindfulnessStep.instruction}
        </Text>

        <View
          style={
            styles.selectionCounter
          }
        >
          <View>
            <Text
              style={
                styles.selectionCounterText
              }
            >
              {selectedCount} of{' '}
              {requiredCount} selected
            </Text>

            <Text
              style={
                styles.selectionSmallText
              }
            >
              Select what feels true right
              now
            </Text>
          </View>

          <View
            style={[
              styles.selectionStatus,
              selectionComplete &&
                styles.selectionStatusComplete,
            ]}
          >
            <Text
              style={[
                styles.selectionHint,
                selectionComplete &&
                  styles.selectionHintComplete,
              ]}
            >
              {selectionComplete
                ? '✓ Ready'
                : `${
                    requiredCount -
                    selectedCount
                  } left`}
            </Text>
          </View>
        </View>

        <View
          style={styles.optionsContainer}
        >
          {activeMindfulnessStep.options.map(
            option => {
              const isSelected =
                currentSelections.includes(
                  option,
                );

              return (
                <Pressable
                  key={option}
                  onPress={() =>
                    toggleMindfulnessOption(
                      option,
                    )
                  }
                  style={({ pressed }) => [
                    styles.mindfulnessOption,
                    isSelected &&
                      styles.mindfulnessOptionSelected,
                    pressed &&
                      styles.optionPressed,
                  ]}
                >
                  <View
                    style={[
                      styles.optionCheck,
                      isSelected &&
                        styles.optionCheckSelected,
                    ]}
                  >
                    {isSelected && (
                      <Text
                        style={
                          styles.optionCheckText
                        }
                      >
                        ✓
                      </Text>
                    )}
                  </View>

                  <Text
                    style={[
                      styles.mindfulnessOptionText,
                      isSelected &&
                        styles.mindfulnessOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>

        {musicEnabled &&
          soundLoaded && (
            <View
              style={
                styles.musicInfoCard
              }
            >
              <Text
                style={
                  styles.musicInfoIcon
                }
              >
                🎵
              </Text>

              <View
                style={{ flex: 1 }}
              >
                <Text
                  style={
                    styles.musicInfoTitle
                  }
                >
                  Calm music is playing
                </Text>

                <Text
                  style={
                    styles.musicInfoText
                  }
                >
                  Let the gentle background
                  sound help you stay
                  present.
                </Text>
              </View>
            </View>
          )}

        <View
          style={styles.navigationRow}
        >
          <Pressable
            style={[
              styles.previousButton,
              mindfulnessStepIndex ===
                0 &&
                styles.previousButtonDisabled,
            ]}
            onPress={
              previousMindfulnessStep
            }
            disabled={
              mindfulnessStepIndex ===
              0
            }
          >
            <Text
              style={[
                styles.previousButtonText,
                mindfulnessStepIndex ===
                  0 &&
                  styles.previousButtonTextDisabled,
              ]}
            >
              ← Back
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.nextMindfulnessButton,
              !selectionComplete &&
                styles.nextMindfulnessButtonDisabled,
            ]}
            onPress={
              nextMindfulnessStep
            }
            disabled={
              !selectionComplete
            }
          >
            <Text
              style={[
                styles.nextMindfulnessButtonText,
                !selectionComplete &&
                  styles.nextMindfulnessButtonTextDisabled,
              ]}
            >
              {mindfulnessStepIndex ===
              mindfulnessSteps.length - 1
                ? 'Complete ✓'
                : 'Next →'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          style={
            styles.exitMindfulnessButton
          }
          onPress={() => {
            if (soundRef.current) {
              soundRef.current.stop();
            }

            setMusicEnabled(false);
            onBack();
          }}
        >
          <Text
            style={
              styles.exitMindfulnessText
            }
          >
            Exit Activity
          </Text>
        </Pressable>
      </>
    );
  };

  /* =======================================================
     JOURNALING UI
  ======================================================= */

  const renderJournaling = () => {
    if (journalingDone) {
      return (
        <>
          <View
            style={
              styles.successIconWrap
            }
          >
            <Text
              style={styles.successIcon}
            >
              ✓
            </Text>
          </View>

          <Text
            style={styles.activityTag}
          >
            REFLECTION COMPLETE
          </Text>

          <Text
            style={styles.activityTitle}
          >
            You made space for yourself. 🌿
          </Text>

          <Text
            style={styles.activityDetail}
          >
            You don't need to solve
            everything today. Sometimes
            putting your thoughts into
            words is enough.
          </Text>

          <View
            style={
              styles.journalSummaryCard
            }
          >
            <Text
              style={
                styles.journalSummaryHeading
              }
            >
              Your check-in
            </Text>

            <View
              style={
                styles.journalSummaryRow
              }
            >
              <Text
                style={
                  styles.journalSummaryLabel
                }
              >
                Mood
              </Text>
              <Text
                style={
                  styles.journalSummaryValue
                }
              >
                {activeJournalMood
                  ? `${activeJournalMood.emoji} ${activeJournalMood.label}`
                  : '—'}
              </Text>
            </View>

            <View
              style={
                styles.journalSummaryDivider
              }
            />

            <View
              style={
                styles.journalSummaryRow
              }
            >
              <Text
                style={
                  styles.journalSummaryLabel
                }
              >
                Focus
              </Text>
              <Text
                style={
                  styles.journalSummaryValue
                }
              >
                {activeJournalFocus
                  ? `${activeJournalFocus.emoji} ${activeJournalFocus.title}`
                  : '—'}
              </Text>
            </View>

            <View
              style={
                styles.journalSummaryDivider
              }
            />

            <View
              style={
                styles.journalSummaryRow
              }
            >
              <Text
                style={
                  styles.journalSummaryLabel
                }
              >
                Reflection
              </Text>
              <Text
                style={
                  styles.journalSummaryValue
                }
              >
                Complete
              </Text>
            </View>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={onBack}
          >
            <Text
              style={
                styles.primaryButtonText
              }
            >
              Done
            </Text>
          </Pressable>

          <Pressable
            style={
              styles.secondaryButton
            }
            onPress={resetJournaling}
          >
            <Text
              style={
                styles.secondaryButtonText
              }
            >
              Write Again
            </Text>
          </Pressable>
        </>
      );
    }

    return (
      <>
        <View
          style={styles.journalHeader}
        >
          <View
            style={styles.journalIcon}
          >
            <Text
              style={
                styles.journalIconText
              }
            >
              ✎
            </Text>
          </View>

          <Text
            style={styles.activityTag}
          >
            REFLECTION
          </Text>

          <Text
            style={
              styles.journalProgressLabel
            }
          >
            Step {Math.max(journalCompletedSteps, 1)} of 3
          </Text>

          <View
            style={
              styles.journalProgressTrack
            }
          >
            <View
              style={[
                styles.journalProgressFill,
                {
                  width: `${Math.max(
                    journalProgress * 100,
                    8,
                  )}%`,
                },
              ]}
            />
          </View>

          <Text
            style={styles.activityTitle}
          >
            A moment for yourself
          </Text>

          <Text
            style={styles.activityDetail}
          >
            Take a few minutes to check in,
            choose a focus, and put your
            thoughts into words. There's no
            right or wrong answer.
          </Text>
        </View>

        {/* Mood check-in */}
        <View
          style={styles.journalSection}
        >
          <Text
            style={
              styles.journalSectionTitle
            }
          >
            How are you feeling right now?
          </Text>

          <View
            style={styles.moodGrid}
          >
            {journalMoods.map(mood => {
              const isSelected =
                selectedMood === mood.id;

              return (
                <Pressable
                  key={mood.id}
                  onPress={() =>
                    setSelectedMood(
                      mood.id,
                    )
                  }
                  style={[
                    styles.moodChip,
                    {
                      backgroundColor:
                        mood.soft,
                    },
                    isSelected && [
                      styles.moodChipSelected,
                      {
                        borderColor:
                          mood.color,
                      },
                    ],
                  ]}
                >
                  <Text
                    style={
                      styles.moodEmoji
                    }
                  >
                    {mood.emoji}
                  </Text>
                  <Text
                    style={[
                      styles.moodLabel,
                      isSelected && {
                        color:
                          mood.color,
                      },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {selectedMood && (
            <View
              style={
                styles.moodSupportCard
              }
            >
              <Text
                style={
                  styles.moodSupportText
                }
              >
                Thanks for checking in with
                yourself. 🌿
              </Text>
            </View>
          )}
        </View>

        {/* Reflection focus */}
        <View
          style={styles.journalSection}
        >
          <Text
            style={
              styles.journalSectionTitle
            }
          >
            What would you like to focus
            on?
          </Text>

          <View
            style={styles.focusGrid}
          >
            {journalFocuses.map(focus => {
              const isSelected =
                selectedFocus ===
                focus.id;

              return (
                <Pressable
                  key={focus.id}
                  onPress={() =>
                    handleFocusSelect(
                      focus.id,
                    )
                  }
                  style={[
                    styles.focusCard,
                    {
                      backgroundColor:
                        focus.soft,
                    },
                    isSelected && [
                      styles.focusCardSelected,
                      {
                        borderColor:
                          focus.color,
                      },
                    ],
                  ]}
                >
                  <Text
                    style={
                      styles.focusEmoji
                    }
                  >
                    {focus.emoji}
                  </Text>
                  <Text
                    style={[
                      styles.focusTitle,
                      isSelected && {
                        color:
                          focus.color,
                      },
                    ]}
                  >
                    {focus.title}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Guided prompts */}
        {activeJournalFocus && (
          <View
            style={styles.journalSection}
          >
            <Text
              style={
                styles.journalSectionTitle
              }
            >
              Guided prompts
            </Text>

            <Text
              style={
                styles.journalSectionHint
              }
            >
              Answer any that feel helpful.
              One thoughtful response is
              enough.
            </Text>

            {activeJournalFocus.prompts.map(
              (prompt, index) => (
                <View
                  key={prompt.question}
                  style={
                    styles.promptCard
                  }
                >
                  <View
                    style={
                      styles.promptNumber
                    }
                  >
                    <Text
                      style={
                        styles.promptNumberText
                      }
                    >
                      {String(
                        index + 1,
                      ).padStart(2, '0')}
                    </Text>
                  </View>

                  <View
                    style={{ flex: 1 }}
                  >
                    <Text
                      style={
                        styles.promptQuestion
                      }
                    >
                      {prompt.question}
                    </Text>

                    <TextInput
                      multiline
                      value={
                        journalAnswers[
                          index
                        ]
                      }
                      onChangeText={value =>
                        updateJournalAnswer(
                          index,
                          value,
                        )
                      }
                      placeholder={
                        prompt.placeholder
                      }
                      placeholderTextColor="#9AA8A8"
                      style={
                        styles.textInput
                      }
                      textAlignVertical="top"
                    />

                    <Text
                      style={
                        styles.inspirationLabel
                      }
                    >
                      Need inspiration?
                    </Text>

                    <View
                      style={
                        styles.suggestionRow
                      }
                    >
                      {prompt.suggestions.map(
                        suggestion => (
                          <Pressable
                            key={
                              suggestion
                            }
                            onPress={() =>
                              insertJournalSuggestion(
                                index,
                                suggestion,
                              )
                            }
                            style={
                              styles.suggestionChip
                            }
                          >
                            <Text
                              style={
                                styles.suggestionChipText
                              }
                            >
                              {suggestion}
                            </Text>
                          </Pressable>
                        ),
                      )}
                    </View>
                  </View>
                </View>
              ),
            )}
          </View>
        )}

        {/* Tiny win */}
        {selectedFocus && (
          <View
            style={styles.tinyWinCard}
          >
            <Text
              style={
                styles.tinyWinTitle
              }
            >
              🏆 What's one tiny win from
              today?
            </Text>

            <Text
              style={
                styles.tinyWinSupport
              }
            >
              It doesn't have to be a big
              achievement.
            </Text>

            <TextInput
              multiline
              value={tinyWin}
              onChangeText={setTinyWin}
              placeholder="Even something small counts..."
              placeholderTextColor="#9AA8A8"
              style={styles.textInput}
              textAlignVertical="top"
            />
          </View>
        )}

        {/* Privacy reminder */}
        <View
          style={styles.privacyCard}
        >
          <Text
            style={styles.privacyTitle}
          >
            🔒 Your reflection is private
          </Text>

          <Text
            style={styles.privacyText}
          >
            Take your time and write only
            what you're comfortable sharing.
          </Text>
        </View>

        <Pressable
          style={[
            styles.primaryButton,
            !canFinishJournaling &&
              styles.primaryButtonDisabled,
          ]}
          disabled={!canFinishJournaling}
          onPress={() =>
            setJournalingDone(true)
          }
        >
          <Text
            style={[
              styles.primaryButtonText,
              !canFinishJournaling &&
                styles.primaryButtonTextDisabled,
            ]}
          >
            ✨ Finish Reflection
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondaryButton}
          onPress={onBack}
        >
          <Text
            style={
              styles.secondaryButtonText
            }
          >
            Exit
          </Text>
        </Pressable>
      </>
    );
  };

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          onPress={() => {
            if (soundRef.current) {
              soundRef.current.stop();
            }

            setMusicEnabled(false);
            onBack();
          }}
          style={styles.backButton}
        >
          <View
            style={
              styles.backButtonCircle
            }
          >
            <Text
              style={
                styles.backButtonArrow
              }
            >
              ←
            </Text>
          </View>

          <Text
            style={styles.backButtonText}
          >
            Back
          </Text>
        </Pressable>

        <View style={styles.activityCard}>
          {!activity &&
            renderAllActivities()}

          {activity === 'breathing' &&
            renderBreathing()}

          {activity ===
            'mindfulness' &&
            renderMindfulness()}

          {activity ===
            'journaling' &&
            renderJournaling()}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#EAF8F4',
  },

  content: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },

  /* =======================================================
     BACK
  ======================================================= */

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 14,
    paddingVertical: 4,
    paddingRight: 8,
  },

  backButtonCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#D7EBE5',
  },

  backButtonArrow: {
    color: '#173B42',
    fontSize: 18,
    fontWeight: '800',
  },

  backButtonText: {
    color: '#31545B',
    fontSize: 14,
    fontWeight: '800',
  },

  /* =======================================================
     MAIN CARD
  ======================================================= */

  activityCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderWidth: 1,
    borderColor: '#D4ECE4',

    shadowColor: '#377F72',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.09,
    shadowRadius: 20,
    elevation: 5,
  },

  /* =======================================================
     GENERAL
  ======================================================= */

  activityTag: {
    color: '#198F78',
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 7,
    textAlign: 'center',
  },

  activityTagLeft: {
    color: '#198F78',
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 5,
  },

  activityTitle: {
    color: '#173B42',
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 9,
  },

  activityDetail: {
    color: '#65777D',
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 18,
  },

  /* =======================================================
     ALL ACTIVITIES
  ======================================================= */

  activitiesPageHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 22,
  },

  heroIcon: {
    width: 62,
    height: 62,
    borderRadius: 21,
    backgroundColor: '#DDF6EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#C7ECDD',
  },

  heroIconText: {
    color: '#28A883',
    fontSize: 30,
    fontWeight: '700',
  },

  activitiesPageTitle: {
    color: '#173B42',
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

  activitiesPageDescription: {
    maxWidth: 330,
    color: '#66787D',
    fontSize: 13.5,
    lineHeight: 21,
    textAlign: 'center',
  },

  activitiesList: {
    width: '100%',
  },

  activityOptionCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FCFB',
    borderRadius: 19,
    padding: 13,
    marginBottom: 11,
    borderWidth: 1,
    borderColor: '#DCECE7',
  },

  activityOptionIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  activityOptionIconText: {
    fontSize: 24,
  },

  activityOptionContent: {
    flex: 1,
  },

  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  activityOptionTitle: {
    flex: 1,
    color: '#173B42',
    fontSize: 15,
    fontWeight: '900',
    marginRight: 8,
  },

  durationBadge: {
    backgroundColor: '#E7F7F1',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },

  durationText: {
    color: '#198F78',
    fontSize: 8.5,
    fontWeight: '900',
  },

  activityOptionDescription: {
    color: '#687A7F',
    fontSize: 11.5,
    lineHeight: 17,
    marginBottom: 7,
  },

  startActivityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  startActivityText: {
    color: '#198F78',
    fontSize: 10.5,
    fontWeight: '900',
    marginRight: 4,
  },

  activityOptionArrowText: {
    color: '#198F78',
    fontSize: 15,
    fontWeight: '900',
  },

  cardPressed: {
    opacity: 0.82,
    transform: [
      {
        scale: 0.985,
      },
    ],
  },

  /* =======================================================
     BREATHING
  ======================================================= */

  breathingHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },

  cycleText: {
    color: '#7B8A90',
    fontSize: 11,
    fontWeight: '700',
  },

  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F8F2',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 2,
  },

  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#35B78E',
    marginRight: 5,
  },

  statusDotPaused: {
    backgroundColor: '#D49B55',
  },

  timerBadgeText: {
    color: '#198F78',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.6,
  },

  breathingInstruction: {
    color: '#718087',
    fontSize: 12.5,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },

  breathingVisual: {
    width: 235,
    height: 235,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginVertical: 4,
  },

  breathingGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.15,
  },

  breathingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 6,
    borderColor: '#FFFFFF',

    shadowColor: '#48B99A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    elevation: 7,
  },

  breathingLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 1.3,
  },

  countdown: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 47,
    fontWeight: '900',
    marginTop: 1,
  },

  breathingMessageCard: {
    backgroundColor: '#F0FAF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
  },

  breathingMessage: {
    color: '#198F78',
    fontSize: 12.5,
    fontWeight: '800',
  },

  phaseProgressBackground: {
    width: '100%',
    height: 7,
    borderRadius: 6,
    backgroundColor: '#E5EFEC',
    overflow: 'hidden',
    marginBottom: 13,
  },

  phaseProgressFill: {
    height: '100%',
    borderRadius: 6,
  },

  phaseLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  phaseItem: {
    alignItems: 'center',
  },

  phaseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D7E5E1',
    marginBottom: 5,
  },

  phaseDotActive: {
    width: 11,
    height: 11,
    borderRadius: 5.5,
    backgroundColor: '#28B58F',
  },

  phaseDotCompleted: {
    backgroundColor: '#8BD9C2',
  },

  phaseLabel: {
    color: '#8A999F',
    fontSize: 7.5,
    fontWeight: '800',
  },

  phaseLabelActive: {
    color: '#198F78',
  },

  pauseButton: {
    width: '100%',
    backgroundColor: '#E1F8F0',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginBottom: 9,
    borderWidth: 1,
    borderColor: '#C6EBDD',
  },

  pauseButtonText: {
    color: '#167E6A',
    fontSize: 13,
    fontWeight: '900',
  },

  /* =======================================================
     MINDFULNESS
  ======================================================= */

  mindfulnessHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  mindfulnessSubtitle: {
    color: '#173B42',
    fontSize: 15,
    fontWeight: '800',
  },

  musicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F6F5',
    borderRadius: 20,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#DCE5E3',
  },

  musicButtonActive: {
    backgroundColor: '#E2F9EF',
    borderColor: '#A9E5CF',
  },

  musicIcon: {
    fontSize: 15,
    marginRight: 5,
  },

  musicButtonText: {
    color: '#718087',
    fontSize: 9,
    fontWeight: '900',
  },

  musicButtonTextActive: {
    color: '#198F78',
  },

  mindfulnessProgress: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 21,
  },

  mindfulnessProgressItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  mindfulnessProgressDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EDF2F1',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D9E5E1',
  },

  mindfulnessProgressCurrent: {
    backgroundColor: '#42C79F',
    borderColor: '#42C79F',
  },

  mindfulnessProgressCompleted: {
    backgroundColor: '#BCEBD9',
    borderColor: '#9DDEC9',
  },

  mindfulnessProgressNumber: {
    color: '#8B999F',
    fontSize: 10,
    fontWeight: '900',
  },

  mindfulnessProgressNumberActive: {
    color: '#FFFFFF',
  },

  mindfulnessProgressLine: {
    flex: 1,
    height: 3,
    backgroundColor: '#E1EAE7',
    marginHorizontal: 3,
  },

  mindfulnessProgressLineActive: {
    backgroundColor: '#A7DEC9',
  },

  mindfulnessIconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 9,
    alignSelf: 'center',
  },

  mindfulnessEmoji: {
    fontSize: 34,
  },

  stepCounter: {
    color: '#198F78',
    fontSize: 9.5,
    fontWeight: '900',
    letterSpacing: 1.1,
    marginBottom: 7,
    textAlign: 'center',
  },

  selectionCounter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FBF7',
    borderRadius: 13,
    paddingHorizontal: 13,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D8F0E7',
  },

  selectionCounterText: {
    color: '#31545B',
    fontSize: 12,
    fontWeight: '800',
  },

  selectionSmallText: {
    color: '#8A9A9A',
    fontSize: 9.5,
    marginTop: 2,
  },

  selectionStatus: {
    backgroundColor: '#FFF4F0',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },

  selectionStatusComplete: {
    backgroundColor: '#DDF7EC',
  },

  selectionHint: {
    color: '#A17777',
    fontSize: 9.5,
    fontWeight: '800',
  },

  selectionHintComplete: {
    color: '#198F78',
  },

  optionsContainer: {
    width: '100%',
    marginBottom: 11,
  },

  mindfulnessOption: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFCFB',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E0EBE7',
    marginBottom: 7,
  },

  mindfulnessOptionSelected: {
    backgroundColor: '#E5F9F0',
    borderColor: '#42C79F',
  },

  optionPressed: {
    opacity: 0.8,
  },

  optionCheck: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#CBD9D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    backgroundColor: '#FFFFFF',
  },

  optionCheckSelected: {
    backgroundColor: '#42C79F',
    borderColor: '#42C79F',
  },

  optionCheckText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  mindfulnessOptionText: {
    flex: 1,
    color: '#40575E',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '700',
  },

  mindfulnessOptionTextSelected: {
    color: '#176E5D',
    fontWeight: '900',
  },

  /* =======================================================
     MUSIC
  ======================================================= */

  musicInfoCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F5E3B6',
  },

  musicInfoIcon: {
    fontSize: 23,
    marginRight: 10,
  },

  musicInfoTitle: {
    color: '#775C20',
    fontSize: 11.5,
    fontWeight: '900',
    marginBottom: 2,
  },

  musicInfoText: {
    color: '#8A7545',
    fontSize: 10.5,
    lineHeight: 15,
  },

  /* =======================================================
     NAVIGATION
  ======================================================= */

  navigationRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 9,
    marginTop: 3,
    marginBottom: 9,
  },

  previousButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1E1DC',
  },

  previousButtonDisabled: {
    backgroundColor: '#F4F6F5',
    borderColor: '#E4E9E7',
  },

  previousButtonText: {
    color: '#31545B',
    fontSize: 12.5,
    fontWeight: '900',
  },

  previousButtonTextDisabled: {
    color: '#B4BDBA',
  },

  nextMindfulnessButton: {
    flex: 1.4,
    backgroundColor: '#42C79F',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    shadowColor: '#35B18D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 7,
    elevation: 2,
  },

  nextMindfulnessButtonDisabled: {
    backgroundColor: '#DDE9E5',
    shadowOpacity: 0,
    elevation: 0,
  },

  nextMindfulnessButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

  nextMindfulnessButtonTextDisabled: {
    color: '#9AA9A4',
  },

  exitMindfulnessButton: {
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
  },

  exitMindfulnessText: {
    color: '#829096',
    fontSize: 11.5,
    fontWeight: '700',
  },

  /* =======================================================
     JOURNALING
  ======================================================= */

  journalHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 8,
  },

  journalIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: '#F5E5D0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 13,
  },

  journalIconText: {
    color: '#9C7147',
    fontSize: 27,
    fontWeight: '700',
  },

  journalProgressLabel: {
    color: '#60727A',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginBottom: 8,
  },

  journalProgressTrack: {
    width: '100%',
    height: 7,
    borderRadius: 999,
    backgroundColor: '#DCEDE7',
    overflow: 'hidden',
    marginBottom: 14,
  },

  journalProgressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#42C79F',
  },

  journalSection: {
    width: '100%',
    marginBottom: 14,
  },

  journalSectionTitle: {
    color: '#173B42',
    fontSize: 14.5,
    fontWeight: '900',
    marginBottom: 10,
    lineHeight: 20,
  },

  journalSectionHint: {
    color: '#60727A',
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 12,
    marginTop: -4,
  },

  moodGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  moodChip: {
    width: '30.5%',
    minWidth: 92,
    flexGrow: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },

  moodChipSelected: {
    borderWidth: 2,
    shadowColor: '#173B42',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },

  moodEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },

  moodLabel: {
    color: '#31545B',
    fontSize: 11.5,
    fontWeight: '800',
  },

  moodSupportCard: {
    marginTop: 10,
    backgroundColor: '#EAF9F4',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: '#C8EFE2',
  },

  moodSupportText: {
    color: '#198F78',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 17,
    textAlign: 'center',
  },

  focusGrid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
  },

  focusCard: {
    width: '47.5%',
    flexGrow: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: 'transparent',
    minHeight: 88,
    justifyContent: 'center',
  },

  focusCardSelected: {
    borderWidth: 2,
    shadowColor: '#173B42',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
  },

  focusEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },

  focusTitle: {
    color: '#173B42',
    fontSize: 12.5,
    fontWeight: '900',
    lineHeight: 17,
  },

  promptCard: {
    width: '100%',
    flexDirection: 'row',
    backgroundColor: '#F7FCFA',
    borderRadius: 17,
    padding: 13,
    borderWidth: 1,
    borderColor: '#DCEDE7',
    marginBottom: 11,
  },

  promptNumber: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DDF5EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  promptNumberText: {
    color: '#198F78',
    fontSize: 11,
    fontWeight: '900',
  },

  promptQuestion: {
    color: '#173B42',
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800',
    marginBottom: 9,
  },

  textInput: {
    minHeight: 88,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7E5E1',
    paddingHorizontal: 11,
    paddingVertical: 10,
    color: '#173B42',
    fontSize: 13,
    lineHeight: 19,
  },

  inspirationLabel: {
    color: '#829096',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 7,
  },

  suggestionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  suggestionChip: {
    backgroundColor: '#FFFFFF',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#D7E5E1',
  },

  suggestionChipText: {
    color: '#31545B',
    fontSize: 10.5,
    fontWeight: '700',
  },

  tinyWinCard: {
    width: '100%',
    backgroundColor: '#FFF8E8',
    borderRadius: 17,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F5E3B6',
    marginBottom: 12,
  },

  tinyWinTitle: {
    color: '#775C20',
    fontSize: 14,
    fontWeight: '900',
    lineHeight: 20,
    marginBottom: 5,
  },

  tinyWinSupport: {
    color: '#8A7545',
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 10,
  },

  privacyCard: {
    width: '100%',
    backgroundColor: '#EEF3FC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D5E2F5',
    marginBottom: 16,
  },

  privacyTitle: {
    color: '#3D5A80',
    fontSize: 12.5,
    fontWeight: '900',
    marginBottom: 4,
  },

  privacyText: {
    color: '#60727A',
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
  },

  journalSummaryCard: {
    width: '100%',
    backgroundColor: '#F7FCFA',
    borderRadius: 17,
    padding: 15,
    borderWidth: 1,
    borderColor: '#DCEDE7',
    marginBottom: 17,
  },

  journalSummaryHeading: {
    color: '#198F78',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.6,
    marginBottom: 12,
  },

  journalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },

  journalSummaryDivider: {
    height: 1,
    backgroundColor: '#E0EDE8',
    marginVertical: 10,
  },

  journalSummaryLabel: {
    color: '#60727A',
    fontSize: 12,
    fontWeight: '700',
  },

  journalSummaryValue: {
    color: '#173B42',
    fontSize: 12.5,
    fontWeight: '900',
    flexShrink: 1,
    textAlign: 'right',
  },

  /* =======================================================
     SUCCESS
  ======================================================= */

  successIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: '#C9F5DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    borderWidth: 5,
    borderColor: '#E8FFF4',
    alignSelf: 'center',
  },

  successIcon: {
    color: '#168A58',
    fontSize: 38,
    fontWeight: '900',
  },

  completedCard: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E7FAF3',
    borderRadius: 17,
    padding: 15,
    marginBottom: 17,
    borderWidth: 1,
    borderColor: '#C8EFE2',
  },

  completedEmoji: {
    fontSize: 30,
    marginRight: 12,
  },

  completedTitle: {
    color: '#176E5D',
    fontSize: 13.5,
    fontWeight: '900',
    marginBottom: 3,
  },

  completedText: {
    color: '#6B7E83',
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
  },

  /* =======================================================
     BUTTONS
  ======================================================= */

  primaryButton: {
    width: '100%',
    backgroundColor: '#42C79F',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 9,

    shadowColor: '#24A882',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 3,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '900',
  },

  primaryButtonDisabled: {
    backgroundColor: '#DDE9E5',
    shadowOpacity: 0,
    elevation: 0,
  },

  primaryButtonTextDisabled: {
    color: '#9AA9A4',
  },

  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1E0DC',
  },

  secondaryButtonText: {
    color: '#31545B',
    fontSize: 13.5,
    fontWeight: '800',
  },
});

export default ActivitiesScreen;