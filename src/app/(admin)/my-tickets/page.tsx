'use client';

import { useEffect, useState } from 'react';
import { hasPermission } from '@/lib/auth';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { TicketTable } from '@/components/support/TicketTable';
import { TicketDetail } from '@/components/support/TicketDetail';
import { TicketForm } from '@/components/support/TicketForm';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import ComponentCard from '@/components/common/ComponentCard';
import Button from '@/components/ui/button/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/Card';
import { useAuth } from '@/context/AuthContext';
import { Modal } from '@/components/ui/modal';




export default function MyTicketsPage() {
    const { getMyTickets, raiseTicket, loading, getTicket, replyToTicket } = useSupportTickets();
    const [tickets, setTickets] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [ticketDetail, setTicketDetail] = useState(null);

    const { user } = useAuth();

    const loadTickets = async () => {
        const res = await getMyTickets();
        if (res.success) {
            setTickets(res.tickets);
        }
    };

    useEffect(() => {
        loadTickets();
    }, []);

    const handleRaiseTicket = async (data) => {

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('email', data.email);
        formData.append('phone', data.phone);
        formData.append('subject', data.subject);
        formData.append('message', data.message);
        formData.append('user_id', String(data.user_id));
        formData.append('user_type', "DISTRIBUTOR");
        if (data.attachment) {
            formData.append('attachment', data.attachment);
        }


        await raiseTicket(formData);
        loadTickets();
        setShowForm(false);
    };

    if (!hasPermission(user?.role || '', 'my-tickets')) {
        return <div className="p-8 text-center">Access denied</div>;
    }

    return (
        <div>
            <PageBreadcrumb pageTitle="My Support Tickets" items={[
                { title: "Dashboard", href: "/dashboard" },
                { title: "My Tickets" }
            ]} />

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <ComponentCard title="My Tickets" className="lg:col-span-2">
                    <div className="mb-6">
                        <Button onClick={() => setShowForm(!showForm)}>
                            {showForm ? 'Hide Form' : 'Raise New Ticket'}
                        </Button>
                    </div>

                    {showForm && (
                        <TicketForm onSubmit={handleRaiseTicket} loading={loading} />
                    )}

                    <TicketTable
                        tickets={tickets}
                        loading={loading}
                        onView={async (caseId) => {
                            const res = await getTicket(caseId);
                            if (res.success) {
                                setTicketDetail({ ...res.ticket, replies: res.replies });
                            }
                        }}
                    />
                    {ticketDetail && (
                        <Modal isOpen={ticketDetail} className="mt-8 max-w-5xl" onClose={() => {
                            setTicketDetail(null)
                        }} >
                            <div className="p-6">
                                <h2 className="text-lg font-bold mb-6">
                                    #{ticketDetail?.case_id || 'N/A'} - {ticketDetail?.subject || 'N/A'}
                                </h2>
                                <div className="space-y-4">
                                    <TicketDetail
                                        ticket={ticketDetail}
                                        onClose={() => setTicketDetail(null)}
                                        onReply={async (formData) => {
                                            // Get caseId from ticketDetail.case_id
                                            await replyToTicket(ticketDetail.case_id, formData);
                                            // Reload detail
                                            const res = await getTicket(ticketDetail.case_id);
                                            setTicketDetail(res.ticket);
                                        }}
                                    />
                                </div>
                            </div>
                        </Modal>
                    )}
                </ComponentCard>


            </div>
        </div>
    );
}

