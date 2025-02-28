import Contact from '../models/contact.js';
import createHttpError from 'http-errors';
import ctrlWrapper from "../utils/ctrlWrapper.js";
import dotenv from "dotenv";
import {addContactService} from "../services/contacts.js"



dotenv.config();

const getAllContacts = ctrlWrapper(async (req, res) => {
  const { page = 1, perPage = 10, sortBy = "name", sortOrder = "asc", type, isFavourite } = req.query;
  const limit = Math.max(1, parseInt(perPage, 10));
  const skip = (Math.max(1, parseInt(page, 10)) - 1) * limit;
  const sortDirection = sortOrder === "desc" ? -1 : 1;

  console.log("User ID from token:", req.user.userId); 
  const filter = { userId: req.user.userId };
  console.log("Filter used:", filter); 

  if (type) filter.contactType = type;
  if (isFavourite !== undefined) filter.isFavourite = isFavourite === "true";

  const totalItems = await Contact.countDocuments(filter);
  const totalPages = Math.ceil(totalItems / limit);

  const contacts = await Contact.find(filter)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(limit);

  res.status(200).json({
    status: 200,
    message: "Successfully found contacts!",
    data: {
      contacts,
      page: parseInt(page, 10),
      perPage: limit,
      totalItems,
      totalPages,
      hasPreviousPage: page > 1,
      hasNextPage: page < totalPages,
    },
  });
});

const getContactById = ctrlWrapper(async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findOne({ _id: contactId, userId: req.user.userId });
  if (!contact) throw createHttpError(404, 'Contact not found');
  
  res.status(200).json({
    status: 200,
    message: `Successfully found contact with id ${contactId}!`,
    data: contact,
  });
});


const addContact = async (req, res, next) => {
  try {
    const { photo } = req.file
      ? { photo: await saveFileToCloudinary(req.file) }
      : {};

    const contactData = {
      ...req.body,
      userId: req.user.userId,  
      photo,
    };

    const contact = await addContactService(contactData);

    res.status(201).json({
      status: 201,
      message: 'Successfully created a contact!',
      data: contact,
    });
  } catch (error) {
    next(error);  
  }
};




const updateContact = ctrlWrapper(async (req, res) => {
  const { contactId } = req.params;

  const updatedContact = await Contact.findOneAndUpdate(
    { _id: contactId, userId: req.user.userId },
    { ...req.body, ...(req.file?.path && { photo: req.file.path }) }, 
    { new: true }
  );

  if (!updatedContact) throw createHttpError(404, "Contact not found");

  res.status(200).json({
    status: 200,
    message: "Successfully updated contact!",
    data: updatedContact,
  });
});

const deleteContact = ctrlWrapper(async (req, res) => {
  const { contactId } = req.params;
  const contact = await Contact.findOneAndDelete({ _id: contactId, userId: req.user.userId });
  if (!contact) throw createHttpError(404, 'Contact not found');
  res.status(204).send();
});

export { getAllContacts, getContactById, addContact, updateContact, deleteContact };
