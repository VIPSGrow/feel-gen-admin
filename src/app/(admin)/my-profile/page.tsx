"use client";
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import serverCallFuction from '@/lib/constantFunction';


const ProfilePage = () => {
  const { user, updateUserProfile } = useAuth();

  const getUserString = (value: unknown): string => {
    if (typeof value === 'string') return value;
    if (value === null || value === undefined) return '';
    return String(value);
  };


  const [formData, setFormData] = useState<{
    full_name: string;
    phone: string;
    whatsapp_no: string;
    email: string;
    gender: string;
    dob: string;
    business_level: string;
  }>({
    full_name: '',
    phone: '',
    whatsapp_no: '',
    email: '',
    gender: '',
    dob: '',
    business_level: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) return;

    const whatsappNo =
      typeof (user as { whatsapp_no?: string }).whatsapp_no === 'string'
        ? (user as { whatsapp_no?: string }).whatsapp_no
        : typeof (user as { whatsappNo?: string }).whatsappNo === 'string'
          ? (user as { whatsappNo?: string }).whatsappNo
          : '';

    const gender = typeof (user as { gender?: string }).gender === 'string' ? (user as { gender?: string }).gender : '';

    const dobStr =
      typeof (user as { dob?: string }).dob === 'string'
        ? String((user as { dob?: string }).dob).slice(0, 10)
        : '';

    const businessLevelRaw =
      user.businessLevel ?? (user as { business_level?: string | number }).business_level ?? '';

    setFormData({
      full_name: user.full_name || user.username || '',
      phone: user.phone || '',
      whatsapp_no: whatsappNo,
      email: user.email || '',
      gender,
      dob: dobStr,
      business_level: String(businessLevelRaw),
    });
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage('');

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        whatsapp_no: formData.whatsapp_no,
        aadhaar_no: '',
        pan_no: '',
        dob: formData.dob ? new Date(formData.dob).toISOString() : '',
        gender: formData.gender,
        address: '',
        city: '',
        state: '',
        pin: '',
        bank_name: '',
        account_holder_name: '',
        account_no: '',
        ifsc_code: '',
        branch: '',
      };

      const res = await serverCallFuction<any>(
        'PUT',
        'api/users/me/profile',
        payload
      );

      if (res.status) {
        if (res?.data) {
          updateUserProfile(res.data as any);
        } else if (res?.user) {
          updateUserProfile(res.user as any);
        } else {
          updateUserProfile({
            full_name: formData.full_name,
            phone: formData.phone,
            whatsappNo: formData.whatsapp_no,
            email: formData.email,
            gender: formData.gender,
            dob: payload.dob,
            businessLevel: Number.isFinite(Number(formData.business_level))
              ? parseInt(formData.business_level, 10) || 0
              : 0,
            aadhaarNo: payload.aadhaar_no,
            panNo: payload.pan_no,
            address: payload.address,
            city: payload.city,
            state: payload.state,
            pin: payload.pin,
            bankName: payload.bank_name,
            accountHolderName: payload.account_holder_name,
            accountNo: payload.account_no,
            ifscCode: payload.ifsc_code,
            branch: payload.branch,
          });
        }
      } else {
        throw new Error(res.message || 'Failed to update profile');
      }

      // If backend returns updated user, prefer it. Otherwise update context with submitted values.


      setMessage('Profile updated successfully!');
    } catch {
      setMessage('Failed to update profile');
    } finally {
      setLoading(false);
    }

  };

  if (!user) {
    return (
      <div className="space-y-6 p-6">
        <div className="border border-gray-200 rounded-2xl bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
            My Profile
          </h3>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="border border-gray-200 rounded-2xl bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-6 text-2xl font-semibold text-gray-800 dark:text-white/90">
          My Profile
        </h3>

        {message && (
          <div
            className={`p-4 rounded-lg mb-6 ${message.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border border-gray-200 rounded-2xl p-6 dark:border-gray-800">
            <h4 className="text-lg font-semibold mb-6 text-gray-800 dark:text-white/90">
              Personal Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input name="full_name" value={formData.full_name} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input name="phone" value={formData.phone} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>WhatsApp</Label>
                <Input name="whatsapp_no" value={formData.whatsapp_no} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input name="email" value={formData.email} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Gender</Label>
                <Input name="gender" value={formData.gender} onChange={handleInputChange} placeholder="Male/Female/Other" />
              </div>

              <div className="space-y-2">
                <Label>DOB</Label>
                <Input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
              </div>

              <div className="space-y-2">
                <Label>Business Level</Label>
                <Input
                  type="number"
                  name="business_level"
                  value={formData.business_level}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : 'Save Profile'}
            </Button>


            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (!user) return;
                setFormData({
                  full_name: user.full_name || user.username || '',
                  phone: user.phone || '',
                  whatsapp_no:
                    typeof (user as { whatsapp_no?: string }).whatsapp_no === 'string'
                      ? (user as { whatsapp_no?: string }).whatsapp_no
                      : typeof (user as { whatsappNo?: string }).whatsappNo === 'string'
                        ? (user as { whatsappNo?: string }).whatsappNo
                        : '',

                  email: user.email || '',
                  gender:
                    typeof (user as { gender?: string }).gender === 'string'
                      ? (user as { gender?: string }).gender || ''
                      : '',
                  dob:
                    typeof (user as { dob?: string }).dob === 'string'
                      ? String((user as { dob?: string }).dob || '').slice(0, 10)
                      : '',
                  business_level:
                    (
                      user.businessLevel ??
                      (user as { business_level?: string | number }).business_level ??
                      ''
                    ).toString(),
                });
                setMessage('');
              }}
            >
              Reset
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;


