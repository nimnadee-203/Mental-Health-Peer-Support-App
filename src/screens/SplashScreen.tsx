import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type SplashScreenProps = {
  onFinish: () => void;
};

function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    // Fade in and scale up animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto navigate after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable accessibilityRole="button" style={styles.touchArea} onPress={onFinish}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <View style={styles.logoContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <View style={styles.logoPulseRing} />
          </View>

          <Text style={styles.appName}>Peer Support</Text>
          <Text style={styles.tagline}>You do not have to carry it alone</Text>
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.hintText}>Tap anywhere to skip</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E293B',
  },
  touchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    zIndex: 2,
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
  },
  logoPulseRing: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(37, 99, 235, 0.35)',
  },
  appName: {
    color: '#F8FAFC',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  footer: {
    alignItems: 'center',
  },
  hintText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;
