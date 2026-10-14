"use client";
import React, { useState, useEffect } from 'react';
import serverCallFuction from '@/lib/constantFunction';
import Input from '@/components/form/input/InputField';
import RichTextEditor from '@/components/form/editor/RichTextEditor';
import Select from '@/components/form/Select';
import MultiSelect from '@/components/ui/select/MultiSelect';
import DropZone from '@/components/form/DropZone';
import Button from '@/components/ui/button/Button';
import Alert from '@/components/ui/alert/Alert';
import Label from '@/components/form/Label';
import { X as XIcon, PlusCircle, Trash2 } from 'lucide-react';
import VariantManager from '@/app/(admin)/products/add/components/VariantManager';
import { Modal } from '@/components/ui/modal';
import VariantsAccordion from '@/app/(admin)/products/add/components/VariantsAccordion';
import { Product, Tax } from '@/types/product';
import { useRouter } from 'next/navigation';
import { useSetting } from '@/context/SettingContext';
import Link from 'next/link';

interface Props {
  productId: string;
}

interface SpecificationRow {
  name: string;
  value: string;
}

const EditProductPage = ({ productId }: Props) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_desc:'',
    price: '',
    discounted_price: '',
    mrp_percentage: '',
    dpc_percentage: '',
    cat_id: '',
    subcategories: [] as string[],
    attributes: [] as string[],
    variants: [] as any[],
    f_image: null as File | null,
    g_image: [] as File[],
    status: 'active',
    tax_id: '',
    slug: '',

    // Shipping / dimensions (optional)
    hsn_code: '',
    weight: '',
    dimension_length: '',
    dimension_width: '',
    dimension_height: '',
    dimension_unit: '',

    // Custom Specifications
    specifications: [] as SpecificationRow[],
  });

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [subcategories, setSubcategories] = useState<any[]>([]);
  const [attributes, setAttributes] = useState<any[]>([]);
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [fImagePreview, setFImagePreview] = useState<string>('');
  const [gImagePreviews, setGImagePreviews] = useState<string[]>([]);
  const [attrValues, setAttrValues] = useState<Record<string, any[]>>({});
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [points_setting, set_points_setting] = useState<any>(null);

  const { settings } = useSetting();
  const router = useRouter();

  // 1. Fetch Global Data (Categories, Taxes, Attributes)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, taxRes, attrRes] = await Promise.all([
          serverCallFuction('GET', 'api/products/categories'),
          serverCallFuction('GET', 'api/tax'),
          serverCallFuction('GET', 'api/products/attributes'),
        ]);
        if (catRes?.success !== false) setCategories(catRes.data || []);
        if (taxRes?.success !== false) setTaxes(taxRes.data || []);
        if (attrRes?.success !== false) setAttributes(attrRes.data || []);
      } catch (err) {
        setError('Failed to load initial data');
      }
    };
    fetchData();
  }, []);

  // Helper to safely parse specifications from backend
  const parseSpecifications = (rawSpecs: any): SpecificationRow[] => {
    if (!rawSpecs) return [];
    try {
      const data = typeof rawSpecs === 'string' ? JSON.parse(rawSpecs) : rawSpecs;

      // Agar backend se key-value object aaya hai: { warranty: "1 year", material: "Cotton" }
      if (typeof data === 'object' && !Array.isArray(data)) {
        return Object.entries(data).map(([name, value]) => ({
          name,
          value: String(value),
        }));
      }

      // Agar array format aaya hai
      if (Array.isArray(data)) {
        return data.map((item: any) => ({
          name: item.name || '',
          value: item.value || '',
        }));
      }
    } catch (e) {
      console.error('Failed to parse specifications:', e);
    }
    return [];
  };

  // 2. Fetch Specific Product Data
  useEffect(() => {
    if (!productId) return;
    const fetchProduct = async () => {
      try {
        const res = await serverCallFuction('GET', `api/products/products/${productId}`);
        if (res.success) {
          const p = res.data as Product;
          setProduct(p);

          const loadedSpecs = parseSpecifications((p as any).specifications);

          setFormData({
            name: p.name || '',
            description: p.description || '',
            short_desc: (p as any).short_desc || '', // <-- Added
            price: p.base_price?.toString() || '0',
            discounted_price: p.discounted_price?.toString() || '',
            mrp_percentage: p.mrp_percentage?.toString() || '0',
            dpc_percentage: p.dpc_percentage?.toString() || '0',
            cat_id: p.cat_id?.toString() || '',
            subcategories: (p.subcategories || []).map((id) => id.toString()),
            attributes: (p.attributes || []).map((id) => id.toString()),
            variants: p.variants || [],
            f_image: null,
            g_image: [],
            status: p.status || 'active',
            tax_id: p.tax_id?.toString() || '',
            slug: p.slug || '',

            hsn_code: (p as any).hsn_code || '',
            weight: (p as any).weight || '',
            dimension_length: (p as any).dimension_length || '',
            dimension_width: (p as any).dimension_width || '',
            dimension_height: (p as any).dimension_height || '',
            dimension_unit: (p as any).dimension_unit || '',

            specifications: loadedSpecs,
          });
          setFImagePreview(p.f_image || '');
          setGImagePreviews(p.g_image || []);
        }
      } catch (err) {
        setError('Failed to load product details');
      }
    };
    fetchProduct();
  }, [productId]);

  // 3. Handle Subcategory Filtering logic
  useEffect(() => {
    if (formData.cat_id && categories.length > 0) {
      const filtered = categories.filter((cat) => cat.parent_id?.toString() === formData.cat_id);
      setSubcategories(filtered);
    }
  }, [formData.cat_id, categories]);

  // 4. Handle Point System Settings
  useEffect(() => {
    set_points_setting(settings?.['point_system']);
  }, [settings]);

  // Image Handlers
  const handleFeaturedImageChange = (files: File[]) => {
    if (files[0]) {
      setFormData((prev) => ({ ...prev, f_image: files[0] }));
      setFImagePreview(URL.createObjectURL(files[0]));
    }
  };

  const handleGalleryChange = (incomingFiles: File[]) => {
    if (!incomingFiles || incomingFiles.length === 0) return;
    const remainingSlots = 5 - formData.g_image.length;
    if (remainingSlots <= 0) {
      setError('Maximum of 5 gallery images allowed');
      return;
    }
    const filesToAdd = incomingFiles.slice(0, remainingSlots);
    const newPreviews = filesToAdd.map((file) => URL.createObjectURL(file));

    setGImagePreviews((prev) => [...prev, ...newPreviews]);
    setFormData((prev) => ({
      ...prev,
      g_image: [...prev.g_image, ...filesToAdd],
    }));
  };

  const removeGalleryImage = (index: number) => {
    const newFiles = formData.g_image.filter((_, i) => i !== index);
    const newPreviews = gImagePreviews.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, g_image: newFiles }));
    setGImagePreviews(newPreviews);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Specification Handlers
  const handleAddSpecification = () => {
    setFormData((prev) => ({
      ...prev,
      specifications: [...prev.specifications, { name: '', value: '' }],
    }));
  };

  const handleSpecificationChange = (index: number, field: 'name' | 'value', val: string) => {
    setFormData((prev) => {
      const updated = [...prev.specifications];
      updated[index] = { ...updated[index], [field]: val };
      return { ...prev, specifications: updated };
    });
  };

  const handleRemoveSpecification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specifications: prev.specifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setError('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('short_desc', formData.short_desc || ''); // <-- Added
      formDataToSend.append('base_price', formData.price);
      formDataToSend.append('discounted_price', formData.discounted_price || '0');
      formDataToSend.append('mrp_percentage', formData.mrp_percentage || '0');
      formDataToSend.append('dpc_percentage', formData.dpc_percentage || '0');
      formDataToSend.append('cat_id', formData.cat_id);
      formDataToSend.append('status', formData.status);
      formDataToSend.append('tax_id', formData.tax_id);
      formDataToSend.append('slug', formData.slug);

      // Shipping / dimensions (optional)
      formDataToSend.append('hsn_code', formData.hsn_code || '');
      formDataToSend.append('weight', formData.weight || '');
      formDataToSend.append('dimension_length', formData.dimension_length || '');
      formDataToSend.append('dimension_width', formData.dimension_width || '');
      formDataToSend.append('dimension_height', formData.dimension_height || '');
      formDataToSend.append('dimension_unit', formData.dimension_unit || '');

      formDataToSend.append('_method', 'PUT');

      formData.subcategories.forEach((sub) => formDataToSend.append('subcategories[]', sub));
      formData.attributes.forEach((attr) => formDataToSend.append('attributes[]', attr));

      if (formData.f_image) formDataToSend.append('f_image', formData.f_image);

      formData.g_image.forEach((image, index) => {
        formDataToSend.append(`g_image[${index}]`, image);
      });

      if (formData.variants.length > 0) {
        formDataToSend.append('variants', JSON.stringify(formData.variants));
      }

      // Convert specifications to JSON object: {"warranty": "1 year", "material": "Cotton"}
      const validSpecs = formData.specifications.filter(
        (item) => item.name.trim() !== '' && item.value.trim() !== ''
      );
      const specObject = validSpecs.reduce((acc, curr) => {
        acc[curr.name.trim()] = curr.value.trim();
        return acc;
      }, {} as Record<string, string>);

      formDataToSend.append('specifications', JSON.stringify(specObject));

      const response = await serverCallFuction(
        'PUT',
        `api/products/products/${productId}`,
        formDataToSend
      );

      if (response?.success) {
        setSuccess('Product updated successfully!');
        setTimeout(() => router.push(`/products/${productId}`), 1500);
      } else {
        setError(response?.message || 'Update failed');
      }
    } catch (err) {
      setError('An error occurred during save');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (!product) return <div className="p-10 text-center animate-pulse">Loading product...</div>;

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg mt-4 dark:bg-gray-900 border">
      {error && <Alert variant="error" title="Error" message={error} />}
      {success && <Alert variant="success" title="Success" message={success} />}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <Label>Product Name *</Label>
            <Input
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Product Name"
            />
          </div>

          <div>
            <Label>Category</Label>
            <Select
              defaultValue={formData.cat_id}
              options={categories
                .filter((cat) => !cat.parent_id)
                .map((cat) => ({ value: cat.id.toString(), label: cat.name }))}
              onChange={(val) => setFormData((prev) => ({ ...prev, cat_id: val }))}
            />
          </div>

          <div>
            <Label>Subcategories</Label>
            <MultiSelect
              value={formData.subcategories}
              options={subcategories.map((sub) => ({ value: sub.id.toString(), label: sub.name }))}
              onChange={(val) => setFormData((prev) => ({ ...prev, subcategories: val }))}
            />
          </div>

          <div>
            <Label>Status</Label>
            <Select
              defaultValue={formData.status}
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
              ]}
              onChange={(val) => setFormData((prev) => ({ ...prev, status: val }))}
            />
          </div>

          <div>
            <Label>Tax</Label>
            <Select
              defaultValue={formData.tax_id}
              options={taxes.map((tax) => ({
                value: tax.id.toString(),
                label: `${tax.name || (tax as any).tax_name} (${(tax as any).percentage || (tax as any).tax_percentage}%)`,
              }))}
              onChange={(val) => setFormData((prev) => ({ ...prev, tax_id: val }))}
            />
          </div>
        </div>

        {/* Pricing Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl">
          {/* Shipping / dimensions */}
          <div className="md:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="hsn_code">HSN Code</Label>
                <Input
                  id="hsn_code"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  placeholder="Enter HSN code"
                />
              </div>
              <div>
                <Label htmlFor="weight">Weight</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="dimension_length">Length</Label>
                <Input
                  id="dimension_length"
                  name="dimension_length"
                  type="number"
                  step="0.01"
                  value={formData.dimension_length}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="dimension_width">Width</Label>
                <Input
                  id="dimension_width"
                  name="dimension_width"
                  type="number"
                  step="0.01"
                  value={formData.dimension_width}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="dimension_height">Height</Label>
                <Input
                  id="dimension_height"
                  name="dimension_height"
                  type="number"
                  step="0.01"
                  value={formData.dimension_height}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="dimension_unit">Dimension Unit</Label>
                <Input
                  id="dimension_unit"
                  name="dimension_unit"
                  value={formData.dimension_unit}
                  onChange={handleInputChange}
                  placeholder="e.g. cm"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Base Price</Label>
            <Input type="number" name="price" value={formData.price} onChange={handleInputChange} />
          </div>
          <div>
            <Label>Discounted Price</Label>
            <Input
              type="number"
              name="discounted_price"
              value={formData.discounted_price}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <Label>MRP %</Label>
            <Input
              type="number"
              name="mrp_percentage"
              value={formData.mrp_percentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
          <div>
            <Label>DPC %</Label>
            <Input
              type="number"
              name="dpc_percentage"
              value={formData.dpc_percentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        {/* Custom Specifications Section */}
        <div className="space-y-4 border rounded-lg p-5 bg-gray-50/50 dark:bg-gray-800/40">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-semibold">Custom Specifications</Label>
              <p className="text-xs text-gray-500">
                Add or edit key-value pairs (e.g., Material: Cotton, Warranty: 1 Year)
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSpecification}
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          </div>

          {formData.specifications.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No specifications added yet.</p>
          ) : (
            <div className="space-y-3">
              {formData.specifications.map((row, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Name (e.g. Color, Material)"
                      value={row.name}
                      onChange={(e) => handleSpecificationChange(index, 'name', e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Value (e.g. Red, Cotton)"
                      value={row.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                    onClick={() => handleRemoveSpecification(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

{/* Short Description */}
<div>
  <Label htmlFor="short_desc">Short Description</Label>
  <RichTextEditor
    value={formData.short_desc}
    onChange={(val) => setFormData(prev => ({ ...prev, short_desc: val }))}
    placeholder="Enter product short description"
    className="min-h-[150px]"
  />
</div>


        <div>
          <Label>Description</Label>
          <RichTextEditor
            name="description"
            value={formData.description}
            onChange={(val) => setFormData((prev) => ({ ...prev, description: val }))}
            rows={5}
            className="min-h-[200px]"
          />
        </div>

        {/* Variations Section */}
        <div className="border-t pt-6">
          <Label className="text-lg font-semibold">Product Variations</Label>
          <div className="mt-2">
            <MultiSelect
              value={formData.attributes}
              options={attributes.map((attr) => ({ value: attr.id.toString(), label: attr.name }))}
              onChange={(val) => setFormData((prev) => ({ ...prev, attributes: val }))}
            />
          </div>

          {formData.attributes.length > 0 && (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => setShowVariantModal(true)}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {formData.variants.length > 0 ? 'Modify Variants' : 'Generate Variants'}
            </Button>
          )}
        </div>

        {formData.variants.length > 0 && (
          <VariantsAccordion
            variants={formData.variants}
            onEdit={() => setShowVariantModal(true)}
            onDelete={(idx) =>
              setFormData((prev) => ({
                ...prev,
                variants: prev.variants.filter((_, i) => i !== idx),
              }))
            }
          />
        )}

        {/* Image Upload Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 border-t pt-6">
          <div>
            <Label className="mb-2 block">Featured Image</Label>
            <DropZone onFilesChange={handleFeaturedImageChange} maxFiles={1} />
            {fImagePreview && (
              <div className="mt-3 relative w-32 h-32">
                <img
                  src={fImagePreview}
                  className="w-full h-full rounded-lg object-cover border"
                  alt="Featured"
                />
              </div>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Gallery Images</Label>
            <DropZone onFilesChange={handleGalleryChange} multiple maxFiles={5} />
            <div className="mt-3 flex flex-wrap gap-3">
              {gImagePreviews.map((url, idx) => (
                <div key={idx} className="relative group w-20 h-20">
                  <img
                    src={url}
                    className="w-full h-full rounded-md object-cover border"
                    alt="Gallery"
                  />
                  <button
                    type="button"
                    onClick={() => removeGalleryImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-4 border-t pt-6">
          <Button type="submit" disabled={submitLoading} className="px-8">
            {submitLoading ? 'Saving Changes...' : 'Update Product'}
          </Button>
          <Button variant="outline" asChild>
            <Link href={`/products/${productId}`}>Cancel</Link>
          </Button>
        </div>
      </form>

      {/* Modal for Variant Management */}
      <Modal
        isOpen={showVariantModal}
        onClose={() => setShowVariantModal(false)}
        className="max-w-4xl"
      >
        <VariantManager
          points_system={points_setting}
          selectedAttributes={formData.attributes}
          attrValues={attrValues}
          variants={formData.variants}
          onVariantsChange={(v) => setFormData((prev) => ({ ...prev, variants: v }))}
          onClose={() => setShowVariantModal(false)}
        />
      </Modal>
    </div>
  );
};

export default EditProductPage;