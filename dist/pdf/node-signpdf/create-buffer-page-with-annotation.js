"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var find_object_1 = __importDefault(require("./find-object"));
var get_index_from_ref_1 = __importDefault(require("./get-index-from-ref"));
var createBufferPageWithAnnotation = function (pdf, info, pagesRef, widget) {
    var pagesDictionary = find_object_1.default(pdf, info.xref, pagesRef).toString();
    // Extend page dictionary with newly created annotations
    var annotsStart, annotsEnd, annots;
    annotsStart = pagesDictionary.indexOf('/Annots');
    if (annotsStart > -1) {
        annotsEnd = pagesDictionary.indexOf(']', annotsStart);
        annots = pagesDictionary.substr(annotsStart, annotsEnd + 1 - annotsStart);
        annots = annots.substr(0, annots.length - 1); // remove the trailing ]
    }
    else {
        annotsStart = pagesDictionary.length;
        annotsEnd = pagesDictionary.length;
        annots = '/Annots [';
    }
    var pagesDictionaryIndex = get_index_from_ref_1.default(info.xref, pagesRef);
    var widgetValue = widget.toString();
    annots = annots + ' ' + widgetValue + ']'; // add the trailing ] back
    var preAnnots = pagesDictionary.substr(0, annotsStart);
    var postAnnots = '';
    if (pagesDictionary.length > annotsEnd) {
        postAnnots = pagesDictionary.substr(annotsEnd + 1);
    }
    return Buffer.concat([
        Buffer.from(pagesDictionaryIndex + " 0 obj\n"),
        Buffer.from('<<\n'),
        Buffer.from(preAnnots + annots + postAnnots + "\n"),
        Buffer.from('\n>>\nendobj\n'),
    ]);
};
exports.default = createBufferPageWithAnnotation;
