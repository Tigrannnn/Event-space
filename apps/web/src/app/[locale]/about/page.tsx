import { Metadata } from 'next';
import AboutPageContent from './AboutPageContent';

export const metadata: Metadata = {
	title: 'About Us | Event Space',
	description: 'Learn more about Event Space',
};

export default function AboutPage() {
	return <AboutPageContent />;
}
