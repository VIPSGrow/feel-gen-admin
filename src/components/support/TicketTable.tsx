'use client';

import { Ticket, TicketStatus } from '@/types/ticket';


import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';


import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card/Card';
import Select from '../form/Select';

import Button from '../ui/button/Button';
import Pagination from '../tables/Pagination';
import { date_formate } from '@/lib/constantFunction';
import Badge from '../ui/badge/Badge';


interface TicketTableProps {
    tickets: Ticket[];
    pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
    isAdmin?: boolean;
    onView: (caseId: string) => void;
    onStatusChange?: (id: number, status: TicketStatus) => void;
    loading?: boolean;
}

export function TicketTable({
    tickets = [],
    pagination,
    isAdmin = false,
    onView,
    onStatusChange,
    loading
}: TicketTableProps) {
    const [localStatus, setLocalStatus] = useState<Record<number, TicketStatus>>({});

    const statusConfig = {
        OPEN: { label: 'Open', variant: 'primary' as const },
        IN_PROGRESS: { label: 'In Progress', variant: 'secondary' as const },
        RESOLVED: { label: 'Resolved', variant: 'success' as const },
        CLOSED: { label: 'Closed', variant: 'error' as const },
    } as const;

    const handleStatusChange = (id: number, status: TicketStatus) => {
        setLocalStatus(prev => ({ ...prev, [id]: status }));
        onStatusChange?.(id, status);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Support Tickets</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg overflow-auto border">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                            <TableRow>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Case ID</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Subject</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Customer</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Status</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-right">Created</TableCell>
                                <TableCell isHeader className="px-6 py-4 font-semibold text-gray-100 dark:text-white text-left">Actions</TableCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                                        Loading...
                                    </TableCell>
                                </TableRow>
                            ) : tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={isAdmin ? 6 : 5} className="h-24 text-center">
                                        No tickets found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map((ticket) => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            <span className="font-mono text-sm">{ticket.case_id}</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{ticket.subject}</TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{ticket.name}</TableCell>

                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                                            {isAdmin ? (
                                                <>
                                                    {/* {ticket.status || 'N/A'} */}
                                                    <Select
                                                        options={(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as TicketStatus[]).map((status) => {
                                                            return { value: status, label: status }
                                                        })}
                                                        defaultValue={localStatus[ticket.id] || ticket.status} onValueChange={(value) => handleStatusChange(ticket.id, value as TicketStatus)}
                                                        onChange={(value) => onStatusChange(ticket.id, value)}
                                                    >

                                                    </Select>
                                                </>
                                            ) : (
                                                <>
                                                    <Badge variant='solid' color={statusConfig[ticket.status as TicketStatus]?.variant || 'default'}>
                                                        {ticket.status || 'N/A'}
                                                    </Badge>
                                                </>
                                            )}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-right">
                                            {date_formate(ticket.created_at)}
                                        </TableCell>
                                        {(
                                            <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300 text-right">
                                                <Button variant="outline" size="sm" onClick={() => onView(ticket.case_id)}>
                                                    View
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                    {pagination && (
                        <div className="p-4">
                            <Pagination
                                page={pagination.page}
                                totalPages={pagination.totalPages}
                                onPageChange={(page) => console.log('Page change', page)} // Connect to parent
                            />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

