<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { useCourseProductsStore } from "../store/useCourseProductsStore";
import { useCoursesStore } from "../store/useCoursesStore";
import { useProductsStore } from "../../products/store/useProductsStore";
import { useAuthStore } from "../../auth/store/useAuthStore";

const route = useRoute();
const router = useRouter();

const courseId = route.params.courseId as string;

const courseProductsStore = useCourseProductsStore();
const coursesStore = useCoursesStore();
const productsStore = useProductsStore();
const authStore = useAuthStore();

const selectedProductId = ref<string | null>(null);

const course = computed(() =>
  coursesStore.items.find((c) => c.id === courseId) ?? null,
);

const links = computed(
  () => courseProductsStore.itemsByCourse[courseId] ?? [],
);

const availableProducts = computed(() => {
  const linkedIds = new Set(links.value.map((l) => l.product_id));
  return productsStore.items.filter((p) => !linkedIds.has(p.id));
});

async function load() {
  if (!coursesStore.items.length) {
    await coursesStore.loadCourses();
  }
  if (!productsStore.items.length) {
    await productsStore.loadProducts();
  }
  await courseProductsStore.loadForCourse(courseId);
}

async function onAdd() {
  if (!authStore.activeTenantId || !selectedProductId.value) {
    alert("Selecione um produto para vincular.");
    return;
  }

  await courseProductsStore.addForCourse(
    authStore.activeTenantId,
    courseId,
    selectedProductId.value,
  );

  selectedProductId.value = null;
}

async function onRemove(linkId: string) {
  await courseProductsStore.remove(linkId, courseId);
}

function goBack() {
  router.push({ name: "courses" });
}

onMounted(() => {
  load();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">
          Vincular produtos ao curso
        </h1>
        <p class="subtitle">
          Defina quais produtos liberam acesso automático a este curso na área de membros.
        </p>
      </div>
      <BaseButton variant="ghost" @click="goBack">
        Voltar para cursos
      </BaseButton>
    </div>

    <BaseCard>
      <template #default>
        <div v-if="course" class="course-header">
          <p class="course-title">
            {{ course.title }}
          </p>
          <p class="course-description">
            {{ course.description || "Curso sem descrição detalhada." }}
          </p>
        </div>
        <p v-else class="empty">
          Curso não encontrado.
        </p>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <form class="form" @submit.prevent="onAdd">
          <label class="field">
            <span>Produto</span>
            <select v-model="selectedProductId">
              <option value="" disabled>Selecione um produto</option>
              <option
                v-for="product in availableProducts"
                :key="product.id"
                :value="product.id"
              >
                {{ product.name }} ({{ product.code }})
              </option>
            </select>
          </label>

          <BaseButton
            type="submit"
            variant="primary"
            :disabled="courseProductsStore.loading || !availableProducts.length"
          >
            {{
              courseProductsStore.loading
                ? "Vinculando..."
                : "Vincular produto ao curso"
            }}
          </BaseButton>

          <p v-if="courseProductsStore.error" class="error">
            {{ courseProductsStore.error }}
          </p>
        </form>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">
          Produtos que liberam este curso
        </h2>
        <table v-if="links.length" class="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Código</th>
              <th>Vinculado em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="link in links" :key="link.id">
              <td>{{ link.product?.name || "Produto" }}</td>
              <td>{{ link.product?.code || "-" }}</td>
              <td>{{ new Date(link.created_at).toLocaleString() }}</td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="link-button"
                  :disabled="courseProductsStore.loading"
                  @click="onRemove(link.id)"
                >
                  Remover vínculo
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhum produto vinculado ainda. Assim que uma venda é confirmada para um dos
          produtos vinculados, a membership é criada automaticamente para o comprador.
        </p>
      </template>
    </BaseCard>
  </div>
</template>

<style scoped>
.page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 1.3rem;
  font-weight: 700;
}

.subtitle {
  margin-top: 0.15rem;
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.course-header {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.course-title {
  font-size: 1.05rem;
  font-weight: 600;
}

.course-description {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

select {
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.45rem 0.65rem;
  font-size: 0.9rem;
  background: var(--rp-color-bg-soft);
  color: var(--rp-color-text-main);
}

.list-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.table th,
.table td {
  border-bottom: 1px solid rgba(15, 23, 42, 0.7);
  padding: 0.5rem 0.75rem;
  text-align: left;
}

.table th {
  background-color: var(--rp-color-bg-soft);
}

.actions-cell {
  white-space: nowrap;
}

.link-button {
  background: transparent;
  border: none;
  color: var(--rp-color-primary);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0 0.25rem;
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.9rem;
}

.empty {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}
</style>

