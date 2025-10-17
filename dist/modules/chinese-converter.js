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
exports.ChineseConverter = exports.ConvertMode = void 0;
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 11:50:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 13:56:12
 * @description: 简繁中文转换器
 * @param:
 * @return:
 */
const fs = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const glob = __importStar(require("glob"));
const opencc_js_1 = require("opencc-js");
/**
 * 转换模式常量
 */
exports.ConvertMode = {
    S2T: "s2t", // 简体转繁体
    T2S: "t2s", // 繁体转简体
    S2TW: "s2tw", // 简体转台湾繁体
    S2HK: "s2hk", // 简体转香港繁体
    S2TWP: "s2twp", // 简体转台湾繁体(短语)
    T2TW: "t2tw", // 繁体转台湾繁体
    T2HK: "t2hk", // 繁体转香港繁体
    T2JP: "t2jp", // 繁体转日文汉字
    JP2T: "jp2t" // 日文汉字转繁体
};
/**
 * 简繁中文转换器
 */
class ChineseConverter {
    /**
     * 转换文本内容
     * @param text - 要转换的文本
     * @param mode - 转换模式
     * @returns 转换后的文本
     */
    static convertText(text, mode) {
        try {
            // 根据模式选择对应的Locale配置
            let config;
            switch (mode) {
                case exports.ConvertMode.S2T:
                    config = opencc_js_1.Locale.from.cn;
                    break;
                case exports.ConvertMode.T2S:
                    config = opencc_js_1.Locale.to.cn;
                    break;
                case exports.ConvertMode.S2TW:
                    config = opencc_js_1.Locale.from.tw;
                    break;
                case exports.ConvertMode.S2HK:
                    config = opencc_js_1.Locale.from.hk;
                    break;
                case exports.ConvertMode.S2TWP:
                    config = opencc_js_1.Locale.from.twp;
                    break;
                case exports.ConvertMode.T2TW:
                    config = opencc_js_1.Locale.to.tw;
                    break;
                case exports.ConvertMode.T2HK:
                    config = opencc_js_1.Locale.to.hk;
                    break;
                case exports.ConvertMode.T2JP:
                    config = opencc_js_1.Locale.to.jp;
                    break;
                case exports.ConvertMode.JP2T:
                    config = opencc_js_1.Locale.from.jp;
                    break;
                default:
                    config = opencc_js_1.Locale.from.cn;
            }
            // 创建OpenCC转换器实例
            const converter = (0, opencc_js_1.ConverterFactory)(config);
            // 执行转换
            return converter(text);
        }
        catch (error) {
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
    static fallbackConvert(text, mode) {
        // 简化的映射表作为备用方案
        const simplifiedToTraditional = {
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
        const traditionalToSimplified = Object.fromEntries(Object.entries(simplifiedToTraditional).map(([key, value]) => [value, key]));
        let result = text;
        // 根据模式选择映射表
        let mapping;
        if (mode === exports.ConvertMode.S2T || mode === exports.ConvertMode.S2TW || mode === exports.ConvertMode.S2HK || mode === exports.ConvertMode.S2TWP) {
            mapping = simplifiedToTraditional;
        }
        else {
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
    static async convertFile(inputPath, outputPath, mode) {
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
        }
        catch (error) {
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
    static async convertDirectory(inputDir, outputDir, mode) {
        const results = [];
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
    static getStats(results) {
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
exports.ChineseConverter = ChineseConverter;
ChineseConverter.SUPPORTED_EXTENSIONS = [".txt", ".md", ".json", ".js", ".ts", ".html", ".css", ".xml"];
//# sourceMappingURL=chinese-converter.js.map