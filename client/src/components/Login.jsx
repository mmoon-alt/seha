import { useState } from 'react';
import PropTypes from 'prop-types';
import { login } from '../api';
import './Login.css';

const Login = ({ onLoginSuccess }) => {
  const [idNumber, setIdNumber] = useState('');
  const [servicecode, setServiceCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    if (!idNumber || !servicecode) {
      setErrorMessage('فضلاً أدخل رقم الهوية وكلمة المرور');
      setLoading(false);
      return;
    }

    try {
      const response = await login(idNumber, servicecode);
      onLoginSuccess(response.token, idNumber, servicecode, response.role);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h1 className="h1"><span className="highlight">الإجازات المرضية</span></h1>
      <h2 className='h2'>خدمة الاستعلام عن الإجازات المرضية تتيح لك الاستعلام عن حالة طلبك للإجازة ويمكنك طباعتها عن طريق تطبيق صحتي</h2>
      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="input-group-1">
            <input
              type="text"
              id="idNumber"
              placeholder="رقم الهوية / الإقامة"
              value={idNumber}
              onChange={(e) => setIdNumber(e.target.value)}
              required
            />
          </div>
          <div className="input-group-2">
            <input
              type="password"
              id="servicecode"
              placeholder="رمز الخدمة"
              value={servicecode}
              onChange={(e) => setServiceCode(e.target.value)}
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          <button type="submit" disabled={loading}>
            {loading ? 'جاري تسجيل الدخول...' : 'استعلام'}
          </button>
          <button type="button" onClick={() => window.location.reload()}>
            استعلام جديد
          </button>
          <div
            className="password-recovery"
            onClick={() => {
              setIdNumber('');
              setServiceCode('');
              setErrorMessage('');
            }}
            style={{ cursor: 'pointer', color: '#366fb5', marginTop: '10px'}}
          >
            إستعادة كلمة المرور
          </div>
        </form>
      </div>
    </div>
  );
};

Login.propTypes = {
  onLoginSuccess: PropTypes.func.isRequired,
};

export default Login;

