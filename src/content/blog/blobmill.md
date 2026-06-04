---
title: 'blobmill: decompiled-source repos for closed firmware blobs'
description: 'A vendor-agnostic Python orchestrator that produces versioned, decompiled-source forks of permissively-licensed firmware blobs.'
pubDate: 'Jun 04 2026'
heroImage: '../../assets/blobmill/hero.jpg'
---

Most embedded SDKs ship a few precompiled binary libraries you can't read. ESP-IDF has `libphy.a`, `libbtdm_app.a`, the Zigbee lib, the Thread lib. They're shipped closed (proprietary radio control, calibration math) but under Apache-2.0, a black box in an otherwise-open codebase that the licence says you're perfectly free to pry open. When upstream ships a new release and the radio behaviour changes, the only way to know what changed *inside* the blob is to disassemble both versions, eyeball the diff, and guess.

A pattern that helps: for each upstream commit that touches a blob, run a decompiler over the archive's object members, and commit the resulting per-function text to a separate repo: one commit per upstream blob change, dated to upstream. After a while, `git log path/to/function.c` tells you exactly when upstream changed that function, and the diff is human-readable C.

**blobmill** generalises that pattern: a vendor-agnostic Python orchestrator that produces decompiled-source forks of any permissively-licensed binary-blob upstream.

## Why I built this

