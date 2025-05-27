import React from 'react';
import { Button, Modal, Box, Typography } from '@mui/material';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    p: 2,
    borderRadius: 2,
};

const InfoModal = ({ open, handleClose, handleAction, title, description }) => {
    return (
        <Modal
            open={open}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {title}
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    {description}
                </Typography>
                <Box display="flex" justifyContent="flex-end" mt={4} gap={1}>
                    <Button
                        variant="contained"
                        onClick={handleAction}
                        sx={{ textTransform: 'none' }}
                    >
                        Upgrade
                    </Button>
                    <Button variant="outlined" disableRipple onClick={handleClose} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default InfoModal;
