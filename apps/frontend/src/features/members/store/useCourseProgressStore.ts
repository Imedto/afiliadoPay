import { defineStore } from "pinia";
import {
  fetchCourseProgressSummary,
  type CourseProgressSummary,
} from "../api/courseProgressApi";

interface CourseProgressState {
  itemsByCourse: Record<string, CourseProgressSummary>;
  loading: boolean;
  error: string | null;
}

export const useCourseProgressStore = defineStore("courseProgress", {
  state: (): CourseProgressState => ({
    itemsByCourse: {},
    loading: false,
    error: null,
  }),
  actions: {
    async load() {
      this.loading = true;
      this.error = null;
      try {
        const items = await fetchCourseProgressSummary();
        const map: Record<string, CourseProgressSummary> = {};
        for (const item of items) {
          map[item.course_id] = item;
        }
        this.itemsByCourse = map;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar progresso dos cursos.";
      } finally {
        this.loading = false;
      }
    },
  },
});

