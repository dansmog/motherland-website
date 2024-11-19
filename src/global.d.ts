declare global {
  interface Window {
    onloadTurnstileCallback?: () => void;
  }
}
