---
layout: post
title: "Do Creeper ao XDR: 55 anos de um único loop"
date: 2026-09-11 09:00:00 -0300
categories: [seguranca]
tags: [edr, xdr, deteccao, historia, mitre-attack, threat-hunting]
description: >-
  Cada salto ofensivo gerou um contragolpe defensivo. Do primeiro worm em 1971
  aos EDR killers de 2026 — e por que a história da defesa de endpoint não é a
  história de progresso que costumam contar.
image: /assets/images/creeper-xdr/fig1_loop.png
---

**Cada salto ofensivo gerou um contragolpe defensivo. Cada contragolpe gerou um novo salto. Esta é a história desse loop — e do que ele revela sobre 2026.**

---

Quase todo artigo sobre a história do antivírus começa em 1986, com o Brain. Este começa em 1971 — e não por nostalgia.

Começa ali porque é ali que nasce o padrão que se repete até hoje: **um programa que se replica → uma contramedida que o caça → uma nova geração que evade → uma nova geração de caça.**

Esse ciclo é a espinha dorsal da segurança de endpoint. Quem opera resposta a incidentes, threat hunting ou arquitetura de detecção trabalha dentro dele todos os dias, quase sempre sem nomeá-lo.

E há um detalhe que quase ninguém conta: **a evasão chegou antes da detecção.** Volto a isso no capítulo 2.

![O loop fundamental: Creeper 1971, Reaper 1972, Brain 1986 e os primeiros antivírus em 1987, com seta de retorno indicando que o ciclo recomeça]({{ '/assets/images/creeper-xdr/fig1_loop.png' | relative_url }})

**Figura 1** — O loop fundamental: o padrão nasce entre 1971 e 1987 e nunca mais muda de forma.

---

## 1. A gênese (1971–1972): o primeiro loop completo

### Creeper (1971)

**Autor:** Bob Thomas, na BBN Technologies.
**Ambiente:** mainframes DEC PDP-10 rodando o sistema operacional TENEX, conectados pela ARPANET.
**Comportamento:** programa auto-replicante que migrava entre sistemas e imprimia no teleimpressor:

> `I'M THE CREEPER : CATCH ME IF YOU CAN`

**Intenção:** experimental. A pergunta era se um programa conseguiria se mover sozinho entre máquinas. Conseguiu.

Tecnicamente, a versão auto-replicante do Creeper é hoje aceita como o **primeiro worm de computador** — não um vírus, já que não infectava hospedeiros, apenas se movia.

### Reaper (1972)

**Autor:** Ray Tomlinson — o mesmo que inventou o e-mail.
**Mecanismo:** também um worm. Mesma forma, missão oposta: percorrer a ARPANET, localizar instâncias do Creeper e removê-las.

E aqui está o primeiro fato desconfortável desta história: **a primeira contramedida da história tinha exatamente a mesma natureza da ameaça que combatia.** Não era um scanner estático esperando ser executado. Era um caçador ativo, autônomo, que se propagava pela rede para encontrar seu alvo.

**Leitura para quem faz IR hoje:** o Reaper já praticava algo que só ganharia nome quarenta anos depois — varredura autônoma, correlação por assinatura e ação de remediação sem intervenção humana. A diferença entre ele e um EDR moderno não é conceitual. É de escala, telemetria e persistência.

---

## 2. A era dos PCs (1986–1995): quando a evasão chegou primeiro

### Brain (19 de janeiro de 1986)

**Autores:** irmãos Basit e Amjad Farooq Alvi, de Lahore, no Paquistão.
**Tipo:** vírus de setor de boot para MS-DOS.
**Propagação:** disquetes.
**Curiosidade:** trazia nome, endereço e três telefones dos autores no próprio código — pedindo que quem estivesse infectado os procurasse para "vacinação".

Mas o detalhe que quase nunca aparece é o que mais importa: **o Brain foi também o primeiro vírus stealth da história.**

Ele interceptava a interrupção `INT 13h`. Se você tentasse ler o setor de boot para inspecioná-lo, ele devolvia a cópia limpa que havia escondido. Com o vírus ativo na memória, a máquina parecia intacta sob o DEBUG.

Pare um segundo nisso. **O primeiro vírus de PC da história já era invisível ao método de detecção que só seria inventado no ano seguinte.**

