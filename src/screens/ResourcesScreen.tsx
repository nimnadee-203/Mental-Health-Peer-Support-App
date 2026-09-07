import React, { useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ResourceArticle,
  resourceArticles,
} from '../types/ResourceArticle';

type ActivityType =
  | 'breathing'
  | 'mindfulness'
  | 'journaling'
  | 'digitalDetox'
  | 'healthyRoutine';

type ResourceFilter =
  | 'All'
  | 'Emotional Wellbeing'
  | 'Student Life'
  | 'Self Care'
  | 'Healthy Habits'
  | 'Peer Support';

const quickTips = [
  {
    title: 'Breathing Exercise',
    time: '5 min',
    accent: '#C9E8D3',
    icon: '❋',
    activity: 'breathing' as ActivityType,
  },
  {
    title: 'Mindfulness Break',
    time: '3 min',
    accent: '#D8E6FC',
    icon: '✦',
    activity: 'mindfulness' as ActivityType,
  },
  {
    title: 'Journaling',
    time: 'Open-ended',
    accent: '#F2D9BC',
    icon: '✎',
    activity: 'journaling' as ActivityType,
  },
];

const categoryFilters: ResourceFilter[] = [
  'All',
  'Emotional Wellbeing',
  'Student Life',
  'Self Care',
  'Healthy Habits',
  'Peer Support',
];

const sectionOrder = [
  'Explore Resources',
  'Student Wellbeing',
  'Self Care & Healthy Habits',
] as const;

type ResourcesScreenProps = {
  onOpenArticle: (article: ResourceArticle) => void;

  // View All Activities opens ActivitiesScreen
  // without selecting an activity.
  onOpenActivity: (activity?: ActivityType) => void;

  onOpenEmergencySupport: () => void;

  // Opens the CreateResourceScreen
  onOpenCreateResource: () => void;

  savedResources?: string[];
  resources?: ResourceArticle[];
};

