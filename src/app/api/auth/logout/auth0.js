export default async function handler(req, res) {
  const returnTo = encodeURI(`${process.env.NEXT_PUBLIC_AUTH_URL}/login`);
  res.redirect(
    `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/v2/logout?client_id=${process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID}&returnTo=${returnTo}`
  );
}
