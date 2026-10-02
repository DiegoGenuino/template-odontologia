"""Build and deploy a personalized Astro site to Vercel with Cloudflare DNS.

Usage:
    python scripts/deploy.py --project clinica-aurora --domain aurora.example.com --dry-run
    python scripts/deploy.py --project clinica-aurora --domain aurora.example.com

Credentials are read at execution time from the user's Documents directory.
No token is copied into this project or included in the deployed files.
"""

from __future__ import annotations

import argparse
import hashlib
from html.parser import HTMLParser
import ipaddress
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import time
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CREDENTIALS = Path.home() / "Documents" / "tokens-para-criar-os-sites" / "credentials.env"
VERCEL_API = "https://api.vercel.com"
CLOUDFLARE_API = "https://api.cloudflare.com/client/v4"
DNS_TYPES = {"A", "AAAA", "CNAME"}


class DeployError(Exception):
    pass


def domain_name(value: str) -> str:
    value = value.strip().rstrip(".").lower()
    if any(char in value for char in ("/", ":", "*", "@", " ")):
        raise DeployError("Informe somente o domínio, sem protocolo, caminho ou curinga.")
    try:
        ascii_name = value.encode("idna").decode("ascii")
    except UnicodeError as error:
        raise DeployError("Domínio inválido.") from error
    labels = ascii_name.split(".")
    if len(labels) < 2 or len(ascii_name) > 253 or any(
        not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?", label)
        for label in labels
    ):
        raise DeployError("Domínio inválido. Use um nome completo, como site.exemplo.com.")
    return ascii_name


def dns_record_name(value: str) -> str:
    """TXT verification labels can contain underscores, unlike website hostnames."""
    name = value.strip().rstrip(".").lower()
    labels = name.split(".")
    if len(name) > 253 or any(
        not label or len(label) > 63 or not re.fullmatch(r"[a-z0-9_-]+", label)
        for label in labels
    ):
        raise DeployError("A Vercel retornou um nome de TXT inválido.")
    return name


def project_name(value: str) -> str:
    value = value.strip().lower()
    if not re.fullmatch(r"[a-z0-9](?:[a-z0-9-]{0,98}[a-z0-9])?", value):
        raise DeployError("O nome do projeto deve usar letras minúsculas, números e hífens.")
    if value == "template-odontologia":
        raise DeployError("Escolha um nome de projeto próprio para este cliente.")
    return value


def read_credentials(path: Path) -> dict[str, str]:
    if not path.is_file():
        raise DeployError(f"Arquivo de credenciais não encontrado: {path}")
    values: dict[str, str] = {}
    for raw in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if line.startswith("export "):
            line = line[7:].strip()
        if "=" not in line:
            continue
        key, value = line.split("=", 1)
        key, value = key.strip(), value.strip()
        if (value.startswith('"') and value.endswith('"')) or (
            value.startswith("'") and value.endswith("'")
        ):
            value = value[1:-1]
        values[key] = value
    for key in ("VERCEL_TOKEN", "CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ZONE_ID"):
        if not values.get(key):
            raise DeployError(f"Falta {key} no arquivo de credenciais.")
    return values


def run_local(command: list[str], *, site_url: str | None = None) -> None:
    environment = os.environ.copy()
    if site_url:
        environment["PUBLIC_SITE_URL"] = site_url
    result = subprocess.run(command, cwd=ROOT, env=environment, check=False)
    if result.returncode:
        raise DeployError(f"Etapa local falhou (código {result.returncode}): {command[1]}")


class MetaParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.meta: dict[str, str] = {}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "meta":
            attributes = dict(attrs)
            key = attributes.get("property") or attributes.get("name")
            if key:
                self.meta[key] = attributes.get("content") or ""


