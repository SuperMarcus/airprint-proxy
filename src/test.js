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

const Printer = require("./Printer");
const PrinterProxy = require("./PrinterProxy");

console.info("[*] Setting up printers...");

const proxy = new PrinterProxy();

proxy.addPrinter(
    new Printer("ipp://10.35.0.18:631/ipp/print", "Library Color", "Media Center")
);

proxy.addPrinter(
    new Printer("ipp://10.20.0.95:631/ipp/print", "US Commons", "Upper School 2nd Floor")
);

proxy.addPrinter(
    new Printer("ipp://10.20.0.92/ipp/print", "US Life Center", "Upper School 1st Floor")
);

proxy.printers.forEach(function (t) {
    t.setOption({
        "Transparent": "F",
        "Binary": "T",
        "TBCP": "T",
        "kind": [ "document", "label", "envelope" ],

        "Color": "T",
        "Collate": "T",
        "Copies": "T",
        "Sort": "T",
        "Duplex": "T",
        "PaperMax": "<legal-A4",
        "Staple": "T",
        "Fax": "F",
        "Scan": "T",
        "Punch": 3,
        "TLS": 1.2,

        "product": "(RICOH MP C4503 PXL)",
        "pdl": "application/postscript,image/urf,application/pdf,image/jpeg",
        "URF": "W8,SRGB24,CP255,DM1,FN3-4-5-9-20-22-24-25-26-28-29-30-74-75-76-78-79-80,"+
        "MT1-2-3-4-5-6-11,PQ4,RS200-600,IS1-4-20-21-22-23,OB1-5-7,V1.4"
    });
});

setInterval(function () {
    //Readvertise every 2 seconds
    proxy.onPrinterListRequest(false, false);
}, 2000);

console.info("[*] Advertising printers");
