import { initializeTestEnvironment, RulesTestEnvironment, RulesTestContext } from '@firebase/rules-unit-testing';
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';

const PROJECT_ID = 'jirani-5f130';
let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      host: 'localhost',
      port: 8080,
      rules: `
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            function isAuthenticated() {
              return request.auth != null;
            }
            
            function isOwner(userId) {
              return isAuthenticated() && request.auth.uid == userId;
            }

            function isValidUserData() {
              let incomingData = request.resource.data;
              return 
                incomingData.firstName is string &&
                incomingData.lastName is string &&
                incomingData.displayName is string &&
                incomingData.email is string &&
                incomingData.bio is string &&
                incomingData.bio.size() <= 500 &&
                incomingData.location != null;
            }

            match /users/{userId} {
              allow read: if isAuthenticated();
              allow create: if isOwner(userId) && isValidUserData();
              allow update: if isOwner(userId) && isValidUserData();
              allow delete: if isOwner(userId);
            }

            match /posts/{postId} {
              allow read: if isAuthenticated();
              allow create: if isAuthenticated();
              allow update, delete: if isAuthenticated() && request.auth.uid == resource.data.userId;
            }

            match /messages/{messageId} {
              allow read: if isAuthenticated() && 
                (request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.receiverId);
              allow create: if isAuthenticated() && request.resource.data.senderId == request.auth.uid;
              allow update, delete: if isAuthenticated() && 
                (request.auth.uid == resource.data.senderId || request.auth.uid == resource.data.receiverId);
            }
          }
        }
      `,
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('User Profile Rules', () => {
  const userId = 'user123';
  const otherUserId = 'user456';
  
  const validUserData = {
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    email: 'john@example.com',
    bio: 'A short bio',
    location: {
      address: '123 Street',
      coordinates: { latitude: 0, longitude: 0 }
    }
  };

  test('unauthenticated user cannot read profiles', async () => {
    const context = testEnv.unauthenticatedContext();
    const profileRef = doc(context.firestore(), 'users', userId);
    
    await expect(getDoc(profileRef)).rejects.toThrow();
  });

  test('authenticated user can read any profile', async () => {
    const context = testEnv.authenticatedContext(otherUserId);
    const profileRef = doc(context.firestore(), 'users', userId);
    
    await setDoc(profileRef, validUserData);
    const snapshot = await getDoc(profileRef);
    expect(snapshot.exists()).toBe(true);
  });

  test('user can create their own profile', async () => {
    const context = testEnv.authenticatedContext(userId);
    const profileRef = doc(context.firestore(), 'users', userId);
    
    await expect(setDoc(profileRef, validUserData)).resolves.not.toThrow();
  });

  test('user cannot create profile for others', async () => {
    const context = testEnv.authenticatedContext(userId);
    const profileRef = doc(context.firestore(), 'users', otherUserId);
    
    await expect(setDoc(profileRef, validUserData)).rejects.toThrow();
  });

  test('user can update their own profile', async () => {
    const context = testEnv.authenticatedContext(userId);
    const profileRef = doc(context.firestore(), 'users', userId);
    
    await expect(updateDoc(profileRef, { bio: 'Updated bio' })).resolves.not.toThrow();
  });

  test('user cannot update others profile', async () => {
    const context = testEnv.authenticatedContext(userId);
    const profileRef = doc(context.firestore(), 'users', otherUserId);
    
    await expect(updateDoc(profileRef, { bio: 'Updated bio' })).rejects.toThrow();
  });
});

describe('Post Rules', () => {
  const userId = 'user123';
  const postId = 'post123';
  
  const validPost = {
    title: 'Test Post',
    description: 'Test Description',
    userId: userId,
    location: {
      address: '123 Street',
      coordinates: { latitude: 0, longitude: 0 }
    }
  };

  test('authenticated user can create post', async () => {
    const context = testEnv.authenticatedContext(userId);
    const postRef = doc(context.firestore(), 'posts', postId);
    
    await expect(setDoc(postRef, validPost)).resolves.not.toThrow();
  });

  test('unauthenticated user cannot create post', async () => {
    const context = testEnv.unauthenticatedContext();
    const postRef = doc(context.firestore(), 'posts', postId);
    
    await expect(setDoc(postRef, validPost)).rejects.toThrow();
  });

  test('post owner can update post', async () => {
    const context = testEnv.authenticatedContext(userId);
    const postRef = doc(context.firestore(), 'posts', postId);
    
    await setDoc(postRef, validPost);
    await expect(updateDoc(postRef, { title: 'Updated Title' })).resolves.not.toThrow();
  });

  test('non-owner cannot update post', async () => {
    const context = testEnv.authenticatedContext('otherUser');
    const postRef = doc(context.firestore(), 'posts', postId);
    
    await expect(updateDoc(postRef, { title: 'Updated Title' })).rejects.toThrow();
  });
});

describe('Message Rules', () => {
  const senderId = 'sender123';
  const receiverId = 'receiver123';
  const messageId = 'message123';
  
  const validMessage = {
    senderId,
    receiverId,
    content: 'Test message',
    timestamp: new Date()
  };

  test('sender can create message', async () => {
    const context = testEnv.authenticatedContext(senderId);
    const messageRef = doc(context.firestore(), 'messages', messageId);
    
    await expect(setDoc(messageRef, validMessage)).resolves.not.toThrow();
  });

  test('receiver cannot create message as sender', async () => {
    const context = testEnv.authenticatedContext(receiverId);
    const messageRef = doc(context.firestore(), 'messages', messageId);
    
    await expect(setDoc(messageRef, validMessage)).rejects.toThrow();
  });

  test('participants can read message', async () => {
    const senderContext = testEnv.authenticatedContext(senderId);
    const receiverContext = testEnv.authenticatedContext(receiverId);
    const messageRef = doc(senderContext.firestore(), 'messages', messageId);
    
    await setDoc(messageRef, validMessage);
    
    await expect(getDoc(doc(senderContext.firestore(), 'messages', messageId))).resolves.not.toThrow();
    await expect(getDoc(doc(receiverContext.firestore(), 'messages', messageId))).resolves.not.toThrow();
  });

  test('non-participant cannot read message', async () => {
    const context = testEnv.authenticatedContext('otherUser');
    const messageRef = doc(context.firestore(), 'messages', messageId);
    
    await expect(getDoc(messageRef)).rejects.toThrow();
  });
});
