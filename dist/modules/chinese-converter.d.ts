/**
 * 转换模式常量
 */
export declare const ConvertMode: {
    readonly S2T: "s2t";
    readonly T2S: "t2s";
    readonly S2TW: "s2tw";
    readonly S2HK: "s2hk";
    readonly S2TWP: "s2twp";
    readonly T2TW: "t2tw";
    readonly T2HK: "t2hk";
    readonly T2JP: "t2jp";
    readonly JP2T: "jp2t";
};
export type ConvertMode = typeof ConvertMode[keyof typeof ConvertMode];
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