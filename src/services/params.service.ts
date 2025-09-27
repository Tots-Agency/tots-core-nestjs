import { PrimitiveFunctionsHelper } from "../helpers/primitive_functions.helper";

export class TotsParamsService {

    static getByKey(params: any, key: string) {
        if(key.search(/\./) > -1){
            return TotsParamsService.processValueByKey(key, params);
        }
        
        return params[key];
    }

    static processValue(val: string|undefined, params: any): string {
        if(val == undefined||val == ''||val == null){
            return;
        }

        // Create new value for process
        let valNew = val;

        valNew = PrimitiveFunctionsHelper.runByString(valNew, params);

        // Verify if a string
        if(valNew == undefined || valNew == null || typeof valNew !== 'string'){
            return valNew;
        }

        let matches = val.match(/{{(.*?)}}/g);
        if(matches == undefined){
            return valNew;
        }

        for(let match of matches) {
            let key = match.replace('{{', '').replace('}}', '');
            if(key.search(/\./) > -1) {

                let valueNested = this.processValueByKey(key, params);
                if(Array.isArray(valueNested) || typeof valueNested === 'object') {
                    valNew = valNew.replace(match, JSON.stringify(valueNested));
                } else {
                    valNew = valNew.replace(match, valueNested);
                }

            } else if(params[key] != undefined && (Array.isArray(params[key]) || typeof params[key] === 'object')) {
                valNew = valNew.replace(match, JSON.stringify(params[key]));
            } else if(params[key] != undefined){
                valNew = valNew.replace(match, params[key]);
            } else {
                valNew = valNew.replace(match, '');
            }
        }

        if(valNew == ''){
            return null;
        }

        return valNew;
    }

    static processValueByKey(key: string, params: any): any {
        // Split key with .
        let keys = key.split('.');

        // Loop through keys
        let value = undefined;
        for(let key of keys) {
            if(value == undefined){
                value = params[key];
            } else {
                value = value[key];
            }
        }

        return value;
    }
}