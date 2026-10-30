// Every endpoint answers with the same JSON shape:
//   success: { success: true,  data, message }
//   failure: { success: false, message }
// This keeps the frontend's Fetch code simple and predictable.

export const sendSuccess = (res, data, message = 'OK', statusCode = 200) =>
  res.status(statusCode).json({ success: true, data, message });

export const sendError = (res, message = 'Something went wrong', statusCode = 500) =>
  res.status(statusCode).json({ success: false, message });
