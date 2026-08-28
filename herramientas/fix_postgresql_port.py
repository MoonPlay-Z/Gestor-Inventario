#!/usr/bin/env python3
"""Diagnose and repair a PostgreSQL service blocked on TCP port 5432 on Windows."""

import argparse
import ctypes
import re
import subprocess
import sys
import time


def run(command):
    return subprocess.run(
        command,
        capture_output=True,
        text=True,
        encoding="mbcs",
        errors="replace",
        shell=False,
    )


def is_admin():
    try:
        return bool(ctypes.windll.shell32.IsUserAnAdmin())
    except (AttributeError, OSError):
        return False


def port_owner(port):
    result = run(["netstat", "-ano", "-p", "tcp"])
    pattern = re.compile(rf":{port}\s+\S+\s+LISTENING\s+(\d+)", re.IGNORECASE)
    for line in result.stdout.splitlines():
        match = pattern.search(line)
        if match:
            return int(match.group(1))
    return None


def process_name(pid):
    result = run(["tasklist", "/FI", f"PID eq {pid}", "/FO", "CSV", "/NH"])
    fields = result.stdout.strip().split(",", 1)
    if fields and fields[0].startswith('"'):
        return fields[0].strip('"')
    return None


def postgres_services():
    result = run(["sc", "query", "type=", "service", "state=", "all"])
    return re.findall(r"SERVICE_NAME:\s*(\S+)", result.stdout, re.IGNORECASE | re.MULTILINE)


def service_state(service):
    result = run(["sc", "query", service])
    match = re.search(r"STATE\s*:\s*\d+\s+(\w+)", result.stdout)
    return match.group(1).upper() if match else "UNKNOWN"


def service_action(action, service):
    result = run(["sc", action, service])
    if result.returncode != 0:
        message = (result.stdout + result.stderr).strip()
        print(f"[WARN] sc {action} {service}: {message}")
        return False
    print(f"[OK]   Servicio {service}: {action}")
    return True


def wait_for_port(port, seconds):
    for _ in range(seconds):
        owner = port_owner(port)
        if owner:
            return owner
        time.sleep(1)
    return None


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--port", type=int, default=5432, help="Puerto PostgreSQL (default: 5432)")
    parser.add_argument("--wait", type=int, default=30, help="Segundos de espera (default: 30)")
    parser.add_argument("--force", action="store_true", help="Detener procesos PostgreSQL y reiniciar el servicio")
    parser.add_argument("--auto", action="store_true", help="Configurar el servicio PostgreSQL con inicio automatico")
    args = parser.parse_args()

    if sys.platform != "win32":
        print("[ERROR] Este script debe ejecutarse en Windows.")
        return 1
    if not is_admin():
        print("[ERROR] Abre PowerShell como administrador y ejecuta el script nuevamente.")
        return 1

    services = [name for name in postgres_services() if "postgres" in name.lower()]
    owner = port_owner(args.port)
    if owner:
        name = process_name(owner) or "proceso desconocido"
        print(f"[INFO] El puerto {args.port} esta ocupado por {name} (PID {owner}).")
        if name.lower() != "postgres.exe":
            print("[ERROR] El proceso no es PostgreSQL. No se detendra automaticamente.")
            return 1
        if not args.force:
            print("[INFO] Ejecuta con --force para reparar el proceso PostgreSQL.")
            return 2

        for service in services:
            if service_state(service) == "RUNNING":
                service_action("stop", service)
        run(["taskkill", "/PID", str(owner), "/F"])
        print(f"[OK]   Proceso PostgreSQL PID {owner} terminado.")
    else:
        print(f"[INFO] El puerto {args.port} esta libre.")

    if not services:
        print("[ERROR] No se encontro un servicio PostgreSQL instalado.")
        return 1

    service = services[0]
    if args.auto:
        result = run(["sc", "config", service, "start=", "auto"])
        if result.returncode != 0:
            print(f"[WARN] No se pudo configurar inicio automatico: {result.stdout.strip()}")
        else:
            print(f"[OK]   Inicio automatico configurado para {service}.")

    if service_state(service) != "RUNNING":
        service_action("start", service)

    new_owner = wait_for_port(args.port, args.wait)
    if not new_owner:
        print(f"[ERROR] PostgreSQL no escucha en el puerto {args.port} despues de {args.wait} segundos.")
        print("[INFO] Revisa el log de PostgreSQL y el archivo postgresql.conf.")
        return 1

    print(f"[OK]   PostgreSQL escucha en {args.port} (PID {new_owner}).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
