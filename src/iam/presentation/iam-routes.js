// Auth routes for the IAM section (mounted under /auth)
const authLayout = () => import('./views/iam-layout.vue');
const login = () => import('./views/login.vue');
const userTypeSelection = () => import('./views/user-type-selection.vue');
const signup = () => import('./views/signup.vue');
const subscriptionSelection = () => import('./views/subscription-selection.vue');
const billingInformation = () => import('./views/billing-information.vue');
const institutionDetails = () => import('./views/institution-details.vue');
const seniorCitizenRegistration = () => import('./views/senior-citizen-registration.vue');

export const authRoutes = [
  {
    path: '/auth',
    component: authLayout,
    children: [
      { path: 'login', name: 'login', component: login, meta: { title: 'Login' } },
      { path: 'user-type-selection', name: 'user-type-selection', component: userTypeSelection, meta: { title: 'Select User Type' } },
      { path: 'register', name: 'register', component: signup, meta: { title: 'Register' } },
      { path: 'subscription-selection', name: 'subscription-selection', component: subscriptionSelection, meta: { title: 'Select Subscription' } },
      { path: 'billing-information', name: 'billing-information', component: billingInformation, meta: { title: 'Billing Information' } },
      { path: 'institution-details', name: 'institution-details', component: institutionDetails, meta: { title: 'Institution Details' } },
      { path: 'senior-citizen-registration', name: 'senior-citizen-registration', component: seniorCitizenRegistration, meta: { title: 'Register Senior Citizen' } },
      { path: '', redirect: 'login' }
    ]
  }
];

export default authRoutes;
