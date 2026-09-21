'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card/Card';
import Button from '@/components/ui/button/Button';
import Badge from '@/components/ui/badge/Badge';
import TextArea from '@/components/form/input/TextArea';
import { Reply } from '@/types/ticket';
import { date_formate } from '@/lib/constantFunction';
import Image from 'next/image';


interface TicketDetailProps {
    ticket: {
        case_id: string;
        subject: string;
        name: string;
        email: string;
        phone: string;
        message: string;
        status: string;
        created_at: string;
        replies: Reply[];
    };
    onClose: () => void;
    onReply: (payload: FormData) => Promise<void>;
    loading?: boolean;
}


export function TicketDetail({ ticket, onClose, onReply, loading }: TicketDetailProps) {
    const [replyText, setReplyText] = useState('');
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

    const handleReply = async () => {
        if (!replyText.trim()) return;
        const formData = new FormData();
        formData.append('message', replyText);
        if (attachmentFile) {
            formData.append('attachment', attachmentFile);
        }
        await onReply(formData);
        setReplyText('');
        setAttachmentFile(null);
    };

    return (
        <Card className=" mx-auto">
            <CardHeader className="flex flex-row items-center justify-between">
                {/* <CardTitle className="text-2xl font-bold">#{ticket.case_id} - {ticket.subject}</CardTitle> */}
                <div className="flex gap-2">

                    <Badge variant="solid" color='primary'>{ticket.status}</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Customer Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-muted rounded-lg">
                    <div>
                        <strong>Name:</strong> {ticket.name}
                    </div>
                    <div>
                        <strong>Email:</strong> {ticket.email}
                    </div>
                    <div>
                        <strong>Phone:</strong> {ticket.phone}
                    </div>
                    <div>
                        <strong>Created:</strong> {date_formate(ticket.created_at)}
                    </div>
                </div>

                {/* Initial Message */}
                <div className="border-l-4 border-blue-500 pl-4">
                    <p className="text-lg mb-2">{ticket.message}</p>
                    <small className="text-muted-foreground">Opened by customer on {date_formate(ticket.created_at)}</small>
                </div>

                {/* Replies */}
                <div>
                    <h3 className="font-semibold mb-4">Conversation ({ticket?.replies?.length ?? 0} replies)</h3>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                        {ticket?.replies?.map((reply) => (
                            <div key={reply.id} className={`p-4 rounded-lg ${reply.is_admin ? 'bg-blue-50 border-l-4 border-blue-500 ml-auto max-w-lg' : 'bg-gray-50 border-l-4 border-gray-500'}`}>
                                {reply.attachment &&
                                    <Image src={reply.attachment} width={100} height={100} alt='image attachment' />
                                }
                                <p>{reply.message}</p>
                                <small className="text-muted-foreground block mt-2">
                                    {reply.is_admin ? 'Admin' : 'Customer'} • {date_formate(reply.created_at)}
                                </small>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reply Form */}
                {ticket.status !== "CLOSED" &&
                    <div className="border-t pt-6">
                        <TextArea
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e)}
                            rows={4}
                        />
                        <div className="mt-4 space-y-3">
                            <div className="flex items-center gap-3">
                                <label className="block w-full">
                                    <span className="text-sm font-medium text-muted-foreground">Attachment (optional)</span>
                                    <input
                                        type="file"
                                        className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                                        onChange={(e) => {
                                            const f = e.target.files?.[0] ?? null;
                                            setAttachmentFile(f);
                                        }}
                                    />
                                </label>
                                {attachmentFile && (
                                    <Badge color="primary" className="whitespace-nowrap">
                                        {attachmentFile.name}
                                    </Badge>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleReply} disabled={loading || !replyText.trim()} className="flex-1">
                                    {loading ? 'Sending...' : 'Send Reply'}
                                </Button>
                            </div>
                        </div>
                    </div>
                }
            </CardContent>
        </Card>
    );
}

