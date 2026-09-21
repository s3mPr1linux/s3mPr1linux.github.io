---
title:       "BTL1 Exam"
summary:     "Blue Team Level 1"
category:    "CENTRI"
tags:        [btl1, centri]
updated:     2026-07-26
---

{% raw %}

*These notes will come handy in exam.*

## SOC Fundamentals

- CIA Triad → Confidentiality, Integrity, Availability
- IOC Types → IP, Domain, URL, Hash
- False Positive vs True Positive
- Alert vs Incident

List of common ports.

| Port | Service | Description |
|---|---|---|
| 20,21 | FTP | File Transfer Protocol |
| 22 | SSH | Secure remote access |
| 23 | Telnet | Unencrypted remote access |
| 25 | SMTP | Send emails |
| 53 | DNS | Domain → IP |
| 67,68 | DHCP | Auto IP assign |
| 80 | HTTP | Web traffic |
| 110 | POP3 | Email retrieval |
| 143 | IMAP | Email sync |
| 137-139 | NetBIOS | Windows sharing |
| 443 | HTTPS | Secure web |
| 445 | SMB | Lateral movement |
| 3389 | RDP | Remote desktop |
| 8080 | HTTP Alt | Proxy/web |
| 8443 | HTTPS Alt | Secure web |
| 514 | Syslog | Logs |

Exam Tips:

- 445 → lateral movement
- 3389 → brute force/external access
- 22 → SSH brute force

## Phishing Analysis

### ADD:

