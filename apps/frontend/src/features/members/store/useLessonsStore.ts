import { defineStore } from "pinia";
import {
  createLesson,
  fetchLessons,
  updateLesson,
  type CreateLessonInput,
  type Lesson,
  type LessonStatus,
} from "../api/lessonsApi";

interface LessonsState {
  items: Lesson[];
  loading: boolean;
  error: string | null;
}

export const useLessonsStore = defineStore("lessons", {
  state: (): LessonsState => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async loadLessons(courseId: string) {
      this.loading = true;
      this.error = null;
      try {
        this.items = await fetchLessons(courseId);
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erro desconhecido ao carregar aulas.";
      } finally {
        this.loading = false;
      }
    },
    async addLesson(input: CreateLessonInput) {
      this.loading = true;
      this.error = null;
      try {
        const lesson = await createLesson(input);
        this.items.push(lesson);
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erro desconhecido ao criar aula.";
      } finally {
        this.loading = false;
      }
    },
    async updateLessonStatus(id: string, status: LessonStatus) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await updateLesson({ id, status });
        const idx = this.items.findIndex((l) => l.id === id);
        if (idx !== -1) {
          this.items[idx] = updated;
        }
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao atualizar aula.";
      } finally {
        this.loading = false;
      }
    },
    async moveLesson(id: string, direction: "up" | "down") {
      const index = this.items.findIndex((l) => l.id === id);
      if (index === -1) return;

      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= this.items.length) return;

      const current = this.items[index];
      const target = this.items[targetIndex];

      this.loading = true;
      this.error = null;
      try {
        const currentOrder = current.order_index;
        const targetOrder = target.order_index;

        const [updatedCurrent, updatedTarget] = await Promise.all([
          updateLesson({ id: current.id, orderIndex: targetOrder }),
          updateLesson({ id: target.id, orderIndex: currentOrder }),
        ]);

        this.items.splice(index, 1, updatedTarget);
        this.items.splice(targetIndex, 1, updatedCurrent);

        this.items.sort((a, b) => a.order_index - b.order_index);
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao reordenar aulas.";
      } finally {
        this.loading = false;
      }
    },
  },
});
