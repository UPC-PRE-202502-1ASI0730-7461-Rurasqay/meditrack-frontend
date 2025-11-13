import IamApi from "../infrastructure/iam-api.js";
import {defineStore} from "pinia";
import {UserAssembler} from "../infrastructure/user.assembler.js";
import {ref} from "vue";

const iamApi = new IamApi();

export const useIAMStore = defineStore('iam', () => {
    const users = ref([]);
    const errors = ref([]);
    const usersLoaded = ref(false);
    const currentUser = ref(null);
    const currentUserLoaded = ref(false);

    function fetchUsers() {
        return iamApi.getUsers().then(response => {
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function login(email, password) {
        currentUser.value = users.value
            .find((user) => user.email === email && user.password === password);
        if (currentUser.value){
            currentUserLoaded.value = true;
            return currentUser.value
        }
        return null;
    }

    function logout() {
        currentUser.value = null;
        currentUserLoaded.value = false;
    }

    return {
        currentUser,
        currentUserLoaded,
        usersLoaded,
        errors,
        fetchUsers,
        login,
        logout,
    }
});

export default useIAMStore;