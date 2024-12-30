import React from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text, Surface, useTheme, Avatar, Chip } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Post } from '../types/post';
import TimeAgo from './TimeAgo';
import { useNavigation } from '@react-navigation/native';
import { convertToDate } from '../utils/dateUtils';

interface UserPostsListProps {
  posts: Post[];
  loading: boolean;
  onRefresh: () => void;
}

const UserPostsList: React.FC<UserPostsListProps> = ({
  posts,
  loading,
  onRefresh,
}) => {
  const theme = useTheme();
  const navigation = useNavigation();

  const renderItem = ({ item: post }: { item: Post }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('PostDetail', { post })}
    >
      <Surface style={styles.postCard} elevation={1}>
        <View style={styles.postHeader}>
          <View style={styles.postMeta}>
            <Chip
              icon={() => (
                <MaterialCommunityIcons
                  name="tag"
                  size={16}
                  color={theme.colors.secondary}
                />
              )}
              mode="flat"
              style={[styles.categoryChip, { backgroundColor: theme.colors.surfaceVariant }]}
            >
              {post.category}
            </Chip>
            <View style={styles.timeContainer}>
              <TimeAgo date={convertToDate(post.createdAt)} />
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: post.status === 'active' ? theme.colors.primaryContainer : theme.colors.surfaceVariant }
              ]}
            >
              {post.status === 'active' ? 'Active' : 'Terminée'}
            </Chip>
          </View>
        </View>

        <Text variant="titleMedium" style={styles.title} numberOfLines={2}>
          {post.title}
        </Text>

        <Text variant="bodyMedium" style={styles.description} numberOfLines={2}>
          {post.description}
        </Text>

        <View style={styles.footer}>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={theme.colors.onSurfaceVariant}
            />
            <Text
              variant="bodySmall"
              style={[styles.location, { color: theme.colors.onSurfaceVariant }]}
              numberOfLines={1}
            >
              {post.location.address}
            </Text>
          </View>

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="message-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {post.responses?.length || 0}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons
                name="heart-outline"
                size={16}
                color={theme.colors.onSurfaceVariant}
              />
              <Text
                variant="bodySmall"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {post.likes?.length || 0}
              </Text>
            </View>
          </View>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  if (posts.length === 0 && !loading) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons
          name="post-outline"
          size={48}
          color={theme.colors.onSurfaceVariant}
        />
        <Text
          variant="titleMedium"
          style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
        >
          Aucune demande pour le moment
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={onRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  listContainer: {
    padding: 16,
  },
  postCard: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryChip: {
    marginRight: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusChip: {
    borderRadius: 12,
  },
  title: {
    marginBottom: 8,
    fontWeight: '600',
  },
  description: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  location: {
    marginLeft: 4,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    gap: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
  },
});

export default UserPostsList;
