import React, { useState } from 'react';
import { Check, X, ExternalLink, Search } from 'lucide-react';

const PaymentRequests = () => {
  const [requests, setRequests] = useState([
    { id: 1, user: 'Jasur Toshmatov', email: 'jasur@example.com', amount: '₹49', transactionId: 'TXN12345678', date: '2024-04-20', status: 'pending' },
    { id: 2, user: 'Shahzod Aliev', email: 'shahzod@example.com', amount: '₹49', transactionId: 'TXN87654321', date: '2024-04-19', status: 'pending' },
  ]);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Payment Requests</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search transaction ID..." 
            className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-4 text-sm font-bold text-gray-600">User</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Transaction ID</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Date</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Screenshot</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-medium text-gray-800">{request.user}</p>
                  <p className="text-xs text-gray-500">{request.email}</p>
                </td>
                <td className="px-6 py-4 font-mono text-sm text-indigo-600 font-medium">{request.transactionId}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{request.date}</td>
                <td className="px-6 py-4">
                  <button className="flex items-center text-xs font-bold text-blue-600 hover:underline">
                    <ExternalLink size={14} className="mr-1" /> View Image
                  </button>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wider">
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <button className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200" title="Approve">
                      <Check size={18} />
                    </button>
                    <button className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200" title="Reject">
                      <X size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentRequests;
