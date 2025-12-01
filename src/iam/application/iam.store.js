import { IamApi } from "../infrastructure/iam.api.js";
import {defineStore} from "pinia";
import {UserAssembler} from "../infrastructure/user.assembler.js";
import { ref } from "vue";
import { SignUpCommand } from "../domain/model/sign-up.command.js";
import { useRegistrationFlowStore } from './registration-flow.store.js';

const iamApi = new IamApi();

export const useIAMStore = defineStore('iam', () => {
    const users = ref([]);
    const errors = ref([]);
    const usersLoaded = ref(false);
    const currentUser = ref(null);
    const currentUserLoaded = ref(false);
    const loading = ref(false);
    const token = ref(null);


    const registrationFlow = useRegistrationFlowStore();

    async function fetchUsers() {
        loading.value = true;
        try {
            const response = await iamApi.getUsers();
            users.value = UserAssembler.toEntitiesFromResponse(response);
            usersLoaded.value = true;
            return users.value;
        } catch (error) {
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Sign in via API. Returns SignInResource instance or throws error.
     */
    async function signIn({ email, password }) {
        loading.value = true;
        try {
            const resource = await iamApi.signIn({ email, password });
             if (!resource) {
                throw new Error('Invalid sign in response');
            }

            token.value = resource.token || null;
            
            // Persist token to localStorage
            if (resource.token) {
                localStorage.setItem('token', resource.token);
            }

            // If role is not in the response or is generic 'user', try to determine the actual role
            console.log('[IAMStore.signIn] Initial resource role:', resource.role);
            if ((!resource.role || resource.role === 'user') && resource.id) {
                console.log('[IAMStore.signIn] Role not found or generic, fetching user by id:', resource.id);
                try {
                    const userResponse = await iamApi.getUserById(resource.id);
                    console.log('[IAMStore.signIn] User response:', userResponse);
                    
                    // If the user has a valid role (not 'user' generic), use it
                    if (userResponse && userResponse.role && userResponse.role !== 'user') {
                        resource.role = userResponse.role;
                        console.log('[IAMStore.signIn] Updated resource with role from user:', resource.role);
                    } else {
                        console.warn('[IAMStore.signIn] User response has no valid role, will infer from entity tables');
                        resource.role = 'user'; // Keep as 'user' for now, login component will handle detection
                    }
                } catch (userErr) {
                    console.warn('[IAMStore.signIn] Could not fetch user role:', userErr);
                    resource.role = 'user'; // Default to 'user', login component will handle detection
                }
            }

            console.log('[IAMStore.signIn] Final resource:', resource);
            currentUser.value = resource;
            currentUserLoaded.value = true;
            return resource;
        } catch (err) {
            errors.value.push(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }


    async function signUp(commandOrObj) {
        loading.value = true;
        try {
            let command;
            if (commandOrObj == null) {
                // Use registration flow store to build command if nothing passed
                command = registrationFlow.toCommand();
            } else if (commandOrObj instanceof SignUpCommand) {
                command = commandOrObj;
            } else {
                command = SignUpCommand.fromRegistrationFlow(commandOrObj);
            }

             const { valid, errors: validationErrors } = command.validate(false);
            if (!valid) {
                const e = new Error('Validation failed: ' + validationErrors.join(', '));
                errors.value.push(e);
                throw e;
            }

            const resource = await iamApi.signUp(command);
            if (!resource) {
                throw new Error('Invalid sign up response');
            }

            token.value = resource.token || null;
            
            // Persist token to localStorage
            if (resource.token) {
                localStorage.setItem('token', resource.token);
            }
            
            currentUser.value = resource;
            currentUserLoaded.value = true;

             try {
                if (command.role === 'admin') {
                    registrationFlow.clear();
                } else if (command.role === 'relative') {

                    registrationFlow.clearExceptPlan();
                    if (command.planType) registrationFlow.setPlanType(command.planType);
                     registrationFlow.clearSensitive();
                } else {
                    registrationFlow.clearSensitive();
                }
            } catch (flowErr) {
                console.warn('registrationFlow cleanup failed', flowErr);
            }

            return resource;
        } catch (err) {
            errors.value.push(err);
            throw err;
        } finally {
            loading.value = false;
        }
    }


    function login(email, password) {
        currentUser.value = users.value
            .find((user) => user.email === email && user.password === password) || null;
        if (currentUser.value){
            currentUserLoaded.value = true;
            // no token in this mocked flow
            token.value = null;
            return currentUser.value;
        }
        return null;
    }

    function logout() {
        currentUser.value = null;
        currentUserLoaded.value = false;
        token.value = null;
    }

    function setCurrentUserFromResource(resource) {
        currentUser.value = resource;
        currentUserLoaded.value = !!resource;
        if (resource && resource.token) token.value = resource.token;
    }

    return {
        users,
        errors,
        usersLoaded,
        currentUser,
        currentUserLoaded,
        loading,
        token,
        fetchUsers,
        signIn,
        signUp,
        login,
        logout,
        setCurrentUserFromResource
    }
});

export default useIAMStore;
