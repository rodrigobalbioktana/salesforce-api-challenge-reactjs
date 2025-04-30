import axios from "axios";
export async function upsertFls(metadataInfo : any){
    let response;
    try{
        response = await axios.post(`http://localhost:5000/salesforce/fls/set`, {
            data: {
                fls: Array.from(metadataInfo.values())
            }
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('AuthToken')}`
            }
        }
        );
        return response;
    } catch (err){
        console.error(err);
    }
} 