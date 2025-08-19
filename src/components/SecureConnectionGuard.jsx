export default function SecureConnectionGuard({ children }) {
  if (window.location.protocol !== 'https:' && !window.location.origin.startsWith('http://localhost')) {
    window.location.replace(import.meta.env.VITE_FRONTEND_SECURE_URL);
    return;
  }

  return children;
}
