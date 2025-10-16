/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:50:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 13:56:12
 * @description: 简繁中文转换器
 * @param:
 * @return:
 */
import * as fs from "fs-extra";
import * as path from "path";
import * as glob from "glob";
import { ConverterFactory, Locale } from "opencc-js";

/**
 * 转换模式枚举
 */
export enum ConvertMode {
	S2T = "s2t", // 简体转繁体
	T2S = "t2s", // 繁体转简体
	S2TW = "s2tw", // 简体转台湾繁体
	S2HK = "s2hk", // 简体转香港繁体
	S2TWP = "s2twp", // 简体转台湾繁体(短语)
	T2TW = "t2tw", // 繁体转台湾繁体
	T2HK = "t2hk", // 繁体转香港繁体
	T2JP = "t2jp", // 繁体转日文汉字
	JP2T = "jp2t" // 日文汉字转繁体
}

/**
 * 文件转换结果接口
 */
export interface FileConvertResult {
	success: boolean;
	inputPath: string;
	outputPath: string;
	size?: number;
	error?: string;
	message: string;
}

/**
 * 转换统计信息接口
 */
export interface ConvertStats {
	total: number;
	success: number;
	failed: number;
	successPercentage: string;
}

/**
 * 简繁中文转换器
 */
export class ChineseConverter {
	private static readonly SUPPORTED_EXTENSIONS = [".txt", ".md", ".json", ".js", ".ts", ".html", ".css", ".xml"];

	/**
	 * 转换文本内容
	 * @param text - 要转换的文本
	 * @param mode - 转换模式
	 * @returns 转换后的文本
	 */
	static convertText(text: string, mode: ConvertMode): string {
		try {
			// 根据模式选择对应的Locale配置
			let config: string[];
			switch (mode) {
				case ConvertMode.S2T:
					config = Locale.from.cn;
					break;
				case ConvertMode.T2S:
					config = Locale.to.cn;
					break;
				case ConvertMode.S2TW:
					config = Locale.from.tw;
					break;
				case ConvertMode.S2HK:
					config = Locale.from.hk;
					break;
				case ConvertMode.S2TWP:
					config = Locale.from.twp;
					break;
				case ConvertMode.T2TW:
					config = Locale.to.tw;
					break;
				case ConvertMode.T2HK:
					config = Locale.to.hk;
					break;
				case ConvertMode.T2JP:
					config = Locale.to.jp;
					break;
				case ConvertMode.JP2T:
					config = Locale.from.jp;
					break;
				default:
					config = Locale.from.cn;
			}

			// 创建OpenCC转换器实例
			const converter = ConverterFactory(config);
			// 执行转换
			return converter(text);
		} catch (error) {
			console.warn(`OpenCC转换失败，使用备用方案: ${error instanceof Error ? error.message : "未知错误"}`);

			// 备用方案：使用简单的映射表
			return this.fallbackConvert(text, mode);
		}
	}

	/**
	 * 备用转换方案（当OpenCC不可用时）
	 * @param text - 要转换的文本
	 * @param mode - 转换模式
	 * @returns 转换后的文本
	 */
	private static fallbackConvert(text: string, mode: ConvertMode): string {
		// 简化的映射表作为备用方案
		const simplifiedToTraditional: Record<string, string> = {
			简体: "簡體",
			繁体: "繁體",
			转换: "轉換",
			文件: "文件",
			目录: "目錄",
			系统: "系統",
			网络: "網絡",
			计算机: "計算機",
			程序: "程序",
			软件: "軟件",
			硬件: "硬件",
			数据: "數據",
			信息: "信息",
			用户: "用戶",
			登录: "登錄",
			注册: "註冊",
			设置: "設置",
			配置: "配置",
			管理: "管理",
			操作: "操作",
			功能: "功能",
			界面: "界面",
			菜单: "菜單",
			按钮: "按鈕",
			输入: "輸入",
			输出: "輸出",
			保存: "保存",
			加载: "加載",
			更新: "更新",
			删除: "刪除",
			创建: "創建",
			编辑: "編輯",
			查看: "查看",
			搜索: "搜索",
			替换: "替換",
			复制: "複製",
			粘贴: "粘貼",
			撤销: "撤銷",
			重做: "重做",
			帮助: "幫助",
			关于: "關於",
			版本: "版本",
			语言: "語言",
			中文: "中文",
			英文: "英文",
			日文: "日文",
			韩文: "韓文"
		};

		const traditionalToSimplified: Record<string, string> = Object.fromEntries(Object.entries(simplifiedToTraditional).map(([key, value]) => [value, key]));

		let result = text;

		// 根据模式选择映射表
		let mapping: Record<string, string>;
		if (mode === ConvertMode.S2T || mode === ConvertMode.S2TW || mode === ConvertMode.S2HK || mode === ConvertMode.S2TWP) {
			mapping = simplifiedToTraditional;
		} else {
			mapping = traditionalToSimplified;
		}

		for (const [from, to] of Object.entries(mapping)) {
			result = result.replace(new RegExp(from, "g"), to);
		}

		return result;
	}

	/**
	 * 转换单个文件
	 * @param inputPath - 输入文件路径
	 * @param outputPath - 输出文件路径
	 * @param mode - 转换模式
	 * @returns 转换结果
	 */
	static async convertFile(inputPath: string, outputPath: string, mode: ConvertMode): Promise<FileConvertResult> {
		try {
			const content = await fs.readFile(inputPath, "utf8");
			const convertedContent = this.convertText(content, mode);

			// 确保输出目录存在
			await fs.ensureDir(path.dirname(outputPath));
			await fs.writeFile(outputPath, convertedContent, "utf8");

			return {
				success: true,
				inputPath,
				outputPath,
				size: convertedContent.length,
				message: "文件转换成功"
			};
		} catch (error) {
			return {
				success: false,
				inputPath,
				outputPath,
				error: error instanceof Error ? error.message : "未知错误",
				message: `文件转换失败: ${error instanceof Error ? error.message : "未知错误"}`
			};
		}
	}

	/**
	 * 转换目录中的所有文件
	 * @param inputDir - 输入目录
	 * @param outputDir - 输出目录
	 * @param mode - 转换模式
	 * @returns 转换结果数组
	 */
	static async convertDirectory(inputDir: string, outputDir: string, mode: ConvertMode): Promise<FileConvertResult[]> {
		const results: FileConvertResult[] = [];

		// 获取所有支持的文件
		const pattern = path.join(inputDir, "**", "*");
		const files = glob.sync(pattern, { nodir: true });

		const supportedFiles = files.filter((file) => {
			const ext = path.extname(file).toLowerCase();
			return this.SUPPORTED_EXTENSIONS.includes(ext);
		});

		for (const file of supportedFiles) {
			const relativePath = path.relative(inputDir, file);
			const outputPath = path.join(outputDir, relativePath);

			const result = await this.convertFile(file, outputPath, mode);
			results.push(result);
		}

		return results;
	}

	/**
	 * 获取转换统计信息
	 * @param results - 转换结果数组
	 * @returns 统计信息
	 */
	static getStats(results: FileConvertResult[]): ConvertStats {
		const total = results.length;
		const success = results.filter((r) => r.success).length;
		const failed = total - success;

		return {
			total,
			success,
			failed,
			successPercentage: total > 0 ? ((success / total) * 100).toFixed(2) : "0"
		};
	}
}
