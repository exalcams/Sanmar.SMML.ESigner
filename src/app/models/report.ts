import { Guid } from 'guid-typescript';

export class GateExitLogDetails {

    ID: number;
    InvoiceNumber: string;
    EWayBillNumber: string;
    ReferenceNO: string;
    Status: string;
    QRCodeScanTime: string;
    CREATED_BY: string;
    LASTMODIFIED_BY: string;
    CREATED_ON?: Date;
    LASTMODIFIED_ON?: Date;
    TAT:string;
    TAT_TIMESPAN_VAL:number;

}

export class ReportFilters {
    UserID: number;
    FROMDATE?: string;
    TODATE?: string;
    ON_OR_OFF: string;
    PLANT: string;
    EWAYBILL_NO: string;
}