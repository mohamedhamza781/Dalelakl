import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authAPI, favoritesAPI } from '@/lib/api'

// ── Async Thunks ─────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const data = await authAPI.login(email, password)
      localStorage.setItem('token', data.token)
      return data.user
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const registerUser = createAsyncThunk(
  'auth/register',
  async (formData, { rejectWithValue }) => {
    try {
      const data = await authAPI.register(formData)
      localStorage.setItem('token', data.token)
      return data.user
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchCurrentUser = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authAPI.getMe()
      return data.user
    } catch (err) {
      // فقط امسح التوكن لو الخطأ 401 (غير مصرح) مش عند مشاكل الشبكة
      if (err.message?.includes('401') || err.message?.includes('غير مصرح') || err.message?.includes('غير موجود')) {
        localStorage.removeItem('token')
      }
      return rejectWithValue(err.message)
    }
  }
)

export const toggleFavoriteThunk = createAsyncThunk(
  'auth/toggleFavorite',
  async (propertyId, { rejectWithValue }) => {
    try {
      const data = await favoritesAPI.toggle(propertyId)
      return { propertyId, favorited: data.favorited }
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: (() => {
    const token = localStorage.getItem('token')
    // لو في توكن، خلي isLoggedIn = true مبدئياً حتى ما يصير redirect للـ login
    return {
      user:       null,
      isLoggedIn: !!token,
      role:       null,
      favorites:  [],
      loading:    false,
      error:      null,
    }
  })(),
  reducers: {
    logout(state) {
      state.user       = null
      state.isLoggedIn = false
      state.role       = null
      state.favorites  = []
      localStorage.removeItem('token')
    },
    clearError(state) { state.error = null },
    // يُبقي على demoLogin للاختبار السريع
    demoLogin(state, { payload: role }) {
      const users = {
        client: { id: 10, name: 'محمد أحمد',   email: 'client@demo.ps', role: 'client', avatar: 'مأ' },
        admin:  { id: 1,  name: 'مدير النظام', email: 'admin@aqar.ps',  role: 'admin',  avatar: 'A' },
      }
      state.user       = users[role]
      state.isLoggedIn = true
      state.role       = role
    },
    // للتوافق مع الكود القديم
    loginSuccess(state, { payload }) {
      state.user       = payload
      state.isLoggedIn = true
      state.role       = payload.role
      state.error      = null
    },
    // toggleFavorite المحلي (يُبقي عليه للتوافق مع PropertyCard)
    toggleFavorite(state, { payload: propId }) {
      const idx = state.favorites.indexOf(propId)
      if (idx === -1) state.favorites.push(propId)
      else state.favorites.splice(idx, 1)
    },
    setLoading(state, { payload }) { state.loading = payload },
    setError(state, { payload })   { state.error = payload },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(loginUser.fulfilled, (s, { payload }) => {
        s.loading   = false
        s.user      = payload
        s.isLoggedIn = true
        s.role      = payload.role?.toLowerCase()
      })
      .addCase(loginUser.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })

    // Register
    builder
      .addCase(registerUser.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(registerUser.fulfilled, (s, { payload }) => {
        s.loading   = false
        s.user      = payload
        s.isLoggedIn = true
        s.role      = payload.role?.toLowerCase()
      })
      .addCase(registerUser.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })

    // Fetch Me
    builder
      .addCase(fetchCurrentUser.fulfilled, (s, { payload }) => {
        s.user      = payload
        s.isLoggedIn = true
        s.role      = payload.role?.toLowerCase()
        s.favorites = payload.favorites?.map(f => f.propertyId) || []
      })
      .addCase(fetchCurrentUser.rejected, (s) => {
        // فقط امسح الـ state لو ما في توكن (يعني الخطأ 401 حقيقي)
        if (!localStorage.getItem('token')) {
          s.user = null; s.isLoggedIn = false; s.role = null; s.favorites = []
        }
      })

    // Toggle favorite (API)
    builder.addCase(toggleFavoriteThunk.fulfilled, (s, { payload }) => {
      const { propertyId, favorited } = payload
      if (favorited) {
        if (!s.favorites.includes(propertyId)) s.favorites.push(propertyId)
      } else {
        s.favorites = s.favorites.filter(id => id !== propertyId)
      }
    })
  },
})

export const { logout, clearError, demoLogin, loginSuccess, toggleFavorite, setLoading, setError } = authSlice.actions
export default authSlice.reducer