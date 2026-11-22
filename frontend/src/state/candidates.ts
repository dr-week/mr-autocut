export const HF_SPACE_URL = 'https://dr-week-mr-autocut.hf.space';

// Order: custom/local -> HF Space -> (fallback) browser-only static-demo.
export const backendCandidates = (): string[] =>
  [localStorage.getItem('mr_api_url') || '', '', 'http://127.0.0.1:8000', HF_SPACE_URL].filter((v, i, a) => a.indexOf(v) === i);
