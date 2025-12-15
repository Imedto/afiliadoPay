import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import LoginPage from "../features/auth/pages/LoginPage.vue";
import RegisterPage from "../features/auth/pages/RegisterPage.vue";
import SalesListPage from "../features/sales/pages/SalesListPage.vue";
import ProductsListPage from "../features/products/pages/ProductsListPage.vue";
import AppShell from "../layouts/AppShell.vue";
import DesignSystemPage from "../features/design/pages/DesignSystemPage.vue";
import DashboardPage from "../features/dashboard/pages/DashboardPage.vue";
import ProductCheckoutConfigPage from "../features/checkout/pages/ProductCheckoutConfigPage.vue";
import MarketplacePage from "../features/marketplace/pages/MarketplacePage.vue";
import PublicCheckoutPage from "../features/checkout/pages/PublicCheckoutPage.vue";
import AffiliatesPage from "../features/affiliates/pages/AffiliatesPage.vue";
import AffiliateDetailPage from "../features/affiliates/pages/AffiliateDetailPage.vue";
import CommissionsPage from "../features/commissions/pages/CommissionsPage.vue";
import GatewaysPage from "../features/gateways/pages/GatewaysPage.vue";
import AccountPage from "../features/account/pages/AccountPage.vue";
import CoursesPage from "../features/members/pages/CoursesPage.vue";
import LessonsPage from "../features/members/pages/LessonsPage.vue";
import CourseProductsPage from "../features/members/pages/CourseProductsPage.vue";
import AffiliatePortalPage from "../features/affiliatePortal/pages/AffiliatePortalPage.vue";
import SalesReportsPage from "../features/reports/pages/SalesReportsPage.vue";
import MyCoursesPage from "../features/members/pages/MyCoursesPage.vue";
import CoursePlayerPage from "../features/members/pages/CoursePlayerPage.vue";
import { useAuthStore } from "../features/auth/store/useAuthStore";

const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "login",
    component: LoginPage,
  },
  {
    path: "/affiliate",
    name: "affiliate-portal",
    component: AffiliatePortalPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/register",
    name: "register",
    component: RegisterPage,
  },
  {
    path: "/app",
    component: AppShell,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "dashboard",
        component: DashboardPage,
      },
      {
        path: "sales",
        name: "sales",
        component: SalesListPage,
      },
      {
        path: "marketplace",
        name: "marketplace",
        component: MarketplacePage,
      },
      {
        path: "affiliates",
        name: "affiliates",
        component: AffiliatesPage,
      },
      {
        path: "affiliates/:affiliateId",
        name: "affiliate-detail",
        component: AffiliateDetailPage,
      },
      {
        path: "commissions",
        name: "commissions",
        component: CommissionsPage,
      },
      {
        path: "gateways",
        name: "gateways",
        component: GatewaysPage,
      },
      {
        path: "account",
        name: "account",
        component: AccountPage,
      },
      {
        path: "courses",
        name: "courses",
        component: CoursesPage,
      },
      {
        path: "courses/:courseId/products",
        name: "course-products",
        component: CourseProductsPage,
      },
      {
        path: "courses/:courseId/lessons",
        name: "lessons",
        component: LessonsPage,
      },
      {
        path: "my-courses",
        name: "my-courses",
        component: MyCoursesPage,
      },
      {
        path: "my-courses/:courseId",
        name: "course-player",
        component: CoursePlayerPage,
      },
      {
        path: "design",
        name: "design-system",
        component: DesignSystemPage,
      },
      {
        path: "products",
        name: "products",
        component: ProductsListPage,
      },
      {
        path: "products/:productId/checkout",
        name: "product-checkout-config",
        component: ProductCheckoutConfigPage,
      },
      {
        path: "reports",
        name: "sales-reports",
        component: SalesReportsPage,
      },
    ],
  },
  {
    path: "/",
    redirect: "/app",
  },
  {
    path: "/checkout/:slug",
    name: "public-checkout",
    component: PublicCheckoutPage,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: "login" });
    return;
  }

  if (to.name === "login" && authStore.isAuthenticated) {
    next({ name: "sales" });
    return;
  }

  next();
});