Isso não é ironia histórica. É a regra — e é por isso que a narrativa de "corrida armamentista em que o defensor corre atrás" nasce torta. O atacante nunca esteve atrás.

### Morris Worm (2 de novembro de 1988)

**Autor:** Robert Tappan Morris, então na Cornell.
**Técnica:** exploração de vulnerabilidades em `sendmail`, `finger` e `rsh`, somada a ataque de dicionário em senhas.
**Impacto:** as estimativas mais citadas falam em cerca de 6.000 máquinas — algo em torno de 10% da Internet da época. *São estimativas contemporâneas, nunca auditadas com precisão, e vale tratá-las como ordem de grandeza.*
**Legado:** o primeiro incidente de segurança em larga escala da Internet levou diretamente à criação do **CERT/CC**, ainda em 1988.

### WM/Concept (1995)

**Ruptura:** primeiro vírus de macro encontrado em ambiente real.
**Vetor:** documentos do Word.
**Por que importa:** o arquivo de *dados* virou código executável. A premissa de que "só executável é perigoso" morreu ali — e com ela a ideia de que o sistema operacional define a superfície de ataque. Bastava o aplicativo hospedeiro.

---

## 3. O nascimento da indústria (1987–1991)

1987 é o ano zero dos dois lados. Aparecem Vienna, Cascade, Lehigh, Jerusalem, Stoned e o Christmas Tree EXEC na BITNET. E aparece a resposta.

**O primeiro registro de neutralização** não veio de um produto: **Bernd Fix** escreveu um programa para neutralizar o vírus Vienna em 1987 — a primeira vez documentada em que alguém desarmou um vírus.

No lado comercial, a cronologia real é mais espalhada do que costuma se dizer:

| Produto | Ano | Origem |
| --- | --- | --- |
| NOD (antecessor do NOD32) | 1987 | Tchecoslováquia |
| McAfee Associates / VirusScan | 1987 | EUA |
| **Norton AntiVirus** | **1991** | EUA — a Symantec só comprou a Peter Norton Computing em agosto de 1990 |
| **Dr Solomon's Anti-Virus Toolkit** | **1991** | Reino Unido — desenvolvimento iniciado em 1988 |

*Registro a lista com as datas corretas porque é comum ver as quatro agrupadas em 1987. Norton e Dr Solomon's são de 1991.*

**Mecanismo dominante:** assinatura estática e varredura sob demanda. Uma sequência de bytes equivalia a um veredito.

**Limitação estrutural:** a janela entre o surgimento da ameaça e a publicação da assinatura. E mais do que isso — o método já nascia cercado. O Cascade se autocriptografava **em 1987**, no mesmo ano em que a assinatura virou produto. O 1260, de Mark Washburn, trouxe o primeiro polimorfismo em 1990. Em 1992, o MtE do Dark Avenger transformou polimorfismo em biblioteca reutilizável: qualquer um passou a aplicá-lo.

**A assinatura durou cerca de cinco anos como método primário.** Cinco.

---

## 4. A crise da prevenção (2000–2012)

### As ameaças que romperam o modelo

**ILOVEYOU (2000)** — worm em VBScript por e-mail. Fala-se em mais de 45 milhões de máquinas e US$ 10 bilhões em prejuízo; *são estimativas de imprensa da época, com variação enorme entre fontes.*

**Code Red (julho de 2001)** — explorou estouro de buffer no IIS e atingiu cerca de 359 mil servidores em menos de 14 horas. Residia **apenas em memória**: foi o primeiro fileless de massa. Não havia arquivo para escanear.

**SQL Slammer (25 de janeiro de 2003)** — 376 bytes. Dobrava a população infectada a cada 8,5 segundos e atingiu 90% dos hosts vulneráveis do mundo em 10 minutos. **Nenhum processo humano de publicação de assinatura compete com dez minutos.**

**Stuxnet (2010)** — quatro zero-days, alvo em PLC/SCADA, e o detalhe que mudou a defesa para sempre: **drivers assinados com certificados roubados** da Realtek e da JMicron. Em 2012, o Flame foi além e forjou uma assinatura Microsoft explorando colisão de MD5 no serviço de licenciamento do Terminal Services.

A partir dali, **"assinado" deixou de significar "confiável"** — e boa parte do modelo defensivo daquele período dependia exatamente disso.

