export class User {

    /**
     * Creates an instance of User.
      * @param id - User ID
     * @param email - User email
     * @param password - User password
     * @param role - User role
     * @param entityId - Associated entity ID
     */
    constructor({
                    id = null,
                    email = '',
                    password = '',
                    role = 'user',
                    entityId = null
                }) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.role = role;
        this.entityId = entityId;
    }
}