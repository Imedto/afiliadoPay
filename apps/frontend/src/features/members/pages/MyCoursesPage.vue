<script setup lang="ts">
import { onMounted, ref } from "vue";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { fetchMyMemberships, type Membership } from "../api/membershipsApi";

const loading = ref(false);
const error = ref<string | null>(null);
const memberships = ref<Membership[]>([]);

async function load() {
  loading.value = true;
  error.value = null;
  try {
    memberships.value = await fetchMyMemberships();
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao carregar cursos.";
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Meus cursos</h1>
        <p class="subtitle">
          Cursos liberados para o seu usuário na área de membros.
        </p>
      </div>
    </div>

    <BaseCard>
      <template #default>
        <p v-if="error" class="error">
          {{ error }}
        </p>

        <div v-if="memberships.length" class="grid">
          <article
            v-for="m in memberships"
            :key="m.id"
            class="course-card"
          >
            <h2 class="course-title">
              {{ m.course?.title ?? "Curso sem título" }}
            </h2>
            <p class="course-description">
              {{ m.course?.description || "Curso sem descrição." }}
            </p>
            <div class="course-footer">
              <span class="pill">Status: {{ m.status }}</span>
              <BaseButton
                variant="secondary"
                @click="$router.push({ name: 'course-player', params: { courseId: m.course_id } })"
              >
                Entrar no curso
              </BaseButton>
            </div>
          </article>
        </div>
        <p v-else-if="!loading" class="empty">
          Nenhum curso ativo encontrado para este usuário.
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

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.course-card {
  border-radius: var(--rp-radius-md);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 1rem 1rem 0.9rem;
  background: var(--rp-color-surface-soft);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.course-title {
  font-size: 1rem;
  font-weight: 600;
}

.course-description {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.course-footer {
  margin-top: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pill {
  font-size: 0.8rem;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  background: var(--rp-color-primary-soft);
  color: var(--rp-color-primary-strong);
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
