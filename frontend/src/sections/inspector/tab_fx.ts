import { FX_LIBRARY, favFxSig, fxCatSig, fxSearchSig, notify } from '../../state';
import type { FxCategory } from '../../state';
import { bindYtHarvester, renderYtHarvester } from './yt_harvester';

const CATS: FxCategory[] = ['All', 'Camera', 'Transition', 'Light Leak', 'SFX', 'Color'];

export function renderFxTab(body: HTMLElement) {
  const q = fxSearchSig.value.toLowerCase(), cat = fxCatSig.value, favs = favFxSig.value;
  const items = FX_LIBRARY.filter((f) => (cat === 'All' || f.cat === cat) && f.name.toLowerCase().includes(q));
  body.innerHTML = `${renderYtHarvester()}<div class="section-label">Mr Horse FX & Light Leaks</div><div class="control"><input id="fx-q" type="text" value="${fxSearchSig.value}" placeholder="Search transitions, light leaks, SFX..." /></div><div class="rail-tabs">${CATS.map((c) => `<button class="rail-tab ${c === cat ? 'active' : ''}" data-c="${c}">${c}</button>`).join('')}</div><div class="fx-list">${items.map((f) => `<div class="fx-card ${f.anim}"><div class="fx-head"><strong>${f.name}</strong><button class="fav-btn ${favs.includes(f.id) ? 'on' : ''}" data-fav="${f.id}">★</button></div><small>${f.cat} · ${f.meta}</small></div>`).join('')}</div>`;
  bindYtHarvester(body);
  body.querySelector<HTMLInputElement>('#fx-q')!.oninput = (e) => { fxSearchSig.value = (e.target as HTMLInputElement).value; renderFxTab(body); };
  body.querySelectorAll<HTMLButtonElement>('[data-c]').forEach((b) => (b.onclick = () => { fxCatSig.value = b.dataset.c as FxCategory; renderFxTab(body); }));
  body.querySelectorAll<HTMLButtonElement>('[data-fav]').forEach((b) => (b.onclick = () => { const id = b.dataset.fav!; favFxSig.value = favs.includes(id) ? favs.filter((x) => x !== id) : [...favs, id]; notify('Updated Favorites'); renderFxTab(body); }));
}
