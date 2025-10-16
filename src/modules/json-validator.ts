/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:45:23
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:45:33
 * @description: JSON文件验证器
 * @param:
 * @return:
 */
import * as fs from "fs-extra";
import * as path from "path";

/**
 * JSON验证结果接口
 */
export interface JsonValidationResult {
	valid: boolean;
	filePath: string;
	size?: number;
	keys?: number;
	error?: string;
	message: string;
}

/**
 * 验证统计信息接口
 */
export interface ValidationStats {
	total: number;
	valid: number;
	invalid: number;
	validPercentage: string;
}

/**
 * JSON文件验证器
 */
export class JsonValidator {
	/**
	 * 验证单个JSON文件
	 * @param filePath - 文件路径
	 * @returns 验证结果
	 */
	static async validateFile(filePath: string): Promise<JsonValidationResult> {
		try {
			const content = await fs.readFile(filePath, "utf8");
			const parsed = JSON.parse(content);

			return {
				valid: true,
				filePath,
				size: content.length,
				keys: Object.keys(parsed).length,
				message: "JSON文件有效"
			};
		} catch (error) {
			return {
				valid: false,
				filePath,
				error: error instanceof Error ? error.message : "未知错误",
				message: `JSON文件无效: ${error instanceof Error ? error.message : "未知错误"}`
			};
		}
	}

	/**
	 * 批量验证JSON文件
	 * @param filePaths - 文件路径数组
	 * @returns 验证结果数组
	 */
	static async validateFiles(filePaths: string[]): Promise<JsonValidationResult[]> {
		const results: JsonValidationResult[] = [];

		for (const filePath of filePaths) {
			const result = await this.validateFile(filePath);
			results.push(result);
		}

		return results;
	}

	/**
	 * 验证目录中的所有JSON文件
	 * @param dirPath - 目录路径
	 * @returns 验证结果数组
	 */
	static async validateDirectory(dirPath: string): Promise<JsonValidationResult[]> {
		try {
			const files = await fs.readdir(dirPath);
			const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === ".json").map((file) => path.join(dirPath, file));

			return await this.validateFiles(jsonFiles);
		} catch (error) {
			throw new Error(`无法读取目录: ${error instanceof Error ? error.message : "未知错误"}`);
		}
	}

	/**
	 * 获取验证统计信息
	 * @param results - 验证结果数组
	 * @returns 统计信息
	 */
	static getStats(results: JsonValidationResult[]): ValidationStats {
		const total = results.length;
		const valid = results.filter((r) => r.valid).length;
		const invalid = total - valid;

		return {
			total,
			valid,
			invalid,
			validPercentage: total > 0 ? ((valid / total) * 100).toFixed(2) : "0"
		};
	}
}
