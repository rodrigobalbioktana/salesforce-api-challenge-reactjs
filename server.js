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

        res.send(`
            <h1> Auth Success </h1>
            <p> User Id: ${userInfo.id} </p>
            <p> Access token ${conn.accessToken.substring(0, 20)} </p>
            <p> You can now make API request using the /api endpoint <p>
            <a href="http://localhost:3000?userId=${userInfo.id}&authToken=${conn.accessToken}&instanceUrl=${userInfo.url}">Go To App</a>
        `);
    } catch (err){
        console.error(err);
        res.status(500).send("Auth failed");
    }
});

app.post("/salesforce/createObject", async (req, res) => {
    try{
        console.log(req);
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
        console.log(req);
        const newObject = req.body;
        const results = [];
        newObject.fieldsData.fields.forEach(
            async (newField) => {
                const newFieldData = {
                    fullName: `${newObject.fieldsData.objectApiName}.${newField.fieldApiName}__c`,
                    label: newField.fieldLabel,
                    type: newField.dataType,
                    required: newField.require || false,
                    inlineHelpText: newField.helpText,
                    caseSensitive: newField.caseSensitive || false,
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
                        newFieldData.precision = 3;
                        break;
                    case "Currency":
                        newFieldData.scale = 3;
                        newFieldData.precision = 3;
                        break;
                    case "Picklist": newFieldData.valueSet = newField.picklistOptions;
                        break;
                    case "Lookup":
                        newFieldData.referenceTo = newField.fieldLabel;
                        newFieldData.relationshipName = newField.fieldLabel;
                        break;
                    case "URL":
                        newFieldData.type = "Text";
                        newFieldData.length = 255;
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
            }
        );
        
        res.send(results);
    } catch(err){
        console.error(err);
        res.status(500).send(err);
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log('Server running on PORT: '+PORT);
});