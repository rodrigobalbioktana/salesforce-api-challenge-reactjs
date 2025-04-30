import axios from "axios";
export function retrieveProfilesAndPermSets(){
    return axios.get(`http://localhost:5000/salesforce/fls/get`)
    .then(
        (res) => {
            return res.data;
        }
    ).catch(console.error);
} 