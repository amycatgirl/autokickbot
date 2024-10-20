/**
 * Async artificial delay
 * @param {number} amount - Delay amount
 * @param {boolean} isMS - Is the delay in seconds or not
 * @return {Promise<void>}
 */
const artificialDelay = (amount, isMS = false) =>
  new Promise((res) => {
    setTimeout(() => res(), isMS ? amount : amount * 1000);
  });

export { artificialDelay };
