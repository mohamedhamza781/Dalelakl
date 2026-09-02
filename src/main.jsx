import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App from './App'
import './index.css'
import './lib/i18n'
import { fetchCurrentUser } from './store/slices/authSlice'

// استعادة جلسة المستخدم عند تحميل التطبيق
const token = localStorage.getItem('token')
if (token) {
  store.dispatch(fetchCurrentUser())
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
)
