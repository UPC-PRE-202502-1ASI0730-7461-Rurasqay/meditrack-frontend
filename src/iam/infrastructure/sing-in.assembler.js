import { SingInResource } from './sing-in.resource.js';

export class SingInAssembler {

    /**
     * Convert an API response into a SingInResource object.
     * @param response
     * @return {SingInResource|null}
     */
  static toResourceFromResponse(response) {
      console.log(response);

      if (response.status !== 200) {
          console.error(`${response.status}, ${response.statusText}`);
          return null;
      }
      return new SingInResource(response.data);
  }

}