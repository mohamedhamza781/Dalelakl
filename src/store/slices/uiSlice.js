import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    toast: null,
    lang: 'ar',
    mobileMenuOpen: false,
    searchDrawerOpen: false,
  },
  reducers: {
    showToast(state, { payload }) {
      state.toast = typeof payload === 'string' ? { msg: payload, type: 'success' } : payload
    },
    clearToast(state) { state.toast = null },
    toggleLang(state) {
      state.lang = state.lang === 'ar' ? 'en' : 'ar'
      document.documentElement.lang = state.lang
      document.documentElement.dir = state.lang === 'ar' ? 'rtl' : 'ltr'
    },
    toggleMobileMenu(state) { state.mobileMenuOpen = !state.mobileMenuOpen },
    closeMobileMenu(state) { state.mobileMenuOpen = false },
  },
})

export const { showToast, clearToast, toggleLang, toggleMobileMenu, closeMobileMenu } = uiSlice.actions
export default uiSlice.reducer
