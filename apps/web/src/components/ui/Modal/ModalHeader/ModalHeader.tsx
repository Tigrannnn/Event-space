import ModalCloseButton from '../../Buttons/ModalCloseButton';
import { ModalHeaderProps } from './types';
import { useClassicLook } from '@/components/ui/ClassicLook/ClassicLook';

const MARKET_TITLE = 'in-data-[skin=market]:font-bold in-data-[skin=market]:text-gray-900 in-data-[skin=market]:dark:text-white';

export default function ModalHeader({ title, subtitle, onClose }: ModalHeaderProps) {
	const classic = useClassicLook();

	return (
		<div className="relative mb-4 pr-10 sm:mb-6 sm:pr-12 in-data-[skin=listing]:border-b in-data-[skin=listing]:border-gray-200 in-data-[skin=listing]:pb-3 in-data-[skin=listing]:dark:border-neutral-800">
			<h2 className={`text-primary ${classic ? '' : MARKET_TITLE} mb-2 text-2xl font-black sm:text-3xl in-data-[skin=minimal]:font-semibold in-data-[skin=minimal]:text-gray-900 in-data-[skin=listing]:text-gray-900 in-data-[skin=minimal]:sm:text-2xl in-data-[skin=listing]:text-xl in-data-[skin=listing]:sm:text-xl in-data-[skin=listing]:font-bold in-data-[skin=minimal]:dark:text-white in-data-[skin=listing]:dark:text-white`}>{title}</h2>
			{subtitle && (
				<p className="text-[15px] text-gray-500 sm:text-sm dark:text-gray-400">{subtitle}</p>
			)}
			<ModalCloseButton onClick={onClose} />
		</div>
	);
}
