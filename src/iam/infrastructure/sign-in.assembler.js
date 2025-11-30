import { SignInResource } from './sign-in.resource.js';

export class SignInAssembler {

    /**
     * Convert an API response into a SignInResource object.
     * @param response
     * @return {SignInResource|null}
     */
  static toResourceFromResponse(response) {
      console.log(response);

      if (response.status !== 200) {
          console.error(`${response.status}, ${response.statusText}`);
          return null;
      }
      return new SignInResource(response.data);
  }

}