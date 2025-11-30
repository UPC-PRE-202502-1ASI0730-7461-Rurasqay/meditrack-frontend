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
    const relative = ref(null);
    const errors = ref([]);

    function fetchRelativeData(){
        const iamStore = useIAMStore()
        const entityId = iamStore.currentUser.entityId;
        relativesApi.getRelativeById(entityId)
            .then(response => {
                relative.value = RelativeAssembler.toEntityFromResource(response.data);
            })
    }

    return {
        relative,
        errors,
        fetchRelativeData,
    }
})