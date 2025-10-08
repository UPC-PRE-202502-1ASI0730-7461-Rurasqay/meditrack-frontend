/**
 * User Entity
 * @class User
 */
export class User {
    /**
     * Creates an instance of User.
     * @param id - User ID
     * @param email - User email
     * @param password - User password
     * @param role - User role Valid values('relative', 'caregiver', 'organization')
     * @param entityId - Associated entity ID (e.g., relativeId, caregiverId, organizationId)
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