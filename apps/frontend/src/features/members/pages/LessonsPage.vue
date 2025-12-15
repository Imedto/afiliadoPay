<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useRoute } from "vue-router";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { useLessonsStore } from "../store/useLessonsStore";
import { useCoursesStore } from "../store/useCoursesStore";
import { useAuthStore } from "../../auth/store/useAuthStore";

const route = useRoute();
const lessonsStore = useLessonsStore();
const coursesStore = useCoursesStore();
const authStore = useAuthStore();

const courseId = route.params.courseId as string;

const title = ref("");
const contentUrl = ref("");

const course = computed(() =>
  coursesStore.items.find((c) => c.id === courseId) ?? null,
);

onMounted(async () => {
  if (!coursesStore.items.length) {
    await coursesStore.loadCourses();
  }
  await lessonsStore.loadLessons(courseId);
});

async function onCreate() {
  if (!authStore.user || !authStore.activeTenantId) {
    alert("Nenhum tenant ativo encontrado para este usuário.");
    return;
  }

  await lessonsStore.addLesson({
    tenantId: authStore.activeTenantId,
    courseId,
    title: title.value.trim(),
    contentUrl: contentUrl.value.trim() || undefined,
  });

  title.value = "";
  contentUrl.value = "";
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">
          Aulas
          <span v-if="course" class="course-title">· {{ course.title }}</span>
        </h1>
        <p class="subtitle">
          Cadastre as aulas que compõem este curso.
        </p>
      </div>
    </div>

    <BaseCard>
      <template #default>
        <form class="form" @submit.prevent="onCreate">
          <label class="field">
            <span>Título da aula</span>
            <input v-model="title" required />
          </label>

          <label class="field">
            <span>URL do conteúdo (vídeo, página, etc.)</span>
            <input
              v-model="contentUrl"
              type="url"
              placeholder="https://..."
            />
          </label>

          <BaseButton
            type="submit"
            :variant="'primary'"
            :disabled="lessonsStore.loading"
          >
            {{ lessonsStore.loading ? "Salvando..." : "Criar aula" }}
          </BaseButton>

          <p v-if="lessonsStore.error" class="error">
            {{ lessonsStore.error }}
          </p>
        </form>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">Lista de aulas</h2>
        <table v-if="lessonsStore.items.length" class="table">
          <thead>
            <tr>
              <th>Ordem</th>
              <th>Título</th>
              <th>URL</th>
              <th>Status</th>
              <th>Criada em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="lesson in lessonsStore.items" :key="lesson.id">
              <td>{{ lesson.order_index }}</td>
              <td>{{ lesson.title }}</td>
              <td>
                <a
                  v-if="lesson.content_url"
                  :href="lesson.content_url"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir
                </a>
                <span v-else>-</span>
              </td>
              <td>{{ lesson.status }}</td>
              <td>{{ new Date(lesson.created_at).toLocaleString() }}</td>
              <td class="actions-cell">
                <button
                  type="button"
                  class="link-button"
                  :disabled="lessonsStore.loading || lesson.status === 'published'"
                  @click="lessonsStore.updateLessonStatus(lesson.id, 'published')"
                >
                  Publicar
                </button>
                <button
                  type="button"
                  class="link-button"
                  :disabled="lessonsStore.loading || lesson.status === 'draft'"
                  @click="lessonsStore.updateLessonStatus(lesson.id, 'draft')"
                >
                  Voltar para rascunho
                </button>
                <button
                  type="button"
                  class="link-button"
                  :disabled="lessonsStore.loading"
                  @click="lessonsStore.moveLesson(lesson.id, 'up')"
                >
                  ↑
                </button>
                <button
                  type="button"
                  class="link-button"
                  :disabled="lessonsStore.loading"
                  @click="lessonsStore.moveLesson(lesson.id, 'down')"
                >
                  ↓
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhuma aula cadastrada ainda.
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

.course-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--rp-color-text-muted);
}

.subtitle {
  margin-top: 0.15rem;
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

input {
  border-radius: var(--rp-radius-sm);
  border: 1px solid var(--rp-color-border-subtle);
  padding: 0.45rem 0.65rem;
  font-size: 0.9rem;
  background: var(--rp-color-bg-soft);
  color: var(--rp-color-text-main);
}

.error {
  margin-top: 0.25rem;
  color: var(--rp-color-danger);
  font-size: 0.9rem;
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

.empty {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
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
</style>
