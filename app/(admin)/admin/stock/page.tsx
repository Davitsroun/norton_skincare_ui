// 'use client';

// import { AdminPageShell } from '@/components/admin-page-shell';
// import { ConfirmationDialog } from '@/components/confirmation-dialog';
// import { AlertTriangle, TrendingDown, Plus, X } from 'lucide-react';
// import { useState } from 'react';
// import { useToast } from '@/hooks/use-toast';

// const stockData = [
//   {
//     id: 1,
//     product: 'Premium CBD Oil',
//     sku: 'CBD-001',
//     current: 45,
//     minimum: 100,
//     status: 'Low Stock',
//     image: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=50&h=50&fit=crop',
//   },
//   {
//     id: 2,
//     product: 'Hemp Tea',
//     sku: 'HEMP-TEA',
//     current: 320,
//     minimum: 100,
//     status: 'In Stock',
//     image: 'https://images.unsplash.com/photo-1597318736231-81ad71381e39?w=50&h=50&fit=crop',
//   },
//   {
//     id: 3,
//     product: 'CBD Capsules',
//     sku: 'CBD-CAP',
//     current: 8,
//     minimum: 50,
//     status: 'Critical',
//     image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?w=50&h=50&fit=crop',
//   },
//   {
//     id: 4,
//     product: 'Hemp Lotion',
//     sku: 'HEMP-LOT',
//     current: 156,
//     minimum: 100,
//     status: 'In Stock',
//     image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=50&h=50&fit=crop',
//   },
// ];

// export default function AdminStock() {
//   const { toast } = useToast();
//   const [stock, setStock] = useState(stockData);
//   const [showRestockModal, setShowRestockModal] = useState(false);
//   const [selectedItem, setSelectedItem] = useState<any>(null);
//   const [restockAmount, setRestockAmount] = useState('');

//   const lowStockItems = stock.filter((item) => item.current < item.minimum);

//   const handleOpenRestockModal = (item: any) => {
//     setSelectedItem(item);
//     setRestockAmount('');
//     setShowRestockModal(true);
//   };

//   const handleRestock = () => {
//     if (selectedItem && restockAmount) {
//       const amount = parseInt(restockAmount);
//       setStock(stock.map(item =>
//         item.id === selectedItem.id
//           ? { ...item, current: item.current + amount }
//           : item
//       ));
//       toast({
//         title: 'Stock Updated',
//         description: `${selectedItem.product} stock increased by ${amount} units.`,
//       });
//       setShowRestockModal(false);
//       setSelectedItem(null);
//       setRestockAmount('');
//     }
//   };

//   return (
//     <AdminPageShell title="Stock Management" description="Monitor and manage inventory levels">
//         {/* Alert */}
//         {lowStockItems.length > 0 && (
//           <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-8 flex items-start gap-4">
//             <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
//             <div>
//               <h3 className="font-semibold text-red-900 mb-1">Low Stock Alert</h3>
//               <p className="text-sm text-red-700">
//                 {lowStockItems.length} product(s) have fallen below minimum stock levels. Please reorder soon.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* Stock Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//             <p className="text-gray-600 text-sm mb-2">Total Products</p>
//             <p className="text-3xl font-bold text-gray-900 mb-2">42</p>
//             <p className="text-xs text-gray-500">Across 4 categories</p>
//           </div>

//           <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
//             <p className="text-gray-600 text-sm mb-2">Total Stock Value</p>
//             <p className="text-3xl font-bold text-gray-900 mb-2">$45,892</p>
//             <p className="text-xs text-gray-500">Last updated today</p>
//           </div>

//           <div className="bg-red-50 rounded-2xl p-6 border border-red-200 shadow-sm">
//             <p className="text-red-600 text-sm mb-2 font-semibold">Low Stock Items</p>
//             <p className="text-3xl font-bold text-red-700 mb-2">{lowStockItems.length}</p>
//             <p className="text-xs text-red-600">Require immediate attention</p>
//           </div>
//         </div>

