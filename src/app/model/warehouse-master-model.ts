import { CommonClass } from './commonClass';

export class MWarehouse extends CommonClass {
    WarehouseID: number;
    Description: string;
}
export class MWarehouseBin extends CommonClass {
    WarehouseID: number;
    Area: string;
    Section: string;
    Bin: string;
    Volume: number;
    Weight: number;
    CapacityUtilized: number;
}
export class MArticle extends CommonClass {
    Code: number;
    Description: string;
    NetWeight: number;
    Volume: number;
    UOM: string;
    SelfLifeDays: number;
    WarehouseID: number;
    Area: string;
    Section: string;
    Bin: string;
}

export class MUOM extends CommonClass {
    ID: number;
    Code: string;
    Description: string;
}