def build_site(domain: str) -> list[tuple[Path, str, str, int]]:
    npm = shutil.which("npm")
    if not npm:
        raise DeployError("npm não foi encontrado. Instale Node.js e npm antes de continuar.")
    if not (ROOT / "node_modules").is_dir():
        print("Instalando dependências do projeto...")
        run_local([npm, "ci"])
    print("Gerando OG image e verificando o site...")
    run_local([sys.executable, str(ROOT / "scripts" / "generate_og.py")])
    run_local([npm, "run", "check"])
    run_local([npm, "run", "build"], site_url=f"https://{domain}/")
    dist = ROOT / "dist"
    index = dist / "index.html"
    if not index.is_file():
        raise DeployError("O build não gerou dist/index.html.")
    parser = MetaParser()
    parser.feed(index.read_text(encoding="utf-8"))
    expected_image = f"https://{domain}/og-image.png"
    if parser.meta.get("og:image") != expected_image or not (dist / "og-image.png").is_file():
        raise DeployError("A OG image ou sua URL pública não entrou corretamente no build.")
    files: list[tuple[Path, str, str, int]] = []
    for path in sorted(dist.rglob("*")):
        if path.is_file():
            content = path.read_bytes()
            files.append((path, path.relative_to(dist).as_posix(), hashlib.sha1(content).hexdigest(), len(content)))
    if not files:
        raise DeployError("O diretório dist/ está vazio.")
    return files


class API:
    def __init__(self, credentials: dict[str, str], team_id: str | None, zone_id: str | None = None) -> None:
        self.vercel_token = credentials["VERCEL_TOKEN"]
        self.cloudflare_token = credentials["CLOUDFLARE_API_TOKEN"]
        self.zone_id = zone_id or credentials["CLOUDFLARE_ZONE_ID"]
        if not re.fullmatch(r"[0-9a-fA-F]{32}", self.zone_id):
            raise DeployError("CLOUDFLARE_ZONE_ID deve ter 32 caracteres hexadecimais.")
        self.team_id = team_id or credentials.get("VERCEL_TEAM_ID") or None

    def request(
        self, service: str, method: str, path: str, *, query: dict[str, Any] | None = None,
        payload: dict[str, Any] | None = None, data: bytes | None = None,
        headers: dict[str, str] | None = None, allow_404: bool = False,
    ) -> Any:
        base = VERCEL_API if service == "vercel" else CLOUDFLARE_API
        token = self.vercel_token if service == "vercel" else self.cloudflare_token
        params = dict(query or {})
        if service == "vercel" and self.team_id:
            params["teamId"] = self.team_id
        url = base + path + ("?" + urlencode(params) if params else "")
        body = json.dumps(payload).encode("utf-8") if payload is not None else data
        request_headers = {"Authorization": f"Bearer {token}", "Accept": "application/json"}
        if payload is not None:
            request_headers["Content-Type"] = "application/json"
        if headers:
            request_headers.update(headers)
        request = Request(url, data=body, headers=request_headers, method=method)
        try:
            with urlopen(request, timeout=30) as response:
                response_body = response.read()
        except HTTPError as error:
            if allow_404 and error.code == 404:
                return None
            raw = error.read().decode("utf-8", errors="replace")
            try:
                details = json.loads(raw)
                api_error = details.get("error") or (details.get("errors") or [{}])[0]
                message = api_error.get("message") or api_error.get("code") or "Falha na API"
            except (ValueError, TypeError, AttributeError, IndexError):
                message = "Falha na API"
            message = str(message).replace(self.vercel_token, "[oculto]").replace(self.cloudflare_token, "[oculto]")
            raise DeployError(f"{service} {method} {path}: HTTP {error.code} — {message}") from None
        except URLError as error:
            raise DeployError(f"Falha de conexão com {service}: {error.reason}") from None
        if not response_body:
            return {}
        result = json.loads(response_body)
        if service == "cloudflare":
            if result.get("success") is not True:
                errors = result.get("errors") or []
                message = errors[0].get("message", "Falha na Cloudflare") if errors else "Falha na Cloudflare"
                raise DeployError(f"Cloudflare: {message}")
            return result.get("result")
        return result

    def vercel(self, method: str, path: str, **kwargs: Any) -> Any:
        return self.request("vercel", method, path, **kwargs)

    def cloudflare(self, method: str, path: str, **kwargs: Any) -> Any:
        return self.request("cloudflare", method, path, **kwargs)


def cloudflare_records(api: API, name: str) -> list[dict[str, Any]]:
    records = api.cloudflare(
        "GET", f"/zones/{api.zone_id}/dns_records", query={"name": name, "per_page": 100}
    )
    return [record for record in records if record.get("name", "").rstrip(".").lower() == name]


def ensure_txt(api: API, name: str, value: str, zone_name: str) -> None:
    name = dns_record_name(name)
    if name != zone_name and not name.endswith("." + zone_name):
        raise DeployError("O TXT de verificação solicitado pela Vercel está fora da zona Cloudflare.")
    records = cloudflare_records(api, name)
    if any(record.get("type") == "TXT" and record.get("content") == value for record in records):
        return
    api.cloudflare("POST", f"/zones/{api.zone_id}/dns_records", payload={
        "type": "TXT", "name": name, "content": value, "ttl": 1,
    })
    print(f"TXT de verificação criado em {name}.")


