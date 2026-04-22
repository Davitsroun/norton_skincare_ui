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
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [productToEdit, setProductToEdit] = useState<number | null>(null);
  const [productToRestock, setProductToRestock] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', sku: '', category: '', price: '', stock: 0 });
  const [editProduct, setEditProduct] = useState({ name: '', sku: '', category: '', price: '' });
  const [stockToAdd, setStockToAdd] = useState(0);

  const getStatusByStock = (stock: number): (typeof products)[number]['status'] =>
    stock > 50 ? 'Active' : 'Low Stock';

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.includes(searchQuery)
  );

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.sku) {
      const product: (typeof products)[number] = {
        id: Math.max(...products.map(p => p.id), 0) + 1,
        name: newProduct.name,
        sku: newProduct.sku,
        category: newProduct.category || 'General',
        price: newProduct.price || '$0.00',
        stock: newProduct.stock,
        status: getStatusByStock(newProduct.stock),
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

  const handleOpenEditModal = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    setProductToEdit(productId);
    setEditProduct({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
    });
    setShowEditModal(true);
  };

  const handleSaveEditProduct = () => {
    if (!productToEdit || !editProduct.name || !editProduct.sku) return;
    setProducts(
      products.map((p) =>
        p.id === productToEdit
          ? {
              ...p,
              name: editProduct.name,
              sku: editProduct.sku,
              category: editProduct.category || 'General',
              price: editProduct.price || '$0.00',
            }
          : p
      )
    );
    toast({
      title: 'Product Updated',
      description: `${editProduct.name} information has been updated.`,
    });
    setShowEditModal(false);
    setProductToEdit(null);
  };

  const handleOpenStockModal = (productId: number) => {
    setProductToRestock(productId);
    setStockToAdd(0);
    setShowStockModal(true);
  };

  const handleAddStock = () => {
    if (!productToRestock || stockToAdd <= 0) return;
    let updatedProductName = '';
    setProducts(
      products.map((p) => {
        if (p.id !== productToRestock) return p;
        updatedProductName = p.name;
        const updatedStock = p.stock + stockToAdd;
        return {
          ...p,
          stock: updatedStock,
          status: getStatusByStock(updatedStock),
        };
      })
    );
    toast({
      title: 'Stock Added',
      description: `${stockToAdd} units added to ${updatedProductName}.`,
    });
    setShowStockModal(false);
    setProductToRestock(null);
    setStockToAdd(0);
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
                        <button
                          onClick={() => handleOpenEditModal(product.id)}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Edit Product Info"
                        >
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button
                          onClick={() => handleOpenStockModal(product.id)}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors"
                          title="Add Stock"
                        >
                          + Stock
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                        {/* <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button> */}
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
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, stock: Number.parseInt(e.target.value, 10) || 0 })
                  }
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

        {/* Edit Product Modal */}
        {showEditModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900">Edit Product Info</h3>
                <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">X</button>
              </div>
              <div className="space-y-4 p-6">
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editProduct.name}
                  onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  placeholder="SKU"
                  value={editProduct.sku}
                  onChange={(e) => setEditProduct({ ...editProduct, sku: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={editProduct.category}
                  onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <input
                  type="text"
                  placeholder="Price"
                  value={editProduct.price}
                  onChange={(e) => setEditProduct({ ...editProduct, price: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEditProduct}
                  className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  Save Info
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Stock Modal */}
        {showStockModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900">Add Stock</h3>
                <button onClick={() => setShowStockModal(false)} className="text-gray-400 hover:text-gray-600">X</button>
              </div>
              <div className="space-y-4 p-6">
                <p className="text-sm text-gray-600">Enter stock quantity to add for this product.</p>
                <input
                  type="number"
                  min={1}
                  placeholder="Stock to add"
                  value={stockToAdd}
                  onChange={(e) => setStockToAdd(Number.parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-gray-200 p-6">
                <button
                  onClick={() => setShowStockModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddStock}
                  className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
                >
                  Add Stock
                </button>
              </div>
            </div>
          </div>
        )}
      </AdminPageShell>
  );
}

