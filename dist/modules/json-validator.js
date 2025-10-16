"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonValidator = void 0;
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:45:23
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:45:33
 * @description: JSON文件验证器
 * @param:
 * @return:
 */
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
/**
 * JSON文件验证器
 */
class JsonValidator {
    /**
     * 验证单个JSON文件
     * @param filePath - 文件路径
     * @returns 验证结果
     */
    static async validateFile(filePath) {
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
        }
        catch (error) {
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
    static async validateFiles(filePaths) {
        const results = [];
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
    static async validateDirectory(dirPath) {
        try {
            const files = await fs.readdir(dirPath);
            const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === ".json").map((file) => path.join(dirPath, file));
            return await this.validateFiles(jsonFiles);
        }
        catch (error) {
            throw new Error(`无法读取目录: ${error instanceof Error ? error.message : "未知错误"}`);
        }
    }
    /**
     * 获取验证统计信息
     * @param results - 验证结果数组
     * @returns 统计信息
     */
    static getStats(results) {
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
exports.JsonValidator = JsonValidator;
//# sourceMappingURL=json-validator.js.map