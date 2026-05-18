'use client';

import type { AdminCategoryOption } from '@/types/admin-api';
import type { AdminProductFormState } from '@/lib/admin-products';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { ImageIcon, Layers, Package } from 'lucide-react';
import type { ComponentType, Dispatch, SetStateAction } from 'react';

const CATEGORY_NONE = '__none__';

type AdminProductFormModalProps = {
  title: string;
  submitLabel: string;
  form: AdminProductFormState;
  setForm: Dispatch<SetStateAction<AdminProductFormState>>;
  categories: AdminCategoryOption[];
  onClose: () => void;
  onSubmit: () => void;
};

function FormSectionTitle({
  icon: Icon,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 border-b border-border/60 pb-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <h4 className="text-sm font-semibold tracking-tight text-foreground">{children}</h4>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('space-y-2', className)}>
      <Label htmlFor={htmlFor} className="text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

export function AdminProductFormModal(props: AdminProductFormModalProps) {
  const { title, submitLabel, form, setForm, categories, onClose, onSubmit } = props;

  const patch = (partial: Partial<AdminProductFormState>) => {
    setForm((prev) => ({ ...prev, ...partial }));
  };

  const categorySelectValue = categories.some((c) => c.id === form.categoryId)
    ? form.categoryId
    : CATEGORY_NONE;

  const isCreate = submitLabel.toLowerCase() === 'create';

  return (
    <Dialog
      open
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose();
        }
      }}
    >
      <DialogContent
        showCloseButton
        className="max-h-[min(92vh,720px)] gap-0 overflow-hidden rounded-2xl border-border/80 p-0 shadow-2xl sm:max-w-xl"
      >
        <div className="relative border-b bg-gradient-to-br from-primary/[0.06] via-background to-muted/40 px-6 pt-6 pb-5">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/80 via-primary to-primary/60" />
          <DialogHeader className="gap-1 pr-10 text-left">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Package className="h-5 w-5" aria-hidden />
              </span>
              <div className="min-w-0 space-y-1">
                <DialogTitle className="text-xl font-bold tracking-tight">{title}</DialogTitle>
                <DialogDescription className="text-muted-foreground text-sm leading-relaxed">
                  {isCreate
                    ? 'Create a new catalog item with pricing, stock, and optional media.'
                    : 'Update product details; changes apply as soon as you save.'}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="max-h-[min(55vh,480px)] space-y-6 overflow-y-auto px-6 py-6">
          <div className="space-y-4">
            <FormSectionTitle icon={Package}>Basics</FormSectionTitle>
            <Field label="Product name" htmlFor="admin-product-name">
              <Input
                id="admin-product-name"
                placeholder="e.g. Vitamin C Serum"
                value={form.name}
                onChange={(e) => patch({ name: e.target.value })}
                autoComplete="off"
              />
            </Field>
            <Field label="Description" htmlFor="admin-product-desc">
              <Textarea
                id="admin-product-desc"
                placeholder="Short description for staff and storefront…"
                value={form.description}
                onChange={(e) => patch({ description: e.target.value })}
                rows={3}
                className="min-h-[88px] resize-y"
              />
            </Field>
          </div>

          <div className="space-y-4">
            <FormSectionTitle icon={Layers}>Pricing & inventory</FormSectionTitle>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Price" htmlFor="admin-product-price">
                <Input
                  id="admin-product-price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.price}
                  onChange={(e) => patch({ price: e.target.value })}
                />
              </Field>
              <Field label="Stock quantity" htmlFor="admin-product-stock">
                <Input
                  id="admin-product-stock"
                  type="number"
                  min={0}
                  placeholder="0"
                  value={form.stockQuantity}
                  onChange={(e) => patch({ stockQuantity: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="space-y-4">
            <FormSectionTitle icon={ImageIcon}>Media & organization</FormSectionTitle>
            <Field label="Image URL" htmlFor="admin-product-image">
              <Input
                id="admin-product-image"
                type="url"
                placeholder="https://…"
                value={form.imageUrl}
                onChange={(e) => patch({ imageUrl: e.target.value })}
                className="font-mono text-xs sm:text-sm"
              />
            </Field>
            <Field label="Category" htmlFor="admin-product-category">
              <Select
                value={categorySelectValue}
                onValueChange={(v) =>
                  patch({ categoryId: v === CATEGORY_NONE ? '' : v })
                }
              >
                <SelectTrigger id="admin-product-category" className="w-full">
                  <SelectValue placeholder="Optional — select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CATEGORY_NONE}>No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Brand ID" htmlFor="admin-product-brand">
              <Input
                id="admin-product-brand"
                placeholder="Optional UUID or brand key"
                value={form.brandId}
                onChange={(e) => patch({ brandId: e.target.value })}
                className="font-mono text-xs sm:text-sm"
              />
            </Field>
          </div>
        </div>

        <DialogFooter className="gap-2 border-t bg-muted/30 px-6 py-4 sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSubmit}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
