import type { NextConfig } from 'next';

const API_URL = process.env.API_URL || 'http://localhost:5000';

const nextConfig: NextConfig = {
	output: 'standalone',
	transpilePackages: ['@event-space/shared'],
	env: {
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
		STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
		PUBLIC_API_URL: process.env.PUBLIC_API_URL,
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
	...(process.env.NODE_ENV !== 'production' && {
		experimental: {
			allowDevelopmentBuild: true,
		},
	}),
	turbopack: {
		resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
	},
	async rewrites() {
		return [
			{
				source: '/api/:path*',
				destination: `${API_URL}/:path*`,
			},
		];
	},
};

export default nextConfig;
