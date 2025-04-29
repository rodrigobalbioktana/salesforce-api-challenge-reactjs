import axios from "axios";
export async function upsertFls(metadataInfo : any){
    let response;
    try{
        response = await axios.post(`http://localhost:5000/salesforce/fls/set`, metadataInfo,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('AuthToken')}`
            }
        }
        );
        console.log('RESPONSE ->', response);
        return response;
    } catch (err){
        console.error(err);
    }
} 