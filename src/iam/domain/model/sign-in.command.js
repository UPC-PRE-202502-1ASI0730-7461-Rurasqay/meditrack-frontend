export class SignInCommand {
    /**
     * Creates an instance of SignInCommand.
     * @param email - User email
     * @param password - User password
     */
  constructor({ email, password }) {
    this.email = email;
    this.password = password;
  }
}