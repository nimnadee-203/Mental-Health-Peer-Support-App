import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLogo from '../assets/app-logo.png';

type SplashScreenProps = {
  onFinish: () => void;
};

function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.85)).current;

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

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

    // Auto navigate after 800ms
    const timer = setTimeout(() => {
      onFinishRef.current();
    }, 800);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        accessibilityRole="button"
        style={styles.touchArea}
        onPress={() => onFinishRef.current()}
      >
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
            <View style={styles.logoPulseRing} />

            <Image source={AppLogo} style={styles.appLogo} />
          </View>

          <Text style={styles.appName}>Peer Support</Text>

          <Text style={styles.tagline}>
            You do not have to carry it alone
          </Text>
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
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },

  appLogo: {
    width: 115,
    height: 115,
    resizeMode: 'contain',
    zIndex: 2,
  },

  logoPulseRing: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 42,
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