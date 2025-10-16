"use strict";
/*
 * @Author: boykaaa
 * @Date: 2025-10-16 12:10:00
 * @LastEditors: boykaaa
 * @LastEditTime: 2025-10-16 11:53:13
 * @description: Google Maps配置
 * @param:
 * @return:
 */
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
exports.defaultGoogleMapsConfig = void 0;
exports.getGoogleMapsApiKey = getGoogleMapsApiKey;
exports.isValidApiKey = isValidApiKey;
// 加载环境变量
const dotenv = __importStar(require("dotenv"));
dotenv.config();
/**
 * 默认Google Maps配置
 */
exports.defaultGoogleMapsConfig = {
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
function getGoogleMapsApiKey() {
    return process.env["GOOGLE_MAPS_API_KEY"] || exports.defaultGoogleMapsConfig.apiKey;
}
/**
 * 验证API密钥格式
 * @param apiKey - API密钥
 * @returns 是否为有效格式
 */
function isValidApiKey(apiKey) {
    // Google Maps API密钥通常以AIza开头，长度为39个字符
    const apiKeyRegex = /^AIza[0-9A-Za-z-_]{35}$/;
    return apiKeyRegex.test(apiKey);
}
//# sourceMappingURL=google-maps.js.map