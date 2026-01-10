export abstract class BaseModelDto {
    static fromModel(model: any): BaseModelDto {
        return model;
    }
}