function ResourcesScreen({
  onOpenArticle,
  onOpenActivity,
  onOpenEmergencySupport,
  onOpenCreateResource,
  savedResources = [],
  resources = resourceArticles,
}: ResourcesScreenProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] =
    useState<ResourceFilter>('All');

  const [imageLoadErrors, setImageLoadErrors] =
    useState<string[]>([]);

  const [saveOverrides, setSaveOverrides] =
    useState<Record<string, boolean>>({});

  const { width: screenWidth } =
    useWindowDimensions();

  const horizontalPadding = 36;
  const cardGap = 12;

  const computedCardWidth =
    (screenWidth - horizontalPadding - cardGap) / 2;

  const useSingleColumn =
    computedCardWidth < 170;

  const gridCardWidth = useSingleColumn
    ? screenWidth - horizontalPadding
    : computedCardWidth;

  const savedFromProp = useMemo(() => {
    return savedResources
      .map(value => {
        const byId = resources.find(
          article => article.id === value,
        );

        if (byId) {
          return byId.id;
        }

        const byTitle = resources.find(
          article =>
            article.title.toLowerCase() ===
            value.toLowerCase(),
        );

        return byTitle?.id;
      })
      .filter(
        (value): value is string =>
          Boolean(value),
      );
  }, [resources, savedResources]);

  const isResourceSaved = (
    resourceId: string,
  ) => {
    if (
      Object.prototype.hasOwnProperty.call(
        saveOverrides,
        resourceId,
      )
    ) {
      return Boolean(
        saveOverrides[resourceId],
      );
    }

    return savedFromProp.includes(resourceId);
  };

  const toggleSavedResource = (
    resourceId: string,
  ) => {
    const nextValue =
      !isResourceSaved(resourceId);

    setSaveOverrides(current => ({
      ...current,
      [resourceId]: nextValue,
    }));
  };

  const resolvedSavedResources = useMemo(() => {
    return resources.filter(article =>
      isResourceSaved(article.id),
    );
  }, [resources, saveOverrides, savedFromProp]);

  const normalizedQuery =
    searchQuery.trim().toLowerCase();

  const filteredResources = useMemo(() => {
    return resources.filter(article => {
      const matchesCategory =
        selectedFilter === 'All' ||
        article.category === selectedFilter;

      const matchesSearch =
        normalizedQuery.length === 0 ||
        article.title
          .toLowerCase()
          .includes(normalizedQuery) ||
        article.description
          .toLowerCase()
          .includes(normalizedQuery) ||
        article.category
          .toLowerCase()
          .includes(normalizedQuery);

      return (
        matchesCategory &&
        matchesSearch
      );
    });
  }, [
    resources,
    normalizedQuery,
    selectedFilter,
  ]);

  const featuredArticle =
    resources.find(
      article =>
        article.id ===
        'small-steps-for-difficult-days',
    );

  const visibleFeatured =
    featuredArticle &&
    filteredResources.some(
      article =>
        article.id === featuredArticle.id,
    )
      ? featuredArticle
      : null;

  const resourcesBySection = useMemo(() => {
    const sectionMap: Record<
      string,
      ResourceArticle[]
    > = {
      'Explore Resources': [],
      'Student Wellbeing': [],
      'Self Care & Healthy Habits': [],
    };

    filteredResources.forEach(article => {
      if (article.section === 'Featured') {
        return;
      }

      if (!sectionMap[article.section]) {
        sectionMap[article.section] = [];
      }

      sectionMap[article.section].push(
        article,
      );
    });

    return sectionMap;
  }, [filteredResources]);

  const shouldShowEmptyResults =
    filteredResources.length === 0;

  const addImageError = (
    resourceId: string,
  ) => {
    setImageLoadErrors(current => {
      if (current.includes(resourceId)) {
        return current;
      }

      return [...current, resourceId];
    });
  };

  const renderResourceImage = (
    resource: ResourceArticle,
    height: number,
    isSaved: boolean,
  ) => {
    const hasImageError =
      imageLoadErrors.includes(resource.id);

    return (
      <View
        style={[
          styles.imageWrap,
          { height },
        ]}
      >
        {hasImageError ? (
          <View style={styles.imageFallback}>
            <Text
              style={styles.imageFallbackIcon}
            >
              {resource.icon}
            </Text>

            <Text
              style={styles.imageFallbackText}
            >
              Image unavailable
            </Text>
          </View>
        ) : (
          <Image
            source={{
              uri: resource.image,
            }}
            style={styles.resourceImage}
            resizeMode="cover"
            onError={() =>
              addImageError(resource.id)
            }
          />
        )}

        <Pressable
          onPress={event => {
            event.stopPropagation();

            toggleSavedResource(
              resource.id,
            );
          }}
          hitSlop={8}
          style={[
            styles.saveButton,
            isSaved &&
              styles.saveButtonActive,
          ]}
        >
          <Text
            style={styles.saveButtonText}
          >
            {isSaved ? '♥' : '♡'}
          </Text>
        </Pressable>
      </View>
    );
  };

  const renderResourceCard = (
    resource: ResourceArticle,
    isFeatured: boolean,
  ) => {
    const isSaved =
      isResourceSaved(resource.id);

    return (
      <Pressable
        key={resource.id}
        testID="resource-article-card"
        style={({ pressed }) => [
          isFeatured
            ? styles.featuredCard
            : styles.gridCard,

          !isFeatured && {
            width: gridCardWidth,
          },

          pressed &&
            styles.cardPressed,
        ]}
        onPress={() =>
          onOpenArticle(resource)
        }
      >
        {renderResourceImage(
          resource,
          isFeatured ? 220 : 120,
          isSaved,
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardCategory}>
            {resource.category.toUpperCase()}
          </Text>

          <Text style={styles.cardTitle}>
            {resource.title}
          </Text>

          <Text
            style={styles.cardDescription}
          >
            {resource.description}
          </Text>

          <View
            style={styles.cardMetaRow}
          >
            <Text
              style={styles.cardMetaText}
            >
              {resource.readTime}
            </Text>

            <View
              style={styles.arrowButton}
            >
              <Text
                style={styles.arrowText}
              >
                ↗
              </Text>
            </View>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
      >
        {/* Header */}

        <View style={styles.pageHeader}>
          <Text style={styles.pageTitle}>
            Resources
          </Text>

          <Text
            style={styles.pageSubtitle}
          >
            Explore tools, guidance, and
            small activities to support
            your wellbeing.
          </Text>
        </View>

        {/* Search */}

        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>
            ⌕
          </Text>

          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search resources..."
            placeholderTextColor="#9AA3AE"
            style={styles.searchInput}
          />
        </View>

        {/* Filters */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.filterRow
          }
        >
          {categoryFilters.map(
            filter => {
              const isSelected =
                selectedFilter ===
                filter;

              return (
                <Pressable
                  key={filter}
                  style={[
                    styles.filterChip,
                    isSelected
                      ? styles.filterChipSelected
                      : styles.filterChipIdle,
                  ]}
                  onPress={() =>
                    setSelectedFilter(
                      filter,
                    )
                  }
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isSelected
                        ? styles.filterChipTextSelected
                        : styles.filterChipTextIdle,
                    ]}
                  >
                    {filter}
                  </Text>
                </Pressable>
              );
            },
          )}
        </ScrollView>

        {/* Create Resource */}

        <Pressable
          style={({ pressed }) => [
            styles.createResourceButton,
            pressed &&
              styles.createResourceButtonPressed,
          ]}
          onPress={onOpenCreateResource}
        >
          <View
            style={styles.createResourceIcon}
          >
            <Text
              style={
                styles.createResourceIconText
              }
            >
              ＋
            </Text>
          </View>

          <View
            style={styles.createResourceContent}
          >
            <Text
              style={styles.createResourceTitle}
            >
              Create Resource
            </Text>

            <Text
              style={
                styles.createResourceSubtitle
              }
            >
              Share helpful content with
              the community
            </Text>
          </View>

          <Text
            style={styles.createResourceArrow}
          >
            →
          </Text>
        </Pressable>

        {/* Emergency Support */}

        <Pressable
          style={({ pressed }) => [
            styles.emergencyCard,
            pressed &&
              styles.emergencyCardPressed,
          ]}
          onPress={
            onOpenEmergencySupport
          }
        >
          <View
            style={styles.emergencyIcon}
          >
            <Text
              style={
                styles.emergencyIconText
              }
            >
              🚨
            </Text>
          </View>

          <View
            style={styles.emergencyContent}
          >
            <Text
              style={styles.emergencyTitle}
            >
              Do you need emergency
              support?
            </Text>

            <Text
              style={
                styles.emergencyDescription
              }
            >
              If you or someone else is in
              immediate danger, get help
              from an emergency service
              or trusted person.
            </Text>

            <Text
              style={styles.emergencyLink}
            >
              Get emergency support →
            </Text>
          </View>
        </Pressable>

        {/* Resources */}

        {shouldShowEmptyResults ? (
          <View style={styles.emptyState}>
            <Text
              style={styles.emptyTitle}
            >
              No resources found
            </Text>

            <Text style={styles.emptyText}>
              Try changing your search or
              category filter.
            </Text>
          </View>
        ) : (
          <>
            {/* Featured */}

            {visibleFeatured && (
              <View
                style={styles.sectionBlock}
              >
                <Text
                  style={styles.sectionTitle}
                >
                  Featured
                </Text>

                {renderResourceCard(
                  visibleFeatured,
                  true,
                )}
              </View>
            )}

            {/* Sections */}

            {sectionOrder.map(
              sectionName => {
                const sectionItems =
                  resourcesBySection[
                    sectionName
                  ] ?? [];

                if (
                  sectionItems.length ===
                  0
                ) {
                  return null;
                }

                return (
                  <View
                    key={sectionName}
                    style={
                      styles.sectionBlock
                    }
                  >
                    <Text
                      style={
                        styles.sectionTitle
                      }
                    >
                      {sectionName}
                    </Text>

                    <View
                      style={[
                        styles.gridWrap,
                        useSingleColumn &&
                          styles.singleColumnGridWrap,
                      ]}
                    >
                      {sectionItems.map(
                        article =>
                          renderResourceCard(
                            article,
                            false,
                          ),
                      )}
                    </View>
                  </View>
                );
              },
            )}
          </>
        )}

        {/* Activities */}

        <View style={styles.sectionBlock}>
          <View
            style={styles.activitiesHeader}
          >
            <View
              style={
                styles.activitiesHeaderText
              }
            >
              <Text
                style={styles.sectionTitle}
              >
                Activities
              </Text>

              <Text
                style={
                  styles.activitiesSubtitle
                }
              >
                Take a few minutes for
                yourself.
              </Text>
            </View>

            <Pressable
              testID="view-all-activities"
              onPress={() =>
                onOpenActivity(undefined)
              }
              style={
                styles.viewAllButton
              }
            >
              <Text
                style={
                  styles.viewAllButtonText
                }
              >
                View All
              </Text>
            </Pressable>
          </View>

          {quickTips.map(item => (
            <Pressable
              key={item.title}
              testID={`${item.activity}-activity-card`}
              style={({ pressed }) => [
                styles.activityPreviewCard,
                pressed &&
                  styles.cardPressed,
              ]}
              onPress={() =>
                onOpenActivity(
                  item.activity,
                )
              }
            >
              <View
                style={[
                  styles.tipIcon,
                  {
                    backgroundColor:
                      item.accent,
                  },
                ]}
              >
                <Text
                  style={
                    styles.tipIconText
                  }
                >
                  {item.icon}
                </Text>
              </View>

              <View
                style={styles.tipCopy}
              >
                <Text
                  style={styles.tipTitle}
                >
                  {item.title}
                </Text>

                <Text
                  style={styles.tipMeta}
                >
                  {item.time}
                </Text>
              </View>

              <View
                style={styles.activityArrow}
              >
                <Text
                  style={
                    styles.activityArrowText
                  }
                >
                  →
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Saved Resources */}

        <View style={styles.sectionBlock}>
          <Text
            style={styles.sectionTitle}
          >
            Saved Resources
          </Text>

          <View style={styles.savedList}>
            {resolvedSavedResources.length >
            0 ? (
              resolvedSavedResources.map(
                resource => (
                  <Pressable
                    key={resource.id}
                    onPress={() =>
                      onOpenArticle(
                        resource,
                      )
                    }
                  >
                    <Text
                      style={
                        styles.savedResource
                      }
                    >
                      {resource.title}
                    </Text>
                  </Pressable>
                ),
              )
            ) : (
              <Text
                style={
                  styles.savedEmptyText
                }
              >
                Your saved resources will
                appear here.
              </Text>
            )}
          </View>
        </View>
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
    paddingBottom: 110,
  },

  pageHeader: {
    marginBottom: 16,
  },

  pageTitle: {
    color: '#1F2A37',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    marginBottom: 8,
  },

  pageSubtitle: {
    color: '#6A7280',
    fontSize: 15,
    lineHeight: 22,
  },

  searchWrap: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },

  searchIcon: {
    color: '#7A8694',
    fontSize: 18,
    marginRight: 8,
  },

  searchInput: {
    flex: 1,
    color: '#1F2A37',
    fontSize: 15,
    paddingVertical: 0,
  },

  filterRow: {
    paddingVertical: 4,
    paddingRight: 8,
    gap: 10,
    marginBottom: 18,
  },

  filterChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
  },

  filterChipSelected: {
    backgroundColor: '#CBE9D8',
    borderColor: '#CBE9D8',
  },

  filterChipIdle: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E6E8',
  },

  filterChipText: {
    fontSize: 13,
    fontWeight: '700',
  },

  filterChipTextSelected: {
    color: '#1F2A37',
  },

  filterChipTextIdle: {
    color: '#6A7280',
  },

  /* Create Resource */

  createResourceButton: {
    backgroundColor: '#E6F7EF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#CBE9D8',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  createResourceButtonPressed: {
    opacity: 0.8,
  },

  createResourceIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#CBE9D8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  createResourceIconText: {
    color: '#198F78',
    fontSize: 24,
    fontWeight: '700',
  },

  createResourceContent: {
    flex: 1,
  },

  createResourceTitle: {
    color: '#1F2A37',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },

  createResourceSubtitle: {
    color: '#6A7280',
    fontSize: 12,
    lineHeight: 17,
  },

  createResourceArrow: {
    color: '#198F78',
    fontSize: 20,
    fontWeight: '800',
    marginLeft: 8,
  },

  /* Emergency */

  emergencyCard: {
    backgroundColor: '#FFF7ED',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#FED7AA',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },

  emergencyCardPressed: {
    opacity: 0.8,
  },

  emergencyIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  emergencyIconText: {
    fontSize: 22,
  },

  emergencyContent: {
    flex: 1,
  },

  emergencyTitle: {
    color: '#9A3412',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },

  emergencyDescription: {
    color: '#C2410C',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 6,
  },

  emergencyLink: {
    color: '#9A3412',
    fontSize: 12,
    fontWeight: '800',
  },

  /* Resources */

  sectionBlock: {
    marginBottom: 24,
  },

  sectionTitle: {
    color: '#1F2A37',
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '800',
    marginBottom: 12,
  },

  featuredCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    overflow: 'hidden',
  },

  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },

  singleColumnGridWrap: {
    justifyContent: 'center',
  },

  gridCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    overflow: 'hidden',
  },

  cardPressed: {
    opacity: 0.86,
  },

  imageWrap: {
    width: '100%',
    backgroundColor: '#E8EEF2',
    position: 'relative',
  },

  resourceImage: {
    width: '100%',
    height: '100%',
  },

  imageFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D8E6FC',
  },

  imageFallbackIcon: {
    fontSize: 28,
    marginBottom: 6,
  },

  imageFallbackText: {
    color: '#5F6875',
    fontSize: 12,
    fontWeight: '600',
  },

  saveButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#E7E7E7',
  },

  saveButtonActive: {
    backgroundColor: '#EAF6EF',
    borderColor: '#CBE9D8',
  },

  saveButtonText: {
    color: '#1F2A37',
    fontSize: 16,
    lineHeight: 18,
    fontWeight: '800',
  },

  cardContent: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
  },

  cardCategory: {
    color: '#6A7280',
    fontSize: 10,
    letterSpacing: 0.8,
    fontWeight: '800',
    marginBottom: 6,
  },

  cardTitle: {
    color: '#1F2A37',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '800',
    marginBottom: 6,
  },

  cardDescription: {
    color: '#6A7280',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },

  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardMetaText: {
    color: '#6A7280',
    fontSize: 12,
    fontWeight: '600',
  },

  arrowButton: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E7E8EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  arrowText: {
    color: '#1F2A37',
    fontSize: 16,
    fontWeight: '700',
  },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    paddingVertical: 22,
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  emptyTitle: {
    color: '#1F2A37',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },

  emptyText: {
    color: '#6A7280',
    fontSize: 14,
    lineHeight: 20,
  },

  /* Activities */

  activitiesHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  activitiesHeaderText: {
    flex: 1,
  },

  activitiesSubtitle: {
    color: '#6A7280',
    fontSize: 12,
    lineHeight: 18,
    marginTop: -7,
  },

  viewAllButton: {
    backgroundColor: '#E6F7EF',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginLeft: 10,
  },

  viewAllButtonText: {
    color: '#198F78',
    fontSize: 12,
    fontWeight: '800',
  },

  activityPreviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    marginBottom: 10,
  },

  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  tipIconText: {
    fontSize: 20,
  },

  tipCopy: {
    flex: 1,
  },

  tipTitle: {
    color: '#202938',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
  },

  tipMeta: {
    color: '#758195',
    fontSize: 12,
    fontWeight: '600',
  },

  activityArrow: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#F1F8F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  activityArrowText: {
    color: '#198F78',
    fontSize: 17,
    fontWeight: '800',
  },

  /* Saved */

  savedList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E7E7E7',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  savedResource: {
    color: '#1F2A37',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
    paddingVertical: 4,
  },

  savedEmptyText: {
    color: '#6A7280',
    fontSize: 13,
    lineHeight: 18,
  },
});

export default ResourcesScreen;
