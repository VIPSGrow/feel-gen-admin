"use client";
import React, { useState, useEffect } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Badge from '@/components/ui/badge/Badge';
import Button from '@/components/ui/button/Button';
import { Modal } from '@/components/ui/modal';
import { PencilIcon, TrashBinIcon } from '@/icons';

interface State {
  id: number;
  name: string;
  status: 'active' | 'inactive';
  created_at: string;
}

interface City {
  id: number;
  name: string;
  state_id: number;
  status: 'active' | 'inactive';
  created_at: string;
}

const StateCityPage = () => {
  const [activeTab, setActiveTab] = useState<'states' | 'cities'>('states');
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [statesLoading, setStatesLoading] = useState(true);
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);

  // Modals states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentItem, setCurrentItem] = useState<(State | City) | null>(null);
  const [formData, setFormData] = useState<{ name: string; status: 'active' | 'inactive'; state_id?: number; }>({ name: '', status: 'active', state_id: undefined });

  const fetchStates = async () => {
    setStatesLoading(true);
    try {
      const res = await serverCallFuction('GET', 'api/static/admin/states');
      if (res && res.status !== false) {
        setStates(res.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch states');
    }
    setStatesLoading(false);
  };

  const fetchCities = async (stateId?: number) => {
    setCitiesLoading(true);
    try {
      let endpoint = 'api/static/admin/cities';
      if (stateId) endpoint += `?state_id=${stateId}`;
      const data = await serverCallFuction('GET', endpoint);
      if (data && data.status !== false) {
        setCities(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch cities');
    }
    setCitiesLoading(false);
  };

  useEffect(() => {
    fetchStates();
    fetchCities();
  }, []);

  useEffect(() => {
    if (activeTab === 'cities') {
      fetchCities(selectedStateId || undefined);
    }
  }, [activeTab, selectedStateId]);

  const handleCreate = async () => {
    const endpoint = activeTab === 'states' ? 'api/static/admin/states' : 'api/static/admin/cities';
    const data = activeTab === 'states' ? formData : { ...formData, state_id: formData.state_id || (selectedStateId as number) };
    const res = await serverCallFuction('POST', endpoint, data);
    if (res && res.status !== false) {
      setShowAddModal(false);
      setFormData({ name: '', status: 'active' });
      if (activeTab === 'states') fetchStates();
      else fetchCities();
    }
  };

  const handleUpdate = async () => {
    if (!currentItem) return;
    const endpoint = activeTab === 'states' ? `api/static/admin/states/${currentItem.id}` : `api/static/admin/cities/${currentItem.id}`;
    const res = await serverCallFuction('PUT', endpoint, formData);
    if (res && res.status !== false) {
      setShowEditModal(false);
      setCurrentItem(null);
      if (activeTab === 'states') fetchStates();
      else fetchCities();
    }
  };

  const handleDelete = async () => {
    if (!currentItem) return;
    const endpoint = activeTab === 'states' ?
      `api/static/admin/states/${currentItem.id}` :
      `api/static/admin/cities/${currentItem.id}`;
    const res = await serverCallFuction('DELETE', endpoint);

    console.log("delete endpoints - ", endpoint);
    if (res && res.status !== false) {
      setShowDeleteModal(false);
      setCurrentItem(null);
      if (activeTab === 'states') fetchStates();
      else fetchCities();
    }
  };

  const openAdd = () => {
    setFormData({ name: '', status: 'active' });
    setShowAddModal(true);
  };

  const openEdit = (item: State | City) => {
    setFormData({ name: item.name, status: item.status as 'active' | 'inactive', ...('state_id' in item ? { state_id: item.state_id } : {}) });
    setCurrentItem(item);
    setShowEditModal(true);
  };

  const openDelete = (item: State | City) => {
    setCurrentItem(item);
    const confirm = window.confirm("are you sure you want to delete " + item.name);
    if (confirm) {
      handleDelete();
    }
    // setShowDeleteModal(true);
  };



  const getStatusColor = (status: string) => {
    return status === 'active' ? 'success' : 'primary';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-2 mb-6">
        <Button
          variant={activeTab === 'states' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('states')}
        >
          States
        </Button>
        <Button
          variant={activeTab === 'cities' ? 'primary' : 'outline'}
          onClick={() => setActiveTab('cities')}
        >
          Cities
        </Button>
      </div>

      {activeTab === 'states' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold dark:text-gray-300">States</h3>
            <Button onClick={openAdd}>Add State</Button>
          </div>
          {statesLoading ? (
            <p>Loading states...</p>
          ) : states.length === 0 ? (
            <p>No states found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">ID</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Name</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Status</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Created</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {states.map((state, index) => (
                    <TableRow key={state.id}>
                      <TableCell className="px-6 py-4 dark:text-gray-300">{index + 1}</TableCell>
                      <TableCell className="px-6 py-4 dark:text-gray-300">{state.name}</TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge color={getStatusColor(state.status)}>
                          {state.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 dark:text-gray-300">{new Date(state.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="px-6 py-4">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(state)}>
                            <Badge size="sm">
                              <PencilIcon />
                            </Badge>
                          </button>
                          {/* <button onClick={() => openDelete(state)}>
                            <Badge size="sm" color='error'>
                              <TrashBinIcon />
                            </Badge>
                          </button> */}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'cities' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold dark:text-gray-300">Cities</h3>
            <div className="flex gap-2">
              <select
                value={selectedStateId || ''}
                onChange={(e) => setSelectedStateId(e.target.value ? parseInt(e.target.value) : null)}
                className="border rounded p-2 dark:text-gray-300"
              >
                <option value="">All States</option>
                {states.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <Button onClick={openAdd}>Add City</Button>
            </div>
          </div>
          {citiesLoading ? (
            <p>Loading cities...</p>
          ) : cities.length === 0 ? (
            <p>No cities found.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                  <TableRow>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">ID</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">State</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Name</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Status</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Created</TableCell>
                    <TableCell isHeader className="px-6 py-4 font-semibold text-gray-800 dark:text-white text-left">Actions</TableCell>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {cities.map((city, index) => {
                    const stateName = states.find(s => s.id === city.state_id)?.name || 'Unknown';
                    return (
                      <TableRow key={city.id}>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{index + 1}</TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{stateName}</TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{city.name}</TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          <Badge color={getStatusColor(city.status)}>
                            {city.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(city.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          <div className="flex gap-2">
                            <Badge variant='solid' size='sm' onClick={() => openEdit(city)}>
                              <PencilIcon />
                            </Badge>
                            {/* <Badge variant='solid' color='error' size='sm' onClick={() => openEdit(city)}>
                              <TrashBinIcon />
                            </Badge> */}
                            {/* <Button variant="outline" size="sm" onClick={() => openEdit(city)}>
                              <PencilIcon />
                            </Button>
                            <Button variant="error"  size="sm" onClick={() => openDelete(city)}>
                              <TrashBinIcon />
                            </Button> */}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      )}



      {showAddModal && (
        <Modal
          // title={`${activeTab === 'states' ? 'Add State' : 'Add City'}`} 
          onClose={() => setShowAddModal(false)}
          // onSubmit={handleCreate}
          isOpen={showAddModal}
          className='max-w-lg mx-auto'
        >
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6">
              {activeTab === 'states' ? 'Add State' : 'Add City'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-800"
                  required
                />
              </div>
              {activeTab === 'cities' && (
                <div>
                  <label className="block text-sm font-medium mb-1">State *</label>
                  <select
                    value={formData.state_id || ''}
                    onChange={(e) => setFormData({ ...formData, state_id: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded dark:bg-gray-800"
                    required
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full p-2 border rounded dark:bg-gray-800"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleCreate}

              >
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddModal(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showEditModal && currentItem && (
        <Modal
          onClose={() => { setShowEditModal(false); setCurrentItem(null); }}

          isOpen={showEditModal}
          className='max-w-lg mx-auto'
        >
          <div className="p-6">
            <h2 className="text-lg font-bold mb-6">
              Edit
            </h2>
            {/* Same form as add, prefilled */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded dark:bg-gray-800"
                  required
                />
              </div>
              {'state_id' in currentItem && (
                <div>
                  <label className="block text-sm font-medium mb-1">State</label>
                  <select
                    value={formData.state_id || ''}
                    onChange={(e) => setFormData({ ...formData, state_id: parseInt(e.target.value) })}
                    className="w-full p-2 border rounded dark:bg-gray-800"
                  >
                    <option value="">Select State</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full p-2 border rounded dark:bg-gray-800"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                onClick={handleUpdate}
              >
                Update
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditModal(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>

        </Modal>
      )}


    </div>
  );
};

export default StateCityPage;

