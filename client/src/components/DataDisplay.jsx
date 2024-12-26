import PropTypes from 'prop-types';
import './DataDisplay.css';
import { useEffect, useState } from 'react';
import { fetchLeaves } from '../api';

const DataDisplay = ({ idNumber, servicecode }) => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!idNumber || !servicecode) {
        setError('رقم الهوية ورمز الخدمة مطلوبان');
        setLoading(false);
        return;
      }
      try {
        const leavesData = await fetchLeaves(idNumber, servicecode);
        console.log('Data fetched successfully:', leavesData);
        setLeaves(leavesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('فشل في جلب البيانات');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [idNumber, servicecode]);

  if (loading) {
    return <div>جارِ التحميل...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const formatDate = (date) => {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(date).toLocaleDateString('en-GB', options).split('/').reverse().join('-');
  };

  return (
    <div className="data-container-wrapper">
      <div>
      <h1 className="h1"><span className="highlight">الإجازات المرضية</span></h1>
        <p className="subtitle">
          خدمة الاستعلام عن الإجازات المرضية تتيح لك الاستعلام عن حالة طلبك للإجازة ويمكنك طباعتها عن طريق تطبيق صحتي
        </p>

        <div className="input-container">
          <input
            type="text"
            id="servicecode"
            className="input-field"
            placeholder="كلمة المرور"
            value={servicecode}
            readOnly
          />
          <input
            type="text"
            id="idNumber"
            className="input-field"
            placeholder="رقم الهوية / الإقامة"
            value={idNumber}
            readOnly
          />
        </div>
      </div>
      <div className="data-container" id="dataContainer">
        {leaves.length === 0 ? (
          <div>لا توجد بيانات إجازة للمستخدم.</div>
        ) : (
          leaves.map((data) => (
            <div key={data._id} className="data-item">
              <span className="data-label">الاسم:</span>
              <span id="name">{data.name}</span>
              <span className="data-label">تاريخ إصدار تقرير الإجازة:</span>
              <span id="issueDate">{formatDate(data.issueDate)}</span>
              <span className="data-label">تبدأ من:</span>
              <span id="startDate">{formatDate(data.startDate)}</span>
              <span className="data-label">وحتى:</span>
              <span id="endDate">{formatDate(data.endDate)}</span>
              <span className="data-label">مدة أيام الإجازة:</span>
              <span id="leaveDuration">{data.leaveDuration}</span>
              <span className="data-label">اسم الطبيب المعالج:</span>
              <span id="doctorName">{data.doctorName}</span>
              <span className="data-label">المسمى الوظيفي:</span>
              <span id="jobTitle">{data.jobTitle}</span>
            </div>
          ))
        )}
      </div>
      <div className="button-container">
        <a href="login" className="button">استعلام جديد</a>
        <a href="https://www.seha.sa/ui#/inquiries" className="button">الرجوع إلى الاستعلامات</a>
      </div>
    </div>
  );
};

DataDisplay.propTypes = {
  idNumber: PropTypes.string.isRequired,
  servicecode: PropTypes.string.isRequired,
};

export default DataDisplay;