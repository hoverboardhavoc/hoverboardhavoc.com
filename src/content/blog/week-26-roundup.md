---
title: 'Week 26, 2026: roundup'
description: 'The plan was one thing: set a config value on a real board from the configurator and read it back. The round trip is not finished. The on-board storage half got built and verified, and a pile of GD32F130 boards got bricked and then recovered along the way.'
pubDate: 'Jun 26 2026'
heroImage: '../../assets/week26/bench-microscope-ttc2541.jpg'
---

[The plan for this week](/blog/week-26-the-plan/) was a single bar: prove the runtime-config path end to end, set one config value on a real board from the configurator and read it back. That round trip is not finished. The on-board half of it got built and verified, the leg that completes it did not, and a pile of boards got bricked and then recovered along the way.

## The storage half got built

A board can now keep its configuration in flash. The [`hoverboard-firmware`](https://github.com/hoverboardhavoc/hoverboard-firmware) config store is a log-structured, wear-aware key/value store (settings appended as tagged records, newest wins, erase only to reclaim), tested host-side against a mock and then against a silicon oracle. Sitting on it is the first universal binary: it boots safe, detects which chip it is on, mounts the store, and runs, on real silicon of both families. Underneath, [`runtime-hal`](https://github.com/hoverboardhavoc/runtime-hal) gained the piece this needed, a runtime-detected flash erase/program driver, bench-validated across both page-size layouts.

So the storage layer stands up, end to end, on hardware.

## The round trip is unfinished

The bar needed three things standing up together: storage, the link, and the bridge. Only storage is there. The configurator-to-board path, the link protocol carrying a `CONFIG_WRITE` and the bridge relaying it onto the board, is not finished, so there is no value-set-from-the-web-tool-and-read-back to demo yet. The motor already spins under six-step on both chips; the configuration half is still missing its last leg.

## The detour: bricked, then unbricked

A chunk of the week went to a detour: a pile of GD32F130 boards came up locked out over SWD, looking dead. They were not damaged, and an ESP32 probe that drives the reset pin brought every one back ([full write-up](/blog/unbricking-hoverboard-controllers/)). A side thread fell out of it too, flashing [open CMSIS-DAP firmware](https://github.com/devanlai/dap42) onto a spare ST-Link clone over USB, no soldering. Maybe I will write that one up.

## Where it leaves it

The storage half is done and the brick scare is behind me. The round trip is not finished: the link and the bridge are the parts still missing between a value in the on-board store and a value set from a web page.
