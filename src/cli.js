#!/usr/bin/env node

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

const ProxyLib = require("airprint-proxy");
const optParser = require("optimist")
    .usage(
        " ____ _ ____ ___  ____ _ _  _ ___    ___  ____ ____ _  _ _   _     \n" +
        " |__| | |__/ |__] |__/ | |\\ |  |     |__] |__/ |  |  \\/   \\_/   \n" +
        " |  | | |  \\ |    |  \\ | | \\|  |     |    |  \\ |__| _/\\_   |  \n" +
        "                                                                   \n" +
        " AirPrint Proxy - Copyright (C) 2017 Marcus Zhou\n" +
        "\n" +
        "Usage: $0 [...options] <url|ip>"
    )
    .options("h", {
        alias: "help",
        describe: "Show this message"
    })
    .options("p", {
        alias: "port",
        default: 631,
        describe: "The port of the printing server that clients will be connect to"
    })
    .options("n", {
        alias: "name",
        default: "Untitled Bonjour Printer",
        describe: "The name of the printer that will be broadcasts to the local network"
    })
    .options("l", {
        alias: "location",
        default: "",
        describe: "The notes which will be shown as the location of the printer"
    })
    .options("q", {
        alias: "queue",
        default: "ipp/print",
        describe: "The queue on the printing server which clients will be communicating with"
    })
    .options("c", {
        alias: "color",
        default: false,
        describe: "Broadcast this printer as a color printer"
    })
    .options("m", {
        alias: "mime-types",
        describe: "Specify additional supported MIME types beside 'image/urf'. Use multiple of this options to declare more than one supported types."
    })
    .options("d", {
        alias: "duplex",
        default: false,
        describe: "Broadcast this printer as duplex supported"
    })
    .options("a", {
        alias: "automatic",
        default: false,
        describe: "Automatically configure the printer. Only specify an ip address if use this."
    })
    .options("o", {
        alias: "txt-record",
        describe: "Add additional txt records. (E.g. -o you=me)"
    });

function dumpPrinter(printer) {
    console.info("[#] Printer setup information:");
    console.info("[#]  Address:\t%s", printer.ip);
    console.info("[#]  Port:\t%d", printer.port);
    console.info("[#]  Name:\t%s", printer.name);
    console.info("[#]  Notes:\t%s", printer.options["note"]);
    console.info("[#]  Service:\t%s", printer.host);
    console.info("[#]  Queue:\t%s", printer.options["rp"]);
    console.info("[#]  Additional Options:");

    Object.keys(printer.options).forEach(function (t) {
        //Skip printed options
        if (t !== "UUID" && t !== "note" && t !== "Duplex" && t !== "Color" && t !== "pdl" && t !== "rp")
            console.info("[#]   %s => %s", t, Array.isArray(printer.options[t]) ?
                printer.options[t].join(",") : printer.options[t]);
    });

    console.info("[#]  MIMEs:\t%s", printer.getSupportedMIME().join(", "));
    console.info("[#]  UUID:\t%s", printer.uuid);
}

const argv = optParser.argv;

const Printer = ProxyLib.Printer;
const PrinterProxy = ProxyLib.PrinterProxy;

if (argv.help) {
    optParser.showHelp();
    process.exit(0);
}

var printerUrl = argv._[0];

var proxy = new PrinterProxy();

if(argv.a){
    printerUrl = printerUrl || argv.a;
    const ipPattern = /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/g;
    if(ipPattern.test(printerUrl)){
        console.info("[*] Resolving printers on " + printerUrl);
        proxy.resolvePrinter(printerUrl, function (err, printers) {
            if(err){
                console.error("Error: Unable to resolve remote printer - " + err);
                console.error(" Does your printer allow unicast dns service discovery from your address?");
                process.exit(1);
            }

            console.info("[*] " + printers.length + " printers found on remote server " + printerUrl);
            printers.forEach(dumpPrinter);
            console.info("[*] Printers are broadcasting on the local network");
        })
    } else {
        console.error("Error: Automatic mode only requires an IP address of the printer.");
        console.error(" Please specify an valid ip address.");
        process.exit(1);
    }
} else {
    if(typeof printerUrl === "undefined") {
        console.error("Error: Please specify the url of this printer. (E.g. ipp://10.35.0.18:631/ipp/print)");
        console.error(" Run the program again with -h flag to receive more information.");
        process.exit(1);
    }

    var printer = new Printer(printerUrl, argv.name, argv.port, argv.location);
    printer.setOption("Duplex", argv.duplex ? "T" : "F");
    printer.setOption("Color", argv.color ? "T" : "F");
    printer.setQueue(argv.queue);

    if (argv.m){
        if (Array.isArray(argv.m)){
            argv.m.forEach(function (mime) {
                printer.addSupportedMIME(mime);
            });
        }else printer.addSupportedMIME(argv.m);
    }

    if (argv.o){
        if (Array.isArray(argv.o)){
            argv.o.forEach(function (option) {
                var pair = option.split("=");
                printer.setOption(pair[0], pair[1] || "");
            });
        }else if(typeof argv.o === "string") {
            var pair = argv.o.split("=");
            printer.setOption(pair[0], pair[1] || "");
        }else {
            console.error("Error: Unable to parse value: %s", argv.o);
            process.exit(1);
        }
    }

    proxy.addPrinter(printer);
    dumpPrinter(printer);
    console.info("[*] Printer is broadcasting on the local network");
}

console.info("[!] Hit Ctrl-C to exit the program");
