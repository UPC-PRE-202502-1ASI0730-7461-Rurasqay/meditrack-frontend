import { createApp } from 'vue'
import './style.css'
import App from './app.vue'
import i18n from "./i18n.js";
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';
import {
    Button,
    Card,
    Checkbox,
    Column,
    ConfirmationService,
    ConfirmDialog, DataTable, Dialog,
    DialogService, Drawer, FileUpload, FloatLabel, IconField, InputIcon, InputNumber, InputText, Menu, Password,
    Rating, Row, Select, SelectButton, Tag, Textarea, Toast,
    ToastService, Toolbar, Tooltip, DatePicker, Badge, Message, ProgressSpinner, TabView, TabPanel, Image, Divider, Panel, Listbox
} from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";
import useIAMStore from "./iam/application/iam.store.js";

// noinspection JSCheckFunctionSignatures
const app = createApp(App)
    .use(i18n)
    .use(PrimeVue, { theme: { preset: Material }, ripple: true})
    .use(ConfirmationService)
    .use(DialogService)
    .use(ToastService)
    .component('pv-button', Button)
    .component('pv-card', Card)
    .component('pv-column', Column)
    .component('pv-confirm-dialog', ConfirmDialog)
    .component('pv-checkbox', Checkbox)
    .component('pv-data-table', DataTable)
    .component('pv-dialog', Dialog)
    .component('pv-select', Select)
    .component('pv-select-button', SelectButton)
    .component('pv-file-upload', FileUpload)
    .component('pv-float-label', FloatLabel)
    .component('pv-icon-field', IconField)
    .component('pv-input-icon', InputIcon)
    .component('pv-input-text', InputText)
    .component('pv-input-number', InputNumber)
    .component('pv-menu', Menu)
    .component('pv-rating', Rating)
    .component('pv-row', Row)
    .component('pv-drawer', Drawer)
    .component('pv-tag', Tag)
    .component('pv-textarea', Textarea)
    .component('pv-toolbar', Toolbar)
    .component('pv-toast', Toast)
    .component('pv-password', Password)
    .component('pv-calendar', DatePicker)
    .component('pv-badge', Badge)
    .component('pv-message', Message)
    .component('pv-progress-spinner', ProgressSpinner)
    .component('pv-tab-view', TabView)
    .component('pv-tab-panel', TabPanel)
    .component('pv-image', Image)
    .component('pv-divider', Divider)
    .component('pv-panel', Panel)
    .component('pv-list', Listbox)
    .directive('tooltip', Tooltip)
    .use(router)
    .use(pinia);

// Restore session from localStorage
const iamStore = useIAMStore();
iamStore.restoreSession();

app.mount('#app')
