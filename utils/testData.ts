/** These are public SauceDemo training credentials, not user secrets. */
export const USERS = {
  standard: { username: 'standard_user' },
  locked: { username: 'locked_out_user' },
  problem: { username: 'problem_user' },
  password: 'secret_sauce',
  incorrectPassword: 'wrong_password',
} as const;

export const PRODUCTS = {
  backpack: { slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack' },
  bikeLight: { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light' },
  fleeceJacket: { slug: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket' },
} as const;
