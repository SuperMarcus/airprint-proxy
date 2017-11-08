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

const defaultOptions = {
    "Scan":     "F",
    "Duplex":   "F",
    "Color":    "T",
    "UUID":     "",
    "Fax":      "F",
    "note":     "",
    "priority": "20",
    "URF":      "DM3",
    "kind":     "document,envelope,photo",
    "PaperMax": "<legal-A4",
    "rp":       "ipp/print",
    "pdl":      "image/jpeg,image/urf",
    "qtotal":   "1",
    "txtvers":  "1"
};

function Printer(ip, name, port, notes, host) {
    if (this instanceof Printer){
        if (typeof ip !== 'string'){
            console.error("An ip address is necessary to create a proxy.");
            return;
        }

        this.ip = ip;
        //If name is not set, just generate a random name instead
        this.name = name || "Untitled Bonjour Printer " + parseInt(Math.random() * 100000);
        this.host = host || (this.name.toLowerCase().replace(/\s+/g, "-") + ".local");
        this.service = this.name + "._ipp._tcp.local";
        this.serviceIpps = this.name + "._ipps._tcp.local";
        this.port = port || 631;//Default CUPS port
        this.presets = Object.assign({}, defaultOptions);
        this.uuid = uuidv5(this.host, uuidv5.DNS);
        this.useIpps = false;
        this.options = {};

        this.setOption("note", notes || "");
        this.setOption("UUID", this.uuid);

    } else console.error("Printer is not a function, it's a class.");
}

Printer.prototype.setOption = function (key, value) {
    this.options[key] = String(value);
    this.emit("update", this, [ key ]);
};

Printer.prototype.setColorPrinter = function (value) {
    this.setOption("Color", (typeof value === 'undefined' ? true : value) ? "T" : "F")
};

Printer.prototype.setNote = function (value) {
    this.setOption("note", value);
};

Printer.prototype.setPriority = function (newPriority) {
    this.setOption("priority", parseInt(newPriority) || 0);
};

Printer.prototype.setDuplex = function (supportDuplex) {
    this.setOption("Duplex", (typeof value === 'undefined' ? true : value) ? "T" : "F")
};

Printer.prototype.setFax = function (supportFax) {
    this.setOption("Fax", (typeof value === 'undefined' ? true : value) ? "T" : "F")
};

Printer.prototype.setScan = function (supportFax) {
    this.setOption("Scan", (typeof value === 'undefined' ? true : value) ? "T" : "F")
};

Printer.prototype.setOptionPresets = function (options) {
    this.presets = options;
};

Printer.prototype.compileRecordOptions = function () {
    const recordOptions = Object.assign({}, this.presets, this.options);
    const optionKeyPairs = Object.keys(recordOptions).map(function (k) { return k + "=" + recordOptions[k] });
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
