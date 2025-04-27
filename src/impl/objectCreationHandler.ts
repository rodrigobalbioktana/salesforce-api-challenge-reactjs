import axios from "axios";
export async function createNewObject (objectDefinition : any) {
    let response;
    try{
        response = await axios.post(`http://localhost:5000/salesforce/createObject`, {
            objectDefinition : {
                fullName: `${objectDefinition.objectApiName}`,
                label: objectDefinition.objectLabel,
                pluralLabel: objectDefinition.objectLabel + 's',
                nameField: {
                    type: 'Text',
                    label: 'Name'
                },
                deploymentStatus: 'Deployed',
                sharingModel: "ReadWrite",
                description: 'Description'
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