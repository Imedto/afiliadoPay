import { defineStore } from "pinia";
import {
  createCourse,
  fetchCourses,
  type Course,
  type CreateCourseInput,
} from "../api/coursesApi";

interface CoursesState {
  items: Course[];
  loading: boolean;
  error: string | null;
}

export const useCoursesStore = defineStore("courses", {
  state: (): CoursesState => ({
    items: [],
    loading: false,
    error: null,
  }),
  actions: {
    async loadCourses() {
      this.loading = true;
      this.error = null;
      try {
        this.items = await fetchCourses();
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erro desconhecido ao carregar cursos.";
      } finally {
        this.loading = false;
      }
    },
    async addCourse(input: CreateCourseInput) {
      this.loading = true;
      this.error = null;
      try {
        const course = await createCourse(input);
        this.items.unshift(course);
      } catch (error) {
        this.error =
          error instanceof Error ? error.message : "Erro desconhecido ao criar curso.";
      } finally {
        this.loading = false;
      }
    },
  },
});

