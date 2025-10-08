export class Caregiver {
    constructor({
                    id = null,
                    fullName = "",
                    organizationId = null
                }) {
        this.id = id;
        this.fullName = fullName;
        this.organizationId = organizationId;
    }
}