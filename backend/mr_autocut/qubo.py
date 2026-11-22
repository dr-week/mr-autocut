"""Quantum-inspired QUBO (Simulated Annealing) optimal reel clip selector."""

from __future__ import annotations

import math
import random
from .engine import Segment


def optimize_reel_qubo(segments: list[Segment], target_sec: float, steps: int = 200) -> list[Segment]:
    if not segments:
        return []
    rng, state = random.Random(42), [1 if i < 3 else 0 for i in range(len(segments))]
    energy = lambda st: abs(sum(s.duration for s, b in zip(segments, st) if b) - target_sec) * 2.0 - sum(0.6 for s, b in zip(segments, st) if b and s.kind == "hook") + sum(0.4 for i in range(len(st) - 1) if st[i] and st[i + 1] and segments[i].kind == segments[i + 1].kind)
    best, best_e, cur_e = state[:], energy(state), energy(state)
    for t in range(steps):
        cand = state[:]; idx = rng.randrange(len(segments)); cand[idx] ^= 1; ce = energy(cand)
        if ce < cur_e or rng.random() < math.exp((cur_e - ce) / max(0.05, 1.0 - t / steps)):
            state, cur_e = cand, ce
            if ce < best_e: best, best_e = cand[:], ce
    return [s for s, b in zip(segments, best) if b] or segments[:1]
