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
      <h1>Hi there!</h1>
      <p>Click the button below to login!</p>
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
