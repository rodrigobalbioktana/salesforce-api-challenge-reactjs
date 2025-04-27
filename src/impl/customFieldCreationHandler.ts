import axios from "axios";
export async function createCustomFields(objectDefinition : any){
    let response;
    try{
        response = await axios.post(`http://localhost:5000/salesforce/createFields`, {
            fieldsData: {
                objectApiName: objectDefinition.objectApiName,
                fields: objectDefinition.objectFields
            }
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('AuthToken')}`
            }
        }
        );
        console.log('RESPONSE', response);
        return response;
    } catch (err){
        console.error(err);
    }
} 