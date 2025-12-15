<script setup lang="ts">
const colors = [
  { name: "Primary", token: "--rp-color-primary" },
  { name: "Primary Strong", token: "--rp-color-primary-strong" },
  { name: "Primary Soft", token: "--rp-color-primary-soft" },
  { name: "Accent", token: "--rp-color-accent" },
  { name: "Accent Soft", token: "--rp-color-accent-soft" },
  { name: "Surface", token: "--rp-color-surface" },
  { name: "Surface Soft", token: "--rp-color-surface-soft" },
  { name: "Background", token: "--rp-color-bg" },
  { name: "Danger", token: "--rp-color-danger" },
];
</script>

<template>
  <div class="page">
    <section class="card">
      <h1>Design System</h1>
      <p class="subtitle">
        Tokens básicos de cores e tipografia para a interface RenderPay.
      </p>
    </section>

    <section class="card">
      <h2>Cores</h2>
      <div class="swatches">
        <div v-for="color in colors" :key="color.token" class="swatch">
          <div class="swatch-color" :style="{ background: `var(${color.token})` }" />
          <div class="swatch-info">
            <div class="swatch-name">{{ color.name }}</div>
            <div class="swatch-token">{{ color.token }}</div>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Tipografia</h2>
      <div class="type-samples">
        <div class="type-block">
          <div class="type-label">Título / h1</div>
          <div class="type-h1">RenderPay Platform</div>
        </div>
        <div class="type-block">
          <div class="type-label">Título / h2</div>
          <div class="type-h2">Dashboard de Afiliados</div>
        </div>
        <div class="type-block">
          <div class="type-label">Corpo</div>
          <div class="type-body">
            Interface em Nunito, focada em clareza, conversão e legibilidade em
            ambientes de vendas e afiliados.
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>Componentes base</h2>
      <div class="components-row">
        <button class="btn-primary">Botão primário</button>
        <button class="btn-secondary">Botão secundário</button>
        <button class="btn-ghost">Botão ghost</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  color: var(--rp-color-text-main);
}

.card {
  background: var(--rp-color-surface);
  border-radius: var(--rp-radius-lg);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 1.5rem 1.75rem;
  box-shadow: var(--rp-shadow-subtle);
}

.subtitle {
  margin-top: 0.25rem;
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.swatch {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.swatch-color {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: 1px solid rgba(15, 23, 42, 0.8);
}

.swatch-info {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.swatch-name {
  font-size: 0.9rem;
  font-weight: 600;
}

.swatch-token {
  font-size: 0.8rem;
  color: var(--rp-color-text-muted);
}

.type-samples {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-top: 1rem;
}

.type-block {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.type-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--rp-color-text-soft);
}

.type-h1 {
  font-size: 1.8rem;
  font-weight: 700;
}

.type-h2 {
  font-size: 1.3rem;
  font-weight: 600;
}

.type-body {
  font-size: 0.95rem;
  color: var(--rp-color-text-muted);
}

.components-row {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary,
.btn-ghost {
  border-radius: var(--rp-radius-full);
  padding: 0.5rem 1.4rem;
  font-family: var(--rp-font-family);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
}

.btn-primary {
  background: linear-gradient(
    to right,
    var(--rp-color-primary-gradient-from),
    var(--rp-color-primary-gradient-to)
  );
  color: #ffffff;
}

.btn-secondary {
  background: var(--rp-color-surface-soft);
  color: var(--rp-color-text-main);
  border-color: var(--rp-color-border-subtle);
}

.btn-ghost {
  background: transparent;
  color: var(--rp-color-text-muted);
  border-color: var(--rp-color-border-subtle);
}
</style>

