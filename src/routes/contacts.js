import express from 'express';
import { getAllContacts, getContactById, addContact, updateContact, deleteContact } from '../controllers/contacts.js';
import ctrlWrapper from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';
import isValidId from '../middlewares/isValidId.js';
import { contactSchema, updateContactSchema } from '../models/contactSchemas.js';
import { authenticateUser } from "../middlewares/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";
import validateContactFormData from '../middlewares/validateContactFormData.js';

const router = express.Router();


router.use(authenticateUser);

router.get('/', ctrlWrapper(getAllContacts));
router.get('/:contactId', isValidId, ctrlWrapper(getContactById));
router.post("/", upload.single("photo"), validateContactFormData, validateBody(contactSchema), ctrlWrapper(addContact));
router.patch("/:contactId", upload.single("photo"), isValidId, validateContactFormData, validateBody(updateContactSchema), ctrlWrapper(updateContact));
router.delete('/:contactId', isValidId, ctrlWrapper(deleteContact));

export default router;
