import express from 'express';
import { getAllContacts, getContactById, addContact, updateContact, deleteContact } from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js'

const router = express.Router();


router.get('/', getAllContacts); 
router.get('/:contactId', getContactById); 
router.post('/', ctrlWrapper(addContact));
router.patch('/:contactId', ctrlWrapper(updateContact));
router.delete('/:contactId', ctrlWrapper(deleteContact));

export default router;