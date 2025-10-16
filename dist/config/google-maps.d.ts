/**
 * Google Maps配置
 */
export interface GoogleMapsConfig {
    apiKey: string;
    mapType: "roadmap" | "satellite" | "hybrid" | "terrain";
    zoom: number;
    center: {
        lat: number;
        lng: number;
    };
}
/**
 * 默认Google Maps配置
 */
export declare const defaultGoogleMapsConfig: GoogleMapsConfig;
/**
 * 获取Google Maps API密钥
 * 优先从环境变量获取，否则使用默认值
 */
export declare function getGoogleMapsApiKey(): string;
/**
 * 验证API密钥格式
 * @param apiKey - API密钥
 * @returns 是否为有效格式
 */
export declare function isValidApiKey(apiKey: string): boolean;
//# sourceMappingURL=google-maps.d.ts.map