def preferred_target(config: dict[str, Any], apex: bool) -> tuple[str, str]:
    key = "recommendedIPv4" if apex else "recommendedCNAME"
    for recommendation in sorted(config.get(key) or [], key=lambda item: item.get("rank", 999)):
        raw = recommendation.get("value")
        values = raw if isinstance(raw, list) else [raw]
        for value in values:
            if not isinstance(value, str) or not value:
                continue
            if apex:
                try:
                    ipaddress.IPv4Address(value)
                    return "A", value
                except ipaddress.AddressValueError:
                    continue
            else:
                return "CNAME", value.rstrip(".").lower()
    raise DeployError("A Vercel não retornou um destino DNS recomendado para este domínio.")


def ensure_dns(api: API, domain: str, record_type: str, target: str, replace: bool) -> None:
    records = cloudflare_records(api, domain)
    website_records = [record for record in records if record.get("type") in DNS_TYPES]
    matching = [record for record in website_records if record.get("type") == record_type and (
        record.get("content", "").rstrip(".").lower() == target.rstrip(".").lower()
    )]
    conflicting = [record for record in website_records if record not in matching]
    if conflicting and not replace:
        summary = ", ".join(f"{record['type']} {record.get('content', '')}" for record in conflicting)
        raise DeployError(
            f"DNS existente em {domain}: {summary}. Revise-o ou execute novamente com --replace-dns."
        )
    record_ids = [record.get("id", "") for record in conflicting]
    if any(not re.fullmatch(r"[0-9a-fA-F]{32}", record_id) for record_id in record_ids):
        raise DeployError("A Cloudflare retornou um ID de registro inválido; nenhum DNS foi removido.")
    for record_id in record_ids:
        api.cloudflare("DELETE", f"/zones/{api.zone_id}/dns_records/{record_id}")
    if matching:
        for record in matching:
            if record.get("proxied"):
                api.cloudflare("PATCH", f"/zones/{api.zone_id}/dns_records/{record['id']}", payload={"proxied": False})
        print(f"DNS de {domain} já aponta para a Vercel.")
        return
    api.cloudflare("POST", f"/zones/{api.zone_id}/dns_records", payload={
        "type": record_type, "name": domain, "content": target, "ttl": 1, "proxied": False,
    })
    print(f"DNS criado: {domain} {record_type} {target} (somente DNS).")


def ensure_project(api: API, name: str) -> str:
    project = api.vercel("GET", f"/v9/projects/{quote(name, safe='')}", allow_404=True)
    if project is None:
        project = api.vercel("POST", "/v11/projects", payload={"name": name, "framework": None})
        print(f"Projeto Vercel criado: {name}.")
    else:
        print(f"Projeto Vercel encontrado: {name}.")
    project_id = project.get("id")
    if not project_id:
        raise DeployError("A Vercel não retornou o ID do projeto.")
    return project_id


def deploy_files(api: API, project: str, name: str, files: list[tuple[Path, str, str, int]]) -> dict[str, Any]:
    sent: set[str] = set()
    for path, _, digest, size in files:
        if digest in sent:
            continue
        api.vercel("POST", "/v2/files", data=path.read_bytes(), headers={
            "Content-Type": "application/octet-stream", "x-vercel-digest": digest,
            "Content-Length": str(size),
        })
        sent.add(digest)
    print(f"{len(files)} arquivos preparados para a Vercel.")
    deployment = api.vercel("POST", "/v13/deployments", payload={
        "name": name,
        "project": project,
        "target": "production",
        "files": [{"file": relative, "sha": digest, "size": size} for _, relative, digest, size in files],
        "projectSettings": {"framework": None, "outputDirectory": "."},
    })
    deployment_id = deployment.get("id")
    if not deployment_id:
        raise DeployError("A Vercel não retornou o ID da implantação.")
    for _ in range(36):
        status = api.vercel("GET", f"/v13/deployments/{quote(deployment_id, safe='')}")
        state = status.get("readyState")
        if state == "READY":
            print(f"Implantação pronta: https://{status.get('url') or deployment.get('url')}")
            return status
        if state in {"ERROR", "CANCELED"}:
            raise DeployError(f"Implantação Vercel terminou em {state}: {status.get('errorMessage') or ''}")
        time.sleep(5)
    raise DeployError("A implantação foi iniciada, mas não ficou pronta em 3 minutos. Confira o painel da Vercel.")


