"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { CopyIcon, PencilIcon } from "@/icons";
import serverCallFuction from "@/lib/constantFunction";

export default function UserMetaCard() {
  const { updateUserProfile, user } = useAuth();
  const { isOpen, openModal, closeModal } = useModal();

  // Profile picture upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picError, setPicError] = useState("");

  // Initialize state with all available user fields
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    whatsapp_no: user?.whatsappNo || "",
    aadhaar_no: user?.aadhaarNo || "",
    pan_no: user?.panNo || "",
    dob: user?.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
    gender: user?.gender || "",
    address: user?.address || "",
    city: user?.city || "",
    state: user?.state || "",
    pin: user?.pin || "",
    bank_name: user?.bankName || "",
    account_holder_name: user?.accountHolderName || "",
    account_no: user?.accountNo || "",
    ifsc_code: user?.ifscCode || "",
    branch: user?.branch || "",
    business_level: user?.businessLevel?.toString() || "0",
    gstin: user?.gstin || "",
  });

  // Sync state if user context updates
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        full_name: user.full_name || "",
        email: user.email || "",
        phone: user.phone || "",
        whatsapp_no: user.whatsappNo || "",
        aadhaar_no: user.aadhaarNo || "",
        pan_no: user.panNo || "",
        dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : "",
        gender: user.gender || "",
        address: user.address || "",
        city: user.city || "",
        state: user.state || "",
        pin: user.pin || "",
        bank_name: user.bankName || "",
        account_holder_name: user.accountHolderName || "",
        account_no: user.accountNo || "",
        ifsc_code: user.ifscCode || "",
        branch: user.branch || "",
        business_level: user.businessLevel?.toString() || "0",
        gstin: user?.gstin || "",
      }));
    }
  }, [user]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  // Handle profile picture selection & upload
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting same file
    if (!file) return;

    setPicError("");
    // Validate type & size
    if (!file.type.startsWith("image/")) {
      setPicError("Please select a valid image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPicError("Image size must be less than 5MB.");
      return;
    }

    try {
      setUploadingPic(true);

      const formDataToSend = new FormData();
      formDataToSend.append("profile", file);

      const res = await serverCallFuction(
        'POST',
        'api/users/profile-pic',
        formDataToSend
      );

      // Backend may return URL in `url`, `profile_pic`, or `data`
      const resp = res as unknown as {
        url?: string;
        profile_pic?: string;
        message?: string;
        data?: { url?: string; profile_pic?: string };
        user?: { profile_pic?: string };
      };
      const newUrl =
        resp?.url ||
        resp?.profile_pic ||
        resp?.data?.url ||
        resp?.data?.profile_pic ||
        resp?.user?.profile_pic;

      if (newUrl) {
        // Persist the new picture locally so it updates across the app
        updateUserProfile({ ...user, profile_pic: newUrl });
      } else {
        setPicError(
          res?.message || "Upload failed. Please check that the backend endpoint exists and try again."
        );
      }
    } catch (error) {
      console.error("Profile picture upload failed", error);
      setPicError("Failed to upload profile picture. Please try again.");
    } finally {
      setUploadingPic(false);
    }
  }, [updateUserProfile, user]);

  const handleSave = useCallback(async () => {
    try {
      // Mapping formData to match your Backend API expectations
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        whatsapp_no: formData.whatsapp_no,
        aadhaar_no: formData.aadhaar_no,
        pan_no: formData.pan_no,
        dob: formData.dob ? new Date(formData.dob).toISOString() : null,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        pin: formData.pin,
        bank_name: formData.bank_name,
        account_holder_name: formData.account_holder_name,
        account_no: formData.account_no,
        ifsc_code: formData.ifsc_code,
        branch: formData.branch,
        business_level: parseInt(formData.business_level) || 0,
        gstin: user?.gstin || "",
      };

      const res = await serverCallFuction(
        'PUT',
        'api/users/me/profile',
        payload
      );

      if (res?.status || res?.success) {
        // Success: Update local context
        updateUserProfile({
          ...user,
          full_name: payload.full_name,
          phone: payload.phone,
          whatsappNo: payload.whatsapp_no,
          email: payload.email,
          gender: payload.gender,
          dob: payload.dob,
          businessLevel: payload.business_level,
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
        closeModal();
      }
    } catch (error) {
      console.error("Save failed", error);
    }
  }, [formData, updateUserProfile, closeModal, user]);

  if (!user) return null;

  return (
    <>
      {/* Meta Card UI */}
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="relative group">
              <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
                <Image
                  width={80}
                  height={80}
                  src={user.profile_pic || "/images/user/owner.jpg"}
                  alt="user"
                  className="object-cover w-full h-full"
                />
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload overlay */}
              <button
                type="button"
                aria-label="Change profile picture"
                title="Change profile picture"
                disabled={uploadingPic}
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100 disabled:cursor-not-allowed"
              >
                {uploadingPic ? (
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Upload error message */}
            {picError && (
              <p className="text-xs text-red-500 order-3 xl:order-2 text-center xl:text-left">
                {picError}
              </p>
            )}
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user.full_name || user.username}
              </h4>
              {/* <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                Username : {user.username}
              </p> */}
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {user.role} - Level {user.businessLevel || 0}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.city_name}, {user.state_name}
                </p>
              </div>
            </div>
            <div className="flex items-center order-2 gap-2 grow xl:order-3 xl:justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(user.referral_code || "")}
                className="flex items-center gap-2 rounded-full border border-gray-300 bg-white text-sm font-medium text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
              >
                Referral Code - {user.referral_code || 'N/A'}<CopyIcon />
              </Button>
            </div>
          </div>
          {/* <Button
            onClick={openModal}
            size="sm"
            variant="outline"
            startIcon={<PencilIcon />}
          >
            <span style={{ textWrap: 'nowrap' }}>Edit Profile</span>
          </Button> */}
        </div>
      </div>

      {/* Modal Form */}
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Edit Personal Information
            </h4>
            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
              Update your profile details.
            </p>
          </div>

          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">

              {/* SECTION 1: SOCIAL LINKS (As seen in image_e0fc71.png) */}

              {/* SECTION 2: PERSONAL INFORMATION */}
              <div className="mt-8">
                <h5 className="mb-5 text-lg font-medium text-gray-800">Personal Information</h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>First Name</Label>
                    <Input name="full_name" value={formData.full_name} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Email Address</Label>
                    <Input name="email" value={formData.email} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input name="phone" value={formData.phone} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>WhatsApp</Label>
                    <Input name="whatsapp_no" value={formData.whatsapp_no} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>DOB</Label>
                    <Input type="date" name="dob" value={formData.dob} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Gender</Label>
                    <Input name="gender" value={formData.gender} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* SECTION 3: IDENTITY & LOCATION (Aadhaar/PAN Logic) */}
              <div className="mt-8">
                <h5 className="mb-5 text-lg font-medium text-gray-800">Identity & Location</h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Aadhaar No</Label>
                    <Input name="aadhaar_no" value={formData.aadhaar_no} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>PAN No</Label>
                    <Input name="pan_no" value={formData.pan_no} onChange={handleInputChange} />
                  </div>
                  <div className="col-span-2">
                    <Label>Address</Label>
                    <Input name="address" value={formData.address} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input name="city" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>State</Label>
                    <Input name="state" value={formData.state} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>PIN</Label>
                    <Input name="pin" value={formData.pin} onChange={handleInputChange} />
                  </div>
                </div>
              </div>

              {/* SECTION 4: BANK INFORMATION */}
              <div className="mt-8">
                <h5 className="mb-5 text-lg font-medium text-gray-800">Bank Information</h5>
                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div>
                    <Label>Bank Name</Label>
                    <Input name="bank_name" value={formData.bank_name} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Account Holder Name</Label>
                    <Input name="account_holder_name" value={formData.account_holder_name} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>Account No</Label>
                    <Input name="account_no" value={formData.account_no} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label>IFSC Code</Label>
                    <Input name="ifsc_code" value={formData.ifsc_code} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button size="sm" variant="outline" onClick={closeModal} type="button">
                Close
              </Button>
              <Button size="sm" type="submit" className="bg-pink-500 hover:bg-pink-600 text-white">
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}