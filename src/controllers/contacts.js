import Contact from '../models/contact.js';
import {addContactService, updateContactService, deleteContactService} from '../services/contacts.js'
import createHttpError from 'http-errors';

const getAllContacts = async (req, res) => {
  const contacts = await Contact.find();
  res.status(200).json({
    status: 200,
    message: 'Successfully found contacts!',
    data: contacts,
  });
};

const getContactById = async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findById(contactId);
  if (!contact) throw createHttpError(404, 'Contact not found');
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
};


const addContact = async (req, res) => {
    const newContact = await addContactService(req.body);
    res.status(201).json({
        status: 201,
        message: "Successfully created a contact!",
        data: newContact,
    });
};

const updateContact = async (req, res) => {
  const updatedContact = await updateContactService(req.params.contactId, req.body);
  if (!updatedContact) throw createHttpError(404, 'Contact not found');
  res.status(200).json({
    status: 200,
    message: 'Successfully updated contact!',
    data: updatedContact,
  });
};

const deleteContact = async (req, res) => {
  const contact = await deleteContactService(req.params.contactId);
  if (!contact) throw createHttpError(404, 'Contact not found');
  res.status(204).send(); 
};


export { getAllContacts, getContactById, addContact, updateContact, deleteContact };