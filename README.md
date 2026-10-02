# ⚡ Circuit & Resistor Calculator

A single-file, browser-based electronics calculator that helps you determine series voltage-dropping resistors and parallel resistor equivalents — with real-time 3D color-band visualization.

## Features

### Series Calculator
- Computes the **required series resistor** to drop a supply voltage ($V_{in}$) to a target load voltage ($V_{target}$) at a given current.
- Displays the nearest **E24 standard resistor value** and its **4-band color code**.
- Reports **voltage drop**, **power dissipation** (mW / W), and **recommended wattage rating** with a thermal load status badge (Safe / Hot / Overload).
- Built-in quick presets:
  - 3.3 V module @ 5 V (100 mA)
  - Red LED @ 5 V (20 mA)
  - Blue LED @ 12 V (20 mA)
  - 5 V relay @ 12 V (500 mA)
- Live **formula breakdown** panel showing every calculation step.

### Parallel Calculator
- Accepts **2–N resistor branches** on a shared bus voltage.
- Computes **equivalent resistance** ($R_{eq}$), **total bus current** ($I_{total}$), **total power dissipated**, and **conductance** (mS).
- Nearest E24 standard for $R_{eq}$ with 3D color-band visualization.
- Branches can be added or removed dynamically.
- Quick presets for common parallel networks.

### 3D Resistor Visualizer
- Rendered with **Three.js** (r128) — interactive, draggable/orbitable 3D resistor model.
- Color bands update in real time to reflect the nearest E24 value.
- Color-band pill strip labels each band by name (e.g., *Brown*, *Black*, *Red*, *Gold*).

## Formulas

**Series resistor:**

$$R = \frac{V_{in} - V_{target}}{I_{load}} \qquad P = (V_{in} - V_{target}) \times I_{load}$$

**Parallel equivalent resistance:**

$$\frac{1}{R_{eq}} = \frac{1}{R_1} + \frac{1}{R_2} + \cdots + \frac{1}{R_n} \qquad I_{total} = \frac{V_{bus}}{R_{eq}}$$

## Getting Started

No build step or server is required — the project is a single HTML file.

1. Clone or download the repository:
   ```bash
   git clone https://github.com/your-username/circuit-and-resistor-calculator.git
   ```
2. Open `index.html` in any modern browser:
   ```bash
   open index.html        # macOS
   start index.html       # Windows
   xdg-open index.html    # Linux
   ```

> An active internet connection is needed on first load to fetch CDN assets (Tailwind CSS, Three.js).

## Tech Stack

| Library | Version | Purpose |
|---|---|---|
| [Tailwind CSS](https://tailwindcss.com) | CDN (latest) | Utility-first styling |
| [Three.js](https://threejs.org) | r128 | 3D resistor rendering |
| Three.js OrbitControls | r128 | Mouse/touch orbit interaction |

No frameworks, no bundler, no dependencies to install.

## File Structure

```
circuit-and-resistor-calculator/
└── index.html    # Entire app — markup, styles, and JavaScript
```

## Browser Support

Works in any modern browser that supports WebGL (Chrome, Firefox, Edge, Safari).

## License

MIT
