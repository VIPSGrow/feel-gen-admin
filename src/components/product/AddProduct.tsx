"use client";
import React, { useState, useEffect } from 'react';
import serverCallFuction, { formattedAmount } from '@/lib/constantFunction';
import Input from '@/components/form/input/InputField';
import RichTextEditor from '@/components/form/editor/RichTextEditor';
import Select from '@/components/form/Select';
import MultiSelect from '@/components/ui/select/MultiSelect';
import DropZone from '@/components/form/DropZone';
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';
import Label from '@/components/form/Label';
import { Image as ImageIcon, X as XIcon, PlusCircle } from 'lucide-react';
import VariantManager from '@/app/(admin)/products/add/components/VariantManager';
import { Modal } from '@/components/ui/modal';
import VariantsAccordion from '@/app/(admin)/products/add/components/VariantsAccordion';
import { Tax } from '@/types/tax';
import { useRouter } from 'next/navigation';
import { useSetting } from '@/context/SettingContext';
import Badge from '../ui/badge/Badge';



interface Category {
  id: number;
  name: string;
  parent_id: number | null;
}


interface Subcategory {
  id: number;
  name: string;
}

interface Attribute {
  id: number;
  name: string;
}

interface AttrValue {
  id: number;
  attr_id: number;
  value: string;
}

interface Variant {
  id?: string;
  sku: string;
  price: string;
  bv_point: number;
  stock: number;
  image: File | null;
  attr_mappings: Array<{ attr_id: string; value_id: string }>;
}

