  /**
   * @param {string} url The URL whose origin is to be returned.
   * @return {string} The origin corresponding to given URL.
   */
  export const getOriginFromUrl = (url: string) => {
    // https://stackoverflow.com/questions/1420881/how-to-extract-base-url-from-a-string-in-javascript
    const pathArray = url.split('/');
    const protocol = pathArray[0];
    const host = pathArray[2];
    return protocol + '//' + host;
  };
