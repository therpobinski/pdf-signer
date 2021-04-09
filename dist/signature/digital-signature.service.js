"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_forge_1 = __importDefault(require("node-forge"));
var certUtil = __importStar(require("./cert.util"));
exports.getSignature = function (pdfWithByteRange, p12Buffer, placeholderLength, certPassword) {
    var p12Data = certUtil.getDataFromP12Cert(p12Buffer, certPassword);
    var certBags = certUtil.getCertBags(p12Data);
    var keyBags = getKeyBags(p12Data);
    var privateKey = getPrivateKey(keyBags);
    var p7 = node_forge_1.default.pkcs7.createSignedData();
    p7.content = node_forge_1.default.util.createBuffer(pdfWithByteRange.toString('binary'));
    var certificate = getCertificate(p7, certBags, privateKey);
    var signer = getSigner(privateKey, certificate);
    p7.addSigner(signer);
    p7.sign({ detached: true });
    var rawSignature = getRawSignature(p7, placeholderLength);
    var signature = exports.getSignatureFromRawSignature(rawSignature, placeholderLength);
    return signature;
};
exports.getOnlyRawSignature = function (pdfWithByteRange, p12Buffer, placeholderLength, certPassword) {
    var p12Data = certUtil.getDataFromP12Cert(p12Buffer, certPassword);
    var certBags = certUtil.getCertBags(p12Data);
    var keyBags = getKeyBags(p12Data);
    var privateKey = getPrivateKey(keyBags);
    var p7 = node_forge_1.default.pkcs7.createSignedData();
    p7.content = node_forge_1.default.util.createBuffer(pdfWithByteRange.toString('binary'));
    var certificate = getCertificate(p7, certBags, privateKey);
    var signer = getSigner(privateKey, certificate);
    p7.addSigner(signer);
    p7.sign({ detached: true });
    var rawSignature = getRawSignature(p7, placeholderLength);
    return rawSignature;
};
var getKeyBags = function (p12) {
    var keyBags = p12.getBags({ bagType: node_forge_1.default.pki.oids.pkcs8ShroudedKeyBag })[node_forge_1.default.pki.oids.pkcs8ShroudedKeyBag];
    if (!keyBags) {
        throw new Error('KeyBags are not exist!');
    }
    return keyBags;
};
var getPrivateKey = function (keyBags) {
    var privateKey = keyBags[keyBags.length - 1].key;
    if (!privateKey) {
        throw new Error('PrivateKey is not exists!');
    }
    return privateKey;
};
var getCertificate = function (p7, certBags, privateKey) {
    var certificate;
    Object.keys(certBags).forEach(function (value, index, array) {
        var _a, _b;
        var publicKey = (_b = (_a = certBags[index]) === null || _a === void 0 ? void 0 : _a.cert) === null || _b === void 0 ? void 0 : _b.publicKey;
        var rawCertificate = certBags[index].cert;
        p7.addCertificate(rawCertificate);
        certificate = getValidatedCertificate(privateKey, publicKey, rawCertificate) || certificate;
    });
    if (!certificate) {
        throw new Error('Failed to find a certificate that matches the private key.');
    }
    return certificate;
};
var getRawSignature = function (p7, placeholderLength) {
    var rawSignature = node_forge_1.default.asn1.toDer(p7.toAsn1()).getBytes();
    if (rawSignature.length * 2 > placeholderLength) {
        throw new Error("Signature exceeds placeholder length: " + rawSignature.length * 2 + " > " + placeholderLength);
    }
    return rawSignature;
};
exports.getSignatureFromRawSignature = function (rawSignature, placeholderLength) {
    var signature = Buffer.from(rawSignature, 'binary').toString('hex');
    signature += Buffer.from(String.fromCharCode(0).repeat(placeholderLength / 2 - rawSignature.length)).toString('hex');
    return signature;
};
var getSigner = function (privateKey, certificate) {
    return {
        key: privateKey,
        certificate: certificate,
        digestAlgorithm: node_forge_1.default.pki.oids.sha256,
        authenticatedAttributes: [
            {
                type: node_forge_1.default.pki.oids.contentType,
                value: node_forge_1.default.pki.oids.data,
            },
            {
                type: node_forge_1.default.pki.oids.messageDigest,
            },
            {
                type: node_forge_1.default.pki.oids.signingTime,
                value: new Date().toString(),
            },
        ],
    };
};
var getValidatedCertificate = function (privateKey, publicKey, rawCertificate) {
    var validatedCertificate = undefined;
    var isPrivateKeyModulusSameAsPublicKeyModulus = privateKey.n.compareTo(publicKey.n) === 0;
    var isPrivateKeyExponentSameAsPublicKeyExponent = privateKey.e.compareTo(publicKey.e) === 0;
    if (isPrivateKeyModulusSameAsPublicKeyModulus && isPrivateKeyExponentSameAsPublicKeyExponent) {
        validatedCertificate = rawCertificate;
    }
    return validatedCertificate;
};
