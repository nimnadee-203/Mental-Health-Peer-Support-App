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
  const detailsAnim = useRef(new Animated.Value(0)).current;
  const hasFinished = useRef(false);

  const onFinishRef = useRef(onFinish);
  onFinishRef.current = onFinish;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 7,
        tension: 42,
        useNativeDriver: true,
      }),
      Animated.timing(detailsAnim, {
        toValue: 1,
        duration: 700,
        delay: 350,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      if (!hasFinished.current) {
        hasFinished.current = true;
        onFinishRef.current();
      }
    }, 1800);

    return () => clearTimeout(timer);
  }, [detailsAnim, fadeAnim, scaleAnim]);

  const finishEarly = () => {
    if (hasFinished.current) return;
    hasFinished.current = true;
    onFinishRef.current();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable
        accessibilityRole="button"
        style={styles.touchArea}
        onPress={finishEarly}
      >
        <View style={styles.backgroundGlowTop} />
        <View style={styles.backgroundGlowBottom} />
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
            <View style={styles.logoAccent} />

            <Image source={AppLogo} style={styles.appLogo} />
          </View>

          <Text style={styles.appName}>Peer Support</Text>

          <Animated.View style={[styles.details, { opacity: detailsAnim, transform: [{ translateY: detailsAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
            <Text style={styles.tagline}>You do not have to carry it alone</Text>
            <View style={styles.divider} />
            <Text style={styles.supportText}>A safe space to connect, reflect, and heal</Text>
          </Animated.View>
        </Animated.View>

        <View style={styles.footer}>
          <View style={styles.footerLine} />
          <Text style={styles.hintText}>Your wellbeing matters</Text>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#102A43',
    overflow: 'hidden',
  },

  touchArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 42,
    paddingHorizontal: 24,
  },

  backgroundGlowTop: {
    position: 'absolute',
    top: -110,
    right: -80,
    width: 290,
    height: 290,
    borderRadius: 145,
    backgroundColor: 'rgba(66, 199, 159, 0.12)',
  },

  backgroundGlowBottom: {
    position: 'absolute',
    bottom: -150,
    left: -120,
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: 'rgba(126, 214, 165, 0.08)',
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
    marginBottom: 24,
  },

  appLogo: {
    width: 108,
    height: 108,
    resizeMode: 'contain',
    zIndex: 2,
  },

  logoPulseRing: {
    position: 'absolute',
    width: 136,
    height: 136,
    borderRadius: 44,
    borderWidth: 1,
    borderColor: 'rgba(126, 214, 165, 0.5)',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },

  logoAccent: {
    position: 'absolute',
    top: 1,
    right: 8,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: '#F7C873',
    zIndex: 3,
  },

  appName: {
    color: '#F8FAFC',
    fontSize: 31,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginBottom: 12,
    textAlign: 'center',
  },

  details: {
    alignItems: 'center',
  },

  tagline: {
    color: '#D6E8E3',
    fontSize: 16,
    lineHeight: 23,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },

  divider: {
    width: 34,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#42C79F',
    marginVertical: 17,
  },

  supportText: {
    color: '#91B6B1',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  footer: {
    alignItems: 'center',
  },

  footerLine: {
    width: 42,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(214, 232, 227, 0.3)',
    marginBottom: 12,
  },

  hintText: {
    color: '#91B6B1',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
});

export default SplashScreen;