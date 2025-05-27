import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

const WarningDialouge = ({ message, onDelete, handleClose, open }) => {
  return (
    <Dialog
      open={open}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-message"
    >
      <DialogTitle color="red">Warning !</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-message">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onDelete}>Yes</Button>
        <Button onClick={handleClose}>No</Button>
      </DialogActions>
    </Dialog>
  );
};

export default WarningDialouge;
