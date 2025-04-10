import {
  addDoc,
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore'

import type { Chat, Message } from '@/types/chat'
import { RoleEnum } from '@/types/enum'

import { db } from './firestore'
/**
 * Creates a new chat between a customer and a brand
 * @param customerId The ID of the customer
 * @param customerName The name of the customer
 * @param customerEmail The email of the customer
 * @param brandId The ID of the brand
 * @param brandName The name of the brand
 * @param brandLogo The logo URL of the brand (optional)
 * @returns The ID of the newly created chat
 */
export const createChat = async (
  customerId: string,
  customerName: string,
  customerEmail = '',
  brandId: string,
  brandName: string,
  brandLogo?: string,
): Promise<string> => {
  try {
    // Check if a chat already exists between this customer and brand
    const chatsRef = collection(db, 'chats')
    const q = query(chatsRef, where('customerId', '==', customerId), where('brandId', '==', brandId))
    const querySnapshot = await getDocs(q)

    // If a chat already exists, return its ID
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id
    }

    // Calculate TTL - 24 hours from now
    const ttlDate = new Date()
    ttlDate.setHours(ttlDate.getHours() + 24)
    const ttl = Timestamp.fromDate(ttlDate)

    // Create a new chat
    const chatRef = await addDoc(collection(db, 'chats'), {
      customerId,
      customerName,
      customerEmail,
      brandId,
      brandName,
      brandLogo: brandLogo || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastMessageTime: serverTimestamp(),
      lastMessage: null,
      status: 'pending', // Add a status field
      userMessageCount: 0, // Count only user messages, not system/welcome messages
      ttl: ttl, // 24 hours TTL for cleanup
      messageCount: 0, // Track message count
    })

    // Create a welcome message from the brand
    const welcomeMessage = {
      chatId: chatRef.id,
      senderId: brandId,
      senderName: brandName,
      senderRole: RoleEnum.STAFF,
      content: `Welcome to ${brandName} support! How can we help you today?`,
      timestamp: Date.now(),
    }

    await addDoc(collection(db, 'messages'), welcomeMessage)

    return chatRef.id
  } catch (error) {
    console.error('Error creating chat:', error)
    throw error
  }
}

/**
 * Gets a chat by ID
 * @param chatId The ID of the chat
 * @returns The chat data
 */
export const getChat = async (chatId: string): Promise<Chat | null> => {
  try {
    const chatDoc = await getDoc(doc(db, 'chats', chatId))
    if (!chatDoc.exists()) return null
    return { id: chatDoc.id, ...chatDoc.data() } as Chat
  } catch (error) {
    console.error('Error getting chat:', error)
    throw error
  }
}

/**
 * Assigns a chat to a staff member
 * @param chatId The ID of the chat
 * @param staffId The ID of the staff member
 */
export const assignChatToStaff = async (chatId: string, staffId: string): Promise<void> => {
  try {
    await updateDoc(doc(db, 'chats', chatId), {
      assignedTo: staffId,
      updatedAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error assigning chat to staff:', error)
    throw error
  }
}

/**
 * Gets all chats for a customer
 * @param customerId The ID of the customer
 * @returns The customer's chats
 */
export const getCustomerChats = async (customerId: string): Promise<Chat[]> => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('customerId', '==', customerId),
      orderBy('lastMessageTime', 'desc'),
    )

    const chatDocs = await getDocs(chatsQuery)
    return chatDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Chat)
  } catch (error) {
    console.error('Error getting customer chats:', error)
    throw error
  }
}

/**
 * Gets all chats for a brand
 * @param brandId The ID of the brand
 * @returns The brand's chats
 */
export const getBrandChats = async (brandId: string): Promise<Chat[]> => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('brandId', '==', brandId),
      orderBy('lastMessageTime', 'desc'),
    )

    const chatDocs = await getDocs(chatsQuery)
    console.log('====================================')
    console.log(chatDocs)
    console.log('====================================')
    return chatDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Chat)
  } catch (error) {
    console.error('Error getting brand chats:', error)
    throw error
  }
}

