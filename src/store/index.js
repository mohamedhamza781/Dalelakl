import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import propertiesReducer from './slices/propertiesSlice'
import uiReducer from './slices/uiSlice'




export const store = configureStore({
  reducer: {
    auth: authReducer,
    properties: propertiesReducer,
    ui: uiReducer,
  },
})