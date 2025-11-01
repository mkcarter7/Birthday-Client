import React from 'react';
import { Button } from 'react-bootstrap';
import { signIn } from '../utils/auth';

function Signin() {
  return (
    <div
      className="text-center d-flex flex-column justify-content-center align-content-center"
      style={{
        height: '90vh',
        padding: '30px',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      <h1
        style={{
          fontSize: '48px',
          fontWeight: 600,
          marginBottom: '30px',
          color: '#8b5cf6',
          fontFamily: 'var(--font-fredoka), "Fredoka", sans-serif',
          letterSpacing: '1px',
          textShadow: '2px 2px 4px rgba(139, 92, 246, 0.2)',
        }}
      >
        HAPPY BIRTHDAY IVY
      </h1>
      <p style={{ marginBottom: '24px' }}>Click the button below to login!</p>
      <Button
        type="button"
        size="lg"
        className="copy-btn"
        onClick={signIn}
        style={{
          backgroundColor: '#8b5cf6',
          borderColor: '#8b5cf6',
          color: '#fff',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#7c3aed';
          e.currentTarget.style.borderColor = '#7c3aed';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#8b5cf6';
          e.currentTarget.style.borderColor = '#8b5cf6';
        }}
      >
        Sign In
      </Button>
    </div>
  );
}

export default Signin;
