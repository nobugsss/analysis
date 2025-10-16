/*
 * @Author: boykaaa
 * @Date: 2025-10-16 13:58:50
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 14:09:29
 * @description:
 * @param:
 * @return:
 */
declare module "opencc-js" {
	export interface Converter {
		(text: string): string;
	}

	export function ConverterFactory(config: string[]): Converter;

	export class ConverterFactory {
		constructor(config: string[]);
	}

	export class Locale {
		static from: {
			cn: string[];
			hk: string[];
			tw: string[];
			twp: string[];
			jp: string[];
		};
		static to: {
			cn: string[];
			hk: string[];
			tw: string[];
			twp: string[];
			jp: string[];
		};
	}

	export class Converter {
		static from(from: string, to: string): Converter;
	}

	export class CustomConverter {
		constructor(config: any);
	}

	export class HTMLConverter {
		constructor(config: any);
	}

	export class Trie {
		constructor(config: any);
	}
}
