import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COMMUNITY_API_BASE } from '../../config/api';

type CreateGroupScreenProps = {
  onBack: () => void;
};

const CreateGroupScreen = ({
  onBack,
}: CreateGroupScreenProps) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');
  const [category, setCategory] = useState('');
  const [showCategories, setShowCategories] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('🌱');
  const emojis = [
  '🌱',
  '💙',
  '🧠',
  '🧘',
  '🌸',
  '🌻',
  '🌿',
  '🤝',
  '💬',
  '❤️',
  '🫶',
  '☀️',
  '🌈',
  '✨',
  '💗',
  '🍃',
];
  const [selectedBgColor, setSelectedBgColor] = useState('#C8EDD5');
  const bgColors = [
  '#C8EDD5',
  '#C5DFF8',
  '#F9D4E0',
  '#FFF3C4',
  '#D4C9F5',
  '#FADADD',
  '#D9F0F0',
  '#E6DFF5',
  '#FFE5CC',
  '#DDEBF7',
  '#E8F5E9',
  '#FCE4EC',
];

const categories = [
  'General Wellbeing',
  'Relationships',
  'Mindfulness',
  'Academic Pressure',
  'Stress & Anxiety',
  'Self-Care',
  'Depression',
];

const handleCreateGroup = async () => {
  if (!groupName.trim()) {
    Alert.alert('Missing Information', 'Please enter a group name.');
    return;
  }

  if (!description.trim()) {
    Alert.alert('Missing Information', 'Please enter a group description.');
    return;
  }

  if (!category) {
    Alert.alert('Missing Information', 'Please select a category.');
    return;
  }

  try {
    const response = await fetch(`${COMMUNITY_API_BASE}/communities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: groupName,
        category: category,
        emoji: selectedEmoji,
         bgColor: selectedBgColor,
        description: description,
        guidelines: guidelines,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      Alert.alert(
        'Error',
        data.error || 'Failed to create group.',
      );
      return;
    }

    Alert.alert(
      'Group Created',
      `"${data.name}" has been created successfully.`,
      [
        {
          text: 'OK',
          onPress: onBack,
        },
      ],
    );
  } catch (error) {
    console.error('Create group error:', error);
    Alert.alert(
      'Connection Error',
      'Could not connect to the server.',
    );
  }
};

return (
  <KeyboardAvoidingView
    style={styles.container}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
  >
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >

{/* Header */}
<View style={styles.headerRow}>
  <Pressable
    style={styles.backButton}
    onPress={onBack}
  >
    <Text style={styles.backButtonText}>◀</Text>
  </Pressable>

  <Text style={styles.title}> Create Support Group</Text>
</View>

        <Text style={styles.subtitle}>
          Create a safe space for people to connect and support each other.
        </Text>

        {/* Group Name */}
        <Text style={styles.label}>Group Name</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter group name"
          placeholderTextColor="#8A94A6"
          value={groupName}
          onChangeText={setGroupName}
        />

        {/* Category */}
        <Text style={styles.label}>Category</Text>
<Pressable
  style={styles.categoryInput}
  onPress={() => setShowCategories(!showCategories)}
>
  <Text
    style={
      category
        ? styles.categorySelected
        : styles.categoryPlaceholder
    }
  >
    {category || 'Select category'}
  </Text>

  <Text style={styles.arrow}>⌄</Text>
</Pressable>

{showCategories && (
  <View style={styles.categoryOptions}>
    {categories.map((item) => (
      <Pressable
        key={item}
        style={styles.categoryOption}
        onPress={() => {
  setCategory(item);
  setShowCategories(false);
}}
      >
        <Text style={styles.categoryOptionText}>
          {item}
        </Text>
      </Pressable>
    ))}
  </View>
)}

{/* Group Emoji */}
<Text style={styles.label}>Group Emoji</Text>

<View style={styles.emojiContainer}>
  {emojis.map((emoji) => (
    <Pressable
      key={emoji}
      style={[
        styles.emojiOption,
        selectedEmoji === emoji && styles.selectedEmojiOption,
      ]}
      onPress={() => setSelectedEmoji(emoji)}
    >
      <Text style={styles.emojiText}>{emoji}</Text>
    </Pressable>
  ))}
</View>

{/* Background Color */}
<Text style={styles.label}>Background Color</Text>

<View style={styles.colorContainer}>
  {bgColors.map((color) => (
    <Pressable
      key={color}
      style={[
        styles.colorOption,
        { backgroundColor: color },
        selectedBgColor === color && styles.selectedColorOption,
      ]}
      onPress={() => setSelectedBgColor(color)}
    />
  ))}
</View>

        {/* Description */}
        <Text style={styles.label}>Description</Text>

        <TextInput
          style={styles.textArea}
          placeholder="Describe your group..."
          placeholderTextColor="#8A94A6"
          multiline
          textAlignVertical="top"
          value={description}
          onChangeText={setDescription}
        />

        {/* Guidelines */}
        <Text style={styles.label}>Group Guidelines</Text>

       <TextInput
  style={styles.guidelinesInput}
  placeholder="Add some guidelines for group members..."
  placeholderTextColor="#8A94A6"
  multiline
  textAlignVertical="top"
  value={guidelines}
  onChangeText={setGuidelines}
/>

        {/* Create Button */}
        <Pressable style={styles.createButton}onPress={handleCreateGroup}>
          <Text style={styles.createButtonText}>
            Create Group
          </Text>
        </Pressable>

      </ScrollView>
     </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 60,
  },

  content: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },

backButton: {
  top: -8,
  width: 44,
  height: 44,
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: 2,
},

headerRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 8,
},

backButtonText: {
  fontSize: 40,
  color: '#1F2937',
  fontWeight: '500',
  textAlign: 'center',
  includeFontPadding: false,
},

  title: {
     flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#667085',
    marginTop: 8,
    marginBottom: 28,
  },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#344054',
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E1E5EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FB',
    fontSize: 14,
    color: '#1F2937',
  },

  categoryInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E1E5EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  categoryPlaceholder: {
    fontSize: 14,
    color: '#8A94A6',
  },

  categorySelected: {
  fontSize: 14,
  color: '#1F2937',
},

categoryOptions: {
  marginTop: 5,
  borderWidth: 1,
  borderColor: '#E1E5EB',
  borderRadius: 12,
  backgroundColor: '#FFFFFF',
  overflow: 'hidden',
},

categoryOption: {
  paddingVertical: 13,
  paddingHorizontal: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#F0F1F3',
},

categoryOptionText: {
  fontSize: 14,
  color: '#344054',
},

  arrow: {
    fontSize: 20,
    color: '#667085',
  },

  textArea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#E1E5EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#F8F9FB',
    fontSize: 14,
    color: '#1F2937',
  },

  createButton: {
    backgroundColor: '#2673FF',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  emojiContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
},

emojiOption: {
  width: 48,
  height: 48,
  borderRadius: 12,
  backgroundColor: '#F8F9FB',
  borderWidth: 1,
  borderColor: '#E1E5EB',
  alignItems: 'center',
  justifyContent: 'center',
},

selectedEmojiOption: {
  borderColor: '#2673FF',
  backgroundColor: '#EEF4FF',
},

emojiText: {
  fontSize: 24,
},

colorContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 12,
},

colorOption: {
  width: 48,
  height: 48,
  borderRadius: 12,
  borderWidth: 2,
  borderColor: '#E1E5EB',
},

selectedColorOption: {
  borderColor: '#2673FF',
  borderWidth: 3,
},

guidelinesInput: {
  minHeight: 150,
  borderWidth: 1,
  borderColor: '#E1E5EB',
  borderRadius: 12,
  paddingHorizontal: 16,
  paddingTop: 14,
  paddingBottom: 14,
  backgroundColor: '#F8F9FB',
  fontSize: 14,
  color: '#1F2937',
},

});

export default CreateGroupScreen;
