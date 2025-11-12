// Doctor views
const doctorList = () => import('./views/doctor-list.vue');
const doctorForm = () => import('./views/doctor-form.vue');
const doctorDetails = () => import('./views/doctor-details.vue');

// Caregiver views
const caregiverList = () => import('./views/caregiver-list.vue');
const caregiverForm = () => import('./views/caregiver-form.vue');
const caregiverDetails = () => import('./views/caregiver-details.vue');

// Senior Citizen views
const seniorCitizenList = () => import('./views/senior-citizen-list.vue');
const seniorCitizenForm = () => import('./views/senior-citizen-form.vue');

// Support view
const support = () => import('./views/support.vue');

const organizationRoutes = [
    // Doctor routes
    {path: 'doctors', name: 'organization-doctors', component: doctorList, meta: {title: 'Doctors'}},
    {path: 'doctors/new', name: 'organization-doctor-new', component: doctorForm, meta: {title: 'New Doctor'}},
    {path: 'doctors/:id/edit', name: 'doctor-edit', component: doctorForm, meta: {title: 'Edit Doctor'}},
    {path: 'doctors/:id', name: 'doctor-details', component: doctorDetails, meta: {title: 'Doctor Details'}},
    
    // Caregiver routes
    {path: 'caregivers', name: 'caregiver-list', component: caregiverList, meta: {title: 'Caregivers'}},
    {path: 'caregivers/new', name: 'caregiver-new', component: caregiverForm, meta: {title: 'New Caregiver'}},
    {path: 'caregivers/:id/edit', name: 'caregiver-edit', component: caregiverForm, meta: {title: 'Edit Caregiver'}},
    {path: 'caregivers/:id', name: 'caregiver-details', component: caregiverDetails, meta: {title: 'Caregiver Details'}},
    
    // Senior Citizen routes
    {path: 'senior-citizens', name: 'senior-citizen-list', component: seniorCitizenList, meta: {title: 'Senior Citizens'}},
    {path: 'senior-citizens/new', name: 'senior-citizen-new', component: seniorCitizenForm, meta: {title: 'New Senior Citizen'}},
    {path: 'senior-citizens/:id/edit', name: 'senior-citizen-edit', component: seniorCitizenForm, meta: {title: 'Edit Senior Citizen'}},
    {path: 'senior-citizens/:id', name: 'senior-citizen-details', component: seniorCitizenList, meta: {title: 'Senior Citizen Details'}},
    
    // Support route
    {path: 'support', name: 'support', component: support, meta: {title: 'Support'}}
];

export default organizationRoutes;