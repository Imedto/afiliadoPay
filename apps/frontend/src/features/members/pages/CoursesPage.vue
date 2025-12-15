<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { useCoursesStore } from "../store/useCoursesStore";
import { useCourseProgressStore } from "../store/useCourseProgressStore";
import { useAuthStore } from "../../auth/store/useAuthStore";

const coursesStore = useCoursesStore();
const courseProgressStore = useCourseProgressStore();
const authStore = useAuthStore();
const router = useRouter();

const title = ref("");
const description = ref("");

onMounted(() => {
  coursesStore.loadCourses();
  courseProgressStore.load();
});

const progressByCourse = computed(() => courseProgressStore.itemsByCourse);

async function onCreate() {
  if (!authStore.user || !authStore.activeTenantId) {
    alert("Nenhum tenant ativo encontrado para este usuário.");
    return;
  }

  await coursesStore.addCourse({
    tenantId: authStore.activeTenantId,
    title: title.value.trim(),
    description: description.value.trim() || undefined,
  });

  title.value = "";
  description.value = "";
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="title">Cursos</h1>
        <p class="subtitle">
          Cadastre e gerencie cursos da área de membros.
        </p>
      </div>
    </div>

    <BaseCard>
      <template #default>
        <form class="form" @submit.prevent="onCreate">
          <label class="field">
            <span>Título</span>
            <input v-model="title" required />
          </label>

          <label class="field">
            <span>Descrição</span>
            <textarea v-model="description" rows="3" />
          </label>

          <BaseButton
            type="submit"
            :variant="'primary'"
            :disabled="coursesStore.loading"
          >
            {{ coursesStore.loading ? "Salvando..." : "Criar curso" }}
          </BaseButton>

          <p v-if="coursesStore.error" class="error">
            {{ coursesStore.error }}
          </p>
        </form>
      </template>
    </BaseCard>

    <BaseCard>
      <template #default>
        <h2 class="list-title">Lista de cursos</h2>
        <table v-if="coursesStore.items.length" class="table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Publicado</th>
              <th>Criado em</th>
              <th>Alunos com progresso</th>
              <th>Aulas concluídas</th>
              <th>Aulas</th>
              <th>Produtos</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="course in coursesStore.items" :key="course.id">
              <td>{{ course.title }}</td>
              <td>{{ course.is_published ? "Sim" : "Não" }}</td>
              <td>{{ new Date(course.created_at).toLocaleString() }}</td>
              <td>
                {{
                  progressByCourse[course.id]?.students_with_progress ??
                  0
                }}
              </td>
              <td>
                {{
                  progressByCourse[course.id]?.total_completed_lessons ??
                  0
                }}
              </td>
              <td>
                <BaseButton
                  variant="secondary"
                  @click="$router.push({ name: 'lessons', params: { courseId: course.id } })"
                >
                  Gerenciar aulas
                </BaseButton>
              </td>
              <td>
                <BaseButton
                  variant="ghost"
                  @click="router.push({ name: 'course-products', params: { courseId: course.id } })"
                >
                  Vincular produtos
                </BaseButton>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty">
          Nenhum curso cadastrado ainda.
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

input,
textarea {
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
</style>
