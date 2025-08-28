const { DateTime } = require("luxon");

export class PrimitiveFunctionsHelper {
    /**
     * mbStringify = Escapa los caracteres para que sean compatibles en un JSON
     */
    static PRIMITIVE_FUNCTIONS = ['mbLength', 'mbStringify', 'mbDate', 'mbNow', 'mbLastMonths', 'mbSplit', 'mbGetIndex', 'mbParse'];

    static runByString(val: string, globalParams: any): any {
        let internalVal = val;
        this.PRIMITIVE_FUNCTIONS.forEach(func => {
            internalVal = this.runFunction(func, internalVal, globalParams);
        });
        return internalVal;
    }

    static runFunction(functionName: string, val: any, globalParams: any): any {
        // Verify if val is a string
        if(val == undefined || typeof val != 'string'){
            return val;
        }

        let internalVal = val;
        // Buscar todas las ejecuciones de la funcion en el string
        const regex = new RegExp(`\\${functionName}\\(`, 'g');
        const matches = val.match(regex);

        if(matches == undefined){
            return internalVal;
        }

        let startPosition = 0;

        matches.forEach(match => {
            const paramsStartIndex = val.indexOf(match, startPosition) + match.length;
            const paramsEndIndex = val.indexOf(')', paramsStartIndex);
            const internalParams = val.slice(paramsStartIndex, paramsEndIndex);
            internalVal = this[functionName](internalVal, internalParams, globalParams);
            startPosition = paramsEndIndex;
        });

        return internalVal;
    }

    static mbLength(val: string, internalParams: any, globalParams: any): any {
        let matches = internalParams.match(/{{(.*?)}}/g);
        if(matches == undefined){
            return val;
        }

        let match = matches[0];
        let key = match.replace('{{', '').replace('}}', '');
        let data = this.processValueByKey(key, globalParams);

        return val.replace(`mbLength(${internalParams})`, data.length);
    }

    static mbStringify(val: string, internalParams: any, globalParams: any): any {
        let matches = internalParams.match(/{{(.*?)}}/g);
        if(matches == undefined){
            return val;
        }

        let match = matches[0];
        let key = match.replace('{{', '').replace('}}', '');
        let data = this.processValueByKey(key, globalParams);

        return val.replace(`mbStringify(${internalParams})`, JSON.stringify(data));
    }

    static mbDate(val: string, internalParams: any, globalParams: any): any {
        let dataInternal = internalParams.split(',');
        if(dataInternal.length != 2){
            return val;
        }

        let dateVal = dataInternal[0].trim();
        let matches = dateVal.match(/{{(.*?)}}/g);
        if(matches != undefined){
            let match = matches[0];
            let key = match.replace('{{', '').replace('}}', '');
            let dateMatchVar = this.processValueByKey(key, globalParams);
            dateVal = dateVal.replace(match, dateMatchVar);
        }

        // Create a date
        let date = DateTime.fromSQL(dateVal);

        let exportDataFormat = dataInternal[1].trim();
        let dateString = date.toFormat(exportDataFormat);

        return val.replace(`mbDate(${internalParams})`, dateString);
    }

    static mbNow(val: string, internalParams: any, globalParams: any): any {
        let date = DateTime.now();
        let matches = internalParams.match(/{{(.*?)}}/g);
        if(matches == undefined){
            return val.replace(`mbNow(${internalParams})`, date.toFormat(internalParams));
        }
        
        let match = matches[0];
        let key = match.replace('{{', '').replace('}}', '');
        let formatMatchVar = this.processValueByKey(key, globalParams);
        let exportDataFormat = internalParams.replace(match, formatMatchVar);
        let dateString = date.toFormat(exportDataFormat);
        return val.replace(`mbNow(${internalParams})`, dateString);
    }

    static mbLastMonths(val: string, internalParams: any, globalParams: any): any {
        let length = parseInt(val.replace('mbLastMonths(', '').replace(')', ''));

        let months = [];
        for(let i = 0; i < length; i++){
            months.push(DateTime.now().minus({months: i}).toFormat('yyyy-MM'));
        }

        return months;
    }

    static mbSplit(val: string, internalParams: any, globalParams: any): any {
        let dataInternal = internalParams.split(',');
        if(dataInternal.length != 2){
            return val;
        }

        let stringVal = dataInternal[0].trim();
        let matches = stringVal.match(/{{(.*?)}}/g);
        if(matches != undefined){
            let match = matches[0];
            let key = match.replace('{{', '').replace('}}', '');
            let dateMatchVar = this.processValueByKey(key, globalParams);
            stringVal = stringVal.replace(match, dateMatchVar);
        }

        return stringVal.split(dataInternal[1].trim());
    }

    static mbGetIndex(val: string, internalParams: any, globalParams: any): any {
        let dataInternal = internalParams.split(',');
        if(dataInternal.length != 2){
            return val;
        }

        let stringVal = dataInternal[0].trim();
        let matches = stringVal.match(/{{(.*?)}}/g);
        let dataArrayVar;
        if(matches != undefined){
            let match = matches[0];
            let key = match.replace('{{', '').replace('}}', '');
            dataArrayVar = this.processValueByKey(key, globalParams);
        }

        if(dataArrayVar == undefined || !Array.isArray(dataArrayVar)){
            throw new Error('Array not found');
        }

        let stringIndex = dataInternal[1].trim();
        let matchesIndex = stringIndex.match(/{{(.*?)}}/g);
        let index = dataInternal[1].trim();
        if(matchesIndex != undefined){
            let match = matchesIndex[0];
            let key = match.replace('{{', '').replace('}}', '');
            index = this.processValueByKey(key, globalParams);
        }

        return dataArrayVar[parseInt(index + '')];
    }

    static mbParse(val: string, internalParams: any, globalParams: any): any {
        let matches = internalParams.match(/{{(.*?)}}/g);
        if(matches == undefined){
            return val;
        }

        let match = matches[0];
        let key = match.replace('{{', '').replace('}}', '');
        let data = this.processValueByKey(key, globalParams);

        return JSON.parse(data);
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