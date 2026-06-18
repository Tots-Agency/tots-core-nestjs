import { PrimitiveFunctionsHelper } from "../helpers/primitive_functions.helper";

export class TotsParamsService {

    static getByKey(params: any, key: string) {
        if (key.search(/\./) > -1) {
            return TotsParamsService.processValueByKey(key, params);
        }

        return params[key];
    }

    static processValue(val: string | undefined, params: any): any {
        if (val == undefined || val == '' || val == null) {
            return;
        }

        // Create new value for process
        let valNew = val;

        valNew = PrimitiveFunctionsHelper.runByString(valNew, params);

        // Verify if a string
        if (valNew == undefined || valNew == null || typeof valNew !== 'string') {
            return valNew;
        }

        let matches = val.match(/{{(.*?)}}/g);
        if (matches == undefined) {
            return valNew;
        }

        for (let match of matches) {
            let key = match.replace('{{', '').replace('}}', '');
            if (key.search(/\./) > -1) {

                let valueNested = this.processValueByKey(key, params);
                if (Array.isArray(valueNested) || typeof valueNested === 'object') {
                    valNew = valNew.replace(match, JSON.stringify(valueNested));
                } else {
                    valNew = valNew.replace(match, valueNested);
                }

            } else if (params[key] != undefined && (Array.isArray(params[key]) || typeof params[key] === 'object')) {
                valNew = valNew.replace(match, JSON.stringify(params[key]));
            } else if (params[key] != undefined) {
                valNew = valNew.replace(match, params[key]);
            } else {
                valNew = valNew.replace(match, '');
            }
        }

        if (valNew == '') {
            return null;
        }

        return valNew;
    }

    static processValueByKey(key: string, params: any): any {
        // Split key with .
        let keys = key.split('.');

        // Loop through keys
        let value = undefined;
        for (let key of keys) {
            if (value == undefined) {
                value = params[key];
            } else {
                value = value[key];
            }
        }

        return value;
    }

    static processResponseObject(raw: string, params: any) {
        raw = PrimitiveFunctionsHelper.runByString(raw, params);
        // Obtener todas las variables de la respuesta
        const vars = this.getStringVariablesList(raw);
        // reemplazar las variables por los valores
        for (const v of vars) {
            let val = TotsParamsService.getByKey(params, v);
            let valString = '';
            if (val !== null && (typeof val === 'object' || Array.isArray(val))) {
                valString = JSON.stringify(val);
            } else {
                // Reemplazar los saltos de linea por \n
                if (typeof val === 'string') {
                    val = val.replace(/\n/g, '\\n').replace(/\r/g, '\\r');
                }
                valString = val;
            }
            raw = raw.replace(`{{${v}}}`, valString);
        }

        try {
            return JSON.parse(raw);
        } catch (error) {
            return raw;
        }
    }

    static getStringVariablesList(input: string): Array<string> {
        // Utiliza una expresión regular para encontrar las palabras entre doble llaves
        const matches = input.match(/{{(.*?)}}/g);

        if (matches == undefined) {
            return [];
        }

        // Filtra las palabras y elimina las llaves
        return matches.map(match => match.replace(/{{|}}/g, ''));
    }
}