### E a aritmética

Hoje o AV-TEST registra **mais de 450 mil novas amostras de malware e PUA por dia**. Lista negra não morreu por má engenharia. Morreu por combinatória.

### A lacuna operacional

Os antivírus responderam com heurística, sandbox e proteção em tempo real — mas continuaram centrados em prevenção. O que não existia era o que mais fazia falta: **visibilidade pós-comprometimento**. Nenhuma capacidade de reconstruir o que aconteceu depois que a prevenção falhou.

Foi nessa lacuna que nasceram as primeiras equipes dedicadas de resposta a incidentes. E foi nela que nasceu a categoria seguinte.

![Linha do tempo de dois trilhos de 1971 a 2026, com marcos ofensivos à esquerda e defensivos à direita]({{ '/assets/images/creeper-xdr/fig2_timeline.png' | relative_url }})

**Figura 2** — Linha do tempo de dois trilhos: cada marco ofensivo e o contragolpe que ele provocou.

---

## 5. A revolução EDR (2013–2017): a rendição formal da prevenção

### O marco conceitual

Em julho de 2013, **Anton Chuvakin**, então na Gartner, cunhou o termo *Endpoint Threat Detection and Response* (ETDR). A definição original:

> *"tools primarily focused on detecting and investigating suspicious activities (and traces of such) and other problems on hosts/endpoints."*

Nos anos seguintes o termo se consolidou na forma abreviada, **EDR**.

### A mudança de paradigma

Aqui está a virada que poucos artigos nomeiam de forma direta: **o EDR não promete impedir. Promete gravar.**

É a primeira geração de produto de segurança cuja premissa de projeto é que a execução vai acontecer. Não é um antivírus melhor — é uma categoria com outro objetivo.

| | AV / EPP | EDR |
| --- | --- | --- |
| **Pergunta** | "Bloqueio ou permito?" | "O que aconteceu, de onde veio, como contenho?" |
| **Foco** | Pré-execução | Pós-comprometimento |
| **Dados** | Eventos de detecção pontuais | Telemetria contínua: árvore de processos, cmdline, registro, rede |
| **Ação** | Quarentena, exclusão | Isolamento, hunting, forense, automação de resposta |

E a métrica muda junto. Sai "taxa de detecção", entra **dwell time**. O sucesso deixa de ser *impedi* e passa a ser *descobri rápido*.

**Conexão com o ciclo de IR:** o EDR é, na prática, a materialização técnica do NIST SP 800-61 — preparação, detecção e análise, contenção, erradicação, recuperação, lições aprendidas — em escala automatizada.

### O que pressionou a camada

LOLBins e PowerShell. Nada "malicioso" chega a executar: só ferramentas assinadas do próprio sistema operacional, usadas com intenção hostil. O binário some como observável.

![Matriz comparando o que AV, EDR e XDR conseguem observar em nove domínios de telemetria]({{ '/assets/images/creeper-xdr/fig3_observavel.png' | relative_url }})

**Figura 3** — O que cada geração consegue observar, em nove domínios de telemetria.

---

## 6. A convergência XDR (2018–): quebrando silos de telemetria

### O problema do EDR isolado

Visão rica no endpoint — e cega para tudo o mais:

- **Rede** — movimentação lateral
- **E-mail** — o vetor inicial da maioria das campanhas
- **Nuvem** — IAM, storage, serverless
- **Identidade** — comprometimento de credencial, roubo de token OAuth, fadiga de MFA

Dois incidentes provaram isso de forma definitiva. O **SolarWinds (2020)** chegou por uma atualização legítima, assinada, distribuída pelo canal oficial — nenhum controle de endpoint tinha observável. O **LAPSUS$ (2022)** provou pelo outro lado: fadiga de MFA, sem binário nenhum envolvido.

### A definição

**Nir Zuk**, da Palo Alto Networks, cunhou o termo XDR em 2018. O argumento central:

> *"EDR loses its meaning without correlation with other data."*

Sobre a frase "EDR is dead, long live XDR" — ela circula desde cerca de 2018 em publicações do setor, **não é uma citação da Forrester de 2021.** O que a Forrester de fato fez foi mais concreto e mais tardio: em **Q4 2023** aposentou o *Forrester Wave™: Endpoint Detection And Response Providers* e passou a avaliar EDR como parte do mercado de XDR.

