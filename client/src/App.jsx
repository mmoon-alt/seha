import { useState, useEffect, useCallback, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Header from './components/Header.jsx';
import Login from './components/Login.jsx';
import DataDisplay from './components/DataDisplay.jsx';
import Footer from './components/Footer.jsx';
import AdminDashboard from './components/AdminDashboard.jsx';
import './App.css';
import { addLeave, updateLeave, deleteLeave, fetchLeaves, login } from './api';
import jwt from 'jsonwebtoken';

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};

const App = () => {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [formData, setFormData] = useState({
    idNumber: '',
    name: '',
    issueDate: '',
    startDate: '',
    endDate: '',
    leaveDuration: '',
    doctorName: '',
    jobTitle: '',
    phoneNumber: '' // إضافة حقل رقم الهاتف
  });
  const [newServiceCode, setNewServiceCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [servicecode, setServicecode] = useState('');
  const navigate = useNavigate();

  const previousIdNumber = usePrevious(idNumber);
  const previousServicecode = usePrevious(servicecode);

  const handleLoginSuccess = useCallback(async (token, idNumber, servicecode, role) => {
    if (role === 'admin') {
      setToken(token);
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      navigate("/admin-dashboard");
    } else {
      try {
        const leavesData = await fetchLeaves(idNumber, servicecode, token);
        console.log('Fetched leaves:', leavesData);
        setLeaves(leavesData);
        setIdNumber(idNumber);
        setServicecode(servicecode);
        navigate("/data-display");
      } catch (error) {
        setErrorMessage('فشل في جلب بيانات الإجازات');
        console.error('Error fetching leaves:', error);
      }
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء");
      return;
    }

    const leaveDuration = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24));
    const updatedFormData = { ...formData, leaveDuration };

    try {
      const data = await addLeave(updatedFormData, token);
      setLeaves(prevLeaves => [...prevLeaves, data]);
      setNewServiceCode(data.servicecode);
      resetForm();
      alert("تم رفع الإجازة بنجاح!");
    } catch (err) {
      setErrorMessage('فشل في إضافة الإجازة');
      console.error(err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLeave(id, token);
      setLeaves(prevLeaves => prevLeaves.filter(leave => leave.id !== id));
    } catch (error) {
      setErrorMessage('فشل في حذف الإجازة');
      console.error(error.message);
    }
  };

  const handleUpdate = async (id, updatedLeave) => {
    try {
      const updatedData = await updateLeave(id, updatedLeave, token);
      setLeaves(prevLeaves => prevLeaves.map(leave => (leave.id === id ? updatedData : leave)));
      setNewServiceCode(updatedData.servicecode);
    } catch (error) {
      setErrorMessage('فشل في تحديث الإجازة');
      console.error(error.message);
    }
  };

  const loadLeaves = useCallback(async (idNumber, servicecode) => {
    try {
      if (!idNumber || !servicecode) {
        throw new Error('رقم الهوية ورمز الخدمة مطلوبان');
      }
      setLoading(true);
      const data = await fetchLeaves(idNumber, servicecode, token);
      setLeaves(data);
      setLoading(false);
    } catch (error) {
      setErrorMessage(`Error fetching leaves: ${error.message}`);
      console.error(error.message);
      setLoading(false);
    }
  }, [token]);

  const resetForm = () => {
    setFormData({
      idNumber: '',
      name: '',
      issueDate: '',
      startDate: '',
      endDate: '',
      leaveDuration: '',
      doctorName: '',
      jobTitle: '',
      phoneNumber: ''
    });
  };

  const isAdmin = token && jwt.decode(token)?.isAdmin;

  useEffect(() => {
    const now = new Date();
    const newFilteredLeaves = leaves.filter(leave => {
      const leaveEndDate = new Date(leave.endDate);
      const leaveDuration = Math.ceil((leaveEndDate - new Date(leave.startDate)) / (1000 * 60 * 60 * 24));
      const expirationDate = new Date(leaveEndDate);
      expirationDate.setDate(expirationDate.getDate() + (leaveDuration === 1 ? 3 : leaveDuration === 2 ? 5 : leaveDuration + 3));
      return now <= expirationDate;
    });

    setFilteredLeaves(newFilteredLeaves);
  }, [leaves]);

  useEffect(() => {
    // لا تفعل شيئًا عند تشغيل التطبيق تلقائيًا
  }, []);

  return (
    <div className="app-container">
      <Header />
      {errorMessage && (
        <div className="error">
          {errorMessage}
        </div>
      )}
      <div className="content">
        <Routes>
          <Route path="/" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/auth/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
          <Route path="/data-display" element={<DataDisplay idNumber={idNumber} servicecode={servicecode} />} />
          <Route
            path="/admin-dashboard"
            element={
              isAdmin ? (
                <AdminDashboard
                  token={token}
                  leaves={filteredLeaves}
                  setLeaves={setLeaves}
                  loading={loading}
                  errorMessage={errorMessage}
                  handleInputChange={handleInputChange}
                  handleSubmit={handleSubmit}
                  handleDelete={handleDelete}
                  handleUpdate={handleUpdate}
                  servicecode={newServiceCode}
                />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/table.html" element={<div />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;