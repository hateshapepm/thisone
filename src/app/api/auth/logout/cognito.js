export default async function handler(req, res) {
  const returnTo = encodeURI(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/auth/callback/cognito`);
  const logoutTo = encodeURI(`${process.env.NEXT_PUBLIC_AUTH_URL}/login`);
  res.redirect(
    `https://${process.env.NEXT_PUBLIC_COGNITO_DOMAIN}/logout?response_type=code&client_id=${process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID}&redirect_uri=${returnTo}&logout_uri=${logoutTo}`
  );
}
