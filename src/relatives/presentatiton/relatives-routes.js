const alertList = () => import('./views/alert-list.vue');
const profile = () => import('./views/profile.vue');
const statistic = () => import('./views/statistic.vue');
const support = () => import('./views/support.vue');
const RelativesLayout = () => import('./views/relative-layout.vue');

const relativesRoutes = [
    {
        path: '/relative/:id',
        component: RelativesLayout,
        children: [
            {
                path: '',
                redirect: { name: 'relative-profile' }
            },
            {
                path: 'alerts',
                name: 'relative-alerts',
                component: alertList,
                meta: { title: 'Alerts' },
            },
            {
                path: 'profile',
                name: 'relative-profile',
                component: profile,
                meta: { title: 'Profile' },
            },
            {
                path: 'statistics',
                name: 'relative-statistics',
                component: statistic,
                meta: { title: 'Statistics' },
            },
            {
                path: 'support',
                name: 'relative-support',
                component: support,
                meta: { title: 'Support' },
            },
        ],
    },
];

export default relativesRoutes;