The motivation was a specific hunt. I wanted to make an ESP32-C3 receive a 2.4 GHz signal from a remote control whose radio uses a rate the current ESP-IDF PHY API doesn't expose. That left two possibilities: either it's genuinely impossible on this silicon (spoiler alert: I now suspect it is, and I've given up the hunt), or the supporting code was in earlier versions of the PHY blob (exposed by an internal API, controlled by an unused register, or simply present as dead code) and was later removed or hidden.

That second possibility is the kind of question only a *versioned* decompiled view can answer. The latest `libphy.a` only tells you what's shipping today. To see whether an earlier IDF release had an extra rate constant, an undocumented register write, a feature flag that was later switched off, or a code path that was once reachable, you need every historical revision of the blob sitting in a diff-able repo. With one in hand you can:

- Grep across the entire history for rate tables, modulation modes, or register addresses that aren't in the public datasheet.
- Diff between releases to find code that *disappeared*, the most interesting category, because something must have been calling it at some point.
- Spot constant tables and feature flags whose names hint at capabilities never surfaced through the public API.

The hunt itself is open-ended. The tool that makes it tractable is what this post is about.

## What it produces

```
blobmill.py --driver actions --upstream-repo espressif/esp-phy-lib
```

This creates `hoverboardhavoc/esp-phy-lib-decompiled`:

- **Master mirror.** The fork's `master` (or `main`) is a byte-identical mirror of upstream, never written, just there for the *forked from* provenance banner.
- **Orphan `decompiled` branch as default.** A parentless branch carrying the pipeline scaffold and per-function decompiled `.c` files under a directory tree that mirrors the upstream blob layout.
- **One commit per upstream blob-touching commit.** Each landed commit corresponds to a single upstream commit that modified a matching `.a` archive, committed by a fixed `blobmaster` identity, *dated to the upstream commit's date*, with a message linking back to the upstream SHA.
- **A GitHub Actions workflow** on the fork: `workflow_dispatch` (manual) plus a best-effort daily `schedule:` cron, so the fork can be brought up to date as upstream ships new blob revisions.

## What a generated file looks like

The decompiler is Ghidra. Each `.c` file is one function from one object file from one upstream archive, with a header anchoring it:

```c
/*
 * Last changed at upstream commit f2c0563...
 * https://github.com/espressif/esp-phy-lib/commit/f2c0563...
 * Upstream date: 2021-06-03 ...
 * Upstream subject: phy: ...
 * Source: esp32c3/libphy.a -> phy_init.o -> phy_pp_calibrate
 *
 * (C) Espressif, Apache-2.0.
 * Derivative work (this file): mechanical decompile via Ghidra (NSA, Apache 2.0).
 * Decompiler output may be incomplete or differ from original semantics.
 */
```

So if you want to know what changed in `phy_pp_calibrate` between two IDF versions, you `git log -p` that file in the decompiled repo. The diff is C, not a binary delta.

## Vendor-agnostic, license-aware

blobmill is not Espressif-specific. The orchestrator preflights any upstream:

- It queries the upstream's SPDX license via `gh api repos/<owner>/<repo> --jq .license.spdx_id`. Allowlist: Apache-2.0, MIT, BSD-2/3-Clause, ISC, 0BSD, Unlicense, CC0-1.0. Anything else is refused without an explicit `--license-override`.
- The detected SPDX identifier flows through into every generated artifact: the per-function header, the `NOTICE`, the `README`, and the shipped `LICENSE` file (fetched from the upstream itself, not bundled). Point blobmill at an MIT upstream and the generated repo will correctly say MIT throughout, not "Apache" by accident.
- Per-blob architecture detection. Reads each `.a` member's ELF header to pick the right Ghidra processor. RISC-V (`RISCV:LE:32:default`) is bundled and works for ESP32-C3/C6/H2 and friends; Xtensa (older ESP32 / S2 / S3) is recognised and skipped, because no bundled processor matches.

## The drain model

A single GitHub Actions run on a hosted runner is capped at 6 hours. blobmill processes a bounded batch per run (`MAX_COMMITS_PER_RUN` upstream commits, oldest-first), then reports remaining backlog in a committed `CATCHUP.md` and the run's job summary:

> **Status:** Batch OK - DRAIN-PENDING (re-run to continue)
> **Processed:** 50 / 71 upstream glob-commits
> **Remaining:** 21

You re-run the workflow (Actions tab → Run workflow, or `gh workflow run`) until it reports `0 commits remaining`. The first deploy of a long-historied repo may need several dispatches to fully catch up; afterwards it tracks new upstream commits one or two at a time as they appear.

A note on cron: it's there as a best-effort safety net. Empirically, scheduled workflows fire on forks but are heavily throttled (~2-3% of the requested cadence) and auto-disable after 60 days of repo idleness. Manual `workflow_dispatch` is the dependable trigger; treat cron as a bonus.

## Four reference forks

All four are Apache-2.0 ESP-IDF blobs, currently caught up to upstream:

| Fork | Blob | Decompile commits |
|---|---|---|
| [`esp-phy-lib-decompiled`](https://github.com/hoverboardhavoc/esp-phy-lib-decompiled) | Wi-Fi/BT PHY across c2/c3/c5/c6/c61/h2/h21/h4/s2/s3 chips | 128 |
| [`esp32c3-bt-lib-decompiled`](https://github.com/hoverboardhavoc/esp32c3-bt-lib-decompiled) | Bluetooth controller (ESP32-C3) | 104 |
| [`esp-zigbee-sdk-decompiled`](https://github.com/hoverboardhavoc/esp-zigbee-sdk-decompiled) | Zigbee lib (ESP32-C3) | 65 |
| [`esp-thread-lib-decompiled`](https://github.com/hoverboardhavoc/esp-thread-lib-decompiled) | Thread / OpenThread (ESP32-C3) | 71 |

Each ships a parentless orphan `decompiled` default branch beside an intact upstream-mirror master, with `workflow_dispatch` + daily cron wired up.

A small note on what GitHub's "this branch is X commits ahead, Y commits behind" banner shows on these forks: since `decompiled` is an orphan with no shared history with upstream's source branch, "ahead" is the count of blobmill's per-commit decompile commits, and "behind" is upstream's whole source history (none of which is meaningful to carry on the decompiled branch). It's not a sign the fork is stale; the *master mirror* is the branch that tracks upstream, and it does so byte-for-byte.

## What it's good for

- **Reading what changed in a closed blob across releases.** `git log path/to/function.c` instead of "diff two `.a` archives."
- **Finding code that was removed.** Diff `decompiled/` between any two upstream releases; functions that no longer appear are the leads worth chasing.
- **Bisecting bug-onset against blob revisions.** Each blob change is one commit; binary-search across them.
- **Behavioural auditing of opaque library updates** in projects that ship precompiled vendor code.
- **A persistent reference for the RE community:** the four forks above sit on GitHub indefinitely, daily-best-effort-updated, no local infrastructure required to read them.

## Limitations

- **Decompiler output is approximate.** Ghidra reconstructs C-like text from machine code; variable names are synthetic, types best-guessed, inlined optimisations stay inlined. It's a reading aid for understanding what changed, not a buildable reimplementation.
- **Bundled Ghidra processors only.** Xtensa blobs are recognised and skipped rather than wrongly decompiled.
- **Public repos only.** The license gate refuses non-permissive upstreams without an explicit override; the design assumes the generated decompiled repo is itself public.
- **Cron on forks is best-effort.** Manual dispatch is what you rely on when you care about being current.

## Try it

The orchestrator is one Python file plus a templates directory, stdlib only, no third-party packages. Use `--driver local` first to validate against a target (throwaway decompile in a tmp dir with a deterministic 2-pass no-churn check, no GitHub touch), then `--driver actions` to deploy the real fork:

```
blobmill.py --driver local   --upstream-repo <owner/repo>
blobmill.py --driver actions --upstream-repo <owner/repo>
```

Source at **[github.com/hoverboardhavoc/blobmill](https://github.com/hoverboardhavoc/blobmill)**.
