export class SignInResource {
    constructor({ id, email , password , token, role }) {
        this.id = id;
        this.email = email;
        this.password = password;
        this.token = token;
        this.role = role || null;
    }
}

