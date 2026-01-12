import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/main.scss'

console.log('main.jsx loading...');

const rootElement = document.getElementById('root');
console.log('Root element:', rootElement);

if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Error: Root element not found!</div>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    console.log('Root created, rendering App...');

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    console.log('React app rendered!');
  } catch (error) {
    console.error('Error mounting React:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Error mounting app: ${error.message}</div>`;
  }
}
