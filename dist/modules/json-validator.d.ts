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
export declare class JsonValidator {
    /**
     * 验证单个JSON文件
     * @param filePath - 文件路径
     * @returns 验证结果
     */
    static validateFile(filePath: string): Promise<JsonValidationResult>;
    /**
     * 批量验证JSON文件
     * @param filePaths - 文件路径数组
     * @returns 验证结果数组
     */
    static validateFiles(filePaths: string[]): Promise<JsonValidationResult[]>;
    /**
     * 验证目录中的所有JSON文件
     * @param dirPath - 目录路径
     * @returns 验证结果数组
     */
    static validateDirectory(dirPath: string): Promise<JsonValidationResult[]>;
    /**
     * 获取验证统计信息
     * @param results - 验证结果数组
     * @returns 统计信息
     */
    static getStats(results: JsonValidationResult[]): ValidationStats;
}
//# sourceMappingURL=json-validator.d.ts.map