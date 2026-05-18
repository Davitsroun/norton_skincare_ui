'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { AdminProductFormModal } from '@/components/admin-product-form-modal';
import { AdminProductStockModal } from '@/components/admin-product-stock-modal';
import { AdminProductsTable } from '@/components/admin-products-table';
import { Button } from '@/components/ui/button';
import { useAdminProductsPage } from '@/hooks/use-admin-products';
import { Plus, Search } from 'lucide-react';

export default function AdminProducts() {
  const p = useAdminProductsPage();
   console.log('data', p)

  return (
    <AdminPageShell title="Products" description="Manage your product inventory">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <header className="flex flex-col gap-4 border-b border-gray-200 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-md flex-1">
            <label className="sr-only" htmlFor="admin-product-search">
              Search products
            </label>
            <div className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2">
              <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden />
              <input
                id="admin-product-search"
                type="search"
                placeholder="Search products…"
                value={p.searchQuery}
                onChange={(e) => p.setSearchQuery(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </div>
          </div>
          <Button
            type="button"
            size="lg"
            className="rounded-xl shadow-sm"
            onClick={() => p.setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            Add product
          </Button>
        </header>

        {p.error && (
          <div className="border-b border-red-100 bg-red-50 px-6 py-3 text-sm text-red-800">
            {p.error}
          </div>
        )}

        <div className="overflow-x-auto">
          <AdminProductsTable
            rows={p.visibleRows}
            loading={p.loading}
            getCategoryLabel={p.getCategoryLabel}
            onEdit={p.openEdit}
            onRestock={p.openRestock}
            onDelete={p.requestDelete}
          />
        </div>

        {!p.loading && p.visibleRows.length === 0 && !p.error && (
          <p className="py-12 text-center text-sm text-gray-500">No products match this view.</p>
        )}

        <footer className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 px-6 py-4 sm:flex-row">
          <p className="text-sm text-gray-600">
            Page {p.pagination.currentPage + 1} of {Math.max(1, p.pagination.totalPages)} ·{' '}
            {p.pagination.totalElements} products
          </p>
          <nav className="flex gap-2" aria-label="Pagination">
            <button
              type="button"
              disabled={p.page <= 0 || p.loading}
              onClick={() => p.setPage((n) => Math.max(0, n - 1))}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={p.loading || p.page >= p.pagination.totalPages - 1}
              onClick={() => p.setPage((n) => n + 1)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-40"
            >
              Next
            </button>
          </nav>
        </footer>
      </div>

      <ConfirmationDialog
        isOpen={p.showDeleteConfirm}
        title="Delete product"
        description="Are you sure? This cannot be undone."
        cancelText="Cancel"
        confirmText="Delete"
        isDangerous
        onCancel={p.cancelDelete}
        onConfirm={() => void p.confirmDelete()}
      />

      {p.showAddModal && (
        <AdminProductFormModal
          title="Add product"
          submitLabel="Create"
          form={p.newProductForm}
          setForm={p.setNewProductForm}
          categories={p.categories}
          onClose={() => p.setShowAddModal(false)}
          onSubmit={() => void p.submitCreate()}
        />
      )}

      {p.showEditModal && (
        <AdminProductFormModal
          title="Edit product"
          submitLabel="Save"
          form={p.editProductForm}
          setForm={p.setEditProductForm}
          categories={p.categories}
          onClose={p.closeEditModal}
          onSubmit={() => void p.submitEdit()}
        />
      )}

      {p.showStockModal && p.restockProduct && (
        <AdminProductStockModal
          product={p.restockProduct}
          quantityToAdd={p.stockToAdd}
          onQuantityChange={p.setStockToAdd}
          onClose={p.closeStockModal}
          onSubmit={() => void p.submitRestock()}
        />
      )}
    </AdminPageShell>
  );
}
