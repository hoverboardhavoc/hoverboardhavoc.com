---
title: 'Week 45, 2026: roundup'
description: 'A hoverboard wheel ran with its hall sensors unplugged, on a flux observer. The firmware drives the EFeru-style 12-FET board once a second timer was added for its second motor. The MM32 splitboards were dropped: fitting the firmware into 32 KB took too many compromises. The stock take and the documentation are still going. The motors click at low speed. The cause is not found yet.'
pubDate: 'Nov 07 2026'
heroImage: '../../assets/week45/architecture-hero.jpg'
---

A hoverboard wheel ran with its hall sensors unplugged, on a flux observer. Two of seven tasks are done. The firmware drives the 12-FET board, which still needs a board file in the firmware. The buzzer plays tones and the board LEDs show the battery level. The MM32 splitboards were dropped. The stock take and the documentation are still going. The motors click at low speed. The cause is not found yet.

## Sensorless control

On 4 November a wheel ran with its hall sensors unplugged. The hall plug was pulled from the offroad's master board. From the app, the wheel was spun up from rest and kept turning, driven by the firmware's [flux observer](https://github.com/hoverboardhavoc/hoverboard-firmware/pull/87) alone.

As far as I can find, no other open firmware for hoverboard mainboards does this. EFeru's FOC and RoboDurden's firmware take the rotor angle from the hall sensors at every speed. VESC runs this kind of observer on its own controllers. The observer here follows its design.

The observer estimates the rotor angle from the motor's voltages and currents. Each PWM period it integrates the applied phase voltage less the drop across the winding resistance. It subtracts the flux from the winding inductance and reads the angle off the magnet's flux that remains.

The first version drove badly. Its leaky integrator puts the angle ahead of the true flux by an amount that changes with speed. Driven from it, the wheel slowed and settled at a low speed, drawing 3 A where the halls need 0.4 A. The version that works pulls its estimate towards the known flux circle, as VESC does. At full speed, switching between the halls and the observer left no step in speed. The observer's angle was within a degree or two of the halls'. The wheel drew about 0.15 A more.

It is not merged. With the observer running, the rover jolts every 3 to 5 seconds while it balances; the image without it does not. Testing it also turned up the clicking below, which was later heard on images without the observer too.

## The 12-FET board

The 12-FET board took more work than expected. It drives two motors from one GD32F103RC. The firmware had only ever driven one motor per board. The second motor runs on a second timer (TIMER7, which follows TIMER0), so the timer bring-up, the drive command, the period interrupt and the arm gate all had to handle a motor index. The board got its own image, since the RC has 256 KB of flash and stores its settings on 2 KB pages.

The first runs failed: the current-sense zeros fell outside the calibration window. Both motors tripped over-current as soon as they were driven. The stock firmware was decompiled in Ghidra to see how it does it. It takes its current zeros with the low-side FETs on, and its phase sensors read real current only while their leg's low side conducts. It samples both motors' currents at once on two ADCs, and it trips on the DC-link current and a break input, never on phase current. The firmware now does the same: a per-leg sample rule, parallel sampling on ADC0 and ADC1, and the phase-current trip and the stock's protections as optional settings. In three 25-second FOC runs there were no trips, and a wheel braked by hand was held at the current limit without a trip.

The settings for the board are in a machine file in the firmware's tests, but a board file for it still has to be added to the firmware's `boards/` folder. The current scales are not calibrated yet; that needs a current measuring tool.

## Razor MM32 splitboards

The MM32 boards were dropped after a lot of effort. Making the firmware fit into 32 KB took too many compromises.

The probing on the bench found 32 KB of flash and nothing more: the undocumented flash controller registers read 0, the die ID maps only to the 32 KB part, and a write above 32 KB showed up in the first 32 KB. The full firmware built for the chip was about 58 KB against a budget of 30 KB, and a build that only drives the wheels was 47 KB. The proof of concept fitted in 16.7 KB because it left out the arm gate, the links between boards and the settings store. Turning off inlining made the image bigger.

A study found a way to fit every feature, in 29.2 KB, without dropping one. The board would hand its protocol to the ESP32 bridge, read its settings as a flat table, exchange state with the other board through both bridges over the radio, and do its control maths in 32-bit fixed point. Each of those changes costs the GD32 boards something: both bridges would have to be up to drive, the state from the other board would arrive 3 to 5 ms later instead of under 1 ms, and every settings change would need a reset.

The MM32 image is still built in CI so that its code does not go stale, but it cannot be flashed.

## Taking stock

The stock take is still going. A new split pair was set up on the bench with two new ESP32-C3 bridges. Board files for them were published. Both boards have the layout RoboDurden calls [Gen2.1.20](https://github.com/RoboDurden/Hoverboard-Firmware-Hack-Gen2.x/tree/main/target_1%3DGD32F130/v20). The slave carries the GD32F130 he lists for it. The master carries a GD32F103, so it is called 2.2.20 here, after his numbering. One new slave board could not be reached over SWD. The bridges can now drive a board's reset pin. `hoverboard-cli board recover` brought another new board back once its reset pin was found.

## Documentation

The documentation is still going. The firmware's README was rewritten and now opens with the architecture diagram at the top of this post.

A getting started guide was written while the new split pair was set up from a Raspberry Pi, following it step by step. A CLI reference and a build guide are drafted but not checked.

## Pins in the board files

On 2 November the firmware stopped looking up pin names. A pin is stored as the chip's register model, so a board file wrote PA8 as `{"port":"A","pin":8,"af":2}`. The CLI checks every write against the chip, so the firmware trusts what it reads. That saves about 3.6 KB of flash.

The files were harder to read and write. The `af` field is given on the GD32F130 and left out on the GD32F103, so the 2.1.20 and 2.2.20 boards needed a file each although their pins are the same. On 6 November the CLI went back to names: a file or a command can say `"PA8"`. The CLI turns the name into the register model for the board's chip before any check runs. The firmware and the store keep the register model. Both boards of a 2.x.20 pair now share one master file and one slave file. A dump writes a pin by its name too.

## The clicking bug

FOC clicks on the offroad, the rover's slave and the new split pair, once every one to three seconds at low speed. It clicks on sine at a constant speed too. Six-step does not click in the same way. Armed at standstill the boards click at random, and the telemetry shows matching spikes in the phase current with no hall edges. Powering down the bridge does not stop it, so it is not the bridge's SWD traffic. The board settings match between boards that click and boards that do not, and the rover never clicked before, so it looks like a firmware regression. A build that counts angle jumps at the hall edges is on the split pair. The cause is not found yet.

## Tones, LEDs and heading hold

Tones and the LEDs are done. The buzzer plays tunes from the motor's period interrupt: a horn from the app, and low and critical battery alarms. Most attempts at a car horn sounded like a telephone; the horn is a steady 415 Hz. The board LEDs show the battery level: green, then orange, then red blinking.

A [heading hold](https://github.com/hoverboardhavoc/hoverboard-firmware/pull/83), in place of the yaw-rate loop, is built but not tried on the rover. It holds the difference between the two wheels' positions, which needs no new sensor, and the steer stick sets the turning rate.

## Other firmware work

- The first release named for its week, v2026.45.0, was published. The macOS and Linux command line tools ship as `.tar.gz` files with a `curl` install line, which avoids the macOS security dialog for a downloaded file.
- The app has a new icon. An F-Droid merge request is open.
- CI runs a hardware smoke test: it flashes the offroad pair. Then the app drives the wheels gently each way, judged from the halls.
- The bridge's Bluetooth stopped advertising after an update of its ESP32 libraries. The update was reverted.

## Where it stands

The flux observer runs a wheel without hall sensors and is not merged. The 12-FET board drives both motors and has no board file yet. The MM32 splitboards are dropped. The stock take and the documentation are part done. The cause of the clicking is not found.

## The plan

[The plan for this week](/blog/week-45-the-plan/) had seven tasks:

- Test the firmware on an EFeru-style 12-FET board. ✅
- Try a pair of Razor MM32 splitboards. ❌
- Take stock of my boards. 🟡
- Write documentation. 🟡
- Tones on the buzzer and the board LEDs. ✅
- A yaw-rate loop for the rover ([PR #83](https://github.com/hoverboardhavoc/hoverboard-firmware/pull/83)). 🟡
- Sensorless control with a flux observer ([PR #87](https://github.com/hoverboardhavoc/hoverboard-firmware/pull/87)). 🟡