/**
 * Gets all chats assigned to a staff member
 * @param staffId The ID of the staff member
 * @returns The staff member's assigned chats
 */
export const getStaffAssignedChats = async (staffId: string): Promise<Chat[]> => {
  try {
    const chatsQuery = query(
      collection(db, 'chats'),
      where('assignedTo', '==', staffId),
      orderBy('lastMessageTime', 'desc'),
    )

    const chatDocs = await getDocs(chatsQuery)
    return chatDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Chat)
  } catch (error) {
    console.error('Error getting staff assigned chats:', error)
    throw error
  }
}

/**
 * Listens to chats for a user
 * @param userId The ID of the user
 * @param role The role of the user
 * @param brandId The ID of the brand (optional)
 * @param callback The callback to call when chats change
 * @returns A function to unsubscribe from the listener
 */
export const listenToChats = (
  userId: string,
  role: string,
  brandId: string | undefined,
  callback: (chats: Chat[]) => void,
) => {
  let chatsQuery

  if (role === RoleEnum.CUSTOMER) {
    chatsQuery = query(collection(db, 'chats'), where('customerId', '==', userId), orderBy('lastMessageTime', 'desc'))
  } else if ((role === RoleEnum.MANAGER || role === RoleEnum.STAFF) && brandId) {
    // Both brand managers and staff can see all chats related to their brand
    chatsQuery = query(collection(db, 'chats'), where('brandId', '==', brandId), orderBy('lastMessageTime', 'desc'))
  } else {
    return () => {}
  }

  return onSnapshot(chatsQuery, (snapshot) => {
    const chats = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Chat)
    callback(chats)
  })
}

/**
 * Sends a message in a chat
 * @param chatId The ID of the chat
 * @param senderId The ID of the sender
 * @param senderName The name of the sender
 * @param senderRole The role of the sender
 * @param content The content of the message
 * @returns The ID of the newly created message
 */
export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderName: string,
  senderRole: string,
  content: string,
): Promise<string> => {
  try {
    // Create a new message
    const messageRef = await addDoc(collection(db, 'messages'), {
      chatId,
      senderId,
      senderName,
      senderRole,
      content,
      timestamp: Date.now(),
    })

    // Update the chat with the last message
    const chatRef = doc(db, 'chats', chatId)

    // Only update status if this is a customer message (not system or staff)
    if (senderRole === RoleEnum.CUSTOMER) {
      await updateDoc(chatRef, {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active', // Mark as active once a real user message is sent
        userMessageCount: increment(1),
        ttl: deleteField(), // Remove TTL once a real message is sent
        messageCount: increment(1),
      })
    } else {
      await updateDoc(chatRef, {
        lastMessage: content,
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp(),
        messageCount: increment(1),
      })
    }

    return messageRef.id
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}

/**
 * Gets all messages for a chat
 * @param chatId The ID of the chat
 * @returns The chat's messages
 */
export const getChatMessages = async (chatId: string): Promise<Message[]> => {
  try {
    const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('timestamp', 'asc'))

    const messageDocs = await getDocs(messagesQuery)
    return messageDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Message)
  } catch (error) {
    console.error('Error getting chat messages:', error)
    throw error
  }
}

/**
 * Listens to messages for a chat
 * @param chatId The ID of the chat
 * @param callback The callback to call when messages change
 * @returns A function to unsubscribe from the listener
 */
export const listenToChatMessages = (chatId: string, callback: (messages: Message[]) => void) => {
  try {
    const messagesQuery = query(collection(db, 'messages'), where('chatId', '==', chatId), orderBy('timestamp', 'asc'))

    return onSnapshot(messagesQuery, (snapshot) => {
      const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Message)
      callback(messages)
    })
  } catch (error) {
    console.error('Error listening to chat messages:', error)
    return () => {}
  }
}
