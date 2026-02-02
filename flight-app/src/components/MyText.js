import React from 'react';

const MyText = ({ text }) => {
  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: '#27ae60',
      color: 'white',
      borderRadius: '6px',
      marginTop: '16px',
      display: 'inline-block',
    }}>
      ✈️ {text}
    </div>
  );
};

export default MyText;
