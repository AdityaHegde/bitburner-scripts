/** @type {import('./$types').PageLoad} */
export function load({ params }) {
  return { name: params.name };
}
