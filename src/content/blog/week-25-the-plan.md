---
title: 'Week 25, 2026: the plan'
description: 'Declassyfied: a clean-room firmware for the ClassyWalk offroad that reproduces the stock balancing and voltage-mode FOC drive, then adds drive over the board''s built-in wireless module. Extra commutation methods are a nice-to-have.'
pubDate: 'Jun 15 2026'
heroImage: '../../assets/week25/dv_web_D180001002468502.jpg'
---

This week's project is **Declassyfied**: an open-source, clean-room firmware for the ClassyWalk offroad, the GD32F130 self-balancing board from the now-defunct Stay Classy. There is no source, no support, and no spare parts, and the stock firmware is the only surviving record of how the hardware works. The first goal is to reproduce what the board already does. The more interesting goal is what comes after: the features the stock firmware never had.

## What the stock firmware does

Reverse-engineering the recovered image gives a clear picture of the original behavior, and that is the baseline to reproduce:

- **Self-balancing.** A Mahony complementary attitude filter at 250 Hz feeds a cascade of control loops (attitude to balance to speed/steer to current). The rider steers by tilting the foot pads.
- **Hall-sensor FOC, voltage mode.** The inner motor loop is field-oriented control with space-vector PWM: hall sensors for rotor position, a Clarke/Park transform, and SVPWM onto three complementary half-bridges. It is an unusual, half-closed-loop FOC: a single PI holds the field axis at zero while the torque axis is driven **open-loop** from one effort demand, the structure EFeru calls FOC *voltage* mode, rather than regulating a torque-current setpoint. This is the *only* commutation method the stock firmware implements, and reproducing it is the must-have driving mode.
- **A wireless remote and a serial radio module.** An OOK remote receiver, plus a serial-attached wireless module (a TTC2541) on USART1. What the manufacturer intended that module for is not documented, and I would not even firmly assert which radio mode it runs. What *is* observed is the limitation that matters here: over it the stock firmware speaks only telemetry and configuration (battery, speed, faults, a speed limit, lock, lights), with **no live throttle or steering**. You cannot drive the stock board over that link.
- **The supporting cast.** An inter-wheel serial link to keep the two halves synchronized, buttons/throttle/brake inputs, foot-pad rider detection with a watchdog, a buzzer, LED indicators, and a flash-stored per-board calibration block.

## What Declassyfied adds

Two features the stock firmware does not have, decided this week:

**1. Drive over the built-in wireless module.** The board already carries that radio; the stock firmware just never let it command motion. Declassyfied accepts drive and steer over the same module, with no added hardware. Two switchable modes:

- *Balancing drive*, the headline: throttle and steer commands feed the balance controller, so the board stays upright and moves on command.
- *Direct drive*, for the bench: commands go straight to the motors, bypassing balance, for testing and non-balancing use.

**2. Alternative commutation methods (nice-to-have).** The must-have is reproducing the loop the board already uses, hall-sensor FOC in voltage mode, because that is what makes it balance and drive. Everything past that is a nice-to-have: Declassyfied is structured so the same Clarke/Park/SVPWM hardware path can grow more methods over time, taking [EFeru's hoverboard-firmware-hack-FOC](https://github.com/EFeru/hoverboard-firmware-hack-FOC) as the reference:

- **Six-step / trapezoidal**: the simplest, roughest, and easiest to verify in the clean-room loop. A useful reference and fallback.
- **Sinusoidal**: smoother and more efficient than six-step, simpler than full FOC.
- **The other FOC modes, torque and speed.** Voltage mode is what the board ships with; torque mode (a real current setpoint) gives a more natural throttle, and speed mode (closed-loop RPM) suits cruise and hill-hold. Both are better than voltage mode for *driving*, especially a board that is not balancing.

None of these are required to hit this week's goal; the stock voltage-mode loop is enough to balance and drive. They are where the firmware goes after it works.

## Built clean-room

All of this is written by a clean-room process, the method used to reimplement the IBM PC BIOS. The recovered firmware image is studied only to write an English behavioral specification of what the hardware does. The implementer that writes the new C is an LLM given that spec document and nothing else: it never sees the original firmware, its disassembly, or a single line of its code. It works only from the clean description on the publishable side of the wall. The recovered image and its disassembly stay out of the repository entirely. That separation, an implementer working purely from the spec, is what makes the result publishable, and it is repair-and-interoperability work on hardware I own.

## The bar for the week

Make it balance, and command movement, using the must-have driving mode: the stock hall-sensor FOC, voltage mode, reproduced clean-room. That is the milestone: the firmware holding the board upright on its own sensors and taking drive and steer commands over the built-in wireless module while it does. The supporting subsystems (commutation, attitude, the control cascade, the wireless link) all have to be working well enough to stand the board up and move it on command, flashed to a real board over the wireless SWD path from last week. The alternative methods and FOC modes are explicitly out of scope this week. Balancing and being driven are easy to show separately; doing both at once is the bar.
