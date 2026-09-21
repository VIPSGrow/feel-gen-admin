'use client';

import { useEffect, useState } from 'react';
import { hasPermission } from '@/lib/auth';
import { useSupportTickets } from '@/hooks/useSupportTickets';
import { TicketTable } from '@/components/support/TicketTable';

import Button from '@/components/ui/button/Button';
import { TicketStatus, type Ticket } from '@/types/ticket';
import ComponentCard from '@/components/common/ComponentCard';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import Badge from '@/components/ui/badge/Badge';
import { useAuth } from '@/context/AuthContext';
import { TicketDetail } from '@/components/support/TicketDetail';
import { Modal } from '@/components/ui/modal';

export default function SupportPage() {
    const { getAdminTickets, loading, updateTicketStatus, getTicket, replyToTicket } = useSupportTickets();
    const [tickets, setTickets] = useState([]);
    const [pagination, setPagination] = useState<{ page: number; limit: number; total: number; totalPages: number } | undefined>(undefined);
    const [filterStatus, setFilterStatus] = useState<TicketStatus | ''>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [ticketDetail, setTicketDetail] = useState(null);
    const { user } = useAuth();

    const loadTickets = async () => {
        const params = {
            page: currentPage,
            limit: 10,
            ...(filterStatus && { status: filterStatus }),
        };

        const res = await getAdminTickets(params);
        if (!res) return;

        if (res.success) {
            const data = res.tickets;
            const list = Array.isArray(data) ? data : (data as any)?.tickets ?? [];
            setTickets(list);

            const pag = res?.pagination;
            setPagination(pag);
        }
    };

    useEffect(() => {
        const run = async () => {
            await loadTickets();
        };
        run();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, filterStatus]);

    const handleStatusChange = async (id: number, status: TicketStatus) => {
        const res = await updateTicketStatus(id, { status });
        if ((res as any)?.success) {
            await loadTickets();
        }
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    if (!hasPermission(user?.role || '', 'support-tickets')) {
        return <div className="p-8 text-center">Access denied</div>;
    }

    return (
        <div>
            {/* <PageBreadcrumb title="Support Tickets" items={[
                { title: "Dashboard", href: "/dashboard" },
                { title: "Support" }
            ]} /> */}

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">

                {/* <div className="space-y-6">
                    <ComponentCard title="Quick Stats">
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span>Total</span>
                                <Badge>{pagination?.total ?? 'N/A'}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span>In Progress</span>
                                <Badge variant="light">5</Badge>
                            </div>
                        </div>
                    </ComponentCard>
                </div> */}


                <ComponentCard title={`Tickets List : ${pagination?.total ?? 'N/A'}`} className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        {/* <Select value={filterStatus} onValueChange={setFilterStatus as any}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Status</SelectItem>
                                <SelectItem value="OPEN">Open</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="RESOLVED">Resolved</SelectItem>
                                <SelectItem value="CLOSED">Closed</SelectItem>
                            </SelectContent>
                        </Select> */}
                        <Button onClick={loadTickets} disabled={loading}>
                            Refresh
                        </Button>
                    </div>
                    <TicketTable
                        tickets={tickets}
                        pagination={pagination}
                        isAdmin
                        loading={loading}
                        onStatusChange={handleStatusChange}
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

                {/* Stats cards */}

            </div>

            {/* {selectedTicket && (
                <div className="mt-8">                    
                    <p>Viewing {selectedTicket}</p>
                </div>
            )} */}
        </div>
    );
}

