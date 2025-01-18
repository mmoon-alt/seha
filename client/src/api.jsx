import axios from 'axios';

const API_URL = 'https://seha.work/api';
const AUTH_URL = 'https://seha.work/auth';

// توكين المستخدم
const getToken = () => localStorage.getItem('token');

export const login = async (idNumber, servicecode) => {
  try {
    const response = await axios.post(`${AUTH_URL}/login`, { idNumber, servicecode });
    const { token, role } = response.data;

    // تخزين التوكن والدور إذا كان المستخدم مشرف
    if (role === 'admin') {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
    }

    return response.data; // إعادة التوكن والدور
  } catch (error) {
    throw new Error(`فشل في تسجيل الدخول: ${error.response ? error.response.data.message : error.message}`);
  }
};

export const fetchLeaves = async (idNumber, servicecode) => {
  const token = getToken();
  console.log('Fetching leaves with:', { idNumber, servicecode });

  try {
    const response = await axios.get(`${API_URL}/user-leaves`, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { idNumber, servicecode }
    });

    // مراجعة البيانات المستلمة
    console.log('Received leaves:', response.data);

    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      throw new Error('رقم الهوية ورمز الخدمة مطلوبان');
    } else if (error.response && error.response.status === 404) {
      throw new Error('لم يتم العثور على إجازات للمستخدم');
    } else {
      throw new Error(`فشل في تحميل الإجازات: ${error.response ? error.response.data.message : error.message}`);
    }
  }
};

export const addLeave = async (leave) => {
  const token = getToken();
  try {
    const response = await axios.post(`${API_URL}/leaves`, leave, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`فشل في إضافة الإجازة: ${error.response ? error.response.data.message : error.message}`);
  }
};

export const updateLeave = async (id, leave) => {
  const token = getToken();
  try {
    const response = await axios.put(`${API_URL}/leaves/${id}`, leave, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw new Error(`فشل في تحديث الإجازة: ${error.response ? error.response.data.message : error.message}`);
  }
};

export const deleteLeave = async (id) => {
  const token = getToken();
  try {
    const response = await axios.delete(`${API_URL}/leaves/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(`فشل في حذف الإجازة: ${error.response ? error.response.data.message : error.message}`);
  }
};

export const addAdmin = async (adminData) => {
  const token = getToken();
  try {
    const response = await axios.post(`${AUTH_URL}/add-admin`, adminData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    throw new Error(`فشل في إضافة المشرف: ${error.response ? error.response.data.message : error.message}`);
  }
};

const ensureUserExists = async (idNumber, servicecode) => {
  const token = getToken();
  try {
    await axios.get(`${API_URL}/User/${idNumber}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  } catch (error) {
    if (error.response && error.response.status === 404) {
      await axios.post(`${API_URL}/User`, {
        idNumber,
        servicecode,
        isAdmin: false
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } else {
      throw new Error(`فشل في التحقق من وجود المستخدم: ${error.response ? error.response.data.message : error.message}`);
    }
  }
};