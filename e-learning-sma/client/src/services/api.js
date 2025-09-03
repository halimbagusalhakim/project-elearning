import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

// Timeout configuration (30 seconds)
const API_TIMEOUT = 30000;

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  // Remove default Content-Type header to allow multipart/form-data to be set automatically
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and other errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Enhanced error handling
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('API request timed out');
      error.isTimeout = true;
      error.userMessage = 'Permintaan terlalu lama. Silakan coba lagi.';
    } else if (!error.response) {
      console.error('Network error - no response received');
      error.isNetworkError = true;
      error.userMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else if (error.response.status >= 500) {
      console.error('Server error:', error.response.status);
      error.isServerError = true;
      error.userMessage = 'Terjadi kesalahan pada server. Silakan coba lagi nanti.';
    } else if (error.response.status >= 400) {
      console.error('Client error:', error.response.status);
      error.userMessage = error.response.data?.error || 'Terjadi kesalahan. Silakan coba lagi.';
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
};

// Classes API
export const classesAPI = {
  getAll: () => api.get('/classes'),
  getById: (id) => api.get(`/classes/${id}`),
  create: (classData) => api.post('/classes', classData),
  update: (id, classData) => api.put(`/classes/${id}`, classData),
  delete: (id) => api.delete(`/classes/${id}`),
  getTeacherClasses: () => api.get('/classes/teacher'),

  // Student registration
  registerForClass: (kode_kelas) => api.post('/classes/register', { kode_kelas }),
  getStudentRegistrations: () => api.get('/classes/student/registrations'),

  // Teacher registration management
  getPendingRegistrations: (classId) => api.get(`/classes/${classId}/registrations/pending`),
  getApprovedStudents: (classId) => api.get(`/classes/${classId}/students/approved`),
  approveRegistration: (registrationId) => api.put(`/classes/registrations/${registrationId}/approve`),
  rejectRegistration: (registrationId) => api.put(`/classes/registrations/${registrationId}/reject`),
  removeStudent: (registrationId) => api.delete(`/classes/registrations/${registrationId}`),
};

// Materials API
export const materialsAPI = {
  getByClass: (classId) => api.get(`/materials/class/${classId}`),
  getById: (id) => api.get(`/materials/${id}`),
  create: (materialData) => api.post('/materials', materialData),
  update: (id, materialData) => api.put(`/materials/${id}`, materialData),
  delete: (id) => api.delete(`/materials/${id}`),
  getRecent: () => api.get('/materials/recent'),
  getStudentMaterials: () => api.get('/materials/student'),
};

// Assignments API
export const assignmentsAPI = {
  getByClass: (classId) => api.get(`/assignments/class/${classId}`),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (assignmentData, config = {}) => api.post('/assignments', assignmentData, config),
  update: (id, assignmentData, config = {}) => api.put(`/assignments/${id}`, assignmentData, config),
  delete: (id) => api.delete(`/assignments/${id}`),
  getUpcoming: () => api.get('/assignments/upcoming'),
  getOverdue: () => api.get('/assignments/overdue'),
  getTeacherAssignments: () => api.get('/assignments/teacher'),


  // Student-specific endpoints
  getStudentAssignments: () => api.get('/assignments/student'),

  // Get assignments with grades for student filtered by class
  getStudentClassGrades: (classId) => api.get(`/assignments/student/class/${classId}`),
};

// Submissions API
export const submissionsAPI = {
  getByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  getById: (id) => api.get(`/submissions/${id}`),
  create: (submissionData, config = {}) => api.post('/submissions', submissionData, config),
  update: (id, submissionData, config = {}) => api.put(`/submissions/${id}`, submissionData, config),
  grade: (id, gradeData) => api.put(`/submissions/${id}/grade`, gradeData),
  delete: (id) => api.delete(`/submissions/${id}`),
};

export default api;
