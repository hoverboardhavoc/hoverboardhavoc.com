---
title: 'Week 24, 2026: what got done'
description: 'Wireless SWD flashing works on both boards, commutation runs and the IMU reads clean, but the board still does not balance and the phone app slipped. One PR out the door.'
pubDate: 'Jun 12 2026'
heroImage: '../../assets/week24/wireless-swd-probe.jpg'
---

[The plan for this week](/blog/week-24-the-plan/) had four items. Here is the scorecard:

- ✅ **Wireless SWD on both boards** — done (probes externally powered, by choice).
- ❌ **Balance under control** — not reached; commutation and IMU both working underneath.
- ❌ **Phone app** — slipped.
- ✅ **RoboDurden cleanup PR** — submitted.

One finished cleanly, one made real progress without reaching the bar, one slipped, and the side quest is out the door. Here is where each ended up.

## Wireless SWD: done, on both boards

This is the win of the week. Both motor-controller boards now flash over the air, no jumpers running to the bench. An ESP32-C3 SuperMini sits on each board as a CMSIS-DAP probe, speaks SWD to the GD32 on one side and talks to the host over Wi-Fi on the other. It runs [wireless-esp32-dap](https://github.com/hoverboardhavoc/wireless-esp32-dap), my fork of the probe firmware. The point of the fork was to upgrade the SDK: upstream pins ESP-IDF v4.4.2 so it can share code with the ESP8266 RTOS SDK, and my port moves it to ESP-IDF v5.x. The cost of that is dropping the old ESP8266 and scoping the firmware to the ESP32 family. I also added wiring and pin-assignment documentation specifically for the ESP32-C3 SuperMini. Edit, build, flash both boards wirelessly, reset, read telemetry back, with the platform free to thrash around on the floor.

One deliberate choice on power. It would have been nice to feed each probe off the board's own rail, but I chose not to: I don't trust these controllers' voltage regulators to supply enough current for the probe on top of everything else they already drive. So the probes run off external power (a power bank), not the board. Powering them cleanly off the board is a goal for later, because the endgame is two of these living permanently on a moving robot.

Every run also threw a warning I tracked down along the way: OpenOCD complained on shutdown while trying to `free()` an interior pointer in the elaphureLink backend. The flash itself always succeeded, the warning just appeared on the way out. The fix, clearing the two dangling pointers into `ctx` after it is freed so the generic cleanup does not touch them, went upstream as [a PR](https://github.com/windowsair/openocd-elaphurelink/pull/4). The full chain (probe firmware, the patched OpenOCD bridge, and that fix) is worth its own write-up, coming separately.

## Toward balance: commutation and the IMU

Balance under control did not happen. The board does not balance yet. But the two pieces the balance loop is built on both came up this week.

Commutation runs: I can drive the hub motors under control through the firmware, the windings energize in the right order, the motor turns the way it is told. And the IMU reads clean, so the firmware can see which way is down and how fast that is changing. Working commutation plus a trustworthy angle signal are exactly the two inputs a balance controller needs. What is missing is the loop that ties them together: read the tilt, decide the correction, command the motors, fast enough and stable enough to stand the thing up. That is next.

So: not a miss, but not the milestone either. Both inputs the balance loop needs are working; balance itself is not demonstrated yet.

## The phone app: slipped

Driving the board from a phone over its own BLE did not get started this week. The drive-over-Bluetooth firmware from last week still exists and still works, it just did not get a front end. The wireless-SWD work and getting commutation and the IMU up ate the time. This rolls forward.

## Side quest: PR submitted

The dead-code cleanup for [RoboDurden's firmware](https://github.com/RoboDurden/Hoverboard-Firmware-Hack-Gen2.x) is up: a pull request removing the sine/dead-time branch that can never run, gated on a misspelled `#ifdef` I found the week before. Small, but it is out.
