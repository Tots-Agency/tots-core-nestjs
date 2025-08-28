const { DateTime } = require("luxon");

import { TotsParamsService } from '../../src/services/params.service';

describe('Params Service', () => {
    it("should be correct mbLenght", () => {
        let params = {
            'name': 'John',
            'cars': ['Cruze', 'BMW', 'Audi', 'Mercedes']
        };
        let val = 'Hello {{name}}. mbLength({{cars}})';
        expect(TotsParamsService.processValue(val, params)).toBe('Hello John. ' + params.cars.length);
    });

    it("should be correct mbDate", () => {
        let params = {
            'date': '2021-01-01 00:00:00'
        };
        let val2 = 'Date formated: mbDate({{date}}, MM/dd/yyyy)';
        expect(TotsParamsService.processValue(val2, params)).toBe('Date formated: 01/01/2021');
    });

    it("should be correct mbNow", () => {
        let now = DateTime.now();
        let val3 = 'Date formated: mbNow(MM/dd/yyyy)';
        expect(TotsParamsService.processValue(val3, {})).toBe('Date formated: ' + now.toFormat('MM/dd/yyyy'));
    });

    it("should be correct mbStringify", () => {
        let params = {
            'data': {
                "test": "test"
            },
        };
        let val = 'This is a JSON mbStringify({{data}})';
        expect(TotsParamsService.processValue(val, params)).toBe('This is a JSON ' + JSON.stringify(params.data));
    });

    it("should be correct mbLastMonths", () => {
        let months = TotsParamsService.processValue('mbLastMonths(12)', {});
        expect(months.length).toBe(12);
    });

    it("should be correct mbSplit", () => {
        let params = {
            'string': '2021-04'
        };
        let data = TotsParamsService.processValue('mbSplit({{string}}, -)', params);
        expect(data[0]).toBe('2021');
        expect(data[1]).toBe('04');
    });

    it("should be correct mbGetIndex", () => {
        let params = {
            'data': ['2025', '08']
        };
        let data = TotsParamsService.processValue('mbGetIndex({{data}}, 0)', params);
        expect(data).toBe('2025');
    });

    it("should be correct mbGetIndex with variable", () => {
        let params = {
            'length': '1',
            'data': ['2025', '08']
        };
        let data = TotsParamsService.processValue('mbGetIndex({{data}}, {{length}})', params);
        expect(data).toBe('08');
    });

    it("should be correct mbParse", () => {
        let params = {
            'json_string': '{"test": "test_value"}'
        };
        let val = 'mbParse({{json_string}})';
        let data = TotsParamsService.processValue(val, params);
        expect(data.test).toBe('test_value');
    });
});