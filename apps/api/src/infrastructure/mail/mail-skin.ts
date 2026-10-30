import { DEFAULT_BRAND_SKIN, type BrandSkin } from '@event-space/shared';
import { escapeHtml } from './mail-strings';

/**
 * How a letter looks for each of the site skins. The texts and the layout of the twelve letters
 * are shared; a skin only changes the frame around them: how round the card is, whether it has
 * an outline, what the headings are set in, how the header sits and what the buttons look like.
 *
 * Mail clients are far more limited than a browser. Rounded corners are dropped by Outlook and
 * web fonts do not load, so every value here has to read well without them as well.
 */
interface MailSkin {
	pageBg: string;
	cardRadius: string;
	cardPadding: string;
	cardBorder: string;
	buttonRadius: string;
	codeRadius: string;
	logoRadius: string;
	headingFont: string;
	headingWeight: string;
	titleSpacing: string;
	headerAlign: 'center' | 'left';
	/** A strip of the brand colour across the top of the letter. */
	topBand: boolean;
	/** `null` keeps the brand's primary colour for headings. */
	titleColor: string | null;
}

const SYSTEM_FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const SERIF_FONT = "Georgia, 'Times New Roman', Times, serif";

const CLASSIC_TITLE_COLOR = '#1b4c00';

const MAIL_SKINS: Record<BrandSkin, MailSkin> = {
	classic: {
		pageBg: '#F9FAFB',
		cardRadius: '40px',
		cardPadding: '40px',
		cardBorder: 'none',
		buttonRadius: '999px',
		codeRadius: '16px',
		logoRadius: '36px',
		headingFont: SYSTEM_FONT,
		headingWeight: '900',
		titleSpacing: '-1px',
		headerAlign: 'center',
		topBand: false,
		titleColor: CLASSIC_TITLE_COLOR,
	},
	minimal: {
		pageBg: '#ffffff',
		cardRadius: '16px',
		cardPadding: '32px',
		cardBorder: '1px solid #e5e7eb',
		buttonRadius: '999px',
		codeRadius: '12px',
		logoRadius: '36px',
		headingFont: SYSTEM_FONT,
		headingWeight: '600',
		titleSpacing: '-0.5px',
		headerAlign: 'center',
		topBand: false,
		titleColor: '#111827',
	},
	listing: {
		pageBg: '#f1f5f9',
		cardRadius: '6px',
		cardPadding: '32px',
		cardBorder: '1px solid #cbd5e1',
		buttonRadius: '6px',
		codeRadius: '6px',
		logoRadius: '6px',
		headingFont: SYSTEM_FONT,
		headingWeight: '700',
		titleSpacing: '0px',
		headerAlign: 'left',
		topBand: true,
		titleColor: '#0f172a',
	},
	soft: {
		pageBg: '#faf7f2',
		cardRadius: '32px',
		cardPadding: '40px',
		cardBorder: 'none',
		buttonRadius: '999px',
		codeRadius: '20px',
		logoRadius: '36px',
		headingFont: SERIF_FONT,
		headingWeight: '700',
		titleSpacing: '0px',
		headerAlign: 'center',
		topBand: false,
		titleColor: null,
	},
	market: {
		pageBg: '#f3f4f6',
		cardRadius: '12px',
		cardPadding: '32px',
		cardBorder: '1px solid #e5e7eb',
		buttonRadius: '12px',
		codeRadius: '12px',
		logoRadius: '12px',
		headingFont: SYSTEM_FONT,
		headingWeight: '800',
		titleSpacing: '-0.5px',
		headerAlign: 'left',
		topBand: false,
		titleColor: null,
	},
	drawer: {
		pageBg: '#f5f5f4',
		cardRadius: '28px',
		cardPadding: '36px',
		cardBorder: '1px solid #e7e5e4',
		buttonRadius: '999px',
		codeRadius: '18px',
		logoRadius: '36px',
		headingFont: SYSTEM_FONT,
		headingWeight: '700',
		titleSpacing: '-0.5px',
		headerAlign: 'center',
		topBand: false,
		titleColor: '#111827',
	},
};

export function resolveMailSkin(skin: BrandSkin | undefined): BrandSkin {
	const name = skin ?? DEFAULT_BRAND_SKIN;
	return name in MAIL_SKINS ? name : 'classic';
}

export function mailSkinTokens(skin: BrandSkin): MailSkin {
	return MAIL_SKINS[skin];
}

/** The placeholders the templates take from a skin; a letter rendered with none gets classic. */
export function mailSkinVariables(skin: BrandSkin, colorPrimary: string): Record<string, string> {
	const look = MAIL_SKINS[skin];

	return {
		PAGE_BG: look.pageBg,
		CARD_RADIUS: look.cardRadius,
		CARD_PADDING: look.cardPadding,
		CARD_BORDER: look.cardBorder,
		BUTTON_RADIUS: look.buttonRadius,
		CODE_RADIUS: look.codeRadius,
		HEADING_FONT: look.headingFont,
		HEADING_WEIGHT: look.headingWeight,
		TITLE_SPACING: look.titleSpacing,
		HEADER_ALIGN: look.headerAlign,
		TITLE_COLOR: look.titleColor ?? colorPrimary,
		TOP_BAND: look.topBand
			? `<mj-section background-color="${escapeHtml(colorPrimary)}" padding="0px">` +
				'<mj-column><mj-spacer height="6px" /></mj-column></mj-section>'
			: '',
	};
}

export const CLASSIC_MAIL_VARIABLES = mailSkinVariables('classic', CLASSIC_TITLE_COLOR);
