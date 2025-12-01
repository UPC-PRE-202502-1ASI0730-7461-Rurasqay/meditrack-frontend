import { SignInResource } from './sign-in.resource.js';

export class SignInAssembler {

    /**
     * Convert an API response into a SignInResource object.
     * @param response
     * @return {SignInResource|null}
     */
  static toResourceFromResponse(response) {
      console.log('[SignInAssembler] Response data:', response.data);

      if (response.status !== 200) {
          console.error(`${response.status}, ${response.statusText}`);
          return null;
      }
      
      // Backend returns camelCase: { id, email, role, token }
      const data = response.data || {};
      const resource = new SignInResource({
          id: data.id,
          email: data.email || data.username, // Support both email and username
          password: null, // Not returned from backend
          token: data.token,
          role: data.role || null
      });
      
      console.log('[SignInAssembler] Created resource with role:', resource.role);
      return resource;
  }

}