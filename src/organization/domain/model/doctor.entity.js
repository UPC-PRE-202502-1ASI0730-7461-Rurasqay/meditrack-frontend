export class Doctor{
    constructor({
                    id = null,
                    fullName = "",
                    specialty: specialty = "",
                    organizationId = null,
                }){
        this.id = id;
        this.fullName = fullName;
        this.specialty = specialty;
        this.organizationId = organizationId;
    }
}