import { SignUpResource } from './sign-up.resource.js';

export class SignUpAssembler {
  /**
   * Convert an API response (Axios-like) into a SignUpResource instance.
   * Returns null on non-200 responses.
   * @param response {object}
   * @returns {SignUpResource|null}
   */
  static toResourceFromResponse(response) {
      console.log('SignUpAssembler.toResourceFromResponse ->', response);

      if (!response || typeof response !== 'object') {
          console.error('Invalid response provided to SignUpAssembler');
          return null;
      }

      if (response.status !== 200 && response.status !== 201) {
          console.error(`${response.status} - ${response.statusText}`);
          return null;
      }

      // Response payload may be directly in response.data or nested under a key (e.g., user, data)
      const payload = (response.data && (response.data.user || response.data.signUp || response.data)) || response.data || {};

      // Backend returns camelCase
      const resourceData = {
          id: payload.id ?? payload.userId ?? payload._id ?? null,
          email: payload.username ?? payload.email ?? payload.user?.email ?? null,
          firstName: payload.firstName ?? payload.name ?? payload.user?.firstName ?? null,
          lastName: payload.lastName ?? payload.user?.lastName ?? null,
          role: payload.role ?? payload.user?.role ?? null,
          token: payload.token ?? payload.accessToken ?? payload.authToken ?? null,
          organization: payload.organization ?? payload.org ?? payload.organizationId ?? null,


          adminFirstName: payload.adminFirstName ?? payload.admin?.firstName ?? payload.user?.adminFirstName ?? null,
          adminLastName: payload.adminLastName ?? payload.admin?.lastName ?? payload.user?.adminLastName ?? null,
          institutionName: payload.institutionName ?? payload.institution?.name ?? payload.organization?.name ?? null,
          institutionType: payload.institutionType ?? payload.institution?.type ?? payload.organization?.type ?? null,


          planType: payload.PlanType ?? payload.planType ?? payload.plan?.type ?? payload.plan ?? null,
      };

      return new SignUpResource(resourceData);
  }

  /**
   * Convert a resource object into a plain JS object suitable for API calls or domain usage.
   * @param resource {SignUpResource|object}
   * @returns {object}
   */
  static toResourceObject(resource) {
      if (!resource) return {};
      return {
          id: resource.id ?? null,
          email: resource.email ?? null,
          firstName: resource.firstName ?? null,
          lastName: resource.lastName ?? null,
          role: resource.role ?? null,
          token: resource.token ?? null,
          organization: resource.organization ?? null,

          adminFirstName: resource.adminFirstName ?? null,
          adminLastName: resource.adminLastName ?? null,
          institutionName: resource.institutionName ?? null,
          institutionType: resource.institutionType ?? null,

          planType: resource.planType ?? null,
      };
  }
}
