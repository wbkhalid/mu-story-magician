'use client';
import React from 'react';

const Page = () => {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Payment Canceled</h1>
        <p style={styles.message}>Your payment was canceled.</p>
        <p className={styles.additionalInfo}>
          If you need further assistance, please contact support.
        </p>
        <div style={styles.iconContainer}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            fill="#9800ff"
            className="bi bi-check-circle"
            viewBox="0 0 16 16"
            style={styles.icon}
          >
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.57 11.65a.5.5 0 0 0 .705-.044L10.606 8.5 8.07 6.355a.5.5 0 1 0-.715.7l2.5 2.5a.5.5 0 0 0 .717-.006l2.5-2.5a.5.5 0 0 0-.707-.707L8 9.793 6.927 8.62a.5.5 0 1 0-.707.707l1.5 1.5a.5.5 0 0 0 .849-.177z" />
          </svg>
        </div>
        <button style={styles.button} onClick={() => (window.location.href = '/')}>
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f2f5',
  },
  card: {
    backgroundColor: 'white',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
    maxWidth: '400px',
    width: '100%',
  },
  title: {
    fontSize: '2rem',
    margin: '0 0 20px 0',
    color: '#9800ff',
  },
  message: {
    fontSize: '1.2rem',
    margin: '0 0 20px 0',
    color: '#333',
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '20px 0',
  },
  icon: {
    color: '#4caf50',
  },
  button: {
    padding: '10px 20px',
    fontSize: '1rem',
    color: 'white',
    backgroundColor: '#9800ff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  additionalInfo: {
    marginTop: '20px',
    fontSize: '1rem',
    color: '#888',
  },
};

export default Page;
