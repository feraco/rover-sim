import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import MainSimulator from './pages/MainSimulator'
import Arena from './pages/Arena'
import ArenaFrame from './pages/ArenaFrame'
import Builder from './pages/Builder'
import Configurator from './pages/Configurator'
import GenerateURL from './pages/GenerateURL'

function App() {
  console.log('App component rendering');

  try {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainSimulator />} />
          <Route path="/arena.html" element={<Arena />} />
          <Route path="/arenaFrame.html" element={<ArenaFrame />} />
          <Route path="/builder.html" element={<Builder />} />
          <Route path="/configurator.html" element={<Configurator />} />
          <Route path="/genURL.html" element={<GenerateURL />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    )
  } catch (error) {
    console.error('Error in App render:', error);
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error.message}</div>;
  }
}

export default App
