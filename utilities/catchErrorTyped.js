/**
 * @async
 * @template T
 * @template {new (message?: string) => Error} E - Error
 *
 * @param {Promise<T>} promise
 * @param {E[]} errorsToCatch
 *
 * @returns {Promise<[undefined, T] | [InstanceType<E>]>}
 */
function catchErrorTyped(promise, errorsToCatch) {
  return promise
    .then((data) => {
      return [undefined, data];
    })
    .catch((error) => {
      if (errorsToCatch === undefined) {
        return [error];
      }

      if (errorsToCatch.some((e) => error instanceof e)) {
        return [error];
      }

      throw error;
    });
}

export { catchErrorTyped };
