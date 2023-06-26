import React, { useState, useEffect } from "react";
import { Card, Typography } from "@material-ui/core";

export default function ViewSharedFiles({contract, account}) {
  const [sharedFiles, setSharedFiles] = useState([]);

  useEffect(() => {
    const fetchFiles = async () => {
      const files = await contract.getSharedFiles();

      setSharedFiles(files);
    }
  
    if (contract && account) {
      fetchFiles();
    }
  }, [contract, account]);
  

  return (
    <Card style={{ margin: "20px", padding: "20px" }}>
      <Typography variant="h5">Shared Files</Typography>
      {sharedFiles.map(file => (
        <Typography key={file}>{file}</Typography>
      ))}
    </Card>
  );
}
