/**
 * 转换模式枚举
 */
export declare enum ConvertMode {
    S2T = "s2t",// 简体转繁体
    T2S = "t2s",// 繁体转简体
    S2TW = "s2tw",// 简体转台湾繁体
    S2HK = "s2hk",// 简体转香港繁体
    S2TWP = "s2twp",// 简体转台湾繁体(短语)
    T2TW = "t2tw",// 繁体转台湾繁体
    T2HK = "t2hk",// 繁体转香港繁体
    T2JP = "t2jp",// 繁体转日文汉字
    JP2T = "jp2t"
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
export declare class ChineseConverter {
    private static readonly SUPPORTED_EXTENSIONS;
    /**
     * 转换文本内容
     * @param text - 要转换的文本
     * @param mode - 转换模式
     * @returns 转换后的文本
     */
    static convertText(text: string, mode: ConvertMode): string;
    /**
     * 备用转换方案（当OpenCC不可用时）
     * @param text - 要转换的文本
     * @param mode - 转换模式
     * @returns 转换后的文本
     */
    private static fallbackConvert;
    /**
     * 转换单个文件
     * @param inputPath - 输入文件路径
     * @param outputPath - 输出文件路径
     * @param mode - 转换模式
     * @returns 转换结果
     */
    static convertFile(inputPath: string, outputPath: string, mode: ConvertMode): Promise<FileConvertResult>;
    /**
     * 转换目录中的所有文件
     * @param inputDir - 输入目录
     * @param outputDir - 输出目录
     * @param mode - 转换模式
     * @returns 转换结果数组
     */
    static convertDirectory(inputDir: string, outputDir: string, mode: ConvertMode): Promise<FileConvertResult[]>;
    /**
     * 获取转换统计信息
     * @param results - 转换结果数组
     * @returns 统计信息
     */
    static getStats(results: FileConvertResult[]): ConvertStats;
}
//# sourceMappingURL=chinese-converter.d.ts.map