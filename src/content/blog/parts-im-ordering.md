---
title: 'Shopping list, 22 June 2026'
description: 'A pile of AliExpress parts going into the cart for the hoverboard firmware work: HV buck converters that survive a full pack, bench power, jumper wire, a couple of e-scooter throttles for drive input, and ESP32 SuperMinis. Affiliate links, and I am buying every one of these myself.'
pubDate: 'Jun 22 2026'
heroImage: '../../assets/shopping-list-hero.jpg'
---

A batch of parts is going into the cart for the hoverboard firmware bring-up. These are not recommendations I am handing down from on high, they are the things I am actually about to buy for the bench. The links are affiliate links (if you buy through one I get a small AliExpress commission at no extra cost to you), and I am ordering all of these for myself, except the Raspberry Pi Pico 2 W at the end, which I already have. The photos are the sellers' listing images. Prices are as of **22 June 2026** (NOK from the listings, the others converted at that day's rate), and AliExpress prices move around a lot.

## Power

The board runs off a 10S pack, which is about 36V nominal and **~42V fully charged**, so any step-down has to survive more than 40V on the input. That rules out the common LM2596 (40V max) and points at the **HV** parts. I am buying three to compare, since they are cheap:

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c42a8o0z" style="flex:none;"><img src="/parts/buck-45-60v.jpg" alt="LM2596HV 4.5-60V buck converter module" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c42a8o0z">LM2596HV, 4.5–60V in</a></strong> (~25 kr · $2.6 / €2.3 / £2.0). Best headroom over a full pack, cheapest single module.</p>
</div>

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c38IkKZX" style="flex:none;"><img src="/parts/buck-5-50v.jpg" alt="LM2596HV 5-50V buck converter module" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c38IkKZX">LM2596HV, 5–50V in</a></strong> (~24 kr · $2.5 / €2.1 / £1.9). The same module I first picked, plenty for 42V.</p>
</div>

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c3tm8lH3" style="flex:none;"><img src="/parts/buck-5-60v.jpg" alt="LM2596HV 5-60V buck converter module" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c3tm8lH3">LM2596HV, 5–60V in</a></strong> (~77 kr · $8.0 / €6.9 / £6.0). Pricier single unit, also 60V headroom.</p>
</div>

For bench work where I want a current limit while bringing up a power stage:

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c4WwKP97" style="flex:none;"><img src="/parts/bench-psu.jpg" alt="Adjustable DC laboratory bench power supply" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c4WwKP97">DC lab bench power supply, 30/60/120V adjustable</a></strong> (~784 kr · $81 / €71 / £61). Preset current, the thing that saves a bridge when an alignment is wrong.</p>
</div>

## Wiring

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c2wZ2EXb" style="flex:none;"><img src="/parts/dupont-kit.jpg" alt="40-pin Dupont jumper wire kit" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c2wZ2EXb">Dupont jumper wire kit, 40-pin, M-M / M-F / F-F</a></strong> (~30 kr · $3.1 / €2.7 / £2.4). The listing has a gender option, so choose the female-to-female (F2F) variant, for jumping between the boards' male pin headers.</p>
</div>

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c3bp5B3P" style="flex:none;"><img src="/parts/dupont-short.jpg" alt="Short 5cm Dupont breadboard jumper wires" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c3bp5B3P">Short 5cm Dupont breadboard jumpers, 26AWG</a></strong> (~26 kr · $2.7 / €2.3 / £2.0). For keeping the bench tidy; choose the female-to-female variant here too.</p>
</div>

## Drive input

The firmware needs a throttle source to test drive and steer commands, and e-scooter thumb throttles are a clean analog input:

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c4EVOh7n" style="flex:none;"><img src="/parts/throttle-niu.jpg" alt="Thumb throttle for NIU KQi2 / KQi3 scooter" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c4EVOh7n">Thumb throttle for NIU KQi2 / KQi3</a></strong> (~61 kr · $6.3 / €5.5 / £4.8).</p>
</div>

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c3HF1fRr" style="flex:none;"><img src="/parts/throttle-nave.jpg" alt="Thumb accelerator for Nave V-series scooter" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c3HF1fRr">Thumb accelerator for Nave V-series</a></strong> (~91 kr · $9.4 / €8.2 / £7.1).</p>
</div>

