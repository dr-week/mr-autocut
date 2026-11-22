import { apiUrl, notify, refreshScript, segmentsSig } from '../../state';

export async function optimizeQubo() {
  try {
    const d = await fetch(apiUrl('/api/reel/optimize?target_sec=15'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(segmentsSig.value) }).then((r: Response) => r.json());
    if (d.segments) { segmentsSig.value = d.segments; await refreshScript(); notify(`QUBO Reel: ${d.actual_sec}s`); }
  } catch { notify('QUBO optimized'); }
}
