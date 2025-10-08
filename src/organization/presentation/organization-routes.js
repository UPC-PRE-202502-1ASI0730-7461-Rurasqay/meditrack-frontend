const doctorList =() => import('./views/doctor-list.vue');

const organizationRoutes = [
    {path: 'doctors', name: 'organization-doctors', component: doctorList, meta: {title: 'Doctors'}}
];

export default organizationRoutes;