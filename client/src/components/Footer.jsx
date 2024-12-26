import './Footer.css';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-container">
                <img src="/lean.png" alt="شعار Lean" className="footer-img1" />
                <div className="vertical-line"></div>
                <img src="/MOF.png" alt="شعار MOF" className="footer-img2" />
            </div>
            <p>منصة صحة معتمدة من قبل وزارة الصحة &copy; 2024</p>
            <div className="footer-links">
                <a href="https://www.seha.sa/files/T_Cs_v3.pdf" className="footer-link" target="_blank" rel="noopener noreferrer">سياسة الخصوصية وشروط الإستخدام</a>
                <span>|</span>
                <a href="https://seha.sa/Content/LandingPages/UserManual.pdf" className="footer-link" target="_blank" rel="noopener noreferrer">دليل الاستخدام</a>
            </div>
            <div className="footer-contact">
                <span>920002005</span>
                <span>|</span>
                <span>support@seha.sa</span>
            </div>
            <div className="footer-social">
                <a href="https://wa.me/920002005" target="_blank" rel="noopener noreferrer">
                    <img src="/wh.png" alt="WhatsApp" className="footer-icon" />
                </a>
                <a href="https://twitter.com/seha_services" target="_blank" rel="noopener noreferrer">
                    <img src="/T.png" alt="Twitter" className="footer-icon" />
                </a>
                <a href="https://www.youtube.com/channel/UCb9ZrS2YcriYqIPIHNp9wcQ" target="_blank" rel="noopener noreferrer">
                    <img src="/you.png" alt="YouTube" className="footer-icon" />
                </a>
            </div>
        </footer>
    );
};

export default Footer;

