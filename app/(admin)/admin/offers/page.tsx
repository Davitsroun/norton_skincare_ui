'use client';

import { AdminPageShell } from '@/components/admin-page-shell';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useState } from 'react';
import { Plus, Edit2, Trash2, Calendar, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const offersData = [
  {
    id: 1,
    name: 'Summer Sale - 20% Off',
    code: 'SUMMER20',
    discount: '20%',
    type: 'Percentage',
    status: 'Active',
    startDate: '01 Jun 2024',
    endDate: '31 Aug 2024',
    usageCount: 342,
    maxUsage: 1000,
  },
  {
    id: 2,
    name: 'Welcome Bonus',
    code: 'WELCOME10',
    discount: '$10',
    type: 'Fixed',
    status: 'Active',
    startDate: '01 Jan 2024',
    endDate: '31 Dec 2024',
    usageCount: 1248,
    maxUsage: 2000,
  },
  {
    id: 3,
    name: 'Flash Sale - 30% Off',
    code: 'FLASH30',
    discount: '30%',
    type: 'Percentage',
    status: 'Scheduled',
    startDate: '15 Jul 2024',
    endDate: '17 Jul 2024',
    usageCount: 0,
    maxUsage: 500,
  },
  {
    id: 4,
    name: 'Expired Offer',
    code: 'EXPIRED50',
    discount: '50%',
    type: 'Percentage',
    status: 'Expired',
    startDate: '01 May 2024',
    endDate: '31 May 2024',
    usageCount: 856,
    maxUsage: 1000,
  },
];

export default function AdminOffers() {
  const { toast } = useToast();
  const [offers, setOffers] = useState(offersData);
  const [selectedOffers, setSelectedOffers] = useState<number[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [offerToDelete, setOfferToDelete] = useState<number | null>(null);

  const handleToggleStatus = (offerId: number) => {
    const offer = offers.find(o => o.id === offerId);
    const newStatus = offer?.status === 'Active' ? 'Expired' :
                     offer?.status === 'Scheduled' ? 'Active' : 'Active';
    setOffers(offers.map(o =>
      o.id === offerId ? { ...o, status: newStatus } : o
    ));
    toast({
      title: 'Offer Updated',
      description: `${offer?.name} status changed to ${newStatus}.`,
    });
  };

  const handleDeleteOffer = (offerId: number) => {
    setOfferToDelete(offerId);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteOffer = () => {
    if (offerToDelete) {
      const offer = offers.find(o => o.id === offerToDelete);
      setOffers(offers.filter(o => o.id !== offerToDelete));
      setSelectedOffers(selectedOffers.filter(id => id !== offerToDelete));
      toast({
        title: 'Offer Deleted',
        description: `${offer?.name} has been deleted successfully.`,
      });
      setShowDeleteConfirm(false);
      setOfferToDelete(null);
    }
  };

  const handleSelectOffer = (offerId: number) => {
    setSelectedOffers(prev =>
      prev.includes(offerId)
        ? prev.filter(id => id !== offerId)
        : [...prev, offerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOffers.length === offers.length) {
      setSelectedOffers([]);
    } else {
      setSelectedOffers(offers.map(o => o.id));
    }
  };

  return (
    <AdminPageShell title="Promotions & Offers" description="Create and manage discount codes">
        {/* Create Button */}
        <div className="mb-6 flex justify-end">
          <button className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-semibold transition-all shadow-md">
            <Plus className="w-5 h-5" />
            Create Offer
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Total Offers</p>
            <p className="text-3xl font-bold text-gray-900">{offersData.length}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Active Offers</p>
            <p className="text-3xl font-bold text-gray-900">
              {offersData.filter((o) => o.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Total Usage</p>
            <p className="text-3xl font-bold text-gray-900">
              {offersData.reduce((sum, o) => sum + o.usageCount, 0)}
            </p>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
            <p className="text-gray-600 text-sm mb-2">Avg. Discount</p>
            <p className="text-3xl font-bold text-gray-900">18.75%</p>
          </div>
        </div>

        {/* Offers Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Active & Scheduled Offers</h2>
            {selectedOffers.length > 0 && (
              <button 
                onClick={() => {
                  selectedOffers.forEach(id => handleDeleteOffer(id));
                  setSelectedOffers([]);
                }}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-semibold hover:bg-red-200 transition-all"
              >
                Delete Selected ({selectedOffers.length})
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Offer Name</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Code</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Discount</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Date Range</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Usage</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr 
                    key={offer.id} 
                    className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedOffers.includes(offer.id) ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded cursor-pointer"
                        checked={selectedOffers.includes(offer.id)}
                        onChange={() => handleSelectOffer(offer.id)}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{offer.name}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-lg w-fit">
                        <Tag className="w-4 h-4 text-gray-600" />
                        <code className="text-sm font-semibold text-gray-900">{offer.code}</code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{offer.discount}</p>
                      <p className="text-xs text-gray-500">{offer.type}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-xs">{offer.startDate} - {offer.endDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${(offer.usageCount / offer.maxUsage) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">
                          {offer.usageCount}/{offer.maxUsage}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(offer.id)}
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition-all ${
                          offer.status === 'Active' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                          offer.status === 'Scheduled' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                          'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {offer.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button 
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
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
          title="Delete Offer"
          description={`Are you sure you want to delete this offer? This action cannot be undone.`}
          cancelText="Cancel"
          confirmText="Delete Offer"
          isDangerous={true}
          onCancel={() => {
            setShowDeleteConfirm(false);
            setOfferToDelete(null);
          }}
          onConfirm={confirmDeleteOffer}
        />
      </AdminPageShell>
  );
}

