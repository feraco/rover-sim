import React from 'react'

function App() {
  console.log('App component rendering - TEST');
  console.log('Dev server should be running...');

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#1e1e1e',
      color: '#fff',
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      zIndex: 9999
    }}>
      <div>
        <h1 style={{ margin: 0, marginBottom: '20px' }}>ATLAS Sim is Loading...</h1>
        <p style={{ margin: 0, textAlign: 'center', fontSize: '16px' }}>If you see this, React is working!</p>
      </div>
    </div>
  )
}

export default App
