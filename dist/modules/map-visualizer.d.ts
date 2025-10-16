import { RegionStats } from "./log-parser";
/**
 * 地图标记点接口
 */
export interface MapMarker {
    lat: number;
    lng: number;
    title: string;
    description: string;
    count: number;
    region: string;
    country: string;
}
/**
 * 地图数据接口
 */
export interface MapData {
    markers: MapMarker[];
    regions: RegionStats[];
    summary: {
        totalIps: number;
        totalRequests: number;
        regions: number;
    };
}
/**
 * 中国地图IP可视化器
 */
export declare class MapVisualizer {
    private app;
    private port;
    constructor(port?: number);
    /**
     * 设置中间件
     */
    private setupMiddleware;
    /**
     * 设置路由
     */
    private setupRoutes;
    /**
     * 将分析结果转换为地图数据
     * @param data - 分析结果数据
     * @returns 地图数据
     */
    private convertToMapData;
    /**
     * 启动服务器
     */
    start(): void;
    /**
     * 停止服务器
     */
    stop(): void;
}
//# sourceMappingURL=map-visualizer.d.ts.map