export const postJson = (url: string, body: unknown): Promise<Response> =>
  fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
