export class SingUpResource {
    constructor({ id = null, email = null, firstName = null, lastName = null, role = null, token = null, organization = null, adminFirstName = null, adminLastName = null, institutionName = null, institutionType = null, planType = null } = {}) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.token = token;
        this.organization = organization;


        this.adminFirstName = adminFirstName;
        this.adminLastName = adminLastName;
        this.institutionName = institutionName;
        this.institutionType = institutionType;


        this.planType = planType;
    }
}
