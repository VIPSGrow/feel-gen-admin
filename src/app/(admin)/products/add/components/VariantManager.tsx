"use client";

import React, { useEffect } from 'react';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';

interface VariantManagerProps {
  selectedAttributes: string[];
  attrValues: Record<string, { id: string, value: string }[]>;
  variants: Array<{ id: string; sku: string, price: string, pv_point: number, bv_point: number, uv_point: number, stock: number, attr_mappings: Array<{ attr_id: string, value_id: string }> }>;
  onVariantsChange: (variants: Array<{ id: string; sku: string, price: string, bv_point: number, stock: number, attr_mappings: Array<{ attr_id: string, value_id: string }> }>) => void;
  onClose?: () => void;
  points_system?: Record<string, { bv: number, bv_type: string, pv: number, uv: number, uv_type: string, uv_value: number }>;
}

const VariantManager: React.FC<VariantManagerProps> = ({
  selectedAttributes,
  attrValues,
  variants,
  onVariantsChange,
  onClose,
  points_system
}) => {


  const [generating, setGenerating] = React.useState(false);

  const canGenerate = selectedAttributes.length > 0 && Object.values(attrValues).some(values => values.length > 0);

  const handleGenerate = () => {
    setGenerating(true);
    const generateVariants = (attrs: string[]) => {
      const result: Record<string, string>[] = [{}];
      attrs.forEach(attrId => {
        const values = attrValues[attrId] || [];
        const newResult: Record<string, string>[] = [];
        result.forEach(r => {
          values.forEach(val => {
            newResult.push({ ...r, [attrId]: val.id });
          });
        });
        result.splice(0, result.length, ...newResult);
      });



      return result.map((combo, index) => {

        const attrPart = Object.entries(combo)
          .map(([attrId, valId]) => {
            const valObj = attrValues[attrId]?.find(v => v.id === valId);
            // Get first 3 letters, remove spaces, uppercase
            return valObj?.value.replace(/\s+/g, '').slice(0, 3).toUpperCase() || valId.toString().slice(0, 3);
          })
          .join('-');
        // Generate a short unique hash to prevent DB 'Unique Constraint' errors
        const uniqueSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();

        return {
          id: `variant-${Date.now()}-${index}`,
          sku: attrPart ? `${attrPart}-${index + 1}-${uniqueSuffix}` : `PROD-${index + 1}-${uniqueSuffix}`,
          price: '0.00',
          bv_point: 0,
          stock: 0,
          attr_mappings: Object.entries(combo).map(([attr_id, value_id]) => ({ attr_id, value_id: value_id as string }))
        }
      });
    };
    const newVariants = generateVariants(selectedAttributes);
    onVariantsChange(newVariants);
    setTimeout(() => setGenerating(false), 500);
  };

  const handleUpdateField = (index: number, field: 'sku' | 'price' | 'bv_point' | 'stock', value: string | number) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;


    if (field === "price") {
      (newVariants[index] as any).pv_point = (value * points_system.pv);
      (newVariants[index] as any).bv_point = (value * points_system.bv) / 100;
      (newVariants[index] as any).uv_point = (value * points_system.uv) / 100;
    }
    onVariantsChange(newVariants);
  };

  const handleDelete = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onVariantsChange(newVariants);
  };


  // This checks if any variant is missing required data
  const isInvalid = variants.length === 0 || variants.some(v =>
    !v.price ||
    parseFloat(v.price) <= 0 ||
    v.stock === undefined ||
    v.stock === null ||
    v.stock < 1
  );

  console.log("variants - ", variants, isInvalid);

  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Manage Variants</h3>
      <p className="text-sm text-gray-600 mb-4">Variant combinations will be generated from selected attributes.</p>
      <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
        <Button
          onClick={handleGenerate}
          disabled={!canGenerate || generating}
          className="mb-4"
        >
          {generating ? 'Generating...' : 'Generate Variants from Attributes'}
        </Button>
        {!canGenerate && <p className="text-sm text-orange-600 mb-4">Select attributes with values first.</p>}
        <div className="mb-4 text-sm font-medium text-gray-700">Total Variants: {variants.length}</div>
        <div className="grid gap-4 max-h-96 overflow-y-auto">
          {variants.map((variant, index) => (
            <div key={variant.id || index} className="border p-4 rounded-lg flex gap-3 items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="font-medium text-lg">Variant {index + 1}</h4>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{variant.sku}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">SKU</label>
                    <Input disabled placeholder="SKU" defaultValue={variant.sku || ''} onChange={(e) => handleUpdateField(index, 'sku', e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Price</label>
                    <Input type="number" placeholder="Price" onChange={(e) => handleUpdateField(index, 'price', e.target.value)} />
                  </div>
                  <div className='flex gap-2'>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">PV Point</label>
                      <Input type="number" disabled placeholder="BV Point" defaultValue={variant.pv_point || 0} onChange={(e) => handleUpdateField(index, 'bv_point', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">BV Point</label>
                      <Input type="number" disabled placeholder="BV Point" defaultValue={variant.bv_point || 0} onChange={(e) => handleUpdateField(index, 'bv_point', parseFloat(e.target.value) || 0)} />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-600 mb-1 block">UV Point</label>
                      <Input type="number" disabled placeholder="BV Point" defaultValue={variant.uv_point || 0} onChange={(e) => handleUpdateField(index, 'bv_point', parseFloat(e.target.value) || 0)} />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Stock</label>
                    <Input type="number" placeholder="Stock" onChange={(e) => handleUpdateField(index, 'stock', parseInt(e.target.value) || 0)} />
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => handleDelete(index)} className="shrink-0 mt-2">
                Delete
              </Button>
            </div>
          ))}
        </div>
        {variants.length === 0 && <p className="text-gray-500 text-center py-8">No variants generated yet. Click button above.</p>}
        <div className="flex gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={() => onClose?.()} disabled={variants.length === 0 || isInvalid} className="font-medium">
            Save & Close ({variants.length})
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VariantManager;

