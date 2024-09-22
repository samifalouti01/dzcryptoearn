// components/Welcome.js
import React from 'react';

const Welcome = () => {
  return (
    <iframe 
      src="/ellie/index.html"
      style={{ width: '100vw', height: '100vh', border: 'none' }} 
      title="Ellie"
    />
  );
};

export default Welcome;
