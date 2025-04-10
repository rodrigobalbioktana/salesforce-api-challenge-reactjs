import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import { useState } from 'react';
import { startOAuthFlow } from "../impl/oauthHandler";
function LoginPage() {

    const [isCustomUrl, setIsCustomUrl] : any = useState();
    const [customUrl, setCustomUrl] : any = useState();

    function loginProd(){
        setIsCustomUrl(false);
        //oauthLogin(PRODUCTION_URL);
    }

    function loginSandbox(){
        setIsCustomUrl(false);
        //oauthLogin(SANDBOX_URL);
        startOAuthFlow();
    }

    function loginCustomUrl(){
        setIsCustomUrl(true);
    }

    function setUrlInput(event : any){
        setCustomUrl(event.target.value);
    }

    function loginWithCustomUrl(){
        //oauthLogin(customUrl);
    }

    function customUrlForm(){
        return !isCustomUrl ? (<div></div>) :
        (<div className="customUrlForm">
            <TextField
                id="custom-url-input"
                label="Custom Login URL"
                variant="standard"
                onChange={setUrlInput}
            />
            <Button variant="outlined" onClick={loginWithCustomUrl}>Log In</Button>
        </div>);
    }

    return (
        <div className="LoginPage">
            <Stack spacing={2} direction="row">
                <Button variant="outlined" onClick={loginProd}>Production</Button>
                <Button variant="contained" onClick={loginSandbox}>Sandbox</Button>
                <Button variant="outlined" onClick={loginCustomUrl}>Custom URL</Button>
            </Stack>
            {customUrlForm()}
        </div>
    );
}

export default LoginPage;
