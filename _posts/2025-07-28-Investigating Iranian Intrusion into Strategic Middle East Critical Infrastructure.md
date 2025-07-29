---
title: Investigando uma Intrusão de Longo Prazo em Infraestruturas Críticas do Oriente Médio
published: true
---

> _"Os conflitos modernos não se limitam mais a campos de batalha físicos. A guerra agora se estende pelas fibras óticas do mundo."_  

Em uma operação meticulosa e persistente, pesquisadores da FortiGuard Incident Response (FGIR) revelaram um ataque sofisticado contra uma infraestrutura crítica nacional (CNI) no Oriente Médio, possivelmente conduzido por um grupo de Ameaça Persistente Avançada (APT) patrocinado pelo estado iraniano — identificado como **Lemon Sandstorm**.
<hr />
## 📌 Contexto do Caso

Em novembro de 2024, um servidor Microsoft Exchange emitiu sinais de comportamento anômalo. A investigação subsequente revelou que a rede da vítima estava comprometida desde, pelo menos, **maio de 2023** — com indícios que remontam até 2021.

<p>A natureza e a duração da intrusão indicam **operações de espionagem cibernética com foco estratégico**, especialmente em momentos de tensão geopolítica.</p>

## 🧠 Lições-Chave da Investigação

 O grupo utilizou **web shells, backdoors e tunelamento de rede** para manter o acesso persistente por mais de um ano.
 Foram utilizados malwares customizados como **HanifNet**, **HXLibrary**, **NeoExpressRAT**, além de ferramentas conhecidas como **Mimikatz**, **AnyDesk** e **Ngrok**.
 A intrusão demonstrou uma **evolução tática contínua**, com operadores distintos aplicando técnicas específicas em momentos diferentes.
 A estrutura da rede da vítima possuía segmentações eficazes, o que forçou os atacantes a encadear múltiplos proxys para avançar entre os segmentos.

## 🕸️ Etapas da Intrusão

### 1. Estabelecimento do Acesso (Mai/2023 – Abr/2024)
 Uso de credenciais legítimas para acessar a VPN.
 Implantação de web shells como `default.aspx` e `UpdateChecker.aspx`.
 Backdoors como **HanifNet** e **HXLibrary** foram introduzidos via tarefas agendadas.

### 2. Consolidação da Presença (Abr – Nov/2024)
 Instalação de novos backdoors como **NeoExpressRAT** e shells interativos (ex: `RecShell`, `EmbedShell`).
 Escalonamento de privilégios e roubo de credenciais usando **password filters** e modificações em arquivos legítimos (`flogon.js`).

### 3. Reação à Contenção (Nov – Dez/2024)
O início das medidas de resposta por parte da vítima desencadeou uma nova onda de web shells e backdoors como **MeshCentral** e **SystemBC**.
Tentativas de reestabelecer o acesso via phishing e exploração de novas vulnerabilidades.

### 4. Contenção e Erradicação (Dez/2024 – Atual)
 A organização iniciou o isolamento e erradicação do acesso adversário, embora houvesse tentativas contínuas de retorno.

## 🧬 Análise Técnica: Ferramentas e TTPs

| Ferramenta           | Função                         |
|----------------------|--------------------------------|
| `HanifNet`           | Backdoor baseado em .NET       |
| `HXLibrary`          | Módulo IIS malicioso           |
| `NeoExpressRAT`      | RAT disfarçado via DLL e LOLBin|
| `Mimikatz` / `nanodump` | Roubo de credenciais (LSASS) |
| `Ngrok`, `plink`, `ReverseSocks5` | Tunelamento e evasão de segmentação |
| `RecShell`, `EmbedShell` | Web shells com interface e funções de execução remota |

> Destaque: o uso da técnica `T1218` (LOLBin `format.com`) para execução de DLLs maliciosas demonstra um alto nível de criatividade operacional.

## 🛡️ Recomendação de Defesa

A Fortinet recomenda que as organizações:

1. Reforcem o monitoramento de VPN e autenticação multifator.
2. Implementem detecção de uso anômalo de binários nativos do Windows (LOLBins).
3. Monitorem atividades persistentes como tarefas agendadas e web shells incomuns.
4. Façam varreduras regulares em busca de IOCs e ferramentas como `HanifNet`, `NeoExpressRAT`, `HXLibrary`.

## 🧭 Considerações Finais

O relatório não apenas expõe a profundidade da intrusão, mas também oferece **inteligência acionável** para proteger infraestruturas críticas contra APTs cada vez mais sofisticadas.

> _“A guerra cibernética não é mais coisa do futuro. Ela está acontecendo agora — silenciosa, persistente e infiltrada nos alicerces digitais das nações.”_

---

### 📚 Fontes

 Fortinet FortiGuard Labs. _Investigating Iranian Intrusion into Strategic Middle East Critical Infrastructure_, 2025.  
 📎 [Download do Relatório (PDF)](https://www.fortinet.com/content/dam/fortinet/assets/reports/report-incident-response-middle-east.pdf)
 [MITRE ATT&CK Framework](https://attack.mitre.org)
 [CISA Advisory AA24-241A](https://www.cisa.gov/news-events/cybersecurity-advisories/aa24-241a)

---
