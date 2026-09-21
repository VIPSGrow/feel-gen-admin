'use client';

import { useState } from 'react';

import { RaiseTicketPayload } from '@/types/ticket';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card/Card';
import Label from '../form/Label';
import Input from '../form/input/InputField';
import TextArea from '../form/input/TextArea';
import Button from '../ui/button/Button';
import { useAuth } from '@/context/AuthContext';

interface TicketFormProps {
    onSubmit: (data: RaiseTicketPayload) => Promise<void>;
    loading?: boolean;
}

export function TicketForm({ onSubmit, loading = false }: TicketFormProps) {
    const { user } = useAuth()
    const [formData, setFormData] = useState({
        name: user?.full_name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        attachment: undefined as File | undefined,
        subject: '',
        message: '',
        user_id: user?.id ? Number(user.id) : undefined,
        user_type: 'DISTRIBUTOR' as const,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            setFormData({
                name: user?.full_name || '',
                email: user?.email || '',
                phone: user?.phone || '',
                attachment: undefined,
                subject: '',
                message: '',
                user_id: user?.id ? Number(user.id) : undefined,
                user_type: 'DISTRIBUTOR' as const,
            });
        } catch (err) {
            console.error('Submit error', err);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Raise New Ticket</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                defaultValue={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="subject">Subject</Label>
                            <Input
                                id="subject"
                                value={formData.subject}
                                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="message">Message</Label>
                        <TextArea
                            rows={5}
                            value={formData.message}
                            onChange={(value) => setFormData({ ...formData, message: value })}
                        />
                    </div>
                    <div>
                        <Label htmlFor="attachment">Attachment</Label>
                        <Input
                            type="file"
                            id="attachment"
                            onChange={(e) => setFormData({ ...formData, attachment: e.target.files?.[0] })}
                        />

                    </div>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? 'Submitting...' : 'Raise Ticket'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
