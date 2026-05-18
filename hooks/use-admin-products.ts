'use client';

import {
  createAdminProductAction,
  deleteAdminProductAction,
  listAdminProductsAction,
  listCategoriesPublicAction,
  updateAdminProductAction,
} from '@/actions/admin-actions';
import type { AdminCategoryOption, AdminProductRow } from '@/types/admin-api';
import {
  ADMIN_PRODUCTS_PAGE_SIZE,
  adminProductFormToUpsertBody,
  adminProductRowToForm,
  emptyAdminProductForm,
  filterAdminProductsBySearch,
  resolveAdminProductCategoryLabel,
  type AdminProductFormState,
} from '@/lib/admin-products';
import { useToast } from '@/hooks/use-toast';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useAdminProductsPage() {
  const { toast } = useToast();

  const [products, setProducts] = useState<AdminProductRow[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    currentPage: 0,
    pageSize: ADMIN_PRODUCTS_PAGE_SIZE,
    totalPages: 1,
  });
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [productToDeleteId, setProductToDeleteId] = useState<string | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [restockProduct, setRestockProduct] = useState<AdminProductRow | null>(null);

  const [newProductForm, setNewProductForm] = useState<AdminProductFormState>(() =>
    emptyAdminProductForm(),
  );
  const [editProductForm, setEditProductForm] = useState<AdminProductFormState>(() =>
    emptyAdminProductForm(),
  );
  const [stockToAdd, setStockToAdd] = useState('');

  const notifyError = useCallback(
    (description: string) => {
      toast({ variant: 'destructive', title: 'Error', description });
    },
    [toast],
  );

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [prodRes, catRes] = await Promise.all([
      listAdminProductsAction({ page, size: ADMIN_PRODUCTS_PAGE_SIZE }),
      listCategoriesPublicAction(),
    ]);

    if (catRes.success && catRes.data?.length) {
      setCategories(catRes.data);
    }

    if (!prodRes.success || !prodRes.data) {
      setError(prodRes.error ?? 'Could not load products.');
      setProducts([]);
      setLoading(false);
      return;
    }

    setProducts(prodRes.data.items);
    setPagination(prodRes.data.pagination);
    setLoading(false);
  }, [page]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const visibleRows = useMemo(
    () => filterAdminProductsBySearch(products, searchQuery),
    [products, searchQuery],
  );

  const getCategoryLabel = useCallback(
    (row: AdminProductRow) => resolveAdminProductCategoryLabel(row, categories),
    [categories],
  );

  const submitCreate = async () => {
    if (!newProductForm.name.trim()) {
      return;
    }
    const body = adminProductFormToUpsertBody(newProductForm);
    const res = await createAdminProductAction(body);
    if (!res.success) {
      notifyError(res.error ?? 'Could not create product.');
      return;
    }
    toast({ title: 'Product added', description: `${body.name} was created.` });
    setNewProductForm(emptyAdminProductForm());
    setShowAddModal(false);
    void reload();
  };

  const openEdit = (row: AdminProductRow) => {
    setEditingProductId(row.id);
    setEditProductForm(adminProductRowToForm(row));
    setShowEditModal(true);
  };

  const submitEdit = async () => {
    if (!editingProductId || !editProductForm.name.trim()) {
      return;
    }
    const res = await updateAdminProductAction(
      editingProductId,
      adminProductFormToUpsertBody(editProductForm),
    );
    if (!res.success) {
      notifyError(res.error ?? 'Could not update product.');
      return;
    }
    toast({ title: 'Product updated', description: 'Changes saved.' });
    setShowEditModal(false);
    setEditingProductId(null);
    void reload();
  };

  const openRestock = (row: AdminProductRow) => {
    setRestockProduct(row);
    setStockToAdd('');
    setShowStockModal(true);
  };

  const submitRestock = async () => {
    if (!restockProduct) {
      return;
    }
    const add = Number.parseInt(stockToAdd, 10);
    if (!Number.isFinite(add) || add <= 0) {
      return;
    }
    const body = {
      ...adminProductFormToUpsertBody(adminProductRowToForm(restockProduct)),
      stockQuantity: restockProduct.stockQuantity + add,
    };
    const res = await updateAdminProductAction(restockProduct.id, body);
    if (!res.success) {
      notifyError(res.error ?? 'Could not update stock.');
      return;
    }
    toast({
      title: 'Stock updated',
      description: `${add} units added to ${restockProduct.name}.`,
    });
    setShowStockModal(false);
    setRestockProduct(null);
    setStockToAdd('');
    void reload();
  };

  const requestDelete = (id: string) => {
    setProductToDeleteId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!productToDeleteId) {
      return;
    }
    const res = await deleteAdminProductAction(productToDeleteId);
    if (!res.success) {
      notifyError(res.error ?? 'Could not delete product.');
      setShowDeleteConfirm(false);
      setProductToDeleteId(null);
      return;
    }
    toast({ title: 'Product deleted', description: 'Removed from catalog.' });
    setShowDeleteConfirm(false);
    setProductToDeleteId(null);
    void reload();
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setProductToDeleteId(null);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingProductId(null);
  };

  return {
    /** Table */
    visibleRows,
    loading,
    error,
    pagination,
    page,
    setPage,
    searchQuery,
    setSearchQuery,
    getCategoryLabel,

    /** Reference data */
    categories,

    /** Create modal */
    showAddModal,
    setShowAddModal,
    newProductForm,
    setNewProductForm,
    submitCreate,

    /** Edit modal */
    showEditModal,
    editProductForm,
    setEditProductForm,
    openEdit,
    submitEdit,
    closeEditModal,

    /** Stock modal */
    showStockModal,
    restockProduct,
    stockToAdd,
    setStockToAdd,
    openRestock,
    submitRestock,
    closeStockModal: () => {
      setShowStockModal(false);
      setRestockProduct(null);
    },

    /** Delete */
    showDeleteConfirm,
    requestDelete,
    confirmDelete,
    cancelDelete,
  };
}
