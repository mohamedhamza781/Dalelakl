import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { chatAPI } from '@/lib/api'

// ── Async Thunks ─────────────────────────────────────────────

export const fetchConversations = createAsyncThunk(
  'chat/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await chatAPI.getConversations()
      return data.conversations
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (convId, { rejectWithValue }) => {
    try {
      const data = await chatAPI.getMessages(convId)
      return { convId, messages: data.messages }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const openChatWithUser = createAsyncThunk(
  'chat/openWith',
  async (userId, { rejectWithValue }) => {
    try {
      const data = await chatAPI.getOrCreate(userId)
      return data.conversation
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const sendMessageAPI = createAsyncThunk(
  'chat/sendMessage',
  async ({ convId, text }, { rejectWithValue }) => {
    try {
      const data = await chatAPI.sendMessage(convId, text)
      return { convId, message: data.message }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────
const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations: [],
    activeConvId:  null,
    loading:       false,
    error:         null,
  },
  reducers: {
    setActiveConv(state, { payload: id }) {
      state.activeConvId = id
      const conv = state.conversations.find(c => c.id === id)
      if (conv) conv.unread = 0
    },
    // للتوافق مع الكود القديم (local send)
    sendMessage(state, { payload: { convId, text } }) {
      const conv = state.conversations.find(c => c.id === convId)
      if (!conv) return
      const now  = new Date()
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`
      if (!conv.messages) conv.messages = []
      conv.messages.push({ id: Date.now(), from: 'me', text, time })
    },
    receiveMessage(state, { payload: { convId, text } }) {
      const conv = state.conversations.find(c => c.id === convId)
      if (!conv) return
      const now  = new Date()
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`
      if (!conv.messages) conv.messages = []
      conv.messages.push({ id: Date.now(), from: 'them', text, time })
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending,   (s) => { s.loading = true })
      .addCase(fetchConversations.fulfilled, (s, { payload }) => {
        s.loading = false
        // تحويل شكل الباك إند لشكل الفرونت
        s.conversations = payload.map(conv => ({
          id:       conv.id,
          name:     conv.otherUser?.name || 'محادثة',
          avatar:   conv.otherUser?.avatar || '؟',
          online:   false,
          unread:   conv.unreadCount || 0,
          messages: conv.lastMessage ? [{
            id:   conv.lastMessage.id,
            from: 'them',
            text: conv.lastMessage.text,
            time: new Date(conv.lastMessage.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
          }] : [],
        }))
        if (!s.activeConvId && s.conversations.length > 0) {
          s.activeConvId = s.conversations[0].id
        }
      })
      .addCase(fetchConversations.rejected, (s, { payload }) => { s.loading = false; s.error = payload })

    builder.addCase(fetchMessages.fulfilled, (s, { payload: { convId, messages } }) => {
      const conv = s.conversations.find(c => c.id === convId)
      if (conv) {
        conv.messages = messages.map(m => ({
          id:   m.id,
          from: m.isMe ? 'me' : 'them',
          text: m.text,
          time: new Date(m.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
        }))
      }
    })

    builder.addCase(openChatWithUser.fulfilled, (s, { payload: conv }) => {
      const exists = s.conversations.find(c => c.id === conv.id)
      if (!exists) {
        s.conversations.unshift({
          id:       conv.id,
          name:     conv.otherUser?.name || 'محادثة',
          avatar:   conv.otherUser?.avatar || '؟',
          online:   false,
          unread:   0,
          messages: [],
        })
      }
      s.activeConvId = conv.id
    })

    builder.addCase(sendMessageAPI.fulfilled, (s, { payload: { convId, message } }) => {
      const conv = s.conversations.find(c => c.id === convId)
      if (conv && message) {
        if (!conv.messages) conv.messages = []
        conv.messages.push({
          id:   message.id,
          from: 'me',
          text: message.text,
          time: new Date(message.createdAt).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }),
        })
      }
    })
  },
})

export const { setActiveConv, sendMessage, receiveMessage } = chatSlice.actions
export default chatSlice.reducer
