import Vue from 'vue';
import Router from 'vue-router';
import Index from './Index.vue';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/index',
    },
    {
      path: '/index',
      name: 'index',
      component: Index,
    },
    {
      path: '/operation',
      name: 'operation',
      component: () => import(/* webpackChunkName: "operation" */ './Operation.vue'),
    },
  ],
});
