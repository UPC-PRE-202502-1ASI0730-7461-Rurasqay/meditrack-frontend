import {createRouter, createWebHistory} from "vue-router";

const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    { path: '/:pathMatch(.*)*', name: 'not-found',  component: pageNotFound,    meta: { title: 'Page not found' } },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes
});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    let baseTitle = 'MediTrack';
    document.title = `${baseTitle} - ${to.meta['title'] || ''}`;
    next();
});


export default router;