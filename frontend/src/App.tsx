import { useEffect, useState } from 'react';
import { Scissors, Smartphone, Sparkles, Terminal, Zap, Copy, Check } from 'lucide-react';

interface Segment {
  index: number;
  start: number;
  end: number;
  duration: number;
  kind: string;
  scale: number;
  transition?: string | null;
  label: string;
}

interface AutoCutPreset {
  id: string;
  name: string;
  tagline: string;
  silence_db: number;
  min_silence_sec: number;
  padding_sec: number;
  min_clip_sec: number;
  punch_in_alternate: boolean;
  punch_in_scale: number;
}

interface ReelPreset {
  id: string;
  name: string;
  tagline: string;
  aspect: string;
  target_duration_sec: number;
  avg_shot_sec: number;
  hook_duration_sec: number;
  pacing: string;
  caption_style: string;
  transition: string;
}

interface MotionPreset {
  id: string;
  category: string;
  name: string;
  duration_sec: number;
  easing: string;
  description: string;
}

interface FilmCraftStatus {
  cli_available: boolean;
  cli_version: string | null;
  ffmpeg_available: boolean;
}

type Tab = 'autocut' | 'reel' | 'motion' | 'script';

export default function App() {
  const [tab, setTab] = useState<Tab>('autocut');
  const [status, setStatus] = useState<FilmCraftStatus | null>(null);
  const [autoCutPresets, setAutoCutPresets] = useState<AutoCutPreset[]>([]);
  const [reelPresets, setReelPresets] = useState<ReelPreset[]>([]);
  const [motionPresets, setMotionPresets] = useState<MotionPreset[]>([]);

  // Auto-Cut state
  const [selectedCutPreset, setSelectedCutPreset] = useState('tight-creator');
  const [silenceDb, setSilenceDb] = useState(-32);
  const [minSilence, setMinSilence] = useState(0.28);
  const [padding, setPadding] = useState(0.06);
  const [punchIn, setPunchIn] = useState(true);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [stats, setStats] = useState({ source: 42, kept: 32.4, removed: 9.6, pct: 22.9 });

  // Reel state
  const [selectedReelPreset, setSelectedReelPreset] = useState('viral-hook-30');
  const [reelTarget, setReelTarget] = useState(30);
  const [avgShot, setAvgShot] = useState(1.6);
  const [reelShots, setReelShots] = useState<Segment[]>([]);

  // Script state
  const [bridgeAddr, setBridgeAddr] = useState('127.0.0.1:9001');
  const [jsonl, setJsonl] = useState('');
  const [cliCmd, setCliCmd] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/filmcraft/status').then((r) => r.json()).then(setStatus).catch(() => {});
    fetch('/api/presets')
      .then((r) => r.json())
      .then((d) => {
        setAutoCutPresets(d.auto_cut || []);
        setReelPresets(d.reel || []);
        setMotionPresets(d.motion || []);
      })
      .catch(() => {});
  }, []);

  const runAnalyze = async (
    db = silenceDb,
    minSil = minSilence,
    pad = padding,
    punch = punchIn,
  ) => {
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        duration_sec: 42.0,
        silence_db: db,
        min_silence_sec: minSil,
        padding_sec: pad,
        punch_in_alternate: punch,
        punch_in_scale: 1.12,
      }),
    });
    const data = await res.json();
    setSegments(data.segments || []);
    setStats({
      source: data.source_duration,
      kept: data.kept_duration,
      removed: data.removed_duration,
      pct: data.reduction_pct,
    });
  };

  const runReelPlan = async (target = reelTarget, shot = avgShot) => {
    const res = await fetch('/api/reel/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source_duration: 60.0,
        target_duration_sec: target,
        avg_shot_sec: shot,
        hook_duration_sec: 3.0,
      }),
    });
    const data = await res.json();
    setReelShots(data.shots || []);
  };

  const buildScript = async (activeSegments: Segment[]) => {
    const res = await fetch('/api/filmcraft/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        segments: activeSegments,
        bridge_addr: bridgeAddr || null,
      }),
    });
    const data = await res.json();
    setJsonl(data.jsonl || '');
    setCliCmd(data.cli_invocation || '');
  };

  useEffect(() => {
    runAnalyze();
    runReelPlan();
  }, []);

  useEffect(() => {
    const active = tab === 'reel' ? reelShots : segments;
    if (active.length > 0) buildScript(active);
  }, [segments, reelShots, bridgeAddr, tab]);

  const copyScript = () => {
    navigator.clipboard.writeText(jsonl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo-mark">MR</div>
          <div>
            <h1>MR-AutoCut</h1>
            <span>FilmCraft Companion · Auto-Cut &amp; 9:16 Reel Studio</span>
          </div>
        </div>
        <div className="pills">
          <div className="pill">
            <span className="dot" />
            {status?.cli_version ?? 'filmcraft-cli ready'}
          </div>
          <div className="pill">FFmpeg {status?.ffmpeg_available ? 'Online' : 'Standby'}</div>
        </div>
      </header>

      <nav className="tabs">
        <button className={`tab ${tab === 'autocut' ? 'active' : ''}`} onClick={() => setTab('autocut')}>
          <Scissors size={14} /> Auto-Cut
        </button>
        <button className={`tab ${tab === 'reel' ? 'active' : ''}`} onClick={() => setTab('reel')}>
          <Smartphone size={14} /> Reel Maker 9:16
        </button>
        <button className={`tab ${tab === 'motion' ? 'active' : ''}`} onClick={() => setTab('motion')}>
          <Sparkles size={14} /> Motion FX
        </button>
        <button className={`tab ${tab === 'script' ? 'active' : ''}`} onClick={() => setTab('script')}>
          <Terminal size={14} /> FilmCraft Bridge
        </button>
      </nav>

      {tab === 'autocut' && (
        <div className="grid">
          <aside className="panel">
            <div className="panel-title">Presets</div>
            <div className="preset-list">
              {autoCutPresets.map((p) => (
                <button
                  key={p.id}
                  className={`preset-btn ${selectedCutPreset === p.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedCutPreset(p.id);
                    setSilenceDb(p.silence_db);
                    setMinSilence(p.min_silence_sec);
                    setPadding(p.padding_sec);
                    setPunchIn(p.punch_in_alternate);
                    runAnalyze(p.silence_db, p.min_silence_sec, p.padding_sec, p.punch_in_alternate);
                  }}
                >
                  <strong>{p.name}</strong>
                  <small>{p.tagline}</small>
                </button>
              ))}
            </div>

            <div className="control">
              <label>
                Silence Threshold <span>{silenceDb} dB</span>
              </label>
              <input
                type="range"
                min={-55}
                max={-18}
                step={1}
                value={silenceDb}
                onChange={(e) => setSilenceDb(Number(e.target.value))}
              />
            </div>

            <div className="control">
              <label>
                Min Silence <span>{minSilence.toFixed(2)}s</span>
              </label>
              <input
                type="range"
                min={0.15}
                max={1.5}
                step={0.05}
                value={minSilence}
                onChange={(e) => setMinSilence(Number(e.target.value))}
              />
            </div>

            <div className="control">
              <label>
                Breath Padding <span>{padding.toFixed(2)}s</span>
              </label>
              <input
                type="range"
                min={0}
                max={0.3}
                step={0.02}
                value={padding}
                onChange={(e) => setPadding(Number(e.target.value))}
              />
            </div>

            <button className="btn-primary" onClick={() => runAnalyze()}>
              <Zap size={14} /> Re-Analyze Cuts
            </button>
          </aside>

          <main className="panel">
            <div className="panel-title">Smart Cut Timeline</div>
            <div className="stats">
              <div className="stat">
                <small>Kept Duration</small>
                <strong>{stats.kept}s</strong>
              </div>
              <div className="stat">
                <small>Dead Air Removed</small>
                <strong>-{stats.removed}s</strong>
              </div>
              <div className="stat">
                <small>Pacing Gain</small>
                <strong>{stats.pct}%</strong>
              </div>
            </div>

            <div className="timeline">
              {segments.map((s) => (
                <div
                  key={s.index}
                  className={`seg-block ${s.scale > 1 ? 'punch' : ''}`}
                  style={{
                    left: `${(s.start / stats.source) * 100}%`,
                    width: `${Math.max(2, (s.duration / stats.source) * 100)}%`,
                  }}
                >
                  {s.label}
                </div>
              ))}
            </div>

            <div className="seg-list">
              {segments.map((s) => (
                <div key={s.index} className="seg-card">
                  <strong>{s.label}</strong>
                  <div className="meta">
                    {s.start.toFixed(2)}s → {s.end.toFixed(2)}s ({s.duration.toFixed(2)}s)
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {tab === 'reel' && (
        <div className="grid">
          <aside className="panel">
            <div className="panel-title">9:16 Reel Blueprints</div>
            <div className="preset-list">
              {reelPresets.map((p) => (
                <button
                  key={p.id}
                  className={`preset-btn ${selectedReelPreset === p.id ? 'selected' : ''}`}
                  onClick={() => {
                    setSelectedReelPreset(p.id);
                    setReelTarget(p.target_duration_sec);
                    setAvgShot(p.avg_shot_sec);
                    runReelPlan(p.target_duration_sec, p.avg_shot_sec);
                  }}
                >
                  <strong>{p.name}</strong>
                  <small>{p.tagline}</small>
                </button>
              ))}
            </div>

            <div className="control">
              <label>
                Target Length <span>{reelTarget}s</span>
              </label>
              <input
                type="range"
                min={10}
                max={90}
                step={5}
                value={reelTarget}
                onChange={(e) => setReelTarget(Number(e.target.value))}
              />
            </div>

            <div className="control">
              <label>
                Avg Shot Pace <span>{avgShot.toFixed(2)}s</span>
              </label>
              <input
                type="range"
                min={0.6}
                max={4.0}
                step={0.1}
                value={avgShot}
                onChange={(e) => setAvgShot(Number(e.target.value))}
              />
            </div>

            <button className="btn-primary" onClick={() => runReelPlan()}>
              <Smartphone size={14} /> Generate Reel Plan
            </button>
          </aside>

          <main className="panel">
            <div className="panel-title">Vertical 9:16 Sequence ({reelShots.length} Shots)</div>
            <div className="seg-list">
              {reelShots.map((s) => (
                <div key={s.index} className="seg-card">
                  <strong>{s.label}</strong>
                  <div className="meta">
                    {s.duration.toFixed(2)}s · {s.scale > 1 ? `Zoom ${Math.round(s.scale * 100)}%` : '100%'}
                    {s.transition ? ` · ${s.transition}` : ''}
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      )}

      {tab === 'motion' && (
        <div className="panel">
          <div className="panel-title">One-Click Motion FX &amp; Transitions</div>
          <div className="motion-grid">
            {motionPresets.map((m) => (
              <div key={m.id} className="seg-card">
                <small style={{ color: 'var(--accent)', fontSize: 10, textTransform: 'uppercase' }}>
                  {m.category} · {m.duration_sec}s · {m.easing}
                </small>
                <strong style={{ display: 'block', margin: '4px 0' }}>{m.name}</strong>
                <div className="meta">{m.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'script' && (
        <div className="grid">
          <aside className="panel">
            <div className="panel-title">Live FilmCraft Bridge</div>
            <div className="control">
              <label>Bridge Address (filmcraft --control PORT)</label>
              <input
                type="text"
                value={bridgeAddr}
                onChange={(e) => setBridgeAddr(e.target.value)}
                placeholder="127.0.0.1:9001"
              />
            </div>
            <div className="control">
              <label>CLI Command</label>
              <div className="code-box">{cliCmd}</div>
            </div>
            <button className="btn-primary" onClick={copyScript}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied JSONL' : 'Copy FilmCraft Script'}
            </button>
          </aside>

          <main className="panel">
            <div className="panel-title">Generated filmcraft-cli JSONL</div>
            <pre className="code-box">{jsonl}</pre>
          </main>
        </div>
      )}
    </div>
  );
}
