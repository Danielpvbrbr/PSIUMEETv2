import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // O "*" libera qualquer subdomínio do ngrok enquanto você estiver testando!
  allowedDevOrigins: ['*.ngrok-free.app', 'localhost:3000'],
};

export default nextConfig;