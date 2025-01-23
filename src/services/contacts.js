import Contact from '../models/contact.js';

const addContactService = async (contactData) => {
    const contact = new Contact(contactData);
    await contact.save();
    return contact;
};

const updateContactService = async (contactId, updates) => {
    return await Contact.findByIdAndUpdate(contactId, updates, { new: true });
};

const deleteContactService = async (contactId) => {
    return await Contact.findByIdAndDelete(contactId);
};


export  {addContactService, updateContactService, deleteContactService};
