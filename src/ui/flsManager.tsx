import '../css/flsManager.scss';
import { retrieveProfilesAndPermSets } from '../impl/flsRetriever';
import React, { useEffect, useState } from 'react';
import Modal from 'react-modal';
import Button from '@mui/material/Button';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import axios from "axios";
import { upsertFls } from '../impl/flsUpserter';


const customStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      height: '90%'
    },
  };

function FLSManager(props : any) {
    const [flsInfo, setFlsInfo] : any = useState();
    const [modalIsOpen, setIsOpen] : any = useState();
    const [isLoading, setIsLoading] : any = useState();
    const [collapsePermsSets, setCollapsePermsSets] : any = useState();
    const [collapseProfiles, setCollapseProfiles] : any = useState();
    let permissions : Map<String, any> = new Map<String, any>();

    function openModal() {
        setIsOpen(true);
    }

    function collapsePerms(){
        setCollapsePermsSets(true);
    }

    function expandPerms(){
        setCollapsePermsSets(false);
    }

    function collapseProf(){
        setCollapseProfiles(true);
    }

    function expandProf(){
        setCollapseProfiles(false);
    }

    function afterOpenModal(){
        if(!flsInfo){
            axios.get(`http://localhost:5000/salesforce/fls/get`)
            .then(
                (res) => {
                    setFlsInfo(res.data);
                    setIsLoading(false);
                }
            ).catch(console.error);
        }
    }

    function closeModal() {
        setIsOpen(false);
    }

    function handleInputChange(e : any){
        const fieldInfo = e.target.id.split('%');
        const fullName = `${props.objectInfo.objectApiName}.${fieldInfo[0]}`;
        const metadataType = fieldInfo[3];

        if(!permissions.has(fullName)){
            permissions.set(
                fullName,
                {
                    fullName,
                    fieldPermissions: [
                        {
                            editable: fieldInfo[2] == 'editable' && e.target.checked,
                            readable: fieldInfo[2] == 'readable' && e.target.checked,
                            name: fieldInfo[1],
                            metadataType
                        }
                    ]
                }
            );
        } else {
            let flsActualInfo = permissions.get(fullName);
            let newPerm = true;
            flsActualInfo.fieldPermissions.forEach(
                (perm : any) => {
                    if(perm.name == fieldInfo[1]){
                        newPerm = false;
                        perm.editable = fieldInfo[2] == 'editable' ? e.target.checked : perm.editable;
                        perm.readable = fieldInfo[2] == 'readable' ? e.target.checked : perm.readable;
                    }
                }
            );
            if(newPerm){
                flsActualInfo.fieldPermissions.push(
                    {
                        editable: fieldInfo[2] == 'editable' && e.target.checked,
                        readable: fieldInfo[2] == 'readable' && e.target.checked,
                        name: fieldInfo[1],
                        metadataType
                    }
                );
            }
        }
    }

    function buildTableHeader(){
        return (
            <TableHead>
                <TableRow>
                    <TableCell>Field Name</TableCell>
                    <TableCell>Is Readable?</TableCell>
                    <TableCell>Is Editable?</TableCell>
                </TableRow>
            </TableHead>
        );
    }

    function buildTableContent(profileOrPermsSetName : string, permSetOrProfile : string){
        return(
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    {buildTableHeader()}
                    <TableBody>
                        {props.objectInfo.objectFields.filter((r : any) => !r.required).map((row : any) => (
                            <TableRow
                                key={row.fieldApiName}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.fieldLabel}
                                </TableCell>
                                <TableCell align="left">
                                    <input type='checkbox' 
                                           id={`${row.fieldApiName}%${profileOrPermsSetName}%readable%${permSetOrProfile}`} 
                                           onChange={(e : any) => {handleInputChange(e);}}/>
                                </TableCell>
                                <TableCell align="left">
                                    <input type='checkbox' 
                                            id={`${row.fieldApiName}%${profileOrPermsSetName}%editable%${permSetOrProfile}`}
                                            onChange={(e : any) => {handleInputChange(e);}}/>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        );
    }

    function buildPermsSetsTable(){
        return(
            <div hidden={collapsePermsSets} className="permsSetsTable">
                {flsInfo.permissionSets.map(
                    (permSet : any) => {
                        return(<div id={`permSet-${permSet.id}`}>
                            <div className="flsName">
                                {permSet.fullName}
                            </div>
                            {buildTableContent(permSet.fullName, 'PermissionSet')}
                        </div>);
                    }
                )}
            </div>
        );
    }

    function buildProfilesTable(){
        return(
            <div hidden={collapseProfiles} className="profilesTable">
                {flsInfo.profiles.map(
                    (profile : any) => {
                        return (<div id={`profile-${profile.id}`}>
                            <div className="flsName">
                                {profile.fullName}
                            </div>
                            {buildTableContent(profile.fullName, 'Profile')}
                        </div>);
                    }
                )}
            </div>
        );
    }

    async function updatePermSetsAndProfiles(){
        const result = await upsertFls(permissions);
        console.log(result);
    }

    function buildTableModal() : any{
        if(props.objectInfo && flsInfo){
            return (
                <div className="modalbdy">
                    <div className="modalTitle"></div>
                    <div className="modalContent">
                        <div className="permsSetsTable">
                            <div className="headerTopic">
                                {collapsePermsSets && <KeyboardArrowDownIcon className='collapseBtn' fontSize='large' onClick={() => {expandPerms();}}/>}
                                {!collapsePermsSets && <KeyboardArrowRightIcon className='collapseBtn' fontSize='large' onClick={() => {collapsePerms();}}/>}
                                <div className="flsTitle">Permission Sets</div>
                            </div>
                            {buildPermsSetsTable()}
                        </div>
                        <div className="profilesTable">
                            <div className="headerTopic">
                                {collapseProfiles && <KeyboardArrowDownIcon className='collapseBtn' fontSize='large' onClick={() => {expandProf();}}/>}
                                {!collapseProfiles && <KeyboardArrowRightIcon className='collapseBtn' fontSize='large' onClick={() => {collapseProf();}}/>}
                                <div className="flsTitle">Profiles</div>
                            </div>
                            {buildProfilesTable()}
                        </div>
                    </div>
                    <div className='buttonBar'>
                        <Button variant="contained" onClick={(e : any) => {
                            updatePermSetsAndProfiles();
                        }}>
                            Update FLS
                        </Button>
                        <Button variant="outlined" onClick={(e : any) => {
                            permissions = new Map<String, any>();
                            closeModal();
                        }}>
                            Cancel
                        </Button>
                    </div>
                </div>
            );
        }
        return <div>Loading...</div>;
    }

    return (
        <div className="manageFLSModal">
            <Button variant="text" onClick={(e : any) => {
                openModal();
            }}>
                <div className="manageFLSBTN"></div>
            </Button>
            <Modal
                isOpen={modalIsOpen}
                onAfterOpen={afterOpenModal}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Manage FLS"
            >
                <div className="modalBody">
                    {buildTableModal()}
                </div>

            </Modal>
        </div>
    );
}
  
export default FLSManager;