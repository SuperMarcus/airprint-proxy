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


    /// <reference types="node" />

//Type declaration file for AirPrint Proxy

declare namespace AirPrintProxy {
    // airprint-proxy/Printer reference
    namespace Printer{
        interface Printer extends NodeJS.EventEmitter {
            setOption(key: string, value: string | Array<string>): void;
            setOption(options: object): void;
            setOptionBool(key: string, value: boolean): void;

            setAuthentication(method: string): void;
            setTLS(state: string): void;
            setQueue(queue: string): void;
            setNotes(notes: string): void;
            setLocation(notes: string): void;
            setOptionPresets(preset: object): void;
            setPrinterModel(model: object): void;
            getSupportedMIME(): Array<string>;
            addSupportedMIME(newMime: string): void;
            compileRecordOptions(): Buffer;
        }

        interface PrinterStatic {
            // --- Constructors ---
            new(url: string): Printer;
            new(url: string, name: string): Printer;
            new(url: string, name: string, notes: string): Printer;
            new(ip: string, name: string, port: number, notes: string): Printer;
            new(ip: string, name: string, port: number, notes: string, host: string): Printer;

            // --- Constants ---

            //Auth options
            AIR_AUTH_NONE: string;
            AIR_AUTH_CERTIFICATE: string;
            AIR_AUTH_USER_PASS: string;
            AIR_AUTH_NEGOTIATE: string;

            //TLS options
            AIR_TLS_DEFAULT: string;
            AIR_TLS_SUPPORTED: string;
        }

        const defaultPreset: object;
    }

    namespace PrinterProxy{
        interface PrinterProxy extends NodeJS.EventEmitter {
            new();

            //Publish printer
            addPrinter(newPrinter: AirPrintProxy.Printer.Printer);

            printers: Array<AirPrintProxy.Printer.Printer>;
        }
    }
}

export = AirPrintProxy;
