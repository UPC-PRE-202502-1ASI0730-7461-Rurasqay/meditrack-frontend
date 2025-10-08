const alertList = () => import('./views/alert-list.vue');
const profile = () => import('./views/profile.vue');
const statistic = () => import('./views/statistic.vue');
const support = () => import('./views/support.vue');

const relativesRoutes = [
    {
        path: '/relative/:id/alerts',
        name: 'relative-alerts',
        component: alertList,
        meta: { title: 'Alerts' }
    },
    {
        path: '/relative/:id/profile',
        name: 'relative-profile',
        component: profile,
        meta: { title: 'Profile' }
    },
    {
        path: '/relative/:id/statistics',
        name: 'relative-statistics',
        component: statistic,
        meta: { title: 'Statistics' }
    },
    {
        path: '/relative/:id/support',
        name: 'relative-support',
        component: support,
        meta: { title: 'Support' }
    }
];

export default relativesRoutes;
