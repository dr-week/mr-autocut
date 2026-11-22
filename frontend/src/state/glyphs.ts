import { CheckGlyph, CommandGlyph, ExternalLinkGlyph, FlameGlyph, GridGlyph, LayersGlyph, MessageGlyph, MonitorGlyph, PlusGlyph, SearchGlyph, ShareGlyph, SparkleGlyph, TunerGlyph, ZUARI_LOGO_SVG, createSvgElement } from '@zuari/glyphs';

const EXTRA: Record<string, string> = {
  scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/>',
  film: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M17 3v18M3 7.5h4M3 12h18M3 16.5h4M17 7.5h4M17 16.5h4"/>',
  palette: '<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.9 0 1.6-.7 1.6-1.6 0-.4-.2-.8-.4-1.1-.3-.3-.4-.7-.4-1.1 0-.9.7-1.6 1.6-1.6H16c3.3 0 6-2.7 6-6 0-5.5-4.5-9.6-10-9.6Z"/>',
  phone: '<rect width="14" height="20" x="5" y="2" rx="2"/><path d="M12 18h.01"/>', zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>', copy: '<rect width="14" height="14" x="8" y="8" rx="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  volume: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>', wand: '<path d="m15 4-1 1 4 4 1-1a2.83 2.83 0 1 0-4-4Z"/><path d="m13 6-9.5 9.5a2.12 2.12 0 1 0 3 3L16 9"/>',
};
const MAP: Record<string, any> = { sparkle: SparkleGlyph, cmd: CommandGlyph, grid: GridGlyph, layers: LayersGlyph, tuner: TunerGlyph, monitor: MonitorGlyph, search: SearchGlyph, plus: PlusGlyph, check: CheckGlyph, ext: ExternalLinkGlyph, share: ShareGlyph, msg: MessageGlyph, flame: FlameGlyph };
export const ic = (name: string, size = 14): string => (MAP[name] ? MAP[name]({ size, class: 'zg' }).outerHTML : createSvgElement('0 0 24 24', EXTRA[name] || EXTRA.zap, { size, class: 'zg' }).outerHTML);
export { ZUARI_LOGO_SVG };
