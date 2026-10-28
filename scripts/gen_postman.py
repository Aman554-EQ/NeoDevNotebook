"""Generate each API project's OpenAPI schema and a Postman collection from it.

For every project whose settings install drf_spectacular:
  projects/<module>/<name>/openapi.yaml                       the schema (drf-spectacular)
  public/postman/<module>-<name>.postman_collection.json      import into Postman (v2.1)

The collection has a `baseUrl` variable, the auth the API uses, one folder per tag, and an example
JSON body for every request built from the schema. Learners download it from the project page.

usage: python scripts/gen_postman.py [--check]
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
import tempfile
from pathlib import Path

import yaml  # PyYAML ships with drf-spectacular's dependencies in .venv-verify

sys.path.insert(0, str(Path(__file__).resolve().parent))
from test_projects import settings_module  # noqa: E402
from verify_code_samples import ROOT, interpreter  # noqa: E402

POSTMAN_DIR = ROOT / "public" / "postman"
SCHEMA_URL = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"


def export_schema(project: Path, python: str) -> dict:
    # Integer limits in the schema depend on the database, so always describe the SQLite build.
    env = {k: v for k, v in os.environ.items() if not k.endswith("DATABASE_URL")}
    env["DJANGO_SETTINGS_MODULE"] = settings_module(project)
    for line in (project / ".env.example").read_text(encoding="utf-8").splitlines():
        if "=" in line and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            env.setdefault(key.strip(), value.strip())
    with tempfile.TemporaryDirectory() as tmp:
        out = Path(tmp) / "schema.yaml"
        result = subprocess.run(
            [python, "manage.py", "spectacular", "--validate", "--fail-on-warn", "--file", str(out)],
            cwd=project,
            env=env,
            capture_output=True,
            text=True,
        )
        if result.returncode != 0:
            raise SystemExit(f"✗ schema for {project.name} failed:\n{result.stdout}{result.stderr}")
        return yaml.safe_load(out.read_text(encoding="utf-8"))


def example(schema: dict, components: dict, depth: int = 0):
    """A small, valid-looking example value for a JSON schema (read-only fields left out)."""
    if "$ref" in schema:
        return example(components[schema["$ref"].rsplit("/", 1)[1]], components, depth)
    if "allOf" in schema:
        return example(schema["allOf"][0], components, depth)
    if "example" in schema:
        return schema["example"]
    kind = schema.get("type")
    if kind == "object" or "properties" in schema:
        if depth > 3:
            return {}
        props = schema.get("properties", {})
        return {
            name: example(sub, components, depth + 1)
            for name, sub in props.items()
            if not sub.get("readOnly")
        }
    if kind == "array":
        return [example(schema.get("items", {}), components, depth + 1)]
    if "enum" in schema:
        return schema["enum"][0]
    if kind == "integer":
        return max(1, schema.get("minimum", 1))
    if kind == "number":
        return 1.0
    if kind == "boolean":
        return True
    fmt = schema.get("format")
    return {"email": "ada@example.com", "date-time": "2026-01-01T00:00:00Z", "decimal": "9.99"}.get(
        fmt, "string"
    )


def collection(name: str, schema: dict) -> dict:
    components = schema.get("components", {}).get("schemas", {})
    schemes = schema.get("components", {}).get("securitySchemes", {})
    folders: dict[str, list] = {}
    for path, operations in sorted(schema["paths"].items()):
        for method, op in operations.items():
            if method not in {"get", "post", "put", "patch", "delete"}:
                continue
            parts = [p for p in path.strip("/").split("/") if p]
            url = {
                "raw": "{{baseUrl}}" + path.replace("{", ":").replace("}", ""),
                "host": ["{{baseUrl}}"],
                "path": [p.replace("{", ":").replace("}", "") for p in parts],
            }
            params = op.get("parameters", [])
            path_vars = [p["name"] for p in params if p["in"] == "path"]
            if path_vars:
                url["variable"] = [{"key": v, "value": "1"} for v in path_vars]
            headers = [
                {"key": p["name"], "value": "{{$guid}}", "description": p.get("description", "")}
                for p in params
                if p["in"] == "header"
            ]
            request = {"method": method.upper(), "header": headers, "url": url}
            body = op.get("requestBody", {}).get("content", {}).get("application/json")
            if body:
                request["header"].append({"key": "Content-Type", "value": "application/json"})
                request["body"] = {
                    "mode": "raw",
                    "raw": json.dumps(example(body["schema"], components), indent=2),
                    "options": {"raw": {"language": "json"}},
                }
            if not op.get("security") or {} in op.get("security", []):
                request["auth"] = {"type": "noauth"}
            item = {"name": f"{method.upper()} {path}", "request": request}
            folders.setdefault((op.get("tags") or ["api"])[0], []).append(item)

    auth = None
    if any(s.get("scheme") == "bearer" for s in schemes.values()):
        auth = {"type": "bearer", "bearer": [{"key": "token", "value": "{{accessToken}}", "type": "string"}]}
    elif any(s.get("type") == "apiKey" for s in schemes.values()):
        header = {"key": "Authorization", "value": "Token {{token}}"}
        auth = {"type": "apikey", "apikey": [{"key": "key", "value": header["key"], "type": "string"},
                                              {"key": "value", "value": header["value"], "type": "string"},
                                              {"key": "in", "value": "header", "type": "string"}]}
    result = {
        "info": {
            "name": schema["info"]["title"],
            "description": f"{schema['info'].get('description', '')}\n\nGenerated from the project's OpenAPI schema.",
            "schema": SCHEMA_URL,
        },
        "variable": [
            {"key": "baseUrl", "value": "http://127.0.0.1:8000"},
            {"key": "accessToken", "value": ""},
            {"key": "token", "value": ""},
        ],
        "item": [{"name": tag, "item": items} for tag, items in sorted(folders.items())],
    }
    if auth:
        result["auth"] = auth
    return result


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    check = "--check" in sys.argv
    python = interpreter()
    stale = []
    count = 0
    for project in sorted(p.parent for p in ROOT.glob("projects/*/*/manage.py")):
        config = "".join(f.read_text(encoding="utf-8") for f in project.glob("config/**/*.py"))
        if "drf_spectacular" not in config:
            continue
        module = project.parent.name
        schema = export_schema(project, python)
        files = {
            project / "openapi.yaml": yaml.safe_dump(schema, sort_keys=False, allow_unicode=True),
            POSTMAN_DIR / f"{module}-{project.name}.postman_collection.json": json.dumps(
                collection(project.name, schema), indent=2, ensure_ascii=False
            )
            + "\n",
        }
        for path, text in files.items():
            if check:
                if not path.exists() or path.read_text(encoding="utf-8") != text:
                    stale.append(path.relative_to(ROOT).as_posix())
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(text, encoding="utf-8", newline="\n")
        count += 1
    if stale:
        print("✗ stale API files (run `pnpm gen:postman`):\n  " + "\n  ".join(stale))
        return 1
    print(f"✓ {count} OpenAPI schema(s) and Postman collection(s) {'up to date' if check else 'written'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
