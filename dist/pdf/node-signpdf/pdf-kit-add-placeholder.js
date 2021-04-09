"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var appender_1 = require("../image/appender");
var const_1 = require("./const");
var specialCharacters = [
    'á',
    'Á',
    'é',
    'É',
    'í',
    'Í',
    'ó',
    'Ó',
    'ö',
    'Ö',
    'ő',
    'Ő',
    'ú',
    'Ú',
    'ű',
    'Ű',
];
exports.appendFont = function (pdf, fontName) {
    var fontObject = getFont(fontName);
    var fontReference = pdf.append(fontObject);
    return fontReference;
};
exports.appendAcroform = function (pdf, fieldIds, widgetReferenceList, fonts, acroFormId) {
    /*
    const fontObject = getFont('Helvetica')
    const fontReference = pdf.append(fontObject)
  
    const zafObject = getFont('ZapfDingbats')
    const zafReference = pdf.append(zafObject)
  */
    var acroformObject = getAcroform(fieldIds, widgetReferenceList, fonts);
    var acroformReference = pdf.append(acroformObject, acroFormId);
    return acroformReference;
};
exports.appendImage = function (pdf, signatureOptions) { return __awaiter(void 0, void 0, void 0, function () {
    var hasImg, IMG, _a;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                hasImg = (_c = (_b = signatureOptions.annotationAppearanceOptions) === null || _b === void 0 ? void 0 : _b.imageDetails) === null || _c === void 0 ? void 0 : _c.imagePath;
                if (!hasImg) return [3 /*break*/, 2];
                return [4 /*yield*/, appender_1.getImage(signatureOptions.annotationAppearanceOptions.imageDetails.imagePath, pdf)];
            case 1:
                _a = _d.sent();
                return [3 /*break*/, 3];
            case 2:
                _a = undefined;
                _d.label = 3;
            case 3:
                IMG = _a;
                return [2 /*return*/, IMG];
        }
    });
}); };
exports.appendAnnotationApparance = function (pdf, signatureOptions, apFontReference, image) {
    var apObject = getAnnotationApparance(image, apFontReference);
    var apReference = pdf.appendStream(apObject, getStream(signatureOptions.annotationAppearanceOptions, image != null ? image.index : undefined));
    return apReference;
};
exports.appendWidget = function (pdf, widgetIndex, signatureOptions, signatureReference, apReference) {
    var widgetObject = getWidget(widgetIndex, signatureReference, apReference, signatureOptions.annotationAppearanceOptions.signatureCoordinates, pdf);
    var widgetReference = pdf.append(widgetObject);
    return widgetReference;
};
exports.appendSignature = function (pdf, signatureOptions, signatureLength, byteRangePlaceholder) {
    if (signatureLength === void 0) { signatureLength = const_1.DEFAULT_SIGNATURE_LENGTH; }
    if (byteRangePlaceholder === void 0) { byteRangePlaceholder = const_1.DEFAULT_BYTE_RANGE_PLACEHOLDER; }
    var signatureObject = getSignature(byteRangePlaceholder, signatureLength, signatureOptions.reason, signatureOptions);
    var signatureReference = pdf.append(signatureObject);
    return signatureReference;
};
var getAcroform = function (fieldIds, WIDGET, fonts) {
    var mergedFonts = fonts.reduce(function (prev, curr) { return prev + ("/" + curr.name + " " + curr.ref.toString() + " "); }, '');
    return {
        Type: 'AcroForm',
        SigFlags: 3,
        Fields: __spreadArrays(fieldIds, WIDGET),
        DR: "<</Font\n<<" + mergedFonts.trim() + ">>\n>>",
    };
};
var getWidget = function (widgetIndex, signature, AP, signatureCoordinates, pdf) {
    var signatureBaseName = 'Signature';
    return {
        Type: 'Annot',
        Subtype: 'Widget',
        FT: 'Sig',
        Rect: [
            signatureCoordinates.left,
            signatureCoordinates.bottom,
            signatureCoordinates.right,
            signatureCoordinates.top,
        ],
        V: signature,
        T: new String(signatureBaseName + widgetIndex),
        F: 4,
        AP: "<</N " + AP.index + " 0 R>>",
        P: pdf.getCurrentWidgetPageReference(),
        DA: new String('/Helvetica 0 Tf 0 g'),
    };
};
var getAnnotationApparance = function (IMG, APFONT) {
    var resources = "<</Font <<\n/f1 " + APFONT.index + " 0 R\n>>>>";
    if (IMG != null) {
        resources = "<</XObject <<\n/Img" + IMG.index + " " + IMG.index + " 0 R\n>>\n/Font <<\n/f1 " + APFONT.index + " 0 R\n>>\n>>";
    }
    var xObject = {
        CropBox: [0, 0, 197, 70],
        Type: 'XObject',
        FormType: 1,
        BBox: [-10, 10, 197.0, 70.0],
        MediaBox: [0, 0, 197, 70],
        Subtype: 'Form',
        Resources: resources,
    };
    return xObject;
};
var getStream = function (annotationAppearanceOptions, imgIndex) {
    var generatedContent = generateSignatureContents(annotationAppearanceOptions.signatureDetails);
    var generatedImage = '';
    if (imgIndex != null) {
        generatedImage = generateImage(annotationAppearanceOptions.imageDetails, imgIndex);
    }
    return getConvertedText("\n    1.0 1.0 1.0 rg\n    0.0 0.0 0.0 RG\n    q\n    " + generatedImage + "\n    0 0 0 rg\n    " + generatedContent + "\n    Q");
};
var generateImage = function (imageDetails, imgIndex) {
    var _a = imageDetails.transformOptions, rotate = _a.rotate, space = _a.space, stretch = _a.stretch, tilt = _a.tilt, xPos = _a.xPos, yPos = _a.yPos;
    return "\n    q\n    " + space + " " + rotate + " " + tilt + " " + stretch + " " + xPos + " " + yPos + " cm\n    /Img" + imgIndex + " Do\n    Q\n  ";
};
var generateSignatureContents = function (details) {
    var detailsAsPdfContent = details.map(function (detail, index) {
        var detailAsPdfContent = generateSignatureContent(detail);
        return detailAsPdfContent;
    });
    return detailsAsPdfContent.join('');
};
var generateSignatureContent = function (detail) {
    var _a = detail.transformOptions, rotate = _a.rotate, space = _a.space, tilt = _a.tilt, xPos = _a.xPos, yPos = _a.yPos;
    return "\n    BT\n    0 Tr\n    /f1 " + detail.fontSize + " Tf\n    " + space + " " + rotate + " " + tilt + " 1 " + xPos + " " + yPos + " Tm\n    (" + detail.value + ") Tj\n    ET\n  ";
};
var getFont = function (baseFont) {
    return {
        Type: 'Font',
        BaseFont: baseFont,
        Encoding: 'WinAnsiEncoding',
        Subtype: 'Type1',
    };
};
var getSignature = function (byteRangePlaceholder, signatureLength, reason, signatureDetails) {
    return {
        Type: 'Sig',
        Filter: 'Adobe.PPKLite',
        SubFilter: 'adbe.pkcs7.detached',
        ByteRange: [0, byteRangePlaceholder, byteRangePlaceholder, byteRangePlaceholder],
        Contents: Buffer.from(String.fromCharCode(0).repeat(signatureLength)),
        Reason: new String(reason),
        M: new Date(),
        ContactInfo: new String("" + signatureDetails.email),
        Name: new String("" + signatureDetails.signerName),
        Location: new String("" + signatureDetails.location),
    };
};
var getConvertedText = function (text) {
    return text
        .split('')
        .map(function (character) {
        return specialCharacters.includes(character)
            ? getOctalCodeFromCharacter(character)
            : character;
    })
        .join('');
};
var getOctalCodeFromCharacter = function (character) {
    return '\\' + character.charCodeAt(0).toString(8);
};
