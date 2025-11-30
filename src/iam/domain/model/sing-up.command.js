export class SingUpCommand {

    /**
     * Creates an instance of SingUpCommand.
      * @param email - User email
     * @param password - User password
     * @param role - User role
     * @param adminFirstName - Admin first name
     * @param adminLastName - Admin last name
     * @param institutionName - Institution name
     * @param institutionType - Institution type
     * @param planType - Plan type
     */
  constructor({
    email = '',
    password = '',
    role = '',
    adminFirstName = '',
    adminLastName = '',
    institutionName = '',
    institutionType = null,
    planType = '',
    userFirstName = '',
    userLastName = '',
    payment = null
  } = {}) {
    this.email = email;
    this.password = password;
    this.role = role;
    this.adminFirstName = adminFirstName;
    this.adminLastName = adminLastName;
    this.institutionName = institutionName;
    this.institutionType = institutionType;
    this.planType = planType;

     this.userFirstName = userFirstName;
    this.userLastName = userLastName;


    this.payment = payment;
  }

  setUserData(email, password, role) {
    this.email = email || '';
    this.password = password || '';
    this.role = role || '';
  }

  setAdminData(firstName, lastName) {
    this.adminFirstName = firstName || '';
    this.adminLastName = lastName || '';
  }

  setInstitutionData(name, type) {
    this.institutionName = name || '';
    this.institutionType = type || null;
  }

  setPlanType(planType) {
    this.planType = planType || '';
  }


  setUserNames(firstName, lastName) {
    this.userFirstName = firstName || '';
    this.userLastName = lastName || '';
  }


  setPaymentInfo(payment = null) {
    // expected shape: { provider: 'stripe', receiptId: '...', confirmed: true }
    this.payment = payment;
  }

  clear() {
    this.email = '';
    this.password = '';
    this.role = '';
    this.adminFirstName = '';
    this.adminLastName = '';
    this.institutionName = '';
    this.institutionType = null;
    this.planType = '';
    this.userFirstName = '';
    this.userLastName = '';
    this.payment = null;
  }

  /**
   * Check completeness depending on role.
   * If requirePaymentConfirmation is true and planType is 'premium', payment.confirmed must be true.
   * @param {boolean} requirePaymentConfirmation
   */
  isComplete(requirePaymentConfirmation = false) {
    if (this.role === 'admin') {
      return !!(
        this.email &&
        this.password &&
        this.adminFirstName &&
        this.adminLastName &&
        this.institutionName &&
        this.institutionType
      );
    } else if (this.role === 'relative') {
      if (this.planType === 'premium' && requirePaymentConfirmation) {
        return !!(
          this.email &&
          this.password &&
          this.payment &&
          this.payment.confirmed === true
        );
      }
      return !!(this.email && this.password);
    }
    // default: require at least email & password
    return !!(this.email && this.password);
  }

  validateEmail() {
    if (!this.email) return false;
    // simple RFC-like check (not exhaustive)
    const re = /^\S+@\S+\.\S+$/;
    return re.test(this.email);
  }

  validatePassword() {
    return typeof this.password === 'string' && this.password.length >= 8;
  }

  isValid(requirePaymentConfirmation = false) {
    return this.isComplete(requirePaymentConfirmation) && this.validateEmail() && this.validatePassword();
  }

  toPayload() {
    // Build user object and only include names when present
    const user = {
      email: this.email,
      password: this.password,
      role: this.role
    };
    if (this.userFirstName) user.firstName = this.userFirstName;
    if (this.userLastName) user.lastName = this.userLastName;

    // Admin object: only include if any admin field is present
    const admin = (this.adminFirstName || this.adminLastName) ? {
      firstName: this.adminFirstName,
      lastName: this.adminLastName
    } : undefined;

    // Organization object: only include when name/type present
    const organization = (this.institutionName || this.institutionType) ? {
      name: this.institutionName,
      type: this.institutionType
    } : undefined;


    const payload = { user };

    if (admin) payload.admin = admin;
    if (organization) payload.organization = organization;
    if (this.planType) payload.planType = this.planType;
    if (this.payment) payload.payment = this.payment;

    return payload;
  }

  /**
   * Validate command completeness and return detailed errors.
   * @param {boolean} requirePaymentConfirmation - if true, premium plans must have payment.confirmed === true
   * @returns {{valid: boolean, errors: string[]}}
   */
  validate(requirePaymentConfirmation = false) {
    const errors = [];

    if (!this.email) errors.push('email is required');
    else if (!this.validateEmail()) errors.push('email is invalid');

    if (!this.password) errors.push('password is required');
    else if (!this.validatePassword()) errors.push('password must be at least 8 characters');

    if (!this.role) errors.push('role is required');

    if (this.role === 'admin') {
      if (!this.adminFirstName) errors.push('adminFirstName is required for admin role');
      if (!this.adminLastName) errors.push('adminLastName is required for admin role');
      if (!this.institutionName) errors.push('institutionName is required for admin role');
      if (!this.institutionType) errors.push('institutionType is required for admin role');
    }

    if (this.role === 'relative' && this.planType === 'premium' && requirePaymentConfirmation) {
      if (!this.payment) errors.push('payment is required for premium plan');
      else if (this.payment.confirmed !== true) errors.push('payment must be confirmed for premium plan');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static fromRegistrationFlow(flow = {}) {
    return new SingUpCommand({
      email: flow.email || '',
      password: flow.password || '',
      role: flow.role || '',
      adminFirstName: flow.adminFirstName || flow.admin?.firstName || '',
      adminLastName: flow.adminLastName || flow.admin?.lastName || '',
      institutionName: flow.institutionName || flow.organization?.name || '',
      institutionType: flow.institutionType || flow.organization?.type || null,
      planType: flow.planType || '',
      userFirstName: flow.userFirstName || flow.user?.firstName || '',
      userLastName: flow.userLastName || flow.user?.lastName || '',
      payment: flow.payment || null
    });
  }
}
