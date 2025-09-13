export const handleError = (res, error, defaultMsg = "Something went wrong") => {
    console.error(error); // Log for debugging
    const message = error?.message || defaultMsg;
    res.status(error?.statusCode || 500).json({ error: message });
  };
  