- SPF → pass/fail
- DKIM → signature validation
- DMARC → policy result
- Received headers → trace path
- Domain mismatch → phishing
- Short URLs ([bit.ly](http://bit.ly/))
- Typosquatting ([paypaI.com](http://paypai.com/))

### Gathering IOCs

1. Email Artifacts :

- Sending Email Address
- Subject Line
- Recipient Email Addresses
- Sending Server IP & Reverse DNS
- Reply-To Address
- Date & Time
- Received headers

1. Web Artifacts :

- Full URLs
- Domain Names

1. File Artifacts :

- Attachment Name
- MD5, SHA1, SHA256 Hash Value
- File extension (.exe, .zip, .html)

### Analyzing Artifacts

ADD:

- Multiple detections → suspicious
- New domain → suspicious
- AbuseIPDB flagged IP → malicious

## Digital Forensics

ADD:

- Timeline analysis is key
- Always correlate artifacts

1. Data Representation

- Base64
- Hexadecimal
- Octal
- ASCII
- Binary

ADD:

- Base64 often used in malware

1. File Carving scalpel -b -o <output> <disk image file>
2. Hashes

| Hash | Length |
|---|---|
| MD5 | 32 |
| SHA1 | 40 |
| SHA256 | 64 |

1. Windows Investigations

ADD:

Registry Persistence: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run HKLM\\Software\\Microsoft\\Windows\\CurrentVersion\\Run

Startup Folder: C:\\Users\\%username%\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup

Event IDs: 4624 → Success login 4625 → Failed login 4634 → Logoff 4672 → Admin login 4688 → Process creation 4720 → User created 4726 → User deleted 4732 → Added to admin

Notes:

- 4688 → detect execution
- Multiple 4625 → brute force

1. Linux Investigations

ADD:

- /var/log/auth.log → SSH logins
- /var/log/syslog → system logs
- crontab -l → persistence

1. Volatility

ADD:

- Look for suspicious processes
- Hidden processes
- Network connections

Red Flags:

- powershell.exe
- cmd spawning powershell
- unknown parent-child

1. Metadata

ADD:

- Check author and timestamps

## Security Information and Event Management

### SPLUNK

index="botsv1"

index="botsv1" src="127.0.0.1"

index="botsv1" src="127.0.0.1" dst="X.X.X.X"

ADD:

index="botsv1" | stats count by src

index="botsv1" | top src\_ip

index="botsv1" "failed password"

## Incident Response

ADD:

IR Lifecycle:

1. Preparation
2. Identification
3. Containment
4. Eradication
5. Recovery
6. Lessons Learned

## CMD

ipconfig /all tasklist wmic process get description, executablepath net users net localgroup administrators net localgroup "Remote Desktop Users" sc query | more netstat -ab

ADD: netstat -ano whoami

## Powershell

Get-NetIPConfiguration Get-NetIPAddress Get-LocalUser Get-LocalUser -Name BTLO | select *Get-Service | Where Status -eq "Running" | Out-GridView Get-Process | Format-Table -View priority Get-Process -Id 'idhere' | Select* Get-ScheduledTask Get-ScheduledTask -TaskName 'PutANameHere' | Select \* Set-ExecutionPolicy Bypass -Scope CurrentUser

ADD:

powershell -enc powershell -nop -w hidden

Notes:

- Encoded PowerShell → suspicious
- Scheduled tasks → persistence
- Services → persistence

## DeepBlueCLI

./DeepBlue.ps1 log.evtx ./DeepBlue.ps1 -log security ./DeepBlue.ps1 -log system Set-ExecutionPolicy Bypass -Scope CurrentUser

ADD:

- Detects suspicious logons
- Detects PowerShell abuse
- Detects privilege escalation

## FINAL QUICK NOTES

- Multiple failed logins → brute force
- Encoded PowerShell → malware
- New admin user → compromise
- Suspicious scheduled task → persistence
- External RDP → high risk

GOLDEN RULE: Correlate → IP + Domain + Hash + Timeline

**Phishing Analysis**

**Gathering IOCs**

1. **Email Artifacts** :

- \[ \] Sending Email Address
- \[ \] Subject Line
- \[ \] Recipient Email Addresses
- \[ \] Sending Server IP & Reverse DNS
- \[ \] Reply-To Address
- \[ \] Date & Time

1. **Web Artifacts** :

- \[ \] Full URLs
- \[ \] Domain Names

1. **File Artifacts** :

- \[ \] Attachment Name
- \[ \] MD5, SHA1, SHA256 Hash Value

**Analyzing Artifacts**

1. **Visualization Tools** - [URL2PNG](https://www.url2png.com/), [URLScan](https://urlscan.io/), [AbuseIPDB](https://www.abuseipdb.com/)
2. **URL Reputation Tools** - [VirusTotal](https://www.virustotal.com/gui/), [URLScan](https://urlscan.io/), [URLhaus](https://urlhaus.abuse.ch/), [WannaBrowser](https://www.wannabrowser.net/)
3. **File Reputation Tools** - [VirusTotal](https://www.virustotal.com/gui/), [Talos File Reputation](https://www.talosintelligence.com/talos_file_reputation)
4. **Malware Sandboxing** - [Hybrid Analysis](https://www.hybrid-analysis.com/), [Any.run](https://any.run/), [VirusTotal](https://www.virustotal.com/), [Joe Sandbox](https://www.joesandbox.com/)

**Digital Forensics**

1. Data Representation can be done in following ways,

- Base64
- Hexadecimal
- Octal
- ASCII
- Binary

1. File Carving :

```
scalpel -b -o <output> <disk image file>
```

1. Hashes :

- **Windows** -

By default, `get-filehash` command will generate SHA256 sum of a file,

```
get-filehash <file>
```

To generate MD5 hash of a file,

```
get-filehash -algorithm MD5 <file>
```

To generate SHA1 hash of a file,

```
get-filehash -algorithm SHA1 <file>
```

- **Linux** -

```
md5sum <file>
sha1sum <file>
sha256sum <file>
```

1. Find digital evidence with
  - **FTK Imager** - Import .img file in FTK imager
  - **KAPE** - Can be used for fast acquisition of data.
2. **Windows Investigations** :

- **LNK Files** - These files can be found at

```
C:\\Users\\$USER$\\AppData\\Roaming\\Microsoft\\Windows\\Recent
```

- **Prefetch Files** -
  - **PECmd** - This tool can be used to view the prefetch files. `PECmd.exe -f <path/to/file.pf>`

These files can be found at

```
C:\\Windows\\Prefetch
```

- **Jumplist Files** - These files can be found at

```
C:\\Users\\% USERNAME%\\AppData\\ Roaming\\Microsoft\\Windows\\Recent\\AutomaticDestinations
C:\\Users\\%USERNAME%\\AppData\\ Roaming\\Microsoft\\Windows\\Recent\\CustomDestinations
```

- **Logon Events**
  - **ID 4624** - successful logons to the system.
  - **ID 4672** - Special Logon events where administrators logs in.
  - **ID 4625** - Failed Logon events.
  - **ID 4634** - Logoffs from the current session.

These event logs can be found at

```
C:\\Windows\\System32\\winevt\\Logs
```

- Capture and view the browser history with
  - **Browser History Viewer**
  - **Browser History Capturer**

1. **Linux Investigations** :
  - **/etc/passwd** - contains all information about users in the system.
  - **/etc/shadow** - contains encrypted passwords
  - **Unshadow** - used to combine the passwd and shadow files.
  - **/var/lib** - In `/var/lib/dpkg/status` location, this file includes a list of all installed software packages.
  - **.bash\_history** - contains all the issued commands by the users.
  - **Hidden Files** - isuch files whose name begins with **.**
  - **Clear Files** - files that are accessible through standard means.
  - **Steganography** - practice of concealing messages or information within other non-secret text or data.
2. **Volatility** -

Find the imageinfo of the file,

```
volatility -f /path/to/file.mem imageinfo
```

List the processes of a system,

```
volatility -f /path/to/file.mem --profile=PROFILE pslist
```

View the process listing in tree form,

```
volatility -f /path/to/file.mem --profile=PROFILE pstree
```

View command line of the specific process with PID XXXX,

```
volatility -f /path/to/file.mem --profile=PROFILE dlllist -p XXXX
```

View Network Connections,

```
volatility -f /path/to/file.mem --profile=PROFILE netscan
```

Dumping the process with a specific PID XXXX,

```
volatility -f /path/to/file.mem --profile=PROFILE procdump -p XXXX -D /home/ubuntu/Desktop
```

Print all available processes,

```
volatility -f memdump.mem --profile=PROFILE psscan
```

Print expected and hidden processes,

```
volatility -f memdump.mem --profile=PROFILE psxview
```

Create a timeline of events from the memory image,

```
volatility -f memdump.mem --profile=PROFILE timeliner
```

Pull internet browsing history,

```
volatility -f memdump.mem --profile=PROFILE iehistory
```

Identify any files on the system from the memory image,

```
volatility -f memdump.mem --profile=PROFILE filescan
```

1. **Metadata** - Data about data

- **Exiftool**

```
exiftool <file>
```

**Security Information and Event Management**

**SPLUNK**

Queries must start by referencing the dataset,

```
index="botsv1"
```

To search for a source IP (src) address with a value of 127.0.0.1,

```
index="botsv1" src="127.0.0.1"
```

To search for a destination IP (dst) address that this source IP address made a connection with a value of X.X.X.X,

```
index="botsv1" src="127.0.0.1" dst="X.X.X.X"
```

**Incident Response**

1. **Network Analysis** - use Wireshark to import .pcap, .pcapng files.
2. **CMD** : Command prompt can be used to view the valuable information,

To view the network configuration of the system,

```
ipconfig /all
```

To check running processes and programs,

```
tasklist
```

Display running processes and the associated binary file that was executed to create the process,

```
wmic process get description, executablepath
```

To view all number of users in the command prompt

```
net users
```

List all users that are in the administrators user group,

```
net localgroup administrators
```

List all users in RDP group,

```
net localgroup "Remote Desktop Users"
```

List all services and detailed information about each one,

```
sc query | more
```

List open ports on a system, which could show the presence of a backdoor,

```
netstat -ab
```

1. **Powershell** - Can also be used often retrieve much more information.

These commands will get network-related information from the system,

```
Get-NetIPConfiguration
Get-NetIPAddress
```

List all local users on the system,

```
Get-LocalUser
```

Provide a specific user to the command to only get information about them,

```
Get-LocalUser -Name BTLO | select *
```

Quickly identify running services on the system in a nice separate window,

```
Get-Service | Where Status -eq "Running" | Out-GridView
```

Group running processes by their priority value,

```
Get-Process | Format-Table -View priority
```

Collect specific information from a service by including the name in the command (-Name ‘namehere’) or the Id, as shown above and below,

```
Get-Process -Id 'idhere' | Select *
```

Scheduled Tasks are often abused and utilized a common persistence technique,

```
Get-ScheduledTask
```

Specify the task, and retrieving all properties for it,

```
Get-ScheduledTask -TaskName 'PutANameHere' | Select *
```

Changing the Execution Policy applied to our user,

```
Set-ExecutionPolicy Bypass -Scope CurrentUser
```

1. **DeepBlueCLI** - PowerShell script that was created by SANS to aid with the investigation and triage of Windows Event logs.

To process log.evtx,

```
./DeepBlue.ps1 log.evtx
```

DeepBlue will point at the local system's Security or System event logs directly.

```python
# Start the Powershell as Administrator and navigate into the DeepBlueCli tool directory, and run the script

./DeepBlue.ps1 -log security
./DeepBlue.ps1 -log system
```

```python
# if the script is not running, then we need to bypass the execution policy

Set-ExecutionPolicy Bypass -Scope CurrentUser
```

{% endraw %}
