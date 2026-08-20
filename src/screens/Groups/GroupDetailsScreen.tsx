import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';

type GroupDetailsScreenProps = {
  groupName: string;
  category: string;
  description: string;
  guidelines: string;
  onBack: () => void;
};

const GroupDetailsScreen = ({
  groupName,
  category,
  description,
  guidelines,
  onBack,
}: GroupDetailsScreenProps) => {
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
          <Text style={styles.backButtonText}>
            ← Back
          </Text>
        </Pressable>

        {/* Group Header */}
        <View style={styles.header}>
          <View style={styles.groupImage}>
            <Text style={styles.groupImageText}>
              💙
            </Text>
          </View>

          <Text style={styles.category}>
            {category}
          </Text>

          <Text style={styles.title}>
            {groupName}
          </Text>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            About
          </Text>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>

        {/* Guidelines */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Group Guidelines
          </Text>

          <View style={styles.guidelinesBox}>
            <Text style={styles.guidelines}>
              {guidelines}
            </Text>
          </View>
        </View>

        {/* Join Button */}
        <Pressable style={styles.joinButton}>
          <Text style={styles.joinButtonText}>
            Join Group
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
    marginBottom: 24,
  },

  backButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2673FF',
  },

  header: {
    alignItems: 'center',
    marginBottom: 30,
  },

  groupImage: {
    width: 80,
    height: 80,
    borderRadius: 22,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  groupImageText: {
    fontSize: 36,
  },

  category: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2673FF',
    marginBottom: 6,
    textTransform: 'uppercase',
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
  },

  section: {
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 10,
  },

  description: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
  },

  guidelinesBox: {
    backgroundColor: '#F8F9FB',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8ECF2',
  },

  guidelines: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
  },

  joinButton: {
    height: 52,
    backgroundColor: '#2673FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default GroupDetailsScreen;