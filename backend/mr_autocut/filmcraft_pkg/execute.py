"""Execute compiled JSONL script against FilmCraft (--bridge, --project, or --demo)."""
import subprocess, tempfile
from pathlib import Path
from .compile import generate_filmcraft_jsonl
from .models import ExecuteResult, ScriptRequest
from .status import _find_filmcraft_cli

def execute_filmcraft_script(req: ScriptRequest) -> ExecuteResult:
    cli = _find_filmcraft_cli()
    if not cli: return ExecuteResult(exit_code=127, stdout="", stderr="filmcraft-cli not found on PATH", cli_invocation="")
    comp = generate_filmcraft_jsonl(req)
    with tempfile.NamedTemporaryFile("w", suffix=".jsonl", delete=False, encoding="utf-8") as tf: tf.write(comp.jsonl); sp = tf.name
    flag = ["--bridge", req.bridge_addr] if req.bridge_addr else (["--project", req.project_path, "--save"] if req.project_path and Path(req.project_path).is_file() else ["--demo"])
    proc = subprocess.run([cli, *flag, "run", sp], capture_output=True, text=True, timeout=60); Path(sp).unlink(missing_ok=True)
    return ExecuteResult(exit_code=proc.returncode, stdout=proc.stdout, stderr=proc.stderr, cli_invocation=comp.cli_invocation)
