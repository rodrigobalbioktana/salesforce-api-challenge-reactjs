require("dotenv").config();
const express = require("express");
const jsforce = require("jsforce");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let instanceUrl = '';
let authToken = '';
let userId = '';
let conn;

const oauth2 = new jsforce.OAuth2(
    {
        clientId: process.env.SF_CLIENT_ID,
        clientSecret: process.env.SF_CLIENT_SECRET,
        redirectUri: "http://localhost:5000/oauth/callback",
        loginUrl: process.env.SF_LOGIN_URL
    }
);

const connections = {};

app.get("/oauth/auth", (req, res) => {
    const authUrl = oauth2.getAuthorizationUrl(
        {
            scope: "api id web refresh_token"
        }
    );
    res.redirect(authUrl);
});

app.get("/oauth/callback", async (req, res) => {
    try{
        const { code } = req.query;
        if(!code){
            return res.status(400).send('Auth code missing');
        }
        conn = new jsforce.Connection({oauth2});
        const userInfo = await conn.authorize(code);

        instanceUrl = conn.instanceUrl;
        authToken = userInfo.id;
        userId = conn.accessToken;

        connections[userInfo.id] = conn;

        res.send(`<html><head></head><body style="margin-top: 8rem; display: flex; flex-direction: column; justify-content: center; align-items: center; font-family: sans-serif; background-color: #000000e8; color: white;">
            <h1 style="margin-bottom: 70px;"> Auth Success </h1>
            <p> User Id: ${userInfo.id} </p>
            <p> Access token ${conn.accessToken.substring(0, 20)} </p>
            <a style="margin-top: 8rem; color: white; text-decoration: none; border: 1px solid white; padding: 1rem 2rem; border-radius: 10px;"href="http://localhost:3000?userId=${userInfo.id}&authToken=${conn.accessToken}&instanceUrl=${userInfo.url}">Go To App</a>
            </body></html>
        `);
    } catch (err){
        console.error(err);
        res.status(500).send("Auth failed");
    }
});

app.post("/salesforce/createObject", async (req, res) => {
    try{
        const newObject = req.body;
        const result = await conn.metadata.create('CustomObject', req.body.objectDefinition);
        res.send(result);
    } catch(err){
        console.error(err);
        res.status(500).send(err);
    }
});

app.post("/salesforce/createFields", async (req, res) => {
    try{
        const newObject = req.body;
        const results = [];
        newObject.fieldsData.fields.forEach(
            async (newField) => {
                const newFieldData = {
                    fullName: `${newObject.fieldsData.objectApiName}.${newField.fieldApiName}${newField.fieldApiName.includes('__c') ? '' : '__c'}`,
                    label: newField.fieldLabel,
                    type: newField.dataType,
                    required: newField.required || false,
                    inlineHelpText: newField.helpText,
                    caseSensitive: (newField.unique && newField.caseSensitive) || false,
                    unique: newField.unique || false,
                    externalId: newField.externalId || false
                };
                switch (newField.dataType){
                    case "Text": newFieldData.length = 255;
                        break;
                    case "TextArea": newFieldData.length = 255;
                        break;
                    case "LongTextArea":
                        newFieldData.visibleLines = 3;
                        newFieldData.length = 32000;
                        break;
                    case "Number":
                        newFieldData.scale = 3;
                        newFieldData.precision = 18;
                        break;
                    case "Currency":
                        newFieldData.scale = 3;
                        newFieldData.precision = 18;
                        break;
                    case "Picklist": 
                        newFieldData.valueSet = createValueSet(newField.picklistOptions);
                        newFieldData.caseSensitive = false;
                        break;
                    case "Lookup":
                        newFieldData.referenceTo = newField.fieldLabel;
                        newFieldData.relationshipName = newField.fieldLabel;
                        break;
                    case "MasterDetail":
                        newFieldData.referenceTo = newField.fieldLabel;
                        newFieldData.relationshipName = newField.fieldLabel;
                        break;
                    case "URL":
                        newFieldData.type = "Text";
                        newFieldData.length = 255;
                        break;
                    case "Boolean":
                        newFieldData.type = "Checkbox";
                        newFieldData.defaultValue = false;
                        newFieldData.required = false;
                        break;
                    case "Long Text":
                        newFieldData.type = "LongTextArea";
                        newFieldData.visibleLines = 3;
                        newFieldData.length = 32000;
                        break;
                    default:
                        break;
                }
                const result = await conn.metadata.create('CustomField', newFieldData);
                results.push(result);
                console.log('RESULTS -> ', result);
            }
        );
        res.send(results);
    } catch(err){
        console.error(err);
        res.status(500).send(err);
    }
});

function createValueSet(picklistOpts){
    return {
        valueSetDefinition: {
            value: picklistOpts.map(
                item => ({
                    fullName: item.trim(),
                    default: false,
                    label: item,
                    isActive: true
                })
            )
        }
    };
}

const PORT = 5000;
app.listen(PORT, () => {
    console.log('Server running on PORT: '+PORT);
});

