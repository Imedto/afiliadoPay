<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import BaseCard from "../../../components/ui/BaseCard.vue";
import BaseButton from "../../../components/ui/BaseButton.vue";
import { useCoursesStore } from "../store/useCoursesStore";
import { useLessonsStore } from "../store/useLessonsStore";
import { useLessonProgressStore } from "../store/useLessonProgressStore";
import { fetchMyMemberships, type Membership } from "../api/membershipsApi";

const route = useRoute();
const coursesStore = useCoursesStore();
const lessonsStore = useLessonsStore();
const lessonProgressStore = useLessonProgressStore();

const courseId = route.params.courseId as string;

const memberships = ref<Membership[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const activeLessonId = ref<string | null>(null);

const course = computed(() =>
  coursesStore.items.find((c) => c.id === courseId) ?? null,
);

const activeLesson = computed(() =>
  lessonsStore.items.find((l) => l.id === activeLessonId.value) ?? null,
);

const hasAccess = computed(() =>
  memberships.value.some((m) => m.course_id === courseId && m.status === "active"),
);

const activeMembership = computed(() =>
  memberships.value.find((m) => m.course_id === courseId && m.status === "active") ??
  null,
);

const completedLessonIds = computed(() => {
  const list = lessonProgressStore.itemsByCourse[courseId] ?? [];
  return new Set(list.map((p) => p.lesson_id));
});

const completedCount = computed(() => completedLessonIds.value.size);

const totalLessons = computed(() => lessonsStore.items.length);

const progressPercent = computed(() => {
  if (!totalLessons.value) return 0;
  return Math.round((completedCount.value / totalLessons.value) * 100);
});

async function load() {
  loading.value = true;
  error.value = null;

  try {
    if (!coursesStore.items.length) {
      await coursesStore.loadCourses();
    }

    // Carrega matrículas do usuário
    memberships.value = await fetchMyMemberships();

    if (!hasAccess.value) {
      error.value =
        "Seu usuário não possui acesso ativo a este curso. Verifique suas compras/assinaturas.";
      return;
    }

    await lessonsStore.loadLessons(courseId);
    await lessonProgressStore.loadForCourse(courseId);
    if (lessonsStore.items.length) {
      activeLessonId.value = lessonsStore.items[0].id;
    }
  } catch (err) {
    error.value =
      err instanceof Error ? err.message : "Erro desconhecido ao carregar curso.";
  } finally {
    loading.value = false;
  }
}

function selectLesson(id: string) {
  activeLessonId.value = id;
}

async function toggleLessonCompletion(lessonId: string) {
  if (!activeMembership.value) return;
  const completed = completedLessonIds.value.has(lessonId);
  await lessonProgressStore.toggleLesson(
    activeMembership.value.tenant_id,
    courseId,
    lessonId,
    !completed,
  );
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
          {{ course?.title ?? "Curso" }}
        </h1>
        <p class="subtitle">
          Área de membros – aulas liberadas para seu usuário.
        </p>
      </div>
    </div>

    <p v-if="error" class="error">
      {{ error }}
    </p>

    <div v-else class="layout" v-if="!loading">
      <BaseCard>
        <template #default>
          <h2 class="section-title">Aulas</h2>
          <p
            v-if="totalLessons"
            class="progress-text"
          >
            Progresso: {{ completedCount }} / {{ totalLessons }} aulas
            ({{ progressPercent }}%)
          </p>
          <ul class="lessons-list" v-if="lessonsStore.items.length">
            <li
              v-for="lesson in lessonsStore.items"
              :key="lesson.id"
              :class="[
                'lesson-item',
                {
                  'lesson-item--active': lesson.id === activeLessonId,
                  'lesson-item--completed': completedLessonIds.has(lesson.id),
                },
              ]"
            >
              <button type="button" class="lesson-button" @click="selectLesson(lesson.id)">
                <span class="lesson-title">{{ lesson.title }}</span>
                <span class="lesson-status">
                  <span v-if="completedLessonIds.has(lesson.id)">Concluída</span>
                  <span v-else>{{ lesson.status }}</span>
                </span>
              </button>
            </li>
          </ul>
          <p v-else class="empty">
            Nenhuma aula cadastrada ainda para este curso.
          </p>
        </template>
      </BaseCard>

      <BaseCard>
        <template #default>
          <div v-if="activeLesson">
            <h2 class="section-title">{{ activeLesson.title }}</h2>
            <p class="lesson-help">
              O conteúdo desta aula é carregado a partir da URL configurada. Por enquanto
              exibimos apenas um botão de acesso externo.
            </p>
            <div class="content-area">
              <BaseButton
                v-if="activeLesson.content_url"
                variant="primary"
                as="a"
                :href="activeLesson.content_url"
                target="_blank"
              >
                Abrir conteúdo da aula
              </BaseButton>
              <BaseButton
                v-if="activeLesson"
                type="button"
                variant="secondary"
                class="complete-btn"
                :disabled="lessonProgressStore.loading"
                @click="toggleLessonCompletion(activeLesson.id)"
              >
                {{
                  completedLessonIds.has(activeLesson.id)
                    ? "Marcar como não concluída"
                    : "Marcar aula como concluída"
                }}
              </BaseButton>
              <p v-else class="empty">
                Nenhuma URL de conteúdo configurada para esta aula.
              </p>
            </div>
          </div>
          <div v-else class="empty">
            Selecione uma aula na lista para visualizar o conteúdo.
          </div>
        </template>
      </BaseCard>
    </div>

    <p v-if="loading" class="loading">
      Carregando curso e aulas...
    </p>
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

.layout {
  display: grid;
  grid-template-columns: minmax(0, 260px) minmax(0, 1fr);
  gap: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.progress-text {
  font-size: 0.85rem;
  color: var(--rp-color-text-muted);
  margin-bottom: 0.5rem;
}

.lessons-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.lesson-item {
  border-radius: var(--rp-radius-sm);
  border: 1px solid transparent;
}

.lesson-item--active {
  border-color: var(--rp-color-primary);
  background: var(--rp-color-primary-soft);
}

.lesson-item--completed {
  border-color: rgba(34, 197, 94, 0.7);
  background: rgba(187, 247, 208, 0.3);
}

.lesson-button {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 0.45rem 0.6rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--rp-color-text-main);
}

.lesson-status {
  font-size: 0.8rem;
  color: var(--rp-color-text-muted);
}

.lesson-help {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
  margin-bottom: 0.75rem;
}

.content-area {
  margin-top: 0.5rem;
}

.complete-btn {
  margin-left: 0.75rem;
}

.error {
  color: var(--rp-color-danger);
  font-size: 0.9rem;
}

.empty {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

.loading {
  font-size: 0.9rem;
  color: var(--rp-color-text-muted);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
