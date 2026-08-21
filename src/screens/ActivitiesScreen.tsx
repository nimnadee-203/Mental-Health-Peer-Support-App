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
  | 'journaling';

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

const journalingPrompts = [
  {
    question:
      'What’s on your mind right now?',
    placeholder:
      'Write whatever comes to mind...',
  },

  {
    question:
      'What is one thing you need today?',
    placeholder: 'Write here...',
  },

  {
    question:
      'What is one small thing that made today a little better?',
    placeholder: 'Write here...',
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

  const [journalAnswers, setJournalAnswers] =
    useState(['', '', '']);

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
     ALL ACTIVITIES PAGE
  ======================================================= */

  const renderAllActivities = () => {
    return (
      <>
        <View
          style={
            styles.activitiesPageHeader
          }
        >
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
            right for you right now.
            There is no pressure to finish
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
                <Text
                  style={
                    styles.activityOptionTitle
                  }
                >
                  {item.title}
                </Text>

                <Text
                  style={
                    styles.activityOptionDescription
                  }
                >
                  {item.description}
                </Text>

                <Text
                  style={
                    styles.activityOptionDuration
                  }
                >
                  {item.duration}
                </Text>
              </View>

              <View
                style={
                  styles.activityOptionArrow
                }
              >
                <Text
                  style={
                    styles.activityOptionArrowText
                  }
                >
                  →
                </Text>
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
          <View>
            <Text
              style={styles.activityTag}
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

        <Text
          style={
            styles.breathingMessage
          }
        >
          {activeBreathingStep.message}
        </Text>

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
              style={styles.activityTag}
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
          <Text
            style={
              styles.selectionCounterText
            }
          >
            {selectedCount} of{' '}
            {requiredCount} selected
          </Text>

          <Text
            style={[
              styles.selectionHint,
              selectionComplete &&
                styles.selectionHintComplete,
            ]}
          >
            {selectionComplete
              ? '✓ Ready to continue'
              : `Choose ${
                  requiredCount -
                  selectedCount
                } more`}
          </Text>
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
                  style={[
                    styles.mindfulnessOption,
                    isSelected &&
                      styles.mindfulnessOptionSelected,
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
              mindfulnessSteps.length -
                1
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
            REFLECTION SAVED
          </Text>

          <Text
            style={styles.activityTitle}
          >
            You made space for yourself.
          </Text>

          <Text
            style={styles.activityDetail}
          >
            You don't need to solve
            everything today. Sometimes
            putting your thoughts into
            words is enough.
          </Text>

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
        </>
      );
    }

    return (
      <>
        <Text
          style={styles.activityTag}
        >
          JOURNALING
        </Text>

        <Text
          style={styles.activityTitle}
        >
          A moment for yourself
        </Text>

        <Text
          style={styles.activityDetail}
        >
          Take a few minutes to put your
          thoughts into words. There’s no
          right or wrong answer.
        </Text>

        {journalingPrompts.map(
          (prompt, index) => (
            <View
              key={prompt.question}
              style={styles.promptCard}
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
                  journalAnswers[index]
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
                placeholderTextColor="#8D99A6"
                style={styles.textInput}
                textAlignVertical="top"
              />
            </View>
          ),
        )}

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            setJournalingDone(true)
          }
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            Save Reflection
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
          <Text
            style={styles.backButtonText}
          >
            ← Back
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
    backgroundColor: '#EAF9F4',
  },

  content: {
    flexGrow: 1,
    padding: 18,
    justifyContent: 'center',
  },

  backButton: {
    marginBottom: 16,
  },

  backButtonText: {
    color: '#173B42',
    fontSize: 15,
    fontWeight: '800',
  },

  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    padding: 24,
    borderWidth: 1,
    borderColor: '#CDEDE2',
    alignItems: 'center',
    shadowColor: '#2B8A78',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 4,
  },

  /* =======================================================
     ALL ACTIVITIES
  ======================================================= */

  activitiesPageHeader: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
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
    color: '#60727A',
    fontSize: 14,
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
    backgroundColor: '#F8FCFA',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#D9EEE7',
  },

  activityOptionIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  activityOptionIconText: {
    fontSize: 23,
  },

  activityOptionContent: {
    flex: 1,
  },

  activityOptionTitle: {
    color: '#173B42',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },

  activityOptionDescription: {
    color: '#60727A',
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 5,
  },

  activityOptionDuration: {
    color: '#198F78',
    fontSize: 11,
    fontWeight: '900',
  },

  activityOptionArrow: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#E2F9EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },

  activityOptionArrowText: {
    color: '#198F78',
    fontSize: 18,
    fontWeight: '900',
  },

  cardPressed: {
    opacity: 0.86,
  },

  /* =======================================================
     BREATHING
  ======================================================= */

  breathingHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  activityTag: {
    color: '#198F78',
    fontSize: 11,
    letterSpacing: 1.2,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 4,
    textAlign: 'center',
  },

  cycleText: {
    color: '#7A8992',
    fontSize: 12,
    fontWeight: '700',
  },

  timerBadge: {
    backgroundColor: '#E1F8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },

  timerBadgeText: {
    color: '#198F78',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.7,
  },

  breathingInstruction: {
    color: '#667780',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },

  breathingVisual: {
    width: 230,
    height: 230,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },

  breathingGlow: {
    position: 'absolute',
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.18,
  },

  breathingCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 7,
    borderColor: '#FFFFFF',
    shadowColor: '#48B99A',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 7,
  },

  breathingLabel: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: 1,
  },

  countdown: {
    color: '#FFFFFF',
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '900',
    marginTop: 2,
  },

  breathingMessage: {
    color: '#198F78',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
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
    fontSize: 16,
    fontWeight: '800',
  },

  musicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F4F5',
    borderRadius: 22,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DCE5E3',
  },

  musicButtonActive: {
    backgroundColor: '#E2F9EF',
    borderColor: '#A9E5CF',
  },

  musicIcon: {
    fontSize: 16,
    marginRight: 5,
  },

  musicButtonText: {
    color: '#718087',
    fontSize: 10,
    fontWeight: '900',
  },

  musicButtonTextActive: {
    color: '#198F78',
  },

  mindfulnessProgress: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 22,
  },

  mindfulnessProgressItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  mindfulnessProgressDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
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
    fontSize: 11,
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
    marginBottom: 10,
  },

  mindfulnessEmoji: {
    fontSize: 36,
  },

  stepCounter: {
    color: '#198F78',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    marginBottom: 7,
  },

  selectionCounter: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F0FBF7',
    borderRadius: 12,
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

  selectionHint: {
    color: '#9A7777',
    fontSize: 11,
    fontWeight: '700',
  },

  selectionHintComplete: {
    color: '#198F78',
  },

  optionsContainer: {
    width: '100%',
    marginBottom: 12,
  },

  mindfulnessOption: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FBFA',
    borderRadius: 14,
    paddingHorizontal: 13,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0EBE7',
    marginBottom: 8,
  },

  mindfulnessOptionSelected: {
    backgroundColor: '#E2F9EF',
    borderColor: '#42C79F',
  },

  optionCheck: {
    width: 23,
    height: 23,
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
    fontSize: 14,
    fontWeight: '900',
  },

  mindfulnessOptionText: {
    flex: 1,
    color: '#40575E',
    fontSize: 13,
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
    fontSize: 24,
    marginRight: 10,
  },

  musicInfoTitle: {
    color: '#775C20',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 2,
  },

  musicInfoText: {
    color: '#8A7545',
    fontSize: 11,
    lineHeight: 16,
  },

  /* =======================================================
     NAVIGATION
  ======================================================= */

  navigationRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 10,
  },

  previousButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
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
    fontSize: 13,
    fontWeight: '900',
  },

  previousButtonTextDisabled: {
    color: '#B4BDBA',
  },

  nextMindfulnessButton: {
    flex: 1.4,
    backgroundColor: '#42C79F',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  nextMindfulnessButtonDisabled: {
    backgroundColor: '#DDE9E5',
  },

  nextMindfulnessButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

  nextMindfulnessButtonTextDisabled: {
    color: '#9AA9A4',
  },

  exitMindfulnessButton: {
    paddingVertical: 8,
  },

  exitMindfulnessText: {
    color: '#829096',
    fontSize: 12,
    fontWeight: '700',
  },

  /* =======================================================
     SHARED
  ======================================================= */

  activityTitle: {
    color: '#173B42',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },

  activityDetail: {
    color: '#60727A',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 18,
  },

  phaseProgressBackground: {
    width: '100%',
    height: 7,
    borderRadius: 5,
    backgroundColor: '#E2EFEB',
    overflow: 'hidden',
    marginBottom: 14,
  },

  phaseProgressFill: {
    height: '100%',
    borderRadius: 5,
  },

  phaseLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },

  phaseItem: {
    alignItems: 'center',
  },

  phaseDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#D8E7E3',
    marginBottom: 5,
  },

  phaseDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#28B58F',
  },

  phaseDotCompleted: {
    backgroundColor: '#8BD9C2',
  },

  phaseLabel: {
    color: '#8A999F',
    fontSize: 8,
    fontWeight: '800',
  },

  phaseLabelActive: {
    color: '#198F78',
  },

  pauseButton: {
    width: '100%',
    backgroundColor: '#DDF8EF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BCEBDB',
  },

  pauseButtonText: {
    color: '#167E6A',
    fontSize: 14,
    fontWeight: '900',
  },

  successIconWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#C9F5DF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 5,
    borderColor: '#E8FFF4',
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
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#C8EFE2',
  },

  completedEmoji: {
    fontSize: 32,
    marginRight: 12,
  },

  completedTitle: {
    color: '#176E5D',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 3,
  },

  completedText: {
    color: '#6B7E83',
    fontSize: 12,
    fontWeight: '600',
  },

  primaryButton: {
    width: '100%',
    backgroundColor: '#42C79F',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#24A882',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  secondaryButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CFE0DC',
  },

  secondaryButtonText: {
    color: '#31545B',
    fontSize: 14,
    fontWeight: '800',
  },

  promptCard: {
    width: '100%',
    backgroundColor: '#F5FCF9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#D9EEE7',
    marginBottom: 12,
  },

  promptQuestion: {
    color: '#173B42',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 10,
  },

  textInput: {
    minHeight: 90,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D4E4E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#173B42',
    fontSize: 14,
  },
});

export default ActivitiesScreen;