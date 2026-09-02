// ============================================================
//  src/lib/api.js  —  طبقة التواصل مع الباك إند
// ============================================================

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const getToken = () => localStorage.getItem('token')

async function request(endpoint, options = {}) {
  const token = getToken()
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  }
  const response = await fetch(`${BASE_URL}${endpoint}`, config)
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'حدث خطأ في الشبكة' }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }
  return response.json()
}

const get  = (url, opts) => request(url, { method: 'GET', ...opts })
const post = (url, body) => request(url, { method: 'POST',   body: JSON.stringify(body) })
const put  = (url, body) => request(url, { method: 'PUT',    body: JSON.stringify(body) })
const del  = (url)       => request(url, { method: 'DELETE' })

// AUTH
export const authAPI = {
  login:          (email, password) => post('/auth/login', { email, password }),
  register:       (data)            => post('/auth/register', data),
  getMe:          ()                => get('/auth/me'),
  updateProfile:  (data)            => put('/auth/profile', data),
  changePassword: (data)            => put('/auth/change-password', data),
  deleteAccount:  ()                => del('/auth/me'),
  uploadAvatar:   async (file)      => {
    const token = getToken()
    const formData = new FormData()
    formData.append('image', file)
    const response = await fetch(`${BASE_URL}/upload/image`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'خطأ في الرفع' }))
      throw new Error(error.message)
    }
    return response.json()
  },
}

// PROPERTIES
export const propertiesAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') params.append(k, v)
    })
    return get(`/properties?${params.toString()}`)
  },
  getById:     (slugOrId) => get(`/properties/${slugOrId}`),
  getFeatured: (filters = {}) => {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '' && v !== 'all') params.append(k, v)
    })
    const qs = params.toString()
    return get(`/properties/featured${qs ? `?${qs}` : ''}`)
  },
  getStats:    ()         => get('/properties/stats'),
  create:      (data)     => post('/properties', data),
  update:      (id, data) => put(`/properties/${id}`, data),
  delete:      (id)       => del(`/properties/${id}`),
}

// FAVORITES
export const favoritesAPI = {
  getAll: ()    => get('/favorites'),
  toggle: (id)  => post(`/favorites/${id}/toggle`),
}

// SUBSCRIPTIONS
export const subscriptionAPI = {
  getMy:   ()     => get('/subscriptions'),
  upgrade: (data) => post('/subscriptions/upgrade', data),
  cancel:  ()     => post('/subscriptions/cancel'),
}

// PAYMENT
export const paymentAPI = {
  createIntent: (planId, billing) => post('/payment/create-intent', { planId, billing }),
  getHistory:   ()                => get('/payment/history'),
}

// CONTACT
export const contactAPI = {
  submit:      (data) => post('/contact', data),
  getMessages: ()     => get('/contact'),
  markAsRead:  (id)   => request(`/contact/${id}/read`, { method: 'PUT' }),
}

// ADMIN
export const adminAPI = {
  getStats:            ()         => get('/admin/stats'),
  getActivities:       (params)   => get(`/admin/activities?${new URLSearchParams(params)}`),
  getUsers:            (params)   => get(`/admin/users?${new URLSearchParams(params)}`),
  deleteUser:          (id)       => del(`/admin/users/${id}`),
  toggleBlockUser:     (id)       => request(`/admin/users/${id}/block`, { method: 'PATCH' }),
  getAllProperties:     (params)   => get(`/admin/properties?${new URLSearchParams(params)}`),
  updatePropertyFlags: (id, data) => put(`/admin/properties/${id}`, data),
}

// UPLOAD
export const uploadAPI = {
  uploadImage: async (file) => {
    const token = getToken()
    const formData = new FormData()
    formData.append('image', file)
    const response = await fetch(`${BASE_URL}/upload/image`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'حدث خطأ في الشبكة' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    return response.json()
  },
  uploadImages: async (files) => {
    const token = getToken()
    const formData = new FormData()
    files.forEach(f => formData.append('images', f))
    const response = await fetch(`${BASE_URL}/upload/images`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData,
    })
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'حدث خطأ في الشبكة' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }
    return response.json()
  },
}

// SETTINGS
export const settingsAPI = {
  getPublic:  ()           => get('/settings/public'),
  getAll:     ()           => get('/settings'),
  update:     (key, value) => request(`/settings/${key}`, { method: 'PATCH', body: JSON.stringify({ value }) }),
  updateMany: (settings)   => put('/settings', { settings }),
}

// NEIGHBORHOODS ✅
export const neighborhoodsAPI = {
  getPublic: ()         => get('/neighborhoods/public'),
  getAll:    ()         => get('/neighborhoods'),
  create:    (data)     => post('/neighborhoods', data),
  update:    (id, data) => request(`/neighborhoods/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete:    (id)       => del(`/neighborhoods/${id}`),
  reorder:   (order)    => put('/neighborhoods/reorder', { order }),
}

// REPORTS
export const teamAPI = {
  getPublic:    ()         => get('/team/public'),
  getAll:       ()         => get('/team'),
  create:       (data)     => post('/team', data),
  update:       (id, data) => put(`/team/${id}`, data),
  delete:       (id)       => del(`/team/${id}`),
  reorder:      (order)    => post('/team/reorder', { order }),
}

export const reportsAPI = {
  submit: (data)      => post('/reports', data),
  getAll: (params)    => get(`/reports?${new URLSearchParams(params)}`),
  updateStatus: (id, status) => request(`/reports/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id)        => del(`/reports/${id}`),
}

export default { authAPI, propertiesAPI, favoritesAPI, subscriptionAPI, paymentAPI, contactAPI, adminAPI, uploadAPI, settingsAPI, neighborhoodsAPI, reportsAPI }