import { Link } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const toggleMenu = () => {
        const menu = document.getElementById('menuDropdown');
        menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
    };

    return (
        <header className="header">
            <img src="/se.png" alt="أيقونة" className="logo" />
            <div className="hamburger" onClick={toggleMenu}>
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
            </div>
            <div className="hamburger-dropdown" id="menuDropdown">
                <span className="close-btn" onClick={toggleMenu}>✖</span>
                <Link to="/admindashboard">الخدمات</Link>
                <Link to="/login">الاستعلامات</Link>
                <Link to="/register">إنشاء حساب</Link>
                <a href="https://www.seha.sa/#/account/login">تسجيل الدخول</a>
            </div>
        </header>
    );
};

export default Header;