## Microcontrollers

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c3Kx252l" style="flex:none;"><img src="/parts/esp32-s3.jpg" alt="ESP32-S3 SuperMini development board" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c3Kx252l">ESP32-S3 SuperMini</a></strong> (~38 kr · $3.9 / €3.4 / £3.0). A capable general-purpose bench MCU, plenty of UARTs and RAM.</p>
</div>

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c4eoJpOl" style="flex:none;"><img src="/parts/esp32-c3.jpg" alt="ESP32-C3 SuperMini development board" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c4eoJpOl">ESP32-C3 SuperMini</a></strong> (~247 kr · $25 / €22 / £19, multi-pack). The same part that already rides on each board as the wireless SWD probe.</p>
</div>

## Display

The **Cheap Yellow Display** (the ESP32-2432S028R, "CYD"): an ESP32-WROOM with a 2.8" 320×240 resistive touchscreen on a yellow PCB. A whole community has grown up around it (Brian Lough's [ESP32-Cheap-Yellow-Display](https://github.com/witnessmenow/ESP32-Cheap-Yellow-Display), LVGL examples everywhere), which makes it the easy path to a little touch UI, a config screen, or a bench status readout.

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c3aAzeoN" style="flex:none;"><img src="/parts/cyd.jpg" alt="ESP32-2432S028R Cheap Yellow Display, 2.8 inch touchscreen" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c3aAzeoN">Cheap Yellow Display (ESP32-2432S028R)</a></strong> (~150 kr · $15 / €13 / £12). 2.8" 320×240 ILI9341 resistive touch, microSD, ESP32-WROOM. Get the single-USB board; the dual-USB variant has driver quirks.</p>
</div>

## RS485 sniffer

I want a microcontroller with **two RS485 ports** to passively watch both directions of a 4-wire RS485 link on an RTK GPS. The obvious option, a Raspberry Pi RS485 CAN HAT, has two RS485 channels but drags a whole Pi along. A genuine two-port *microcontroller* board is rare (almost every "ESP32 RS485" board is one RS485 plus a CAN), but the Pico carrier below is a clean fit: two SP3485 transceivers on the Pico's two independent hardware UARTs (GP0/1 and GP4/5), exactly what a full-duplex tap needs. It is not isolated, which is fine for a low-voltage bench tap.

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c4oSDzJf" style="flex:none;"><img src="/parts/rs485-pico-board.jpg" alt="Pico-2CH-RS485 dual RS485 module for Raspberry Pi Pico" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c4oSDzJf">Pico-2CH-RS485 board</a></strong> (~109 kr · $11 / €9.8 / £8.5). The RS485 front-end: two SP3485 transceivers wired to the Pico's two UARTs. You supply the Pico.</p>
</div>

<div style="display:flex;gap:1.25rem;align-items:center;margin:2rem 0;">
<a href="https://s.click.aliexpress.com/e/_c3ttm3el" style="flex:none;"><img src="/parts/pico-2w.jpg" alt="Raspberry Pi Pico 2 W development board" width="120" style="border-radius:6px;display:block;"></a>
<p style="margin:0;line-height:1.7;"><strong><a href="https://s.click.aliexpress.com/e/_c3ttm3el">Raspberry Pi Pico 2 W</a></strong> (~119 kr · $12 / €11 / £9.3). The brain that plugs into it; the W adds WiFi for streaming captures off the bench. I already have one, so this is the only thing here I am not buying, linked for anyone building along.</p>
</div>

## Untested, for now

None of these are tested yet, they are just what I am ordering. Once they arrive and I have put them to work on the bench, I will report back on how well each one actually holds up.
