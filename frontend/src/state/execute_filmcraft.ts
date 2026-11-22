import { busySig } from './signals';
import { notify } from './notify';
import { postJson } from './post_json';
import { scriptPayload } from './script_payload';

export async function executeInFilmCraft() {
  busySig.value = true;
  const d = await postJson('/api/filmcraft/execute', scriptPayload()).then((r) => r.json());
  busySig.value = false;
  notify(d.exit_code === 0 ? 'Applied to FilmCraft!' : `FilmCraft exited (${d.exit_code})`);
}
