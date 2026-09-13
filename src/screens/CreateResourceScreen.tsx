import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceArticle } from '../types/ResourceArticle';

type ResourceFilter =
  | 'Emotional Wellbeing'
  | 'Student Life'
  | 'Self Care'
  | 'Healthy Habits'
  | 'Peer Support';

const categories: ResourceFilter[] = [
  'Emotional Wellbeing',
  'Student Life',
  'Self Care',
  'Healthy Habits',
  'Peer Support',
];

type CreateResourceScreenProps = {
  onBack: () => void;
  onCreateResource: (resource: ResourceArticle) => Promise<void> | void;
};

function CreateResourceScreen({
  onBack,
  onCreateResource,
}: CreateResourceScreenProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ResourceFilter | null>(null);
  const [readTime, setReadTime] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');

  const [showCategories, setShowCategories] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCreateResource = async () => {
    if (!title.trim()) {
      Alert.alert('Missing information', 'Please enter a resource title.');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Missing information', 'Please enter a description.');
      return;
    }

    if (!category) {
      Alert.alert('Missing information', 'Please select a category.');
      return;
    }

    if (!readTime.trim()) {
      Alert.alert(
        'Missing information',
        'Please enter the estimated read time.',
      );
      return;
    }

    if (!content.trim()) {
      Alert.alert('Missing information', 'Please enter the resource content.');
      return;
    }

    const trimmedTitle = title.trim();
    const article: ResourceArticle = {
      id: `${trimmedTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')}-${Date.now()}`,
      category,
      section: 'Explore Resources',
      title: trimmedTitle,
      description: description.trim(),
      icon: '📄',
      accent: '#D8E6FC',
      image: imageUrl.trim(),
      readTime: readTime.trim(),
      content: [
        {
          heading: trimmedTitle,
          paragraphs: content
            .trim()
            .split(/\n\s*\n/)
            .filter(Boolean),
        },
      ],
    };

    setIsSaving(true);

    try {
      await onCreateResource(article);
      Alert.alert(
        'Resource Created',
        'Your resource has been created successfully.',
        [
          {
            text: 'OK',
            onPress: onBack,
          },
        ],
      );
    } catch (error: any) {
      Alert.alert(
        'Could not create resource',
        error?.message || 'Please check your connection and try again.',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}

        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </Pressable>

          <View style={styles.headerText}>
            <Text style={styles.pageTitle}>Create Resource</Text>

            <Text style={styles.pageSubtitle}>
              Share helpful content with the community.
            </Text>
          </View>
        </View>

        {/* Form */}

        <View style={styles.formCard}>
          {/* Title */}

          <View style={styles.field}>
            <Text style={styles.label}>Resource Title</Text>

            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Enter resource title"
              placeholderTextColor="#9AA3AE"
              style={styles.input}
              maxLength={100}
            />
          </View>

          {/* Description */}

          <View style={styles.field}>
            <Text style={styles.label}>Description</Text>

            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Briefly describe this resource"
              placeholderTextColor="#9AA3AE"
              style={[styles.input, styles.multilineInput]}
              multiline
              textAlignVertical="top"
              maxLength={250}
            />

            <Text style={styles.characterCount}>{description.length}/250</Text>
          </View>

          {/* Category */}

          <View style={styles.field}>
            <Text style={styles.label}>Category</Text>

            <Pressable
              style={styles.dropdown}
              onPress={() => setShowCategories(current => !current)}
            >
              <Text
                style={
                  category
                    ? styles.dropdownSelectedText
                    : styles.dropdownPlaceholder
                }
              >
                {category ?? 'Select a category'}
              </Text>

              <Text style={styles.dropdownArrow}>
                {showCategories ? '▲' : '▼'}
              </Text>
            </Pressable>

            {showCategories && (
              <View style={styles.categoryList}>
                {categories.map(item => {
                  const selected = category === item;

                  return (
                    <Pressable
                      key={item}
                      style={[
                        styles.categoryOption,
                        selected && styles.categoryOptionSelected,
                      ]}
                      onPress={() => {
                        setCategory(item);
                        setShowCategories(false);
                      }}
                    >
                      <Text
                        style={[
                          styles.categoryOptionText,
                          selected && styles.categoryOptionTextSelected,
                        ]}
                      >
                        {item}
                      </Text>

                      {selected && <Text style={styles.checkMark}>✓</Text>}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>

          {/* Read Time */}

          <View style={styles.field}>
            <Text style={styles.label}>Read Time</Text>

            <TextInput
              value={readTime}
              onChangeText={setReadTime}
              placeholder="e.g. 5 min"
              placeholderTextColor="#9AA3AE"
              style={styles.input}
            />
          </View>

          {/* Image URL */}

          <View style={styles.field}>
            <Text style={styles.label}>Image URL</Text>

            <TextInput
              value={imageUrl}
              onChangeText={setImageUrl}
              placeholder="https://example.com/image.jpg"
              placeholderTextColor="#9AA3AE"
              style={styles.input}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Text style={styles.helperText}>
              Optional. Add an image URL for the resource.
            </Text>
          </View>

          {/* Content */}

          <View style={styles.field}>
            <Text style={styles.label}>Resource Content</Text>

            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder="Write the full resource content here..."
              placeholderTextColor="#9AA3AE"
              style={[styles.input, styles.contentInput]}
              multiline
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Create Button */}

        <Pressable
          style={({ pressed }) => [
            styles.createButton,
            (pressed || isSaving) && styles.createButtonPressed,
          ]}
          onPress={handleCreateResource}
          disabled={isSaving}
        >
          <Text style={styles.createButtonText}>
            {isSaving ? 'Creating...' : 'Create Resource'}
          </Text>
        </Pressable>

        <Text style={styles.bottomNote}>
          Your resource will be reviewed before being published.
        </Text>
      </ScrollView>
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
    paddingBottom: 50,
  },

  /* Header */

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E7E7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  backIcon: {
    color: '#1F2A37',
    fontSize: 22,
    fontWeight: '700',
  },

  headerText: {
    flex: 1,
  },

  pageTitle: {
    color: '#1F2A37',
    fontSize: 26,
    lineHeight: 31,
    fontWeight: '800',
    marginBottom: 4,
  },

  pageSubtitle: {
    color: '#6A7280',
    fontSize: 13,
    lineHeight: 19,
  },

  /* Form */

  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    padding: 16,
    marginBottom: 18,
  },

  field: {
    marginBottom: 18,
  },

  label: {
    color: '#1F2A37',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 8,
  },

  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E6E8',
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 13,
    paddingVertical: 12,
    color: '#1F2A37',
    fontSize: 14,
  },

  multilineInput: {
    minHeight: 90,
  },

  contentInput: {
    minHeight: 180,
  },

  characterCount: {
    color: '#9AA3AE',
    fontSize: 11,
    textAlign: 'right',
    marginTop: 5,
  },

  helperText: {
    color: '#9AA3AE',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 5,
  },

  /* Category */

  dropdown: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E6E8',
    backgroundColor: '#FAFBFC',
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dropdownPlaceholder: {
    color: '#9AA3AE',
    fontSize: 14,
  },

  dropdownSelectedText: {
    color: '#1F2A37',
    fontSize: 14,
    fontWeight: '600',
  },

  dropdownArrow: {
    color: '#6A7280',
    fontSize: 11,
  },

  categoryList: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E6E8',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },

  categoryOption: {
    minHeight: 44,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1F2',
  },

  categoryOptionSelected: {
    backgroundColor: '#E6F7EF',
  },

  categoryOptionText: {
    color: '#5F6875',
    fontSize: 13,
  },

  categoryOptionTextSelected: {
    color: '#198F78',
    fontWeight: '800',
  },

  checkMark: {
    color: '#198F78',
    fontSize: 16,
    fontWeight: '800',
  },

  /* Create Button */

  createButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: '#198F78',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  createButtonPressed: {
    opacity: 0.8,
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  bottomNote: {
    color: '#8A929D',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});

export default CreateResourceScreen;
