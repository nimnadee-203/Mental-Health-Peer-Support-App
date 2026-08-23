import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ResourceArticle, resourceArticles } from '../types/ResourceArticle';

type ResourceArticleScreenProps = {
  article?: ResourceArticle;
  onBack: () => void;
};

function ResourceArticleScreen({ article, onBack }: ResourceArticleScreenProps) {
  const currentArticle = article ?? resourceArticles[0];

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <Pressable
            testID="resource-article-back"
            onPress={onBack}
            style={styles.backButton}>
            <Text style={styles.backText}>{'<'}</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Resource</Text>
          <View style={styles.headerSpacer} />
        </View>

        <Image
          source={{ uri: currentArticle.image }}
          style={styles.heroImage}
          resizeMode="cover"
        />

        <Text style={styles.label}>{currentArticle.category.toUpperCase()}</Text>
        <Text style={styles.title}>{currentArticle.title}</Text>

        <Text style={styles.intro}>{currentArticle.description}</Text>

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>{currentArticle.readTime}</Text>
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.metaText}>{currentArticle.section}</Text>
        </View>

        {currentArticle.content.map(section => (
          <View key={section.heading} style={styles.section}>
            <Text style={styles.heading}>{section.heading}</Text>
            {section.paragraphs.map(paragraph => (
              <Text key={paragraph} style={styles.body}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}
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
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#1F2A37',
    fontSize: 22,
    fontWeight: '700',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#1F2A37',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSpacer: {
    width: 36,
  },
  heroImage: {
    width: '100%',
    height: 210,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    marginBottom: 14,
    backgroundColor: '#E8EEF2',
  },
  label: {
    color: '#7A7F86',
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '800',
    marginBottom: 12,
  },
  title: {
    color: '#1F2A37',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 14,
  },
  intro: {
    color: '#6A7280',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  metaText: {
    color: '#6A7280',
    fontSize: 13,
    fontWeight: '600',
  },
  metaDot: {
    color: '#A0A8B0',
    fontSize: 12,
    marginHorizontal: 8,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },
  heading: {
    color: '#1F2A37',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  body: {
    color: '#5F6875',
    fontSize: 14,
    lineHeight: 22,
  },
});

export default ResourceArticleScreen;