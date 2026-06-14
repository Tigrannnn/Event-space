import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	transpilePackages: ['@event-space/shared'],
	env: {
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				port: '',
				pathname: '/**',
			},
			{
				protocol: 'https',
				hostname: 'lh3.googleusercontent.com',
				port: '',
				pathname: '/**',
			},
		],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	experimental: {
		allowDevelopmentBuild: true,
	},
	turbopack: {
		resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
	},
};

export default nextConfig;
