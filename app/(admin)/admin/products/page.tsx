'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useState } from 'react';
import { Search, Plus, Edit2, Trash2, MoreVertical } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { mockAdminProducts } from '@/lib/mock-data/index';

export default function AdminProducts() {
  const { toast } = useToast();
  const [products, setProducts] = useState(mockAdminProducts);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', price: '', stock: 0 });

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.includes(searchQuery)
  );

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sku) {
      const product = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category || 'General',
        price: newProduct.price || '$0.00',
        stock: newProduct.stock,
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1585951237318-9ea5e175b891?w=80&h=80&fit=crop',
      };
      setProducts([...products, product]);
      toast({
        title: 'Product Added',
        description: `${newProduct.name} has been added successfully.`,
      });
      setNewProduct({ name: '', sku: '', category: '', price: '', stock: 0 });
      setShowAddModal(false);
    }
  };

  const handleDeleteProduct = (productId: number) => {
    setProductToDelete(productId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteProduct = () => {
    if (productToDelete) {
      const product = products.find(p => p.id === productToDelete);
      setProducts(products.filter(p => p.id !== productToDelete));
      toast({
        title: 'Product Deleted',
        description: `${product?.name} has been deleted successfully.`,
      });
      setShowDeleteConfirm(false);
      setProductToDelete(null);
    }
  };

  return (
    <AdminPageShell title="Products" description="Manage your product inventory">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 max-w-md">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
                />
              </div>
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Product</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Stock</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="font-semibold text-gray-900">{product.name}</p>
                          <p className="text-xs text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">{product.category}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{product.price}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.stock > 100 ? 'bg-green-100 text-green-700' :
                        product.stock > 50 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                        product.status === 'Active' ? 'bg-green-100 text-green-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {product.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={showDeleteConfirm}
          title="Delete Product"
          description={`Are you sure you want to delete this product? This action cannot be undone.`}
          cancelText="Cancel"
          confirmText="Delete Product"
          isDangerous={true}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setProductToDelete(null);
          }}
          onConfirm={confirmDeleteProduct}
        />

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Add New Product</h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">âœ•</button>
              </div>
              <div className="p-6 space-y-4">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={newProduct.sku}
                  onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChange={(e) => setNewProduct({ ...newProduct, stock: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="p-6 border-t border-gray-200 flex items-center justify-end gap-3">
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleAddProduct}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Add Product
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminPageShell>
  );
}

