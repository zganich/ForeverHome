#!/usr/bin/env python3
"""Run the complete suite against an isolated local PostgreSQL instance.

No production credentials or services are used. Fictional database files are
retained in the system temporary directory; the PostgreSQL process is stopped.
"""
import json
import os
from pathlib import Path
import shutil
import socket
import subprocess
import tempfile


def main():
    repo = Path(__file__).resolve().parent.parent
    configured = os.environ.get("REVIVE_PG_BIN")
    initdb = Path(configured) / "initdb" if configured else Path(shutil.which("initdb") or "/opt/homebrew/opt/postgresql@14/bin/initdb")
    if not initdb.is_file():
        raise SystemExit("Local PostgreSQL is required. Set REVIVE_PG_BIN to its bin directory.")
    pg = initdb.parent
    scratch = Path(tempfile.mkdtemp(prefix="foreverhome-rehearsal-"))
    with socket.socket() as listener:
        listener.bind(("127.0.0.1", 0))
        port = listener.getsockname()[1]
    subprocess.run([str(initdb), "-D", str(scratch / "data"), "-A", "trust", "--no-locale"], check=True, stdout=subprocess.DEVNULL)
    started = False
    try:
        subprocess.run([str(pg / "pg_ctl"), "-D", str(scratch / "data"), "-l", str(scratch / "postgres.log"), "-o", f"-h 127.0.0.1 -p {port} -k {scratch}", "-w", "start"], check=True, stdout=subprocess.DEVNULL)
        started = True
        subprocess.run([str(pg / "createdb"), "-h", "127.0.0.1", "-p", str(port), "foreverhome_rehearsal"], check=True)
        env = os.environ.copy()
        env.update({
            "DOTENV_CONFIG_PATH": "/dev/null",
            "REVIVE_TEST_DATABASE_URL": f"postgresql://{os.environ.get('USER', 'postgres')}@127.0.0.1:{port}/foreverhome_rehearsal",
            "GOOGLE_CLOUD_PROJECT": "foreverhome-test",
            "GCS_BUCKET": "foreverhome-test-media",
            "CLOUD_SQL_CONNECTION_NAME": "",
            "OPENAI_API_KEY": "sk-test-mock",
            "STRIPE_SECRET_KEY": "sk_test_mock",
            "STRIPE_WEBHOOK_SECRET": "whsec_test_mock",
        })
        print(json.dumps({"database": "foreverhome_rehearsal", "port": port, "scratch": str(scratch)}), flush=True)
        result = subprocess.run(["pnpm", "test"], cwd=repo, env=env)
        return result.returncode
    finally:
        if started:
            subprocess.run([str(pg / "pg_ctl"), "-D", str(scratch / "data"), "-m", "fast", "-w", "stop"], check=True, stdout=subprocess.DEVNULL)
            print("Rehearsal PostgreSQL stopped; no live provider calls were made.", flush=True)


if __name__ == "__main__":
    raise SystemExit(main())
