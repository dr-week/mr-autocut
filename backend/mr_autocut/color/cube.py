"""Generate standard .cube 3D LUT from Lift / Gamma / Gain ColorGrade."""

from __future__ import annotations

from .analyze import ColorGrade


def _apply_cdl(v: float, lift: float, gamma: float, gain: float) -> float:
    x = max(0.0, min(1.0, (v * (1.0 + gain)) + lift))
    return max(0.0, min(1.0, x ** (1.0 / max(0.2, 1.0 + gamma))))


def generate_cube_lut(grade: ColorGrade, title: str = "MR-AutoCut Grade", size: int = 17) -> str:
    lines = [f'TITLE "{title}"', f"LUT_3D_SIZE {size}", "DOMAIN_MIN 0.0 0.0 0.0", "DOMAIN_MAX 1.0 1.0 1.0"]
    inv = 1.0 / (size - 1)
    for bi in range(size):
        for gi in range(size):
            for ri in range(size):
                r = _apply_cdl(ri * inv, grade.lift.r + grade.lift.luma, grade.gamma.r + grade.gamma.luma, grade.gain.r + grade.gain.luma)
                g = _apply_cdl(gi * inv, grade.lift.g + grade.lift.luma, grade.gamma.g + grade.gamma.luma, grade.gain.g + grade.gain.luma)
                b = _apply_cdl(bi * inv, grade.lift.b + grade.lift.luma, grade.gamma.b + grade.gamma.luma, grade.gain.b + grade.gain.luma)
                lines.append(f"{r:.5f} {g:.5f} {b:.5f}")
    return "\n".join(lines) + "\n"
