"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_forge_1 = __importDefault(require("node-forge"));
exports.getDataFromP12Cert = function (p12Buffer, certPassword) {
    var forgeCert = node_forge_1.default.util.createBuffer(p12Buffer.toString('binary'));
    var p12Asn1 = node_forge_1.default.asn1.fromDer(forgeCert);
    var p12data = node_forge_1.default.pkcs12.pkcs12FromAsn1(p12Asn1, false, certPassword);
    return p12data;
};
exports.getCertBags = function (p12) {
    var certBags = p12.getBags({ bagType: node_forge_1.default.pki.oids.certBag })[node_forge_1.default.pki.oids.certBag];
    if (!certBags) {
        throw new Error('CertBags are not exist!');
    }
    return certBags;
};
