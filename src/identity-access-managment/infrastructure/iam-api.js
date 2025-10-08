import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const authEndpointPath = import.meta.env.VITE_USER_ENDPOINT_PATH || '/users';

/**
 * IamApi class to handle IAM-related API operations.
 * This class extends the BaseApi and uses BaseEndpoint for specific endpoint operations.
 */
export default class IamApi extends BaseApi{

    #authEndpointPath

    /**
     * Constructor to initialize the IamApi instance.
     * It sets up the auth endpoint path using the BaseEndpoint class.
     * @constructor
     */
    constructor() {
        super();
        this.#authEndpointPath = new BaseEndpoint(this, authEndpointPath);
    }

    /**
     * Fetch all users from the IAM API.
     * @returns {Promise} A promise that resolves to the list of users.
     */
    getUsers(){
        return this.#authEndpointPath.getAll();
    }

    /**
     * Fetch a user by their ID from the IAM API.
     * @param id - The ID of the user to fetch.
     * @returns {Promise<User[]>} A promise that resolves to the user data.
     */
    getUserById(id){
        return this.#authEndpointPath.getById(id);
    }

    /**
     * Create a new user in the IAM system.
     * @param user - The user object containing user details.
     * @returns {User} A promise that resolves to the created user data.
     */
    createUser(user) {
        return this.#authEndpointPath.create(user);
    }

    /**
     * Update an existing user's details.
     * @param id - The ID of the user to update.
     * @param user - The user object containing updated user details.
     * @returns {User} A promise that resolves to the updated user data.
     */
    updateUser(id, user){
        return this.#authEndpointPath.update(id, user);
    }

    /**
     * Delete a user from the IAM system.
     * @param id - The ID of the user to delete.
     * @returns {Promise} A promise that resolves when the user is deleted.
     */
    deleteUser(id){
        return this.#authEndpointPath.delete(id);
    }

}