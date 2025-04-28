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
import { ToastContainer, toast, Bounce } from 'react-toastify';
import { createNewObject } from "../impl/objectCreationHandler";
import { createCustomFields } from "../impl/customFieldCreationHandler";
import '../css/csvUploadHome.scss';

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
    let objectData : any;
    //let tableData : any = [];
    const [tableData, setTableData] : any = useState();
    const [fileName, setFileName] = useState();
    const [objectInfo, setObjectInfo] : any = useState();
    const [showCreateFields, setShowCreateFields] : any = useState();

  const fileReader = new FileReader();
  
  const prepareTableData = (fileData : String) => {
    const headerlessData : String [] = removeHeadersFromFile(fileData);
    objectData = createNewObjectWithFields(fileName, headerlessData);
    setTableData(objectData.objectFields);
    setObjectInfo(objectData);
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
    return !objectInfo ? (<div></div>) : 
    (<div className="displayFileInfo"> 
      <div className="fileName">File Uploaded: {objectInfo.objectApiName}.csv</div>
      <div className="objectName">Object Label: {objectInfo.objectLabel}</div>
      <div className="objectApiName">Object API Name: {objectInfo.objectApiName}</div>
    </div>);
  }

  async function createFields(event: any){
    const response : any = await createCustomFields(objectInfo);
    console.log("RESPONSE", response);
  }

  async function createObject(event : any) {
    const response : any = await createNewObject(objectInfo);
    if(response.data.errors.length == 0){
      toast.success('Success! Object Created', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce,
      });
      setShowCreateFields(true);
    } else {
      const errorMessage = response.data.errors[0].message;
      toast.error('Error while creating new object!. ' + errorMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
        transition: Bounce
      });
      if(response.data.errors[0].statusCode.includes("DUPLICATE")){
        setShowCreateFields(true);
      } else {
        setShowCreateFields(false);
      }
    }
  }


  return (
    <div className='csvUploadHome'>
        <ToastContainer 
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick={false}
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Bounce}
        />
        <div className="imgTitle"></div>
        <div className="buttonBar">
            <Button
                component="label"
                role={undefined}
                variant="text"
                tabIndex={-1}
                startIcon=""
            >
                <div className="imgUploadCSV"></div>
                <VisuallyHiddenInput
                    type="file"
                    onChange={handleOnChange}
                    multiple
                />
            </Button>
            <Button variant="text" onClick={(e : any) => {
                handleOnSubmit(e);
            }}>
                <div className="imgProcessCSV"></div>
            </Button>
        </div>
        {displayFileInfo()}
        {buildTable()}
        <Button variant="text" onClick={(e : any) => {
            createObject(e);
        }}>
            <div className="imgCreateObject"></div>
        </Button>
        <Button variant="text" onClick={(e : any) => {
            createFields(e);
        }}>
            <div className="imgCreateFields"></div>
        </Button>
    </div>
  );
}

export default CSVUploadHome;
