/*
 * @Author: boykaaa
 * @Date: 2025-10-16 12:10:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:53:13
 * @description: Google Maps配置
 * @param:
 * @return:
 */

// 加载环境变量
import * as dotenv from "dotenv";
dotenv.config();

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
export const defaultGoogleMapsConfig: GoogleMapsConfig = {
	apiKey: "YOUR_API_KEY", // 请替换为您的Google Maps API密钥
	mapType: "roadmap",
	zoom: 4,
	center: {
		lat: 35.8617, // 中国中心纬度
		lng: 104.1954 // 中国中心经度
	}
};

/**
 * 获取Google Maps API密钥
 * 优先从环境变量获取，否则使用默认值
 */
export function getGoogleMapsApiKey(): string {
	return process.env["GOOGLE_MAPS_API_KEY"] || defaultGoogleMapsConfig.apiKey;
}

/**
 * 验证API密钥格式
 * @param apiKey - API密钥
 * @returns 是否为有效格式
 */
export function isValidApiKey(apiKey: string): boolean {
	// Google Maps API密钥通常以AIza开头，长度为39个字符
	const apiKeyRegex = /^AIza[0-9A-Za-z-_]{35}$/;
	return apiKeyRegex.test(apiKey);
}
