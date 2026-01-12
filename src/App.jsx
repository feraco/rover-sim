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

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainSimulator />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/arena-frame" element={<ArenaFrame />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/configurator" element={<Configurator />} />
        <Route path="/generate-url" element={<GenerateURL />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
