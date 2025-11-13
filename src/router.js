import {createRouter, createWebHistory} from "vue-router";
import login from "./shared/presentation/views/login.vue";
import relativesRoutes from "./relatives/presentatiton/relatives-routes.js";
import organizationRoutes from "./organization/presentation/organization-routes.js";
import useIAMStore from "./identity-access-managment/application/iam.store.js";

const pageNotFound = () => import('./shared/presentation/views/page-not-found.vue');

const routes = [
    {path: '/', redirect: '/login'},
    ...relativesRoutes,
    {path: '/login', name: 'login', component: login, meta: {title: 'Login', public: true}},
    {path: '/organization', name: 'organization', children: organizationRoutes, meta: {requiresAuth: true}},
    {path: '/:pathMatch(.*)*', name: 'not-found', component: pageNotFound, meta: {title: 'Page not found'}},
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes
});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${from.name} to ${to.name}`);
    let baseTitle = 'MediTrack';
    document.title = `${baseTitle} - ${to.meta['title'] || ''}`;
    
    // Check if route requires authentication
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    
    if (requiresAuth) {
        const iamStore = useIAMStore();
        console.log('Route requires auth, checking currentUser:', iamStore.currentUser);
        
        if (!iamStore.currentUser) {
            console.warn('No user logged in, redirecting to login');
            next({ name: 'login' });
            return;
        }
    }
    
    next();
});


export default router;