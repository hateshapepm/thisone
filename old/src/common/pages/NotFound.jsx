import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="not-found-container flex-col align-center justify-center w-100 h-100">
    <div className="not-found-content">
      <div className="not-found-box">
        <div className="mb-18" role="img" aria-label="Not Found">
          <span className="text-error" style={{fontSize: 80}}>🚫</span>
        </div>
        <h1 className="mb-8 fw-700" style={{fontSize: 36}}>404 - Page Not Found</h1>
        <p className="mb-24 text-muted" style={{fontSize: 18}}>
          Sorry, the page you are looking for does not exist.
        </p>
        <Link to="/" className="btn btn-primary fw-700" tabIndex="0" aria-label="Go to Dashboard">
          Go to Dashboard
        </Link>
      </div>
    </div>
  </div>
);

export default NotFound;
