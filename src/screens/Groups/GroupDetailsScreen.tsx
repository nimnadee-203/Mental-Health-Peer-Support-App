import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';

type GroupDetailsScreenProps = {
  groupName: string;
  category: string;
  description: string;
  guidelines: string;
  emoji: string;

  onBack: () => void;
  onJoin: () => void;

  onOpenDiscussion?: () => void;
};

const GroupDetailsScreen = ({
  groupName,
  category,
  description,
  guidelines,
  emoji,
  onBack,
  onJoin,
  onOpenDiscussion,
}: GroupDetailsScreenProps) => {
  const [showSuccess, setShowSuccess] =
    useState(false);

  const [isJoined, setIsJoined] =
    useState(false);

  const celebrationScale = useRef(
    new Animated.Value(0)
  ).current;

  const handleJoin = () => {
    onJoin();
    setIsJoined(true);
    setShowSuccess(true);

    Animated.spring(celebrationScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const handleGoToGroup = () => {
    setShowSuccess(false);

    if (onOpenDiscussion) {
      onOpenDiscussion();
      return;
    }

    onBack();
  };

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
              {emoji}
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
        {!isJoined ? (
          <Pressable
            style={styles.joinButton}
            onPress={handleJoin}
          >
            <Text style={styles.joinButtonText}>
              Join Group
            </Text>
          </Pressable>
        ) : (
          <Pressable
            style={styles.backToCommunitiesButton}
            onPress={onBack}
          >
            <Text
              style={styles.backToCommunitiesText}
            >
              Back to Communities
            </Text>
          </Pressable>
        )}

      </ScrollView>

      {/* Success Popup */}
      {showSuccess && (
        <Pressable
          style={styles.successOverlay}
          onPress={() =>
            setShowSuccess(false)
          }
        >
          <Pressable
            style={styles.successCard}
            onPress={() => {}}
          >

            <Animated.View
              style={[
                styles.successIcon,
                {
                  transform: [
                    {
                      scale: celebrationScale,
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.successIconText}>
                🎊
              </Text>
            </Animated.View>

            <Text style={styles.successTitle}>
              You're now a member! 🎉
            </Text>

            <Text style={styles.successMessage}>
              Welcome to {groupName}! We're glad to
              have you here. This is a supportive
              space to connect, share, and support
              one another.
            </Text>

            <Pressable
              style={styles.goToGroupButton}
              onPress={handleGoToGroup}
            >
              <Text style={styles.goToGroupText}>
                Go to Group
              </Text>
            </Pressable>

          </Pressable>
        </Pressable>
      )}

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

  joinedButton: {
    backgroundColor: '#22C55E',
  },

  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor:
      'rgba(31, 41, 55, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  successCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },

  successIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  successIconText: {
    fontSize: 36,
  },

  successTitle: {
    fontSize: 21,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 10,
  },

  successMessage: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 22,
  },

  goToGroupButton: {
    width: '100%',
    height: 48,
    backgroundColor: '#2673FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  goToGroupText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  backToCommunitiesButton: {
    height: 52,
    backgroundColor: '#EEF4FF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },

  backToCommunitiesText: {
    color: '#2673FF',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default GroupDetailsScreen;