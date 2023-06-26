import React, { useState } from 'react';
import { Contract } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { create as ipfsClient } from 'ipfs-http-client';
import FileStorage from './FileStorage.json';
import { Buffer } from 'buffer';
import { Container, Grid, Paper, Typography, Button, TextField, Checkbox, FormControlLabel, makeStyles } from '@material-ui/core';
import FileViewer from 'react-file-viewer';
import './App.css';
import ShareFile from './ShareFile';
import ViewSharedFiles from './ViewSharedFiles';

const CONTRACT_ADDRESS = '0x..';
const API_KEY = 'YOUR_API_KEY';
const API_KEY_SECRET = 'YOUR_API_KEY_SECRET';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));

function FileSection({ title, files }) {
  return (
    <div>
      <h3>{title}</h3>
      {files.map((file, index) => (
        <div key={index}>
          <p>{file.name}</p>
        </div>
      ))}
    </div>
  );
}

function App() {
  const classes = useStyles();
  const [ipfs, setIpfs] = useState(null);
  const [provider, setProvider] = useState(null);
  const [fileStorage, setFileStorage] = useState(null);
  const [buffer, setBuffer] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [fileHash, setFileHash] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [account, setAccount] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const init = async () => {
      setIpfs(
        ipfsClient({
          host: 'ipfs.infura.io',
          port: 5001,
          protocol: 'https',
          headers: {
            authorization: 'Basic ' + Buffer.from(API_KEY + ':' + API_KEY_SECRET).toString('base64'),
          },
        })
      );

      if (window.ethereum) {
        const newProvider = new Web3Provider(window.ethereum);
        setProvider(newProvider);

        const signer = await newProvider.getSigner();
        const newFileStorage = new Contract(CONTRACT_ADDRESS, FileStorage.abi, signer);

        const accounts = await newProvider.listAccounts();
        setAccount(accounts[0]);

        setFileStorage(newFileStorage);
      }

      setLoading(false);
    };

    init();
  }, []);

  const captureFile = (event) => {
    event.preventDefault();
  
    const file = event.target.files[0];
    if (!file) {
      console.error("No file selected");
      return;
    }
  
    const reader = new FileReader();
  
    reader.onloadend = () => {
      const buf = Buffer.from(reader.result);
      console.log('File data:', buf); // add this
      setBuffer(buf);
    };
  
    setSelectedFile(file);
    reader.readAsArrayBuffer(file);
  };
  

  const uploadFile = async (event) => {
    event.preventDefault();
    console.log('Uploading file...');
    try {
      const added = await ipfs.add(buffer); // use buffer instead of file
      console.log('File uploaded to IPFS, hash:', added.path);
      const result = await fileStorage.addFile(added.path, isPublic);

      console.log('File uploaded to Ethereum, result:', result);
    } catch (error) {
      console.log('Error uploading file:', error);
    }
  };
  
  

  const verifyFile = async () => {
    if (!fileStorage || !fileHash) return;

    try {
      const fileData = await fileStorage.getFile(fileHash);
      console.log("File data from smart contract:", fileData);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const images = files.filter(file => file.type.startsWith('image/'));
  const documents = files.filter(file => file.type.startsWith('text/') || file.type === 'application/pdf');
  const others = files.filter(file => !images.includes(file) && !documents.includes(file));

  return (
    <Container>
      <Typography variant="h4" component="h1">Celo-based Decentralized File Sharing Storage</Typography>
      <Grid container spacing={3}>
        {loading ? (
          <Typography variant="h5">Loading...</Typography>
        ) : (
          <>
            <Grid item xs={12} sm={6}>
              <Paper className={classes.paper}>
                <ShareFile contract={fileStorage} account={account} />
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper className={classes.paper}>
                <ViewSharedFiles contract={fileStorage} account={account} />
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
      <div>
        <h2>File Preview</h2>
        {selectedFile && (
          <FileViewer
            fileType={selectedFile.type.split('/')[1]}
            filePath={URL.createObjectURL(selectedFile)}
          />
        )}
        <input type="file" onChange={captureFile} />
        <Button variant="contained" color="primary" onClick={uploadFile}>Upload File</Button>

      </div>
      <FileSection title="Images" files={images} />
      <FileSection title="Documents" files={documents} />
      <FileSection title="Others" files={others} />
    </Container>
  );
}

export default App;
