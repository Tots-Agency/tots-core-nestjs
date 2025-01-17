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

        let matches = val.match(/{{(.*?)}}/g);
        if(matches == undefined){
            return valNew;
        }

        for(let match of matches) {
            let key = match.replace('{{', '').replace('}}', '');
            if(key.search(/\./) > -1) {
                valNew = valNew.replace(match, this.processValueByKey(key, params));
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