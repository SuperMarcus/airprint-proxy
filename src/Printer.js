/**
 *
 * ____ _ ____ ___  ____ _ _  _ ___    ___  ____ ____ _  _ _   _
 * |__| | |__/ |__] |__/ | |\ |  |     |__] |__/ |  |  \/   \_/
 * |  | | |  \ |    |  \ | | \|  |     |    |  \ |__| _/\_   |
 *
 * AirPrint Proxy
 *
 * Copyright (C) 2017 Marcus Zhou
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

const uuidv5 = require("uuid/v5");
const EventEmitter = require("events");
const inherits = require("util").inherits;
const utils = require("./utils");

const defaultOptions = {
    "air": "none",
    "note": "",
    "pdl": [ "image/jpeg", "image/urf" ],
    "rp": "ipp/print",
    "TLS": "",
    "UUID": "",

    //Deprecated Options
    "adminurl": "",
    "priority": 50,
    "product": "()",
    "qtotal": 1,
    "txtvers": 1,
    "ty": "",
    "usb_CMD": "",
    "usb_MDL": "",
    "usb_MFG": "",

    //AirPrint Specific Options
    "URF": "DM3",

    // 9.3 Printer Capability TXT Record Keys
    "Transparent": "F",
    "Binary": "F",
    "TBCP": "F",
    "kind": [ "document", "photo" ],

    // 9.4 Printer Feature TXT Record Keys
    "Color": "U",
    "Duplex": "U",
    "PaperMax": "legal-A4",
    "Staple": "U",

    //Deprecated features
    "Bind": "U",
    "Collate": "U",
    "Copies": "U",
    "PaperCustom": "U",
    "Punch": "U",
    "Scan": "F",
    "Sort": "U"
};

const notationMatcher = /^(?:(\w+):\/\/)?(\d+\.\d+\.\d+\.\d+)(?::(\d+)?)?(.+)?$/;

function Printer(ip, name, port, notes, host) {
    if (this instanceof Printer){
        if (typeof ip !== 'string'){
            console.error("An ip address is necessary to create a proxy.");
            return;
        }

        var matchedResults = notationMatcher.exec(ip);
        ip = matchedResults[2];

        //for the (notation, name, notes) constructor
        if (typeof port === 'string' &&
            utils.isUndef(notes) &&
            utils.isUndef(host)){
            notes = port;
            port = undefined;
        }

        this.ip = ip;
        //If name is not set, just generate a random name instead
        this.name = name || "Untitled Bonjour Printer " + parseInt(Math.random() * 100000);
        this.host = host || (this.name.toLowerCase().replace(/\s+/g, "-") + ".local");
        this.service = this.name + "._ipp._tcp.local";
        this.serviceIpps = this.name + "._ipps._tcp.local";
        this.port = utils.opt(port, matchedResults[3]) || 631;//Default CUPS port
        this.presets = utils.assign({}, defaultOptions);
        this.uuid = uuidv5(this.host, uuidv5.DNS);
        this.useIpps = utils.opt(matchedResults[1], "").toLowerCase() === "ipps";
        this.options = {};

        this.setOption("UUID", this.uuid);
        this.setQueue(matchedResults[4]);
        this.setNotes(notes);

    } else console.error("Printer is not a function, it's a class.");
}

Printer.prototype.setOption = function (key, value) {
    if (typeof key === 'object' && key !== null){
        utils.assign(this.options, key);
        this.emit("update", this, Object.keys(key));
    } else {
        this.options[key] = value;
        this.emit("update", this, [ key ]);
    }
};

Printer.prototype.setOptionBool = function (key, value) {
    this.setOption(key, utils.isUndef(value) ? "U" : value ? "T" : "F");
};

//See constants below to options
Printer.prototype.setAuthentication = function (value) {
    this.setOption("air", value);
};

Printer.AIR_AUTH_NONE = "none";
Printer.AIR_AUTH_CERTIFICATE = "certificate";
Printer.AIR_AUTH_USER_PASS = "username,password";
Printer.AIR_AUTH_NEGOTIATE = "negotiate";

//See constants below to options
Printer.prototype.setTLS = function (value) {
    this.setOption("TLS", value);
};

Printer.AIR_TLS_DEFAULT = "";
Printer.AIR_TLS_SUPPORTED = "1.2";

Printer.prototype.setQueue = function (queue) {
    this.setOption("rp", queue);
};

Printer.prototype.setNotes = function (value) {
    this.setOption("note", utils.opt(value, ""));
};

Printer.prototype.setLocation = Printer.prototype.setNotes;

Printer.prototype.setOptionPresets = function (options) {
    this.presets = options;
};

Printer.prototype.setPrinterModel = function (model) {
    model = utils.opt(model, "");
    this.setOption({
        ty: model,
        product: '(' + model + ')'
    });
};

Printer.prototype.getSupportedMIME = function () {
    return this.options["pdl"] || this.presets.pdl || [];
};

Printer.prototype.addSupportedMIME = function (mime) {
    var supported = this.getSupportedMIME();
    supported.push(mime);
    this.setOption("pdl", supported);
};

Printer.prototype.compileRecordOptions = function () {
    const recordOptions = utils.assign({}, this.presets, this.options);
    const optionKeyPairs = Object.keys(recordOptions).map(function (k) {
        var value = recordOptions[k];
        return k + "=" + (Array.isArray(value) ? value.join(',') : String(value));
    });
    return Buffer.concat(optionKeyPairs.map(function (pair) {
        var buf = new Buffer(Buffer.byteLength(pair, 'utf8') + 1);
        buf.writeUInt8(Buffer.byteLength(pair, 'utf8'), 0);
        buf.write(pair, 1);
        return buf;
    }));
};

inherits(Printer, EventEmitter);

module.exports = Printer;
module.exports.default = Printer;
module.exports.defaultPreset = defaultOptions;
