# RenderPay Frontend - Arquitetura

## Visão Geral

Frontend moderno construído com **Vue 3**, **TypeScript**, **Vite** e **Supabase**, seguindo as melhores práticas de desenvolvimento e padrões de arquitetura escaláveis.

## Stack Tecnológica

- **Framework**: Vue 3 (Composition API + `<script setup>`)
- **Linguagem**: TypeScript
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Backend**: Supabase (Auth, Database, Storage, Edge Functions)
- **Estilização**: CSS Modules + Design Tokens

## Estrutura de Diretórios

```
src/
├── assets/              # Recursos estáticos (imagens, fontes, CSS global)
│   ├── design-tokens.css
│   ├── base.css
│   ├── main.css
│   └── images/
│
├── components/          # Componentes reutilizáveis globais
│   ├── ui/             # Componentes UI base (botões, inputs, cards)
│   ├── layout/         # Componentes de layout (Header, Footer, Sidebar)
│   └── shared/         # Componentes compartilhados entre features
│
├── composables/         # Composition functions reutilizáveis
│   ├── useAuth.ts
│   ├── useBreakpoints.ts
│   ├── useDebounce.ts
│   ├── useForm.ts
│   ├── useLocalStorage.ts
│   ├── useToast.ts
│   └── ...
│
├── features/            # Módulos de funcionalidades (Feature-based architecture)
│   ├── auth/
│   │   ├── api/        # Chamadas API específicas
│   │   ├── components/ # Componentes específicos da feature
│   │   ├── composables/# Hooks específicos da feature
│   │   ├── pages/      # Páginas/Views
│   │   ├── store/      # State management (Pinia stores)
│   │   ├── types/      # TypeScript types
│   │   └── utils/      # Utilidades específicas
│   ├── dashboard/
│   ├── products/
│   ├── sales/
│   ├── affiliates/
│   └── ...
│
├── layouts/             # Layouts principais da aplicação
│   ├── AppShell.vue    # Layout principal com sidebar
│   ├── AuthLayout.vue  # Layout para páginas de autenticação
│   └── PublicLayout.vue# Layout para páginas públicas
│
├── lib/                 # Configurações de bibliotecas externas
│   ├── supabaseClient.ts
│   ├── env.ts
│   └── ...
│
├── router/              # Configuração de rotas
│   ├── index.ts
│   ├── guards.ts       # Route guards
│   └── routes/         # Definições de rotas por feature
│       ├── auth.ts
│       ├── dashboard.ts
│       └── ...
│
├── stores/              # Stores globais do Pinia
│   ├── app.ts          # Store global da aplicação
│   ├── theme.ts        # Theme switcher (dark/light mode)
│   └── notifications.ts# Sistema de notificações global
│
├── types/               # TypeScript types globais
│   ├── api.ts          # Tipos relacionados à API
│   ├── models.ts       # Models de dados
│   ├── enums.ts        # Enumerações
│   └── index.ts        # Re-exports
│
├── utils/               # Funções utilitárias globais
│   ├── date.ts         # Formatação de datas
│   ├── currency.ts     # Formatação de moeda
│   ├── validation.ts   # Validações
│   ├── string.ts       # Manipulação de strings
│   └── ...
│
├── App.vue              # Componente raiz
└── main.ts              # Entry point da aplicação
```

## Princípios Arquiteturais

### 1. **Feature-Based Organization**

Cada funcionalidade (feature) é autocontida e possui sua própria estrutura interna:

```
features/products/
├── api/
│   └── productsApi.ts          # Todas as chamadas de API
├── components/
│   ├── ProductCard.vue         # Componentes específicos
│   └── ProductForm.vue
├── composables/
│   └── useProduct.ts           # Lógica reutilizável da feature
├── pages/
│   ├── ProductsListPage.vue    # Views/Páginas
│   └── ProductDetailPage.vue
├── store/
│   └── useProductsStore.ts     # State management
├── types/
│   └── product.ts              # Tipos específicos
└── utils/
    └── productHelpers.ts       # Utilities específicas
```

### 2. **Composition API First**

Todo código Vue deve usar Composition API com `<script setup>`:

```vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Product } from '../types/product'

// Props com TypeScript
const props = defineProps<{
  productId: string
}>()

// Emits tipados
const emit = defineEmits<{
  save: [product: Product]
  cancel: []
}>()

// State reativo
const loading = ref(false)
const product = ref<Product | null>(null)

// Computed properties
const isValid = computed(() => !!product.value?.name)

// Lifecycle hooks
onMounted(async () => {
  await loadProduct()
})

// Methods
async function loadProduct() {
  // ...
}
</script>
```

### 3. **TypeScript Strict Mode**

Todos os arquivos devem ser tipados:

```typescript
// types/product.ts
export interface Product {
  id: string
  name: string
  price: number
  status: ProductStatus
  createdAt: Date
}

export enum ProductStatus {
  Active = 'active',
  Inactive = 'inactive',
  Draft = 'draft'
}

export type ProductFormData = Omit<Product, 'id' | 'createdAt'>
```

### 4. **Composables para Lógica Reutilizável**

Extrair lógica complexa em composables:

