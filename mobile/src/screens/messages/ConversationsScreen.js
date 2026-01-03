import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import api from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize } from '../../utils/theme';
import { getRelativeTime, truncateText } from '../../utils/helpers';

const ConversationsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchConversations = async () => {
    try {
      const response = await api.get('/messages/conversations');
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchConversations();
    });
    return unsubscribe;
  }, [navigation]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchConversations();
    setRefreshing(false);
  }, []);

  const getOtherParticipant = (participants) => {
    return participants.find(p => p._id !== user?.id);
  };

  const getUnreadCount = (conversation) => {
    if (!conversation.unreadCount) return 0;
    return conversation.unreadCount[user?.id] || 0;
  };

  const ConversationItem = ({ conversation }) => {
    const otherUser = getOtherParticipant(conversation.participants);
    const unreadCount = getUnreadCount(conversation);

    return (
      <Card
        style={[styles.conversationCard, unreadCount > 0 && styles.unreadCard]}
        onPress={() =>
          navigation.navigate('Chat', {
            conversationId: conversation._id,
            name: `${otherUser?.firstName} ${otherUser?.lastName}`,
          })
        }
      >
        <Avatar
          source={otherUser?.profileImage}
          firstName={otherUser?.firstName}
          lastName={otherUser?.lastName}
          size="md"
        />
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.userName, unreadCount > 0 && styles.unreadText]}>
              {otherUser?.firstName} {otherUser?.lastName}
            </Text>
            {conversation.lastMessage?.timestamp && (
              <Text style={styles.time}>
                {getRelativeTime(conversation.lastMessage.timestamp)}
              </Text>
            )}
          </View>
          <View style={styles.conversationFooter}>
            <Text
              style={[styles.lastMessage, unreadCount > 0 && styles.unreadText]}
              numberOfLines={1}
            >
              {conversation.lastMessage?.content
                ? truncateText(conversation.lastMessage.content, 40)
                : 'No messages yet'}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
              </View>
            )}
          </View>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <EmptyState
        icon="chatbubbles-outline"
        title="No conversations"
        message="Start a conversation by messaging a driver or rider"
      />
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={conversations}
      keyExtractor={(item) => item._id}
      renderItem={({ item }) => <ConversationItem conversation={item} />}
      contentContainerStyle={styles.listContent}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: spacing.md,
  },
  conversationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  unreadCard: {
    backgroundColor: colors.primary + '08',
  },
  conversationContent: {
    flex: 1,
    marginLeft: spacing.md,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    fontSize: fontSize.md,
    fontWeight: '500',
    color: colors.text,
  },
  unreadText: {
    fontWeight: '600',
  },
  time: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  lastMessage: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  unreadBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: spacing.sm,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
});

export default ConversationsScreen;
