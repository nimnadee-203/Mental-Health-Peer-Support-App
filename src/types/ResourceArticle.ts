export type ResourceArticleSection = {
  heading: string;
  paragraphs: string[];
};

export type ResourceArticle = {
  id: string;
  category: string;
  section: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
  image: string;
  readTime: string;
  content: ResourceArticleSection[];
};

export const resourceArticles: ResourceArticle[] = [
  {
    id: 'small-steps-for-difficult-days',
    category: 'Emotional Wellbeing',
    section: 'Featured',
    title: 'Small Steps for Difficult Days',
    description: 'When everything feels hard, small actions still count.',
    icon: '✦',
    accent: '#CBE9D8',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80',
    readTime: '3 min read',
    content: [
      {
        heading: 'Start with one small thing',
        paragraphs: [
          'On heavy days, even simple tasks can feel large. Instead of trying to solve everything at once, choose one action that feels manageable right now.',
          'A short walk, a glass of water, or stepping outside for fresh air can help your day feel more possible.',
        ],
      },
      {
        heading: 'Take a mindful pause',
        paragraphs: [
          'Place one hand on your chest and notice your breath for thirty seconds. You are not trying to change it, only to notice it.',
          'When thoughts race ahead, return to what is here now: your breathing, your seat, and the room around you.',
        ],
      },
      {
        heading: 'Be kind to yourself',
        paragraphs: [
          'Progress does not need to look dramatic. Gentle consistency often helps more than intense effort followed by burnout.',
          'If today feels hard, treat yourself like you would treat a friend: with patience, care, and realistic expectations.',
        ],
      },
    ],
  },
  {
    id: 'understanding-academic-stress',
    category: 'Student Life',
    section: 'Student Wellbeing',
    title: 'Understanding Academic Stress',
    description:
      'Learn simple ways to manage study pressure without feeling overwhelmed.',
    icon: '◍',
    accent: '#D8E6FC',
    image:
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80',
    readTime: '4 min read',
    content: [
      {
        heading: 'What academic stress can feel like',
        paragraphs: [
          'Study stress can show up as racing thoughts, poor sleep, low motivation, or feeling behind even when you are trying.',
          'These reactions are common under pressure and do not mean you are failing as a student.',
        ],
      },
      {
        heading: 'Common causes',
        paragraphs: [
          'Deadlines, perfectionism, comparison with classmates, financial pressure, and uncertainty about the future can all build stress.',
          'Sometimes the issue is not effort. It is that your workload and recovery time are out of balance.',
        ],
      },
      {
        heading: 'Small ways to manage study pressure',
        paragraphs: [
          'Break assignments into smaller actions, use focused study blocks, and plan recovery breaks like meals, movement, and sleep.',
          'Ask, "What is the next smallest useful step?" This keeps momentum without adding more pressure.',
        ],
      },
      {
        heading: 'When to reach out for support',
        paragraphs: [
          'If stress keeps affecting sleep, focus, or mood for more than a couple of weeks, speak with someone you trust or a campus support service.',
          'Reaching out early can make problems easier to manage.',
        ],
      },
    ],
  },
  {
    id: 'when-you-need-a-break',
    category: 'Self Care',
    section: 'Self Care & Healthy Habits',
    title: 'When You Need a Break',
    description:
      'Recognize when you need to pause and give yourself permission to rest.',
    icon: '☼',
    accent: '#F2D9BC',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    readTime: '3 min read',
    content: [
      {
        heading: 'You do not have to keep pushing',
        paragraphs: [
          'Rest is part of sustainable effort, not a reward for burnout. Taking breaks can protect your concentration and mood.',
          'Short pauses can help your body settle and make the next task feel less overwhelming.',
        ],
      },
      {
        heading: 'Signals you may need a pause',
        paragraphs: [
          'Common signs include irritability, low focus, headaches, and feeling stuck even on simple tasks.',
          'These signals are useful information that your routine may need a reset.',
        ],
      },
      {
        heading: 'How to make breaks useful',
        paragraphs: [
          'Try a true pause: stretch, drink water, step outside, or sit quietly without multitasking.',
          'When you return, choose one clear next step instead of jumping into everything at once.',
        ],
      },
    ],
  },
  {
    id: 'building-healthy-daily-habits',
    category: 'Healthy Habits',
    section: 'Self Care & Healthy Habits',
    title: 'Building Healthy Daily Habits',
    description:
      'Small routines can make difficult days feel a little more manageable.',
    icon: '✧',
    accent: '#C9E8D3',
    image:
      'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=1200&q=80',
    readTime: '4 min read',
    content: [
      {
        heading: 'Habits are easier to build when they are small',
        paragraphs: [
          'You do not need an ideal routine to benefit from structure. Small repeatable actions can make your week feel steadier.',
          'Think in terms of minimum habits you can keep, even during busy periods.',
        ],
      },
      {
        heading: 'Try small anchors',
        paragraphs: [
          'Examples: a glass of water after waking, five minutes of planning before class, and a short walk after studying.',
          'Start with one anchor and add another only when the first one feels natural.',
        ],
      },
      {
        heading: 'Make support part of the routine',
        paragraphs: [
          'Habits are easier to keep when they include support: reminders, simple tracking, and flexibility on hard days.',
          'Consistency is built through adjustment, not perfection.',
        ],
      },
    ],
  },
  {
    id: 'dealing-with-difficult-emotions',
    category: 'Emotional Wellbeing',
    section: 'Explore Resources',
    title: 'Dealing With Difficult Emotions',
    description:
      'Learn to notice, understand, and respond to difficult emotions with kindness.',
    icon: '✦',
    accent: '#D9E7F8',
    image:
      'https://images.unsplash.com/photo-1516307365426-bea591f05011?auto=format&fit=crop&w=1200&q=80',
    readTime: '5 min read',
    content: [
      {
        heading: 'Notice without judging',
        paragraphs: [
          'Strong emotions can feel confusing before they feel clear. Start by naming what you feel without judging yourself for feeling it.',
          'Naming an emotion creates distance and can make the experience feel less intense.',
        ],
      },
      {
        heading: 'Respond with gentleness',
        paragraphs: [
          'Ask what support is needed right now: rest, space, movement, food, or a conversation.',
          'Kind self-talk often helps your nervous system settle faster than criticism.',
        ],
      },
      {
        heading: 'Let feelings move through you',
        paragraphs: [
          'Emotions shift over time, even when they feel intense in the moment. You do not need to fix everything immediately.',
          'Stay connected to practical care while feelings pass: hydration, food, movement, and connection.',
        ],
      },
    ],
  },
  {
    id: 'reaching-out-for-support',
    category: 'Peer Support',
    section: 'Student Wellbeing',
    title: 'Reaching Out for Support',
    description:
      "You don't have to handle everything alone. Learn when and how to reach out.",
    icon: '❋',
    accent: '#E7F4EA',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=80',
    readTime: '4 min read',
    content: [
      {
        heading: 'Why asking for help can feel difficult',
        paragraphs: [
          'Many students worry about burdening others or not knowing what to say. This can delay support until stress is very high.',
          'Reaching out early can reduce pressure and create options before things feel urgent.',
        ],
      },
      {
        heading: 'Who you can reach out to',
        paragraphs: [
          'Support can come from friends, roommates, mentors, tutors, academic advisors, resident staff, or student support services.',
          'Choose someone who feels approachable and start with one clear sentence.',
        ],
      },
      {
        heading: 'How to start the conversation',
        paragraphs: [
          'You can say: "I have been feeling stretched lately and could use support," or "Can I talk with you about something?"',
          'You do not need to explain everything at once. A short honest opener is enough.',
        ],
      },
      {
        heading: 'When professional support may be helpful',
        paragraphs: [
          'If stress or low mood keeps affecting sleep, study, relationships, or daily routines, consider contacting campus counseling or a licensed professional.',
          'Seeking support is a practical step toward stability and wellbeing.',
        ],
      },
    ],
  },
  {
    id: 'managing-screen-time-and-rest',
    category: 'Healthy Habits',
    section: 'Self Care & Healthy Habits',
    title: 'Managing Screen Time & Rest',
    description:
      'Create healthier boundaries around screens and give your mind time to rest.',
    icon: '◔',
    accent: '#D8E6FC',
    image:
      'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    readTime: '3 min read',
    content: [
      {
        heading: 'Notice your current pattern',
        paragraphs: [
          'Screens are essential for study and social life, but constant scrolling can leave your mind tired and unfocused.',
          'Track when screen time helps you and when it leaves you drained.',
        ],
      },
      {
        heading: 'Build simple boundaries',
        paragraphs: [
          'Try no-phone moments around meals, first 15 minutes after waking, or before sleep.',
          'Use app timers or focus mode during study blocks to reduce switching between tasks.',
        ],
      },
      {
        heading: 'Protect your rest window',
        paragraphs: [
          'Give yourself a short wind-down period at night with lower light, fewer notifications, and calming activities.',
          'Even small reductions in late-night screen use can improve sleep quality.',
        ],
      },
    ],
  },
  {
    id: 'feeling-connected-at-university',
    category: 'Peer Support',
    section: 'Student Wellbeing',
    title: 'Feeling Connected at University',
    description:
      'Small connections can make university life feel less overwhelming.',
    icon: '✳',
    accent: '#CBE9D8',
    image:
      'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1200&q=80',
    readTime: '4 min read',
    content: [
      {
        heading: 'Connection can start small',
        paragraphs: [
          'You do not need a large social circle to feel supported. A few meaningful interactions each week can make a big difference.',
          'Connection often begins with small repeated moments, not one big event.',
        ],
      },
      {
        heading: 'Try low-pressure social steps',
        paragraphs: [
          'Attend one campus event, join a study group, or message a classmate after lecture.',
          'Low-pressure social steps can build comfort and confidence over time.',
        ],
      },
      {
        heading: 'Keep routines that support belonging',
        paragraphs: [
          'Returning to familiar places like libraries, clubs, or campus cafes can help create a sense of community.',
          'Feeling connected is often about consistency, not intensity.',
        ],
      },
      {
        heading: 'When loneliness feels persistent',
        paragraphs: [
          'If loneliness is affecting your wellbeing, consider speaking with a peer mentor, advisor, or counseling service.',
          'Support exists, and asking for it is a strong and practical step.',
        ],
      },
    ],
  },
];