```typescript
// composables/useProduct.ts
import { ref } from 'vue'
import type { Product } from '@/types'

export function useProduct(productId: string) {
  const product = ref<Product | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function load() {
    loading.value = true
    error.value = null
    try {
      product.value = await fetchProduct(productId)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erro desconhecido'
    } finally {
      loading.value = false
    }
  }

  return {
    product,
    loading,
    error,
    load
  }
}
```

### 5. **State Management com Pinia**

Usar Pinia para state management:

```typescript
// features/products/store/useProductsStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Product } from '../types/product'

export const useProductsStore = defineStore('products', () => {
  // State
  const products = ref<Product[]>([])
  const loading = ref(false)

  // Getters
  const activeProducts = computed(() =>
    products.value.filter(p => p.status === 'active')
  )

  // Actions
  async function fetchProducts() {
    loading.value = true
    try {
      products.value = await api.getProducts()
    } finally {
      loading.value = false
    }
  }

  return {
    products,
    loading,
    activeProducts,
    fetchProducts
  }
})
```

### 6. **API Layer Separado**

Centralizar todas as chamadas de API:

```typescript
// features/products/api/productsApi.ts
import { supabase } from '@/lib/supabaseClient'
import type { Product } from '../types/product'

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createProduct(product: ProductFormData): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data
}
```

## Convenções de Nomenclatura

### Arquivos e Diretórios

- **Componentes Vue**: `PascalCase.vue` (ex: `ProductCard.vue`)
- **Composables**: `use*.ts` (ex: `useProducts.ts`)
- **Stores**: `use*Store.ts` (ex: `useProductsStore.ts`)
- **Types**: `*.ts` em `camelCase` ou `PascalCase` (ex: `product.ts`, `Product.ts`)
- **Utils**: `camelCase.ts` (ex: `dateUtils.ts`)
- **Diretórios**: `kebab-case` (ex: `affiliate-portal/`)

### Código TypeScript

- **Interfaces**: `PascalCase` com prefixo `I` opcional (ex: `Product` ou `IProduct`)
- **Types**: `PascalCase` (ex: `ProductStatus`)
- **Enums**: `PascalCase` (ex: `UserRole`)
- **Variáveis/Funções**: `camelCase` (ex: `productName`, `fetchProducts()`)
- **Constantes**: `SCREAMING_SNAKE_CASE` (ex: `MAX_UPLOAD_SIZE`)

## Padrões de Componentes

### Estrutura de um Componente

```vue
<script setup lang="ts">
// 1. Imports
import { ref, computed, onMounted } from 'vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import type { Product } from '../types/product'

// 2. Props
const props = defineProps<{
  productId: string
  editable?: boolean
}>()

// 3. Emits
const emit = defineEmits<{
  save: [product: Product]
  cancel: []
}>()

// 4. Composables
const { product, loading, error, load } = useProduct(props.productId)

// 5. Local state
const isEditing = ref(false)

// 6. Computed properties
const canEdit = computed(() => props.editable && !loading.value)

// 7. Methods
function handleSave() {
  emit('save', product.value!)
}

// 8. Lifecycle
onMounted(() => {
  load()
})
</script>

<template>
  <div class="product-detail">
    <!-- Template markup -->
  </div>
</template>

<style scoped>
/* Component-specific styles */
.product-detail {
  /* Use design tokens */
  padding: var(--rp-space-4);
  background: var(--rp-surface-base);
  border-radius: var(--rp-radius-lg);
}
</style>
```

## Responsividade

### Breakpoints

Usar os breakpoints definidos nos design tokens:

```css
/* Mobile first approach */
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

### Composable useBreakpoints

```typescript
// composables/useBreakpoints.ts
import { ref, onMounted, onUnmounted } from 'vue'

export function useBreakpoints() {
  const isMobile = ref(false)
  const isTablet = ref(false)
  const isDesktop = ref(false)

  function updateBreakpoints() {
    const width = window.innerWidth
    isMobile.value = width < 768
    isTablet.value = width >= 768 && width < 1024
    isDesktop.value = width >= 1024
  }

  onMounted(() => {
    updateBreakpoints()
    window.addEventListener('resize', updateBreakpoints)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateBreakpoints)
  })

  return { isMobile, isTablet, isDesktop }
}
```

## Tratamento de Erros

### API Errors

```typescript
// utils/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'Erro desconhecido'
}
```

## Performance

### Code Splitting

```typescript
// router/index.ts
const routes = [
  {
    path: '/products',
    component: () => import('../features/products/pages/ProductsPage.vue')
  }
]
```

### Lazy Loading de Componentes

```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'

const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>
```

## Testes (Futuro)

- **Unit Tests**: Vitest
- **Component Tests**: Vue Test Utils
- **E2E Tests**: Playwright

## Próximos Passos

1. ✅ Sistema de Design e Tokens
2. ⏳ Biblioteca de Componentes UI
3. ⏳ Composables Globais
4. ⏳ Sistema de Notificações/Toast
5. ⏳ Tratamento de Erros Global
6. ⏳ Sistema de Permissões
7. ⏳ Internacionalização (i18n)
8. ⏳ Testes Automatizados
