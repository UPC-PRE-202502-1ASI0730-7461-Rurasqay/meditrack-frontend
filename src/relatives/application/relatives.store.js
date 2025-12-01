import {RelativesApi} from "../infrastructure/relatives-api.js";
import {defineStore} from "pinia";
import {computed, ref} from "vue";
import {RelativeAssembler} from "../infrastructure/relative.assembler.js";
import useIAMStore from "../../iam/application/iam.store.js";

const USER_EXAMPLE_DATA_1 = {
    "id": 1,
    "email": "valeria@gmail.com",
    "password": "valeria123",
    "role": "relative",
    "entityId": 1
}

const USER_EXAMPLE_DATA_2 = {
    "id": 1,
    "email": "juan@gmail.com",
    "password": "juan123",
    "role": "relative",
    "entityId": 2
}

const relativesApi = new RelativesApi()

export const useRelativesStore = defineStore('relatives', () => {
    const relatives = ref([]);
    const relative = ref(null);
    const errors = ref([]);
    const loading = ref(false);

    async function fetchRelatives() {
        loading.value = true;
        try {
            const response = await relativesApi.getRelatives();
            relatives.value = RelativeAssembler.toEntitiesFromResponse(response);
            return relatives.value;
        } catch (error) {
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function fetchRelativeById(id) {
        loading.value = true;
        try {
            const response = await relativesApi.getRelativeById(id);
            relative.value = RelativeAssembler.toEntityFromResource(response.data);
            return relative.value;
        } catch (error) {
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function fetchRelativeByUserId(userId) {
        loading.value = true;
        try {
            const response = await relativesApi.getRelativeByUserId(userId);
            relative.value = RelativeAssembler.toEntityFromResource(response.data);
            return relative.value;
        } catch (error) {
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function createRelative(relativeData) {
        loading.value = true;
        try {
            const response = await relativesApi.createRelative(relativeData);
            const newRelative = RelativeAssembler.toEntityFromResource(response.data);
            relatives.value.push(newRelative);
            return newRelative;
        } catch (error) {
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function updateRelative(relativeData) {
        loading.value = true;
        try {
            const response = await relativesApi.updateRelative(relativeData);
            const updatedRelative = RelativeAssembler.toEntityFromResource(response.data);
            const index = relatives.value.findIndex(r => r.id === updatedRelative.id);
            if (index !== -1) {
                relatives.value[index] = updatedRelative;
            }
            return updatedRelative;
        } catch (error) {
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    async function deleteRelative(id) {
        loading.value = true;
        try {
            await relativesApi.deleteRelative(id);
            relatives.value = relatives.value.filter(r => r.id !== id);
        } catch (error) {
            errors.value.push(error);
            throw error;
        } finally {
            loading.value = false;
        }
    }

    return {
        relatives,
        relative,
        errors,
        loading,
        fetchRelatives,
        fetchRelativeById,
        fetchRelativeByUserId,
        createRelative,
        updateRelative,
        deleteRelative
    }
})