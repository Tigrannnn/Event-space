import ModalCloseButton from '../../Buttons/ModalCloseButton';
import { ModalHeaderProps } from './types';

export default function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
	return (
		<div className="relative mb-4 pr-10 sm:mb-6 sm:pr-12">
			<h2 className="text-primary mb-2 text-2xl font-black sm:text-3xl">{title}</h2>
			{subtitle && (
				<p className="text-[15px] text-gray-500 sm:text-sm dark:text-gray-400">{subtitle}</p>
			)}
			<ModalCloseButton onClick={onClose} />
		</div>
	);
}
