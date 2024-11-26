import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Avatar, Divider, Surface } from 'react-native-paper';

const MessagesScreen = () => {
  const mockConversations = [
    {
      id: '1',
      user: {
        name: 'Marie Dupont',
        avatar: null,
      },
      lastMessage: {
        text: 'D\'accord pour la perceuse, je suis disponible samedi',
        timestamp: '10:30',
        unread: true,
      },
    },
    {
      id: '2',
      user: {
        name: 'Pierre Martin',
        avatar: null,
      },
      lastMessage: {
        text: 'Merci pour le cours de guitare !',
        timestamp: 'Hier',
        unread: false,
      },
    },
  ];

  const renderItem = ({ item }) => (
    <>
      <List.Item
        title={item.user.name}
        description={item.lastMessage.text}
        left={props => (
          <Avatar.Text
            {...props}
            size={40}
            label={item.user.name.split(' ').map(n => n[0]).join('')}
          />
        )}
        right={props => (
          <View {...props} style={styles.rightContent}>
            <List.Subheader style={styles.timestamp}>
              {item.lastMessage.timestamp}
            </List.Subheader>
            {item.lastMessage.unread && <View style={styles.unreadDot} />}
          </View>
        )}
        style={styles.listItem}
      />
      <Divider />
    </>
  );

  return (
    <Surface style={styles.container}>
      <FlatList
        data={mockConversations}
        renderItem={renderItem}
        keyExtractor={item => item.id}
      />
    </Surface>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listItem: {
    paddingVertical: 8,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 16,
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
    marginTop: 4,
  },
});

export default MessagesScreen;
