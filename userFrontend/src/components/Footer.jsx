import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/componentstyle/footer.css';

export default function Footer() {
  return (
    <div className="footer">
      <div className="footer-content">
        <div className="footer-info">
          <p>© 2026 Quiz web App. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}