![Arquitetura XDR: cinco fontes de telemetria convergem para correlação, priorização e resposta unificada]({{ '/assets/images/creeper-xdr/fig4_xdr.png' | relative_url }})

**Figura 4** — Arquitetura XDR: cinco fontes convergem para correlação, priorização e resposta unificada.

**Para quem trabalha com nuvem:** é aqui que a segurança de endpoint encontra CSPM, CWPP e identidade. E vale o teste honesto — se o seu XDR não consome logs de nuvem, de identidade e de e-mail, ele é um EDR com outro nome.

---

## 7. O estado real em 2026 (e por que ele contradiz a narrativa de progresso)

Aqui vale interromper a linha do tempo e olhar o número.

A troca que a indústria fez foi clara: abandonou "impedir" e adotou "encurtar a janela". O dwell time mediano global caiu de mais de **400 dias em 2011** para **10 dias em 2023**. Foi um avanço real, e enorme.

Só que ele parou:

| Ano | Dwell time mediano global |
| --- | --- |
| 2011 | 416 dias |
| 2023 | 10 dias |
| 2024 | 11 dias |
| 2025 | **14 dias** |

**Dois anos consecutivos de piora — algo que nunca havia acontecido na série.** Richard Bejtlich, que acompanha essa métrica desde o início, registrou o ponto: antes do ano passado, ela só tinha melhorado.

E do outro lado, o relógio do atacante:

- A janela entre o acesso inicial e o repasse ao operador seguinte caiu de **mais de 8 horas em 2022 para 22 segundos em 2025**.
- **Exploração de vulnerabilidade** é o vetor inicial número 1 pelo sexto ano consecutivo (32%), ocorrendo em média **7 dias antes de o patch existir**.
- **Vishing** subiu para segundo vetor (11%), enquanto phishing por e-mail caiu para 6%.
- A ESET rastreia cerca de **90 EDR killers** em uso ativo. BYOVD — abusar de um driver assinado e vulnerável — deixou de ser técnica avançada e virou equipamento padrão de intrusão de ransomware.

*(Dados do M-Trends 2026, da Mandiant, e da pesquisa da ESET.)*

**A única métrica que melhorou:** 52% das detecções agora são internas, contra 43% no ano anterior.

### E o incidente que ninguém sabe onde encaixar

Em 19 de julho de 2024, uma atualização de conteúdo da CrowdStrike derrubou 8,5 milhões de máquinas Windows. Só a Delta reportou cerca de US$ 500 milhões. **O agente defensivo virou o maior incidente de disponibilidade da história da computação.**

Vale a leitura desconfortável: **foi um falso positivo.** Um conteúdo de detecção classificou o próprio kernel como algo a interromper. A resposta da Microsoft — a Windows Resiliency Initiative, tirando fornecedores de segurança do kernel — tem um custo que quase ninguém nomeia em voz alta: **menos kernel significa menos visibilidade.**

A camada mais avançada da defesa está sendo empurrada para longe daquilo que ela precisa observar.

---

## 8. O próximo salto — e ele já começou

O M-Trends 2026 documenta famílias como **PROMPTFLUX** e **PROMPTSTEAL**, que consultam um LLM **durante a execução**, e o **QUIETVAULT**, que procura ferramentas de IA locais na máquina da vítima.

Isso não é "malware com IA" como manchete. É uma mudança de categoria:

**A análise estática pressupõe que o comportamento está no código. Quando a lógica é buscada em tempo de execução, de um oráculo não-determinístico, o binário deixa de conter o programa.**

Não é evasão melhor. É outro problema.

Em paralelo, o outro lado da mesma fronteira: agentes de IA com credencial válida executando ações legítimas com intenção hostil. Nenhuma geração de defesa — da assinatura ao XDR — tem observável para *intenção*.

**E a honestidade necessária:** o próprio M-Trends 2026 afirma que 2025 **não** foi o ano em que brechas resultaram diretamente de IA. Falha humana e sistêmica continuam dominando. Quem estiver vendendo pânico de IA está adiantando o calendário.

---

## 9. Linha do tempo consolidada

