import adminApi from "./adminAxios";

// Get all messages (ADMIN)
export const getAllContactMessagesApi = () => {
  return adminApi.get("/contact");
};

// Delete message
export const deleteContactMessageApi = (id) => {
  return adminApi.delete(`/contact/${id}`);
};

// Mark as replied
export const markMessageRepliedApi = (id) => {
  return adminApi.put(`/contact/${id}/reply`);
};
