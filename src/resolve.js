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

const dnsSock = require("dns-socket");
const Printer = require("./Printer");

function onLookup(addr, callback, err, res) {
    const nameRegex = /^(.+)\._ipp\._tcp\.local\.*$/;
    this.destroy();

    let results = [];

    if(err){
        callback(err, null);
        return;
    }

    let hostname = null;

    for(let item of res.additionals){
        if(item.data === addr) { hostname = item.name; }
    }

    for(let printer of res.answers){
        if(printer.type !== "PTR") continue;

        let domain = printer.data;
        let name = nameRegex.exec(domain)[1];

        let newPrinter = new Printer(addr, name, 631, "", hostname);

        for(let info of res.additionals){
            if(info.name === domain){
                if(info.type === "SRV"){
                    newPrinter.port = info.data.port;
                } else if(info.type === "TXT") {
                    for(let textBuffer of info.data){
                        let text = textBuffer.toString("utf8");
                        let kv = text.split("=");
                        let key = kv[0];
                        let value = kv.slice(1).join("=");

                        if(key === "UUID") newPrinter.uuid = value;
                        if(key === "pdl") value = value.split(",");
                        newPrinter.setOption(key, value);
                    }
                }
            }
        }

        results.push(newPrinter);
    }

    if(results.length > 0){ callback(null, results); }
    else { callback(new Error("No printer resolved from server"), null); }
}

/**
 * Automatically configure the printer with its ip address
 *
 * @param addr      IP address of the printer
 * @param callback  Callback function that takes error (null if none) as
 *                  first argument, the created printer object as second
 *                  argument.
 */
function resolveAndCreate(addr, callback){
    const client = dnsSock();
    client.query({
        questions: [{
            name: "_ipp._tcp.local.",
            type: "ANY"
        }]
    }, 5353, addr, onLookup.bind(client, addr, callback));
}

module.exports = resolveAndCreate;
module.exports.default = resolveAndCreate;
