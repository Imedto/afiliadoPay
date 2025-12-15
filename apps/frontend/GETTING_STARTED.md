# RenderPay - Guia de Início Rápido

## 🎉 O que foi implementado

### ✅ Design System Completo
- Paleta de cores profissional com Dark Mode
- Design tokens completos (espaçamentos, tipografia, shadows, etc.)
- Sistema de cores semânticas (success, warning, error, info)

### ✅ Composables Reutilizáveis
- `useBreakpoints` - Responsividade
- `useToast` - Notificações
- `useDebounce` - Performance
- `useLocalStorage` - Persistência
- `useAsync` - Operações assíncronas
- `useForm` - Formulários com validação

### ✅ Componentes UI Modernos
- `BaseButton` - Botão completo com loading states
- `BaseInput` - Input com validação
- `BaseCard` - Cards flexíveis
- `BaseBadge` - Badges e tags

### ✅ Documentação
- Arquitetura e padrões
- Roadmap de implementação
- Guias de boas práticas

## 🚀 Como Usar

### 1. Design Tokens (CSS Variables)

Todos os tokens estão disponíveis como CSS variables:

```vue
<style scoped>
.my-component {
  /* Cores */
  color: var(--rp-text-primary);
  background: var(--rp-bg-base);

  /* Espaçamentos */
  padding: var(--rp-space-4);
  gap: var(--rp-space-2);

  /* Border radius */
  border-radius: var(--rp-radius-lg);

  /* Shadows */
  box-shadow: var(--rp-shadow-md);

  /* Transições */
  transition: all var(--rp-transition-base);
}
</style>
```

### 2. Composables

#### useBreakpoints

```vue
<script setup lang="ts">
import { useBreakpoints } from '@/composables'

const { isMobile, isTablet, isDesktop, currentBreakpoint } = useBreakpoints()
</script>

<template>
  <div>
    <MobileNav v-if="isMobile" />
    <DesktopNav v-else />

    <p>Breakpoint atual: {{ currentBreakpoint }}</p>
  </div>
</template>
```

#### useToast

```vue
<script setup lang="ts">
import { useToast } from '@/composables'

const toast = useToast()

function handleSave() {
  toast.success('Produto salvo com sucesso!')
}

function handleError() {
  toast.error('Erro ao salvar produto', 5000) // 5 segundos
}
</script>
```

#### useForm

```vue
<script setup lang="ts">
import { useForm, validators } from '@/composables'

const { fields, values, isValid, validate } = useForm({
  email: {
    value: '',
    rules: [
      validators.required(),
      validators.email()
    ]
  },
  password: {
    value: '',
    rules: [
      validators.required(),
      validators.minLength(8)
    ]
  }
})

async function handleSubmit() {
  if (!validate()) return

  // values contém todos os valores do formulário
  console.log(values)
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <BaseInput
      v-model="fields.email.value"
      type="email"
      label="E-mail"
      :error="fields.email.error"
      @blur="fields.email.validate()"
    />

    <BaseInput
      v-model="fields.password.value"
      type="password"
      label="Senha"
      :error="fields.password.error"
      @blur="fields.password.validate()"
    />

    <BaseButton type="submit" :disabled="!isValid">
      Entrar
    </BaseButton>
  </form>
</template>
```

#### useAsync

```vue
<script setup lang="ts">
import { useAsync } from '@/composables'
import { fetchProduct } from '@/features/products/api/productsApi'

const { data, loading, error, execute } = useAsync(fetchProduct)

onMounted(() => {
  execute(productId)
})
</script>

<template>
  <div v-if="loading">Carregando...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else-if="data">
    <h1>{{ data.name }}</h1>
  </div>
</template>
```

### 3. Componentes UI

#### BaseButton

```vue
<template>
  <!-- Variantes -->
  <BaseButton variant="primary">Primary</BaseButton>
  <BaseButton variant="secondary">Secondary</BaseButton>
  <BaseButton variant="ghost">Ghost</BaseButton>
  <BaseButton variant="danger">Danger</BaseButton>
  <BaseButton variant="success">Success</BaseButton>

  <!-- Tamanhos -->
  <BaseButton size="sm">Small</BaseButton>
  <BaseButton size="md">Medium</BaseButton>
  <BaseButton size="lg">Large</BaseButton>

  <!-- Estados -->
  <BaseButton :loading="true">Loading...</BaseButton>
  <BaseButton :disabled="true">Disabled</BaseButton>

  <!-- Block (full width) -->
  <BaseButton block>Full Width</BaseButton>
</template>
```

#### BaseInput

```vue
<template>
  <!-- Input básico -->
  <BaseInput
    v-model="name"
    label="Nome"
    placeholder="Digite seu nome"
  />

  <!-- Com validação -->
  <BaseInput
    v-model="email"
    type="email"
    label="E-mail"
    :error="emailError"
    required
  />

  <!-- Com helper text -->
  <BaseInput
    v-model="password"
    type="password"
    label="Senha"
    helper-text="Mínimo 8 caracteres"
  />

  <!-- Tamanhos -->
  <BaseInput v-model="value" size="sm" />
  <BaseInput v-model="value" size="md" />
  <BaseInput v-model="value" size="lg" />
</template>
```

