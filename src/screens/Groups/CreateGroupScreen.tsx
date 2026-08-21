import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
} from 'react-native';

type CreateGroupScreenProps = {
  onBack: () => void;
};

const CreateGroupScreen = ({
  onBack,
}: CreateGroupScreenProps) => {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [guidelines, setGuidelines] = useState('');

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >

{/* Back Button */}
<Pressable
  style={styles.backButton}
  onPress={onBack}
>
  <Text style={styles.backButtonText}> Back</Text>
</Pressable>

        {/* Header */}
        <Text style={styles.title}>Create Support Group</Text>

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

        <Pressable style={styles.categoryInput}>
          <Text style={styles.categoryPlaceholder}>
            Select category
          </Text>

          <Text style={styles.arrow}>⌄</Text>
        </Pressable>

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
          style={styles.textArea}
          placeholder="Add some guidelines for group members..."
          placeholderTextColor="#8A94A6"
          multiline
          textAlignVertical="top"
          value={guidelines}
          onChangeText={setGuidelines}
        />

        {/* Create Button */}
        <Pressable style={styles.createButton}>
          <Text style={styles.createButtonText}>
            Create Group
          </Text>
        </Pressable>

      </ScrollView>
    </View>
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
  alignSelf: 'flex-start',
  backgroundColor: '#EEF4FF',
  paddingHorizontal: 12,
  paddingVertical: 7,
  borderRadius: 10,
  marginBottom: 16,
},

backButtonText: {
  fontSize: 13,
  fontWeight: '600',
  color: '#2673FF',
},

  title: {
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
});

export default CreateGroupScreen;