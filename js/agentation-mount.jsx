import React from 'react';
import { createRoot } from 'react-dom/client';
import { Agentation } from 'agentation';

// Keep the feedback toolbar available on the local development server only.
if (location.port === '8080' || location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
  const host = document.createElement('div');
  host.id = 'agentation-root';
  document.body.appendChild(host);
  createRoot(host).render(<Agentation appName="Cappey India website" />);
}
