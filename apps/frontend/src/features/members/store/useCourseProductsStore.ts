import { defineStore } from "pinia";
import {
  addCourseProduct,
  fetchCourseProductsByCourse,
  removeCourseProduct,
  type CourseProduct,
} from "../api/courseProductsApi";

interface CourseProductsState {
  itemsByCourse: Record<string, CourseProduct[]>;
  loading: boolean;
  error: string | null;
}

export const useCourseProductsStore = defineStore("courseProducts", {
  state: (): CourseProductsState => ({
    itemsByCourse: {},
    loading: false,
    error: null,
  }),
  actions: {
    async loadForCourse(courseId: string) {
      this.loading = true;
      this.error = null;
      try {
        const items = await fetchCourseProductsByCourse(courseId);
        this.itemsByCourse[courseId] = items;
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao carregar vínculos de produtos.";
      } finally {
        this.loading = false;
      }
    },
    async addForCourse(tenantId: string, courseId: string, productId: string) {
      this.loading = true;
      this.error = null;
      try {
        const item = await addCourseProduct(tenantId, courseId, productId);
        const list = this.itemsByCourse[courseId] ?? [];
        this.itemsByCourse[courseId] = [item, ...list];
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao vincular produto.";
      } finally {
        this.loading = false;
      }
    },
    async remove(id: string, courseId: string) {
      this.loading = true;
      this.error = null;
      try {
        await removeCourseProduct(id);
        const list = this.itemsByCourse[courseId] ?? [];
        this.itemsByCourse[courseId] = list.filter((item) => item.id !== id);
      } catch (error) {
        this.error =
          error instanceof Error
            ? error.message
            : "Erro desconhecido ao remover vínculo.";
      } finally {
        this.loading = false;
      }
    },
  },
});

