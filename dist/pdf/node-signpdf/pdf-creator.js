"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var pdf_object_1 = require("../pdf-object-converter/pdf-object");
var create_buffer_page_with_annotation_1 = __importDefault(require("./create-buffer-page-with-annotation"));
var create_buffer_root_with_acrofrom_1 = __importDefault(require("./create-buffer-root-with-acrofrom"));
var create_buffer_trailer_1 = __importDefault(require("./create-buffer-trailer"));
var get_index_from_ref_1 = __importDefault(require("./get-index-from-ref"));
var get_page_ref_1 = __importDefault(require("./get-page-ref"));
var pdf_kit_reference_mock_1 = __importDefault(require("./pdf-kit-reference-mock"));
var read_pdf_1 = __importDefault(require("./read-pdf"));
var remove_trailing_new_line_1 = __importDefault(require("./remove-trailing-new-line"));
var PdfCreator = /** @class */ (function () {
    function PdfCreator(originalPdf, annotationOnPages) {
        var _this = this;
        this.addedReferences = new Map();
        this.annotationOnPages = [];
        this.pdf = remove_trailing_new_line_1.default(originalPdf);
        this.originalPdf = originalPdf;
        this.maxIndex = read_pdf_1.default(this.pdf).xref.maxIndex;
        if (annotationOnPages == null) {
            this.initAnnotationInfos(0);
            this.widgetCounter = 0;
        }
        else {
            annotationOnPages.forEach(function (annotationOnPage) {
                _this.initAnnotationInfos(annotationOnPage);
            });
            this.widgetCounter = annotationOnPages.length - 1;
        }
    }
    PdfCreator.prototype.initAnnotationInfos = function (annotationOnPage) {
        var info = read_pdf_1.default(this.pdf);
        var pageRef = get_page_ref_1.default(this.pdf, info, annotationOnPage);
        var pageIndex = get_index_from_ref_1.default(info.xref, pageRef);
        this.annotationOnPages = __spreadArrays(this.annotationOnPages, [
            {
                pageIndex: annotationOnPage,
                pageRef: new pdf_kit_reference_mock_1.default(pageIndex, {
                    data: {
                        Annots: [],
                    },
                }),
            },
        ]);
    };
    PdfCreator.prototype.getCurrentWidgetPageReference = function () {
        var currentPageReference = this.annotationOnPages[this.widgetCounter];
        this.widgetCounter -= 1;
        return currentPageReference.pageRef;
    };
    PdfCreator.prototype.append = function (pdfElement, additionalIndex) {
        this.maxIndex += 1;
        var index = additionalIndex != null ? additionalIndex : this.maxIndex;
        this.addedReferences.set(index, this.pdf.length + 1);
        this.appendPdfObject(index, pdfElement);
        return new pdf_kit_reference_mock_1.default(this.maxIndex);
    };
    PdfCreator.prototype.appendStream = function (pdfElement, stream, additionalIndex) {
        this.maxIndex += 1;
        var index = additionalIndex != null ? additionalIndex : this.maxIndex;
        this.addedReferences.set(index, this.pdf.length + 1);
        this.appendPdfObjectWithStream(index, pdfElement, stream);
        return new pdf_kit_reference_mock_1.default(this.maxIndex);
    };
    PdfCreator.prototype.close = function (form, widgetReferenceList) {
        var _this = this;
        var info = read_pdf_1.default(this.pdf);
        if (!this.isContainBufferRootWithAcrofrom(this.originalPdf)) {
            var rootIndex = get_index_from_ref_1.default(info.xref, info.rootRef);
            this.addedReferences.set(rootIndex, this.pdf.length + 1);
            this.pdf = Buffer.concat([
                this.pdf,
                Buffer.from('\n'),
                create_buffer_root_with_acrofrom_1.default(info, form),
            ]);
        }
        this.annotationOnPages.forEach(function (annotationOnPage, index) {
            var pageRef = annotationOnPage.pageRef;
            _this.addedReferences.set(pageRef.index, _this.pdf.length + 1);
            _this.pdf = Buffer.concat([
                _this.pdf,
                Buffer.from('\n'),
                create_buffer_page_with_annotation_1.default(_this.pdf, info, pageRef.toString(), widgetReferenceList[index]),
            ]);
        });
        this.pdf = Buffer.concat([
            this.pdf,
            Buffer.from('\n'),
            create_buffer_trailer_1.default(this.pdf, info, this.addedReferences),
        ]);
    };
    PdfCreator.prototype.appendPdfObjectWithStream = function (index, pdfObject, stream) {
        this.pdf = Buffer.concat([
            this.pdf,
            Buffer.from('\n'),
            Buffer.from(index + " 0 obj\n"),
            Buffer.from(pdf_object_1.convertObject(pdfObject)),
            Buffer.from('\nstream\n'),
            Buffer.from(stream),
            Buffer.from('\nendstream'),
            Buffer.from('\nendobj\n'),
        ]);
    };
    PdfCreator.prototype.appendPdfObject = function (index, pdfObject) {
        this.pdf = Buffer.concat([
            this.pdf,
            Buffer.from('\n'),
            Buffer.from(index + " 0 obj\n"),
            Buffer.from(pdf_object_1.convertObject(pdfObject)),
            Buffer.from('\nendobj\n'),
        ]);
    };
    PdfCreator.prototype.isContainBufferRootWithAcrofrom = function (pdf) {
        var bufferRootWithAcroformRefRegex = new RegExp('\\/AcroForm\\s+(\\d+\\s\\d+\\sR)', 'g');
        var match = bufferRootWithAcroformRefRegex.exec(pdf.toString());
        return match != null && match[1] != null && match[1] !== '';
    };
    return PdfCreator;
}());
exports.PdfCreator = PdfCreator;
