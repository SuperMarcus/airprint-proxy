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
    new Printer("10.35.0.18", "Library Color", 631, "Media Center", "printer-librarycolor.local")
);

proxy.addPrinter(
    new Printer("10.20.0.95", "US Commons", 631, "Upper School 2nd Floor", "printer-uscommons.local")
);

proxy.addPrinter(
    new Printer("10.20.0.92", "US Life Center", 631, "Upper School 1st Floor", "printer-lifecenter.local")
);

proxy.printers.forEach(function (t) {
    t.setOption({
        "Transparent": "T",
        "Binary": "T",
        "TBCP": "T",
        "kind": [ "document", "photo", "envelope" ],

        "Color": "T",
        "Duplex": "T",
        "PaperMax": ">isoC-A2",
        "Staple": "T",

        "product": "(RICOH MP C4503 PXL)"
    });
});

console.info("[*] Advertising printers");