import { defineStore } from "pinia";
import {
  fetchLessonProgressForCourse,
  markLessonCompleted,
  unmarkLessonCompleted,
  type LessonProgress,
} from "../api/lessonProgressApi";

interface LessonProgressState {
  itemsByCourse: Record<string, LessonProgress[]>;
  loading: boolean;
  error: string | null;
}

export const useLessonProgressStore = defineStore("lessonProgress", {
  state: (): LessonProgressState => ({
    itemsByCourse: {},
    loading: false,
    error: null,
  }),
  actions: {
    async loadForCourse(courseId: string) {
      this.loading = true;
      this.error = null;
      try {
        const items = await fetchLessonProgressForCourse(courseId);
        this.itemsByCourse[courseId] = items;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar progresso de aulas.";
      } finally {
        this.loading = false;
      }
    },
    async toggleLesson(
      tenantId: string,
      courseId: string,
      lessonId: string,
      completed: boolean,
    ) {
      this.loading = true;
      this.error = null;
      try {
        const list = this.itemsByCourse[courseId] ?? [];
        const exists = list.find((p) => p.lesson_id === lessonId);
        if (completed && !exists) {
          const created = await markLessonCompleted(tenantId, courseId, lessonId);
          this.itemsByCourse[courseId] = [...list, created];
        } else if (!completed && exists) {
          await unmarkLessonCompleted(courseId, lessonId);
          this.itemsByCourse[courseId] = list.filter(
            (p) => p.lesson_id !== lessonId,
          );
        }
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao atualizar progresso.";
      } finally {
        this.loading = false;
      }
    },
  },
});