| Ano | Marco ofensivo | Marco defensivo |
| --- | --- | --- |
| 1971 | Creeper — primeiro worm | — |
| 1972 | — | Reaper — primeira contramedida autônoma |
| 1986 | Brain — primeiro vírus de PC **e primeiro stealth** | — |
| 1987 | Vienna, Cascade, Lehigh, Jerusalem | Bernd Fix neutraliza o Vienna · NOD · McAfee |
| 1988 | Morris Worm | Criação do CERT/CC |
| 1990–92 | 1260 e MtE — polimorfismo commoditizado | Heurística e desempacotamento genérico |
| 1991 | — | Norton AntiVirus · Dr Solomon's |
| 1995 | WM/Concept — vírus de macro | — |
| 2001 | Code Red — fileless em memória | Proteção em tempo real |
| 2003 | SQL Slammer — 10 minutos | — |
| 2010–12 | Stuxnet e Flame — código assinado comprometido | Sandbox avançado, reputação em nuvem |
| 2013 | CryptoLocker — economia do ransomware | **EDR** (Chuvakin / Gartner) |
| 2018 | RaaS e ataques de identidade | **XDR** (Nir Zuk / Palo Alto) |
| 2020–22 | SolarWinds · LAPSUS$ | Correlação multi-domínio |
| 2024 | BYOVD e EDR killers | CrowdStrike: o agente vira o incidente |
| 2026 | PROMPTFLUX — lógica fora do binário | *ainda sem resposta de categoria* |

---

## 10. Cinco lições para quem opera

**1. Prevenção é necessária e insuficiente.** Assuma o comprometimento e invista o orçamento marginal em detecção e resposta, não em mais uma camada de bloqueio.

**2. Telemetria contínua vale mais que evento pontual.** O valor está na sequência. Um evento isolado quase nunca carrega veredito — e isso não é limitação de ferramenta, é a natureza do problema.

**3. Contexto é o que decide.** Um processo suspeito só significa algo correlacionado com rede, identidade e nuvem. Sem isso você tem um alerta, não uma detecção.

**4. Automação sem julgamento é perigosa — mas o relógio não espera.** Com hand-off de 22 segundos, humano no meio do laço deixou de ser viável para contenção inicial. O caminho é autonomia guiada, com o humano decidindo o que é irreversível.

**5. O loop se repete em camadas.** O ciclo Creeper/Reaper de 1971 acontece hoje em nível de LLM, IAM e serverless. Quem reconhece o padrão antecipa a próxima mudança em vez de reagir a ela.

---

## Três perguntas para levar para a segunda-feira

**Se você opera IR:** mapeie seus playbooks contra a telemetria que seu EDR realmente coleta. Onde estão os buracos de árvore de processos, relação pai-filho e linha de comando?

**Se você faz threat intel:** seus alertas chegam ao analista já enriquecidos com TTPs mapeados no ATT&CK e contexto de campanha — ou o analista faz isso à mão, toda vez?

**Se você arquiteta segurança:** seu XDR consome logs de nuvem, de identidade e de e-mail? Se não, você comprou um EDR caro.

E uma última, que é a que me interessa mais: **quando a lógica do malware mora fora do binário, o que exatamente o seu EDR está analisando?**

---

### Fontes

- Fred Cohen, *Computer Viruses — Theory and Experiments* (1984)
- Wikipédia — *Creeper and Reaper*; *Brain (computer virus)*; *Norton AntiVirus*; *Dr Solomon's Antivirus*
- F-Secure — descrição técnica do vírus Brain
- Kaspersky IT Encyclopedia — ano de 1987
- Anton Chuvakin (Gartner, 2013) — origem do termo ETDR/EDR
- Forrester — *The Extended Detection And Response Platforms Landscape, Q4 2023*
- Mandiant **M-Trends 2026** — dwell time, vetores iniciais, hand-off, PROMPTFLUX
- Richard Bejtlich (TaoSecurity) — série histórica de dwell time
- ESET Research — EDR killers e BYOVD
- AV-TEST — estatísticas de malware

---

*Este é o primeiro de uma série de dez artigos sobre detecção e resposta que estou escrevendo. Nos próximos, saio da história e entro no código: estou construindo um EDR genérico do zero, com o objetivo didático de entender como a solução se comporta debaixo dos panos, e melhorar o entendimento.*
