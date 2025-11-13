// Layout
const organizationLayout = () => import('./views/organization-layout.vue');

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
const seniorCitizenView = () => import('./views/senior-citizen-view.vue');
const seniorCitizenDetails = () => import('./views/senior-citizen-details.vue');
const seniorCitizenAlertList = () => import('./views/senior-citizen-alert-list.vue');
const seniorCitizenStatistics = () => import('./views/senior-citizen-statistics.vue');

// Support view
const support = () => import('./views/support.vue');

const organizationRoutes = [
    {
        path: ':organizationId/:userRole/:userId',
        component: organizationLayout,
        children: [
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
            {
                path: 'senior-citizens/:id',
                component: seniorCitizenView,
                redirect: { name: 'senior-citizen-details-tab' },
                children: [
                    {path: 'details', name: 'senior-citizen-details-tab', component: seniorCitizenDetails, meta: {title: 'Senior Citizen Details'}},
                    {path: 'alerts', name: 'senior-citizen-alerts', component: seniorCitizenAlertList, meta: {title: 'Senior Citizen Alerts'}},
                    {path: 'statistics', name: 'senior-citizen-statistics', component: seniorCitizenStatistics, meta: {title: 'Senior Citizen Statistics'}}
                ]
            },
            
            // Support route
            {path: 'support', name: 'support', component: support, meta: {title: 'Support'}}
        ]
    }
];

export default organizationRoutes;