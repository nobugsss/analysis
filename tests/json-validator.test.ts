import { JsonValidator } from "../src/modules/json-validator";
import * as fs from "fs-extra";
import * as path from "path";

describe("JsonValidator", () => {
	const testDir = path.join(__dirname, "test-files");
	const validJsonPath = path.join(testDir, "valid.json");
	const invalidJsonPath = path.join(testDir, "invalid.json");

	beforeAll(async () => {
		// 创建测试文件
		await fs.ensureDir(testDir);

		await fs.writeJson(validJsonPath, {
			name: "test",
			value: 123,
			nested: { key: "value" }
		});

		await fs.writeFile(invalidJsonPath, '{ "name": "test", "value": 123', "utf8");
	});

	afterAll(async () => {
		// 清理测试文件
		await fs.remove(testDir);
	});

	describe("validateFile", () => {
		it("应该验证有效的JSON文件", async () => {
			const result = await JsonValidator.validateFile(validJsonPath);

			expect(result.valid).toBe(true);
			expect(result.filePath).toBe(validJsonPath);
			expect(result.size).toBeGreaterThan(0);
			expect(result.keys).toBe(3);
			expect(result.message).toBe("JSON文件有效");
		});

		it("应该检测无效的JSON文件", async () => {
			const result = await JsonValidator.validateFile(invalidJsonPath);

			expect(result.valid).toBe(false);
			expect(result.filePath).toBe(invalidJsonPath);
			expect(result.error).toBeDefined();
			expect(result.message).toContain("JSON文件无效");
		});

		it("应该处理不存在的文件", async () => {
			const result = await JsonValidator.validateFile("nonexistent.json");

			expect(result.valid).toBe(false);
			expect(result.error).toBeDefined();
		});
	});

	describe("validateFiles", () => {
		it("应该批量验证多个文件", async () => {
			const results = await JsonValidator.validateFiles([validJsonPath, invalidJsonPath]);

			expect(results).toHaveLength(2);
			expect(results[0].valid).toBe(true);
			expect(results[1].valid).toBe(false);
		});
	});

	describe("validateDirectory", () => {
		it("应该验证目录中的所有JSON文件", async () => {
			const results = await JsonValidator.validateDirectory(testDir);

			expect(results).toHaveLength(2);
			expect(results.some((r) => r.valid)).toBe(true);
			expect(results.some((r) => !r.valid)).toBe(true);
		});
	});

	describe("getStats", () => {
		it("应该计算正确的统计信息", () => {
			const results = [
				{ valid: true, filePath: "test1.json" },
				{ valid: true, filePath: "test2.json" },
				{ valid: false, filePath: "test3.json" }
			];

			const stats = JsonValidator.getStats(results);

			expect(stats.total).toBe(3);
			expect(stats.valid).toBe(2);
			expect(stats.invalid).toBe(1);
			expect(stats.validPercentage).toBe("66.67");
		});

		it("应该处理空结果数组", () => {
			const stats = JsonValidator.getStats([]);

			expect(stats.total).toBe(0);
			expect(stats.valid).toBe(0);
			expect(stats.invalid).toBe(0);
			expect(stats.validPercentage).toBe("0");
		});
	});
});
