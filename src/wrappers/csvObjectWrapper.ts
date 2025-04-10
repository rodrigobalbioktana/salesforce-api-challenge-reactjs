import { CSVFieldWrapper } from './csvFieldWrapper';
export class CSVObjectWrapper {
    objectApiName : String | undefined;
    objectLabel : String | undefined;
    objectFields : CSVFieldWrapper[] | undefined | any;
    isUpdate : Boolean | undefined;
}
