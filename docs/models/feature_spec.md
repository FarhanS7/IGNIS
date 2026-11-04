# Feature Specification: M2 Multi-Sensor Fusion Detector

## Overview
The M2 fusion detector uses strictly **unit-free, dimensionless features** extracted over a trailing temporal window $W$ across three physical channels:
1. **Smoke Obscuration / Particulate Proxy** (`smoke_obs` in console, `PM25_Room` / `PM10_Room` in ground benchmark)
2. **Carbon Monoxide** (`co_ppm` in console, `CO_Room` in ground benchmark)
3. **Temperature** (`temp_c` in console, `Temperature_Room` in ground benchmark)

By operating exclusively on dimensionless normalized ratios and window slopes, the model is invariant to underlying sensor physical units, enabling direct inference on simulated microgravity telemetry in the browser console.

---

## Mathematical Formulation

### 1. Channel Baseline & Background-Normalized Level
For each channel $c \in \{\text{smoke}, \text{CO}, \text{temp}\}$:
- Let $x_c(t)$ be the raw telemetry measurement at time step $t$.
- Let $B_c$ be the baseline median of the initial $K$ samples (default $K = 10$, or nominal pre-event background):
  $$B_c = \text{median}\left(\{x_c(0), \dots, x_c(K-1)\}\right)$$
- Let the scale epsilon $\epsilon_c$ prevent division by zero:
  $$\epsilon_c = \max\left(10^{-6}, \text{median}\left(\{|x_c(i) - B_c|\}_{i=0}^{K-1}\right)\right)$$
- The **background-normalized level** is:
  $$L_c(t) = \frac{x_c(t) - B_c}{\max(B_c, \epsilon_c)}$$
  *(Dimensionless; $L_c(t) = 0$ at baseline, $L_c(t) = 1.0$ at 2× baseline).*

### 2. Dimensionless Least-Squares Slope Over Window $W$
Let the trailing window of length $W$ (default $W = 6$ samples, corresponding to 60 s at 10 s cadence) have normalized values:
$$y_i = L_c(t - W + 1 + i), \quad i \in \{0, 1, \dots, W-1\}$$
Normalized time steps $u_i = \frac{i}{W - 1} \in [0.0, 1.0]$:
$$S_c(t) = \frac{\sum_{i=0}^{W-1} (u_i - \bar{u})(y_i - \bar{y})}{\sum_{i=0}^{W-1} (u_i - \bar{u})^2}$$
Where $\bar{u} = 0.5$ and $\sum_{i=0}^{W-1} (u_i - \bar{u})^2$ is precomputed as a constant for fixed $W$.
*(Dimensionless; rate of normalized rise over window $W$).*

### 3. Window Maximum Level
The peak normalized elevation across the trailing window $W$:
$$M_c(t) = \max_{0 \le i < W} L_c(t - i)$$
*(Dimensionless).*

### 4. Cross-Channel Agreement Count & Fraction
Each channel $c$ evaluates whether its normalized level exceeds a robust anomaly threshold $\theta_{z,c}$ (fitted on training background fold):
$$\text{Agree}_c(t) = \mathbb{I}\left[ L_c(t) \ge \theta_{z,c} \right]$$
The agreement fraction is:
$$A(t) = \frac{1}{3} \sum_{c \in \{\text{smoke}, \text{CO}, \text{temp}\}} \text{Agree}_c(t) \in \left\{ 0.0, \frac{1}{3}, \frac{2}{3}, 1.0 \right\}$$
*(Dimensionless).*

---

## Total Feature Vector (10 Features)
$$\mathbf{f}(t) = \begin{bmatrix}
L_{\text{smoke}}(t), & L_{\text{co}}(t), & L_{\text{temp}}(t), \\
S_{\text{smoke}}(t), & S_{\text{co}}(t), & S_{\text{temp}}(t), \\
M_{\text{smoke}}(t), & M_{\text{co}}(t), & M_{\text{temp}}(t), \\
A(t)
\end{bmatrix}^T \in \mathbb{R}^{10}$$

---

## TypeScript Implementation (< 50 Lines)

```typescript
export interface ChannelWindow {
  values: number[]; // trailing W raw samples
  baseline: number; // initial K median
}

export function extractUnitFreeFeatures(
  smoke: ChannelWindow,
  co: ChannelWindow,
  temp: ChannelWindow,
  zThresholds: [number, number, number] = [0.5, 0.5, 0.2]
): number[] {
  const channels = [smoke, co, temp];
  const W = smoke.values.length;
  const uBar = 0.5;
  let denom = 0;
  for (let i = 0; i < W; i++) denom += Math.pow(i / (W - 1) - uBar, 2);

  const L: number[] = [];
  const S: number[] = [];
  const M: number[] = [];
  let agreementCount = 0;

  channels.forEach((ch, cIdx) => {
    const base = Math.max(ch.baseline, 1e-6);
    const norm = ch.values.map(v => (v - ch.baseline) / base);
    const current = norm[norm.length - 1];
    L.push(current);

    // Window slope
    const yBar = norm.reduce((a, b) => a + b, 0) / W;
    let num = 0;
    for (let i = 0; i < W; i++) num += (i / (W - 1) - uBar) * (norm[i] - yBar);
    S.push(denom > 0 ? num / denom : 0);

    // Window max
    M.push(Math.max(...norm));

    // Agreement
    if (current >= zThresholds[cIdx]) agreementCount++;
  });

  return [...L, ...S, ...M, agreementCount / 3.0];
}
```

