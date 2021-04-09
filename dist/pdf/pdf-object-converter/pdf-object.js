"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_reference_1 = __importDefault(require("../node-signpdf/pdfkit/abstract_reference"));
var primitiveStringHandler = {
    convert: function (object) {
        return "/" + object;
    },
    isTypeMatches: function (object) {
        return typeof object === 'string';
    },
};
var stringHandler = {
    convert: function (object, encryptFunction) {
        var escapable = {
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '\b': '\\b',
            '\f': '\\f',
            '\\': '\\\\',
            '(': '\\(',
            ')': '\\)',
        };
        var swapBytes = function (buff) {
            var bufferLength = buff.length;
            if (bufferLength & 0x01) {
                throw new Error('Buffer length must be even');
            }
            else {
                for (var i = 0, end = bufferLength - 1; i < end; i += 2) {
                    var a = buff[i];
                    buff[i] = buff[i + 1];
                    buff[i + 1] = a;
                }
            }
            return buff;
        };
        var string = object;
        var isUnicode = false;
        for (var i = 0, end = string.length; i < end; i += 1) {
            if (string.charCodeAt(i) > 0x7f) {
                isUnicode = true;
                break;
            }
        }
        var stringBuffer;
        if (isUnicode) {
            stringBuffer = swapBytes(Buffer.from("\uFEFF" + string, 'utf16le'));
        }
        else {
            stringBuffer = Buffer.from(string, 'ascii');
        }
        if (encryptFunction) {
            string = encryptFunction(stringBuffer).toString('binary');
        }
        else {
            string = stringBuffer.toString('binary');
        }
        string = string.replace(function (escapableRe, c) { return escapable[c]; });
        return "(" + string + ")";
    },
    isTypeMatches: function (object) {
        return object instanceof String;
    },
};
var bufferHandler = {
    convert: function (object) {
        return "<" + object.toString('hex') + ">";
    },
    isTypeMatches: function (object) {
        return Buffer.isBuffer(object);
    },
};
var PDFAbstrastReferenceHandler = {
    convert: function (object) {
        return object.toString();
    },
    isTypeMatches: function (object) {
        return object instanceof abstract_reference_1.default;
    },
};
var dateHandler = {
    convert: function (object, encryptFunction) {
        var escapableRe = /[\n\r\t\b\f\(\)\\]/g;
        var escapable = {
            '\n': '\\n',
            '\r': '\\r',
            '\t': '\\t',
            '\b': '\\b',
            '\f': '\\f',
            '\\': '\\\\',
            '(': '\\(',
            ')': '\\)',
        };
        var pad = function (str, length) { return (Array(length + 1).join('0') + str).slice(-length); };
        var string = "D:" + pad(object.getUTCFullYear(), 4) + pad(object.getUTCMonth() + 1, 2) + pad(object.getUTCDate(), 2) + pad(object.getUTCHours(), 2) + pad(object.getUTCMinutes(), 2) + pad(object.getUTCSeconds(), 2) + "Z";
        if (encryptFunction) {
            string = encryptFunction(Buffer.from(string, 'ascii')).toString('binary');
            string = string.replace(escapableRe, function (c) { return escapable[c]; });
        }
        return "(" + string + ")";
    },
    isTypeMatches: function (object) {
        return object instanceof Date;
    },
};
var arrayHandler = {
    convert: function (object, encryptFunction) {
        var items = object.map(function (e) { return exports.convertObject(e, encryptFunction); }).join(' ');
        return "[" + items + "]";
    },
    isTypeMatches: function (object) {
        return Array.isArray(object);
    },
};
var objectHandler = {
    convert: function (object, encryptFunction) {
        var out = ['<<'];
        for (var key in object) {
            if (object.hasOwnProperty(key)) {
                var val = object[key];
                var checkedValue = '';
                if (val != null && val.toString().indexOf('<<') !== -1) {
                    checkedValue = val;
                }
                else {
                    checkedValue = exports.convertObject(val, encryptFunction);
                }
                out.push("/" + key + " " + checkedValue);
            }
        }
        out.push('>>');
        return out.join('\n');
    },
    isTypeMatches: function (object) {
        return {}.toString.call(object) === '[object Object]';
    },
};
var numberHandler = {
    convert: function (object) {
        var result;
        if (object > -1e21 && object < 1e21) {
            result = Math.round(object * 1e6) / 1e6;
        }
        else {
            throw new Error("unsupported number: " + object);
        }
        return String(result);
    },
    isTypeMatches: function (object) {
        return typeof object === 'number';
    },
};
var defaultHandler = {
    convert: function (object) {
        return "" + object;
    },
    isTypeMatches: function (object) {
        throw new Error("Default handle doesnt have isMyType method");
    },
};
var converters = [
    primitiveStringHandler,
    stringHandler,
    bufferHandler,
    PDFAbstrastReferenceHandler,
    dateHandler,
    arrayHandler,
    numberHandler,
    objectHandler,
];
exports.convertObject = function (object, encryptFunction) {
    if (encryptFunction === void 0) { encryptFunction = null; }
    var selectedConverter = converters.find(function (converter) { return converter.isTypeMatches(object); });
    var converter = selectedConverter != null ? selectedConverter.convert : defaultHandler.convert;
    return converter(object, encryptFunction);
};
