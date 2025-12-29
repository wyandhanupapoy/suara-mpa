/**
 * Status utility functions
 */

export const getStatusLabel = (status) => {
  const labels = {
    received: 'Diterima',
    verified: 'Diverifikasi',
    process: 'Dalam Proses',
    followed_up: 'Ditindaklanjuti',
    finished: 'Selesai',
    rejected: 'Ditolak/Spam'
  };
  return labels[status] || status;
};

export const getStatusColor = (status) => {
  const colors = {
    received: 'bg-slate-100 text-slate-700 border-slate-200',
    verified: 'bg-blue-100 text-blue-700 border-blue-200',
    process: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    followed_up: 'bg-purple-100 text-purple-700 border-purple-200',
    finished: 'bg-green-100 text-green-700 border-green-200',
    rejected: 'bg-red-100 text-red-700 border-red-200'
  };
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};
