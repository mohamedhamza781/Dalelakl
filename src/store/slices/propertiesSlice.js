import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { propertiesAPI } from '@/lib/api'

// ── Async Thunks ─────────────────────────────────────────────

export const fetchProperties = createAsyncThunk(
  'properties/fetchAll',
  async (filters, { rejectWithValue }) => {
    try {
      const data = await propertiesAPI.getAll(filters)
      return data
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchProperty = createAsyncThunk(
  'properties/fetchOne',
  async (slugOrId, { rejectWithValue }) => {
    try {
      const data = await propertiesAPI.getById(slugOrId)
      return data.property
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const fetchFeatured = createAsyncThunk(
  'properties/fetchFeatured',
  async (_, { rejectWithValue }) => {
    try {
      const data = await propertiesAPI.getFeatured()
      return data.properties
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const createProperty = createAsyncThunk(
  'properties/create',
  async (propertyData, { rejectWithValue }) => {
    try {
      const data = await propertiesAPI.create(propertyData)
      return data.property
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const deleteProperty = createAsyncThunk(
  'properties/delete',
  async (id, { rejectWithValue }) => {
    try {
      await propertiesAPI.delete(id)
      return id
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const updateProperty = createAsyncThunk(
  'properties/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await propertiesAPI.update(id, data)
      return res.property
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

// ── Slice ─────────────────────────────────────────────────────
const propertiesSlice = createSlice({
  name: 'properties',
  initialState: {
    all:      [],
    filtered: [],
    featured: [],
    current:  null,
    total:    0,
    pages:    1,
    page:     1,
    filters: {
      search:   '',
      category: 'all',
      type:     'all',
      city:     'all',
      rooms:    'all',
      maxPrice: 2000000,
      minArea:  0,
    },
    sortBy:   'newest',
    viewMode: 'grid',
    loading:  false,
    error:    null,
  },
  reducers: {
    setFilters(state, { payload }) {
      state.filters = { ...state.filters, ...payload }
    },
    resetFilters(state) {
      state.filters = {
        search: '', category: 'all', type: 'all',
        city: 'all', rooms: 'all', maxPrice: 2000000, minArea: 0,
      }
    },
    setSortBy(state, { payload })   { state.sortBy = payload },
    setViewMode(state, { payload }) { state.viewMode = payload },
    setCurrent(state, { payload })  { state.current = payload },
    clearCurrent(state)             { state.current = null },
    setPage(state, { payload })     { state.page = payload },
  },
  extraReducers: (builder) => {
    // Fetch all
    builder
      .addCase(fetchProperties.pending,   (s) => { s.loading = true; s.error = null })
      .addCase(fetchProperties.fulfilled, (s, { payload }) => {
        s.loading  = false
        s.all      = payload.properties
        s.filtered = payload.properties
        s.total    = payload.total
        s.pages    = payload.pages
        s.page     = payload.page
      })
      .addCase(fetchProperties.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })

    // Fetch one
    builder
      .addCase(fetchProperty.pending,   (s) => { s.loading = true })
      .addCase(fetchProperty.fulfilled, (s, { payload }) => { s.loading = false; s.current = payload })
      .addCase(fetchProperty.rejected,  (s, { payload }) => { s.loading = false; s.error = payload })

    // Featured
    builder.addCase(fetchFeatured.fulfilled, (s, { payload }) => { s.featured = payload })

    // Create
    builder.addCase(createProperty.fulfilled, (s, { payload }) => {
      s.all.unshift(payload)
      s.filtered.unshift(payload)
    })

    // Delete
    builder.addCase(deleteProperty.fulfilled, (s, { payload: id }) => {
      s.all      = s.all.filter(p => p.id !== id)
      s.filtered = s.filtered.filter(p => p.id !== id)
    })

    // Update
    builder.addCase(updateProperty.fulfilled, (s, { payload }) => {
      const idx = s.all.findIndex(p => p.id === payload.id)
      if (idx !== -1) s.all[idx] = payload
      const idx2 = s.filtered.findIndex(p => p.id === payload.id)
      if (idx2 !== -1) s.filtered[idx2] = payload
      if (s.current?.id === payload.id) s.current = payload
    })
  },
})

export const {
  setFilters, resetFilters, setSortBy, setViewMode,
  setCurrent, clearCurrent, setPage,
} = propertiesSlice.actions
export default propertiesSlice.reducer