#### BaseCard

```vue
<template>
  <!-- Card básico -->
  <BaseCard title="Meu Card" subtitle="Subtítulo do card">
    <p>Conteúdo do card</p>
  </BaseCard>

  <!-- Com variantes -->
  <BaseCard variant="outlined" title="Outlined Card">
    Conteúdo
  </BaseCard>

  <BaseCard variant="elevated" title="Elevated Card">
    Conteúdo
  </BaseCard>

  <!-- Padding customizado -->
  <BaseCard padding="lg" title="Large Padding">
    Conteúdo
  </BaseCard>

  <!-- Com header e footer slots -->
  <BaseCard>
    <template #header>
      <div class="custom-header">
        <h3>Custom Header</h3>
        <button>Action</button>
      </div>
    </template>

    <p>Card body content</p>

    <template #footer>
      <div class="custom-footer">
        <BaseButton>Cancel</BaseButton>
        <BaseButton variant="primary">Save</BaseButton>
      </div>
    </template>
  </BaseCard>

  <!-- Hoverable (para clique) -->
  <BaseCard hoverable @click="handleClick">
    Card clicável
  </BaseCard>
</template>
```

## 🎨 Paleta de Cores

### Cores Principais
```css
/* Primary (Verde) */
--rp-primary-500: #22c55e
--rp-primary-600: #16a34a
--rp-primary-700: #15803d

/* Secondary (Azul) */
--rp-secondary-500: #3b82f6
--rp-secondary-600: #2563eb
--rp-secondary-700: #1d4ed8

/* Accent (Cyan) */
--rp-accent-500: #06b6d4
--rp-accent-600: #0891b2
```

### Cores Semânticas
```css
/* Success */
--rp-success-500: #22c55e

/* Warning */
--rp-warning-500: #eab308

/* Error */
--rp-error-500: #ef4444

/* Info */
--rp-info-500: #3b82f6
```

### Tons Neutros
```css
/* Backgrounds */
--rp-bg-base: #ffffff (light) / #0f172a (dark)
--rp-bg-subtle: #f9fafb (light) / #1e293b (dark)

/* Text */
--rp-text-primary: #111827 (light) / #f8fafc (dark)
--rp-text-secondary: #4b5563 (light) / #cbd5e1 (dark)
--rp-text-tertiary: #6b7280 (light) / #94a3b8 (dark)

/* Borders */
--rp-border-subtle: #e5e7eb (light) / #334155 (dark)
--rp-border-base: #d1d5db (light) / #475569 (dark)
```

## 📱 Responsividade

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}
```

### Media Queries (Mobile First)

```css
/* Mobile (default) */
.container {
  padding: var(--rp-space-4);
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--rp-space-6);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--rp-space-8);
  }
}
```

## 📂 Estrutura de Arquivos

```
src/
├── assets/              # Design tokens, CSS global
├── composables/         # Hooks reutilizáveis
├── components/
│   ├── ui/             # Componentes UI base
│   ├── layout/         # Componentes de layout
│   └── shared/         # Componentes compartilhados
├── features/            # Features (vendas, produtos, etc.)
│   └── products/
│       ├── api/        # API calls
│       ├── components/ # Componentes específicos
│       ├── pages/      # Páginas
│       ├── store/      # Pinia stores
│       └── types/      # TypeScript types
├── layouts/             # Layouts (AppShell, etc.)
├── router/              # Configuração de rotas
├── stores/              # Stores globais
├── types/               # Types globais
└── utils/               # Utilities globais
```

## 🔄 Próximos Passos

### Imediato (Fazer Agora)
1. ✅ Atualizar `AppShell.vue` com novo design system
2. ✅ Criar sistema de notificações Toast
3. ✅ Implementar mobile menu hambúrguer
4. ✅ Criar mais componentes UI (Modal, Select, Table)

### Curto Prazo (Próxima Semana)
1. Criar utils (formatação de data, moeda, validação)
2. Definir types TypeScript centralizados
3. Implementar dark mode toggle
4. Melhorar páginas existentes com novos componentes

### Médio Prazo (Próximas Semanas)
1. Sistema de permissões
2. Internacionalização (i18n)
3. Testes unitários
4. Performance optimization

## 📚 Recursos

- [Vue 3 Docs](https://vuejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Pinia](https://pinia.vuejs.org/)
- [Supabase](https://supabase.com/docs)
- [Vite](https://vitejs.dev/)

## 💡 Dicas

1. **Sempre use composables** para lógica reutilizável
2. **Use design tokens** em vez de valores hard-coded
3. **Pense mobile-first** ao criar layouts
4. **Valide formulários** com useForm
5. **Mostre feedback** ao usuário com useToast
6. **TypeScript é obrigatório** - sempre tipar!

## 🤝 Contribuindo

1. Siga a estrutura de pastas estabelecida
2. Use o Composition API (`<script setup>`)
3. Documente novos componentes e composables
4. Teste em mobile e desktop
5. Use os design tokens existentes

---

**Versão**: 1.0.0
**Última atualização**: Dezembro 2025
