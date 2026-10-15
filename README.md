# ⚡ Circuit & Resistor Calculator

A React and TypeScript electronics calculator that helps you determine series voltage-dropping resistors and parallel resistor equivalents — with real-time 3D color-band visualization rendered with Three.js.

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
- Interactive, draggable/orbitable 3D resistor model built with **Three.js** and **OrbitControls**.
- Ceramic body, lead wires, bulbous end-caps, and 4 color bands updating in real time to reflect the calculated E24 value.
- Color-band pill strip labels each band with realistic swatch colors and text names.

## Formulas

**Series resistor:**

$$R = \frac{V_{in} - V_{target}}{I_{load}} \qquad P = (V_{in} - V_{target}) \times I_{load}$$

**Parallel equivalent resistance:**

$$\frac{1}{R_{eq}} = \frac{1}{R_1} + \frac{1}{R_2} + \cdots + \frac{1}{R_n} \qquad I_{total} = \frac{V_{bus}}{R_{eq}}$$

## Tech Stack

- **React 18** with TypeScript
- **Vite** build tooling
- **Tailwind CSS** styling
- **Three.js** and **OrbitControls** for 3D graphics

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## License

MIT
