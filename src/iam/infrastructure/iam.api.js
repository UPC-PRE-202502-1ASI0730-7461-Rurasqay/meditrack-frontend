import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";
import { SignInAssembler } from './sign-in.assembler.js';
import { SignUpAssembler } from './sign-up.assembler.js';
import { UserAssembler } from './user.assembler.js';

const signInEndpointPath = import.meta.env.VITE_SIGNIN_ENDPOINT_PATH || '/authentication/sign-in';
const signUpEndpointPath = import.meta.env.VITE_SIGNUP_ENDPOINT_PATH || '/authentication/sign-up';
const usersEndpointPath = import.meta.env.VITE_USERS_ENDPOINT_PATH || '/users';

/**
 * API class for IAM (Identity and Access Management) operations.
 * Extends BaseApi to handle sign-in, sign-up, and user retrieval.
 */
export class IamApi extends BaseApi {
    #signInEndpoint;
    #signUpEndpoint;
    #usersEndpoint;

    /**
     * Creates an instance of IamApi with configured endpoints.
     */
    constructor() {
        super();
        this.#signInEndpoint = new BaseEndpoint(this, signInEndpointPath);
        this.#signUpEndpoint = new BaseEndpoint(this, signUpEndpointPath);
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
    }

    /**
     * Signs in a user.
     * @param {object} signInRequest - The sign-in request data.
     * @returns {Promise<SingInResource|null>} A promise that resolves with the SingInResource or null on error.
     */
    async signIn(signInRequest) {
        try {
            const response = await this.#signInEndpoint.create(signInRequest);
            return SignInAssembler.toResourceFromResponse(response);
        } catch (err) {
            console.error('IamApi.signIn error ->', err);
            throw err;
        }
    }

    /**
     * Signs up a new user.
     * @param {object} signUpRequest - The sign-up request data.
     * @returns {Promise<SingUpResource|null>} A promise that resolves with the SingUpResource or null on error.
     */
    async signUp(signUpRequest) {
        try {
            const response = await this.#signUpEndpoint.create(signUpRequest);
            return SignUpAssembler.toResourceFromResponse(response);
        } catch (err) {
            console.error('IamApi.signUp error ->', err);
            throw err;
        }
    }

    /**
     * Retrieves all users.
     * @returns {Promise<User[]>} A promise that resolves with an array of User entities.
     */
    async getUsers() {
        try {
            const response = await this.#usersEndpoint.getAll();
            return UserAssembler.toEntitiesFromResponse(response);
        } catch (err) {
            console.error('IamApi.getUsers error ->', err);
            throw err;
        }
    }

}