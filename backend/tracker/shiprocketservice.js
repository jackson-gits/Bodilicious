let cachedToken = null;
let tokenExpiry = null;

export const getShiprocketToken = async () => {
  if (
    cachedToken &&
    tokenExpiry &&
    tokenExpiry > Date.now()
  ) {
    return cachedToken;
  }

  const response = await fetch(
    "https://apiv2.shiprocket.in/v1/external/auth/login",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: process.env.SHIPROCKET_EMAIL,
        password: process.env.SHIPROCKET_PASSWORD,
      }),
    }
  );

  if (!response.ok) {
    throw new Error("Shiprocket authentication failed");
  }

  const data = await response.json();

  cachedToken = data.token;
  tokenExpiry = Date.now() + 230 * 60 * 1000; // 230 mins safe buffer

  return cachedToken;
};