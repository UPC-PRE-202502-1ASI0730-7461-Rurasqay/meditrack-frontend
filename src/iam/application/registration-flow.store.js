import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { SignUpCommand } from '../domain/model/sign-up.command.js';

export const useRegistrationFlowStore = defineStore('registrationFlow', () => {
  const email = ref('');
  const password = ref('');
  const role = ref('');

  const adminFirstName = ref('');
  const adminLastName = ref('');

  const institutionName = ref('');
  const institutionType = ref(null); // 'clinic' | 'resident' | null

  const planType = ref('');

  // Optional user names (for relatives)
  const userFirstName = ref('');
  const userLastName = ref('');

  // Optional payment info stored here only when payment flow completes (avoid storing sensitive info)
  const payment = ref(null);

  function setUserData(e, p, r) {
    email.value = e || '';
    password.value = p || '';
    role.value = r || '';
  }

  function setAdminData(firstName, lastName) {
    adminFirstName.value = firstName || '';
    adminLastName.value = lastName || '';
  }

  function setInstitutionData(name, type) {
    institutionName.value = name || '';
    institutionType.value = type || null;
  }

  function setPlanType(pt) {
    planType.value = pt || '';
  }

  function setUserNames(firstName, lastName) {
    userFirstName.value = firstName || '';
    userLastName.value = lastName || '';
  }

  function setPaymentInfo(p) {
    // expected shape: { provider, receiptId, confirmed }
    payment.value = p || null;
  }

  function clear() {
    email.value = '';
    password.value = '';
    role.value = '';
    adminFirstName.value = '';
    adminLastName.value = '';
    institutionName.value = '';
    institutionType.value = null;
    planType.value = '';
    userFirstName.value = '';
    userLastName.value = '';
    payment.value = null;
  }

  function clearSensitive() {
    // Clears only sensitive fields (password, payment)
    password.value = '';
    payment.value = null;
  }

  function clearExceptPlan() {
    const keptPlan = planType.value;
    clear();
    planType.value = keptPlan;
  }

  function toPlainObject() {
    return {
      email: email.value,
      password: password.value,
      role: role.value,
      adminFirstName: adminFirstName.value,
      adminLastName: adminLastName.value,
      institutionName: institutionName.value,
      institutionType: institutionType.value,
      planType: planType.value,
      userFirstName: userFirstName.value,
      userLastName: userLastName.value,
      payment: payment.value
    };
  }

  function toCommand() {
    // Returns a SingUpCommand built from the current flow
    return SingUpCommand.fromRegistrationFlow(toPlainObject());
  }

  function isComplete(requirePaymentConfirmation = false) {
    return toCommand().isComplete(requirePaymentConfirmation);
  }

  const hasPlan = computed(() => !!planType.value);

  return {
    email,
    password,
    role,
    adminFirstName,
    adminLastName,
    institutionName,
    institutionType,
    planType,
    userFirstName,
    userLastName,
    payment,

    // setters
    setUserData,
    setAdminData,
    setInstitutionData,
    setPlanType,
    setUserNames,
    setPaymentInfo,

    // helpers
    clear,
    clearSensitive,
    clearExceptPlan,
    toPlainObject,
    toCommand,
    isComplete,

    // computed
    hasPlan
  };
});

export default useRegistrationFlowStore;
