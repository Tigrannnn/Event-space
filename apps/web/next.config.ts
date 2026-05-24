import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	output: 'standalone',
	transpilePackages: ['@event-space/shared'],
	env: {
		GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
	},
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: 'res.cloudinary.com',
				port: '',
				pathname: '/**',
			},
		],
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	turbopack: {
		resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.mjs', '.json'],
	},
};

export default nextConfig;