//         {/* Stock Table */}
//         <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
//           <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//             <h2 className="text-lg font-bold text-gray-900">Inventory List</h2>
//             <button 
//               onClick={() => handleOpenRestockModal(null)}
//               className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all"
//             >
//               <Plus className="w-4 h-4" />
//               Restock
//             </button>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead>
//                 <tr className="border-b border-gray-200 bg-gray-50">
//                   <th className="px-6 py-4 text-left font-semibold text-gray-700">Product</th>
//                   <th className="px-6 py-4 text-left font-semibold text-gray-700">SKU</th>
//                   <th className="px-6 py-4 text-left font-semibold text-gray-700">Current Stock</th>
//                   <th className="px-6 py-4 text-left font-semibold text-gray-700">Minimum Level</th>
//                   <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
//                   <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {stock.map((item) => (
//                   <tr
//                     key={item.id}
//                     className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
//                       item.status === 'Critical' ? 'bg-red-50' : ''
//                     }`}
//                   >
//                     <td className="px-6 py-4">
//                       <div className="flex items-center gap-3">
//                         <img
//                           src={item.image}
//                           alt={item.product}
//                           className="w-10 h-10 rounded-lg object-cover"
//                         />
//                         <p className="font-semibold text-gray-900">{item.product}</p>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">{item.sku}</td>
//                     <td className="px-6 py-4">
//                       <p className="font-semibold text-gray-900">{item.current}</p>
//                       {item.current < item.minimum && (
//                         <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//                           <div
//                             className="bg-red-500 h-2 rounded-full"
//                             style={{ width: `${(item.current / item.minimum) * 100}%` }}
//                           ></div>
//                         </div>
//                       )}
//                     </td>
//                     <td className="px-6 py-4 text-gray-700">{item.minimum}</td>
//                     <td className="px-6 py-4">
//                       <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
//                         item.status === 'Critical' ? 'bg-red-100 text-red-700' :
//                         item.status === 'Low Stock' ? 'bg-yellow-100 text-yellow-700' :
//                         'bg-green-100 text-green-700'
//                       }`}>
//                         {item.status === 'Critical' && <AlertTriangle className="w-3 h-3" />}
//                         {item.status === 'Low Stock' && <TrendingDown className="w-3 h-3" />}
//                         {item.status}
//                       </span>
//                     </td>
//                     <td className="px-6 py-4">
//                       <button 
//                         onClick={() => handleOpenRestockModal(item)}
//                         className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg text-xs font-semibold transition-all"
//                       >
//                         Update Stock
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Restock Modal */}
//         {showRestockModal && (
//           <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//             <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
//               <div className="p-6 border-b border-gray-200 flex items-center justify-between">
//                 <h3 className="text-lg font-bold text-gray-900">Update Stock</h3>
//                 <button 
//                   onClick={() => setShowRestockModal(false)}
//                   className="text-gray-400 hover:text-gray-600"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//               <div className="p-6 space-y-4">
//                 {selectedItem && (
//                   <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-lg">
//                     <img src={selectedItem.image} alt={selectedItem.product} className="w-12 h-12 rounded-lg object-cover" />
//                     <div>
//                       <p className="font-semibold text-gray-900">{selectedItem.product}</p>
//                       <p className="text-sm text-gray-600">Current: {selectedItem.current} units</p>
//                     </div>
//                   </div>
//                 )}
//                 <div>
//                   <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity to Add</label>
//                   <input
//                     type="number"
//                     value={restockAmount}
//                     onChange={(e) => setRestockAmount(e.target.value)}
//                     placeholder="Enter amount"
//                     className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
//                   />
//                 </div>
//               </div>
//               <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
//                 <button 
//                   onClick={() => setShowRestockModal(false)}
//                   className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   onClick={handleRestock}
//                   className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
//                 >
//                   Update Stock
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}
//       </AdminPageShell>
//   );
// }

