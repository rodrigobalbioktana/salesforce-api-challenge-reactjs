import { CSVFieldWrapper } from "../wrappers/csvFieldWrapper";
import { CSVObjectWrapper } from "../wrappers/csvObjectWrapper";
import { BOOLEAN_STRING_OPTIONS, BOOLEAN_STRING_TRUE_OPTIONS, FIELD_API_NAME_HEADER, PICKLIST_OPTION_SEPARATOR } from "./constants";

function processPicklistOptions(picklistOptions : String) : String[] {
    let theOptions : String[] = [];
    if(picklistOptions == null || picklistOptions == ''){
        return theOptions;
    }
    if(picklistOptions.includes(PICKLIST_OPTION_SEPARATOR)){
        theOptions = picklistOptions.split(PICKLIST_OPTION_SEPARATOR);
    } else {
        theOptions.push(picklistOptions);
    }
    return theOptions;
}

function parseBoolean(toParse : String) : Boolean {
    return toParse != null && 
           toParse != '' && 
           (
            toParse == 'Yes' || 
            toParse == 'yes' || 
            toParse == 'YES' ||
            toParse == 'true' ||
            toParse == 'True' ||
            toParse == 'TRUE'
        );
}

function fileHasHeaders(fileContent : String) : Boolean {
    const fileData : String[] = fileContent.split('\r\n');
    return fileData.length > 0 && fileData[0].toLowerCase().trim().includes(FIELD_API_NAME_HEADER.toLowerCase().trim());
}

function removeHeadersFromFile(fileContent : String | any) : String[] | any{
    if(!fileHasHeaders(fileContent)) return fileContent.split('\r\n');
    const dataArray : String[] = fileContent.split('\r\n');
    dataArray.reverse().shift();
    return dataArray;
}

function createNewObjectWithFields(objectApiName : String | any, fieldsContent : String[] | any) : CSVObjectWrapper{
    const objectToUpsert : CSVObjectWrapper = new CSVObjectWrapper();
    objectToUpsert.objectApiName = objectApiName.replace('.csv','');
    objectToUpsert.objectLabel = objectApiName.replace('.csv','').replace('__c', '').replaceAll('_', ' ');
    const objectFields : CSVFieldWrapper[] = [];
    fieldsContent.forEach(
        (fieldContent : String) => {
            const newDataField : CSVFieldWrapper | null = createNewField(fieldContent);
            if(newDataField != null){
                objectFields.push(newDataField);
            }
        }
    );
    objectToUpsert.objectFields = objectFields;
    return objectToUpsert;
}

function createNewField(fieldContent : String) : CSVFieldWrapper | null{
    const fieldToInsert : CSVFieldWrapper = new CSVFieldWrapper();
    const fieldProps = fieldContent.split(',');
    if(fieldProps[0].trim().toLowerCase().includes(FIELD_API_NAME_HEADER.trim().toLowerCase()) || fieldProps.length < 1) return null;
    /**
     * fieldProps[0] => API Name
     * fieldProps[1] => Label
     * fieldProps[2] => Data Type
     * fieldProps[3] => Help Text
     * fieldProps[4] => Required
     * fieldProps[5] => Unique
     * fieldProps[6] => Case Sensitive
     * fieldProps[7] => External ID
     * fieldProps[8] => Picklist Options
     */
    fieldToInsert.fieldApiName = fieldProps[0];
    fieldToInsert.fieldLabel = fieldProps[1];
    fieldToInsert.dataType = fieldProps[2];
    fieldToInsert.helpText = fieldProps[3];
    fieldToInsert.required = parseBoolean(fieldProps[4]);
    fieldToInsert.unique = parseBoolean(fieldProps[5]);
    fieldToInsert.caseSensitive = parseBoolean(fieldProps[6]);
    fieldToInsert.externalId = parseBoolean(fieldProps[7]);
    fieldToInsert.requiredLabel = booleanValueLabel(fieldToInsert.required);
    fieldToInsert.uniqueLabel = booleanValueLabel(fieldToInsert.unique);
    fieldToInsert.caseSensitiveLabel = booleanValueLabel(fieldToInsert.caseSensitive);
    fieldToInsert.externalIdLabel = booleanValueLabel(fieldToInsert.externalId);

    if(fieldProps.length == 9){
        fieldToInsert.picklistOptions = processPicklistOptions(fieldProps[8]);
        fieldToInsert.picklistOptionsLabel = fieldProps[8].replaceAll('|', ',');
    }

    return fieldToInsert;
}

function booleanValueLabel(booleanValue : Boolean) : String {
    return booleanValue.toString().toLowerCase().toLocaleUpperCase();
}

export { createNewObjectWithFields, fileHasHeaders, parseBoolean, processPicklistOptions, removeHeadersFromFile };

export class Utils {

}