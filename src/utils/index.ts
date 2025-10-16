/*
 * @Author: boykaaa
 * @Date: 2025-10-16 12:05:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 12:05:00
 * @description: 工具函数
 * @param:
 * @return:
 */
import * as fs from "fs-extra";
import * as path from "path";

/**
 * 文件工具类
 */
export class FileUtils {
	/**
	 * 确保目录存在
	 * @param dirPath - 目录路径
	 */
	static async ensureDir(dirPath: string): Promise<void> {
		await fs.ensureDir(dirPath);
	}

	/**
	 * 检查文件是否存在
	 * @param filePath - 文件路径
	 * @returns 是否存在
	 */
	static async exists(filePath: string): Promise<boolean> {
		try {
			await fs.access(filePath);
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * 获取文件扩展名
	 * @param filePath - 文件路径
	 * @returns 扩展名
	 */
	static getExtension(filePath: string): string {
		return path.extname(filePath).toLowerCase();
	}

	/**
	 * 获取文件名（不含扩展名）
	 * @param filePath - 文件路径
	 * @returns 文件名
	 */
	static getBasename(filePath: string): string {
		return path.basename(filePath, path.extname(filePath));
	}

	/**
	 * 获取目录名
	 * @param filePath - 文件路径
	 * @returns 目录名
	 */
	static getDirname(filePath: string): string {
		return path.dirname(filePath);
	}
}

/**
 * IP工具类
 */
export class IpUtils {
	/**
	 * 验证IP地址格式
	 * @param ip - IP地址
	 * @returns 是否有效
	 */
	static isValidIp(ip: string): boolean {
		const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
		if (!ipRegex.test(ip)) return false;

		const parts = ip.split(".");
		return parts.every((part) => {
			const num = parseInt(part, 10);
			return num >= 0 && num <= 255;
		});
	}

	/**
	 * 检查是否为私有IP
	 * @param ip - IP地址
	 * @returns 是否为私有IP
	 */
	static isPrivateIp(ip: string): boolean {
		const privateRanges = [
			/^10\./, // 10.0.0.0/8
			/^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
			/^192\.168\./, // 192.168.0.0/16
			/^127\./, // 127.0.0.0/8 (localhost)
			/^169\.254\./, // 169.254.0.0/16 (link-local)
			/^::1$/, // IPv6 localhost
			/^fe80:/ // IPv6 link-local
		];

		return privateRanges.some((range) => range.test(ip));
	}

	/**
	 * 格式化IP地址
	 * @param ip - IP地址
	 * @returns 格式化后的IP地址
	 */
	static formatIp(ip: string): string {
		const parts = ip.split(".");
		return parts.map((part) => part.padStart(3, "0")).join(".");
	}
}

/**
 * 地理工具类
 */
export class GeoUtils {
	/**
	 * 计算两点之间的距离（公里）
	 * @param lat1 - 纬度1
	 * @param lng1 - 经度1
	 * @param lat2 - 纬度2
	 * @param lng2 - 经度2
	 * @returns 距离（公里）
	 */
	static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const R = 6371; // 地球半径（公里）
		const dLat = this.toRadians(lat2 - lat1);
		const dLng = this.toRadians(lng2 - lng1);

		const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return R * c;
	}

	/**
	 * 角度转弧度
	 * @param degrees - 角度
	 * @returns 弧度
	 */
	private static toRadians(degrees: number): number {
		return degrees * (Math.PI / 180);
	}

	/**
	 * 检查坐标是否在中国境内
	 * @param lat - 纬度
	 * @param lng - 经度
	 * @returns 是否在中国境内
	 */
	static isInChina(lat: number, lng: number): boolean {
		// 中国大致边界
		const chinaBounds = {
			north: 53.5,
			south: 18.0,
			east: 135.0,
			west: 73.0
		};

		return lat >= chinaBounds.south && lat <= chinaBounds.north && lng >= chinaBounds.west && lng <= chinaBounds.east;
	}
}
