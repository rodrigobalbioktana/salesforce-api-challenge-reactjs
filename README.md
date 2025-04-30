# Super Object Manager APP
## 🔍 Pre-requisite
#### 1. 🔗 Create a Salesforce Connected App
Refer to this link https://help.salesforce.com/s/articleView?id=xcloud.connected_app_create.htm&type=5 to set up a connect app.

🚨 Important!: the redirect url for the connected app must be http://localhost:5000/oauth/callback and the OAUTH2.0 must be enabled.
#### 2. 🛠 Set Credentials to the `.env` File
Before running the servers, the `.env` file must be filled with the Client Id, Client Secret (from the connected app) and Login Url of the org.

Refer to this link on how to retrieve client secret and client id from the connect app 
#### 3. 🦾 Install the necessary modules
Run the command `npm i` on the root folder of the project to install all the necessary dependencies 


## 🏃 Run the App
#### 1. 🛣 Run the server
To run the app, in a terminal that is located in the root path of the project, run the command `npm run superobjectmanager`. 

#### 2. ✍️ Link To Authenticate
Open a new browser window, and go to the http://localhost:5000/oauth/auth . This will authenticate against the org.

#### 3. 📱 Use the App
After being authenticated, click on the button "Go to App", you will be redirected to the Super Object Manager App, where you can create and add new custom objects and fields.
