export interface AttributeValue {
  id: number;
  value: string;
}

export interface Attribute {
  id: number;
  name: string;
  attrvalues: AttributeValue[];
  createdAt?: string;
}

export interface AttributeFormData {
  name: string;
}
