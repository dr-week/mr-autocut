import { apiUrl } from './api_url';
import { colorFilterSig, jsonlSig } from './controls';
import { notify } from './notify';
import { refreshScript } from './refresh_script';
import { segmentsSig } from './signals';
import { filmoraPkgSig, maskGlowSig, speedRampSig, textBehindSig, vfxPromptSig, vfxScriptSig, vfxTagsSig } from './vfx_sigs';

export async function applyVfxPrompt(customPrompt?: string) {
  if (customPrompt) vfxPromptSig.value = customPrompt;
  const p = vfxPromptSig.value, sc = vfxScriptSig.value, d = await fetch(apiUrl(`/api/vfx/plan?prompt=${encodeURIComponent(p)}&script_text=${encodeURIComponent(sc)}`), { method: 'POST' }).then((r) => r.json()).catch(() => null);
  const tb = d?.text_behind ?? (sc.trim().split('\n')[0]?.slice(0, 18).toUpperCase() || 'VELOCITY'), tags = d?.tags ?? ['Speed Ramp (300%->40%)', 'Subject Mask + Saber Glow', `Text Behind ('${tb}')`, 'YouTube Flash (Screen)'];
  textBehindSig.value = tb; maskGlowSig.value = p.toLowerCase().includes('glow') || p.toLowerCase().includes('mask') || p.toLowerCase().includes('car'); speedRampSig.value = p.toLowerCase().includes('speed') || p.toLowerCase().includes('car') ? '300% → 40% Optical Flow' : '100% Linear'; vfxTagsSig.value = tags;
  colorFilterSig.value = maskGlowSig.value ? 'contrast(1.16) saturate(1.28) drop-shadow(0 0 18px #38bdf8)' : 'contrast(1.08) saturate(1.14)'; filmoraPkgSig.value = JSON.stringify(d?.filmora_package ?? { target: ['Filmora', 'FilmCraft'], effects: tags, text_behind: tb }, null, 2);
  segmentsSig.value = segmentsSig.value.map((s, i) => ({ ...s, scale: i % 2 === 0 ? 1.16 : 1.04, light_leak: true, transition: 'yt-flash-screen', sfx: i % 2 === 0 ? 'whoosh' : 'hit', label: `${s.label.split('·')[0].trim()} · ${i % 2 === 0 ? '300% Ramp' : '40% SlowMo'}` }));
  await refreshScript(); if (d?.filmcraft_jsonl) jsonlSig.value = `${jsonlSig.value}\n${d.filmcraft_jsonl}`.trim(); notify(`Applied VFX: ${tags.slice(0, 3).join(' · ')}`);
}