def ensure_project_domain(api: API, project: str, domain: str, zone_name: str) -> None:
    encoded_project = quote(project, safe="")
    encoded_domain = quote(domain, safe="")
    path = f"/v9/projects/{encoded_project}/domains/{encoded_domain}"
    assigned = api.vercel("GET", path, allow_404=True)
    if assigned is None:
        assigned = api.vercel("POST", f"/v10/projects/{encoded_project}/domains", payload={"name": domain})
        print(f"Domínio adicionado ao projeto: {domain}.")
    if assigned.get("verified") is False:
        challenges = [item for item in assigned.get("verification", []) if item.get("type") == "TXT"]
        if not challenges:
            raise DeployError("A Vercel solicitou verificação, mas não retornou um desafio TXT utilizável.")
        challenge = challenges[0]
        ensure_txt(api, challenge["domain"], challenge["value"], zone_name)
        verify_path = f"{path}/verify"
        for attempt in range(6):
            if attempt:
                time.sleep(10)
            try:
                result = api.vercel("POST", verify_path)
                if result.get("verified"):
                    print("Domínio verificado na Vercel.")
                    break
            except DeployError:
                if attempt == 5:
                    raise
        else:
            raise DeployError("O TXT foi criado, mas a verificação ainda não propagou. Execute o comando novamente mais tarde.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Publica o template na Vercel e configura o DNS na Cloudflare.")
    parser.add_argument("--project", required=True, help="Nome único do projeto Vercel deste cliente.")
    parser.add_argument("--domain", required=True, help="Domínio completo, ex.: sorriso.exemplo.com.")
    parser.add_argument("--credentials", type=Path, default=DEFAULT_CREDENTIALS, help="Caminho de credentials.env.")
    parser.add_argument("--team-id", help="ID da equipe Vercel, se o projeto não for da conta pessoal.")
    parser.add_argument("--zone-id", help="Outra zona Cloudflare, se o cliente não usar a zona do credentials.env.")
    parser.add_argument("--replace-dns", action="store_true", help="Substitui A/AAAA/CNAME conflitantes no mesmo nome.")
    parser.add_argument("--dry-run", action="store_true", help="Gera e valida o site localmente, sem acessar as APIs.")
    args = parser.parse_args()
    try:
        project = project_name(args.project)
        domain = domain_name(args.domain)
        files = build_site(domain)
        print(f"Build válido: {len(files)} arquivos; domínio de compartilhamento: https://{domain}/")
        if args.dry_run:
            print("Simulação concluída. Nenhum projeto, implantação ou registro DNS foi alterado.")
            return
        credentials = read_credentials(args.credentials)
        api = API(credentials, args.team_id, args.zone_id)
        zone = api.cloudflare("GET", f"/zones/{api.zone_id}")
        zone_name = domain_name(zone.get("name", ""))
        if domain != zone_name and not domain.endswith("." + zone_name):
            raise DeployError(f"{domain} não pertence à zona Cloudflare {zone_name}.")
        records = cloudflare_records(api, domain)
        if any(record.get("type") in DNS_TYPES for record in records):
            print("DNS existente detectado; o destino será comparado com a recomendação da Vercel antes de alterar.")
        project_id = ensure_project(api, project)
        deploy_files(api, project_id, project, files)
        ensure_project_domain(api, project_id, domain, zone_name)
        config = api.vercel("GET", f"/v6/domains/{quote(domain, safe='')}/config", query={
            "projectIdOrName": project_id,
        })
        record_type, target = preferred_target(config, apex=(domain == zone_name))
        ensure_dns(api, domain, record_type, target, args.replace_dns)
        status = api.vercel("GET", f"/v6/domains/{quote(domain, safe='')}/config", query={
            "projectIdOrName": project_id,
        })
        if status.get("misconfigured"):
            print(f"DNS criado para https://{domain}/. A propagação e o certificado ainda estão pendentes.")
        else:
            print(f"Domínio configurado: https://{domain}/. O certificado pode levar alguns minutos.")
    except (DeployError, OSError, ValueError, KeyError, json.JSONDecodeError) as error:
        parser.exit(1, f"Erro: {error}\n")


if __name__ == "__main__":
    main()
