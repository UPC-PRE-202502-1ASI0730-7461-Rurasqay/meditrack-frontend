const doctorList = () => import('./views/doctor-list.vue');
const doctorForm = () => import('./views/doctor-form.vue');
const doctorDetails = () => import('./views/doctor-details.vue');

const organizationRoutes = [
    {path: 'doctors', name: 'organization-doctors', component: doctorList, meta: {title: 'Doctors'}},
    {path: 'doctors/new', name: 'organization-doctor-new', component: doctorForm, meta: {title: 'New Doctor'}},
    {path: 'doctors/:id', name: 'doctor-details', component: doctorDetails, meta: {title: 'Doctor Details'}}
];

export default organizationRoutes;