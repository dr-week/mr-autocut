export function makeCardHeader(title: string, badge: string): string {
  return `<div class="card-bar" data-drag-handle="1"><span class="drag-grip" title="Drag / Float Filmora Card">⠿ ${title}</span><div class="card-tools"><small class="badge">${badge}</small><button class="card-btn" data-collapse="1" title="Collapse">_</button><button class="card-btn" data-float="1" title="Float anywhere">⧉</button></div></div>`;
}

export function bindDraggableCard(card: HTMLElement) {
  const bar = card.querySelector<HTMLElement>('[data-drag-handle]'); if (!bar) return;
  card.querySelector<HTMLButtonElement>('[data-collapse]')?.addEventListener('click', () => card.classList.toggle('collapsed'));
  card.querySelector<HTMLButtonElement>('[data-float]')?.addEventListener('click', () => { card.classList.toggle('floating-card'); if (!card.classList.contains('floating-card')) { card.style.left = ''; card.style.top = ''; } });
  bar.onpointerdown = (e) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return;
    card.classList.add('floating-card'); const r = card.getBoundingClientRect(), ox = e.clientX - r.left, oy = e.clientY - r.top;
    const mv = (ev: PointerEvent) => { card.style.left = `${Math.max(4, ev.clientX - ox)}px`; card.style.top = `${Math.max(4, ev.clientY - oy)}px`; };
    window.addEventListener('pointermove', mv); window.addEventListener('pointerup', () => window.removeEventListener('pointermove', mv), { once: true });
  };
}
