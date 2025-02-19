import Joi from 'joi';

export const contactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required(),
  phoneNumber: Joi.string().min(3).max(20).required(),
  email: Joi.string().email().required(), 
  contactType: Joi.string().valid('work', 'home', 'personal').required(),  
  isFavourite: Joi.boolean(),
  photo: Joi.string().optional(),  
});


export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20),
  phoneNumber: Joi.string().min(3).max(20),
  email: Joi.string().email(), 
  contactType: Joi.string().valid('work', 'home', 'personal'),  
  isFavourite: Joi.boolean(),
  photo: Joi.string().optional(),
}).min(1);
 
