import CheckSharpIcon from '@mui/icons-material/CheckSharp';
import ClearSharpIcon from '@mui/icons-material/ClearSharp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useState } from 'react';
import { TABLE_HEADERS } from '../utils/constants';
import { createNewObjectWithFields, removeHeadersFromFile } from '../utils/utils';
import { CSVObjectWrapper } from "../wrappers/csvObjectWrapper";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

function CSVUploadHome() {
    const [file, setFile] = useState();
    const [csvOutput, setCsvOutput] = useState();
    let objectData : CSVObjectWrapper;
    //let tableData : any = [];
    const [tableData, setTableData] : any = useState();
    const [fileName, setFileName] = useState();

  const fileReader = new FileReader();
  
  const prepareTableData = (fileData : String) => {
    const headerlessData : String [] = removeHeadersFromFile(fileData);
    objectData = createNewObjectWithFields(fileName, headerlessData);
    setTableData(objectData.objectFields);
  }

  const handleOnChange = (e : any) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  const handleOnSubmit = (e : any) => {
    e.preventDefault();

    if (file) {
      fileReader.onload = function (event : any) {
        setCsvOutput(event.srcElement.result);
        prepareTableData(event.srcElement.result);
      };
      fileReader.readAsText(file);
    }
  };

  function buildCheckMark(booleanValue : Boolean) : any {
    return booleanValue ? <CheckSharpIcon/> : <ClearSharpIcon/>;
  }

  function buildTable() : any {
    if(tableData){
        return (
            <div className="csvPreview">
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            {TABLE_HEADERS.map(
                                (tableHeader) => (
                                    <TableCell>{tableHeader}</TableCell>
                                )
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableData.map((row : any) => (
                            <TableRow
                                key={row.fieldApiName}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell component="th" scope="row">
                                    {row.fieldApiName}
                                </TableCell>
                                <TableCell align="center">{row.fieldLabel}</TableCell>
                                <TableCell align="center">{row.dataType}</TableCell>
                                <TableCell align="center">{row.helpText}</TableCell>
                                <TableCell align="center">{buildCheckMark(row.required)}</TableCell>
                                <TableCell align="center">{buildCheckMark(row.unique)}</TableCell>
                                <TableCell align="center">{buildCheckMark(row.caseSensitive)}</TableCell>
                                <TableCell align="center">{buildCheckMark(row.externalId)}</TableCell>
                                <TableCell align="center">{row.picklistOptionsLabel}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
        );
    }
    return (<div></div>);
  }

  function displayFileInfo() : any{
    return !objectData ? (<div></div>) : 
    (<div> File Uploaded: {objectData.objectApiName} </div>);
  }


  return (
    <div className='csvUploadHome'>
        <h1>Salesforce Super Object Manager</h1>
        <div>
            <Button
                component="label"
                role={undefined}
                variant="contained"
                tabIndex={-1}
                startIcon={<CloudUploadIcon />}
            >
                Upload File
                <VisuallyHiddenInput
                    type="file"
                    onChange={handleOnChange}
                    multiple
                />
            </Button>
            {displayFileInfo()}
            <Button variant="outlined" onClick={(e : any) => {
                handleOnSubmit(e);
            }}>
                Process CSV File
            </Button>
        </div>
        {buildTable()}
    </div>
  );
}

export default CSVUploadHome;
