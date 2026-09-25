export type DigitalDetoxChallenge = {
  day: number;
  title: string;
  description: string;
  durationSeconds?: number;
  icon: string;
  type: 'break' | 'habit' | 'connection' | 'reflection' | 'creative';
  instructions: string[];
  reflection?: string;
};

export const digitalDetoxChecklist = [
  'Take a few slow breaths',
  'Look around your surroundings',
  'Stretch your shoulders',
  'Drink some water',
  'Notice how you feel without checking your phone',
];

export const DETOX_DURATION_SECONDS = 5 * 60;

const challenge = (
  day: number,
  title: string,
  description: string,
  icon: string,
  type: DigitalDetoxChallenge['type'],
  instructions: string[],
  durationSeconds?: number,
  reflection?: string,
): DigitalDetoxChallenge => ({
  day,
  title,
  description,
  icon,
  type,
  instructions,
  durationSeconds,
  reflection,
});

export const DIGITAL_DETOX_CHALLENGES: DigitalDetoxChallenge[] = [
  challenge(1, '5-Minute Digital Break', 'Take a 5-minute break from your screen.', '🌬️', 'break', digitalDetoxChecklist, DETOX_DURATION_SECONDS, 'What did you notice during your break?'),
  challenge(2, 'Screen-Free Moment', 'Spend 10 minutes away from your screen.', '🌿', 'break', ['Choose a comfortable place away from screens.', 'Let the moment be simple and unstructured.'], 10 * 60),
  challenge(3, 'Screen-Free Meal', 'Enjoy one meal without checking your phone.', '🍽️', 'habit', ['Put your phone out of reach before you begin.', 'Give your meal and company your full attention.']),
  challenge(4, 'Slow Morning', 'Avoid checking your phone immediately after waking up.', '☀️', 'habit', ['Give yourself a few phone-free minutes after waking.', 'Notice how your morning begins.']),
  challenge(5, 'Mindful Break', 'Take 5 minutes to breathe and relax without using your phone.', '🧘', 'break', ['Settle into a comfortable position.', 'Breathe slowly and let your shoulders soften.'], 5 * 60),
  challenge(6, 'Phone-Free Walk', 'Take a short walk without checking your phone.', '🚶', 'break', ['Leave your phone away or keep it out of sight.', 'Notice the pace, sounds, and air around you.']),
  challenge(7, 'Screen-Free Evening', 'Keep your phone away for 30 minutes before bed.', '🌙', 'habit', ['Choose where your phone will rest for the evening.', 'Use the time for a calm offline activity.'], 30 * 60),
  challenge(8, 'Notification Reset', 'Turn off unnecessary notifications.', '🔕', 'habit', ['Review which notifications you really need.', 'Turn off one source of unnecessary interruption.']),
  challenge(9, 'Screen-Free Drink Break', 'Enjoy a drink without scrolling or checking your phone.', '☕', 'break', ['Put your phone down while you enjoy your drink.', 'Notice the taste, temperature, and pause.']),
  challenge(10, 'Real Conversation', 'Have a conversation with someone without checking your phone.', '💬', 'connection', ['Let the other person know you are giving them your attention.', 'Stay present for the conversation.']),
  challenge(11, 'Offline Activity', 'Spend 15 minutes doing an offline activity.', '🎨', 'creative', ['Choose something you enjoy that does not need a screen.', 'Stay with it for 15 minutes.'], 15 * 60),
  challenge(12, 'Quiet Moment', 'Sit quietly for 5 minutes without your phone.', '🌾', 'break', ['Find a comfortable place to sit.', 'Notice your breathing and surroundings.'], 5 * 60),
  challenge(13, 'Music Without Scrolling', 'Listen to music without using your phone for other activities.', '🎵', 'break', ['Start one album, playlist, or song.', 'Keep your attention on listening.']),
  challenge(14, 'One-Hour Evening Break', 'Take a one-hour break from unnecessary screen use.', '🌆', 'break', ['Choose an hour for an offline evening pause.', 'Keep only essential devices available.'], 60 * 60),
  challenge(15, '20-Minute Digital Detox', 'Take a 20-minute phone-free break.', '📵', 'break', ['Put your phone somewhere out of reach.', 'Choose rest, movement, or quiet for 20 minutes.'], 20 * 60),
  challenge(16, 'Offline Task', 'Complete a small task without reaching for your phone.', '🧺', 'habit', ['Pick one small task.', 'Finish it before checking your phone.']),
  challenge(17, 'Outdoor Moment', 'Spend some time outdoors without scrolling.', '🌳', 'break', ['Step outside if you can.', 'Look up and notice something beyond your screen.']),
  challenge(18, 'Connect', 'Spend quality time talking with someone without using your phone.', '🤝', 'connection', ['Choose someone you feel comfortable with.', 'Share time without phones between you.']),
  challenge(19, 'Read Offline', 'Read something for at least 15 minutes without using a screen.', '📖', 'creative', ['Choose a book, magazine, or printed article.', 'Read for at least 15 minutes.'], 15 * 60),
  challenge(20, 'Relax', 'Take 10 minutes for a relaxing offline activity.', '🫖', 'break', ['Choose a gentle offline activity.', 'Let yourself relax without needing to be productive.'], 10 * 60),
  challenge(21, 'Phone-Free Bedtime', 'Keep your phone away during your bedtime routine.', '🛏️', 'habit', ['Place your phone away before starting your routine.', 'Let bedtime be a slower transition.']),
  challenge(22, '30-Minute Digital Break', 'Take a 30-minute break from unnecessary screen use.', '🌱', 'break', ['Choose a thirty-minute window.', 'Use it for something that restores your attention.'], 30 * 60),
  challenge(23, 'Mindful Meal', 'Have a completely screen-free meal.', '🥗', 'habit', ['Keep all screens away from the table.', 'Enjoy the meal one bite at a time.']),
  challenge(24, 'Create Something', 'Do something creative without using a screen.', '🖌️', 'creative', ['Draw, write, cook, build, or make something by hand.', 'Focus on the process rather than the result.']),
  challenge(25, 'Phone-Free Walk', 'Take a longer walk without checking your phone.', '🥾', 'break', ['Choose a safe route.', 'Keep your phone away and notice the journey.']),
  challenge(26, 'Notification-Free Hour', 'Try spending one hour without unnecessary notifications.', '🔕', 'habit', ['Mute unnecessary notifications for one hour.', 'Notice how the quiet affects your attention.'], 60 * 60),
  challenge(27, 'Quality Time', 'Spend quality time with someone without phones.', '💛', 'connection', ['Agree to put phones away together.', 'Enjoy the shared time as it is.']),
  challenge(28, 'One-Hour Digital Break', 'Take a one-hour break from unnecessary screen use.', '🌿', 'break', ['Set aside one hour for offline time.', 'Choose an activity that feels meaningful.'], 60 * 60),
  challenge(29, 'App Reflection', 'Think about one app you could use less.', '🪞', 'reflection', ['Choose one app to reflect on.', 'Consider one small boundary that could help.'], undefined, 'What boundary would support you?'),
  challenge(30, 'Create Your Routine', 'Create a personal screen-free routine.', '🗓️', 'reflection', ['Choose a time and place for your routine.', 'Make it small enough to repeat.'], undefined, 'What will your routine look like?'),
  challenge(31, 'Your Digital Balance', 'Choose your own meaningful digital detox activity and complete it.', '🏆', 'reflection', ['Choose an activity that feels meaningful to you.', 'Complete it in a way that supports your balance.'], undefined, 'What does digital balance mean to you?'),
];
