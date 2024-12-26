import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { fetchLeaves, addLeave, updateLeave, deleteLeave, addAdmin } from '../api';
import jwt from 'jsonwebtoken';

const AdminDashboard = ({ token, leaves, setLeaves, loading, errorMessage }) => {
  const [formData, setFormData] = useState({
    idNumber: '',
    servicecode: '',
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
  const [adminFormData, setAdminFormData] = useState({
    idNumber: '',
    password: ''
  });
  const [fetchIdNumber, setFetchIdNumber] = useState('');
  const [editingLeave, setEditingLeave] = useState(null); // حالة التعديل
  const [editingValue, setEditingValue] = useState(''); // قيمة التعديل
  const [sendSMS, setSendSMS] = useState(false); // خيار إرسال الرسالة

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdminInputChange = (e) => {
    setAdminFormData({ ...adminFormData, [e.target.name]: e.target.value });
  };

  const handleEditChange = (e) => {
    setEditingValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء");
      return;
    }

    const leaveDuration = Math.ceil((new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24));
    const updatedFormData = { ...formData, leaveDuration, sendSMS }; // تضمين خيار إرسال الرسالة

    try {
      const data = await addLeave(updatedFormData);
      setLeaves(prevLeaves => [...prevLeaves, data]);
      setNewServiceCode(data.servicecode);
      resetForm();
      alert(sendSMS ? "تم رفع الإجازة وإرسال الرسالة بنجاح!" : "تم رفع الإجازة بنجاح!");
    } catch (error) {
      console.error('Error adding leave:', error);
      alert("فشل في إضافة الإجازة");
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      await addAdmin(adminFormData);
      alert("تم إضافة المشرف الجديد بنجاح!");
      resetAdminForm();
    } catch (error) {
      console.error('Error adding admin:', error);
      alert("فشل في إضافة المشرف الجديد");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteLeave(id);
      setLeaves(prevLeaves => prevLeaves.filter(leave => leave._id !== id));
    } catch (error) {
      console.error('فشل في حذف الإجازة', error);
    }
  };

  const handleUpdate = async (id) => {
    try {
      await updateLeave(id, editingValue);
      setLeaves(prevLeaves =>
        prevLeaves.map(leave => (leave._id === id ? { ...leave, ...editingValue } : leave))
      );
      setEditingLeave(null);
      alert("تم تحديث الإجازة بنجاح!");
    } catch (error) {
      console.error('فشل في تحديث الإجازة', error);
    }
  };

  const startEditing = (leave) => {
    setEditingLeave(leave._id);
    setEditingValue(leave);
  };

  const cancelEditing = () => {
    setEditingLeave(null);
    setEditingValue('');
  };

  const loadLeaves = useCallback(async () => {
    try {
      const data = await fetchLeaves(fetchIdNumber);
      setLeaves(data);
    } catch (error) {
      console.error('Error fetching leaves:', error);
    }
  }, [fetchIdNumber, setLeaves]);

  const resetForm = () => {
    setFormData({
      idNumber: '',
      servicecode: '',
      name: '',
      issueDate: '',
      startDate: '',
      endDate: '',
      leaveDuration: '',
      doctorName: '',
      jobTitle: '',
      phoneNumber: '' // إعادة تعيين حقل رقم الهاتف
    });
    setSendSMS(false); // إعادة تعيين خيار إرسال الرسالة
  };

  const resetAdminForm = () => {
    setAdminFormData({
      idNumber: '',
      password: ''
    });
  };

  const isAdmin = token && jwt.decode(token)?.isAdmin;

  if (!isAdmin) {
    return <h2>لا تملك صلاحيات الوصول إلى هذه الصفحة.</h2>;
  }

  return (
    <div className="admin-dashboard">
      <div className="buttons-container">
        <button onClick={() => setNewServiceCode('addLeave')}>إضافة إجازة</button>
        <button onClick={() => setNewServiceCode('manageLeaves')}>إدارة الإجازات</button>
        <button onClick={() => setNewServiceCode('addAdmin')}>إضافة مُشرِف</button>
      </div>
      {newServiceCode === 'addLeave' && (
        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="idNumber">رقم الهوية أو الإقامة</label>
            <input type="text" id="idNumber" name="idNumber" value={formData.idNumber} onChange={handleInputChange} placeholder="رقم الهوية أو الإقامة" required />
          </div>
          <div>
            <label htmlFor="servicecode">رمز الخدمة</label>
            <input type="text" id="servicecode" name="servicecode" value={formData.servicecode} onChange={handleInputChange} placeholder="رمز الخدمة" required />
          </div>
          <div>
            <label htmlFor="name">الاسم</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder="الاسم" required />
          </div>
          <div>
            <label htmlFor="issueDate">تاريخ إصدار تقرير الإجازة</label>
            <input type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleInputChange} placeholder="تاريخ إصدار تقرير الإجازة" required />
          </div>
          <div>
            <label htmlFor="startDate">تبدأ من</label>
            <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleInputChange} placeholder="تبدأ من" required />
          </div>
          <div>
            <label htmlFor="endDate">وحتى</label>
            <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleInputChange} placeholder="وحتى" required />
          </div>
          <div>
            <label htmlFor="leaveDuration">مدة أيام الإجازة</label>
            <input type="number" id="leaveDuration" name="leaveDuration" value={formData.leaveDuration} onChange={handleInputChange} placeholder="مدة أيام الإجازة" required />
          </div>
          <div>
            <label htmlFor="doctorName">اسم الطبيب المعالج</label>
            <input type="text" id="doctorName" name="doctorName" value={formData.doctorName} onChange={handleInputChange} placeholder="اسم الطبيب المعالج" required />
          </div>
          <div>
            <label htmlFor="jobTitle">المسمى الوظيفي</label>
            <input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="المسمى الوظيفي" required />
          </div>
          <div>
            <label htmlFor="phoneNumber">رقم الهاتف</label>
            <input type="text" id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} placeholder="رقم الهاتف" required />
          </div>
          <div>
            <label>هل تريد إرسال رسالة لهذا المستخدم؟</label>
            <div>
              <label>
                <input
                  type="radio"
                  name="sendSMS"
                  value={true}
                  checked={sendSMS === true}
                  onChange={() => setSendSMS(true)}
                />
                نعم
              </label>
              <label>
                <input
                  type="radio"
                  name="sendSMS"
                  value={false}
                  checked={sendSMS === false}
                  onChange={() => setSendSMS(false)}
                />
                لا
              </label>
            </div>
          </div>
           <button type="submit" disabled={loading}>إضافة الإجازة</button>
        </form>
      )}
      {newServiceCode === 'manageLeaves' && (
        <div>
          <input type="text" placeholder="أدخل رقم الهوية" onChange={(e) => setFetchIdNumber(e.target.value)} />
          <input type="text" placeholder="أدخل رمز الخدمة" onChange={(e) => setFormData({ ...formData, servicecode: e.target.value })} />
          <button onClick={loadLeaves}>جلب الإجازات</button>
          <ul>
            {leaves.map(leave => (
              <li key={leave._id}>
                {leave.name} - {new Date(leave.startDate).toLocaleDateString('en-GB')} إلى {new Date(leave.endDate).toLocaleDateString('en-GB')}
                {editingLeave === leave._id ? (
                  <div>
                    <input type="text" name="name" value={editingValue.name} onChange={handleEditChange} />
                    <button onClick={() => handleUpdate(leave._id)}>تحديث</button>
                    <button onClick={cancelEditing}>إلغاء</button>
                  </div>
                ) : (
                  <>
                    <button onClick={() => startEditing(leave)}>تعديل</button>
                    <button onClick={() => handleDelete(leave._id)}>حذف</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      {newServiceCode === 'addAdmin' && (
        <form onSubmit={handleAdminSubmit}>
          <div>
            <label htmlFor="adminIdNumber">رقم الهوية</label>
            <input type="text" id="adminIdNumber" name="idNumber" value={adminFormData.idNumber} onChange={handleAdminInputChange} placeholder="رقم الهوية" required />
          </div>
          <div>
            <label htmlFor="adminPassword">كلمة المرور</label>
            <input type="password" id="adminPassword" name="password" value={adminFormData.password} onChange={handleAdminInputChange} placeholder="كلمة المرور" required />
          </div>
          <button type="submit" disabled={loading}>إضافة مشرف</button>
        </form>
      )}
      {newServiceCode && <p>تم إنشاء كود الخدمة بنجاح: {newServiceCode}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}
    </div>
  );
};

AdminDashboard.propTypes = {
  token: PropTypes.string.isRequired,
  leaves: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      issueDate: PropTypes.string.isRequired,
      startDate: PropTypes.string.isRequired,
      endDate: PropTypes.string.isRequired,
      leaveDuration: PropTypes.number.isRequired,
      doctorName: PropTypes.string.isRequired,
      jobTitle: PropTypes.string.isRequired
    })
  ).isRequired,
  setLeaves: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string
};

export default AdminDashboard;