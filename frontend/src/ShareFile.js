import React, { useState } from "react";
import { Card, TextField, Button, Typography, Grid } from "@material-ui/core";

export default function ShareFile({contract, account}) {
  const [fileHash, setFileHash] = useState('');
  const [recipient, setRecipient] = useState('');

  const shareFile = async () => {
    const result = await contract.shareFile(fileHash, recipient);

    console.log(result);
  }

  return (
    <Card style={{ margin: "20px", padding: "20px" }}>
      <Typography variant="h5">Share File</Typography>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="File Hash"
            variant="outlined"
            value={fileHash}
            onChange={e => setFileHash(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Recipient Address"
            variant="outlined"
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
          />
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={shareFile}>Share File</Button>
        </Grid>
      </Grid>
    </Card>
  );
}
