import { contactSchema } from '../models/contactSchemas.js';
const validateContactFormData = (req, res, next) => {
    const { error } = contactSchema.validate(req.body, { abortEarly: false });
  
    if (error) {
      return res.status(400).json({
        status: 400,
        message: `Validation error: ${error.details.map((d) => d.message).join(", ")}`,
      });
    }
  
    next();
  };
  export default validateContactFormData;
  