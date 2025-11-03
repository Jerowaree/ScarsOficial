"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genCodigoSequential = genCodigoSequential;
exports.genSeguimiento = genSeguimiento;
function genCodigoSequential(prefix, n) {
    return `${prefix}${String(n).padStart(3, "0")}`;
}
function genSeguimiento() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    return Array.from({ length: 9 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
