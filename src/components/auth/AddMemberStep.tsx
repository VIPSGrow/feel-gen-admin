"use client";
import React, { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Button from '@/components/ui/button/Button';
import Checkbox from '@/components/form/input/Checkbox';
import serverCallFuction from '@/lib/constantFunction';
import { States } from '@/types/static-content';
import { useAuth } from '@/context/AuthContext';
import { useSetting } from '@/context/SettingContext';
import Link from 'next/link';

interface GstCheckResponse {
    status: boolean;
    exists: boolean;
    message: string;
}

export default function AddMemberStep() {
    const { user } = useAuth();
    const { settings, getSettingByKey } = useSetting();
    const contact_data = getSettingByKey("contact_us");

    const [step, setStep] = useState(1);
    const [gstCheckResponse, setGstCheckResponse] = useState<GstCheckResponse | null>(null);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [states, setStates] = useState<States[]>([]);
    const [cities, setCities] = useState<States[]>([]);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);
    const [isCheckingGST, setIsCheckingGST] = useState(false);
    const [gstExists, setGstExists] = useState(false);

    const [formData, setFormData] = useState({
        // Step 1: Applicant Details
        fullName: '',
        aadhaarNo: '',
        dob: '',
        gender: '',
        panNo: '',
        email: '',
        whatsappNo: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        pin: '',

        // Step 2: Bank Details
        username: '',
        password: '',
        bankName: '',
        accountHolderName: '',
        accountNo: '',
        ifscCode: '',
        branch: '',

        // Step 3: Referral & Nominee
        referralCode: '',
        referrer_id: '',
        referrerName: '',
        referrerContact: '',
        nomineeName: '',
        nomineeRelationship: '',
        nomineeAge: '',
        nomineeContact: '',
        nomineeAadhaar: '',

        // Step 4: Business Level & GST
        businessLevel: '',
        agreedToTerms: false,
        gstin: ''
    });

    // 1. Load initial data on mount
    useEffect(() => {
        const refCode = searchParams?.get('ref');
        const savedData = localStorage.getItem('sakhi_registration_draft');
        const savedStepStr = localStorage.getItem('sakhi_registration_step');

        const savedObj = savedData ? JSON.parse(savedData) : {};
        let initialFormData = { ...formData, ...savedObj };

        if (refCode && !initialFormData.referralCode) {
            initialFormData = { ...initialFormData, referralCode: refCode };
        }

        setFormData(initialFormData);

        let initialStep = 1;
        if (savedStepStr && !isNaN(parseInt(savedStepStr, 10))) {
            initialStep = Math.max(1, Math.min(5, parseInt(savedStepStr, 10)));
        }
        setStep(initialStep);

    }, []);

    // 2. Save draft to localStorage
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            localStorage.setItem('sakhi_registration_draft', JSON.stringify(formData));
            localStorage.setItem('sakhi_registration_step', step.toString());
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [formData, step]);

    const fetchReferral = useCallback(async (code: string) => {
        if (!code?.trim()) return;

        try {
            const res = await serverCallFuction('GET', `api/users/profile-by-referral?referral_code=${code}`);
            if (res.status) {
                const data = res.user;
                setFormData(prev => ({ ...prev, referrer_id: data.id, referrerName: data.name }));
                setFieldErrors(prev => { const n = { ...prev }; delete n.referralCode; return n; });
                setError("");
            } else {
                setFieldErrors({ referralCode: 'Invalid referral code' });
            }
        } catch (error) {
            console.error('Referral fetch error:', error);
        }
    }, []);

    const fetchStates = async () => {
        try {
            setIsLoadingStates(true);
            const res = await serverCallFuction('GET', 'api/static/states');
            if (res.status && Array.isArray(res.data)) {
                setStates(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch states:', error);
        } finally {
            setIsLoadingStates(false);
        }
    };

    const fetchCities = async (stateId: string) => {
        if (!stateId) {
            setCities([]);
            return;
        }
        try {
            setIsLoadingCities(true);
            const res = await serverCallFuction('GET', `api/static/cities/${stateId}`);
            if (res.status && Array.isArray(res.data)) {
                setCities(res.data);
                setFormData(prev => ({ ...prev, city: '' }));
            }
        } catch (error) {
            console.error('Failed to fetch cities:', error);
            setCities([]);
        } finally {
            setIsLoadingCities(false);
        }
    };

    useEffect(() => {
        fetchStates();
    }, []);

    useEffect(() => {
        fetchCities(formData.state);
    }, [formData.state]);

    useEffect(() => {
        if (!formData.referralCode?.trim()) return;
        fetchReferral(formData.referralCode);
    }, [formData.referralCode, fetchReferral]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 5) {
            setHasScrolledToBottom(true);
        }
    };

    // GSTIN check logic
    const checkGST = useCallback(async (gstNo: string) => {
        if (!gstNo || gstNo.trim().length !== 15) return;

        try {
            setIsCheckingGST(true);
            const res = await serverCallFuction('GET', `api/users/checkGST/${gstNo}`) as GstCheckResponse;
            setIsCheckingGST(false);
            setGstCheckResponse(res);

            if (res?.status) {
                if (res.exists) {
                    setGstExists(true);
                    setFieldErrors(prev => ({ ...prev, gstin: 'This GSTIN already exists. Please enter a different one.' }));
                } else {
                    setGstExists(false);
                    setFieldErrors(prev => { const n = { ...prev }; delete n.gstin; return n; });
                }
            } else {
                if (res.exists) {
                    setGstExists(true);
                    setFieldErrors(prev => ({ ...prev, gstin: 'This GSTIN already exists. Please enter a different one.' }));
                } else {
                    setGstExists(false);
                }
            }
        } catch (error) {
            console.error('GST check error:', error);
            setIsCheckingGST(false);
            setGstExists(false);
            setFieldErrors(prev => { const n = { ...prev }; delete n.gstin; return n; });
        }
    }, []);

    useEffect(() => {
        if (step !== 5) return;
        const gstinValue = formData.gstin?.trim() || '';
        if (gstinValue.length !== 15) {
            setGstExists(false);
            setFieldErrors(prev => { const n = { ...prev }; delete n.gstin; return n; });
            return;
        }
        const timer = setTimeout(() => {
            checkGST(gstinValue);
        }, 600);
        return () => clearTimeout(timer);
    }, [formData.gstin, step, checkGST]);

    // Validation Logic
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const phoneRegex = /^[6-9]\d{9}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const aadhaarRegex = /^\d{12}$/;

    const isStepValid = () => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (formData.referralCode.trim().length < 1) newErrors.referralCode = "Please enter Referral Code";
            if (formData.referrerName.trim().length < 1) newErrors.referralCode = "Please enter valid Referral Code";
        }

        if (step === 2) {
            if (formData.fullName.trim().length <= 2) newErrors.fullName = "Name must be at least 3 characters";

            if (!formData.aadhaarNo) {
                newErrors.aadhaarNo = "Aadhaar Number is required";
            } else if (!aadhaarRegex.test(formData.aadhaarNo)) {
                newErrors.aadhaarNo = "Aadhaar must be exactly 12 digits";
            }

            if (!panRegex.test(formData.panNo.toUpperCase())) newErrors.panNo = "Invalid PAN format (e.g. ABCDE1234F)";
            if (!phoneRegex.test(formData.phone)) newErrors.phone = "Enter valid 10-digit phone number";
            if (!phoneRegex.test(formData.whatsappNo)) newErrors.whatsappNo = "Enter valid 10-digit WhatsApp number";
            if (!emailRegex.test(formData.email)) newErrors.email = "Invalid email address";

            if (!formData.dob) {
                newErrors.dob = "Date of Birth is required";
            } else {
                const selectedDate = new Date(formData.dob);
                const today = new Date();

                let age = today.getFullYear() - selectedDate.getFullYear();
                const monthDiff = today.getMonth() - selectedDate.getMonth();
                const dayDiff = today.getDate() - selectedDate.getDate();

                if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
                    age--;
                }

                if (isNaN(selectedDate.getTime())) {
                    newErrors.dob = "Please enter a valid Date of Birth";
                } else if (age < 21) {
                    newErrors.dob = "You must be at least 21 years old to register";
                } else if (selectedDate.getFullYear() < 1900) {
                    newErrors.dob = "Please enter a realistic year";
                }
            }

            if (!formData.city) newErrors.city = "Please select your city";
            if (formData.pin.length !== 6) newErrors.pin = "PIN code must be 6 digits";
        }

        if (step === 3) {
            if (!formData.accountHolderName) newErrors.accountHolderName = "Name is required";
            if (formData.accountNo.length < 9) newErrors.accountNo = "Account number is too short";
            if (!ifscRegex.test(formData.ifscCode.toUpperCase())) newErrors.ifscCode = "Invalid IFSC code";
        }

        if (step === 4) {
            if (!formData.nomineeName.trim()) {
                newErrors.nomineeName = "Nominee Name is required";
            }
            if (!formData.nomineeRelationship) {
                newErrors.nomineeRelationship = "Nominee Relationship is required";
            }
            if (!formData.nomineeAge) {
                newErrors.nomineeAge = "Nominee Age is required";
            }
            if (!formData.nomineeAadhaar) {
                newErrors.nomineeAadhaar = "Nominee Aadhaar Number is required";
            } else if (!aadhaarRegex.test(formData.nomineeAadhaar)) {
                newErrors.nomineeAadhaar = "Nominee Aadhaar must be exactly 12 digits";
            }
        }

        if (step === 5) {
            const gstinValue = formData.gstin?.trim() || '';
            if (gstinValue) {
                if (gstinValue.length !== 15) {
                    newErrors.gstin = "GSTIN must be exactly 15 characters";
                } else if (gstExists) {
                    newErrors.gstin = "This GSTIN already exists. Please enter a different one.";
                }
            }
        }

        setFieldErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // const handleNext = () => {
    //     if (isStepValid()) {
    //         const newStep = step + 1;
    //         setStep(newStep);
    //         localStorage.setItem('sakhi_registration_step', newStep.toString());
    //         router.push(`/signup?step=${newStep}`);
    //     } else {
    //         window.scrollTo({ top: 0, behavior: 'smooth' });
    //     }
    // };

    // const prevStep = () => {
    //     const newStep = Math.max(1, step - 1);
    //     setStep(newStep);
    //     localStorage.setItem('sakhi_registration_step', newStep.toString());
    //     router.push(`/signup?step=${newStep}`);
    // };
    const handleNext = () => {
        if (isStepValid()) {
            const newStep = step + 1;
            setStep(newStep);
            localStorage.setItem('sakhi_registration_step', newStep.toString());
        } else {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const prevStep = () => {
        const newStep = Math.max(1, step - 1);
        setStep(newStep);
        localStorage.setItem('sakhi_registration_step', newStep.toString());
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStepValid()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                ...formData,
                initiator_user_id: user?.id,
            };

            const response = await serverCallFuction(
                'POST',
                'api/users/create',
                payload
            );

            if (response.status === true) {
                alert("Application submitted successfully! Please login again to complete your KYC and access dashboard.");
                localStorage.removeItem('sakhi_registration_draft');
                localStorage.removeItem('sakhi_registration_step');
                router.push('/signin');
            } else {
                setFieldErrors({ error: `Submission failed: ${response.message || 'Unknown error'}` });
            }
        } catch (error) {
            console.error("API Error:", error);
            setFieldErrors({ error: "There was a network error. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFieldChange = (field: string, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFieldErrors((prevErrors) => {
            const newErrors = { ...prevErrors };
            delete newErrors[field];
            return newErrors;
        });
    };

    const getMaxDOB = () => {
        const today = new Date();
        const year = today.getFullYear() - 21;
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const maxDate = getMaxDOB();

    return (
        <div className="max-w-3xl md:min-w-3xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-2 text-center text-gray-800 dark:text-white">SAKHI DISTRIBUTOR APPLICATION</h2>
            <p className="text-center text-sm text-gray-500">(Independent Representative Agreement)</p>

            {contact_data && (
                <div className='mb-6 bg-brand-200 px-3 py-1 rounded-xl flex justify-between text-xs font-medium'>
                    <Link href={`tel:${contact_data?.phone}`}>
                        <span>24X7 : +91 {contact_data?.phone}</span>
                    </Link>
                    <Link href={`mailto:${contact_data?.email_1}`}>
                        <span>{contact_data?.email_1}</span>
                    </Link>
                </div>
            )}

            {/* Progress Indicator */}
            <div className="flex justify-between mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-1/5 h-2 rounded-full mx-1 ${step >= i ? 'bg-brand-500' : 'bg-gray-200'}`} />
                ))}
            </div>

            {error && (
                <div className='mb-6 bg-error-500 px-3 py-1 rounded-xl flex justify-between'>
                    <span className='text-white'>{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* STEP 1: Sponsor & Referral Info */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">1. Sponsor & Referral Code</h3>

                        <div>
                            <div>
                                <Label>
                                    Sponsor Referral Code / ID
                                    {formData.referralCode && searchParams?.get("ref") === formData.referralCode ? " (Auto-filled)" : ""}
                                </Label>
                                <Input
                                    placeholder="Enter sponsor referral code or ID"
                                    value={formData.referralCode || ""}
                                    onChange={(e) => handleFieldChange('referralCode', e.target.value)}
                                    className={searchParams?.get("ref") === formData.referralCode ? "ring-2 ring-brand-200 bg-brand-50" : ""}
                                    error={!!fieldErrors.referralCode}
                                    hint={fieldErrors.referralCode}
                                />
                                {formData.referrerName && (
                                    <p className="text-xs text-brand-600 mt-1 font-medium">Sponsor: {formData.referrerName}</p>
                                )}
                                <p className="text-xs text-gray-400 mt-1">The new member will be attached directly to this sponsor.</p>
                            </div>
                        </div>

                        {!error && (
                            <Button onClick={handleNext} className="w-full mt-4" type="button">
                                Next: Applicant Details
                            </Button>
                        )}
                    </div>
                )}

                {/* STEP 2: APPLICANT DETAILS */}
                {step === 2 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">2. Applicant Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Label>Full Name* </Label>
                                <Input
                                    value={formData.fullName}
                                    placeholder="Legal Name"
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value === "" || /^[a-zA-Z\s]+$/.test(value)) {
                                            setFormData({ ...formData, fullName: value });
                                        }
                                    }}
                                    error={!!fieldErrors.fullName}
                                    hint={fieldErrors.fullName}
                                />
                            </div>

                            <div>
                                <Label>Aadhaar No* </Label>
                                <Input
                                    value={formData.aadhaarNo}
                                    placeholder="12-digit Number"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        if (val === "" || /^[0-9]/.test(val)) {
                                            handleFieldChange('aadhaarNo', val);
                                        }
                                    }}
                                    maxLength={12}
                                    inputMode="numeric"
                                    error={!!fieldErrors.aadhaarNo}
                                    hint={fieldErrors.aadhaarNo}
                                />
                            </div>

                            <div>
                                <Label>PAN No* </Label>
                                <Input
                                    value={formData.panNo}
                                    placeholder="Permanent Account Number"
                                    onChange={(e) => {
                                        let value = e.target.value.toUpperCase();
                                        if (value.length <= 5) {
                                            value = value.replace(/[^A-Z]/g, '');
                                        } else if (value.length <= 9) {
                                            const firstPart = value.slice(0, 5);
                                            const secondPart = value.slice(5).replace(/[^0-9]/g, '');
                                            value = firstPart + secondPart;
                                        } else if (value.length === 10) {
                                            const firstPart = value.slice(0, 5);
                                            const secondPart = value.slice(5, 9);
                                            const lastPart = value.slice(9).replace(/[^A-Z]/g, '');
                                            value = firstPart + secondPart + lastPart;
                                        }
                                        setFormData({ ...formData, panNo: value });
                                    }}
                                    error={!!fieldErrors.panNo}
                                    hint={fieldErrors.panNo}
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <Label>Date of Birth* </Label>
                                <Input
                                    type="date"
                                    value={formData.dob}
                                    max={maxDate}
                                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                                    error={!!fieldErrors.dob}
                                    hint={fieldErrors.dob}
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Minimum 21 years required</p>
                            </div>

                            <div>
                                <Label>Gender*</Label>
                                <select
                                    className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 text-sm"
                                    value={formData.gender}
                                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Female">Female</option>
                                    <option value="Male">Male</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div>
                                <Label>Phone* </Label>
                                <Input
                                    placeholder='Enter Phone no.'
                                    value={formData.phone || ""}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        if (val === "" || /^[6-9]/.test(val)) {
                                            handleFieldChange('phone', val);
                                        }
                                    }}
                                    inputMode="numeric"
                                    maxLength={10}
                                    error={!!fieldErrors.phone}
                                    hint={fieldErrors.phone}
                                />
                            </div>

                            <div>
                                <Label>Password* </Label>
                                <Input
                                    placeholder='Enter Password'
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>WhatsApp No* </Label>
                                <Input
                                    value={formData.whatsappNo || ""}
                                    placeholder="For updates"
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, "");
                                        if (val === "" || /^[6-9]/.test(val)) {
                                            handleFieldChange('whatsappNo', val);
                                        }
                                    }}
                                    error={!!fieldErrors.whatsappNo}
                                    hint={fieldErrors.whatsappNo}
                                    inputMode='numeric'
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <Label>Email* </Label>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    placeholder="example@mail.com"
                                    onChange={(e) => handleFieldChange('email', e.target.value)}
                                    error={!!fieldErrors.email}
                                    hint={fieldErrors.email}
                                    inputMode='email'
                                />
                            </div>

                            <div className="md:col-span-2">
                                <Label>Full Address* </Label>
                                <Input
                                    value={formData.address}
                                    placeholder="House No, Street, Landmark"
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-2 md:col-span-2">
                                <div>
                                    <Label>State* </Label>
                                    <select
                                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 text-sm"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        disabled={isLoadingStates}
                                    >
                                        <option value="">Select State</option>
                                        {isLoadingStates ? (
                                            <option disabled>Loading states...</option>
                                        ) : (
                                            states.map((state) => (
                                                <option key={state.id} value={state.id}>
                                                    {state.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                <div>
                                    <Label>City* </Label>
                                    <select
                                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 text-sm"
                                        value={formData.city}
                                        onChange={(e) => handleFieldChange('city', e.target.value)}
                                        disabled={isLoadingCities || !formData.state}
                                    >
                                        <option value="">Select City</option>
                                        {isLoadingCities ? (
                                            <option disabled>Loading cities...</option>
                                        ) : (
                                            cities.map((city) => (
                                                <option key={city.id} value={city.id}>
                                                    {city.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    {fieldErrors.city && (
                                        <p className="mt-1.5 text-xs text-error-500 font-medium">{fieldErrors.city}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>PIN* </Label>
                                    <Input
                                        placeholder='Enter PIN'
                                        value={formData.pin || ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            if (val === "" || /^[0-9]/.test(val)) {
                                                handleFieldChange('pin', val);
                                            }
                                        }}
                                        inputMode='numeric'
                                        maxLength={6}
                                        error={!!fieldErrors.pin}
                                        hint={fieldErrors.pin}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" onClick={prevStep} className="w-full" type="button">Back</Button>
                            {!error && (
                                <Button onClick={handleNext} className="w-full" type="button">
                                    Next: Bank Details
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: BANK DETAILS */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">3. Bank Account Details (KYC)</h3>
                        <p className="text-xs text-brand-600 mb-4 font-medium">Mandatory for Commission Payouts</p>

                        <Label>Account Holder Name* </Label>
                        <Input
                            value={formData.accountHolderName}
                            placeholder="Account Holder Name"
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || /^[a-zA-Z\s]+$/.test(value)) {
                                    setFormData({ ...formData, accountHolderName: value });
                                }
                            }}
                            error={!!fieldErrors.accountHolderName}
                            hint={fieldErrors.accountHolderName}
                        />

                        <Label>Account Number* </Label>
                        <Input
                            placeholder='Enter Account Number'
                            value={formData.accountNo || ""}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                if (val === "" || /^[0-9]/.test(val)) {
                                    handleFieldChange('accountNo', val);
                                }
                            }}
                            inputMode='numeric'
                            error={!!fieldErrors.accountNo}
                            hint={fieldErrors.accountNo}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>IFSC Code* </Label>
                                <Input
                                    placeholder='Enter IFSC code'
                                    value={formData.ifscCode}
                                    onChange={(e) => {
                                        let value = e.target.value.toUpperCase();
                                        if (value.length <= 4) {
                                            value = value.replace(/[^A-Z]/g, '');
                                        } else if (value.length === 5) {
                                            const firstPart = value.slice(0, 4);
                                            const fifthChar = value.charAt(4) === '0' ? '0' : '';
                                            value = firstPart + fifthChar;
                                        } else if (value.length <= 11) {
                                            const firstFive = value.slice(0, 5);
                                            const lastPart = value.slice(5).replace(/[^A-Z0-9]/g, '');
                                            value = firstFive + lastPart;
                                        }
                                        handleFieldChange('ifscCode', value);
                                    }}
                                    error={!!fieldErrors.ifscCode}
                                    hint={fieldErrors.ifscCode}
                                />
                            </div>

                            <div>
                                <Label>Bank Name* </Label>
                                <Input
                                    placeholder='Enter Bank Name'
                                    value={formData.bankName}
                                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                                />
                            </div>
                        </div>

                        <Label>Branch</Label>
                        <Input
                            placeholder='Enter Branch'
                            value={formData.branch}
                            onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                        />

                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" onClick={prevStep} className="w-1/2" type="button">Back</Button>
                            <Button onClick={handleNext} className="w-1/2" type="button">Next: Nominee Details</Button>
                        </div>
                    </div>
                )}

                {/* STEP 4: NOMINEE DETAILS */}
                {step === 4 && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                            <h4 className="text-sm font-bold mb-4 uppercase text-gray-600 dark:text-gray-400">Nominee Details</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Nominee Name*</Label>
                                    <Input
                                        value={formData.nomineeName}
                                        placeholder="Nominee Name"
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            if (value === "" || /^[a-zA-Z\s]+$/.test(value)) {
                                                setFormData({ ...formData, nomineeName: value });
                                            }
                                        }}
                                        error={!!fieldErrors.nomineeName}
                                        hint={fieldErrors.nomineeName}
                                    />
                                </div>

                                <div>
                                    <Label>Nominee Relationship*</Label>
                                    <select
                                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 text-sm"
                                        value={formData.nomineeRelationship}
                                        onChange={(e) => setFormData({ ...formData, nomineeRelationship: e.target.value })}
                                    >
                                        <option value="">Select Relationship</option>
                                        <option value="Brother">Brother</option>
                                        <option value="Sister">Sister</option>
                                        <option value="Son">Son</option>
                                        <option value="Daughter">Daughter</option>
                                        <option value="Father">Father</option>
                                        <option value="Mother">Mother</option>
                                        <option value="Spouse">Spouse</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {fieldErrors.nomineeRelationship && (
                                        <p className="mt-1 text-xs text-error-500">{fieldErrors.nomineeRelationship}</p>
                                    )}
                                </div>

                                <div>
                                    <Label>Nominee Age*</Label>
                                    <Input
                                        placeholder="Nominee Age"
                                        value={formData.nomineeAge || ""}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            if (val === "" || /^[0-9]/.test(val)) {
                                                handleFieldChange('nomineeAge', val);
                                            }
                                        }}
                                        inputMode='numeric'
                                        maxLength={2}
                                        error={!!fieldErrors.nomineeAge}
                                        hint={fieldErrors.nomineeAge}
                                    />
                                </div>

                                <div>
                                    <Label>Nominee Aadhaar*</Label>
                                    <Input
                                        placeholder="Nominee Aadhaar"
                                        value={formData.nomineeAadhaar}
                                        inputMode="numeric"
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, "");
                                            if (val === "" || /^[0-9]/.test(val)) {
                                                handleFieldChange('nomineeAadhaar', val);
                                            }
                                        }}
                                        maxLength={12}
                                        error={!!fieldErrors.nomineeAadhaar}
                                        hint={fieldErrors.nomineeAadhaar}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button variant="outline" onClick={prevStep} className="w-1/2" type="button">Back</Button>
                            <Button onClick={handleNext} className="w-1/2" type="button">Next: Business Level & Terms</Button>
                        </div>
                    </div>
                )}

                {/* STEP 5: BUSINESS LEVEL, GSTIN & AGREEMENT */}
                {step === 5 && (
                    <div className="space-y-4">
                        <h3 className="font-semibold text-lg border-b pb-2">5. Business Entry & Selection</h3>

                        <div>
                            <Label>GSTIN (Optional)</Label>
                            <Input
                                placeholder="Enter GSTIN"
                                value={formData.gstin || ""}
                                onChange={(e) => {
                                    let val = e.target.value.toUpperCase();
                                    let formatted = '';

                                    formatted += (val.slice(0, 2).replace(/\D/g, ''));

                                    if (val.length > 2) {
                                        formatted += (val.slice(2, 7).replace(/[^A-Z]/g, ''));
                                    }
                                    if (val.length > 7) {
                                        formatted += (val.slice(7, 11).replace(/\D/g, ''));
                                    }
                                    if (val.length > 11) {
                                        formatted += (val.slice(11, 12).replace(/[^A-Z]/g, ''));
                                    }
                                    if (val.length > 12) {
                                        formatted += (val.slice(12, 15).replace(/[^A-Z0-9]/g, ''));
                                    }

                                    setGstExists(false);
                                    setGstCheckResponse(null);
                                    setFieldErrors(prev => { const n = { ...prev }; delete n.gstin; return n; });
                                    setFormData({ ...formData, gstin: formatted });
                                }}
                                maxLength={15}
                                error={!!fieldErrors.gstin}
                                hint={fieldErrors.gstin || undefined}
                            />
                            {isCheckingGST && (
                                <p className="mt-1 text-xs text-gray-500 font-medium">Checking GSTIN availability...</p>
                            )}
                            {!isCheckingGST && gstCheckResponse?.status && !gstExists && (formData.gstin?.trim().length === 15) && (
                                <p className="mt-1 text-xs text-brand-600 font-medium">{gstCheckResponse.message}</p>
                            )}
                        </div>

                        <Label className="mt-4 block">Terms and Conditions (Scroll to bottom to enable submit)*</Label>
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded text-[12px] leading-relaxed border dark:border-gray-700 h-64 overflow-y-auto no-scrollbar border-gray-300"
                        >
                            <div className="space-y-4 text-gray-700 dark:text-gray-300">
                                {/* I. LEGAL STATUS & COMPLIANCE */}
                                <div>
                                    <p className="font-bold underline uppercase">I. Legal Status & Compliance</p>
                                    <p>1. <b>Independent Status:</b> I acknowledge that I am an Independent Representative (IR) of Feel Safe Pvt. Ltd. I am not an employee, agent, or legal representative of the company. I am solely responsible for filing my own income tax and statutory obligations.</p>
                                    <p>2. <b>Compliance with Consumer Protection Rules:</b> I acknowledge that Feel Safe Pvt. Ltd. strictly adheres to the "Consumer Protection (Direct Selling) Rules, 2021" issued by the Government of India. I commit to conducting my business in full compliance with these regulations.</p>
                                    <p>3. <b>No Investment Policy:</b> I confirm that there is no joining fee to partner with the company. Any payment made by me is strictly for the purchase of products under the brand name FEEL & SAFE.</p>
                                    <p>4. <b>Statutory Obligations:</b> I agree to fulfill all statutory requirements, including ethical marketing and tax compliance. Any breach of government guidelines will result in immediate termination.</p>
                                </div>

                                {/* II. BUSINESS CONDUCT & MARKETING */}
                                <div>
                                    <p className="font-bold underline uppercase">II. Business Conduct & Marketing</p>
                                    <p>5. <b>Prohibition of Misrepresentation:</b> I shall not make any false or exaggerated claims regarding product benefits, ingredients, or lab reports. I will use only company-authorized materials.</p>
                                    <p>6. <b>Non-Compete Clause:</b> While serving as a distributor, I shall not engage in the promotion, sale, or marketing of any competing sanitary napkin brands.</p>
                                    <p>7. <b>Marketing Discipline:</b> Selling products on e-commerce platforms (Amazon, Flipkart, etc.) without prior written consent is strictly prohibited.</p>
                                    <p>8. <b>Earnings Disclaimer:</b> Income is based solely on actual sales performance. The company makes no guarantees of "get-rich-quick" schemes or passive income.</p>
                                    <p>9. <b>Anti-Pyramid Rule:</b> I shall not lure any individual with the promise of money for recruitment. My primary role is health awareness and product distribution.</p>
                                </div>

                                {/* III. PAYOUTS, RETURNS & INVENTORY */}
                                <div>
                                    <p className="font-bold underline uppercase">III. Payouts, Returns & Inventory</p>
                                    <p>10. <b>Commission Disbursement:</b> I acknowledge a 30-day Cooling-off Period for all purchases. Commissions will be processed in the first week (1st Week) of the following month, only after the 30-day window is complete.</p>
                                    <p>11. <b>Refund Adjustments:</b> No commission shall be payable on orders that are returned, cancelled, or refunded within the 30-day cooling-off period.</p>
                                    <p>12. <b>Buy-Back Policy:</b> If I terminate within 30 days, the company will buy back unsold stock in marketable condition. Post-30 days, refunds are subject to stock condition and expiry audits.</p>
                                    <p>13. <b>Inventory Loading Prohibition:</b> I am advised to purchase only the amount of stock I can reasonably sell or consume within 30 days.</p>
                                </div>

                                {/* IV. OPERATIONAL PROTOCOLS */}
                                <div>
                                    <p className="font-bold underline uppercase">IV. Operational Protocols (Field Work & Hygiene)</p>
                                    <p>14. <b>Awareness & Distribution:</b> My primary role is to raise health awareness among women and conduct door-to-door sales.</p>
                                    <p>15. <b>Identification & Credentials:</b> It is mandatory to carry and display my Official ID Card and Authorization Letter during every field visit.</p>
                                    <p>16. <b>Standardized Demonstration:</b> I shall use only the Authorized Demo Kit provided by the company.</p>
                                    <p>17. <b>Hygiene Standards:</b> To maintain product hygiene, I agree to wear Hand Gloves while handling or delivering products to customers.</p>
                                    <p>18. <b>Product Integrity & Storage:</b> I agree to store products in a clean, dry, and hygienic environment and will not tamper with packaging or MRP.</p>
                                </div>

                                {/* V. SAFETY, ETHICS & LIABILITY */}
                                <div>
                                    <p className="font-bold underline uppercase">V. Safety, Ethics & Liability</p>
                                    <p>19. <b>Safety & Conduct:</b> I shall prioritize ethical conduct and respect the privacy of customers. No harassment or unprofessional behavior will be tolerated.</p>
                                    <p>20. <b>Personal Safety & Vigilance:</b> My personal safety is my primary responsibility. I will operate in safe, well-populated areas and avoid isolated locations or late hours.</p>
                                    <p>21. <b>Risk Mitigation:</b> I am advised to keep family or team leaders informed of my real-time location during field work.</p>
                                    <p>22. <b>Non-Compulsion:</b> The company does not mandate working in conditions that compromise my safety. I am authorized to stop work and report any threats to authorities and the company.</p>
                                    <p>23. <b>Indemnity:</b> I hold myself personally liable for any legal consequences or losses incurred by the company due to my misconduct.</p>
                                    <p>24. <b>Field Safety & Medical Liability:</b> I acknowledge that my field activities are voluntary and performed at my own risk. In the event of any accident, injury, or health-related emergency during field work, the company shall not be legally or financially liable for any medical expenses, compensation, or treatment.</p>
                                    <p>25. <b>Third-Party Liability:</b> If a distributor misbehaves, engages in a dispute, or damages any third-party property during field work, the distributor shall be solely liable.</p>
                                    <p>26. <b>No Employer-Employee Relationship:</b> The relationship is strictly on a Principal-to-Principal basis. The distributor is not entitled to any employee benefits like PF, ESI, or bonuses.</p>
                                </div>

                                {/* VI. ADMINISTRATIVE RIGHTS */}
                                <div>
                                    <p className="font-bold underline uppercase">VI. Administrative Rights</p>
                                    <p>27. <b>Modification Rights:</b> The company reserves the right to change the business plan, prices, or commission structure at any time via official communication.</p>
                                    <p>28. <b>Digital Consent:</b> I consent to receive business updates and payout alerts via WhatsApp, SMS, and Email.</p>
                                    <p>29. <b>Zero Tolerance for Poaching:</b> Enticing or recruiting Feel Safe Pvt. Ltd. distributors into other businesses will lead to immediate legal action.</p>
                                    <p>30. <b>Force Majeure & Liability:</b> The company is not liable for delays caused by natural disasters or government restrictions.</p>
                                    <p>31. <b>Survival Clause:</b> Confidentiality and non-compete obligations survive even after the termination of this agreement.</p>
                                    <p>32. <b>Referral Integrity:</b> I confirm that I am joining under the aforementioned Referrer. I understand that the Referral Code cannot be changed once the application is processed.</p>
                                    <p>33. <b>Violation of Rules & Suspension:</b> The company reserves the right to suspend or terminate the distributorship of any individual found violating the company's rules.</p>
                                    <p>34. <b>Jurisdiction:</b> I agree that in case of any legal dispute or disagreement, the matter shall be subject to the exclusive jurisdiction of the courts in New Delhi only.</p>
                                </div>

                                {/* VII. BUSINESS ENTRY & STOCK */}
                                <div>
                                    <p className="font-bold underline uppercase">VII. Business Entry & Stock</p>
                                    <p>35. <b>Business Level Selection:</b> I acknowledge that I have been informed about the different operational levels of the company.</p>
                                    <p>36. <b>Level 1:</b> Basic Sakhi (Initial start – Minimum order ₹2,000).</p>
                                    <p>37. <b>Level 2:</b> Professional Sakhi (Small business stock – ₹25,000).</p>
                                    <p>38. <b>Level 3:</b> Master Sakhi / Distributor (Large-scale/Stockist – ₹1,00,000).</p>
                                    <p>39. <b>Voluntary Choice:</b> I confirm that the selection of the above level is entirely my own decision.</p>
                                    <p>40. <b>Upgradation:</b> I understand that I have the right to upgrade my level in the future based on my performance and financial capacity.</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 py-2">
                            <Checkbox
                                checked={formData.agreedToTerms}
                                onChange={(val) => setFormData({ ...formData, agreedToTerms: val })}
                            />
                            <p className="text-xs text-gray-700 dark:text-gray-300">
                                I certify that I have chosen my business level based on my own financial capacity and have read and understood all 40 clauses mentioned above.
                            </p>
                        </div>

                        <div className="flex gap-4 pt-2">
                            <Button variant="outline" onClick={prevStep} className="w-1/2" type="button">Back</Button>
                            <Button
                                type="submit"
                                disabled={isSubmitting || !formData.agreedToTerms || !hasScrolledToBottom}
                                className="w-1/2 transition-all bg-brand-500 hover:bg-brand-600 opacity-100"
                            >
                                {isSubmitting ? 'Submitting...' : (!hasScrolledToBottom ? 'Scroll to Read' : 'Submit')}
                            </Button>
                        </div>
                    </div>
                )}

                {fieldErrors.error && (
                    <div className="p-3 mt-4 text-sm text-error-500 bg-error-50 border border-error-200 rounded-md dark:bg-error-900/20 dark:border-error-800">
                        {fieldErrors?.error}
                    </div>
                )}
            </form>
        </div>
    );
}