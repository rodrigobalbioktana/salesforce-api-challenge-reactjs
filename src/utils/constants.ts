const PICKLIST_OPTION_SEPARATOR : string = '|';
const BOOLEAN_STRING_OPTIONS : string[] = ['yes',
    'no',
    'true',
    'false'];
const BOOLEAN_STRING_TRUE_OPTIONS : string[] = ['yes',
    'true'];
const FIELD_API_NAME_HEADER : string = 'Field API Name';
const FIELD_LABEL_NAME_HEADER : string = 'Field Label';
const DATA_TYPE_HEADER : string = 'Data Type';
const HELP_TEXT_HEADER : string = 'Help Text';
const REQUIRED_HEADER : string = 'Is Required?';
const UNIQUE_HEADER : string = 'Is Unique?';
const CASE_SENSITIVE_HEADER : string = 'Is Case Sensitive?';
const EXTERNAL_ID_HEADER : string = 'Is ExternalId?';
const PICKLIST_OPTIONS_HEADER : string = 'Picklist Options';
const CLIENT_KEY : String | any = process.env.REACT_APP_SF_CONSUMER_KEY;
const CLIENT_SECRET : String | any  = process.env.REACT_APP_SF_CONSUMER_SECRET;
const SANDBOX_URL : String  = 'https://test.salesforce.com';
const PRODUCTION_URL : String  = 'https://login.salesforce.com';
const OAUTH_LOGIN_ENDPOINT : String  = '/services/oauth2/authorize?client_id={1}&redirect_uri={2}&response_type=code';
const LOCALHOST_URL : String | any = "http://localhost:3000/callback";

const TABLE_HEADERS : string [] = [
    FIELD_API_NAME_HEADER,
    FIELD_LABEL_NAME_HEADER,
    DATA_TYPE_HEADER,
    HELP_TEXT_HEADER,
    REQUIRED_HEADER,
    UNIQUE_HEADER,
    CASE_SENSITIVE_HEADER,
    EXTERNAL_ID_HEADER,
    PICKLIST_OPTIONS_HEADER
];

export {
    BOOLEAN_STRING_OPTIONS,
    BOOLEAN_STRING_TRUE_OPTIONS,
    CLIENT_KEY,
    CLIENT_SECRET,
    FIELD_API_NAME_HEADER, LOCALHOST_URL, OAUTH_LOGIN_ENDPOINT,
    PICKLIST_OPTION_SEPARATOR,
    PRODUCTION_URL,
    SANDBOX_URL,
    TABLE_HEADERS
};

