import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  getAllContactMessagesApi,
  deleteContactMessageApi,
  markMessageRepliedApi,
} from "../../api/contact.api";

const ContactMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMessages = async () => {
    try {
      const res = await getAllContactMessagesApi();
      setMessages(res.data.messages || []);
    } catch (err) {
      console.error("Message Load Error:", err.response?.data || err);
      Swal.fire("Error", "Failed to load messages", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const deleteMessageHandler = async (id) => {
    Swal.fire({
      title: "Delete message?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
        await deleteContactMessageApi(id);
        Swal.fire("Deleted", "Message removed", "success");
        loadMessages();
      } catch {
        Swal.fire("Error", "Failed to delete message", "error");
      }
    });
  };

  const replyHandler = async (id) => {
    try {
      await markMessageRepliedApi(id);
      Swal.fire("Updated", "Marked as replied", "success");
      loadMessages();
    } catch {
      Swal.fire("Error", "Failed to update status", "error");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading messages...</p>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        Contact Messages
      </h2>

      {messages.length === 0 ? (
        <p className="text-gray-500">No messages found.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-white shadow">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Phone</th>
                <th className="p-3 text-left">Message</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr
                  key={msg._id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3">{msg.name}</td>
                  <td className="p-3">{msg.email}</td>
                  <td className="p-3">{msg.phone}</td>
                  <td className="p-3 max-w-xs truncate">{msg.message}</td>
                  <td className="p-3">
                    {msg.replied ? (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        Replied
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3 flex gap-2 justify-center">
                    {!msg.replied && (
                      <button
                        onClick={() => replyHandler(msg._id)}
                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded"
                      >
                        Mark Replied
                      </button>
                    )}

                    <button
                      onClick={() => deleteMessageHandler(msg._id)}
                      className="px-3 py-1 text-xs bg-red-600 text-white rounded"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
