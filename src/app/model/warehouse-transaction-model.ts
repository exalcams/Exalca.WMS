import { CommonClass } from './commonClass';

export class GRNHead extends CommonClass {
    GRNumber: number;
    Vendor: string;
    TruckNumber: string;
    ChallanNumber: string;
    ChallanDate?: Date;
}
export class GRNItem extends CommonClass {
    GRNumber: number;
    Code: number;
    Description: string;
    Batch: string;
    Quantity: number;
    UOM: string;
    ManufacturedDate: Date;
    ExpiredDate?: Date;
}
export class Stock extends CommonClass {
    StockID: number;
    WarehouseID: number;
    Code: number;
    Batch: string;
    Quantity: number;
    UOM: string;
    ExpiredDate?: Date;
}
export class StockBin extends CommonClass {
    StockID: number;
    WarehouseID: number;
    Code: number;
    Batch: string;
    Quantity: number;
    UOM: string;
    ExpiredDate?: Date;
}
export class BinToBinTransfer extends CommonClass {
    TransferID: number;
    Code: number;
    SourceBin: string;
    DestinationBin: string;
    Quantity: number;
}
export class OutboundHeader extends CommonClass {
    OutboundID: number;
    Customer: string;
    TransferID: string;
    Date?: Date;
}
export class OutboundItem extends CommonClass {
    OutboundID: number;
    Code: number;
    Description: string;
    Batch: string;
    Quantity: number;
    UOM: string;
}
export class PhysicalInventoryHead extends CommonClass {
    TransID: number;
    Date?: Date;
    WarehouseID: number;
    Area: string;
    Section: string;
    Bin: string;
}
export class PhysicalInventoryItem extends CommonClass {
    TransID: number;
    Code: number;
    SystemQuantity: number;
    ActualQuantity: number;
    Difference: number;
    Reason: string;
}