const AddProductPage = () => {

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    price: '',
    discounted_price: '',
    mrp_percentage: '',
    dpc_percentage: '',
    cat_id: '',
    subcategories: [] as string[],
    attributes: [] as string[],
    variants: [] as Variant[],
    f_image: null as File | null,
    g_image: [] as File[],
    status: 'active',
    tax_id: '',

    // Shipping / dimensions (optional)
    hsn_code: '',
    weight: '',
    dimension_length: '',
    dimension_width: '',
    dimension_height: '',
    dimension_unit: '',
  });


  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<{ id: number, name: string }[]>([]);
  const [attributes, setAttributes] = useState<{ id: number, name: string }[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [fImagePreview, setFImagePreview] = useState<string>('');


  // Variant related state
  const [attrValues, setAttrValues] = useState<Record<string, { id: string, value: string }[]>>({});
  const [variants, setVariants] = useState<Variant[]>([]);
  const [showVariantModal, setShowVariantModal] = useState(false);

  const [gImagePreviews, setGImagePreviews] = useState<string[]>([]);


  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [points_setting, set_points_setting] = useState(null)

  const { settings, isLoading, getSettingByKey } = useSetting()



  // Fetch attr_values when attributes change
  useEffect(() => {
    if (formData.attributes.length === 0) {
      setAttrValues({});
      return;
    }
    const fetchAttrValues = async () => {
      try {
        const response = await serverCallFuction('GET', `api/products/attributes/values?attr_ids=${formData.attributes.join(',')}`);
        if (response && response.status !== false) {
          const grouped: Record<string, { id: string, value: string }[]> = {};
          response.data.forEach((av: AttrValue) => {
            const key = av.attr_id.toString();
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({ id: av.id.toString(), value: av.value });
          });
          setAttrValues(grouped);
        }
      } catch (err) {
        console.error('Failed to load attribute values:', err);
      }
    };
    fetchAttrValues();
  }, [formData.attributes]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, taxRes, attrRes] = await Promise.all([
          serverCallFuction('GET', 'api/products/categories'),
          serverCallFuction('GET', 'api/tax'),

          serverCallFuction('GET', 'api/products/attributes')
        ]);

        if (catRes && catRes.status !== false) setCategories(catRes.data || []);
        if (taxRes && taxRes.status !== false) setTaxes(taxRes.data || []);
        // if (subcatRes && subcatRes.status !== false) setSubcategories(subcatRes.data || []);
        if (attrRes && attrRes.status !== false) setAttributes(attrRes.data || []);




      } catch (err) {
        console.error(err);
        setError('Failed to load data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    set_points_setting(settings && settings['point_system'])
  }, [settings])




  const fetchSubcategories = async (catId: string) => {
    setSubcategories(categories.filter(cat => cat.parent_id?.toString() === catId) || []);
  }


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as keyof typeof prev]: value }));
    if (error) setError('');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, price: value }));
  };

  const handleMultiSelectChange = (field: 'subcategories' | 'attributes') => (value: string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeaturedImageChange = (files: File[]) => {
    const file = files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setFImagePreview(preview);
      setFormData(prev => ({ ...prev, f_image: file }));
    }
  };

  const handleGalleryImageChange = (files: File[]) => {
    const newFiles = files;
    const previews = newFiles.map(file => URL.createObjectURL(file));
    setGImagePreviews(previews);
    setFormData(prev => ({ ...prev, g_image: newFiles }));
  };

  const removePreview = (index: number, type: 'gallery') => {
    if (type === 'gallery') {
      const newFiles = formData.g_image.filter((_, i) => i !== index);
      const newPreviews = gImagePreviews.filter((_, i) => i !== index);
      setGImagePreviews(newPreviews);
      setFormData(prev => ({ ...prev, g_image: newFiles }));
    }
  };


  // Legacy URL handlers - to be replaced
  const handleGImageChange = (index: number, value: string) => {
    // Deprecated - use DropZone instead
  };

  const addGImage = () => {
    // Deprecated - use DropZone instead
  };

  const removeGImage = (index: number) => {
    // Deprecated - use DropZone instead
  };


  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError('Product name is required');
      return;
    }

    if (!formData.tax_id) {
      setError("Please tax");
      return
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description || '');
      formDataToSend.append('short_desc', formData.short_description || '');
      formDataToSend.append('price', formData.price || '0');
      formDataToSend.append('discounted_price', formData.discounted_price || '0');
      formDataToSend.append('mrp_percentage', formData.mrp_percentage || '0');
      formDataToSend.append('dpc_percentage', formData.dpc_percentage || '0');
      if (formData.cat_id) formDataToSend.append('cat_id', formData.cat_id);
      formData.subcategories.forEach(sub => formDataToSend.append('subcategories[]', sub));
      formData.attributes.forEach(attr => formDataToSend.append('attributes[]', attr));
      if (formData.f_image) formDataToSend.append('f_image', formData.f_image);
      formData.g_image.forEach((image, index) => {
        formDataToSend.append(`g_image[${index}]`, image);
      });
      formDataToSend.append('status', formData.status);
      formDataToSend.append('tax_id', formData.tax_id);

      // Shipping / dimensions (optional)
      formDataToSend.append('hsn_code', formData.hsn_code || '');
      formDataToSend.append('weight', formData.weight || '');
      formDataToSend.append('dimension_length', formData.dimension_length || '');
      formDataToSend.append('dimension_width', formData.dimension_width || '');
      formDataToSend.append('dimension_height', formData.dimension_height || '');
      formDataToSend.append('dimension_unit', formData.dimension_unit || '');

      // Append variants
      if (formData.variants && formData.variants.length > 0) {
        formDataToSend.append('variants', JSON.stringify(formData.variants));
      }

      const response = await serverCallFuction('POST', 'api/products/products', formDataToSend);

      if (response && response.success === true) {
        setSuccess('Product created successfully!');
setFormData({
           name: '',
           description: '',
           short_description: '',
           price: '',
           discounted_price: '',
           mrp_percentage: '',
           dpc_percentage: '',
           cat_id: '',
           subcategories: [],
           attributes: [],
           variants: [],
           f_image: null,
           g_image: [],
           status: 'active',
           tax_id: '',

           hsn_code: '',
           weight: '',
           dimension_length: '',
           dimension_width: '',
           dimension_height: '',
           dimension_unit: '',
         });
        setFImagePreview('');
        setGImagePreviews([]);
        setTimeout(() => {
          router.push('/products')
        }, 2000);
      } else {
        setError(response?.message || 'Failed to create product');
      }

    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg mt-4" >


      {error && <Alert variant="error" title="Error" message={error} />}
      {success && <Alert variant="success" title="Success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              name="name"
              placeholder="Enter product name"
              defaultValue={formData.name}
              onChange={handleInputChange}
              error={!!error && !formData.name}
            />
          </div>

          <div>
            <Label htmlFor="cat_id">Category</Label>
            <Select
              options={categories.filter(cat => cat.parent_id == null).map(cat => ({ value: cat.id.toString(), label: cat.name }))}
              placeholder="Select category"
              onChange={(value) => {
                setFormData(prev => ({ ...prev, cat_id: value }))
                fetchSubcategories(value);
              }}
              defaultValue={formData.cat_id}
            />


          </div>
          <div>
            <Label>Subcategories</Label>
            <MultiSelect
              options={subcategories.map(sub => ({ value: sub.id.toString(), label: sub.name }))}
              value={formData.subcategories}
              onChange={handleMultiSelectChange('subcategories')}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
              onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
              defaultValue={formData.status}
            />


          </div>

          <div>
            <Label htmlFor="tax_id">Tax</Label>
            <Select
              options={taxes.map(tax => ({ value: tax.id.toString(), label: `${tax.tax_name} - (${tax.tax_percentage}%)` }))}
              placeholder="Select tax"
              onChange={(value) => setFormData(prev => ({ ...prev, tax_id: value }))}
              defaultValue={formData.tax_id}
            />


          </div>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => {
              setFormData({ ...formData, description: value })
            }}
            placeholder="Enter product description"
            className="min-h-[200px]"
          />
        </div>
        <div>
          <Label htmlFor="description">Short Description</Label>
          <RichTextEditor
            value={formData.short_description}
            onChange={(value) => {
              setFormData({ ...formData, short_description: value })
            }}
            placeholder="Enter product short description"
            className="min-h-[150px]"
          />
        </div>

        {/* Price field */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Shipping / dimensions (optional) */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="hsn_code">HSN Code</Label>
                <Input
                  id="hsn_code"
                  name="hsn_code"
                  placeholder="Enter HSN code"
                  defaultValue={formData.hsn_code}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={formData.weight}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="dimension_length">Length</Label>
                <Input
                  id="dimension_length"
                  name="dimension_length"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={formData.dimension_length}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="dimension_width">Width</Label>
                <Input
                  id="dimension_width"
                  name="dimension_width"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={formData.dimension_width}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="dimension_height">Height</Label>
                <Input
                  id="dimension_height"
                  name="dimension_height"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  defaultValue={formData.dimension_height}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="dimension_unit">Dimension Unit</Label>
                <Input
                  id="dimension_unit"
                  name="dimension_unit"
                  placeholder="e.g. cm"
                  defaultValue={formData.dimension_unit}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div>
            <Label htmlFor="price">Price *</Label>
            <Input
              id="price"
              name="price"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={formData.price}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="discounted_price">Discounted Price </Label>
            <Input
              id="discounted_price"
              name="discounted_price"
              type="number"
              step="0.01"
              placeholder="0.00"
              defaultValue={formData.discounted_price}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="mrp_percentage">MRP %</Label>
            <Input
              id="mrp_percentage"
              name="mrp_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0.00"
              defaultValue={formData.mrp_percentage}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label htmlFor="dpc_percentage">DPC %</Label>
            <Input
              id="dpc_percentage"
              name="dpc_percentage"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="0.00"
              defaultValue={formData.dpc_percentage}
              onChange={handleInputChange}
            />
          </div>


          {/* point syatem */}
          {((formData.discounted_price || formData.price) && points_setting) &&
            <div className='text-sm bg-brand-200 rounded-lg p-4'>
              <Label>Points calculation</Label>

              <ul className='flex gap-4'>
                <li><Badge> PV - {formattedAmount(
                  (parseFloat(formData.discounted_price) > 0
                    ? parseFloat(formData.discounted_price)
                    : parseFloat(formData.price)) * parseFloat(points_setting.pv)
                )}</Badge> </li>
                <li><Badge> BV - {formattedAmount(
                  (parseFloat(formData.discounted_price) > 0
                    ? parseFloat(formData.discounted_price)
                    : parseFloat(formData.price)) * parseFloat(points_setting.bv) / 100
                )}</Badge> </li>
                <li><Badge> UV - {formattedAmount((
                  (parseFloat(formData.discounted_price) > 0
                    ? parseFloat(formData.discounted_price)
                    : parseFloat(formData.price))
                  * parseFloat(points_setting.uv)) / 100)}</Badge> </li>
              </ul>

            </div>
          }



        </div>

        {/* New fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            <Label>Attributes</Label>
            <MultiSelect
              options={attributes.map(attr => ({ value: attr.id.toString(), label: attr.name }))}
              value={formData.attributes}
              onChange={handleMultiSelectChange('attributes')}
            />
            {formData.attributes.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowVariantModal(true);
                }}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Manage Variants
              </Button>
            )}
          </div>

        </div>
        {formData.variants.length > 0 && (
          <VariantsAccordion
            variants={formData.variants}
            onEdit={() => setShowVariantModal(true)}
            onVariantChange={(index, field, value) => {
              const newVariants = [...formData.variants];
              (newVariants[index] as any)[field] = value;

              if (field === "price") {
                (newVariants[index] as any).pv_point = (value * points_setting.pv);
                (newVariants[index] as any).bv_point = (value * points_setting.bv) / 100;
                (newVariants[index] as any).uv_point = (value * points_setting.uv) / 100;
              }


              setFormData(prev => ({ ...prev, variants: newVariants }));
            }}
            onDelete={(index) => {
              const newVariants = formData.variants.filter((_, i) => i !== index);
              setFormData(prev => ({ ...prev, variants: newVariants }));
            }}
          />
        )}

        {/* Variant Modal */}
        <Modal isOpen={showVariantModal} onClose={() => setShowVariantModal(false)} className='max-w-4xl mx-auto max-h-[90vh]'>
          <VariantManager
            points_system={points_setting}
            selectedAttributes={formData.attributes}
            attrValues={attrValues}
            variants={formData.variants}
            onVariantsChange={(newVariants) => {
              setFormData(prev => ({ ...prev, variants: newVariants }));
            }}
            onClose={() => setShowVariantModal(false)}
          />
        </Modal>


        {/* Image uploads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Label>Featured Image</Label>
            <DropZone
              onFilesChange={handleFeaturedImageChange}
              maxFiles={1}
              label="Drag & drop featured image or click to browse"
            />
            {fImagePreview && (
              <div className="mt-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center gap-3">
                  <ImageIcon className="h-8 w-8 text-gray-500" />
                  <div className="flex-1">
                    <p className="font-medium">Featured Image Preview</p>
                    <img src={fImagePreview} alt="Preview" className="mt-2 max-h-32 rounded object-cover" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div>
            <Label>Gallery Images</Label>
            <DropZone
              onFilesChange={handleGalleryImageChange}
              multiple
              maxFiles={5}
              label="Drag & drop gallery images or click to browse (max 5)"
            />
            {gImagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
                {gImagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img src={preview} alt={`Preview ${index}`} className="w-full h-24 object-cover rounded-lg" />
                    <button
                      onClick={() => removePreview(index, 'gallery')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Old URL fields - deprecated */}
        <div className="space-y-4 opacity-50">
          <Label>Gallery Images URLs (Deprecated - use DropZone above)</Label>
          {/* Old code kept for reference but hidden */}
        </div>


        <div className="flex gap-3 pt-4 border-t">
          <Button disabled={submitLoading || !formData.name.trim()}
            type='submit'
          >
            {submitLoading ? 'Creating...' : 'Create Product'}
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Cancel
          </Button>

        </div>
      </form>
    </div>
  );
};

export default AddProductPage;