import Contact from '../models/contact.js';
import {addContactService, updateContactService, deleteContactService} from '../services/contacts.js'
import createError from 'http-errors';

const getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.status(200).json({
      status: 200,
      message: 'Successfully found contacts!',
      data: contacts,
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

const getContactById = async (req, res) => {
  try {
    const { contactId } = req.params;
    const contact = await Contact.findById(contactId);

    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.status(200).json({
      status: 200,
      message: `Successfully found contact with id ${contactId}!`,
      data: contact,
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
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
  if (!updatedContact) throw createError(404, "Contact not found");
  res.status(200).json({
      status: 200,
      message: "Successfully patched a contact!",
      data: updatedContact,
  });
};

const deleteContact = async (req, res) => {
    const contact = await deleteContactService(req.params.contactId);
    if (!contact) throw createError(404, "Contact not found");
    res.status(204).send();
};


export { getAllContacts, getContactById, addContact, updateContact, deleteContact };