import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import FormProjeto from '../views/FormProjeto.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/projeto/novo', component: FormProjeto },
    { path: '/projeto/:id/editar', component: FormProjeto }
  ]
});

export default router;
